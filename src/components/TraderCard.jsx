import React from 'react';
import { ShieldCheck, Users, TrendingUp } from 'lucide-react';

const TraderCard = ({ trader }) => {
  // প্রফিট পজিটিভ হলে সবুজ, নেগেটিভ হলে লাল দেখানোর জন্য লজিক
  const isPositive = trader.pnl >= 0;

  return (
    <div className="bg-[#161a1e] border border-[#1e2329] rounded-[2rem] p-6 hover:border-[#f0b90b]/40 transition-all shadow-xl group">
      {/* Top Section: Avatar & Action */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#2b3139] rounded-2xl flex items-center justify-center text-[#f0b90b] font-black text-xl border border-white/5 shadow-inner">
            {/* যদি ইমেজ থাকে তবে ইমেজ দেখাবে, না থাকলে নামের প্রথম অক্ষর */}
            {trader.avatar ? (
              <img src={trader.avatar} alt={trader.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              trader.name[0]
            )}
          </div>
          <div>
            <h3 className="text-white font-black text-lg flex items-center gap-2">
              {trader.name} <ShieldCheck size={16} className="text-[#f0b90b]" />
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Users size={12} /> {trader.followers} / {trader.maxFollowers || 300}
              </p>
              {trader.isApiEnabled && (
                <span className="ml-2 bg-[#f0b90b]/10 px-2 py-0.5 rounded text-[#f0b90b] text-[9px] font-black">API</span>
              )}
            </div>
          </div>
        </div>
        
        <button className="bg-[#f0b90b] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-[0_0_20px_rgba(240,185,11,0.1)] hover:scale-105 active:scale-95 transition-all">
          Copy
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* PnL & ROI */}
        <div>
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-tighter">30D PnL (USDT)</p>
          <p className={`font-mono font-black text-xl ${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
            {isPositive ? '+' : ''}{trader.pnl?.toLocaleString()}
          </p>
          <p className={`${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'} text-[10px] font-bold`}>
            ROI {trader.roi}%
          </p>
        </div>

        {/* AUM (Assets Under Management) */}
        <div className="hidden md:block">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-tighter">AUM</p>
          <p className="text-white font-mono font-black text-lg">
            ${trader.aum?.toLocaleString() || '0.00'}
          </p>
        </div>

        {/* Trading Days */}
        <div className="text-right md:text-left">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-tighter">Trading Days</p>
          <p className="text-white font-mono font-black text-lg">{trader.days}D</p>
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