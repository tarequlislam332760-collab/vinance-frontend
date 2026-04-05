import React, { useState } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';

const TraderCard = ({ trader }) => {
  const [copied, setCopied] = useState(false);

  const handleCardCopy = (e) => {
    e.stopPropagation(); // কার্ডের অন্য কোনো ক্লিক ইভেন্ট থাকলে তা থামাবে
    
    // ট্রেডারের নাম বা আইডি যা কপি করতে চান
    const textToCopy = trader.name || "Trader ID";
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      // ২ সেকেন্ড পর আবার 'Copy' টেক্সটে ফিরে যাবে
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="bg-[#1e2329] p-5 rounded-[1.5rem] shadow-md border border-transparent hover:border-[#f0b90b]/40 transition-all duration-300 group relative overflow-hidden">
      {/* Background Subtle Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0b90b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* Trader Image */}
            <div className="relative">
              <img 
                src={trader.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                className="w-12 h-12 rounded-full bg-gray-700 border-2 border-[#2b3139] object-cover" 
                alt="trader" 
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#02c076] border-2 border-[#1e2329] rounded-full"></div>
            </div>
            
            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-[#f0b90b] transition-colors line-clamp-1">
                {trader.name}
              </h4>
              <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                <span className="text-[#f0b90b] opacity-80">👤</span> {trader.followers || 0}/300 API
              </p>
            </div>
          </div>
          
          {/* Main Copy Button */}
          <button 
            onClick={handleCardCopy}
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all duration-300 shadow-lg ${
              copied 
              ? 'bg-[#02c076] text-white shadow-[#02c076]/20' 
              : 'bg-[#f0b90b] text-black hover:scale-105 active:scale-95 shadow-[#f0b90b]/10'
            }`}
          >
            {copied ? (
              <><CheckCircle2 size={12} /> Copied</>
            ) : (
              <><Copy size={12} /> Copy</>
            )}
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-6 flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">30D PnL (USDT)</p>
            <p className="text-[#02c076] font-black text-xl leading-none">
              +{trader.profit || "0.00"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[#02c076] text-[10px] font-bold bg-[#02c076]/10 px-1.5 py-0.5 rounded">
                ROI {trader.winRate || "0.00"}%
              </span>
            </div>
          </div>
          
          {/* Mini Chart Decoration */}
          <div className="flex flex-col items-end gap-1">
             <div className="w-24 h-10 bg-gradient-to-t from-[#02c076]/10 to-transparent rounded-lg border-b-2 border-[#02c076]/50 relative overflow-hidden">
                {/* Visual line decoration */}
                <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 100 40">
                  <path 
                    d="M0 35 Q 25 30, 40 20 T 80 10 T 100 5" 
                    fill="none" 
                    stroke="#02c076" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                </svg>
             </div>
             <p className="text-[8px] text-gray-600 font-bold uppercase italic">Performance Chart</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderCard;