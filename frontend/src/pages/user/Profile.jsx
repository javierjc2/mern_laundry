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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4D6F71] to-[#365456] font-sans">
      <header className="bg-white/95 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.1)] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center px-8 py-5 gap-4">
          <div className="text-2xl font-bold bg-gradient-to-br from-[#4D6F71] to-[#365456] bg-clip-text text-transparent">IV's Laundry Service</div>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/services" className="text-gray-600 font-semibold text-[0.95rem] transition-colors hover:text-primary">Services</Link>
            <Link to="/my-bookings" className="text-gray-600 font-semibold text-[0.95rem] transition-colors hover:text-primary">My Bookings</Link>
            <Link to="/profile" className="text-primary font-bold text-[0.95rem] transition-colors hover:text-primary-light">Profile</Link>
            <button onClick={handleLogout} className="px-6 py-2 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white border-none rounded-[25px] cursor-pointer font-semibold text-sm transition-all duration-300 hover:shadow-[0_4px_15px_rgba(0,0,0,0.25)]">Log Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-8 py-12">
        <div className="w-[100px] h-[100px] rounded-full bg-white flex items-center justify-center text-4xl font-bold text-[#4D6F71] mx-auto mb-4 shadow-[0_5px_20px_rgba(0,0,0,0.2)]">
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </div>
        <h1 className="text-white text-4xl font-bold mb-2 text-center">{user?.firstName} {user?.lastName}</h1>
        <p className="text-white/80 text-center mb-8 text-[0.95rem]">{user?.email}</p>

        <div className="flex mb-0 rounded-t-[15px] overflow-hidden">
          <button 
            className={`flex-1 py-4 border-none cursor-pointer font-bold text-sm transition-all duration-300 ${
              activeTab === 'profile' 
                ? 'bg-white text-[#4D6F71]' 
                : 'bg-white/30 text-white hover:bg-white/40'
            }`} 
            onClick={() => setActiveTab('profile')}
          >
            Edit Profile
          </button>
          <button 
            className={`flex-1 py-4 border-none cursor-pointer font-bold text-sm transition-all duration-300 ${
              activeTab === 'password' 
                ? 'bg-white text-[#4D6F71]' 
                : 'bg-white/30 text-white hover:bg-white/40'
            }`} 
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>

        <div className="bg-white/97 backdrop-blur-sm rounded-b-[15px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="text-lg font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-100">Personal Information</div>
              {profileMsg.text && (
                <div className={`p-4 rounded-lg mb-4 font-semibold text-sm border ${
                  profileMsg.type === 'success' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {profileMsg.text}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="mb-5 text-left">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">First Name *</label>
                  <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} required />
                </div>
                <div className="mb-5 text-left">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">Last Name *</label>
                  <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} required />
                </div>
              </div>
              <div className="mb-5 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Email (cannot be changed)</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-sans bg-gray-50 text-gray-400 cursor-not-allowed" value={profileForm.email} disabled />
              </div>
              <div className="mb-5 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Phone Number</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
              </div>
              <div className="mb-5 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Address</label>
                <textarea className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans resize-y min-h-[80px]" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white font-bold rounded-xl transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:pointer-events-none mt-2" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="text-lg font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-100">Change Password</div>
              {passwordMsg.text && (
                <div className={`p-4 rounded-lg mb-4 font-semibold text-sm border ${
                  passwordMsg.type === 'success' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {passwordMsg.text}
                </div>
              )}
              <div className="mb-5 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Current Password *</label>
                <input type="password" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required />
              </div>
              <div className="mb-5 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">New Password *</label>
                <input type="password" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required />
              </div>
              <div className="mb-5 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Confirm New Password *</label>
                <input type="password" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required />
              </div>
              <button type="submit" className="w-full py-4 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white font-bold rounded-xl transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:pointer-events-none mt-2" disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

