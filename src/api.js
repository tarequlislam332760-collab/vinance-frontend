import axios from 'axios';

// ✅ আপনার লাইভ ব্যাকএন্ড লিঙ্ক
const API_BASE_URL = "https://vinance-backend.vercel.app"; 

const API = axios.create({
  baseURL: API_BASE_URL,
});

// প্রতিটি রিকোয়েস্টের সাথে টোকেন পাঠানোর ব্যবস্থা
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;