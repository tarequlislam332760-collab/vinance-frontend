import axios from 'axios';

// ✅ আপনার লোকালহোস্ট লিঙ্ক (যেহেতু সার্ভার ৫০০০ পোর্টে চলছে)
const API_BASE_URL = "http://localhost:5000"; 

const API = axios.create({
  baseURL: API_BASE_URL,
});

// টোকেন অটোমেটিক যোগ হওয়ার লজিক (আগে যা ছিল)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;