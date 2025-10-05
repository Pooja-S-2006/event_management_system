const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

const router = express.Router();

// Ensure keys are present
function getClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys missing: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  }
  return new Razorpay({ key_id, key_secret });
}

// Create an order for a booking
router.post('/create-order', async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending_payment') return res.status(400).json({ error: 'Booking not payable' });

    const client = getClient();

    const order = await client.orders.create({
      amount: booking.amount, // amount in paise
      currency: booking.currency || 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: String(booking._id),
        email: booking.email,
      },
    });

    booking.providerOrderId = order.id;
    await booking.save();

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: String(booking._id),
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('create-order error:', err);
    return res.status(500).json({ error: 'Failed to create order', message: err.message });
  }
});

// Create a Payment Link (useful for showing a QR to the user)
router.post('/create-payment-link', async (req, res) => {
  try {
    const { bookingId, customer, address } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending_payment') return res.status(400).json({ error: 'Booking not payable' });

    const client = getClient();

    const payload = {
      amount: booking.amount,
      currency: booking.currency || 'INR',
      accept_partial: false,
      description: `Payment for booking ${booking._id}`,
      notes: {
        bookingId: String(booking._id),
        email: booking.email,
        address_line1: address?.line1,
        address_line2: address?.line2,
        address_city: address?.city,
        address_state: address?.state,
        address_postalCode: address?.postalCode,
        address_country: address?.country || 'IN'
      },
      customer: {
        name: customer?.name,
        email: customer?.email || booking.email,
        contact: customer?.phone,
      },
      notify: { sms: true, email: true },
      reminder_enable: true,
      callback_url: process.env.APP_URL ? `${process.env.APP_URL}/booking-success` : undefined,
      callback_method: 'get'
    };

    const plink = await client.paymentLink.create(payload);

    // Save provider id for reference
    booking.providerPaymentId = plink.id;
    await booking.save();

    return res.status(200).json({
      id: plink.id,
      short_url: plink.short_url,
      amount: plink.amount,
      currency: plink.currency,
      bookingId: String(booking._id)
    });
  } catch (err) {
    console.error('create-payment-link error:', err);
    return res.status(500).json({ error: 'Failed to create payment link', message: err.message });
  }
});

// Razorpay webhook - must use raw body for signature verification
async function webhookHandler(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) return res.status(500).send('WEBHOOK_SECRET not configured');

    const body = req.body; // Buffer
    const payload = body.toString('utf8');

    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (expected !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(payload);

    if (event.event === 'payment.captured' || event.event === 'order.paid' || event.event === 'payment_link.paid') {
      const orderId = (event.payload?.payment?.entity?.order_id) || (event.payload?.order?.entity?.id);
      const paymentId = event.payload?.payment?.entity?.id;
      const bookingIdFromNotes = event.payload?.payment?.entity?.notes?.bookingId;

      let booking = null;
      if (orderId) {
        booking = await Booking.findOne({ providerOrderId: orderId });
      }
      if (!booking && bookingIdFromNotes) {
        booking = await Booking.findById(bookingIdFromNotes);
      }
      if (booking) {
        booking.status = 'paid';
        booking.providerPaymentId = paymentId || booking.providerPaymentId;
        await booking.save();
      }
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('webhook error:', err);
    return res.status(500).send('error');
  }
}

module.exports = { router, webhookHandler };
