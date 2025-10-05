const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const dotenv = require('dotenv');

// Load environment variables from the server's .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logStream.write(logMessage);
  console.log(`[${timestamp}] ${message}`);
}

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.stack}`);
  process.exit(1);
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  log(`${req.method} ${req.url}`);
  next();
});

// In-memory stores
const otpStore = new Map();
const pendingBookings = new Map();

// Test endpoint
app.get('/', (req, res) => {
  try {
    log('Test endpoint hit');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      status: 'Server is running', 
      time: new Date().toISOString() 
    });
  } catch (error) {
    log(`Error in test endpoint: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send OTP for event booking
app.post('/api/booking/send-otp', async (req, res) => {
  try {
    const { email, eventDetails } = req.body;
    log(`Received OTP request for email: ${email}`);
    
    if (!email) {
      log('Error: Email is required');
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      log(`Error: Invalid email format: ${email}`);
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    log(`Generated OTP for ${email}: ${otp}`);

    // Store OTP and event details with expiration (5 minutes)
    const otpData = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      eventDetails: eventDetails || null
    };
    otpStore.set(email, otpData);
    
    // Store pending booking
    if (eventDetails) {
      pendingBookings.set(email, {
        ...eventDetails,
        otp,
        createdAt: new Date().toISOString()
      });
    }

    // Prepare email content
    const eventInfo = eventDetails ? `\n\nEvent Details:\n- Event: ${eventDetails.eventName || 'N/A'}\n- Date: ${eventDetails.eventDate || 'N/A'}\n- Guests: ${eventDetails.guests || 'N/A'}` : '';
    
    const mailOptions = {
      from: `"Event Management System" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
      to: email,
      subject: '🔑 Your OTP for Event Booking',
      text: `Your OTP is: ${otp}${eventInfo}\n\nThis OTP is valid for 5 minutes.`,
    };

    log(`Sending email to ${email}`);
    
    await new Promise((resolve, reject) => {
      // Simulate email sending for testing
      log(`Would send email with OTP: ${otp}`);
      setTimeout(resolve, 1000);
    });
    
    log(`Email sent successfully to ${email}`);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      success: true,
      message: 'OTP sent successfully' 
    });
  } catch (error) {
    log(`Error in /api/send-otp: ${error.stack}`);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ 
      success: false,
      error: 'Failed to send OTP',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while sending OTP'
    });
  }
});

// Verify OTP and confirm booking
app.post('/api/booking/confirm', async (req, res) => {
  try {
    const { email, otp } = req.body;
    log(`Verifying OTP for booking: ${email}`);
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }
    
    const otpData = otpStore.get(email);
    const booking = pendingBookings.get(email);
    
    // Check if OTP exists and is not expired
    if (!otpData || !booking) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP. Please request a new one.'
      });
    }
    
    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please try again.'
      });
    }
    
    if (otpData.expiresAt < Date.now()) {
      // Clean up
      otpStore.delete(email);
      pendingBookings.delete(email);
      
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }
    
    // Here you would typically save the booking to a database
    // For now, we'll just log it and return success
    log(`✅ Booking confirmed for ${email}`, booking);
    
    // Clean up
    otpStore.delete(email);
    pendingBookings.delete(email);
    
    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: {
        ...booking,
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    log(`Error confirming booking: ${error.stack}`);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm booking',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Start server
app.listen(PORT, () => {
  log(`🚀 Server running on http://localhost:${PORT}`);
  log(`📧 Email User: ${process.env.EMAIL_USER || 'Not set'}`);
  log(`🔑 Mailtrap User: ${process.env.MAILTRAP_USER || 'Not configured'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});
