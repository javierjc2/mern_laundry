import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';  // ✅ Changed to relative

// ═══════════════════════════════════════════════════════════
// SERVICES API
// ═══════════════════════════════════════════════════════════

// Public services (customers can view)
export const servicesAPI = {
  getAll: () => axios.get(`${API_URL}/services`),
  getById: (id) => axios.get(`${API_URL}/services/${id}`),
};

// ═══════════════════════════════════════════════════════════
// BOOKINGS API
// ═══════════════════════════════════════════════════════════

export const bookingsAPI = {
  // Customer endpoints
  getMyBookings: () => axios.get(`${API_URL}/bookings/my-bookings`),
  getById: (id) => axios.get(`${API_URL}/bookings/${id}`),
  create: (bookingData) => axios.post(`${API_URL}/bookings`, bookingData),
  cancel: (id) => axios.patch(`${API_URL}/bookings/${id}/cancel`),
};

// ═══════════════════════════════════════════════════════════
// ADMIN API
// ═══════════════════════════════════════════════════════════

export const adminAPI = {
  // Dashboard
  getDashboard: () => axios.get(`${API_URL}/admin/dashboard`),

  // Users
  getUsers: (accountType) => {
    const url = accountType 
      ? `${API_URL}/admin/users?accountType=${accountType}` 
      : `${API_URL}/admin/users`;
    return axios.get(url);
  },
  getUserById: (id) => axios.get(`${API_URL}/admin/users/${id}`),
  createUser: (userData) => axios.post(`${API_URL}/admin/users`, userData),
  updateUser: (id, userData) => axios.put(`${API_URL}/admin/users/${id}`, userData),
  deleteUser: (id) => axios.delete(`${API_URL}/admin/users/${id}`),

  // Services (ADMIN ONLY)
  getServices: () => axios.get(`${API_URL}/admin/services`),
  createService: (serviceData) => axios.post(`${API_URL}/admin/services`, serviceData),
  updateService: (id, serviceData) => axios.put(`${API_URL}/admin/services/${id}`, serviceData),
  deleteService: (id) => axios.delete(`${API_URL}/admin/services/${id}`),

  // Bookings (ADMIN ONLY)
  getAllBookings: () => axios.get(`${API_URL}/admin/bookings`),
  updateBooking: (id, bookingData) => axios.put(`${API_URL}/admin/bookings/${id}`, bookingData),
  deleteBooking: (id) => axios.delete(`${API_URL}/admin/bookings/${id}`),
};

// ═══════════════════════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════════════════════

export const authAPI = {
  login: (email, password) => axios.post(`${API_URL}/auth/login`, { email, password }),
  register: (userData) => axios.post(`${API_URL}/auth/register`, userData),
  getMe: () => axios.get(`${API_URL}/auth/me`),
  updateProfile: (profileData) => axios.put(`${API_URL}/auth/profile`, profileData),
  changePassword: (currentPassword, newPassword) => 
    axios.put(`${API_URL}/auth/change-password`, { currentPassword, newPassword })
};

export default {
  services: servicesAPI,
  bookings: bookingsAPI,
  admin: adminAPI,
  auth: authAPI
};