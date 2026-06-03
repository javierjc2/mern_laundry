import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate(result.user.accountType === 'admin' ? '/admin' : '/services');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#d7ebed] font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[20px] shadow-[0_15px_40px_rgba(48,84,87,0.15)]">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-center text-primary mb-2">Welcome Back</h1>
          <p className="text-center text-primary-light text-sm mb-8 font-medium">Sign in to continue to IV's Laundry Service</p>
          
          {error && <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-700 text-sm font-medium border border-red-200">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5 text-left">
              <label className="block mb-2 font-medium text-sm text-primary">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-[#d7ebed] rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <div className="mb-6 text-left">
              <label className="block mb-2 font-medium text-sm text-primary">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-[#d7ebed] rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-lg transition-all duration-300 shadow-[0_5px_15px_rgba(48,84,87,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(48,84,87,0.4)] disabled:opacity-50 disabled:pointer-events-none" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-primary-light mt-6 font-medium">
            Don't have an account? <Link to="/register" className="text-primary hover:text-primary-light font-semibold hover:underline">Sign Up</Link>
          </p>
          
          <p className="text-center text-sm text-primary-light mt-4 font-medium">
            <Link to="/" className="text-primary hover:text-primary-light font-semibold hover:underline">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
