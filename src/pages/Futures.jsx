import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { ChevronDown, MoreHorizontal, Zap } from 'lucide-react';

const api = axios.create({
  baseURL: "https://vinance-backend.vercel.app",
  withCredentials: true 
});

const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser } = useContext(UserContext);
  const [leverage, setLeverage] = useState(20);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('buy'); 
  const [loading, setLoading] = useState(false);

  // --- Real-Time Binance Data Logic ---
  const [currentPrice, setCurrentPrice] = useState('loading...');
  const [orderData, setOrderData] = useState({ sell: [], buy: [] });
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  useEffect(() => {
    // ১. লাইভ প্রাইসের জন্য WebSocket
    const priceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@ticker`);

    priceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentPrice(parseFloat(data.c).toFixed(1)); // 'c' হলো বর্তমান ক্লোজ প্রাইস
    };

    // ২. রিয়েল অর্ডার বুকের জন্য WebSocket (Depth)
    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@depth10@1000ms`);

    depthWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Asks (Sellers - Red) - প্রথম ৬টি ডাটা
      const asks = data.a.slice(0, 6).map(item => ({
        price: parseFloat(item[0]).toFixed(1),
        amount: parseFloat(item[1]).toFixed(3)
      })).reverse(); // রিভার্স করা হয়েছে যাতে বেশি দামগুলো উপরে থাকে

      // Bids (Buyers - Green) - প্রথম ৬টি ডাটা
      const bids = data.b.slice(0, 6).map(item => ({
        price: parseFloat(item[0]).toFixed(1),
        amount: parseFloat(item[1]).toFixed(3)
      }));

      setOrderData({ sell: asks, buy: bids });
    };

    // ক্লিনআপ ফাংশন (পেজ পরিবর্তন করলে কানেকশন বন্ধ হবে)
    return () => {
      priceWs.close();
      depthWs.close();
    };
  }, [currentCoin]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter amount");
    setLoading(true);
    try {
      const res = await api.post('/api/futures/trade', { 
        type: side,
        amount: parseFloat(amount), 
        leverage: leverage,
        symbol: currentCoin 
      });
      alert(res.data.message);
      if (refreshUser) await refreshUser();
    } catch (err) { 
      alert(err.response?.data?.message || "Trade failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold flex items-center gap-1">
            {currentCoin}USD CM <span className="text-[10px] bg-[#2b3139] px-1 rounded text-gray-400">Perp</span>
            <ChevronDown size={14} className="text-gray-500" />
          </h2>
          <span className="text-[#02c076] text-xs font-bold">+1.77%</span>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Zap size={18} />
          <MoreHorizontal size={18} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Trading Controls */}
        <div className="w-[60%] p-3 space-y-4 border-r border-gray-900 overflow-y-auto">
          <div className="flex gap-2">
            <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-xs font-bold">Cross</button>
            <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-xs font-bold">{leverage}x</button>
          </div>

          <div className="flex bg-[#2b3139] rounded overflow-hidden">
            <button 
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 text-xs font-bold transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-400'}`}
            >Buy</button>
            <button 
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 text-xs font-bold transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}
            >Sell</button>
          </div>

          <div className="text-[10px] text-gray-500 flex justify-between">
            <span>Avbl</span>
            <span className="text-white">0.0000 BTC ⇄</span>
          </div>

          <div className="bg-[#2b3139] p-2 rounded flex justify-between items-center text-xs font-bold">
            <span>Limit</span>
            <ChevronDown size={14} />
          </div>

          {/* Price Input (Real-time from Binance) */}
          <div className="flex items-center bg-[#2b3139] rounded overflow-hidden">
            <button className="px-3 py-2 text-gray-400">-</button>
            <input type="text" value={currentPrice} className="w-full bg-transparent text-center text-xs font-bold outline-none" readOnly />
            <button className="px-3 py-2 text-gray-400">+</button>
            <span className="pr-2 text-[10px] text-gray-500">BBO</span>
          </div>

          <div className="flex items-center bg-[#2b3139] rounded overflow-hidden">
            <button className="px-3 py-2 text-gray-400">-</button>
            <input 
              type="number" 
              placeholder="Amount" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-center text-xs font-bold outline-none" 
            />
            <button className="px-3 py-2 text-gray-400">+</button>
            <span className="pr-2 text-[10px] text-gray-500">Cont <ChevronDown size={10} /></span>
          </div>

          <div className="flex justify-between px-1 relative items-center py-2">
             <div className="h-[1px] bg-gray-700 absolute w-full left-0 z-0"></div>
             {[0, 25, 50, 75, 100].map(dot => (
               <div key={dot} className="w-2 h-2 rounded-full border border-gray-600 bg-[#0b0e11] z-10"></div>
             ))}
          </div>

          <div className="space-y-2 text-[10px] text-gray-400">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-yellow-500" /> TP/SL</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-yellow-500" /> Reduce Only</label>
          </div>

          <button 
            onClick={handleTrade}
            className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}
          >
            {loading ? "Processing..." : side === 'buy' ? "Open Long" : "Open Short"}
          </button>
        </div>

        {/* Right Side: Real-time Order Book */}
        <div className="w-[40%] p-2 text-[10px] flex flex-col justify-between">
          <div className="flex justify-between text-gray-500 pb-2">
            <span>Price (USD)</span>
            <span>Amount (Cont)</span>
          </div>
          
          {/* Real Sell Orders (Red) */}
          <div className="space-y-1">
            {orderData.sell.map((order, i) => (
              <div key={i} className="flex justify-between transition-all duration-300">
                <span className="text-[#f6465d] font-mono">{order.price}</span>
                <span className="text-gray-400">{order.amount}</span>
              </div>
            ))}
          </div>

          {/* Center Real Price Display */}
          <div className="py-4 text-center">
            <div className="text-[#02c076] text-lg font-bold">
              {currentPrice !== 'loading...' ? parseFloat(currentPrice).toLocaleString() : '---'}
            </div>
            <div className="text-gray-500 text-[9px]">≈ {currentPrice} USD</div>
          </div>

          {/* Real Buy Orders (Green) */}
          <div className="space-y-1">
            {orderData.buy.map((order, i) => (
              <div key={i} className="flex justify-between transition-all duration-300">
                <span className="text-[#02c076] font-mono">{order.price}</span>
                <span className="text-gray-400">{order.amount}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-2 flex justify-between bg-[#1e2329] p-1 rounded cursor-pointer">
             <span>0.1</span>
             <ChevronDown size={12} />
          </div>
        </div>
      </div>

      <div className="bg-[#0b0e11] border-t border-gray-900 p-3">
          <div className="flex gap-6 text-xs font-bold border-b border-gray-900 pb-2">
            <span className="text-white border-b-2 border-yellow-500 pb-2">Positions (0)</span>
            <span className="text-gray-500">Open Orders (0)</span>
          </div>
          <div className="py-10 flex flex-col items-center opacity-30">
            <MoreHorizontal size={40} />
            <p className="text-[10px] mt-2 uppercase tracking-widest">No Active Positions</p>
          </div>
      </div>
    </div>
  );
};

export default Futures;