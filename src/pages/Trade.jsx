import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Activity, TrendingUp, ChevronLeft, Bell, Star, MoreHorizontal, LayoutGrid, Zap } from 'lucide-react';

const Trade = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentCoin = (coinSymbol || 'btc').toUpperCase();

  const handleTrade = async (type) => {
    if (!amount || parseFloat(amount) <= 0) return alert("অ্যামাউন্ট লিখুন");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/trade`, 
        { type: type, amount: parseFloat(amount), symbol: currentCoin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (refreshUser) await refreshUser(); 
      setAmount('');
    } catch (err) { 
      alert(err.response?.data?.message || "ট্রেড সফল হয়নি"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden">
      
      {/* 1. Header Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#0b0e11]">
        <div className="flex items-center gap-3">
          <ChevronLeft size={24} className="text-gray-300" onClick={() => window.history.back()} />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-white font-bold text-lg">{currentCoin}/USDT</span>
              <span className="bg-[#2b3139] text-[9px] px-1 rounded text-gray-400 font-bold">Perp</span>
            </div>
            <p className="text-[10px] text-gray-500">Bitcoin</p>
          </div>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Star size={18} />
          <Bell size={18} />
        </div>
      </div>

      {/* 2. Real-time Price Info Bar */}
      <div className="flex justify-between px-4 py-2 border-b border-[#1e2329]">
        <div className="flex flex-col">
          <span className="text-[#f6465d] text-2xl font-bold tracking-tighter">67,111.0</span>
          <div className="flex gap-2 text-[10px]">
            <span className="text-gray-300">$67,111.00</span>
            <span className="text-[#f6465d]">-0.92%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-500">
          <div className="flex flex-col text-right"><span>24h High</span><span className="text-gray-300">68,377.0</span></div>
          <div className="flex flex-col text-right"><span>24h Vol(BTC)</span><span className="text-gray-300">198,801.35</span></div>
          <div className="flex flex-col text-right"><span>24h Low</span><span className="text-gray-300">65,938.0</span></div>
          <div className="flex flex-col text-right"><span>24h Vol(USDT)</span><span className="text-gray-300">13.33B</span></div>
        </div>
      </div>

      {/* 3. Timeframes & Tools */}
      <div className="flex justify-between items-center px-4 py-1.5 text-[11px] text-gray-400 font-medium border-b border-[#1e2329]">
        <div className="flex gap-4">
          <span className="text-[#f0b90b]">Time</span>
          <span>15m</span>
          <span>1h</span>
          <span className="text-white border-b-2 border-[#f0b90b]">4h</span>
          <span>1D</span>
          <span>More</span>
        </div>
        <div className="flex gap-3">
          <Activity size={14} />
          <LayoutGrid size={14} />
        </div>
      </div>

      {/* 4. Live Chart */}
      <div className="flex-1 w-full relative">
        <iframe 
          title="TV-Full" 
          src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=true&hide_legend=false&withdateranges=true&hide_side_toolbar=true&allow_symbol_change=false&save_image=false&show_popup_button=false&locale=en&studies=MASimple@tv-basicstudies`} 
          className="absolute inset-0 w-full h-full border-none"
        ></iframe>
      </div>
      
      {/* 5. Bottom Navigation & Action Panel */}
      <div className="w-full bg-[#161a1e] border-t border-[#1e2329] p-4 pb-20 shadow-2xl">
        <div className="max-w-md mx-auto">
          
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-gray-500">
              <span className="text-[#00c076] border-b-2 border-[#00c076] pb-1">Buy</span>
              <span className="pb-1">Sell</span>
            </div>
            <div className="text-[10px] text-gray-400">
              Available: <span className="text-white font-mono">{user?.balance?.toLocaleString() || '0.00'} USDT</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="relative">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e)=>setAmount(e.target.value)} 
                  placeholder="Amount" 
                  className="w-full bg-[#2b3139] border border-transparent rounded-sm py-2 px-3 text-white outline-none font-mono text-sm focus:border-[#f0b90b]" 
                />
                <span className="absolute right-3 top-2.5 text-gray-500 text-[10px] font-bold">USDT</span>
              </div>
            </div>

            <div className="flex gap-2 flex-1">
              <button 
                onClick={() => handleTrade('buy')} 
                className="flex-1 py-2.5 bg-[#02c076] text-[#0b0e11] rounded-sm font-bold text-sm active:scale-95 transition-all"
              >
                Long
              </button>
              <button 
                onClick={() => handleTrade('sell')} 
                className="flex-1 py-2.5 bg-[#f6465d] text-white rounded-sm font-bold text-sm active:scale-95 transition-all"
              >
                Short
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 6. Footer Tab Bar Mockup */}
      <div className="fixed bottom-0 w-full flex justify-around items-center py-2 bg-[#161a1e] border-t border-[#1e2329] text-[10px] text-gray-500">
        <div className="flex flex-col items-center gap-1"><MoreHorizontal size={18}/><span>More</span></div>
        <div className="flex flex-col items-center gap-1"><LayoutGrid size={18}/><span>Hub</span></div>
        <div className="flex flex-col items-center gap-1 text-[#f0b90b]"><Zap size={18}/><span>Spot</span></div>
      </div>

    </div>
  );
};

export default Trade;