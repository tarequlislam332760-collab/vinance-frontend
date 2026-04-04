import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ShieldCheck, Users, Zap, ChevronRight, TrendingUp } from 'lucide-react';
import TraderCard from '../components/TraderCard'; // TraderCard ইম্পোর্ট করা হয়েছে

const TraderProfile = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { API_URL } = useContext(UserContext);

  // ব্যাকএন্ড থেকে ট্রেডারদের ডাটা নিয়ে আসা
  useEffect(() => {
    const fetchTraders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/traders/all`);
        setTraders(res.data);
      } catch (err) {
        console.error("Error fetching traders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTraders();
  }, [API_URL]);

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-left pb-32">
      {/* --- Premium Banner --- */}
      <div className="bg-gradient-to-r from-[#f0b90b]/20 to-transparent p-6 rounded-[2.5rem] border border-[#f0b90b]/20 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg shadow-[#f0b90b]/5">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#f0b90b] rounded-full text-black shadow-2xl animate-pulse">
            <Zap size={24} fill="black" />
          </div>
          <div>
            <h2 className="text-white font-black text-xl uppercase italic tracking-tighter">Elite Trader Program</h2>
            <p className="text-gray-400 text-xs font-bold">Join and earn up to <span className="text-[#f0b90b]">30% Profit Share!</span></p>
          </div>
        </div>
        <button className="text-[#f0b90b] text-[10px] font-black uppercase flex items-center gap-1 hover:brightness-125 transition-all">
          Check Now <ChevronRight size={14} />
        </button>
      </div>

      {/* --- Filter Tabs (Optional UI) --- */}
      <div className="flex gap-6 mb-8 border-b border-[#1e2329] pb-4 overflow-x-auto scrollbar-hide">
        {['Recommended', 'All Portfolios', 'Favorite'].map((tab, idx) => (
          <button key={tab} className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${idx === 0 ? 'text-[#f0b90b] border-b-2 border-[#f0b90b] pb-4' : 'text-gray-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* --- Trader List Section --- */}
      <div className="space-y-4">
        {loading ? (
          // Loading Skeleton
          [1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-[#161a1e] rounded-[2rem] animate-pulse border border-[#1e2329]"></div>
          ))
        ) : traders.length > 0 ? (
          traders.map((trader) => (
            <TraderCard key={trader._id} trader={trader} />
          ))
        ) : (
          <div className="text-center py-20 bg-[#161a1e] rounded-[2rem] border border-[#1e2329]">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No active traders found</p>
          </div>
        )}
      </div>

      {/* --- Floating Action Button (Mobile View - Optional) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
         <button className="bg-[#f0b90b] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] shadow-2xl flex items-center gap-2">
            <Zap size={14} fill="black" /> Become a Lead Trader
         </button>
      </div>
    </div>
  );
};

export default TraderProfile;