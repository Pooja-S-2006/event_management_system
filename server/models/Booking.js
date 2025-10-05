const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    eventId: { type: String },
    guests: { type: Number, default: 1 },
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'failed', 'cancelled'],
      default: 'pending_payment',
    },
    provider: { type: String, default: 'razorpay' },
    providerOrderId: { type: String },
    providerPaymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
