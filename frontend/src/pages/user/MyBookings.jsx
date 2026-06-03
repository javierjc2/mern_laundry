import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      // FIX: Correct endpoint is /api/bookings/my-bookings
      const res = await axios.get('/api/bookings/my-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      alert('Error loading bookings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      // FIX: Correct cancel endpoint is PATCH /api/bookings/:id/cancel
      await axios.patch(`/api/bookings/${id}/cancel`);
      alert('Booking cancelled successfully!');
      loadBookings();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) { logout(); navigate('/login'); }
  };

  const getStatusColor = (status) => {
    const map = {
      'pending': '#f6ad55',
      'picked-up': '#63b3ed',
      'processing': '#76e4f7',
      'ready': '#68d391',
      'delivered': '#9ae6b4',
      'cancelled': '#fc8181'
    };
    return map[status] || '#e2e8f0';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const s = {
    page: { fontFamily: "'Poppins', sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)' },
    header: { background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 },
    navbar: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem' },
    logo: { fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    navLinks: { display: 'flex', gap: '2rem', alignItems: 'center' },
    navLink: { color: '#4a5568', textDecoration: 'none', fontWeight: 500 },
    logoutBtn: { padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Poppins' },
    content: { maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' },
    title: { color: 'white', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' },
    filters: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' },
    filterBtn: (active) => ({
      padding: '0.5rem 1.2rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
      fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem',
      background: active ? 'white' : 'rgba(255,255,255,0.2)',
      color: active ? '#4D6F71' : 'white', transition: 'all 0.3s'
    }),
    card: { background: 'rgba(255,255,255,0.97)', borderRadius: '15px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' },
    statusBadge: (status) => ({ padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: getStatusColor(status), color: '#2d3748', display: 'inline-block' }),
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' },
    infoLabel: { fontSize: '0.75rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' },
    infoValue: { fontSize: '0.95rem', color: '#2d3748', fontWeight: 500 },
    serviceTag: { display: 'inline-block', padding: '3px 10px', background: 'linear-gradient(135deg, #4D6F71, #365456)', color: 'white', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginRight: '5px', marginBottom: '5px' },
    cancelBtn: { padding: '0.5rem 1.2rem', background: '#fc8181', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.9rem' },
    bookNowBtn: { padding: '1rem 3rem', background: 'white', color: '#4D6F71', border: 'none', borderRadius: '25px', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', display: 'block', margin: '0 auto' },
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.navbar}>
          <div style={s.logo}>IV's Laundry Service</div>
          <div style={s.navLinks}>
            <Link to="/services" style={s.navLink}>Services</Link>
            <Link to="/my-bookings" style={{ ...s.navLink, color: '#4D6F71', fontWeight: 700 }}>My Bookings</Link>
            <Link to="/profile" style={s.navLink}>Profile</Link>
            <button onClick={handleLogout} style={s.logoutBtn}>Log Out</button>
          </div>
        </div>
      </header>

      <div style={s.content}>
        <h1 style={s.title}>My Bookings</h1>

        {/* Status Filters */}
        <div style={s.filters}>
          {['all', 'pending', 'picked-up', 'processing', 'ready', 'delivered', 'cancelled'].map(f => (
            <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '3rem', fontSize: '1.2rem' }}>
            Loading your bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              {filter === 'all' ? "You don't have any bookings yet." : `No ${filter} bookings found.`}
            </p>
            <button onClick={() => navigate('/services')} style={s.bookNowBtn}>📅 Book Now</button>
          </div>
        ) : (
          filtered.map(b => (
            <div key={b._id} style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2d3748', marginBottom: '4px' }}>
                    Booking #{b._id.slice(-6).toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                    Created: {new Date(b.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={s.statusBadge(b.status)}>{b.status?.toUpperCase()}</span>
              </div>

              {/* Services */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={s.infoLabel}>Services</span>
                <div>
                  {b.services?.map(sv => (
                    <span key={sv._id} style={s.serviceTag}>{sv.name}</span>
                  ))}
                </div>
              </div>

              {/* Info Grid */}
              <div style={s.infoGrid}>
                <div>
                  <span style={s.infoLabel}>Pickup Date</span>
                  <span style={s.infoValue}>{formatDate(b.pickupDate)}</span>
                </div>
                <div>
                  <span style={s.infoLabel}>Delivery Date</span>
                  <span style={s.infoValue}>{formatDate(b.deliveryDate)}</span>
                </div>
                <div>
                  <span style={s.infoLabel}>Pickup Address</span>
                  <span style={s.infoValue}>{b.pickupAddress || 'N/A'}</span>
                </div>
                <div>
                  <span style={s.infoLabel}>Total Price</span>
                  <span style={{ ...s.infoValue, color: '#4D6F71', fontWeight: 700, fontSize: '1.1rem' }}>
                    ₱{parseFloat(b.totalPrice || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {b.notes && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={s.infoLabel}>Notes</span>
                  <span style={s.infoValue}>{b.notes}</span>
                </div>
              )}

              {b.status === 'pending' && (
                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <button onClick={() => handleCancel(b._id)} style={s.cancelBtn}>✕ Cancel Booking</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyBookings;
