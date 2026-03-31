import React, { useState, useContext, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

// এপিআই কনফিগারেশন (আপনার App.jsx এর মতো)
const api = axios.create({
    baseURL: "https://vinance-backend.vercel.app", // নতুন ব্যাকেন্ড ইউআরএল
  withCredentials: true 
});

const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [leverage, setLeverage] = useState(10); // ডিফল্ট ১০এক্স লিভারেজ
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFutureTrade = async (side) => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter valid amount");
    setLoading(true);
    try {
      const res = await api.post('/api/futures/trade', { 
        type: side, // 'buy' for Long, 'sell' for Short
        amount: parseFloat(amount), 
        leverage: leverage,
        symbol: (coinSymbol || 'btc').toUpperCase() 
      });
      alert(res.data.message);
      // ব্যালেন্স আপডেট লজিক এখানে থাকবে
    } catch (err) { 
      alert(err.response?.data?.message || "Futures trade failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] text-left">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1e2329]">
        <h2 className="text-xl font-black text-white italic uppercase">{(coinSymbol || 'btc')}/USDT Perpetual</h2>
        <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-lg text-xs font-bold border border-yellow-500/20">
          {leverage}x Leverage
        </div>
      </div>

      <div className="flex-1 p-4 bg-[#0b0e11]">
        {/* লিভারেজ স্লাইডার বা ইনপুট */}
        <div className="mb-6">
          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">Adjust Leverage</label>
          <input 
            type="range" min="1" max="100" value={leverage} 
            onChange={(e) => setLeverage(e.target.value)}
            className="w-full accent-yellow-500" 
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>1x</span><span>50x</span><span>100x</span>
          </div>
        </div>

        <div className="relative mb-6">
          <input 
            type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} 
            placeholder="0.00" 
            className="w-full bg-[#1e2329] border border-gray-800 rounded-xl p-5 text-white outline-none font-mono text-xl focus:border-yellow-500" 
          />
          <span className="absolute right-5 top-5 text-gray-500 font-bold uppercase">USDT</span>
        </div>

        <div className="flex gap-4">
          <button onClick={() => handleFutureTrade('buy')} className="flex-1 bg-emerald-500 py-4 rounded-xl font-black uppercase text-white shadow-lg active:scale-95 transition-all">Buy / Long</button>
          <button onClick={() => handleFutureTrade('sell')} className="flex-1 bg-red-500 py-4 rounded-xl font-black uppercase text-white shadow-lg active:scale-95 transition-all">Sell / Short</button>
        </div>
      </div>
    </div>
  );
};

export default Futures;