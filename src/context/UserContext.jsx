import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://my-trading-backend-rji1.vercel.app"; // আপনার ভেরসেল ব্যাকএন্ড লিঙ্কটি এখানে দিন

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

  // যখনই টোকেন স্টেট চেঞ্জ হবে (লগইন বা আউট), তখনই প্রোফাইল রিলোড হবে
  useEffect(() => {
    refreshUser();
  }, [token, refreshUser]);

  return (
    <UserContext.Provider value={{ 
      user, 
      token, 
      setUser, 
      setToken, // এটি এক্সপোর্ট করা জরুরি যাতে Login.js থেকে কল করা যায়
      logout, 
      refreshUser, 
      API_URL, 
      loading 
    }}>
      {children}
    </UserContext.Provider>
  );
};