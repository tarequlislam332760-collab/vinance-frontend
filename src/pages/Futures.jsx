import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { ChevronDown, MoreHorizontal, Settings, ChevronLeft, Plus, Minus, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const [priceColor, setPriceColor] = useState('text-white');
  const [orderData, setOrderData] = useState({ sell: [], buy: [] });
  
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  useEffect(() => {
    const priceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@ticker`);
    priceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newPrice = parseFloat(data.c).toFixed(1);
      if (newPrice > currentPrice) setPriceColor('text-[#02c076]');
      else if (newPrice < currentPrice) setPriceColor('text-[#f6465d]');
      setCurrentPrice(newPrice); 
    };

    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@depth10@100ms`);
    depthWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const asks = data.a.slice(0, 7).map(item => ({ price: parseFloat(item[0]).toFixed(1), amount: parseFloat(item[1]).toFixed(3) })).reverse();
      const bids = data.b.slice(0, 7).map(item => ({ price: parseFloat(item[0]).toFixed(1), amount: parseFloat(item[1]).toFixed(3) }));
      setOrderData({ sell: asks, buy: bids });
    };

    return () => { priceWs.close(); depthWs.close(); };
  }, [currentCoin, currentPrice]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter valid amount");
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
      toast.success(res.data.message);
      setAmount('');
      if (refreshUser) await refreshUser();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Trade failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#12161c] text-[#848e9c] overflow-hidden font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#12161c] border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ChevronLeft size={20} className="text-white cursor-pointer" onClick={() => window.history.back()} />
          <h2 className="text-white font-bold text-lg flex items-center gap-1">
            {currentCoin}USDT <span className="text-[#02c076] text-xs">+2.44%</span> <ChevronDown size={14} />
          </h2>
        </div>
        <div className="flex gap-4 items-center">
          <Settings size={18} className="cursor-pointer" />
          <MoreHorizontal size={18} className="cursor-pointer" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Trade Panel */}
        <div className="w-[58%] p-3 space-y-4 border-r border-gray-800 overflow-y-auto">
          {/* Margin Mode & Leverage */}
          <div className="flex gap-2">
            <button className="flex-1 bg-[#2b3139] py-1 rounded text-xs text-white">Cross</button>
            <button className="flex-1 bg-[#2b3139] py-1 rounded text-xs text-white">{leverage}x</button>
            <button className="bg-[#2b3139] px-2 py-1 rounded text-xs text-white font-bold">S</button>
          </div>

          {/* Buy/Sell Tabs */}
          <div className="flex bg-[#2b3139] rounded p-1">
            <button onClick={() => setSide('buy')} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-400'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div className="flex justify-between text-[10px]">
              <span>Avbl</span>
              <span className="text-white flex items-center gap-1">{user?.balance?.toLocaleString() || '0.00'} USDT <Plus size={10} className="text-[#f0b90b]" /></span>
            </div>

            <div className="bg-[#2b3139] p-2.5 rounded flex justify-between items-center cursor-pointer">
              <span className="text-white text-xs">Market</span>
              <ChevronDown size={14} />
            </div>

            <div className="bg-[#2b3139] py-2 rounded text-center text-xs text-gray-500 font-bold">Market Price</div>

            <div className="bg-[#2b3139] rounded flex items-center p-1 border border-transparent focus-within:border-[#f0b90b]">
              <button onClick={() => setAmount(prev => Math.max(0, Number(prev)-1))} className="px-2 text-white"><Minus size={14}/></button>
              <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-center text-white text-xs font-bold outline-none" />
              <div className="flex items-center gap-1 px-2 border-l border-gray-600 text-[10px] text-white">USDT <ChevronDown size={10}/></div>
              <button onClick={() => setAmount(prev => Number(prev)+1)} className="px-2 text-white"><Plus size={14}/></button>
            </div>

            {/* Slider Mockup */}
            <div className="relative h-6 flex items-center px-1">
               <div className="w-full h-[1px] bg-gray-600 rounded"></div>
               {[0, 25, 50, 75, 100].map((dot) => (
                 <div key={dot} className="absolute w-1.5 h-1.5 bg-gray-500 rounded-full border border-[#12161c]" style={{left: `${dot}%`}}></div>
               ))}
            </div>

            <div className="space-y-2 text-[10px]">
              <div className="flex items-center gap-2"><input type="checkbox" className="accent-[#f0b90b]" /> <span>Slippage Tolerance</span></div>
              <div className="flex items-center gap-2"><input type="checkbox" className="accent-[#f0b90b]" /> <span>TP/SL</span></div>
              <div className="flex items-center gap-2 text-gray-500"><input type="checkbox" disabled /> <span>Reduce Only</span></div>
            </div>

            <div className="flex justify-between text-[11px] pt-1">
              <span>Max</span>
              <span className="text-white">{(user?.balance * leverage / parseFloat(currentPrice || 1)).toFixed(3)} {currentCoin}</span>
            </div>

            <button onClick={handleTrade} disabled={loading} className={`w-full py-3.5 rounded font-bold text-sm uppercase transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#12161c]' : 'bg-[#f6465d] text-white'}`}>
              {loading ? "..." : side === 'buy' ? "Buy / Long" : "Sell / Short"}
            </button>
          </div>
        </div>

        {/* Right Side: Order Book & Trades */}
        <div className="w-[42%] flex flex-col bg-[#12161c] pt-2 border-l border-gray-800">
           <div className="flex justify-between px-2 text-[9px] text-gray-500 mb-2 uppercase">
             <span>Price(USDT)</span>
             <span>Amount(USDT)</span>
           </div>
           
           <div className="flex-1 px-1 overflow-hidden flex flex-col">
              <div className="space-y-[2px]">
                {orderData.sell.map((order, i) => (
                  <div key={i} className="flex justify-between text-[10px] relative">
                    <span className="text-[#f6465d] z-10">{order.price}</span>
                    <span className="text-gray-400 z-10">{order.amount}</span>
                  </div>
                ))}
              </div>

              <div className={`py-3 text-center text-lg font-bold border-y border-gray-800 my-1 bg-[#1e2329] rounded ${priceColor}`}>
                {currentPrice} <span className="text-xs">≈</span>
              </div>

              <div className="space-y-[2px]">
                {orderData.buy.map((order, i) => (
                  <div key={i} className="flex justify-between text-[10px]">
                    <span className="text-[#02c076]">{order.price}</span>
                    <span className="text-gray-400">{order.amount}</span>
                  </div>
                ))}
              </div>
           </div>

           {/* Precision selector */}
           <div className="p-2 border-t border-gray-800 flex justify-between items-center text-[10px]">
              <div className="bg-[#2b3139] px-2 py-0.5 rounded flex items-center gap-1">0.1 <ChevronDown size={10}/></div>
              <div className="flex gap-1 text-[#02c076]"><div className="w-2 h-2 bg-current rounded-sm"></div><div className="w-2 h-2 bg-[#f6465d] rounded-sm"></div></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Futures;