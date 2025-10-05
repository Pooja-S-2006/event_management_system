import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ConfirmationPage.css';

import { API_BASE_URL } from '../config';

// Base URL for API requests
const API_URL = `${API_BASE_URL}/api`;

const ConfirmationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state and send OTP
  useEffect(() => {
    const userEmail = location.state?.email;
    if (userEmail) {
      setEmail(userEmail);
      sendOtp(userEmail);
    } else {
      // If no email is provided, redirect back to home
      navigate('/');
    }
  }, [location.state, navigate]);

  // Function to send OTP
  const sendOtp = async (email) => {
    try {
      const response = await fetch(`${API_URL}/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      setTimeLeft(120); // Reset timer
      setOtp(['', '', '', '', '', '']); // Reset OTP input
      setError('');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleResendOtp = async () => {
    if (isResendDisabled) return;
    
    try {
      setIsResendDisabled(true);
      await sendOtp(email);
      
      // Enable resend button after 30 seconds
      setTimeout(() => {
        setIsResendDisabled(false);
      }, 30000);
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
      setIsResendDisabled(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6 || !/^\d+$/.test(enteredOtp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      // Verify OTP with the server
      const response = await fetch(`${API_URL}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: enteredOtp
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }
      
      if (data.message === 'OTP verified successfully' && data.booking) {
        const statePayload = {
          email,
          bookingId: data.booking.id,
          amount: data.booking.amount,
          currency: data.booking.currency || 'INR',
          formData: location.state?.formData || {}
        };
        try {
          localStorage.setItem('lastBooking', JSON.stringify(statePayload));
          localStorage.removeItem('showPaymentOnHome'); // ensure only set after success screen
        } catch {}
        // Navigate to booking success page and include booking details in state
        navigate('/booking-success', { state: { email, booking: statePayload } });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.message || 'Failed to verify OTP');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <h2>Verify Your Booking</h2>
        <p className="email-notice">We've sent a 6-digit verification code to <strong>{email}</strong></p>
        
        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={e => handleOtpChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                className="otp-input"
                disabled={timeLeft <= 0}
              />
            ))}
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="timer">
            {timeLeft > 0 ? (
              <p>Time remaining: {formatTime(timeLeft)}</p>
            ) : (
              <p>OTP expired</p>
            )}
          </div>
          
          <div className="actions">
            <button 
              type="button" 
              className={`resend-btn ${isResendDisabled ? 'disabled' : ''}`}
              onClick={handleResendOtp}
              disabled={isResendDisabled || timeLeft > 0}
            >
              {isResendDisabled ? `Resend in 30s` : 'Resend OTP'}
            </button>
            
            <button 
              type="submit" 
              className="verify-btn"
              disabled={otp.some(digit => digit === '') || timeLeft <= 0}
            >
              Verify & Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmationPage;
