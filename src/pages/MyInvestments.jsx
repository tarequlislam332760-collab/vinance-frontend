import React, { useState, useEffect } from 'react';
import axios from 'axios';

// যদি api অন্য ফাইলে থাকে তবে সেটা ইমপোর্ট করতে হবে। 
// যেহেতু আপনি App.js এ এটা ডিফাইন করেছেন, তাই সহজ করার জন্য 
// আমি এখানে সরাসরি API কল সেটআপ করে দিচ্ছি।

const MyInvestments = () => {
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    const fetchMyInvests = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseURL = window.location.hostname === "localhost" 
          ? "http://localhost:5000" 
          : "https://vinance-backend.vercel.app"; // আপনার ব্যাকএন্ড ইউআরএল

        const res = await axios.get(`${baseURL}/api/my-investments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setInvestments(res.data);
      } catch (err) { 
        console.error("Investment fetch error:", err); 
      }
    };
    fetchMyInvests();
  }, []);

  return (
    <div className="bg-[#0b0e11] min-h-screen pt-28 px-6 text-left">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-white uppercase italic mb-8 border-l-4 border-yellow-500 pl-4">
          My Investment <span className="text-yellow-500">Logs</span>
        </h2>
        
        <div className="overflow-x-auto bg-[#1e2329] rounded-[2rem] border border-gray-800 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-white/5">
                <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Plan Name</th>
                <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Amount</th>
                <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="text-white font-bold text-sm">
              {investments.length > 0 ? (
                investments.map((inv, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6 uppercase italic text-yellow-500">
                      {inv.planId?.name || "Standard Plan"}
                    </td>
                    <td className="p-6 font-mono text-emerald-400">
                      ${inv.amount?.toLocaleString()}
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1 rounded-full text-[10px] uppercase font-black border ${
                        inv.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-gray-500/10 text-gray-400 border-gray-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-gray-500 italic">
                    No investments found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyInvestments;