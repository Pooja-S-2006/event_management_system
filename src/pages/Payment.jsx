import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Payment() {
  const location = useLocation();
  const locationState = location.state || {};
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [booking, setBooking] = useState({
    bookingId: locationState.bookingId,
    amount: locationState.amount,
    currency: locationState.currency || 'INR',
    email: locationState.email || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: locationState.email || '', phone: '' });
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN'
  });
  const [plink, setPlink] = useState(null); // { id, short_url, amount, currency, bookingId }

  useEffect(() => {
    if (!booking.bookingId) {
      try {
        const saved = localStorage.getItem('lastBooking');
        if (saved) {
          const parsed = JSON.parse(saved);
          setBooking({
            bookingId: parsed.bookingId,
            amount: parsed.amount,
            currency: parsed.currency || 'INR',
            email: parsed.email || ''
          });
          setCustomer((c) => ({ ...c, email: parsed.email || c.email }));
        }
      } catch {}
    }
  }, [booking.bookingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const createPaymentLink = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const resp = await fetch('/api/payments/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.bookingId, customer, address })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to create payment link');
      setPlink(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  const qrSrc = plink?.short_url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(plink.short_url)}`
    : null;

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Complete Your Payment</h2>
      <p>Booking ID: <strong>{booking.bookingId || '—'}</strong></p>
      <p>Amount: <strong>{booking.currency} {booking.amount ? (booking.amount / 100).toFixed(2) : '—'}</strong></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!plink && (
        <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 4, marginTop: 12 }}>
        <form ref={formRef} onSubmit={createPaymentLink} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label>Name</label>
            <input name="name" value={customer.name} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div>
            <label>Email</label>
            <input name="email" type="email" value={customer.email} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div>
            <label>Phone</label>
            <input
              name="phone"
              type="tel"
              value={customer.phone}
              onChange={handleChange}
              placeholder="10-digit mobile"
              required
              pattern="^[0-9]{10}$"
              inputMode="numeric"
              maxLength={10}
              title="Enter exactly 10 digits (0-9)"
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <hr />
          <div>
            <label>Address Line 1</label>
            <input name="line1" value={address.line1} onChange={handleAddressChange} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div>
            <label>Address Line 2</label>
            <input name="line2" value={address.line2} onChange={handleAddressChange} style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>City</label>
              <input name="city" value={address.city} onChange={handleAddressChange} required style={{ width: '100%', padding: 8 }} />
            </div>
            <div>
              <label>State</label>
              <input name="state" value={address.state} onChange={handleAddressChange} required style={{ width: '100%', padding: 8 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Postal Code</label>
              <input name="postalCode" value={address.postalCode} onChange={handleAddressChange} required style={{ width: '100%', padding: 8 }} />
            </div>
            <div>
              <label>Country</label>
              <input name="country" value={address.country} onChange={handleAddressChange} required style={{ width: '100%', padding: 8 }} />
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (formRef.current && formRef.current.reportValidity()) {
                navigate('/select-package', {
                  state: {
                    bookingId: booking.bookingId,
                    email: booking.email,
                  },
                });
              }
            }}
            style={{ padding: '10px 16px' }}
          >
            Next
          </button>
        </form>
        </div>
      )}

      {plink && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <h3>Scan to Pay</h3>
          {qrSrc && (
            <img src={qrSrc} alt="Payment QR" width={240} height={240} style={{ border: '1px solid #ddd', borderRadius: 8 }} />
          )}
          <div style={{ marginTop: 12 }}>
            <a href={plink.short_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              Or tap here to pay (GPay/UPI/Card)
            </a>
          </div>
          <p style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
            After payment, you'll see a success screen. We also update your booking automatically via webhook.
          </p>
        </div>
      )}
    </div>
  );
}
