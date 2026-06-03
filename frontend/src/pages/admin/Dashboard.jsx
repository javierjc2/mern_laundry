import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#d7ebed] font-sans text-primary">
      <header className="bg-white/90 backdrop-blur sticky top-0 z-50 shadow-[0_2px_10px_rgba(48,84,87,0.1)]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center px-8 py-5 md:px-20 gap-4">
          <div className="font-bold text-2xl text-primary">IV's Laundry Service</div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-[30px]">
            <Link to="/admin" className="bg-gradient-to-br from-primary to-primary-light text-white font-medium text-base px-5 py-2 rounded-full">Dashboard</Link>
            <Link to="/admin/bookings" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Records</Link>
            <button onClick={handleLogout} className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Log Out</button>
          </div>
        </div>
      </header>

      <section id="services" className="px-8 py-20 md:px-20 text-center min-h-[calc(100vh-84px)] flex flex-col justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-12 md:mb-16">Welcome, Admin!</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-[1200px] mx-auto w-full">
          <Link to="/admin/services" className="group relative overflow-hidden bg-gradient-to-br from-white to-[#f0f9fa] py-12 px-10 rounded-[30px] shadow-[0_15px_40px_rgba(48,84,87,0.15)] hover:shadow-[0_25px_60px_rgba(48,84,87,0.3)] hover:-translate-y-3 hover:border-primary border-3 border-transparent transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] cursor-pointer animate-[fadeInUp_0.6s_ease_forwards] delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
            <div className="mb-8 relative z-10">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary tracking-[2px] mb-4 block group-hover:text-white transition-colors duration-500">SERVICES</span>
                <div className="w-20 h-1 bg-gradient-to-br from-primary to-primary-light rounded-full group-hover:bg-white transition-colors duration-500"></div>
              </div>
            </div>
            <div className="flex justify-center items-center relative z-10">
              <img src="/icons/shirt.png" alt="Services Icon" className="w-28 h-28 object-contain group-hover:brightness-0 group-hover:invert transition-all duration-500" />
            </div>
          </Link>

          <Link to="/admin/bookings" className="group relative overflow-hidden bg-gradient-to-br from-white to-[#f0f9fa] py-12 px-10 rounded-[30px] shadow-[0_15px_40px_rgba(48,84,87,0.15)] hover:shadow-[0_25px_60px_rgba(48,84,87,0.3)] hover:-translate-y-3 hover:border-primary border-3 border-transparent transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] cursor-pointer animate-[fadeInUp_0.6s_ease_forwards] delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
            <div className="mb-8 relative z-10">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary tracking-[2px] mb-4 block group-hover:text-white transition-colors duration-500">RECORDS</span>
                <div className="w-20 h-1 bg-gradient-to-br from-primary to-primary-light rounded-full group-hover:bg-white transition-colors duration-500"></div>
              </div>
            </div>
            <div className="flex justify-center items-center relative z-10">
              <img src="/icons/record.png" alt="Records Icon" className="w-28 h-28 object-contain group-hover:brightness-0 group-hover:invert transition-all duration-500" />
            </div>
          </Link>

          <Link to="/admin/customers" className="group relative overflow-hidden bg-gradient-to-br from-white to-[#f0f9fa] py-12 px-10 rounded-[30px] shadow-[0_15px_40px_rgba(48,84,87,0.15)] hover:shadow-[0_25px_60px_rgba(48,84,87,0.3)] hover:-translate-y-3 hover:border-primary border-3 border-transparent transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] cursor-pointer animate-[fadeInUp_0.6s_ease_forwards] delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
            <div className="mb-8 relative z-10">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary tracking-[2px] mb-4 block group-hover:text-white transition-colors duration-500">USERS</span>
                <div className="w-20 h-1 bg-gradient-to-br from-primary to-primary-light rounded-full group-hover:bg-white transition-colors duration-500"></div>
              </div>
            </div>
            <div className="flex justify-center items-center relative z-10">
              <img src="/icons/customer.png" alt="Customers Icon" className="w-28 h-28 object-contain group-hover:brightness-0 group-hover:invert transition-all duration-500" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
