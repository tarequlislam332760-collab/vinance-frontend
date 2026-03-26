import axios from 'axios';

// 🔴 এখানে আপনার Render বা লাইভ ব্যাকএন্ড লিংকটি দিন
const API_BASE_URL = "https://your-backend-api-link.onrender.com"; 

const API = axios.create({
  baseURL: API_BASE_URL,
});

// রিকোয়েস্ট পাঠানোর সময় অটোমেটিক টোকেন যোগ হবে
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;