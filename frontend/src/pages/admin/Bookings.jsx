import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadBookings(); }, []);

  useEffect(() => {
    let result = [...bookings];
    if (search) {
      result = result.filter(b => {
        const name = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
        return (
          name.includes(search.toLowerCase()) ||
          b.user?.email?.toLowerCase().includes(search.toLowerCase())
        );
      });
    }
    if (filterStatus) result = result.filter(b => b.status === filterStatus);
    setFiltered(result);
  }, [search, filterStatus, bookings]);

  const loadBookings = async () => {
    try {
      const res = await axios.get('/api/admin/bookings');
      setBookings(res.data);
      setFiltered(res.data);
    } catch (err) {
      alert('Error loading bookings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setShowModal(true);
  };

  const updateStatus = async () => {
    try {
      const serviceIds = selectedBooking.services.map(s => s._id || s);

      await axios.put(`/api/admin/bookings/${selectedBooking._id}`, {
        user: selectedBooking.user?._id || selectedBooking.user,
        services: serviceIds,
        pickupDate: selectedBooking.pickupDate,
        deliveryDate: selectedBooking.deliveryDate,
        pickupAddress: selectedBooking.pickupAddress,
        totalPrice: selectedBooking.totalPrice,
        notes: selectedBooking.notes,
        status: newStatus
      });

      alert('Status updated successfully!');
      setShowModal(false);
      loadBookings();
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) { logout(); navigate('/login'); }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'pending': 'bg-amber-100 text-amber-800 border-amber-200',
      'picked-up': 'bg-blue-100 text-blue-800 border-blue-200',
      'processing': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'ready': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4D6F71] to-[#365456] font-sans text-gray-800">
      <header className="bg-white/95 backdrop-blur sticky top-0 z-50 shadow-md">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center px-8 py-5 md:px-20 gap-4">
          <div className="font-bold text-2xl text-primary">IV's Laundry Service</div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-[30px]">
            <Link to="/admin" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Dashboard</Link>
            <Link to="/admin/services" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Services</Link>
            <Link to="/admin/bookings" className="bg-gradient-to-br from-primary to-primary-light text-white font-medium text-base px-5 py-2 rounded-full">Records</Link>
            <Link to="/admin/customers" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Users</Link>
            <button onClick={handleLogout} className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Log Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 py-10 md:px-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">📋 Booking Records</h1>

        {/* Filters */}
        <div className="bg-white/95 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row gap-4 flex-wrap items-center shadow-lg">
          <input 
            className="w-full sm:flex-1 min-w-[200px] px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:border-primary transition-colors" 
            placeholder="🔍 Search by customer name or email..."
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          <select 
            className="w-full sm:w-auto min-w-[160px] px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:border-primary transition-colors" 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="picked-up">Picked Up</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button 
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-300" 
            onClick={() => { setSearch(''); setFilterStatus(''); }}
          >
            Clear
          </button>
          <span className="text-sm font-semibold text-gray-500">
            {filtered.length} of {bookings.length} records
          </span>
        </div>

        {loading ? (
          <div className="text-center text-white py-16 text-lg font-medium">
            Loading records...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-br from-primary to-[#365456] text-white text-left">
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">#</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Customer</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Services</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Pickup Date</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Delivery Date</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Address</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Total</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Status</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                ) : filtered.map((b, i) => (
                  <tr key={b._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4.5 text-sm md:text-base text-gray-600">{i + 1}</td>
                    <td className="px-6 py-4.5 text-sm md:text-base">
                      <div className="font-semibold text-gray-800">{b.user?.firstName} {b.user?.lastName}</div>
                      <div className="text-xs text-gray-500">{b.user?.email}</div>
                      <div className="text-xs text-gray-500">{b.user?.phone}</div>
                    </td>
                    <td className="px-6 py-4.5 text-sm md:text-base">
                      <div className="flex flex-wrap gap-1">
                        {b.services?.map(sv => (
                          <span key={sv._id} className="px-2 py-0.5 bg-gradient-to-br from-primary to-[#365456] text-white rounded-full text-[11px] font-semibold">
                            {sv.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-sm md:text-base text-gray-700">{formatDate(b.pickupDate)}</td>
                    <td className="px-6 py-4.5 text-sm md:text-base text-gray-700">{formatDate(b.deliveryDate)}</td>
                    <td className="px-6 py-4.5 text-sm md:text-base text-gray-600">
                      <div className="max-w-[140px] break-words text-xs">{b.pickupAddress}</div>
                    </td>
                    <td className="px-6 py-4.5 text-sm md:text-base font-bold text-primary">
                      ₱{parseFloat(b.totalPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4.5 text-sm md:text-base">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border inline-block whitespace-nowrap uppercase ${getStatusBadgeClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-sm md:text-base">
                      <button onClick={() => openStatusModal(b)} className="px-4 py-2 bg-gradient-to-br from-primary to-[#365456] text-white rounded-lg font-semibold text-xs transition-all hover:-translate-y-0.5 shadow-md">
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-[90%] shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Update Booking Status</h2>
            <div className="text-sm text-gray-500 mb-6 leading-relaxed">
              Customer: <strong className="text-gray-700">{selectedBooking.user?.firstName} {selectedBooking.user?.lastName}</strong>
              <br />
              Current Status: <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold border inline-block whitespace-nowrap uppercase ml-1 ${getStatusBadgeClass(selectedBooking.status)}`}>{selectedBooking.status}</span>
            </div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">New Status</label>
            <select 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:border-primary transition-colors mb-6" 
              value={newStatus} 
              onChange={e => setNewStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="picked-up">Picked Up</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={updateStatus} className="px-6 py-3 bg-gradient-to-br from-primary to-[#365456] text-white rounded-lg font-semibold text-sm cursor-pointer transition-all hover:-translate-y-0.5 shadow-md">
                ✓ Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;

