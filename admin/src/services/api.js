import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Intercepteur : ajouter le token JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur : gérer les erreurs
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || 'Erreur réseau';
    return Promise.reject({ message, status: error.response?.status });
  }
);

// ========== AUTH ==========
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

// ========== ADMIN ==========
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  validateSupplier: (id) => api.put(`/admin/suppliers/${id}/validate`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getDisputes: (params) => api.get('/admin/disputes', { params }),
  resolveDispute: (id, data) => api.put(`/admin/disputes/${id}/resolve`, data),
  getLogs: (params) => api.get('/admin/logs', { params }),
  getEmergencies: () => api.get('/admin/emergencies'),
  updateEmergencyStatus: (id, status) => api.put(`/admin/emergencies/${id}`, { status }),
  
  // Promo Codes
  getPromoCodes: () => api.get('/admin/promo-codes'),
  createPromoCode: (data) => api.post('/admin/promo-codes', data),
  togglePromoCode: (id) => api.put(`/admin/promo-codes/${id}/toggle`),

  // Vehicles
  getVehicles: () => api.get('/admin/vehicles'),

  // Products
  getAdminProducts: () => api.get('/admin/products'),
  updateAdminProduct: (id, data) => api.put(`/admin/products/${id}`, data),

  // Safety Centers
  getSafetyCenters: () => api.get('/admin/safety-centers'),
  createSafetyCenter: (data) => api.post('/admin/safety-centers', data),
  deleteSafetyCenter: (id) => api.delete(`/admin/safety-centers/${id}`),

  // Reports
  getReportStats: (params) => api.get('/admin/reports/stats', { params }),


  // Banners
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  // Withdrawals
  getWithdrawals: () => api.get('/admin/withdrawals'),
  updateWithdrawalStatus: (id, data) => api.put(`/admin/withdrawals/${id}`, data),
};

// ========== ORDERS ==========
export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancelOrder: (id, data) => api.post(`/orders/${id}/cancel`, data),
};

// ========== SUPPLIERS ==========
export const supplierAPI = {
  getSuppliers: () => api.get('/suppliers'),
};

// ========== NOTIFICATIONS ==========
export const notifAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
