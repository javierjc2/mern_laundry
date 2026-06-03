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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4D6F71] to-[#365456] font-sans">
      <header className="bg-white/95 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.1)] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center px-8 py-5 gap-4">
          <div className="text-2xl font-bold bg-gradient-to-br from-[#4D6F71] to-[#365456] bg-clip-text text-transparent">IV's Laundry Service</div>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/services" className="text-primary font-bold text-[0.95rem] transition-colors hover:text-primary-light">Services</Link>
            <Link to="/my-bookings" className="text-gray-600 font-semibold text-[0.95rem] transition-colors hover:text-primary">My Bookings</Link>
            <Link to="/profile" className="text-gray-600 font-semibold text-[0.95rem] transition-colors hover:text-primary">Profile</Link>
            <button onClick={handleLogout} className="px-6 py-2 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white border-none rounded-[25px] cursor-pointer font-semibold text-sm transition-all duration-300 hover:shadow-[0_4px_15px_rgba(0,0,0,0.25)]">Log Out</button>
          </div>
        </div>
      </header>

      <div className={`max-w-[1200px] mx-auto px-8 py-12 ${selected.length > 0 ? 'pb-24' : 'pb-12'}`}>
        <h1 className="text-white text-4xl font-bold mb-2 text-center">Select Your Services</h1>
        <p className="text-white/80 text-center mb-8">Choose one or more laundry services you need</p>

        {loading ? (
          <div className="text-center text-white py-12 text-lg">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading services...
          </div>
        ) : services.length === 0 ? (
          <div className="text-center text-white py-12 text-lg">No services available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => {
              const isSelected = selected.includes(service._id);
              return (
                <div 
                  key={service._id} 
                  className={`rounded-[15px] p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between h-full ${
                    isSelected 
                      ? 'bg-gradient-to-br from-[#4D6F71] to-[#365456] border-2 border-white shadow-[0_15px_40px_rgba(0,0,0,0.3)] -translate-y-1' 
                      : 'bg-white/95 border-2 border-transparent shadow-[0_5px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(0,0,0,0.15)]'
                  }`}
                  onClick={() => toggleService(service._id)}
                >
                  <div>
                    {isSelected && <span className="float-right text-white text-xl font-bold">✓</span>}
                    <div className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-gray-800'}`}>{service.name}</div>
                    <div className={`text-sm mb-4 leading-relaxed ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>{service.description}</div>
                  </div>
                  <div className={`text-lg font-bold ${isSelected ? 'text-[#a0ecc4]' : 'text-primary'}`}>₱{parseFloat(service.price).toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur shadow-[0_-5px_20px_rgba(0,0,0,0.1)] px-8 py-4 flex justify-between items-center z-50">
          <div>
            <div className="text-lg font-bold text-gray-800">Total: ₱{getTotal().toFixed(2)}</div>
            <div className="text-xs text-gray-500 font-medium">{selected.length} service(s) selected</div>
          </div>
          <button onClick={handleProceed} className="px-10 py-3.5 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white border-none rounded-[25px] cursor-pointer font-bold text-[0.95rem] transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]">Proceed to Booking →</button>
        </div>
      )}
    </div>
  );
}

export default UserServices;
