// Simple test script to verify email configuration
console.log('Starting email test...');

// Directly set environment variables for testing
process.env.NODE_ENV = 'development';
process.env.EMAIL_USER = 'poojaprincess2006@gmail.com';
process.env.EMAIL_PASS = 'adzozwjfcqxxprht';

const nodemailer = require('nodemailer');

console.log('Creating transporter with:');
console.log('User:', process.env.EMAIL_USER);
console.log('Pass:', process.env.EMAIL_PASS ? '*****' : 'Not set');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true,
  logger: true
});

console.log('Sending test email...');

transporter.sendMail({
  from: `"Test Sender" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: 'Test Email from Direct Script',
  text: 'This is a test email sent directly from the test script.'
})
.then(info => {
  console.log('✅ Email sent successfully!');
  console.log('Message ID:', info.messageId);
  process.exit(0);
})
.catch(error => {
  console.error('❌ Error sending email:');
  console.error(error);
  process.exit(1);
});
