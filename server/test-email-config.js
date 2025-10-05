const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
console.log('Loading environment from:', envPath);
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.error('❌ Error loading .env file:', envResult.error);
  process.exit(1);
}

console.log('\nTesting email configuration...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '*****' : 'Not set');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true
});

console.log('\nSending test email...');

transporter.sendMail({
  from: `"Event Management System" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: 'Test Email from Event Management System',
  text: 'This is a test email to verify the email configuration.'
})
.then(info => {
  console.log('✅ Email sent successfully!');
  console.log('Message ID:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
})
.catch(error => {
  console.error('❌ Error sending email:');
  console.error(error);
});
