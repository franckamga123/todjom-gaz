import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// JWT interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sup_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sup_token');
      localStorage.removeItem('sup_user');
      localStorage.removeItem('sup_supplier');
      window.location.href = '/login';
    }
    return Promise.reject({ message: error.response?.data?.message || 'Erreur réseau', status: error.response?.status });
  }
);

// ========== AUTH & PROFILE ==========
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getProfile: () => api.get('/auth/me'),
  updateSupplierProfile: (data) => api.put('/supplier/profile', data),
  getStats: () => api.get('/supplier/stats'),
  getWithdrawals: () => api.get('/supplier/withdrawals'),
  requestWithdrawal: (data) => api.post('/supplier/withdrawals', data),
  getAffiliatedDistributors: () => api.get('/supplier/distributors'),
  getSalesMetrics: () => api.get('/supplier/sales-metrics'),
};

// ========== PRODUCTS ==========
export const productAPI = {
  getMyProducts: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ========== ORDERS ==========
export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// ========== DISTRIBUTORS ==========
export const distributorAPI = {
  getNearby: (params) => api.get('/distributors/nearby', { params }),
};

// ========== NOTIFICATIONS ==========
export const notifAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
