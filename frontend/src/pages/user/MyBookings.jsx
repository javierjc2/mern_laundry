import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { loadBookings(); }, []);

    const loadBookings = async () => {
        try {
            const res = await axios.get('/api/bookings/my-bookings');
            setBookings(res.data);
        } catch (err) {
            console.error(err);
            alert('Error loading bookings: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await axios.patch(`/api/bookings/${id}/cancel`);
            alert('Booking cancelled successfully!');
            loadBookings();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) { logout(); navigate('/login'); }
    };

    const getStatusBadgeClass = (status) => {
        const map = {
            'pending': 'bg-amber-100 text-amber-800',
            'picked-up': 'bg-sky-100 text-sky-800',
            'processing': 'bg-cyan-100 text-cyan-800',
            'ready': 'bg-green-100 text-green-800',
            'delivered': 'bg-emerald-100 text-emerald-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return map[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#4D6F71] to-[#365456] font-sans">
            <header className="bg-white/95 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.1)] sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center px-8 py-5 gap-4">
                    <div className="text-2xl font-bold bg-gradient-to-br from-[#4D6F71] to-[#365456] bg-clip-text text-transparent">IV's Laundry Service</div>
                    <div className="flex flex-wrap items-center gap-6">
                        <Link to="/services" className="text-gray-600 font-semibold text-[0.95rem] transition-colors hover:text-primary">Services</Link>
                        <Link to="/my-bookings" className="text-primary font-bold text-[0.95rem] transition-colors hover:text-primary-light">My Bookings</Link>
                        <Link to="/profile" className="text-gray-600 font-semibold text-[0.95rem] transition-colors hover:text-primary">Profile</Link>
                        <button onClick={handleLogout} className="px-6 py-2 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white border-none rounded-[25px] cursor-pointer font-semibold text-sm transition-all duration-300 hover:shadow-[0_4px_15px_rgba(0,0,0,0.25)]">Log Out</button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1000px] mx-auto px-8 py-12">
                <h1 className="text-white text-4xl font-bold mb-6 text-center">My Bookings</h1>

                {/* Status Filters */}
                <div className="flex gap-2 mb-8 flex-wrap justify-center">
                    {['all', 'pending', 'picked-up', 'processing', 'ready', 'delivered', 'cancelled'].map(f => (
                        <button
                            key={f}
                            className={`px-5 py-2 rounded-full border-none cursor-pointer font-bold text-xs transition-all duration-300 ${filter === f
                                    ? 'bg-white text-[#4D6F71] shadow-sm'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center text-white py-12 text-lg">
                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        Loading your bookings...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white text-lg mb-6">
                            {filter === 'all' ? "You don't have any bookings yet." : `No ${filter} bookings found.`}
                        </p>
                        <button onClick={() => navigate('/services')} className="px-12 py-4 bg-white text-primary border-none rounded-[25px] cursor-pointer font-extrabold text-base mx-auto block shadow-lg transition-transform hover:-translate-y-0.5">📅 Book Now</button>
                    </div>
                ) : (
                    filtered.map(b => (
                        <div key={b._id} className="bg-white rounded-[15px] p-6 mb-6 shadow-[0_5px_20px_rgba(0,0,0,0.1)]">
                            <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-gray-100 flex-wrap gap-2">
                                <div>
                                    <div className="font-extrabold text-base text-gray-900 mb-1">
                                        Booking #{b._id.slice(-6).toUpperCase()}
                                    </div>
                                    <div className="text-xs text-gray-400 font-medium">
                                        Created: {new Date(b.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase ${getStatusBadgeClass(b.status)}`}>
                                    {b.status}
                                </span>
                            </div>

                            {/* Services */}
                            <div className="mb-4 text-left">
                                <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block mb-1">Services</span>
                                <div className="flex flex-wrap">
                                    {b.services?.map(sv => (
                                        <span key={sv._id} className="inline-block px-3 py-1 bg-gradient-to-br from-[#4D6F71] to-[#365456] text-white rounded-full text-[11px] font-semibold mr-1.5 mb-1.5">{sv.name}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-left">
                                <div>
                                    <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block mb-1">Pickup Date</span>
                                    <span className="text-sm text-gray-800 font-semibold">{formatDate(b.pickupDate)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block mb-1">Delivery Date</span>
                                    <span className="text-sm text-gray-800 font-semibold">{formatDate(b.deliveryDate)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block mb-1">Pickup Address</span>
                                    <span className="text-sm text-gray-850 font-semibold leading-snug break-words">{b.pickupAddress || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block mb-1">Total Price</span>
                                    <span className="text-base text-primary font-extrabold">
                                        ₱{parseFloat(b.totalPrice || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {b.notes && (
                                <div className="mb-4 text-left">
                                    <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block mb-1">Notes</span>
                                    <span className="text-sm text-gray-700 font-medium bg-gray-50 p-2 rounded-lg block border border-gray-100">{b.notes}</span>
                                </div>
                            )}

                            {b.status === 'pending' && (
                                <div className="text-right mt-2">
                                    <button onClick={() => handleCancel(b._id)} className="px-5 py-2 bg-red-500 text-white border-none rounded-lg cursor-pointer font-semibold text-sm transition-colors hover:bg-red-600">✕ Cancel Booking</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MyBookings;

