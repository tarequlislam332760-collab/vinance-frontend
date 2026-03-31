import axios from 'axios';

const API = axios.create({
  // আপনার ব্যাকএন্ড ইউআরএল (Vercel-এ যেটা আছে)
  baseURL: 'https://vinance-backend.vercel.app', 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// এই লাইনটিই Vercel বিল্ড ফিক্স করবে
export default API;