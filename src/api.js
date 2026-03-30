import axios from 'axios';

// ✅ আপনার Vercel Backend URL এখানে বসান
const API_BASE_URL = "https://vinance-backend.vercel.app"; 

const API = axios.create({
  baseURL: API_BASE_URL,
});

// টোকেন অটোমেটিক যোগ করার লজিক
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;