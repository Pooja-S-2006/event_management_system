const axios = require('axios');

async function testOtp() {
  try {
    const response = await axios.post('http://localhost:5000/api/send-otp', {
      email: 'test@example.com'
    });
    console.log('✅ OTP sent successfully:', response.data);
  } catch (error) {
    console.error('❌ Error sending OTP:', error.response?.data || error.message);
  }
}

testOtp();
