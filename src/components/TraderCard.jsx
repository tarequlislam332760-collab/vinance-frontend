import React, { useState } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';

const TraderCard = ({ trader }) => {
  const [copied, setCopied] = useState(false);

  // কপি ফাংশন
  const handleCardCopy = async (e) => {
    e.stopPropagation();
    const textToCopy = trader.name || "Trader ID";
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // ডাইনামিক গ্রাফ জেনারেটর (বিন্যান্স স্টাইল)
  // এটি ট্রেডারের chartData অ্যারে থেকে অটোমেটিক গ্রাফ তৈরি করবে
  const generatePath = () => {
    const data = trader.chartData && trader.chartData.length > 0 
                 ? trader.chartData 
                 : [20, 35, 25, 45, 30, 55, 40]; // ডিফল্ট ডাটা
    
    const width = 100;
    const height = 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const isPositive = (trader.profit || 0) >= 0;

  return (
    <div className="bg-[#1e2329] p-5 rounded-[1.2rem] shadow-md border border-transparent hover:border-[#f0b90b]/30 transition-all duration-300 group relative overflow-hidden">
      {/* Background Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0b90b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={trader.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                className="w-11 h-11 rounded-full bg-gray-800 border-2 border-[#2b3139] object-cover group-hover:border-[#f0b90b]/50 transition-colors" 
                alt={trader.name} 
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#02c076] border-2 border-[#1e2329] rounded-full"></div>
            </div>
            
            <div className="min-w-0">
              <h4 className="font-bold text-[14px] text-white group-hover:text-[#f0b90b] transition-colors line-clamp-1">
                {trader.name}
              </h4>
              <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                <span className="opacity-70">👥</span> {trader.followers || 0}/300
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleCardCopy}
            disabled={copied}
            className={`text-[10px] font-bold uppercase px-4 py-1.5 rounded-lg transition-all active:scale-90 ${
              copied 
              ? 'bg-[#02c076] text-white' 
              : 'bg-[#2b3139] text-[#f0b90b] hover:bg-[#363d45]'
            }`}
          >
            {copied ? <CheckCircle2 size={12} /> : 'Copy'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-y-5">
          {/* Left: Profit & ROI */}
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">30D PnL (USDT)</p>
            <p className={`font-black text-lg ${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
              {isPositive ? '+' : ''}{trader.profit || "0.00"}
            </p>
            <p className={`text-[10px] font-bold mt-0.5 ${isPositive ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
              ROI {trader.winRate || "0.00"}%
            </p>
          </div>

          {/* Right: Real-time Graph */}
          <div className="flex flex-col items-end justify-center">
            <div className="w-24 h-10 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path 
                  d={generatePath()} 
                  fill="none" 
                  stroke={isPositive ? "#02c076" : "#f6465d"} 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_4px_rgba(2,192,118,0.3)]"
                />
              </svg>
            </div>
          </div>

          {/* Bottom Stats */}
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">AUM</p>
            <p className="text-gray-200 text-[11px] font-bold tracking-tight">
              ${trader.aum ? Number(trader.aum).toLocaleString() : "12,450.00"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">30D MDD</p>
            <p className="text-gray-200 text-[11px] font-bold">
              {trader.mdd || "5.20"}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderCard;