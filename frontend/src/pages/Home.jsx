import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI } from '../utils/api';
import './Home.css';

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
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (user) {
      navigate(user.accountType === 'admin' ? '/admin' : '/services');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <header>
        <div className="navbar">
          <div className="logo">IV's Laundry Service</div>
          <nav>
            <a href="#services">Services</a>
            <a href="#rates">Rates</a>
            <a href="#contact">Contact Us</a>
          </nav>
          {user ? (
            <Link to={user.accountType === 'admin' ? '/admin' : '/services'}>
              <button className="sign-in">Dashboard</button>
            </Link>
          ) : (
            <Link to="/login">
              <button className="sign-in">Sign In</button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-container">
        <div className="hero-content">
          <h1>Premium Laundry Service for Your Busy Lifestyle.</h1>
          <p>We handle the dirty work so you can enjoy the clean moments.</p>
          <button className="book-now" onClick={handleBookNow}>
            Book Now
          </button>
        </div>
        <div className="hero-image-placeholder">
          <div className="placeholder-icon">🧺</div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <h1>Services</h1>
        <div className="service-grid">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="no-services">
              <p>No services available at the moment.</p>
            </div>
          ) : (
            services.map((service) => (
              <div key={service._id} className="service-card">
                <div className="icon-container">
                  <div className="service-icon">🧼</div>
                </div>
                <div className="text-container">
                  <div className="service-title">
                    <span>{service.name}</span>
                    <div className="line"></div>
                  </div>
                  <p>{service.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Rates Section */}
      <section id="rates" className="rates">
        <h1>Our Rates</h1>
        <p>Competitive pricing for premium laundry services.</p>
        <table>
          <tbody>
            <tr>
              <th>Service</th>
              <th>Price</th>
            </tr>
            {loading ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner" style={{ width: '30px', height: '30px' }}></div>
                  <p style={{ marginTop: '10px' }}>Loading rates...</p>
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '30px' }}>
                  No rates available at the moment.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service._id}>
                  <th>{service.name}</th>
                  <td>₱{parseFloat(service.price).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <h1>Contact Us</h1>
        <div className="contact-grid">
          <div className="contact-card">
            <div className="icon-container">
              <div className="contact-icon">📞</div>
            </div>
            <div className="text-container">
              <div className="contact-title">
                <span>Contact Numbers</span>
                <div className="line"></div>
              </div>
              <p>09620457958<br />09308017443</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="icon-container">
              <div className="contact-icon">📍</div>
            </div>
            <div className="text-container">
              <div className="contact-title">
                <span>Address</span>
                <div className="line"></div>
              </div>
              <p>Phase 6, BLK 142 Lot 5, San Pedro, Laguna</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="icon-container">
              <div className="contact-icon">⏰</div>
            </div>
            <div className="text-container">
              <div className="contact-title">
                <span>Business Hours</span>
                <div className="line"></div>
              </div>
              <p>8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
