import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { ChevronDown, MoreHorizontal, Settings, Plus, Minus, Info, LayoutGrid } from 'lucide-react';
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
  const [orderData, setOrderData] = useState({ sell: [], buy: [] });
  
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  useEffect(() => {
    const priceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@ticker`);
    priceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentPrice(parseFloat(data.c).toFixed(1)); 
    };

    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@depth10@100ms`);
    depthWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const asks = data.a.slice(0, 6).map(item => ({ price: parseFloat(item[0]).toFixed(1), amount: parseFloat(item[1]).toFixed(3) })).reverse();
      const bids = data.b.slice(0, 6).map(item => ({ price: parseFloat(item[0]).toFixed(1), amount: parseFloat(item[1]).toFixed(3) }));
      setOrderData({ sell: asks, buy: bids });
    };

    return () => { priceWs.close(); depthWs.close(); };
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
        setAmount(""); // 🚀 এটি এখন নিশ্চিতভাবে ইনপুট বক্স খালি করবে
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

  const handleSlider = (percent) => {
    if (!user?.balance) return;
    const calculated = (user.balance * (percent / 100)).toFixed(2);
    setAmount(calculated === "0.00" ? "" : calculated);
  };

  return (
    <div className="flex flex-col h-screen bg-[#12161c] text-[#848e9c] overflow-hidden font-sans select-none">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#12161c]">
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

      <div className="flex flex-1 overflow-hidden border-t border-gray-800">
        {/* Left Side: Order Form */}
        <div className="w-[58%] p-3 space-y-4 overflow-y-auto border-r border-gray-800">
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

            <div className="bg-[#2b3139] py-2.5 rounded text-center text-[13px] text-gray-500 font-bold">
              {currentPrice}
            </div>

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

            {/* Slider */}
            <div className="py-4 px-1 relative">
              <div className="h-[2px] bg-[#2b3139] w-full rounded relative">
                <div className="absolute h-full bg-[#f0b90b]" style={{ width: `${(parseFloat(amount) / user?.balance * 100) || 0}%` }}></div>
                {[0, 25, 50, 75, 100].map(p => (
                  <div 
                    key={p} 
                    onClick={() => handleSlider(p)}
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#12161c] rounded-sm cursor-pointer transition-colors ${ (parseFloat(amount) / user?.balance * 100) >= p ? 'bg-[#f0b90b]' : 'bg-[#2b3139]' }`} 
                    style={{left: `${p}%`}}
                  ></div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleTrade} 
              disabled={loading} 
              className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.98] mt-2 ${loading ? 'opacity-50' : side === 'buy' ? 'bg-[#02c076] text-[#12161c]' : 'bg-[#f6465d] text-white'}`}
            >
              {loading ? "Processing..." : side === 'buy' ? "Buy / Long" : "Sell / Short"}
            </button>
          </div>
        </div>

        {/* Right Side: Order Book */}
        <div className="w-[42%] flex flex-col pt-3">
          <div className="flex justify-between px-3 text-[10px] text-gray-500 font-medium mb-3">
            <div className="flex flex-col"><span>Price</span><span>(USDT)</span></div>
            <div className="flex flex-col text-right"><span>Amount</span><span>(USDT)</span></div>
          </div>

          <div className="flex-1 px-2 space-y-[1px]">
            {orderData.sell.map((order, i) => (
              <div key={i} className="flex justify-between text-[11px] relative h-5 items-center">
                <div className="absolute right-0 top-0 bottom-0 bg-[#f6465d15]" style={{width: `${Math.random() * 80}%`}}></div>
                <span className="text-[#f6465d] z-10">{order.price}</span>
                <span className="text-gray-300 z-10">{order.amount}</span>
              </div>
            ))}

            <div className="py-3 text-center border-y border-gray-800 my-2">
              <div className="text-lg font-bold text-[#02c076] leading-none">{currentPrice}</div>
              <div className="text-[11px] text-gray-500 mt-1">≈ ${currentPrice}</div>
            </div>

            {orderData.buy.map((order, i) => (
              <div key={i} className="flex justify-between text-[11px] relative h-5 items-center">
                <div className="absolute right-0 top-0 bottom-0 bg-[#02c07615]" style={{width: `${Math.random() * 80}%`}}></div>
                <span className="text-[#02c076] z-10">{order.price}</span>
                <span className="text-gray-300 z-10">{order.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Futures;