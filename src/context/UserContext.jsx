import React, { createContext, useState, useEffect } from 'react';
import API from '../api'; // ✅ আমরা বানানো সেন্ট্রাল API ফাইলটি ইম্পোর্ট করলাম

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      if (token) {
        try {
          // ✅ এখন আর পুরো লিঙ্ক লেখার দরকার নেই, শুধু রাউট দিলেই হবে
          const res = await API.get('/profile'); 
          setUser(res.data.user);
        } catch (err) { 
          // টোকেন এক্সপায়ার হলে ক্লিন করা
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