import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { MoreHorizontal, LayoutGrid, ArrowRightLeft } from 'lucide-react'; // একবার ইম্পোর্ট করলেই হবে

const TradePage = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentCoin = (coinSymbol || 'btc').toUpperCase();

  const handleTrade = async (type) => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter valid amount");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/trade`, 
        { type, amount: parseFloat(amount), symbol: currentCoin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (refreshUser) await refreshUser();
      setAmount('');
    } catch (err) {
      alert(err.response?.data?.message || "Trade failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-white overflow-hidden font-sans">
      
      {/* Top Header - ছবির মতো */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{currentCoin}USDT</h1>
          <span className="bg-gray-800 text-[10px] px-1 rounded text-gray-400 font-bold uppercase">Perp</span>
          <div className="text-xs text-gray-500">▼</div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <MoreHorizontal size={20} />
          <div className="relative">
             <span className="absolute -top-1 -right-1 bg-yellow-500 text-[8px] text-black px-1 rounded-full font-bold">New</span>
             <span className="text-xs font-bold">Trade-X</span>
          </div>
        </div>
      </div>

      {/* Price Info Bar */}
      <div className="flex items-center gap-6 px-4 py-2 bg-[#0b0e11] border-b border-gray-800 text-[11px]">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-[#f6465d]">67,111.0</span>
          <span className="text-gray-400">$67,111.00 <span className="text-[#f6465d]">-0.92%</span></span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-500">
          <div>24h High <span className="text-white ml-1">68,377.0</span></div>
          <div>24h Vol(BTC) <span className="text-white ml-1">198,801.35</span></div>
          <div>24h Low <span className="text-white ml-1">65,938.0</span></div>
          <div>24h Vol(USDT) <span className="text-white ml-1">13.33B</span></div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 relative bg-[#0b0e11]">
        <iframe 
          title="TV" 
          src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&theme=dark&style=1&timezone=Etc%2FUTC&hide_side_toolbar=true&backgroundColor=%230b0e11`} 
          className="w-full h-full border-none"
        ></iframe>
      </div>

      {/* Bottom Trading Buttons - একদম ছবির মতো */}
      <div className="p-4 bg-[#12161c] border-t border-gray-800 pb-28 md:pb-6">
        <div className="flex gap-4 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (USDT)" 
              className="w-full bg-[#1e2329] border-none rounded-lg p-3 text-white outline-none font-bold text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4 items-center">
          <div className="flex flex-col items-center justify-center text-gray-500 px-2 min-w-[40px]">
            <MoreHorizontal size={20} />
            <span className="text-[10px]">More</span>
          </div>
          <div className="flex flex-col items-center justify-center text-gray-500 px-2 min-w-[40px]">
            <LayoutGrid size={20} />
            <span className="text-[10px]">Hub</span>
          </div>
          <div className="flex flex-col items-center justify-center text-gray-500 px-2 min-w-[40px]">
            <ArrowRightLeft size={20} />
            <span className="text-[10px]">Spot</span>
          </div>

          <button 
            disabled={loading}
            onClick={() => handleTrade('buy')}
            className="flex-1 bg-[#2ebd85] text-white py-3 rounded-xl font-bold text-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "..." : "Long"}
          </button>
          <button 
            disabled={loading}
            onClick={() => handleTrade('sell')}
            className="flex-1 bg-[#f6465d] text-white py-3 rounded-xl font-bold text-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "..." : "Short"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradePage;