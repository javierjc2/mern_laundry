import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './AdminServices.css';

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
      // ✅ FIXED: Use admin route
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
      // ✅ FIXED: Use admin route
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
        // ✅ FIXED: Use admin route for update
        await axios.put(`/api/admin/services/${editingService._id}`, formData);
        alert('Service updated successfully');
      } else {
        // ✅ FIXED: Use admin route for create
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
    <div className="admin-services-page">
      <header>
        <div className="navbar">
          <div className="logo">IV's Laundry Service</div>
          <div className="nav-links">
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/services" className="active">Services</Link>
            <Link to="/admin/bookings">Records</Link>
            <Link to="/admin/customers">Users</Link>
            <button onClick={handleLogout} className="logout-btn">Log Out</button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <div className="content-header">
          <h1>Manage Services</h1>
          <button onClick={handleAdd} className="btn-add">+ Add New Service</button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '40px'}}>
                      No services available. Click "Add New Service" to create one.
                    </td>
                  </tr>
                ) : (
                  services.map(service => (
                    <tr key={service._id}>
                      <td><strong>{service.name}</strong></td>
                      <td>{service.description}</td>
                      <td>₱{parseFloat(service.price).toFixed(2)}</td>
                      <td>
                        <button onClick={() => handleEdit(service)} className="btn-edit">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(service._id)} className="btn-delete">
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Wash and Fold"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="3"
                  placeholder="Describe the service..."
                />
              </div>
              <div className="form-group">
                <label>Price (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
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