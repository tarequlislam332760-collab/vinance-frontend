import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { ChevronDown, MoreHorizontal, Settings, Plus, Minus, Info, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';

// সাব-কম্পোনেন্ট ইমপোর্ট
import OrderBook from "../components/OrderBook";
import PositionTable from "../components/PositionTable";
import LeverageSlider from "../components/LeverageSlider";
const api = axios.create({
  baseURL: "https://vinance-backend.vercel.app",
  withCredentials: true 
});

const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, token } = useContext(UserContext);
  const [leverage, setLeverage] = useState(60);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('buy'); 
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState('0.0');
  
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

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

  const adjustAmount = (val) => {
    setAmount(prev => {
      const currentVal = parseFloat(prev) || 0;
      const newVal = Math.max(0, currentVal + val);
      return newVal === 0 ? "" : newVal.toString();
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#12161c] text-[#848e9c] font-sans select-none overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#12161c] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-bold text-xl flex items-center gap-1">
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

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Side: Trading Form */}
        <div className="w-full md:w-[350px] p-3 space-y-4 border-r border-gray-800 bg-[#12161c]">
          <div className="flex gap-1.5">
            <button className="bg-[#2b3139] px-3 py-1 rounded text-[11px] text-white font-medium flex items-center gap-1">Cross <ChevronDown size={10}/></button>
            <button className="bg-[#2b3139] px-3 py-1 rounded text-[11px] text-white font-medium flex items-center gap-1">{leverage}x <ChevronDown size={10}/></button>
          </div>

          <div className="flex bg-[#2b3139] rounded p-0.5 h-9">
            <button onClick={() => setSide('buy')} className={`flex-1 flex items-center justify-center text-[13px] font-bold rounded transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#12161c]' : 'text-gray-400'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`flex-1 flex items-center justify-center text-[13px] font-bold rounded transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="flex items-center gap-1">Avbl <Info size={10}/></span>
              <span className="text-white font-medium">{user?.balance?.toFixed(2) || '0.00'} USDT <Plus size={10} className="inline text-[#f0b90b] ml-1" /></span>
            </div>

            <div className="bg-[#2b3139] py-2.5 px-3 rounded text-[13px] text-white flex justify-between items-center">
              <span>Market</span>
              <ChevronDown size={14} className="text-gray-500" />
            </div>

            <div className="bg-[#2b3139] py-2.5 rounded text-center text-[13px] text-gray-400 font-bold">
              Price: <span className="text-white ml-1">{currentPrice}</span>
            </div>

            {/* Amount Input */}
            <div className="flex items-center bg-[#2b3139] rounded h-10 border border-transparent focus-within:border-[#f0b90b]">
              <button onClick={() => adjustAmount(-1)} className="px-3 text-gray-400 hover:text-white"><Minus size={16}/></button>
              <input 
                type="number" 
                placeholder="Amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full bg-transparent text-center text-white text-[13px] font-bold outline-none" 
              />
              <div className="flex items-center gap-1 pr-2 text-[11px] text-gray-400 border-l border-gray-700 pl-2">USDT</div>
              <button onClick={() => adjustAmount(1)} className="px-3 text-gray-400 hover:text-white"><Plus size={16}/></button>
            </div>

            {/* Custom Leverage Slider Component */}
            <LeverageSlider onChange={(v) => setLeverage(v)} />

            <button 
              onClick={handleTrade} 
              disabled={loading} 
              className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.98] mt-2 ${loading ? 'opacity-50' : side === 'buy' ? 'bg-[#02c076] text-[#12161c]' : 'bg-[#f6465d] text-white'}`}
            >
              {loading ? "Processing..." : side === 'buy' ? "Buy / Long" : "Sell / Short"}
            </button>
          </div>
        </div>

        {/* Center/Right: OrderBook & Positions */}
        <div className="flex-1 flex flex-col bg-[#0b0e11] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Live Order Book */}
            <div className="lg:col-span-4 border-r border-gray-800">
               <OrderBook symbol={currentCoin} />
            </div>
            
            {/* Chart Area (Placeholder) */}
            <div className="lg:col-span-8 bg-[#12161c] min-h-[300px] flex items-center justify-center text-gray-600 italic">
               Trading View Chart Will Load Here
            </div>
          </div>

          {/* Bottom: Positions Table */}
          <PositionTable positions={user?.positions || []} />
        </div>
      </div>
    </div>
  );
};

export default Futures;