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
  const [currentPrice, setCurrentPrice] = useState('loading...');
  const [orderData, setOrderData] = useState({ sell: [], buy: [] });
  
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  useEffect(() => {
    const priceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@ticker`);
    priceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentPrice(parseFloat(data.c).toFixed(1)); 
    };

    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@depth10@1000ms`);
    depthWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const asks = data.a.slice(0, 5).map(item => ({ price: parseFloat(item[0]).toFixed(1), amount: parseFloat(item[1]).toFixed(3) })).reverse();
      const bids = data.b.slice(0, 5).map(item => ({ price: parseFloat(item[0]).toFixed(1), amount: parseFloat(item[1]).toFixed(3) }));
      setOrderData({ sell: asks, buy: bids });
    };

    return () => { priceWs.close(); depthWs.close(); };
  }, [currentCoin]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter amount");
    if (currentPrice === 'loading...') return alert("Wait for live price...");
    
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
      
      alert(res.data.message);
      setAmount('');
      if (refreshUser) await refreshUser();
    } catch (err) { 
      alert(err.response?.data?.message || "Trade failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 bg-[#0b0e11]">
        <div className="flex items-center gap-2">
          <ChevronLeft size={20} className="text-gray-400 cursor-pointer" onClick={() => window.history.back()} />
          <h2 className="text-lg font-bold">{currentCoin}USDT Perp</h2>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Zap size={18} />
          <MoreHorizontal size={18} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Controls */}
        <div className="w-[60%] p-3 space-y-4 border-r border-gray-900 overflow-y-auto pb-24">
          <div className="flex gap-2">
            <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-[11px] font-bold">Cross</button>
            <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-[11px] font-bold">{leverage}x</button>
          </div>

          <div className="flex bg-[#2b3139] rounded-lg p-1">
            <button onClick={() => setSide('buy')} className={`flex-1 py-2 text-xs font-bold rounded-md ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-400'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`flex-1 py-2 text-xs font-bold rounded-md ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
          </div>

          <div className="bg-[#161a1e] p-3 rounded-xl border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">Leverage</span>
                  <span className="text-[#f0b90b] font-bold text-xs">{leverage}x</span>
              </div>
              <input type="range" min="1" max="100" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full accent-[#f0b90b]" />
          </div>

          <div className="text-[10px] text-gray-500 flex justify-between">
            <span>Available:</span>
            <span className="text-white font-mono">${user?.balance?.toLocaleString() || '0.00'} USDT</span>
          </div>

          <div className="space-y-2">
              <input type="text" value={currentPrice} className="w-full bg-[#2b3139] py-2.5 text-center text-xs font-bold outline-none rounded" readOnly />
              <input type="number" placeholder="Amount (USDT)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#2b3139] py-2.5 text-center text-xs font-bold outline-none rounded" />
          </div>

          <button onClick={handleTrade} disabled={loading} className={`w-full py-3.5 rounded-xl font-black text-xs uppercase transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}>
            {loading ? "..." : side === 'buy' ? "Open Long" : "Open Short"}
          </button>
        </div>

        {/* Right Side: Order Book */}
        <div className="w-[40%] p-2 text-[10px] flex flex-col bg-[#0b0e11]">
          <div className="space-y-1">
            {orderData.sell.map((order, i) => (
              <div key={i} className="flex justify-between"><span className="text-[#f6465d]">{order.price}</span><span className="text-gray-400">{order.amount}</span></div>
            ))}
            <div className="py-4 text-center text-lg font-bold text-white border-y border-gray-900 my-1">{currentPrice}</div>
            {orderData.buy.map((order, i) => (
              <div key={i} className="flex justify-between"><span className="text-[#02c076]">{order.price}</span><span className="text-gray-400">{order.amount}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Futures;