import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadCustomers(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(customers); return; }
    const q = search.toLowerCase();
    setFiltered(customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    ));
  }, [search, customers]);

  const loadCustomers = async () => {
    try {
      const res = await axios.get('/api/admin/users?accountType=customer');
      setCustomers(res.data);
      setFiltered(res.data);
    } catch (err) {
      alert('Error loading customers');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setForm({ firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone || '', address: customer.address || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${editingCustomer._id}`, form);
      alert('Customer updated successfully!');
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      alert('Customer deleted successfully!');
      loadCustomers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) { logout(); navigate('/login'); }
  };

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
    filterBox: { background: 'rgba(255,255,255,0.95)', borderRadius: '15px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' },
    input: { padding: '0.6rem 1rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontFamily: 'Poppins', fontSize: '0.9rem', flex: 1, minWidth: '250px' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.95)', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
    th: { padding: '1rem', textAlign: 'left', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', color: 'white', fontWeight: 600 },
    td: { padding: '1rem', borderBottom: '1px solid #e2e8f0' },
    editBtn: { padding: '6px 14px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontFamily: 'Poppins' },
    deleteBtn: { padding: '6px 14px', background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Poppins' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { background: 'white', borderRadius: '15px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { fontSize: '1.5rem', color: '#2d3748', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem' },
    formInput: { width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontFamily: 'Poppins', fontSize: '0.9rem', boxSizing: 'border-box' },
    modalBtns: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
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
            <Link to="/admin/bookings" style={s.navLink}>Records</Link>
            <Link to="/admin/customers" style={{...s.navLink, color: '#4D6F71', fontWeight: 700}}>Users</Link>
            <button onClick={handleLogout} style={s.logoutBtn}>Log Out</button>
          </div>
        </div>
      </header>

      <div style={s.content}>
        <h1 style={s.title}>Customer Management</h1>

        <div style={s.filterBox}>
          <input style={s.input} placeholder="🔍 Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ color: '#4a5568', fontSize: '0.9rem', fontWeight: 600 }}>Total: {filtered.length} customers</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '3rem' }}>Loading customers...</div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '15px' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Phone</th>
                  <th style={s.th}>Address</th>
                  <th style={s.th}>Joined</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" style={{ ...s.td, textAlign: 'center', padding: '3rem', color: '#4a5568' }}>No customers found.</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c._id} style={{ background: i % 2 === 0 ? 'white' : '#f7fafc' }}>
                    <td style={s.td}>{i + 1}</td>
                    <td style={s.td}><strong>{c.firstName} {c.lastName}</strong></td>
                    <td style={s.td}>{c.email}</td>
                    <td style={s.td}>{c.phone || 'N/A'}</td>
                    <td style={s.td}>{c.address || 'N/A'}</td>
                    <td style={s.td}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={s.td}>
                      <button onClick={() => openEdit(c)} style={s.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(c._id)} style={s.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Edit Customer</h2>
            <form onSubmit={handleSubmit}>
              {[['firstName', 'First Name'], ['lastName', 'Last Name'], ['email', 'Email'], ['phone', 'Phone'], ['address', 'Address']].map(([field, label]) => (
                <div key={field} style={s.formGroup}>
                  <label style={s.label}>{label}</label>
                  <input style={s.formInput} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={['firstName', 'lastName', 'email'].includes(field)} />
                </div>
              ))}
              <div style={s.modalBtns}>
                <button type="button" onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
                <button type="submit" style={s.saveBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
