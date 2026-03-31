import axios from 'axios';

const API = axios.create({
  baseURL: 'https://vinance-backend.vercel.app', 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API; // এটিই Vercel বিল্ড ফিক্স করবে