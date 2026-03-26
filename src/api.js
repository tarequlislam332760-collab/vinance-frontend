import axios from 'axios';

// ✅ আপনার ভেরসেল ব্যাকএন্ড লিঙ্কটি এখানে দিন
const API_BASE_URL = "https://vinance-backend.vercel.app"; 

const API = axios.create({
  baseURL: API_BASE_URL,
});

// রিকোয়েস্ট পাঠানোর সময় অটোমেটিক টোকেন (JWT) যোগ হবে
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;