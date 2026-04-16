import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL
});

// Interceptor for tokens
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data)
};

export const brandService = {
    getAll: () => api.get('/brands')
};

export const productService = {
    getAll: () => api.get('/products')
};

export const orderService = {
    initiateSearch: (data) => api.post('/orders/initiate-search', data),
    searchDistributor: (id) => api.post(`/orders/${id}/search-distributor`),
    finalizeDelivery: (id, data) => api.post(`/orders/${id}/finalize-delivery`, data),
    getUserOrders: () => api.get('/orders'),
    cancel: (id) => api.post(`/orders/${id}/cancel`),
    confirmPayment: (id) => api.post(`/orders/${id}/pay`)
};

export const miscService = {
    getConfig: () => api.get('/config'),
    getBanners: () => api.get('/banners'),
    getSafetyCenters: () => api.get('/safety'),
    getLogs: () => api.get('/logs/me')
};
