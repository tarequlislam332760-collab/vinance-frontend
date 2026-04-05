import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

const BecomeTrader = () => {
  return (
    <div className="p-6 md:p-12 bg-[#0b0e11] min-h-screen text-white text-left">
      <div className="max-w-2xl mx-auto bg-[#161a1e] p-8 rounded-[2.5rem] border border-[#1e2329] shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-[#f0b90b] rounded-2xl text-black">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase italic">Apply as Lead Trader</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Start earning 30% profit share</p>
          </div>
        </div>

        <form className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Trading Experience (Years)</label>
            <input type="number" placeholder="e.g. 3" className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 rounded-2xl mt-2 text-white focus:border-[#f0b90b] outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Initial Trading Capital ($)</label>
            <input type="number" placeholder="Min $500" className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 rounded-2xl mt-2 text-white focus:border-[#f0b90b] outline-none" />
          </div>
          <button type="button" onClick={() => alert("Application Submitted! Review will take 24 hours.")} className="w-full bg-[#f0b90b] text-black py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2">
             Submit Application <Zap size={16} fill="black" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeTrader;