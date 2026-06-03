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
      await axios.post('/api/bookings', {
        user: user.id,
        services: selectedServiceIds,
        pickupDate: pickupDateTime.toISOString(),
        deliveryDate: deliveryDateTime.toISOString(),
        pickupAddress: form.pickupAddress,
        totalPrice: getTotal(),
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

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-[#4D6F71] to-[#365456] font-sans">
      <header className="bg-white/95 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.1)] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center px-8 py-5 gap-4">
          <div className="text-2xl font-bold bg-gradient-to-br from-[#4D6F71] to-[#365456] bg-clip-text text-transparent">IV's Laundry Service</div>
        </div>
      </header>
      <div className="max-w-[800px] mx-auto px-8 py-12">
        <div className="bg-white rounded-[20px] p-12 text-center shadow-[0_10px_30px_rgba(0,0,0,0.15)] max-w-lg mx-auto">
          <div className="text-[80px] mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-primary mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your laundry booking has been successfully created.<br />
            We'll pick up your laundry on the scheduled date.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/my-bookings')} className="px-8 py-3 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white font-bold rounded-[25px] transition-all duration-300 hover:shadow-[0_4px_15px_rgba(0,0,0,0.25)]">View My Bookings</button>
            <button onClick={() => { setSuccess(false); setSelectedServiceIds([]); }} className="px-8 py-3 bg-gray-100 text-[#4D6F71] font-bold rounded-[25px] border-2 border-[#4D6F71]/10 transition-all duration-300 hover:bg-gray-200">Book Again</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4D6F71] to-[#365456] font-sans">
      <header className="bg-white/95 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.1)] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center px-8 py-5 gap-4">
          <div className="text-2xl font-bold bg-gradient-to-br from-[#4D6F71] to-[#365456] bg-clip-text text-transparent">IV's Laundry Service</div>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/services" className="text-gray-600 font-semibold text-[0.95rem] transition-colors hover:text-primary">Services</Link>
            <Link to="/my-bookings" className="text-gray-600 font-semibold text-[0.95rem] transition-colors hover:text-primary">My Bookings</Link>
            <Link to="/profile" className="text-gray-600 font-semibold text-[0.95rem] transition-colors hover:text-primary">Profile</Link>
            <button onClick={handleLogout} className="px-6 py-2 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white border-none rounded-[25px] cursor-pointer font-semibold text-sm transition-all duration-300 hover:shadow-[0_4px_15px_rgba(0,0,0,0.25)]">Log Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-8 py-12">
        <h1 className="text-white text-4xl font-bold mb-8 text-center">Create Booking</h1>
        <form onSubmit={handleSubmit}>

          {/* Services */}
          <div className="bg-white/97 backdrop-blur-sm rounded-[20px] p-8 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
            <div className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b-2 border-gray-100">Select Services *</div>
            {services.length === 0 ? (
              <p className="text-gray-500 font-medium animate-pulse">Loading services...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map(sv => {
                  const sel = selectedServiceIds.includes(sv._id);
                  return (
                    <div
                      key={sv._id}
                      className={`p-3.5 border-2 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-between ${sel
                        ? 'border-primary bg-gradient-to-br from-[#4D6F71] to-[#365456]'
                        : 'border-gray-200 bg-white hover:border-primary'
                        }`}
                      onClick={() => toggleService(sv._id)}
                    >
                      <div className="flex-1 pr-2">
                        <div className={`font-bold text-sm leading-tight ${sel ? 'text-white' : 'text-gray-800'}`}>{sv.name}</div>
                        <div className={`text-xs mt-1 font-semibold ${sel ? 'text-white/80' : 'text-primary'}`}>₱{parseFloat(sv.price).toFixed(2)}</div>
                      </div>
                      {sel && <span className="text-white font-bold text-lg pl-1">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
            {selectedServiceIds.length > 0 && (
              <div className="bg-gradient-to-br from-[#4D6F71] to-[#365456] rounded-xl p-4 text-white flex justify-between items-center mt-5">
                <span className="font-semibold text-sm">{selectedServiceIds.length} service(s) selected</span>
                <span className="text-xl font-bold">Total: ₱{getTotal().toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="bg-white/97 backdrop-blur-sm rounded-[20px] p-8 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
            <div className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b-2 border-gray-100">Schedule</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mb-4 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Pickup Date *</label>
                <input type="date" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={form.pickupDate}
                  onChange={e => setForm({ ...form, pickupDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="mb-4 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Pickup Time</label>
                <input type="time" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={form.pickupTime}
                  onChange={e => setForm({ ...form, pickupTime: e.target.value })} />
              </div>
              <div className="mb-4 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Delivery Date *</label>
                <input type="date" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={form.deliveryDate}
                  onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                  min={form.pickupDate || new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="mb-4 text-left">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Delivery Time</label>
                <input type="time" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans" value={form.deliveryTime}
                  onChange={e => setForm({ ...form, deliveryTime: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Address & Notes */}
          <div className="bg-white/97 backdrop-blur-sm rounded-[20px] p-8 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
            <div className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b-2 border-gray-100">Address & Notes</div>
            <div className="mb-4 text-left">
              <label className="block mb-2 font-semibold text-gray-700 text-sm">Pickup Address *</label>
              <textarea className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans resize-y min-h-[80px]"
                value={form.pickupAddress}
                onChange={e => setForm({ ...form, pickupAddress: e.target.value })}
                required placeholder="Enter your complete address" />
            </div>
            <div className="mb-4 text-left">
              <label className="block mb-2 font-semibold text-gray-700 text-sm">Additional Notes (Optional)</label>
              <textarea className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary font-sans resize-y min-h-[80px]"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions..." />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white font-bold rounded-xl transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:pointer-events-none" disabled={loading}>
            {loading ? 'Creating Booking...' : '✓ Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Booking;

