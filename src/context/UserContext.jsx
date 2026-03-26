import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

// ১. আপনার ভেরসেল ব্যাকএন্ড লিঙ্কটি এখানে দিন (অবশ্যই শেষে /api ছাড়া)
const API_BASE_URL = "https://vinance-backend.vercel.app"; 

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      if (token) {
        try {
          // ২. লোকালহোস্টের বদলে ভেরিয়েবলটি ব্যবহার করা হয়েছে
          const res = await axios.get(`${API_BASE_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user);
        } catch (err) { 
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initApp();
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};