import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    accountType: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate(result.user.accountType === 'admin' ? '/admin' : '/services');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#d7ebed] font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-[20px] shadow-[0_15px_40px_rgba(48,84,87,0.15)]">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-center text-primary mb-2">Create Account</h1>
          <p className="text-center text-primary-light text-sm mb-8 font-medium">Join IV's Laundry Service today</p>
          
          {error && <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-700 text-sm font-medium border border-red-200">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-4">
              <div className="text-left flex-1">
                <label className="block mb-1.5 font-medium text-xs text-primary">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border-2 border-[#d7ebed] rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans"
                />
              </div>
              <div className="text-left flex-1">
                <label className="block mb-1.5 font-medium text-xs text-primary">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border-2 border-[#d7ebed] rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans"
                />
              </div>
            </div>

            <div className="mb-4 text-left">
              <label className="block mb-1.5 font-medium text-xs text-primary">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-[#d7ebed] rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <div className="mb-4 text-left">
              <label className="block mb-1.5 font-medium text-xs text-primary">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-[#d7ebed] rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <div className="mb-4 text-left">
              <label className="block mb-1.5 font-medium text-xs text-primary">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border-2 border-[#d7ebed] rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans resize-y"
              />
            </div>

            <div className="mb-4 text-left">
              <label className="block mb-1.5 font-medium text-xs text-primary">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-[#d7ebed] rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <div className="mb-6 text-left">
              <label className="block mb-1.5 font-medium text-xs text-primary">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-[#d7ebed] rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-lg transition-all duration-300 shadow-[0_5px_15px_rgba(48,84,87,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(48,84,87,0.4)] disabled:opacity-50 disabled:pointer-events-none" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-primary-light mt-6 font-medium">
            Already have an account? <Link to="/login" className="text-primary hover:text-primary-light font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
