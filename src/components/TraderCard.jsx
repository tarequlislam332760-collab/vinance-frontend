import React from 'react';
import { ShieldCheck, Users, TrendingUp } from 'lucide-react';
import axios from 'axios'; // axios ইম্পোর্ট করা হয়েছে

const TraderCard = ({ trader }) => {
  // আপনার ব্যাকএন্ডে 'profit' হিসেবে ডাটা আসছে, তাই এখানে logic আপডেট করা হলো
  const isPositive = trader.profit >= 0;

  const handleCopyTrade = async () => {
    const amount = prompt("Enter amount to copy (USDT):"); // ইউজারের কাছ থেকে অ্যামাউন্ট নেওয়া
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return alert("Please enter a valid amount.");
    }

    try {
      const token = localStorage.getItem("token"); // আপনার সিস্টেমের টোকেন নেওয়া
      const res = await axios.post("https://your-api-url.com/api/copy-trade/follow", 
        { 
          traderId: trader._id, 
          amount: Number(amount) 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("Copy Trade Started Successfully!");
        window.location.reload(); // ব্যালেন্স আপডেট দেখানোর জন্য
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to copy trade");
    }
  };

  return (
    <div className="bg-[#161a1e] border border-[#1e2329] rounded-[2rem] p-6 hover:border-[#f0b90b]/40 transition-all shadow-xl group mb-4">
      {/* Top Section: Avatar & Action */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#2b3139] rounded-2xl flex items-center justify-center text-[#f0b90b] font-black text-xl border border-white/5 shadow-inner overflow-hidden">
            {/* ডাটাবেসের 'image' ফিল্ড ব্যবহার করা হচ্ছে */}
            {trader.image ? (
              <img src={trader.image} alt={trader.name} className="w-full h-full object-cover" />
            ) : (
              <span>{trader.name?.[0]}</span>
            )}
          </div>
          <div>
            <h3 className="text-white font-black text-lg flex items-center gap-2">
              {trader.name} <ShieldCheck size={16} className="text-[#f0b90b]" />
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Users size={12} /> {trader.followers || 0} / 300
              </p>
              <span className="ml-2 bg-[#f0b90b]/10 px-2 py-0.5 rounded text-[#f0b90b] text-[9px] font-black">API</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleCopyTrade}
          className="bg-[#f0b90b] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-[0_0_20px_rgba(240,185,11,0.1)] hover:scale-105 active:scale-95 transition-all"
        >
          Copy
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* PnL & ROI */}
        <div>
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-tighter">Total Profit</p>
          <p className={`font-mono font-black text-xl ${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
            {isPositive ? '+' : ''}{trader.profit}%
          </p>
          <p className={`${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'} text-[10px] font-bold`}>
            Win Rate: {trader.winRate || 0}%
          </p>
        </div>

        {/* AUM (Assets Under Management) - Static for now */}
        <div className="hidden md:block">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-tighter">AUM</p>
          <p className="text-white font-mono font-black text-lg">
            ${(Math.random() * 10000).toFixed(2)} 
          </p>
        </div>

        {/* Trading Days */}
        <div className="text-right md:text-left">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-tighter">Status</p>
          <p className="text-white font-mono font-black text-lg">Active</p>
        </div>

        {/* Mini Chart Placeholder */}
        <div className="flex justify-end items-center">
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-[#02c076]/5' : 'bg-[#f6465d]/5'}`}>
            <TrendingUp size={32} className={`${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'} opacity-40`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderCard;