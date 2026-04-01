import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { ChevronDown, MoreHorizontal, Zap, ChevronLeft, Info } from 'lucide-react';

const api = axios.create({
  baseURL: "https://vinance-backend.vercel.app",
  withCredentials: true 
});

const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, token } = useContext(UserContext);
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
      setCurrentPrice(parseFloat(data.c).toFixed(1)); 
    };

    // ২. রিয়েল অর্ডার বুকের জন্য WebSocket
    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@depth10@1000ms`);

    depthWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const asks = data.a.slice(0, 6).map(item => ({
        price: parseFloat(item[0]).toFixed(1),
        amount: parseFloat(item[1]).toFixed(3)
      })).reverse();

      const bids = data.b.slice(0, 6).map(item => ({
        price: parseFloat(item[0]).toFixed(1),
        amount: parseFloat(item[1]).toFixed(3)
      }));

      setOrderData({ sell: asks, buy: bids });
    };

    return () => {
      priceWs.close();
      depthWs.close();
    };
  }, [currentCoin]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter amount");
    setLoading(true);
    try {
      // ব্যাকএন্ডে ডাটা পাঠানো হচ্ছে
      const res = await api.post('/api/futures/trade', { 
        type: side,
        amount: parseFloat(amount), 
        leverage: leverage,
        symbol: currentCoin,
        entryPrice: parseFloat(currentPrice) // লাইভ প্রাইস পাঠানো হচ্ছে
      }, {
        headers: { Authorization: `Bearer ${token}` } // টোকেন পাস করা হচ্ছে
      });
      
      alert(res.data.message);
      if (refreshUser) await refreshUser();
    } catch (err) { 
      alert(err.response?.data?.message || "Trade failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans text-left">
      {/* Top Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 bg-[#0b0e11]">
        <div className="flex items-center gap-2">
          <ChevronLeft size={20} className="text-gray-400 cursor-pointer" onClick={() => window.history.back()} />
          <h2 className="text-lg font-bold flex items-center gap-1">
            {currentCoin}USDT <span className="text-[10px] bg-[#2b3139] px-1 rounded text-gray-400 font-normal">Perp</span>
            <ChevronDown size={14} className="text-gray-500" />
          </h2>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Zap size={18} />
          <MoreHorizontal size={18} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Trading Controls */}
        <div className="w-[60%] p-3 space-y-4 border-r border-gray-900 overflow-y-auto pb-24">
          <div className="flex gap-2">
            <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-[11px] font-bold uppercase tracking-wider">Cross</button>
            <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-[11px] font-bold uppercase tracking-wider">{leverage}x</button>
          </div>

          <div className="flex bg-[#2b3139] rounded-lg overflow-hidden p-1">
            <button 
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 text-xs font-black uppercase transition-all rounded-md ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-400'}`}
            >Buy</button>
            <button 
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 text-xs font-black uppercase transition-all rounded-md ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}
            >Sell</button>
          </div>

          {/* Leverage Slider (1-100x) */}
          <div className="bg-[#161a1e] p-3 rounded-xl border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1">Leverage <Info size={10}/></span>
                  <span className="text-[#f0b90b] font-bold text-xs">{leverage}x</span>
              </div>
              <input 
                  type="range" min="1" max="100" value={leverage} 
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#f0b90b]"
              />
          </div>

          <div className="text-[10px] text-gray-500 flex justify-between px-1">
            <span>Available</span>
            <span className="text-white font-mono">${user?.balance?.toLocaleString() || '0.00'} USDT</span>
          </div>

          {/* Price & Amount Inputs */}
          <div className="space-y-2">
              <div className="bg-[#2b3139] p-2.5 rounded flex justify-between items-center text-xs font-bold text-gray-400 border border-transparent focus-within:border-gray-600">
                <span>Limit</span>
                <ChevronDown size={14} />
              </div>

              <div className="flex items-center bg-[#2b3139] rounded-lg border border-transparent focus-within:border-gray-600 overflow-hidden">
                <input type="text" value={currentPrice} className="w-full bg-transparent py-2.5 text-center text-xs font-bold outline-none text-[#eaecef]" readOnly />
                <span className="pr-3 text-[9px] font-bold text-gray-500">USDT</span>
              </div>

              <div className="flex items-center bg-[#2b3139] rounded-lg border border-transparent focus-within:border-gray-600 overflow-hidden">
                <input 
                  type="number" placeholder="Amount" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-center text-xs font-bold outline-none" 
                />
                <span className="pr-3 text-[9px] font-bold text-gray-500 uppercase">USDT</span>
              </div>
          </div>

          <button 
            onClick={handleTrade}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11] shadow-[#02c076]/10' : 'bg-[#f6465d] text-white shadow-[#f6465d]/10'}`}
          >
            {loading ? "Processing..." : side === 'buy' ? "Open Long" : "Open Short"}
          </button>
        </div>

        {/* Right Side: Real-time Order Book */}
        <div className="w-[40%] p-2 text-[10px] flex flex-col justify-between bg-[#0b0e11]">
          <div className="flex justify-between text-gray-500 font-bold opacity-60 pb-2">
            <span>Price</span>
            <span>Amount</span>
          </div>
          
          <div className="space-y-1.5">
            {orderData.sell.map((order, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-[#f6465d] font-mono font-medium">{order.price}</span>
                <span className="text-gray-400">{order.amount}</span>
              </div>
            ))}
          </div>

          <div className="py-5 text-center border-y border-gray-900/50 my-2">
            <div className={`text-lg font-bold ${side === 'buy' ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
              {currentPrice !== 'loading...' ? parseFloat(currentPrice).toLocaleString() : '---'}
            </div>
            <div className="text-gray-500 text-[9px] font-medium">≈ ${currentPrice}</div>
          </div>

          <div className="space-y-1.5">
            {orderData.buy.map((order, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-[#02c076] font-mono font-medium">{order.price}</span>
                <span className="text-gray-400">{order.amount}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 flex justify-between bg-[#1e2329] p-1.5 rounded text-gray-400 font-bold">
             <span>0.1</span>
             <ChevronDown size={12} />
          </div>
        </div>
      </div>

      {/* Bottom Tabs Section */}
      <div className="bg-[#0b0e11] border-t border-gray-900 p-3 pb-20">
          <div className="flex gap-6 text-[11px] font-black uppercase tracking-wider border-b border-gray-900/50 pb-2">
            <span className="text-white border-b-2 border-[#f0b90b] pb-2">Positions(0)</span>
            <span className="text-gray-500">Open Orders(0)</span>
          </div>
          <div className="py-8 flex flex-col items-center opacity-20">
            <MoreHorizontal size={30} />
            <p className="text-[9px] mt-2 uppercase tracking-[0.2em] font-bold">No Records Found</p>
          </div>
      </div>
    </div>
  );
};

export default Futures;