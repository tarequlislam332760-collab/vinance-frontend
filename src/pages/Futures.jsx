import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { ChevronDown, MoreHorizontal, Settings, Info, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';

// নতুন কম্পোনেন্টগুলো ইম্পোর্ট করা হলো
import OrderBook from '../components/OrderBook';
import LeverageSlider from '../components/LeverageSlider';
import PositionTable from '../components/PositionTable';

const api = axios.create({
  baseURL: "https://vinance-backend.vercel.app",
  withCredentials: true 
});

const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, token } = useContext(UserContext);
  const [leverage, setLeverage] = useState(20); // স্লাইডারের সাথে সিঙ্ক থাকবে
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('buy'); 
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState('0.0');
  
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  // লাইভ প্রাইস আপডেট
  useEffect(() => {
    const priceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@ticker`);
    priceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentPrice(parseFloat(data.c).toFixed(1)); 
    };
    return () => priceWs.close();
  }, [currentCoin]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter valid amount");
    if (parseFloat(amount) > (user?.balance || 0)) return toast.error("Insufficient balance");

    setLoading(true);
    try {
      const res = await api.post('/api/futures/trade', { 
        type: side, 
        amount: parseFloat(amount), 
        leverage: Number(leverage),
        symbol: currentCoin,
        entryPrice: parseFloat(currentPrice) 
      }, {
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setAmount(""); 
        if (refreshUser) await refreshUser(); 
      }
    } catch (err) { 
      toast.error(err.response?.data?.message || "Trade failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#12161c] text-[#848e9c] overflow-x-hidden font-sans select-none pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#12161c] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-bold text-xl flex items-center gap-1 italic">
            {currentCoin}USDT <span className="text-[#02c076] text-xs font-medium">+2.44%</span> <ChevronDown size={16} />
          </h2>
          <div className="flex gap-3 text-gray-400 border-l border-gray-700 pl-3">
             <LayoutGrid size={18} />
          </div>
        </div>
        <div className="flex gap-4 items-center text-gray-400">
          <Settings size={18} />
          <MoreHorizontal size={18} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Trading Form */}
        <div className="w-[60%] p-3 space-y-4 border-r border-gray-800">
          
          {/* Isolated / Cross & Leverage Section */}
          <div className="flex gap-2">
            <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-[11px] text-white font-bold uppercase italic tracking-wider flex items-center justify-center gap-1">
              Cross <ChevronDown size={10}/>
            </button>
            {/* এখানে LeverageSlider থেকে ভ্যালু কন্ট্রোল হবে */}
            <div className="flex-1">
               <button className="w-full bg-[#2b3139] py-1.5 rounded text-[11px] text-white font-bold flex items-center justify-center gap-1 italic">
                {leverage}x <ChevronDown size={10}/>
               </button>
            </div>
          </div>

          {/* Buy/Sell Switch */}
          <div className="flex bg-[#2b3139] rounded p-1 h-10">
            <button onClick={() => setSide('buy')} className={`flex-1 flex items-center justify-center text-[13px] font-black uppercase italic rounded transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#12161c]' : 'text-gray-400'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`flex-1 flex items-center justify-center text-[13px] font-black uppercase italic rounded transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="flex items-center gap-1 uppercase tracking-tighter italic">Available</span>
              <span className="text-white">{user?.balance?.toFixed(2) || '0.00'} USDT</span>
            </div>

            <div className="bg-[#2b3139] py-3 px-3 rounded-lg text-[13px] text-white flex justify-between items-center border border-transparent hover:border-gray-600 transition-all cursor-pointer">
              <span className="font-bold italic uppercase">Market Price</span>
              <ChevronDown size={14} className="text-gray-500" />
            </div>

            {/* Amount Input */}
            <div className="relative group">
               <input 
                type="number" 
                placeholder="Amount (USDT)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full bg-[#2b3139] py-3 px-4 rounded-lg text-white text-[14px] font-black outline-none border border-transparent focus:border-[#f0b90b] transition-all placeholder:text-gray-600 italic" 
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500">USDT</span>
            </div>

            {/* Leverage Slider Component Integration */}
            <LeverageSlider onChange={(val) => setLeverage(val)} />

            {/* Trade Button */}
            <button 
              onClick={handleTrade} 
              disabled={loading} 
              className={`w-full py-4 rounded-xl font-black text-sm uppercase italic tracking-widest transition-all active:scale-[0.95] shadow-lg ${loading ? 'opacity-50' : side === 'buy' ? 'bg-[#02c076] text-[#12161c] shadow-[#02c076]/10' : 'bg-[#f6465d] text-white shadow-[#f6465d]/10'}`}
            >
              {loading ? "Opening..." : side === 'buy' ? "Open Long" : "Open Short"}
            </button>
          </div>
        </div>

        {/* Right Side: Order Book Component Integration */}
        <div className="w-[40%] bg-[#12161c] pt-2">
           <OrderBook coin={currentCoin} />
        </div>
      </div>

      {/* Bottom Section: Positions & Orders Table Integration */}
      <div className="mt-2">
         <PositionTable />
      </div>

    </div>
  );
};

export default Futures;