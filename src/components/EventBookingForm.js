import React, { useState } from 'react';
import axios from 'axios';
import './EventBookingForm.css';

const EventBookingForm = ({ onSuccess, onClose, initialEventName = '' }) => {
  const [step, setStep] = useState(1); // 1: Booking form, 2: OTP verification, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [bookingDetails, setBookingDetails] = useState({
    eventName: initialEventName,
    eventDate: '',
    email: '',
    guests: 1,
    additionalNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startOtpTimer = () => {
    // Set OTP timer for 5 minutes (300 seconds)
    let timeLeft = 300;
    setOtpTimer(timeLeft);
    
    const timer = setInterval(() => {
      timeLeft -= 1;
      setOtpTimer(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/otp/send', {
        email: bookingDetails.email,
        eventDetails: {
          eventName: bookingDetails.eventName,
          eventDate: bookingDetails.eventDate,
          guests: bookingDetails.guests,
          additionalNotes: bookingDetails.additionalNotes
        }
      });

      if (response.status === 200) {
        startOtpTimer();
        setStep(2); // Move to OTP verification
      } else {
        setError(response.data?.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify OTP and book the event
      const response = await axios.post('http://localhost:5000/api/otp/verify', {
        email: bookingDetails.email,
        otp: otp,
        eventDetails: {
          eventName: bookingDetails.eventName,
          eventDate: bookingDetails.eventDate,
          guests: bookingDetails.guests,
          additionalNotes: bookingDetails.additionalNotes
        }
      });

      if (response.status === 200) {
        setStep(3); // Show success message
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        setError(response.data?.error || 'Failed to process your booking');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setOtp('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/booking/send-otp', {
        email: bookingDetails.email,
        eventDetails: bookingDetails
      });

      if (response.data.success) {
        startOtpTimer();
      } else {
        setError(response.data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render booking form
  if (step === 1) {
    return (
      <div className="event-booking-form">
        <button className="close-button" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <div className="booking-form-container">
          <form onSubmit={handleBookingSubmit} className="booking-form">
            <h2>Book Your Event</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={bookingDetails.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label>Event Name</label>
              <input
                type="text"
                name="eventName"
                value={bookingDetails.eventName}
                onChange={handleInputChange}
                required
                placeholder="E.g., Birthday Party, Wedding, etc."
              />
            </div>
            
            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                name="eventDate"
                value={bookingDetails.eventDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="form-group">
              <label>Number of Guests</label>
              <input
                type="number"
                name="guests"
                value={bookingDetails.guests}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="additionalNotes"
                value={bookingDetails.additionalNotes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any special requirements?"
              />
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render OTP verification
  if (step === 2) {
    return (
      <div className="otp-verification">
        <h2>Verify Your Email</h2>
        <p>We've sent a 6-digit OTP to <strong>{bookingDetails.email}</strong></p>
        {otpTimer > 0 ? (
          <p className="otp-timer">OTP expires in: {formatTime(otpTimer)}</p>
        ) : (
          <p className="otp-timer expired">OTP expired</p>
        )}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleVerifyOTP} className="otp-form">
          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              placeholder="Enter 6-digit OTP"
              disabled={otpTimer <= 0}
              inputMode="numeric"
              pattern="\d{6}"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading || otpTimer <= 0}
              className={otpTimer <= 0 ? 'disabled' : ''}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button 
              type="button" 
              onClick={handleResendOTP}
              disabled={loading || otpTimer > 0}
              className="resend-button"
            >
              {loading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render success message
  return (
    <div className="booking-success">
      <div className="success-icon">✓</div>
      <h2>Booking Confirmed!</h2>
      <p>Your event has been successfully booked.</p>
      <p>A confirmation has been sent to <strong>{bookingDetails.email}</strong></p>
      
      <div className="booking-details">
        <h3>Booking Details</h3>
        <p><strong>Event:</strong> {bookingDetails.eventName}</p>
        <p><strong>Date:</strong> {bookingDetails.eventDate ? new Date(bookingDetails.eventDate).toLocaleDateString() : 'Not specified'}</p>
        <p><strong>Guests:</strong> {bookingDetails.guests}</p>
        {bookingDetails.additionalNotes && (
          <p><strong>Notes:</strong> {bookingDetails.additionalNotes}</p>
        )}
      </div>
      
      <button 
        className="new-booking-btn"
        onClick={() => {
          setStep(1);
          setOtp('');
          setBookingDetails({
            eventName: '',
            eventDate: '',
            email: '',
            guests: 1,
            additionalNotes: ''
          });
        }}
      >
        Book Another Event
      </button>
    </div>
  );
};

export default EventBookingForm;
