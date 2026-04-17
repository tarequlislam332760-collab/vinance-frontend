import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ChevronLeft, Bell, Star, MoreHorizontal, LayoutGrid, Zap, Info } from 'lucide-react';

const Trade = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('240'); 

  const currentCoin = (coinSymbol || 'btc').toUpperCase();

  const handleTrade = async (tradeType) => {
    if (!amount || parseFloat(amount) <= 0) return alert("অ্যামাউন্ট লিখুন");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/trade`, 
        { 
          type: tradeType, 
          amount: parseFloat(amount), 
          symbol: currentCoin 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setAmount('');
      if (refreshUser) await refreshUser(); 
    } catch (err) { 
      alert(err.response?.data?.message || "ট্রেড সফল হয়নি"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans">
      {/* Header - Binance Style */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-[#1e2329]">
        <div className="flex items-center gap-3">
          <ChevronLeft size={24} className="text-gray-300 cursor-pointer" onClick={() => window.history.back()} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-white font-bold text-lg">{currentCoin}USDT</span>
              <span className="bg-[#2b3139] text-[9px] px-1 rounded text-gray-400 font-medium">Perp</span>
            </div>
            <span className="text-[10px] text-gray-500">Bitcoin</span>
          </div>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Star size={18} />
          <Bell size={18} />
        </div>
      </div>

      {/* Price Info Section - Exact Image Copy */}
      <div className="px-4 py-3 flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[#f6465d] text-3xl font-bold">67,111.0</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white">$67,111.00</span>
            <span className="text-[#f6465d]">-0.92%</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 font-mono">Mark Price 67,136.5</span>
        </div>
        
        <div className="flex flex-col gap-1 text-right text-[10px] text-gray-500 font-mono">
          <div>24h High <span className="text-gray-300 ml-1">68,377.0</span></div>
          <div>24h Vol(BTC) <span className="text-gray-300 ml-1">198,801.35</span></div>
          <div>24h Low <span className="text-gray-300 ml-1">65,938.0</span></div>
          <div>24h Vol(USDT) <span className="text-gray-300 ml-1">13.33B</span></div>
        </div>
      </div>

      {/* Chart Timeframes */}
      <div className="flex gap-4 px-4 py-1 text-xs text-gray-500 border-b border-[#1e2329]">
        <span className="text-[#f0b90b] border-b border-[#f0b90b]">Time</span>
        <span>15m</span>
        <span>1h</span>
        <span className="text-white font-bold">4h</span>
        <span>1D</span>
        <span>More</span>
      </div>

      {/* Chart Section */}
      <div className="flex-1 w-full bg-[#0b0e11]">
        <iframe 
          title="TV-Full" 
          src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=true&withdateranges=true&hide_side_toolbar=true&allow_symbol_change=false&locale=en`} 
          className="w-full h-full border-none"
        ></iframe>
      </div>
      
      {/* Footer Controls - Exact Image Layout */}
      <div className="bg-[#161a1e] border-t border-[#1e2329] px-4 pt-4 pb-20">
        <div className="flex justify-between items-center mb-3 text-[11px]">
          <div className="flex gap-4 text-gray-400 font-bold">
            <span className="text-[#f0b90b]">MA</span>
            <span>EMA</span>
            <span>BOLL</span>
            <span>VOL</span>
          </div>
          <div className="text-gray-400">
            Available: <span className="text-white font-mono">{user?.balance?.toLocaleString() || '0.00'} USDT</span>
          </div>
        </div>

        {/* Input & Buttons */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input 
              type="number" 
              value={amount} 
              onChange={(e)=>setAmount(e.target.value)} 
              placeholder="Enter Amount" 
              className="w-full bg-[#2b3139] rounded py-3 px-3 text-white outline-none font-mono text-sm border border-transparent focus:border-[#f0b90b]" 
            />
            <span className="absolute right-3 top-3.5 text-gray-500 text-xs font-bold">USDT</span>
          </div>

          <div className="flex gap-3 h-12">
            <button 
              disabled={loading}
              onClick={() => handleTrade('buy')} 
              className="flex-1 bg-[#02c076] text-[#0b0e11] rounded font-bold text-base hover:opacity-90 active:scale-95 transition-all"
            >
              {loading ? '...' : 'Long'}
            </button>
            <button 
              disabled={loading}
              onClick={() => handleTrade('sell')} 
              className="flex-1 bg-[#f6465d] text-white rounded font-bold text-base hover:opacity-90 active:scale-95 transition-all"
            >
              {loading ? '...' : 'Short'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full flex justify-around items-center py-3 bg-[#161a1e] border-t border-[#1e2329] text-[10px] text-gray-500">
        <div className="flex flex-col items-center gap-1"><MoreHorizontal size={18}/><span>More</span></div>
        <div className="flex flex-col items-center gap-1"><LayoutGrid size={18}/><span>Hub</span></div>
        <div className="flex flex-col items-center gap-1 text-[#f0b90b] font-bold"><Zap size={18}/><span>Spot</span></div>
      </div>
    </div>
  );
};

export default Trade;