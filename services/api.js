import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication service functions
export const authService = {
  // Student
  registerStudent: async (matricNumber, password) => {
    const response = await api.post('/auth/register', {
      role: 'student',
      matricNumber,
      password,
    });
    return response.data;
  },

  loginStudent: async (matricNumber, password) => {
    const response = await api.post('/auth/login', {
      role: 'student',
      matricNumber,
      password,
    });
    return response.data;
  },

  // Admin
  registerAdmin: async (email, password) => {
    const response = await api.post('/auth/register-admin', {
      role: 'admin',
      email,
      password,
    });
    return response.data;
  },

  loginAdmin: async (email, password) => {
    const response = await api.post('/auth/login', {
      role: 'admin',
      email,
      password,
    });
    return response.data;
  },
};

export default api;
