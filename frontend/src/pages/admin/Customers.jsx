import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadCustomers(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(customers); return; }
    const q = search.toLowerCase();
    setFiltered(customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    ));
  }, [search, customers]);

  const loadCustomers = async () => {
    try {
      const res = await axios.get('/api/admin/users?accountType=customer');
      setCustomers(res.data);
      setFiltered(res.data);
    } catch (err) {
      alert('Error loading customers');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setForm({ firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone || '', address: customer.address || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${editingCustomer._id}`, form);
      alert('Customer updated successfully!');
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      alert('Customer deleted successfully!');
      loadCustomers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) { logout(); navigate('/login'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4D6F71] to-[#365456] font-sans text-gray-800">
      <header className="bg-white/95 backdrop-blur sticky top-0 z-50 shadow-md">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center px-8 py-5 md:px-20 gap-4">
          <div className="font-bold text-2xl text-primary">IV's Laundry Service</div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-[30px]">
            <Link to="/admin" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Dashboard</Link>
            <Link to="/admin/services" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Services</Link>
            <Link to="/admin/bookings" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Records</Link>
            <Link to="/admin/customers" className="bg-gradient-to-br from-primary to-primary-light text-white font-medium text-base px-5 py-2 rounded-full">Users</Link>
            <button onClick={handleLogout} className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Log Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 py-10 md:px-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Customer Management</h1>

        <div className="bg-white/95 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-lg">
          <input 
            className="w-full sm:flex-1 min-w-[250px] px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:border-primary transition-colors" 
            placeholder="🔍 Search by name, email or phone..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          <div className="text-sm font-semibold text-gray-500">Total: {filtered.length} customers</div>
        </div>

        {loading ? (
          <div className="text-center text-white py-16 text-lg font-medium">Loading customers...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-br from-primary to-[#365456] text-white text-left">
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">#</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Name</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Email</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Phone</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Address</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Joined</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No customers found.</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4.5 text-sm md:text-base text-gray-600">{i + 1}</td>
                    <td className="px-6 py-4.5 text-sm md:text-base font-semibold text-gray-800">{c.firstName} {c.lastName}</td>
                    <td className="px-6 py-4.5 text-sm md:text-base text-gray-700">{c.email}</td>
                    <td className="px-6 py-4.5 text-sm md:text-base text-gray-700">{c.phone || 'N/A'}</td>
                    <td className="px-6 py-4.5 text-sm md:text-base text-gray-600">{c.address || 'N/A'}</td>
                    <td className="px-6 py-4.5 text-sm md:text-base text-gray-700">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4.5 text-sm md:text-base">
                      <button onClick={() => openEdit(c)} className="px-4 py-2 bg-green-500 text-white rounded-md font-semibold text-xs mr-2 transition-colors hover:bg-green-600">Edit</button>
                      <button onClick={() => handleDelete(c._id)} className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold text-xs transition-colors hover:bg-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-[90%] shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b-2 border-gray-100">Edit Customer</h2>
            <form onSubmit={handleSubmit}>
              {[['firstName', 'First Name'], ['lastName', 'Last Name'], ['email', 'Email'], ['phone', 'Phone'], ['address', 'Address']].map(([field, label]) => (
                <div key={field} className="mb-5 text-left">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">{label}</label>
                  <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:border-primary transition-colors" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={['firstName', 'lastName', 'email'].includes(field)} />
                </div>
              ))}
              <div className="flex gap-4 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-br from-primary to-[#365456] text-white rounded-lg font-semibold text-sm cursor-pointer transition-all hover:-translate-y-0.5 shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;

