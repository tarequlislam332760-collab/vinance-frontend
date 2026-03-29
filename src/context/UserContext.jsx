import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // --- API URL কনফিগারেশন (একদম ফিক্সড) ---
  // প্রোডাকশনে সবসময় এই লিঙ্কটি ব্যবহার করবে, লোকালহোস্টের ঝামেলা এড়াতে সরাসরি লিঙ্ক দেওয়াই ভালো
  const API_URL = "https://vinance-backend.vercel.app"; 

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL, logout]);

  useEffect(() => {
    refreshUser();
  }, [token, refreshUser]);

  return (
    <UserContext.Provider value={{ 
      user, 
      token, 
      setUser, 
      setToken, 
      logout, 
      refreshUser, 
      API_URL, 
      loading 
    }}>
      {children}
    </UserContext.Provider>
  );
};