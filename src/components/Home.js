import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import EventBookingForm from './EventBookingForm';

const Home = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [lastBooking, setLastBooking] = useState(null);
  const [showPaymentOnHome, setShowPaymentOnHome] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCardClick = (occasion) => {
    setSelectedOccasion(occasion);
    setShowBookingForm(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const handleCloseForm = () => {
    setShowBookingForm(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  const handlePlanEvent = () => {
    setShowBookingForm(true);
    // Starting a new booking flow: hide payment button until success->return home occurs again
    try {
      localStorage.removeItem('showPaymentOnHome');
    } catch {}
    setShowPaymentOnHome(false);
  };

  useEffect(() => {
    // Safety: always restore scrolling on unmount or route change
    const restoreScroll = () => {
      document.body.style.overflow = 'auto';
    };
    return restoreScroll;
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lastBooking');
      setLastBooking(saved ? JSON.parse(saved) : null);
      const flag = localStorage.getItem('showPaymentOnHome');
      const fromSuccess = location.state && location.state.fromBookingSuccess === true;
      // Also check query param: ?pay=1
      const params = new URLSearchParams(location.search || '');
      const payParam = params.get('pay') === '1';
      setShowPaymentOnHome(fromSuccess || payParam || flag === '1');
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Also update when localStorage changes (e.g., after returning from success)
  useEffect(() => {
    const onStorage = () => {
      try {
        const saved = localStorage.getItem('lastBooking');
        setLastBooking(saved ? JSON.parse(saved) : null);
        const flag = localStorage.getItem('showPaymentOnHome');
        setShowPaymentOnHome(flag === '1');
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleGoToPayment = () => {
    let booking = lastBooking;
    if (!booking) {
      try {
        const saved = localStorage.getItem('lastBooking');
        if (saved) booking = JSON.parse(saved);
      } catch {}
    }
    navigate('/payment', { state: booking || {} });
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    navigate('/booking-success');
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">
              Create <span className="highlight">Unforgettable</span> Moments
            </h1>
            <p className="hero-subtitle">
              Your Premier Event Management Partner
            </p>
            <p className="hero-description">
              From intimate birthday celebrations to grand weddings, corporate gatherings to milestone anniversaries - 
              we transform your vision into extraordinary experiences. Let us handle every detail while you focus 
              on what matters most: celebrating life's precious moments.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-primary"
                onClick={handlePlanEvent}
              >
                Plan Your Event
              </button>
              <button className="btn-secondary">View Our Services</button>
              {showPaymentOnHome && (
                <button 
                  className="btn-primary"
                  onClick={handleGoToPayment}
                  title={lastBooking ? 'Proceed to payment' : 'Click to continue to payment'}
                >
                  Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBookingForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="close-button"
              onClick={handleCloseForm}
              aria-label="Close"
            >
              &times;
            </button>
            <EventBookingForm 
              onSuccess={handleBookingSuccess}
              onClose={handleCloseForm}
              initialEventName={selectedOccasion}
            />
          </div>
        </div>
      )}
      
      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card" onClick={() => handleCardClick('Birthday Parties')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=200&fit=crop&crop=center" alt="Birthday Party" />
              </div>
              <h3>Birthday Parties</h3>
              <p>Make every birthday special with personalized themes, decorations, and entertainment that create lasting memories.</p>
            </div>
            <div className="feature-card" onClick={() => handleCardClick('Weddings')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop&crop=center" alt="Wedding" />
              </div>
              <h3>Weddings</h3>
              <p>Your dream wedding awaits. From venue selection to the final dance, we orchestrate every moment of your perfect day.</p>
            </div>
            <div className="feature-card" onClick={() => handleCardClick('Corporate Events')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop&crop=center" alt="Corporate Event" />
              </div>
              <h3>Corporate Events</h3>
              <p>Professional gatherings that impress. Conferences, team building, product launches - executed flawlessly.</p>
            </div>
            <div className="feature-card" onClick={() => handleCardClick('Special Occasions')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&h=200&fit=crop&crop=center" alt="Special Occasion" />
              </div>
              <h3>Special Occasions</h3>
              <p>Anniversaries, graduations, baby showers - every milestone deserves a celebration as unique as you are.</p>
            </div>
            <div className="feature-card" onClick={() => handleCardClick('Other Occasions')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <img src="https://images.unsplash.com/photo-1541178735493-479c1a27ed24?w=300&h=200&fit=crop&crop=center" alt="Other Occasions" />
              </div>
              <h3>Other Occasions</h3>
              <p>Have something else in mind? We're here to bring any event vision to life with creativity and precision.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
