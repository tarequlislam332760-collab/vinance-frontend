import axios from 'axios';

// ✅ আপনার লাইভ ব্যাকএন্ডের সঠিক লিঙ্ক
const API = axios.create({
  baseURL: "https://vinance-backend.vercel.app/api", 
});

// প্রতি রিকোয়েস্টের সাথে টোকেন পাঠানোর ব্যবস্থা
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;