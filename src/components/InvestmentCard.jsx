import React from 'react';

const InvestmentCard = ({ plan, onInvest }) => {
  return (
    <div className="bg-card-bg border border-border p-8 rounded-[2.5rem] shadow-xl text-center group hover:border-primary transition-all relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
      
      <h3 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tighter">
        {plan.name}
      </h3>
      
      <div className="text-5xl font-black text-primary mb-4 italic">
        {plan.profitPercent}% 
        <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] ml-2 font-bold">ROI</span>
      </div>

      <div className="space-y-3 mb-8 text-xs font-black text-gray-400 uppercase tracking-widest">
        <p className="border-b border-border pb-2">Min: <span className="text-white">${plan.minAmount}</span></p>
        <p className="border-b border-border pb-2">Max: <span className="text-white">${plan.maxAmount}</span></p>
        <p>Duration: <span className="text-white">{plan.durationHours} Hours</span></p>
      </div>

      <button 
        onClick={() => onInvest(plan)}
        className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg hover:scale-[1.02] active:scale-95"
      >
        Invest Now
      </button>
    </div>
  );
};

export default InvestmentCard;