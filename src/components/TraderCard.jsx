import React, { useState } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';

const TraderCard = ({ trader }) => {
  const [copied, setCopied] = useState(false);

  const handleCardCopy = async (e) => {
    e.stopPropagation(); 
    const textToCopy = trader.name || "Trader ID";
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      
      // মোবাইলে হালকা ভাইব্রেশন ফিডব্যাক
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="bg-[#1e2329] p-5 rounded-[1.5rem] shadow-md border border-transparent hover:border-[#f0b90b]/40 transition-all duration-500 group relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0b90b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img 
                src={trader.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                className="w-12 h-12 rounded-full bg-gray-700 border-2 border-[#2b3139] object-cover group-hover:border-[#f0b90b]/50 transition-colors" 
                alt="trader" 
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#02c076] border-2 border-[#1e2329] rounded-full"></div>
            </div>
            
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-white group-hover:text-[#f0b90b] transition-colors line-clamp-1">
                {trader.name}
              </h4>
              <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                <span className="text-[#f0b90b] opacity-80">👤</span> {trader.followers || 0}/300 API
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleCardCopy}
            disabled={copied}
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all duration-300 shadow-lg whitespace-nowrap transform active:scale-90 ${
              copied 
              ? 'bg-[#02c076] text-white shadow-[#02c076]/20' 
              : 'bg-[#f0b90b] text-black hover:scale-105 shadow-[#f0b90b]/10'
            }`}
          >
            {copied ? (
              <><CheckCircle2 size={12} className="animate-in zoom-in duration-300" /> Copied</>
            ) : (
              <><Copy size={12} /> Copy</>
            )}
          </button>
        </div>

        <div className="mt-6 flex justify-between items-end gap-2">
          <div className="space-y-1">
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">30D PnL (USDT)</p>
            <p className="text-[#02c076] font-black text-xl leading-none">
              +{trader.profit || "0.00"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[#02c076] text-[10px] font-bold bg-[#02c076]/10 px-1.5 py-0.5 rounded border border-[#02c076]/20">
                ROI {trader.winRate || "0.00"}%
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
             <div className="w-24 h-10 bg-gradient-to-t from-[#02c076]/10 to-transparent rounded-lg border-b-2 border-[#02c076]/50 relative overflow-hidden">
                <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 100 40">
                  <path 
                    d="M0 35 Q 25 30, 40 20 T 80 10 T 100 5" 
                    fill="none" 
                    stroke="#02c076" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_2px_rgba(2,192,118,0.5)]"
                  />
                </svg>
             </div>
             <p className="text-[8px] text-gray-600 font-bold uppercase italic">Performance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderCard;