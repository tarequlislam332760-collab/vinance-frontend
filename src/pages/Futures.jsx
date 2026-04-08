import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { ChevronDown, MoreHorizontal, Settings, Plus, Minus, Info, LayoutGrid, Activity } from 'lucide-react';
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
  
  // --- নতুন যোগ করা স্টেট (ট্যাব পরিবর্তনের জন্য) ---
  const [activeTab, setActiveTab] = useState('positions');

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
    <div className="flex flex-col min-h-screen bg-[#0b0e11] text-[#848e9c] font-sans select-none overflow-x-hidden">
      {/* --- Header Section (No Change) --- */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#161a1e] border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer">
            <h2 className="text-white font-bold text-lg">{currentCoin}USDT</h2>
            <span className="bg-gray-800 text-[10px] px-1 rounded text-gray-400">Perp</span>
            <ChevronDown size={14} />
          </div>
          <div className="text-[#02c076] text-sm font-bold">+2.44%</div>
        </div>
        <div className="flex gap-4 items-center text-gray-400">
          <Activity size={18} className="hover:text-[#f0b90b] cursor-pointer" />
          <Settings size={18} className="cursor-pointer" />
          <MoreHorizontal size={18} className="cursor-pointer" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* --- Left Column: Order Book (No Change) --- */}
        <div className="w-full md:w-64 bg-[#161a1e] border-r border-gray-800 flex flex-col p-2">
          <div className="flex justify-between text-[10px] mb-2 px-1">
            <span>Price(USDT)</span>
            <span>Amount(USDT)</span>
          </div>
          <div className="space-y-[1px] mb-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-between text-[12px] relative h-5 items-center px-1">
                <span className="text-[#f6465d] z-10">{(parseFloat(currentPrice) + (i * 0.2)).toFixed(1)}</span>
                <span className="text-gray-300 z-10">{(Math.random() * 5).toFixed(2)}K</span>
              </div>
            ))}
          </div>
          <div className="py-2 border-y border-gray-800 my-1 text-center font-bold text-[#02c076] text-lg">{currentPrice}</div>
          <div className="space-y-[1px]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-between text-[12px] relative h-5 items-center px-1">
                <span className="text-[#02c076] z-10">{(parseFloat(currentPrice) - (i * 0.2)).toFixed(1)}</span>
                <span className="text-gray-300 z-10">{(Math.random() * 5).toFixed(2)}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Middle Column: Chart & Position Table --- */}
        <div className="flex-1 flex flex-col bg-[#0b0e11]">
          <div className="flex-1 min-h-[400px] border-b border-gray-800 relative">
            <iframe
              title="Binance Futures Chart"
              src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT.P&interval=15&theme=dark&style=1&timezone=Etc%2FUTC`}
              className="absolute inset-0 w-full h-full border-none"
            ></iframe>
          </div>

          {/* --- আপডেট করা অপশন ট্যাব --- */}
          <div className="h-64 overflow-y-auto bg-[#161a1e]">
            <div className="flex gap-6 border-b border-gray-800 px-4 py-0 text-[12px] font-bold">
              <button 
                onClick={() => setActiveTab('positions')}
                className={`pb-2 pt-2 transition-all cursor-pointer ${activeTab === 'positions' ? 'text-white border-b-2 border-[#f0b90b]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Positions({user?.positions?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`pb-2 pt-2 transition-all cursor-pointer ${activeTab === 'orders' ? 'text-white border-b-2 border-[#f0b90b]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Open Orders(0)
              </button>
              <button 
                onClick={() => setActiveTab('assets')}
                className={`pb-2 pt-2 transition-all cursor-pointer ${activeTab === 'assets' ? 'text-white border-b-2 border-[#f0b90b]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Assets
              </button>
            </div>

            {/* ট্যাব অনুযায়ী কন্টেন্ট প্রদর্শন */}
            <div className="p-2">
              {activeTab === 'positions' && (
                <PositionTable positions={user?.positions || []} />
              )}
              {activeTab === 'orders' && (
                <div className="text-center py-10 text-gray-600 text-sm italic font-medium">No open orders</div>
              )}
              {activeTab === 'assets' && (
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Wallet Balance</span>
                    <span className="text-white font-bold">{user?.balance?.toFixed(2) || '0.00'} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#02c076]">
                    <span>Unrealized PNL</span>
                    <span className="font-bold">0.00 USDT</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Right Column: Trade Form (No Change) --- */}
        <div className="w-full md:w-[320px] p-4 bg-[#161a1e] border-l border-gray-800 space-y-4">
          <div className="flex gap-2">
            <button className="flex-1 bg-gray-800 py-1.5 rounded text-[11px] text-white font-bold flex items-center justify-center gap-1 uppercase tracking-wider">Cross <ChevronDown size={12}/></button>
            <button className="flex-1 bg-gray-800 py-1.5 rounded text-[11px] text-white font-bold flex items-center justify-center gap-1 uppercase tracking-wider">{leverage}x <ChevronDown size={12}/></button>
          </div>

          <div className="flex bg-gray-800 rounded p-1 h-10">
            <button onClick={() => setSide('buy')} className={`flex-1 flex items-center justify-center text-[13px] font-bold rounded transition-all ${side === 'buy' ? 'bg-[#02c076] text-black' : 'text-gray-400'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`flex-1 flex items-center justify-center text-[13px] font-bold rounded transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[11px]">
              <span className="flex items-center gap-1">Avbl</span>
              <span className="text-white font-bold">{user?.balance?.toFixed(2) || '0.00'} USDT <Plus size={10} className="inline text-[#f0b90b] ml-1 cursor-pointer" /></span>
            </div>

            <div className="bg-[#2b3139] py-2.5 px-3 rounded text-[13px] text-white flex justify-between items-center cursor-pointer hover:bg-[#363c45]">
              <span>Market</span>
              <ChevronDown size={14} className="text-gray-500" />
            </div>

            <div className="bg-[#2b3139] py-2.5 rounded text-center text-[13px] text-gray-400 font-bold border border-transparent">
              Price: <span className="text-white ml-1">Market Price</span>
            </div>

            <div className="flex items-center bg-[#2b3139] rounded h-11 border border-transparent focus-within:border-[#f0b90b] px-1">
              <button onClick={() => adjustAmount(-1)} className="p-2 text-gray-400 hover:text-white"><Minus size={16}/></button>
              <input 
                type="number" 
                placeholder="Amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full bg-transparent text-center text-white text-[14px] font-bold outline-none" 
              />
              <div className="text-[11px] font-bold text-gray-400 px-2 border-l border-gray-700">USDT</div>
              <button onClick={() => adjustAmount(1)} className="p-2 text-gray-400 hover:text-white"><Plus size={16}/></button>
            </div>

            <LeverageSlider onChange={(v) => setLeverage(v)} />

            <div className="flex flex-col gap-1 text-[11px] pt-2">
              <div className="flex justify-between"><span>Max</span><span className="text-white font-medium">3,033.12 USDT</span></div>
              <div className="flex justify-between"><span>Cost</span><span className="text-white font-medium">0.00 USDT</span></div>
            </div>

            <button 
              onClick={handleTrade} 
              disabled={loading} 
              className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.98] shadow-lg ${loading ? 'opacity-50' : side === 'buy' ? 'bg-[#02c076] text-black' : 'bg-[#f6465d] text-white'}`}
            >
              {loading ? "Processing..." : side === 'buy' ? "Buy / Long" : "Sell / Short"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Futures;