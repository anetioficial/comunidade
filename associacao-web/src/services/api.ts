import axios from 'axios';

// Replace with your actual backend URL
const API_URL = 'http://localhost:3000'; // Or your deployed backend URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired or invalid token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userToken');
      // Redirect to login page if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    return api.post('/api/auth/login', { email, password });
  },
  register: async (name: string, email: string, password: string) => {
    return api.post('/api/auth/register', { name, email, password });
  },
  getProfile: async () => {
    return api.get('/api/users/profile');
  },
  updateProfile: async (data: { name: string }) => {
    return api.put('/api/users/profile', data);
  },
};

// Posts services
export const postService = {
  getPosts: async () => {
    return api.get('/api/posts');
  },
  createPost: async (content: string) => {
    return api.post('/api/posts', { content });
  },
};

export default api;
