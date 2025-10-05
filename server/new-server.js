require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store for OTPs
const otpStore = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'smtp.gmail.com',
  port: process.env.MAILTRAP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER || process.env.EMAIL_USER,
    pass: process.env.MAILTRAP_PASS || process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // For development only
  },
  debug: true,
  logger: true
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running', time: new Date().toISOString() });
});

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Store OTP with expiration (5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Send email with OTP
    const mailOptions = {
      from: `"Event Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔑 Your OTP for Event Booking',
      text: `Your OTP is: ${otp}\nThis OTP is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: #4a90e2; padding: 20px; color: white; text-align: center;">
            <h1 style="margin: 0;">Event Booking Verification</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello,</p>
            <p>Your One Time Password (OTP) for event booking is:</p>
            <div style="background: #f8f9fa; padding: 25px; text-align: center; margin: 20px 0; border-radius: 5px; border: 1px solid #e0e0e0;">
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #2c3e50; margin: 10px 0;">
                ${otp.match(/[0-9]{1}/g).join(' ')}
              </div>
            </div>
            <p style="color: #7f8c8d; font-size: 14px;">
              <strong>Note:</strong> This OTP is valid for 5 minutes. Please do not share it with anyone.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);  
  console.log('🔍 Debug info:');
  console.log(`- Email User: ${process.env.EMAIL_USER}`);
  console.log(`- Mailtrap User: ${process.env.MAILTRAP_USER || 'Not configured'}`);
});
