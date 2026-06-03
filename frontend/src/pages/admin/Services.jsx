import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await axios.get('/api/admin/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin privileges required.');
        navigate('/login');
      } else {
        alert('Error loading services');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', price: '' });
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/services/${id}`);
      alert('Service deleted successfully');
      loadServices();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting service: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingService) {
        await axios.put(`/api/admin/services/${editingService._id}`, formData);
        alert('Service updated successfully');
      } else {
        await axios.post('/api/admin/services', formData);
        alert('Service created successfully');
      }
      
      setShowModal(false);
      loadServices();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#d7ebed] font-sans">
      <header className="bg-white/90 backdrop-blur sticky top-0 z-50 shadow-[0_2px_10px_rgba(48,84,87,0.1)]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center px-8 py-5 md:px-20 gap-4">
          <div className="font-bold text-2xl text-primary">IV's Laundry Service</div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-[30px]">
            <Link to="/admin" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Dashboard</Link>
            <Link to="/admin/services" className="bg-gradient-to-br from-primary to-primary-light text-white font-medium text-base px-5 py-2 rounded-full">Services</Link>
            <Link to="/admin/bookings" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Records</Link>
            <Link to="/admin/customers" className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Users</Link>
            <button onClick={handleLogout} className="px-5 py-2 font-medium text-base text-primary rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white cursor-pointer">Log Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 py-10 md:px-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Manage Services</h1>
          <button onClick={handleAdd} className="px-7 py-3 bg-gradient-to-br from-primary to-primary-light text-white rounded-full font-semibold text-base cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(48,84,87,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(48,84,87,0.4)]">+ Add New Service</button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading services...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_5px_20px_rgba(48,84,87,0.1)] overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-br from-primary to-[#4a7174] text-white text-left">
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Service Name</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Description</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Price</th>
                  <th className="px-6 py-4.5 font-bold text-sm md:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No services available. Click "Add New Service" to create one.
                    </td>
                  </tr>
                ) : (
                  services.map(service => (
                    <tr key={service._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4.5 text-sm md:text-base text-gray-800"><strong>{service.name}</strong></td>
                      <td className="px-6 py-4.5 text-sm md:text-base text-gray-650">{service.description}</td>
                      <td className="px-6 py-4.5 text-sm md:text-base text-primary font-bold">₱{parseFloat(service.price).toFixed(2)}</td>
                      <td className="px-6 py-4.5 text-sm md:text-base">
                        <button onClick={() => handleEdit(service)} className="px-4 py-2 bg-green-500 text-white rounded-md font-semibold text-sm mr-2 transition-colors hover:bg-green-600">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(service._id)} className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold text-sm transition-colors hover:bg-red-650">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-lg w-[90%] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
              <h2 className="text-2xl font-bold text-primary">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-3xl text-primary font-light cursor-pointer hover:opacity-75">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-5 text-left">
                <label className="block mb-2 font-semibold text-gray-750 text-sm">Service Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-[#d7ebed] rounded-lg text-sm font-sans focus:outline-none focus:border-primary transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Wash and Fold"
                />
              </div>
              <div className="mb-5 text-left">
                <label className="block mb-2 font-semibold text-gray-750 text-sm">Description *</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-[#d7ebed] rounded-lg text-sm font-sans focus:outline-none focus:border-primary transition-colors resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="3"
                  placeholder="Describe the service..."
                />
              </div>
              <div className="mb-5 text-left">
                <label className="block mb-2 font-semibold text-gray-750 text-sm">Price (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-[#d7ebed] rounded-lg text-sm font-sans focus:outline-none focus:border-primary transition-colors"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-100 text-primary rounded-lg font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-br from-primary to-primary-light text-white rounded-lg font-semibold text-sm cursor-pointer transition-all hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(48,84,87,0.3)] hover:shadow-[0_6px_20px_rgba(48,84,87,0.4)]">
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminServices;