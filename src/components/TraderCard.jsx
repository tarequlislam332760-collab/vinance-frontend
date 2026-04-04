import React from 'react';
import { ShieldCheck, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';

const TraderCard = ({ trader }) => {
  // প্রফিট পজিটিভ নাকি নেগেটিভ তা চেক করা
  const isPositive = trader.profit >= 0;

  const handleCopyTrade = async () => {
    const amount = prompt("Enter amount to copy (USDT):");
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return alert("Please enter a valid amount.");
    }

    try {
      const token = localStorage.getItem("token"); 
      // আপনার ব্যাকএন্ড URL টি এখানে বসান
      const res = await axios.post("https://your-api-url.com/api/copy-trade/follow", 
        { 
          traderId: trader._id, 
          amount: Number(amount) 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("Copy Trade Started Successfully!");
        window.location.reload(); 
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to copy trade");
    }
  };

  return (
    <div className="bg-[#161a1e] border border-[#1e2329] rounded-[2rem] p-6 hover:border-[#f0b90b]/40 transition-all shadow-xl group mb-4 relative overflow-hidden">
      
      {/* ১. মাস্টার ট্রেডার ব্যাজ (Top Right Corner) */}
      <div className="absolute top-0 right-0 bg-[#f0b90b] text-black text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase italic shadow-lg">
        Master
      </div>

      {/* Top Section: Avatar & Info */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          {/* প্রোফাইল ইমেজ এবং অনলাইন স্ট্যাটাস */}
          <div className="relative w-16 h-16 bg-[#2b3139] rounded-2xl flex items-center justify-center text-[#f0b90b] font-black text-2xl border border-white/5 shadow-inner overflow-hidden">
            {trader.image ? (
              <img src={trader.image} alt={trader.name} className="w-full h-full object-cover" />
            ) : (
              <span>{trader.name?.[0]}</span>
            )}
            {/* অনলাইন ইন্ডিকেটর */}
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[#02c076] border-2 border-[#161a1e] rounded-full shadow-sm"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-black text-xl tracking-tight">
                {trader.name}
              </h3>
              <ShieldCheck size={20} className="text-[#f0b90b]" />
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#f0b90b]/10 px-2 py-0.5 rounded text-[#f0b90b] text-[10px] font-black uppercase tracking-tighter">
                Verified Pro
              </span>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Users size={12} /> {trader.followers || 0} / 300
              </p>
            </div>
          </div>
        </div>
        
        {/* কপি বাটন */}
        <button 
          onClick={handleCopyTrade}
          className="bg-[#f0b90b] text-black px-6 py-2.5 rounded-xl font-black text-[11px] uppercase shadow-[0_0_20px_rgba(240,185,11,0.15)] hover:bg-[#f3ba2f] hover:scale-105 active:scale-95 transition-all mt-2"
        >
          Copy
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-[#1e2329]">
        {/* PnL & Win Rate */}
        <div>
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-tighter">Total Profit</p>
          <p className={`font-mono font-black text-xl ${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
            {isPositive ? '+' : ''}{trader.profit}%
          </p>
          <p className={`${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'} text-[10px] font-bold`}>
            Win Rate: {trader.winRate || 0}%
          </p>
        </div>

        {/* AUM (Assets Under Management) */}
        <div className="hidden md:block">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-tighter">AUM (USDT)</p>
          <p className="text-white font-mono font-black text-lg">
            ${(Math.random() * 5000 + 1000).toFixed(2)} 
          </p>
        </div>

        {/* Status */}
        <div className="text-right md:text-left">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-tighter">Status</p>
          <p className="text-[#02c076] font-mono font-black text-lg uppercase tracking-tighter">Active</p>
        </div>

        {/* Trending Chart Icon */}
        <div className="flex justify-end items-center">
          <div className={`p-2.5 rounded-xl ${isPositive ? 'bg-[#02c076]/10' : 'bg-[#f6465d]/10'}`}>
            <TrendingUp size={30} className={`${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'} opacity-60`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderCard;