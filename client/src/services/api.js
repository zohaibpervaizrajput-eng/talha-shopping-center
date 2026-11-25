import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // LOCK: cookie auth, token localStorage me nahi
  headers: { 'Content-Type': 'application/json' }
});

// 401 aaye to refresh try karo
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry && !orig.url.includes('/auth/')) {
      orig._retry = true;
      try { await api.post('/auth/refresh'); return api(orig); } catch { /* empty */ }
    }
    return Promise.reject(err);
  }
);

// LOCKED BACKEND ke mutabiq sab endpoints
export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgot: (d) => api.post('/auth/forgot-password', d),
  reset: (token, d) => api.post(`/auth/reset-password/${token}`, d),
};
export const productAPI = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (d) => api.post('/products', d),
  update: (id, d) => api.put(`/products/${id}`, d),
  remove: (id) => api.delete(`/products/${id}`),
  // ★★★ YE 2 LINES ADD KARO ★★★
  delete: (id) => api.delete(`/products/${id}`),
  bulkDelete: (ids) => api.delete('/products/bulk-delete', { data: { ids } }),
};
export const categoryAPI = {
  list: (all) => api.get('/categories', { params: all ? { all: 'true' } : {} }),
  get: (id) => api.get(`/categories/${id}`),
  create: (d) => api.post('/categories', d),
  update: (id, d) => api.put(`/categories/${id}`, d),
  remove: (id) => api.delete(`/categories/${id}`),
};
export const orderAPI = {
  create: (d) => api.post('/orders', d),
  list: () => api.get('/orders'),
  my: () => api.get('/orders/my'),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, d) => api.put(`/orders/${id}/status`, d),
  remove: (id) => api.delete(`/orders/${id}`),
  // ★★★ MY ACCOUNT KE LIYE NAYA - Customer apna order cancel karega ★★★
  cancelMy: (id) => api.put(`/orders/my/${id}/cancel`),
};
export const couponAPI = {
  validate: (d) => api.post('/coupons/validate', d),
  list: () => api.get('/coupons'),
  create: (d) => api.post('/coupons', d),
  update: (id, d) => api.put(`/coupons/${id}`, d),
  remove: (id) => api.delete(`/coupons/${id}`),
};
export const reviewAPI = {
  byProduct: (pid) => api.get(`/reviews/product/${pid}`),
  create: (d) => api.post('/reviews', d),
  list: () => api.get('/reviews'),
  approve: (id, d) => api.put(`/reviews/${id}/approve`, d),
  reply: (id, d) => api.put(`/reviews/${id}/reply`, d),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  getKey: (key) => api.get(`/settings/${key}`),
  update: (d) => api.put('/settings', d),
  updateKey: (key, d) => api.put(`/settings/${key}`, d),
};
// api.js me neechy kahin add karo:
export const contactAPI = {
  // LOCK: Backend me POST /api/contact hona chahiye. Agar nahi hai to Contact.jsx WhatsApp fallback pe chala jayega - error nahi aayega.
  create: (data) => api.post('/contact', data),
  list: () => api.get('/contact'), // Admin ke liye - saare messages
};
// ★★★ BACKUP API - Settings wale tareeqe se hi ★★★
export const backupAPI = {
  exportBackup: () => api.get('/backup/export', { responseType: 'blob' }),
  restoreBackup: (data) => api.post('/backup/restore', data),
};
// ★★★ FIX: Home.jsx plural mangta hai, api.js me singular hai - dono chala do ★★★
export const productsAPI = productAPI;
export default api;