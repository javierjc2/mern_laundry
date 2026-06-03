import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI } from '../utils/api';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      loadServicesComplete();
    }
  };

  const loadServicesComplete = () => {
    setLoading(false);
  };

  const handleBookNow = () => {
    if (user) {
      navigate(user.accountType === 'admin' ? '/admin' : '/services');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#d7ebed] font-sans text-primary">
      {/* Navbar */}
      <header className="bg-transparent py-5">
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 md:px-20 max-w-[1400px] mx-auto gap-4">
          <div className="font-bold text-2xl text-primary">IV's Laundry Service</div>
          <nav className="flex gap-[30px] items-center">
            <a href="#services" className="no-underline text-primary font-medium transition-colors duration-300 hover:text-primary-light">Services</a>
            <a href="#rates" className="no-underline text-primary font-medium transition-colors duration-300 hover:text-primary-light">Rates</a>
            <a href="#contact" className="no-underline text-primary font-medium transition-colors duration-300 hover:text-primary-light">Contact Us</a>
          </nav>
          {user ? (
            <Link to={user.accountType === 'admin' ? '/admin' : '/services'}>
              <button className="px-10 py-3 bg-gradient-to-r from-primary to-primary-light text-white border-none rounded-[30px] cursor-pointer font-semibold text-sm transition-all duration-300 shadow-[0_5px_15px_rgba(48,84,87,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(48,84,87,0.4)]">Dashboard</button>
            </Link>
          ) : (
            <Link to="/login">
              <button className="px-10 py-3 bg-gradient-to-r from-primary to-primary-light text-white border-none rounded-[30px] cursor-pointer font-semibold text-sm transition-all duration-300 shadow-[0_5px_15px_rgba(48,84,87,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(48,84,87,0.4)]">Sign In</button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row justify-between items-center py-10 md:py-20 px-6 md:px-20 max-w-[1400px] mx-auto gap-[60px]">
        <div className="flex-1 max-w-[600px] text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-5 leading-tight">Premium Laundry Service for Your Busy Lifestyle.</h1>
          <p className="text-lg text-primary mb-[30px] leading-relaxed">We handle the dirty work so you can enjoy the clean moments.</p>
          <button className="px-[50px] py-4 bg-gradient-to-r from-primary to-primary-light text-white border-none rounded-[30px] cursor-pointer font-bold text-base transition-all duration-300 shadow-[0_5px_15px_rgba(48,84,87,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(48,84,87,0.4)]" onClick={handleBookNow}>
            Book Now
          </button>
        </div>
        <div className="flex-1 w-full max-w-[500px] h-[350px] sm:h-[400px] bg-gradient-to-br from-[#f0f9fa] to-[#d7ebed] rounded-[20px] flex justify-center items-center shadow-[0_15px_30px_rgba(48,84,87,0.1)]">
          <div className="text-[120px]">🧺</div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 md:px-20 bg-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-[60px]">Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="text-center py-[60px] px-5 col-span-full text-primary">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-[60px] px-5 col-span-full text-primary">
              <p>No services available at the moment.</p>
            </div>
          ) : (
            services.map((service) => (
              <div key={service._id} className="bg-gradient-to-br from-white to-[#f0f9fa] p-10 rounded-[20px] shadow-[0_10px_30px_rgba(48,84,87,0.1)] border-2 border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(48,84,87,0.2)] hover:border-primary flex flex-col items-center">
                <div className="mb-5">
                  <div className="text-[60px] mx-auto">🧼</div>
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center mb-[15px]">
                    <span className="text-2xl font-bold text-primary mb-2.5">{service.name}</span>
                    <div className="w-[60px] h-[3px] bg-gradient-to-r from-primary to-primary-light rounded-[2px]"></div>
                  </div>
                  <p className="text-[15px] text-primary leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Rates Section */}
      <section id="rates" className="py-20 px-6 md:px-20 bg-gradient-to-r from-white to-[#d7ebed] text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-5">Our Rates</h1>
        <p className="text-lg text-primary mb-10">Competitive pricing for premium laundry services.</p>
        <div className="overflow-x-auto w-full max-w-[800px] mx-auto rounded-[12px] shadow-[0_5px_15px_rgba(0,0,0,0.1)]">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-primary to-primary-light text-white">
                <th className="p-5 text-left font-semibold text-lg">Service</th>
                <th className="p-5 text-left font-semibold text-lg">Price</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="p-10 text-center border-b border-[#d7ebed]">
                    <div className="w-[30px] h-[30px] border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="mt-2 text-primary font-medium">Loading rates...</p>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="2" className="p-10 text-center border-b border-[#d7ebed] text-primary">
                    No rates available at the moment.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service._id} className="hover:bg-[#f8f9fa] transition-colors">
                    <th className="p-5 text-left border-b border-[#d7ebed] text-primary font-semibold">{service.name}</th>
                    <td className="p-5 text-left border-b border-[#d7ebed] text-primary font-medium">₱{parseFloat(service.price).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 md:px-20 bg-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-[60px]">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1400px] mx-auto">
          <div className="bg-gradient-to-br from-white to-[#f0f9fa] p-10 rounded-[20px] shadow-[0_10px_30px_rgba(48,84,87,0.1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(48,84,87,0.2)] flex flex-col items-center">
            <div className="mb-5">
              <div className="text-[60px]">📞</div>
            </div>
            <div>
              <div className="flex flex-col items-center mb-[15px]">
                <span className="text-xl font-bold text-primary mb-2.5">Contact Numbers</span>
                <div className="w-[60px] h-[3px] bg-gradient-to-r from-primary to-primary-light rounded-[2px]"></div>
              </div>
              <p className="text-[15px] text-primary leading-relaxed font-medium">09620457958<br />09308017443</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-[#f0f9fa] p-10 rounded-[20px] shadow-[0_10px_30px_rgba(48,84,87,0.1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(48,84,87,0.2)] flex flex-col items-center">
            <div className="mb-5">
              <div className="text-[60px]">📍</div>
            </div>
            <div>
              <div className="flex flex-col items-center mb-[15px]">
                <span className="text-xl font-bold text-primary mb-2.5">Address</span>
                <div className="w-[60px] h-[3px] bg-gradient-to-r from-primary to-primary-light rounded-[2px]"></div>
              </div>
              <p className="text-[15px] text-primary leading-relaxed font-medium">Phase 6, BLK 142 Lot 5, San Pedro, Laguna</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-[#f0f9fa] p-10 rounded-[20px] shadow-[0_10px_30px_rgba(48,84,87,0.1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(48,84,87,0.2)] flex flex-col items-center">
            <div className="mb-5">
              <div className="text-[60px]">⏰</div>
            </div>
            <div>
              <div className="flex flex-col items-center mb-[15px]">
                <span className="text-xl font-bold text-primary mb-2.5">Business Hours</span>
                <div className="w-[60px] h-[3px] bg-gradient-to-r from-primary to-primary-light rounded-[2px]"></div>
              </div>
              <p className="text-[15px] text-primary leading-relaxed font-medium">8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
