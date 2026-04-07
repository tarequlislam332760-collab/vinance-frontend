import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { ChevronDown, MoreHorizontal, LayoutGrid, Info, PlusCircle, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// আপনার তৈরি করা নতুন কম্পোনেন্টসমূহ
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
  const [leverage, setLeverage] = useState(20);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('buy'); // 'buy' or 'sell'
  const [orderType, setOrderType] = useState('Market'); // 'Limit', 'Market' etc.
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
    setLoading(true);
    // ... trade logic remains same
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#848e9c] font-sans overflow-hidden select-none">
      
      {/* 1. Top Bar (USD-M, COIN-M...) - Binance App Style */}
      <div className="flex justify-between items-center px-4 py-2.5 bg-[#161a1e] border-b border-gray-900">
        <div className="flex items-center gap-5 text-sm font-bold tracking-tight">
          <span className="text-white border-b-2 border-[#f0b90b] pb-0.5">USDⓈ-M</span>
          <span>COIN-M</span>
          <span>Options</span>
        </div>
        <MoreHorizontal size={20} className="text-gray-500" />
      </div>

      {/* 2. Coin Info Bar */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#161a1e]">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-bold text-xl flex items-center gap-1.5 tracking-tighter italic">
            {currentCoin}USDT <span className="bg-[#2b3139] text-[10px] px-1 py-0.5 rounded text-gray-400 font-normal">Perp</span> <ChevronDown size={16} className="text-gray-500" />
          </h2>
          <span className="text-[#02c076] text-xs font-bold">+2.44%</span>
        </div>
        <div className="flex gap-4 items-center text-gray-400">
          <LayoutGrid size={18} />
          <Maximize2 size={18} />
        </div>
      </div>

      {/* 3. Main content area (Split layout: Form | OrderBook) */}
      <div className="flex flex-1 overflow-hidden border-t border-gray-900">
        
        {/* --- Left Side: Trading Form --- */}
        <div className="w-[60%] p-3 space-y-4 border-r border-gray-900 overflow-y-auto">
          
          {/* Margin Mode & Leverage Buttons */}
          <div className="flex gap-1.5 text-[11px] font-bold uppercase italic">
            <button className="bg-[#2b3139] px-4 py-1.5 rounded flex items-center gap-1 text-white">Cross <ChevronDown size={12} className="text-gray-500"/></button>
            <button className="bg-[#2b3139] px-4 py-1.5 rounded flex items-center gap-1 text-white">{leverage}x <ChevronDown size={12} className="text-gray-500"/></button>
          </div>

          {/* Buy/Sell Switches */}
          <div className="flex bg-[#2b3139] rounded p-0.5 h-9">
            <button onClick={() => setSide('buy')} className={`flex-1 flex items-center justify-center text-[13px] font-black uppercase italic rounded ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-400'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`flex-1 flex items-center justify-center text-[13px] font-black uppercase italic rounded ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
          </div>

          {/* Available Balance */}
          <div className="flex justify-between items-center text-[11px] font-medium pt-1">
            <span className="flex items-center gap-1">Avbl</span>
            <span className="text-white flex items-center gap-1">
              {user?.balance?.toFixed(2) || '0.00'} USDT 
              <PlusCircle size={14} className="text-[#f0b90b]" />
            </span>
          </div>

          {/* Input Fields Stack */}
          <div className="space-y-2.5">
            {/* Order Type Dropdown */}
            <div className="bg-[#2b3139] py-2.5 px-3 rounded text-[13px] text-white flex justify-between items-center font-bold border border-transparent hover:border-gray-700 transition-all cursor-pointer">
              <span>{orderType}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>

            {/* Market Price Display (when Market order) */}
            <div className="bg-[#2b3139] py-2.5 px-3 rounded text-[13px] text-gray-500 flex justify-center items-center font-bold border border-transparent">
              Market Price
            </div>

            {/* Amount Input */}
            <div className="flex items-center bg-[#2b3139] rounded h-10 border border-transparent focus-within:border-[#f0b90b]">
              <input 
                type="number" 
                placeholder="Amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full bg-transparent pl-3 text-white text-[14px] font-black outline-none placeholder:text-gray-600 italic" 
              />
              <div className="flex items-center gap-1 pr-3 text-[11px] text-gray-400 font-bold border-l border-gray-700 pl-2">
                USDT <ChevronDown size={12}/>
              </div>
            </div>

            {/* Leverage Slider Integration */}
            <div className="pt-1">
               <LeverageSlider onChange={(val) => setLeverage(val)} />
            </div>

            {/* Slippage, TP/SL Checkboxes (UI only, as in screenshot) */}
            <div className="space-y-1.5 text-[11px] pt-1">
               {['Slippage Tolerance', 'TP/SL', 'Reduce Only'].map(text => (
                 <div key={text} className="flex items-center gap-1.5 text-gray-400">
                    <input type="checkbox" className="accent-[#f0b90b] w-3 h-3 rounded-sm bg-[#161a1e] border-gray-700" />
                    <span>{text}</span>
                 </div>
               ))}
            </div>

            {/* Max / Cost Info */}
            <div className="text-[10px] space-y-0.5 pt-1 text-gray-500">
               <div className="flex justify-between"><span>Max</span><span>3,033.12 USDT</span></div>
               <div className="flex justify-between"><span>Cost</span><span>0.00 USDT</span></div>
            </div>

            {/* Big Action Button */}
            <button 
              onClick={handleTrade}
              className={`w-full py-3.5 rounded-lg font-black text-sm uppercase italic tracking-wider transition-all active:scale-[0.98] mt-2 ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}
            >
              {side === 'buy' ? "Buy / Long" : "Sell / Short"}
            </button>
          </div>
        </div>

        {/* --- Right Side: Order Book --- */}
        <div className="w-[40%] bg-[#0b0e11] pt-1">
           {/* আপনার নতুন OrderBook কম্পোনেন্টটি এখানে থাকবে */}
           <OrderBook />
        </div>
      </div>

      {/* 4. Bottom Positions/Orders Section */}
      <div className="bg-[#161a1e] border-t border-gray-900 pb-2">
         <PositionTable />
      </div>

    </div>
  );
};

export default Futures;