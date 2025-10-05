const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const Booking = require('../models/Booking');

// In-memory store for OTPs (in production, use a database like Redis)
const otpStore = new Map();

// Development mode email logger
const sendDevEmail = (mailOptions) => {
  console.log('\n===== EMAIL LOG =====');
  console.log('To:', mailOptions.to);
  console.log('Subject:', mailOptions.subject);
  console.log('OTP:', mailOptions.html.match(/<h1[^>]*>([^<]+)<\/h1>/)[1].trim());
  console.log('===================+\n');
  
  return Promise.resolve({
    messageId: 'dev-' + Date.now(),
    envelope: {
      from: mailOptions.from,
      to: [mailOptions.to]
    }
  });
};

// Create a transporter if SMTP env vars are configured
let transporter = null;
try {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_SECURE } = process.env;
  if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT ? Number(EMAIL_PORT) : 587,
      secure: EMAIL_SECURE === 'true',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }
} catch (e) {
  console.warn('Failed to initialize email transporter:', e.message);
}

// @route   POST /api/otp/send
// @desc    Send OTP to email
// @access  Public
router.post('/send', async (req, res) => {
  try {
    const { email, eventDetails } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Remove existing OTP for the email
    otpStore.delete(email);

    // Store OTP with expiration (5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      eventDetails: eventDetails || {}
    });

    // Prepare email content
    const mailOptions = {
      from: `"Event Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Event Booking',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your OTP for Event Booking</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="font-size: 2.5em; letter-spacing: 5px; color: #4CAF50;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          ${eventDetails ? `
            <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
              <h3>Booking Details:</h3>
              <p><strong>Event:</strong> ${eventDetails.eventName || 'N/A'}</p>
              <p><strong>Date:</strong> ${eventDetails.eventDate || 'N/A'}</p>
              <p><strong>Guests:</strong> ${eventDetails.guests || '1'}</p>
              ${eventDetails.additionalNotes ? `<p><strong>Notes:</strong> ${eventDetails.additionalNotes}</p>` : ''}
            </div>
          ` : ''}
          <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
            If you didn't request this OTP, please ignore this email.
          </p>
        </div>
      `,
    };

    // Send real email if transporter is configured; otherwise log to console
    if (transporter) {
      try {
        const info = await transporter.sendMail(mailOptions);
        return res.status(200).json({ 
          message: 'OTP sent successfully',
          messageId: info.messageId,
        });
      } catch (sendErr) {
        console.error('SMTP send error:', sendErr);
        // Graceful fallback in development: log OTP instead of failing
        if (process.env.NODE_ENV !== 'production') {
          await sendDevEmail(mailOptions);
          return res.status(200).json({ 
            message: 'SMTP failed, OTP logged to console (development fallback)',
            otp: mailOptions.html.match(/<h1[^>]*>([^<]+)<\/h1>/)[1].trim(),
            error: sendErr.message,
          });
        }
        // In production, surface the error
        throw sendErr;
      }
    }

    // Fallback: log the OTP to console in dev mode
    await sendDevEmail(mailOptions);
    return res.status(200).json({ 
      message: 'OTP logged to console (no SMTP configured)',
      otp: mailOptions.html.match(/<h1[^>]*>([^<]+)<\/h1>/)[1].trim(),
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // More detailed error response
    const errorResponse = {
      error: 'Failed to send OTP',
      details: {
        message: error.message,
        code: error.code,
        syscall: error.syscall,
        address: error.address,
        port: error.port
      },
      timestamp: new Date().toISOString()
    };
    
    console.error('Detailed error:', JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
});

// @route   GET /api/otp/debug
// @desc    Debug SMTP configuration and connectivity
// @access  Public (only for local dev; remove in production)
router.get('/debug', async (req, res) => {
  try {
    const cfg = {
      host: process.env.EMAIL_HOST || null,
      port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : null,
      user: process.env.EMAIL_USER ? '[set]' : '[missing]',
      pass: process.env.EMAIL_PASS ? '[set]' : '[missing]',
      secure: process.env.EMAIL_SECURE || 'false',
    };

    if (!transporter) {
      return res.status(200).json({
        transporter: 'not_configured',
        config: cfg,
        verify: 'skipped (no transporter)'
      });
    }

    // Verify SMTP connectivity
    let verifyResult = 'ok';
    try {
      await transporter.verify();
    } catch (e) {
      verifyResult = {
        error: e.message,
        code: e.code,
        response: e.response,
        responseCode: e.responseCode,
      };
    }

    return res.status(200).json({
      transporter: 'configured',
      config: cfg,
      verify: verifyResult,
    });
  } catch (err) {
    console.error('OTP debug error:', err);
    return res.status(500).json({ error: 'Debug endpoint failed', message: err.message });
  }
});

// @route   POST /api/otp/verify
// @desc    Verify OTP
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email);
    
    // Check if OTP exists and is not expired
    if (!storedData || storedData.otp !== otp || storedData.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // OTP is valid; create a pending booking and then remove OTP
    const details = storedData.eventDetails || {};
    const amount = details.amount ? Number(details.amount) : 250000; // default INR 2500.00 in paise
    const guests = details.guests ? Number(details.guests) : 1;
    const eventId = details.eventId || null;

    let booking = new Booking({
      email,
      eventId,
      guests,
      amount,
      currency: 'INR',
      status: 'pending_payment',
      provider: 'razorpay'
    });
    await booking.save();

    // Remove OTP after booking creation
    otpStore.delete(email);

    res.status(200).json({ 
      message: 'OTP verified successfully',
      booking: {
        id: booking._id,
        amount: booking.amount,
        currency: booking.currency,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

module.exports = router;
