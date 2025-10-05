const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Testing email configuration...');
console.log('📧 Email User:', process.env.EMAIL_USER);
console.log('🔑 Email Password:', process.env.EMAIL_PASS ? '*****' : 'Not set');

// Create a test transporter with Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'smtp.gmail.com',
  port: process.env.MAILTRAP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER || process.env.EMAIL_USER,
    pass: process.env.MAILTRAP_PASS || process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
});

// Test email options
const mailOptions = {
  from: `"Test Email" <${process.env.EMAIL_USER}>`,
  to: 'test@example.com', // Replace with your test email
  subject: 'Test Email from Event App',
  text: 'This is a test email from the Event App.'
};

// Send the test email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Error sending test email:', error);
  } else {
    console.log('✅ Test email sent successfully:', info.messageId);
  }
});
