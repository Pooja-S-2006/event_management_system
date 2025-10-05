import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BookingSuccess.css';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  useEffect(() => {
    // If booking details were passed via state, persist them
    if (location.state?.booking) {
      try {
        localStorage.setItem('lastBooking', JSON.stringify(location.state.booking));
      } catch {}
    }
  }, [location.state]);

  const handleReturnHome = () => {
    try {
      // Flag to show the Payment button once user explicitly returns home
      localStorage.setItem('showPaymentOnHome', '1');
      // Ensure booking is stored
      if (location.state?.booking) {
        localStorage.setItem('lastBooking', JSON.stringify(location.state.booking));
      }
    } catch {}
    navigate('/?pay=1', { state: { fromBookingSuccess: true } });
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">
          ✓
        </div>
        <h2>Booking Confirmed!</h2>
        <p className="success-message">
          Thank you for your booking. We've sent a confirmation to <strong>{email}</strong> with all the details.
        </p>
        <button 
          className="home-button"
          onClick={handleReturnHome}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;
