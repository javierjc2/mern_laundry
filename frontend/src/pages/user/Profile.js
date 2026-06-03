import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '', address: user?.address || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile({ firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone, address: profileForm.address });
    if (result.success) {
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } else {
      setProfileMsg({ text: result.message || 'Update failed', type: 'error' });
    }
    setSaving(false);
    setTimeout(() => setProfileMsg({ text: '', type: '' }), 4000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match!', type: 'error' }); return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters', type: 'error' }); return;
    }
    setSaving(true);
    try {
      await axios.put('/api/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to change password', type: 'error' });
    }
    setSaving(false);
    setTimeout(() => setPasswordMsg({ text: '', type: '' }), 4000);
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
    navLink: { color: '#4a5568', textDecoration: 'none', fontWeight: 500 },
    logoutBtn: { padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg, #4D6F71 0%, #365456 100%)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Poppins' },
    content: { maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' },
    title: { color: 'white', fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' },
    subtitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' },
    avatar: { width: '100px', height: '100px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: '#4D6F71', margin: '0 auto 1rem', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' },
    tabs: { display: 'flex', gap: '0', marginBottom: '0', borderRadius: '15px 15px 0 0', overflow: 'hidden' },
    tab: (active) => ({ flex: 1, padding: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.95rem', background: active ? 'white' : 'rgba(255,255,255,0.3)', color: active ? '#4D6F71' : 'white', transition: 'all 0.3s' }),
    card: { background: 'rgba(255,255,255,0.97)', borderRadius: '0 0 15px 15px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
    formGroup: { marginBottom: '1.2rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem' },
    input: { width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '2px solid #e2e8f0', fontFamily: 'Poppins', fontSize: '0.95rem', boxSizing: 'border-box', transition: 'border 0.3s' },
    disabledInput: { width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '2px solid #e2e8f0', fontFamily: 'Poppins', fontSize: '0.95rem', boxSizing: 'border-box', background: '#f7fafc', color: '#718096' },
    submitBtn: { width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #4D6F71, #365456)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'Poppins', marginTop: '0.5rem' },
    alert: (type) => ({ padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500, background: type === 'success' ? '#c6f6d5' : '#fed7d7', color: type === 'success' ? '#276749' : '#9b2c2c', border: `1px solid ${type === 'success' ? '#9ae6b4' : '#fc8181'}` }),
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#2d3748', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' },
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.navbar}>
          <div style={s.logo}>IV's Laundry Service</div>
          <div style={s.navLinks}>
            <Link to="/services" style={s.navLink}>Services</Link>
            <Link to="/my-bookings" style={s.navLink}>My Bookings</Link>
            <Link to="/profile" style={{...s.navLink, color: '#4D6F71', fontWeight: 700}}>Profile</Link>
            <button onClick={handleLogout} style={s.logoutBtn}>Log Out</button>
          </div>
        </div>
      </header>

      <div style={s.content}>
        <div style={s.avatar}>
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </div>
        <h1 style={s.title}>{user?.firstName} {user?.lastName}</h1>
        <p style={s.subtitle}>{user?.email}</p>

        <div style={s.tabs}>
          <button style={s.tab(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>Edit Profile</button>
          <button style={s.tab(activeTab === 'password')} onClick={() => setActiveTab('password')}>Change Password</button>
        </div>

        <div style={s.card}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div style={s.sectionTitle}>Personal Information</div>
              {profileMsg.text && <div style={s.alert(profileMsg.type)}>{profileMsg.text}</div>}
              <div style={s.grid2}>
                <div style={s.formGroup}>
                  <label style={s.label}>First Name *</label>
                  <input style={s.input} value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} required />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Last Name *</label>
                  <input style={s.input} value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} required />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Email (cannot be changed)</label>
                <input style={s.disabledInput} value={profileForm.email} disabled />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Phone Number</label>
                <input style={s.input} value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Address</label>
                <textarea style={{...s.input, resize: 'vertical', minHeight: '80px'}} value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} />
              </div>
              <button type="submit" style={s.submitBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div style={s.sectionTitle}>Change Password</div>
              {passwordMsg.text && <div style={s.alert(passwordMsg.type)}>{passwordMsg.text}</div>}
              <div style={s.formGroup}>
                <label style={s.label}>Current Password *</label>
                <input type="password" style={s.input} value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>New Password *</label>
                <input type="password" style={s.input} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Confirm New Password *</label>
                <input type="password" style={s.input} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required />
              </div>
              <button type="submit" style={s.submitBtn} disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
