import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PackageSelection() {
  const location = useLocation();
  const locationState = location.state || {};
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState(locationState.bookingId || '');
  const [copyStatus, setCopyStatus] = useState('');

  // Generate a client-side booking ID if not provided
  useEffect(() => {
    if (!bookingId) {
      const existing = sessionStorage.getItem('currentBookingId');
      if (existing) {
        setBookingId(existing);
      } else {
        const id = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        setBookingId(id);
        try { sessionStorage.setItem('currentBookingId', id); } catch {}
      }
    }
  }, [bookingId]);

  // Packages and pricing
  const packages = useMemo(
    () => ([
      // amounts in lakhs (as requested)
      { id: 'silver', name: 'Silver Package', amountLakh: 1.5, description: 'Basic decor + minimal seating' },
      { id: 'gold', name: 'Gold Package', amountLakh: 15.0, description: 'Premium decor + standard seating' },
      { id: 'platinum', name: 'Platinum Package', amountLakh: 30.0, description: 'Luxury decor + VIP seating' },
    ]),
    []
  );

  const pricePerPlate = { veg: 250, nonveg: 300 };
  // Per-item prices (varying) — memoized to keep references stable
  // Feel free to change these numbers to your actual menu pricing
  const sweetsOptions = useMemo(() => ([
    { name: 'Gulab Jamun', price: 35 },
    { name: 'Rasgulla', price: 30 },
    { name: 'Jalebi', price: 28 },
    { name: 'Kaju Katli', price: 60 },
    { name: 'Rasmalai', price: 55 },
  ]), []);
  const dessertsOptions = useMemo(() => ([
    { name: 'Ice Cream', price: 40 },
    { name: 'Brownie', price: 70 },
    { name: 'Fruit Salad', price: 45 },
    { name: 'Cheesecake', price: 120 },
    { name: 'Kulfi', price: 50 },
  ]), []);

  // Quick lookup maps for price by name
  const sweetsPriceMap = React.useMemo(
    () => sweetsOptions.reduce((acc, s) => { acc[s.name] = s.price; return acc; }, {}),
    [sweetsOptions]
  );
  const dessertsPriceMap = React.useMemo(
    () => dessertsOptions.reduce((acc, d) => { acc[d.name] = d.price; return acc; }, {}),
    [dessertsOptions]
  );

  const [selectedPackageId, setSelectedPackageId] = useState(packages[0].id);
  const [foodType, setFoodType] = useState('veg');
  const [itemCount, setItemCount] = useState(50);
  const [selectedSweets, setSelectedSweets] = useState([]);
  const [selectedDesserts, setSelectedDesserts] = useState([]);

  const selectedPackage = packages.find((p) => p.id === selectedPackageId);
  const packageSubtotal = selectedPackage ? Math.round((selectedPackage.amountLakh || 0) * 100000) : 0; // convert lakhs to rupees
  const foodSubtotal = (pricePerPlate[foodType] || 0) * (Number(itemCount) || 0);
  const sweetsSubtotal = selectedSweets.reduce((sum, n) => sum + (sweetsPriceMap[n] || 0), 0);
  const dessertsSubtotal = selectedDesserts.reduce((sum, n) => sum + (dessertsPriceMap[n] || 0), 0);
  const total = packageSubtotal + foodSubtotal + sweetsSubtotal + dessertsSubtotal;

  const handleMultiSelect = (event, setter) => {
    const options = Array.from(event.target.options);
    const values = options.filter(o => o.selected).map(o => o.value);
    setter(values);
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: '32px auto',
      padding: 0,
      border: '1px solid #e6e6e6',
      borderRadius: 12,
      boxShadow: '0 6px 24px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        background: 'linear-gradient(90deg, #f8fafc 0%, #eef2ff 100%)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
      }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Package & Food Details</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, color: '#334155' }}>
          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            padding: '6px 10px',
            borderRadius: 8,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 13
          }}>
            Booking ID: <strong>{bookingId || '—'}</strong>
          </div>
          {locationState.email && (
            <div style={{ fontSize: 13, color: '#475569' }}>Email: <strong>{locationState.email}</strong></div>
          )}
          <button
            type="button"
            onClick={() => {
              if (!bookingId) return;
              const tryFallback = () => {
                try {
                  const ta = document.createElement('textarea');
                  ta.value = bookingId;
                  ta.style.position = 'fixed';
                  ta.style.opacity = '0';
                  document.body.appendChild(ta);
                  ta.focus();
                  ta.select();
                  const ok = document.execCommand('copy');
                  document.body.removeChild(ta);
                  if (ok) {
                    setCopyStatus('Copied!');
                    setTimeout(() => setCopyStatus(''), 1500);
                  } else {
                    setCopyStatus('Copy failed');
                    setTimeout(() => setCopyStatus(''), 1500);
                  }
                } catch {
                  setCopyStatus('Copy failed');
                  setTimeout(() => setCopyStatus(''), 1500);
                }
              };
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(bookingId)
                  .then(() => {
                    setCopyStatus('Copied!');
                    setTimeout(() => setCopyStatus(''), 1500);
                  })
                  .catch(() => tryFallback());
              } else {
                tryFallback();
              }
            }}
            style={{
              marginLeft: 'auto',
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #dbeafe',
              background: '#eff6ff',
              color: '#1d4ed8',
              cursor: 'pointer'
            }}
          >Copy ID</button>
          {copyStatus && (
            <span style={{ fontSize: 12, color: copyStatus === 'Copied!' ? '#16a34a' : '#dc2626' }}>{copyStatus}</span>
          )}
        </div>
      </div>
      <div style={{ padding: 20 }}>

      {/* Package selection */}
      <div style={{ display: 'grid', gap: 8, marginBottom: 16, background: '#ffffff', padding: 16, border: '1px solid #eee', borderRadius: 10 }}>
        <label htmlFor="package">Package</label>
        <select
          id="package"
          value={selectedPackageId}
          onChange={(e) => setSelectedPackageId(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }}
        >
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {`${p.name} (₹${p.amountLakh.toFixed(2)} Lakh)`}
            </option>
          ))}
        </select>
        {selectedPackage && (
          <div style={{ fontSize: 13, color: '#666' }}>{selectedPackage.description}</div>
        )}
      </div>

      {/* Food details */}
      <div style={{ background: '#ffffff', padding: 16, border: '1px solid #eee', borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Food Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="foodType">Veg / Non-Veg</label>
            <select
              id="foodType"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }}
            >
              <option value="veg">Veg (₹{pricePerPlate.veg}/plate)</option>
              <option value="nonveg">Non-Veg (₹{pricePerPlate.nonveg}/plate)</option>
            </select>
          </div>
          <div>
            <label htmlFor="itemCount">Number of items</label>
            <input
              id="itemCount"
              type="number"
              min={1}
              value={itemCount}
              onChange={(e) => setItemCount(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 14, color: '#333' }}>
          Food subtotal: <strong>₹{foodSubtotal.toLocaleString()}</strong>
        </div>
      </div>

      {/* Sweets and Dessert selections */}
      <div style={{ background: '#ffffff', padding: 16, border: '1px solid #eee', borderRadius: 10, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Sweets & Desserts</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="sweets">Sweets</label>
            <div style={{ fontSize: 12, color: '#666' }}>Prices vary by item</div>
            <select
              id="sweets"
              multiple
              value={selectedSweets}
              onChange={(e) => handleMultiSelect(e, setSelectedSweets)}
              style={{ padding: 10, height: 140, borderRadius: 8, border: '1px solid #e5e7eb' }}
            >
              {sweetsOptions.map((s) => (
                <option key={s.name} value={s.name}>{`${s.name} — ₹${s.price}`}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="desserts">Desserts</label>
            <div style={{ fontSize: 12, color: '#666' }}>Prices vary by item</div>
            <select
              id="desserts"
              multiple
              value={selectedDesserts}
              onChange={(e) => handleMultiSelect(e, setSelectedDesserts)}
              style={{ padding: 10, height: 140, borderRadius: 8, border: '1px solid #e5e7eb' }}
            >
              {dessertsOptions.map((d) => (
                <option key={d.name} value={d.name}>{`${d.name} — ₹${d.price}`}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 14, color: '#333' }}>
          Sweets subtotal: <strong>₹{sweetsSubtotal.toLocaleString()}</strong>
        </div>
        <div style={{ marginTop: 4, fontSize: 14, color: '#333' }}>
          Desserts subtotal: <strong>₹{dessertsSubtotal.toLocaleString()}</strong>
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: '#ffffff', padding: 16, border: '1px solid #eee', borderRadius: 10, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Summary</h3>
        <div style={{ display: 'grid', gap: 6, fontSize: 14 }}>
          <div>
            Package: <strong>{selectedPackage?.name}</strong> — ₹{selectedPackage ? `${selectedPackage.amountLakh.toFixed(2)} Lakh` : '—'}
          </div>
          <div>
            Food: <strong>{foodType === 'veg' ? 'Veg' : 'Non-Veg'}</strong> × {itemCount} — ₹{foodSubtotal.toLocaleString()}
          </div>
          <div>
            Sweets: {selectedSweets.length > 0 ? selectedSweets.join(', ') : '—'} — ₹{sweetsSubtotal.toLocaleString()}
          </div>
          <div>
            Desserts: {selectedDesserts.length > 0 ? selectedDesserts.join(', ') : '—'} — ₹{dessertsSubtotal.toLocaleString()}
          </div>
          <div style={{ marginTop: 6, fontWeight: 600 }}>
            Total (approx): ₹{(total / 100000).toFixed(2)} Lakh
          </div>
        </div>
      </div>

      {/* Next action */}
      <div style={{ margin: '16px 20px 20px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => {
            const payload = {
              bookingId: bookingId || null,
              email: locationState.email || '',
              package: selectedPackage?.name || '',
              packageAmountLakh: selectedPackage?.amountLakh || 0,
              foodType,
              itemCount: Number(itemCount) || 0,
              sweets: selectedSweets,
              desserts: selectedDesserts,
              subtotals: {
                packageRupees: packageSubtotal,
                foodRupees: foodSubtotal,
                sweetsRupees: sweetsSubtotal,
                dessertsRupees: dessertsSubtotal,
                totalRupees: total,
                totalLakh: Number((total / 100000).toFixed(2)),
              },
            };
            navigate('/confirm-booking', {
              state: { email: payload.email, formData: payload },
            });
          }}
          style={{ padding: '10px 16px', background: '#1d4ed8', color: '#fff', border: '1px solid #1e40af', borderRadius: 8, cursor: 'pointer' }}
        >
          Next
        </button>
      </div>
      </div>
    </div>
  );
}
