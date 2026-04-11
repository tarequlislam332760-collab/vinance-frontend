import axios from 'axios';

const API = axios.create({
  // আপনার Vercel ব্যাকএন্ড লিঙ্ক
  baseURL: 'https://vinance-backend.vercel.app', 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;