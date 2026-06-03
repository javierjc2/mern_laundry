import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="admin-dashboard-page">
      <header>
        <div className="navbar">
          <div className="logo">IV's Laundry Service</div>
          <div className="nav-links">
            <Link to="/admin" className="active">Dashboard</Link>
            <Link to="/admin/bookings">Records</Link>
            <button onClick={handleLogout} className="logout-btn">Log Out</button>
          </div>
        </div>
      </header>

      <section id="services" className="services">
        <h1>Welcome, Admin!</h1>

        <div className="service-grid">
          <Link to="/admin/services" className="service-card">
            <div className="text-container">
              <div className="service-title">
                <span>SERVICES</span>
                <div className="line"></div>
              </div>
            </div>
            <div className="icon-container">
              <img src="/icons/shirt.png" alt="Services Icon" />
            </div>
          </Link>

          <Link to="/admin/bookings" className="service-card">
            <div className="text-container">
              <div className="service-title">
                <span>RECORDS</span>
                <div className="line"></div>
              </div>
            </div>
            <div className="icon-container">
              <img src="/icons/record.png" alt="Records Icon" />
            </div>
          </Link>

          <Link to="/admin/customers" className="service-card">
            <div className="text-container">
              <div className="service-title">
                <span>USERS</span>
                <div className="line"></div>
              </div>
            </div>
            <div className="icon-container">
              <img src="/icons/customer.png" alt="Customers Icon" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
