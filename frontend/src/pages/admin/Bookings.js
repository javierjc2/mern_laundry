import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadBookings(); }, []);

  useEffect(() => {
    let result = [...bookings];
    if (search) {
      result = result.filter(b => {
        const name = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
        return (
          name.includes(search.toLowerCase()) ||
          b.user?.email?.toLowerCase().includes(search.toLowerCase())
        );
      });
    }
    if (filterStatus) result = result.filter(b => b.status === filterStatus);
    setFiltered(result);
  }, [search, filterStatus, bookings]);

  const loadBookings = async () => {
    try {
      const res = await axios.get('/api/admin/bookings');
      setBookings(res.data);
      setFiltered(res.data);
    } catch (err) {
      alert('Error loading bookings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setShowModal(true);
  };

  const updateStatus = async () => {
    try {
      // FIX: The backend PUT /api/admin/bookings/:id requires services array
      // We send the full booking data with updated status
      const serviceIds = selectedBooking.services.map(s => s._id || s);

      await axios.put(`/api/admin/bookings/${selectedBooking._id}`, {
        user: selectedBooking.user?._id || selectedBooking.user,
        services: serviceIds,                        // ← Required by backend
        pickupDate: selectedBooking.pickupDate,
        deliveryDate: selectedBooking.deliveryDate,
        pickupAddress: selectedBooking.pickupAddress,
        totalPrice: selectedBooking.totalPrice,
        notes: selectedBooking.notes,
        status: newStatus                            // ← Updated status
      });

      alert('Status updated successfully!');
      setShowModal(false);
      loadBookings();
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) { logout(); navigate('/login'); }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f6ad55', 'picked-up': '#63b3ed', 'processing': '#76e4f7',
      'ready': '#68d391', 'delivered': '#9ae6b4', 'cancelled': '#fc8181'
    };
    return colors[status] || '#e2e8f0';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const s = {
    page: { fontFamily: "'Poppins', sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)' },
    header: { background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 },
    navbar: { maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem' },
    logo: { fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    navLinks: { display: 'flex', gap: '2rem', alignItems: 'center' },
    navLink: { color: '#4a5568', textDecoration: 'none', fontWeight: 500 },
    logoutBtn: { padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Poppins' },
    content: { maxWidth: '1400px', margin: '0 auto', padding: '2rem' },
    title: { color: 'white', fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' },
    filterBox: { background: 'rgba(255,255,255,0.95)', borderRadius: '15px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' },
    input: { padding: '0.6rem 1rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontFamily: 'Poppins', fontSize: '0.9rem', flex: 1, minWidth: '200px' },
    select: { padding: '0.6rem 1rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontFamily: 'Poppins', fontSize: '0.9rem', minWidth: '160px' },
    clearBtn: { padding: '0.6rem 1.2rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 },
    table: { width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.97)', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
    th: { padding: '1rem', textAlign: 'left', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', color: 'white', fontWeight: 600, whiteSpace: 'nowrap' },
    td: { padding: '1rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' },
    statusBadge: (status) => ({ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: getStatusColor(status), color: '#2d3748', display: 'inline-block', whiteSpace: 'nowrap' }),
    updateBtn: { padding: '6px 16px', background: 'linear-gradient(135deg, #4D6F71, #365456)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Poppins', fontSize: '0.85rem', fontWeight: 600 },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { background: 'white', borderRadius: '20px', padding: '2rem', width: '90%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    modalTitle: { fontSize: '1.4rem', color: '#2d3748', fontWeight: 700, marginBottom: '0.5rem' },
    modalSub: { color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' },
    modalSelect: { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontFamily: 'Poppins', marginBottom: '1.5rem', fontSize: '1rem' },
    modalBtns: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
    cancelBtn: { padding: '0.7rem 1.5rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 },
    saveBtn: { padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #4D6F71, #365456)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 },
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.navbar}>
          <div style={s.logo}>IV's Laundry Service</div>
          <div style={s.navLinks}>
            <Link to="/admin" style={s.navLink}>Dashboard</Link>
            <Link to="/admin/services" style={s.navLink}>Services</Link>
            <Link to="/admin/bookings" style={{ ...s.navLink, color: '#4D6F71', fontWeight: 700 }}>Records</Link>
            <Link to="/admin/customers" style={s.navLink}>Users</Link>
            <button onClick={handleLogout} style={s.logoutBtn}>Log Out</button>
          </div>
        </div>
      </header>

      <div style={s.content}>
        <h1 style={s.title}>📋 Booking Records</h1>

        {/* Filters */}
        <div style={s.filterBox}>
          <input style={s.input} placeholder="🔍 Search by customer name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="picked-up">Picked Up</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button style={s.clearBtn} onClick={() => { setSearch(''); setFilterStatus(''); }}>Clear</button>
          <span style={{ color: '#4a5568', fontWeight: 600, fontSize: '0.9rem' }}>
            {filtered.length} of {bookings.length} records
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '3rem', fontSize: '1.2rem' }}>
            Loading records...
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '15px' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Customer</th>
                  <th style={s.th}>Services</th>
                  <th style={s.th}>Pickup Date</th>
                  <th style={s.th}>Delivery Date</th>
                  <th style={s.th}>Address</th>
                  <th style={s.th}>Total</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ ...s.td, textAlign: 'center', padding: '3rem', color: '#718096' }}>
                      No bookings found.
                    </td>
                  </tr>
                ) : filtered.map((b, i) => (
                  <tr key={b._id} style={{ background: i % 2 === 0 ? 'white' : '#f7fafc' }}>
                    <td style={s.td}>{i + 1}</td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600, color: '#2d3748' }}>{b.user?.firstName} {b.user?.lastName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>{b.user?.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>{b.user?.phone}</div>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {b.services?.map(sv => (
                          <span key={sv._id} style={{ padding: '2px 8px', background: 'linear-gradient(135deg, #4D6F71, #365456)', color: 'white', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>
                            {sv.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={s.td}>{formatDate(b.pickupDate)}</td>
                    <td style={s.td}>{formatDate(b.deliveryDate)}</td>
                    <td style={s.td}>
                      <div style={{ fontSize: '0.85rem', maxWidth: '140px', color: '#4a5568' }}>{b.pickupAddress}</div>
                    </td>
                    <td style={s.td}>
                      <strong style={{ color: '#4D6F71', fontSize: '1rem' }}>₱{parseFloat(b.totalPrice || 0).toFixed(2)}</strong>
                    </td>
                    <td style={s.td}>
                      <span style={s.statusBadge(b.status)}>{b.status?.toUpperCase()}</span>
                    </td>
                    <td style={s.td}>
                      <button onClick={() => openStatusModal(b)} style={s.updateBtn}>Update Status</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showModal && selectedBooking && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Update Booking Status</h2>
            <p style={s.modalSub}>
              Customer: <strong>{selectedBooking.user?.firstName} {selectedBooking.user?.lastName}</strong>
              <br />
              Current: <span style={{ ...s.statusBadge(selectedBooking.status), fontSize: '0.75rem' }}>{selectedBooking.status?.toUpperCase()}</span>
            </p>
            <label style={s.label}>New Status</label>
            <select style={s.modalSelect} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="picked-up">Picked Up</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div style={s.modalBtns}>
              <button onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
              <button onClick={updateStatus} style={s.saveBtn}>✓ Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
