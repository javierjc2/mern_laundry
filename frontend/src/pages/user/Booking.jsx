import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function Booking() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [form, setForm] = useState({
    pickupDate: '',
    pickupTime: '',
    deliveryDate: '',
    deliveryTime: '',
    pickupAddress: user?.address || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadServices();
    const saved = sessionStorage.getItem('selectedServices');
    if (saved) setSelectedServiceIds(JSON.parse(saved));
  }, []);

  const loadServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleService = (id) => {
    setSelectedServiceIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getTotal = () =>
    services.filter(s => selectedServiceIds.includes(s._id)).reduce((sum, s) => sum + s.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
      alert('Please select at least one service.');
      return;
    }
    if (!form.pickupAddress.trim()) {
      alert('Please enter your pickup address.');
      return;
    }

    const pickupDateTime = new Date(`${form.pickupDate}T${form.pickupTime || '08:00'}`);
    const deliveryDateTime = new Date(`${form.deliveryDate}T${form.deliveryTime || '17:00'}`);

    if (deliveryDateTime <= pickupDateTime) {
      alert('Delivery date must be after pickup date.');
      return;
    }

    setLoading(true);
    try {
      // FIX: Include user ID and totalPrice in the request
      await axios.post('/api/bookings', {
        user: user.id,                          // ← THIS WAS THE FIX
        services: selectedServiceIds,
        pickupDate: pickupDateTime.toISOString(),
        deliveryDate: deliveryDateTime.toISOString(),
        pickupAddress: form.pickupAddress,
        totalPrice: getTotal(),                 // ← Also send total price
        notes: form.notes
      });
      sessionStorage.removeItem('selectedServices');
      setSuccess(true);
    } catch (err) {
      alert('Error creating booking: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  const s = {
    page: { fontFamily: "'Poppins', sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)' },
    header: { background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 },
    navbar: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem' },
    logo: { fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    navLinks: { display: 'flex', gap: '2rem', alignItems: 'center' },
    navLink: { color: '#4a5568', textDecoration: 'none', fontWeight: 500 },
    logoutBtn: { padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg, #4D6F71, #365456)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Poppins' },
    content: { maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' },
    title: { color: 'white', fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' },
    card: { background: 'rgba(255,255,255,0.97)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
    sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#2d3748', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' },
    serviceItem: (sel) => ({
      padding: '0.8rem', border: `2px solid ${sel ? '#4D6F71' : '#e2e8f0'}`, borderRadius: '10px',
      cursor: 'pointer', background: sel ? 'linear-gradient(135deg, #4D6F71, #365456)' : 'white',
      transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem'
    }),
    serviceName: (sel) => ({ fontWeight: 600, color: sel ? 'white' : '#2d3748', fontSize: '0.9rem' }),
    servicePrice: (sel) => ({ fontSize: '0.8rem', color: sel ? 'rgba(255,255,255,0.8)' : '#4D6F71', fontWeight: 600 }),
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem' },
    input: { width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '2px solid #e2e8f0', fontFamily: 'Poppins', fontSize: '0.9rem', boxSizing: 'border-box' },
    totalBar: { background: 'linear-gradient(135deg, #4D6F71, #365456)', borderRadius: '12px', padding: '1rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' },
    submitBtn: { width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #4D6F71, #365456)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'Poppins', marginTop: '1rem' },
    successCard: { background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
    successBtn: { padding: '0.8rem 2rem', background: 'linear-gradient(135deg, #4D6F71, #365456)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, fontSize: '1rem', marginRight: '1rem' },
  };

  if (success) return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.navbar}><div style={s.logo}>IV's Laundry Service</div></div>
      </header>
      <div style={s.content}>
        <div style={s.successCard}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#4D6F71', marginBottom: '0.5rem' }}>Booking Confirmed!</h2>
          <p style={{ color: '#4a5568', marginBottom: '2rem' }}>
            Your laundry booking has been successfully created.<br />
            We'll pick up your laundry on the scheduled date.
          </p>
          <button onClick={() => navigate('/my-bookings')} style={s.successBtn}>View My Bookings</button>
          <button onClick={() => { setSuccess(false); setSelectedServiceIds([]); }} style={{ ...s.successBtn, background: '#e2e8f0', color: '#4D6F71' }}>Book Again</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.navbar}>
          <div style={s.logo}>IV's Laundry Service</div>
          <div style={s.navLinks}>
            <Link to="/services" style={s.navLink}>Services</Link>
            <Link to="/my-bookings" style={s.navLink}>My Bookings</Link>
            <Link to="/profile" style={s.navLink}>Profile</Link>
            <button onClick={handleLogout} style={s.logoutBtn}>Log Out</button>
          </div>
        </div>
      </header>

      <div style={s.content}>
        <h1 style={s.title}>Create Booking</h1>
        <form onSubmit={handleSubmit}>

          {/* Services */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Select Services *</div>
            {services.length === 0 ? (
              <p style={{ color: '#718096' }}>Loading services...</p>
            ) : (
              <div style={s.servicesGrid}>
                {services.map(sv => {
                  const sel = selectedServiceIds.includes(sv._id);
                  return (
                    <div key={sv._id} style={s.serviceItem(sel)} onClick={() => toggleService(sv._id)}>
                      <div style={{ flex: 1 }}>
                        <div style={s.serviceName(sel)}>{sv.name}</div>
                        <div style={s.servicePrice(sel)}>₱{parseFloat(sv.price).toFixed(2)}</div>
                      </div>
                      {sel && <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
            {selectedServiceIds.length > 0 && (
              <div style={s.totalBar}>
                <span style={{ fontWeight: 600 }}>{selectedServiceIds.length} service(s) selected</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>Total: ₱{getTotal().toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Schedule</div>
            <div style={s.grid2}>
              <div style={s.formGroup}>
                <label style={s.label}>Pickup Date *</label>
                <input type="date" style={s.input} value={form.pickupDate}
                  onChange={e => setForm({ ...form, pickupDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Pickup Time</label>
                <input type="time" style={s.input} value={form.pickupTime}
                  onChange={e => setForm({ ...form, pickupTime: e.target.value })} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Delivery Date *</label>
                <input type="date" style={s.input} value={form.deliveryDate}
                  onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                  min={form.pickupDate || new Date().toISOString().split('T')[0]} required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Delivery Time</label>
                <input type="time" style={s.input} value={form.deliveryTime}
                  onChange={e => setForm({ ...form, deliveryTime: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Address & Notes */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Address & Notes</div>
            <div style={s.formGroup}>
              <label style={s.label}>Pickup Address *</label>
              <textarea style={{ ...s.input, resize: 'vertical', minHeight: '80px' }}
                value={form.pickupAddress}
                onChange={e => setForm({ ...form, pickupAddress: e.target.value })}
                required placeholder="Enter your complete address" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Additional Notes (Optional)</label>
              <textarea style={{ ...s.input, resize: 'vertical', minHeight: '80px' }}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions..." />
            </div>
          </div>

          <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Creating Booking...' : '✓ Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Booking;
