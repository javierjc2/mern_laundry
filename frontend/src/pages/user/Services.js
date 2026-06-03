import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function UserServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (err) {
      alert('Error loading services');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const getTotal = () => {
    return services.filter(s => selected.includes(s._id)).reduce((sum, s) => sum + s.price, 0);
  };

  const handleProceed = () => {
    if (selected.length === 0) { alert('Please select at least one service.'); return; }
    sessionStorage.setItem('selectedServices', JSON.stringify(selected));
    sessionStorage.setItem('totalPrice', JSON.stringify(getTotal()));
    navigate('/booking');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) { logout(); navigate('/login'); }
  };

  const s = {
    page: { fontFamily: "'Poppins', sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)' },
    header: { background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 },
    navbar: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem' },
    logo: { fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    navLinks: { display: 'flex', gap: '2rem', alignItems: 'center' },
    navLink: { color: '#4a5568', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' },
    logoutBtn: { padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Poppins' },
    content: { maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' },
    title: { color: 'white', fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' },
    subtitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '2rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
    card: (isSelected) => ({
      background: isSelected ? 'linear-gradient(135deg, #4D6F71, #365456)' : 'rgba(255,255,255,0.95)',
      borderRadius: '15px', padding: '1.5rem', cursor: 'pointer',
      transition: 'all 0.3s ease', border: isSelected ? '3px solid #fff' : '3px solid transparent',
      boxShadow: isSelected ? '0 15px 40px rgba(0,0,0,0.3)' : '0 5px 20px rgba(0,0,0,0.1)',
      transform: isSelected ? 'translateY(-5px)' : 'none',
    }),
    cardName: (isSelected) => ({ fontSize: '1.2rem', fontWeight: 700, color: isSelected ? 'white' : '#2d3748', marginBottom: '0.5rem' }),
    cardDesc: (isSelected) => ({ fontSize: '0.9rem', color: isSelected ? 'rgba(255,255,255,0.8)' : '#718096', marginBottom: '1rem', lineHeight: 1.5 }),
    cardPrice: (isSelected) => ({ fontSize: '1.3rem', fontWeight: 700, color: isSelected ? '#a0ecc4' : '#4D6F71' }),
    checkmark: { float: 'right', fontSize: '1.5rem', color: 'white' },
    bottomBar: { position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.97)', boxShadow: '0 -5px 20px rgba(0,0,0,0.1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
    totalText: { fontSize: '1.2rem', fontWeight: 700, color: '#2d3748' },
    proceedBtn: { padding: '0.8rem 2.5rem', background: 'linear-gradient(135deg, #4D6F71, #365456)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', fontFamily: 'Poppins', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' },
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.navbar}>
          <div style={s.logo}>IV's Laundry Service</div>
          <div style={s.navLinks}>
            <Link to="/services" style={{...s.navLink, color: '#4D6F71', fontWeight: 700}}>Services</Link>
            <Link to="/my-bookings" style={s.navLink}>My Bookings</Link>
            <Link to="/profile" style={s.navLink}>Profile</Link>
            <button onClick={handleLogout} style={s.logoutBtn}>Log Out</button>
          </div>
        </div>
      </header>

      <div style={{...s.content, paddingBottom: selected.length > 0 ? '6rem' : '3rem'}}>
        <h1 style={s.title}>Select Your Services</h1>
        <p style={s.subtitle}>Choose one or more laundry services you need</p>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '3rem', fontSize: '1.2rem' }}>Loading services...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '3rem', fontSize: '1.1rem' }}>No services available at the moment.</div>
        ) : (
          <div style={s.grid}>
            {services.map(service => {
              const isSelected = selected.includes(service._id);
              return (
                <div key={service._id} style={s.card(isSelected)} onClick={() => toggleService(service._id)}>
                  {isSelected && <span style={s.checkmark}>✓</span>}
                  <div style={s.cardName(isSelected)}>{service.name}</div>
                  <div style={s.cardDesc(isSelected)}>{service.description}</div>
                  <div style={s.cardPrice(isSelected)}>₱{parseFloat(service.price).toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div style={s.bottomBar}>
          <div>
            <div style={s.totalText}>Total: ₱{getTotal().toFixed(2)}</div>
            <div style={{ fontSize: '0.85rem', color: '#718096' }}>{selected.length} service(s) selected</div>
          </div>
          <button onClick={handleProceed} style={s.proceedBtn}>Proceed to Booking →</button>
        </div>
      )}
    </div>
  );
}

export default UserServices;
