import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const listingAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/listings/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/listings/${id}`),
  markFilled: (id) => api.patch(`/listings/${id}/fill`),
  getOwnerDashboard: () => api.get('/listings/owner/dashboard'),
  getOwnerListings: () => api.get('/listings/owner/my-listings'),
};

export const tenantAPI = {
  getDashboard: () => api.get('/tenant/dashboard'),
  getProfile: () => api.get('/tenant/profile'),
  updateProfile: (data) => api.put('/tenant/profile', data),
  getRecommendations: (limit) => api.get('/tenant/recommendations', { params: { limit } }),
};

export const compatibilityAPI = {
  getScore: (listingId) => api.get(`/compatibility/${listingId}`),
};

export const interestAPI = {
  create: (listingId) => api.post('/interest', { listingId }),
  getTenant: () => api.get('/interest/tenant'),
  getOwner: () => api.get('/interest/owner'),
  accept: (id) => api.put(`/interest/${id}/accept`),
  reject: (id) => api.put(`/interest/${id}/reject`),
};

export const chatAPI = {
  getRooms: () => api.get('/chat/rooms'),
  getMessages: (roomId) => api.get(`/chat/${roomId}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
  toggleUser: (id) => api.patch(`/admin/user/${id}/toggle`),
  getListings: (params) => api.get('/admin/listings', { params }),
  deleteListing: (id) => api.delete(`/admin/listing/${id}`),
  markFilled: (id) => api.patch(`/admin/listing/${id}/fill`),
};
