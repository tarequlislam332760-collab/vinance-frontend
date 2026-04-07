import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { ChevronDown, MoreHorizontal, LayoutGrid, Info, PlusCircle, Maximize2, History } from 'lucide-react';
import { toast } from 'react-hot-toast';

import OrderBook from '../components/OrderBook';
import LeverageSlider from '../components/LeverageSlider';
import PositionTable from '../components/PositionTable';

const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, token } = useContext(UserContext);
  const [leverage, setLeverage] = useState(20);
  const [side, setSide] = useState('buy'); 
  const [currentPrice, setCurrentPrice] = useState('68277.4'); // ডামি ডাটা স্ক্রিনশট অনুযায়ী
  
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#848e9c] font-sans overflow-hidden select-none">
      
      {/* ১. টপ ট্যাব বার (USD-M, COIN-M...) */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#161a1e] border-b border-gray-900">
        <div className="flex items-center gap-5 text-[13px] font-bold">
          <span className="text-gray-400">USDⓈ-M</span>
          <span className="text-white border-b-2 border-[#f0b90b] pb-1">COIN-M</span>
          <span className="text-gray-400">Options</span>
          <span className="text-gray-400">Smart</span>
        </div>
        <div className="flex items-center gap-3">
           <MoreHorizontal size={20} className="text-gray-400" />
           <div className="w-1.5 h-1.5 bg-[#f0b90b] rounded-full"></div>
        </div>
      </div>

      {/* ২. কয়েন ইনফো এবং চার্ট আইকন */}
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-bold text-lg flex items-center gap-1 italic">
              {currentCoin}USD CM <span className="bg-[#2b3139] text-[9px] px-1 py-0.5 rounded text-gray-400 font-normal not-italic">Perp</span> 
              <ChevronDown size={14} className="text-gray-500" />
            </h2>
          </div>
          <span className="text-[#f6465d] text-[11px] font-bold">-2.51%</span>
        </div>
        <div className="flex gap-4 items-center text-gray-400">
          <LayoutGrid size={18} />
          <MoreHorizontal size={18} />
        </div>
      </div>

      {/* ৩. মেইন কন্টেন্ট (বায়ে ফর্ম | ডানে অর্ডার বুক) */}
      <div className="flex flex-1 overflow-hidden px-3 gap-2">
        
        {/* --- বায়ে: ট্রেডিং কন্ট্রোলার --- */}
        <div className="w-[55%] flex flex-col gap-2 overflow-y-auto pb-20">
          
          <div className="flex gap-1.5 text-[11px] font-bold uppercase italic">
            <button className="bg-[#2b3139] flex-1 py-1 rounded flex items-center justify-center gap-1 text-white">Cross <ChevronDown size={10}/></button>
            <button className="bg-[#2b3139] flex-1 py-1 rounded flex items-center justify-center gap-1 text-white">{leverage}x <ChevronDown size={10}/></button>
            <button className="bg-[#2b3139] px-2 py-1 rounded text-white">S</button>
          </div>

          <div className="flex bg-[#2b3139] rounded h-8 overflow-hidden">
            <button onClick={() => setSide('buy')} className={`flex-1 text-[12px] font-black uppercase italic ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11] clip-path-buy' : 'text-gray-400'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`flex-1 text-[12px] font-black uppercase italic ${side === 'sell' ? 'bg-[#f6465d] text-white clip-path-sell' : 'text-gray-400'}`}>Sell</button>
          </div>

          <div className="flex justify-between items-center text-[10px] pt-1">
            <span className="text-gray-500">Avbl</span>
            <span className="text-white flex items-center gap-1 font-bold">0.0000 BTC <span className="text-[#f0b90b]">⇄</span></span>
          </div>

          <div className="space-y-2">
            <div className="bg-[#2b3139] py-1.5 px-3 rounded text-[12px] text-white flex justify-between items-center font-bold">
              <Info size={12} className="text-gray-500" />
              <span>Limit</span>
              <ChevronDown size={14} className="text-gray-500" />
            </div>

            <div className="flex items-center bg-[#2b3139] rounded h-9 px-2 gap-2 border border-transparent focus-within:border-[#f0b90b]">
              <span className="text-gray-500 text-[18px] cursor-pointer">−</span>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[9px] text-gray-500 leading-none">Price (USD)</span>
                <input type="text" value="68274.4" className="w-full bg-transparent text-center text-white text-[13px] font-bold outline-none" readOnly/>
              </div>
              <span className="text-gray-500 text-[18px] cursor-pointer">+</span>
              <span className="text-white text-[10px] font-bold border-l border-gray-700 pl-2">BBO</span>
            </div>

            <div className="flex items-center bg-[#2b3139] rounded h-9 px-2 gap-2">
              <span className="text-gray-500 text-[18px]">−</span>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[9px] text-gray-500 leading-none">Amount</span>
                <input type="text" placeholder="Amount" className="w-full bg-transparent text-center text-white text-[13px] font-bold outline-none italic placeholder:text-gray-700" />
              </div>
              <span className="text-gray-500 text-[18px]">+</span>
              <span className="text-white text-[10px] font-bold border-l border-gray-700 pl-2 flex items-center gap-1">Cont <ChevronDown size={10}/></span>
            </div>

            <div className="pt-2">
               <LeverageSlider />
            </div>

            <div className="space-y-1.5 text-[11px] pt-1 font-medium">
               <div className="flex items-center gap-2"><div className="w-3 h-3 border border-gray-600 rounded-sm"></div><span>TP/SL</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 border border-gray-600 rounded-sm"></div><span>Reduce Only</span></div>
            </div>

            <div className="text-[10px] text-gray-500 pt-1">
               <div className="flex justify-between"><span>Max</span><span>0 Cont</span></div>
               <div className="flex justify-between"><span>Cost</span><span>0.0000 BTC</span></div>
            </div>

            <button className="w-full py-2.5 rounded bg-[#02c076] text-[#0b0e11] font-black text-[13px] uppercase italic tracking-tighter mt-1">
              Activate Futures Account
            </button>
          </div>
        </div>

        {/* --- ডানে: অর্ডার বুক --- */}
        <div className="w-[45%] flex flex-col">
          <div className="flex justify-between text-[9px] text-gray-500 font-bold mb-2 uppercase">
             <div className="flex flex-col"><span>Price</span><span>(USD)</span></div>
             <div className="flex flex-col text-right"><span>Amount</span><span>(Cont)</span></div>
          </div>
          <OrderBook />
        </div>
      </div>

      {/* ৪. বটম সেকশন (Positions/Orders) */}
      <div className="border-t border-gray-900 bg-[#0b0e11] p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-4 text-[13px] font-bold italic">
             <span className="text-white border-b-2 border-[#f0b90b] pb-1">Positions (0)</span>
             <span className="text-gray-500">Open Orders (0)</span>
             <span className="text-gray-500">Bots</span>
          </div>
          <History size={16} className="text-gray-500" />
        </div>
        
        {/* Empty position icon logic */}
        <div className="flex flex-col items-center py-10 opacity-20">
           <div className="border-2 border-gray-500 p-2 rounded-lg mb-2">
              <div className="w-10 h-1 bg-gray-500 mb-1"></div>
              <div className="w-10 h-1 bg-gray-500 mb-1"></div>
              <div className="w-6 h-1 bg-gray-500"></div>
           </div>
           <span className="text-[10px]">No active data</span>
        </div>
      </div>

      {/* ৫. ফ্লোটিং চার্ট বাটন (স্ক্রিনশট অনুযায়ী) */}
      <div className="absolute bottom-20 right-4 bg-[#1e2329] p-2 rounded-full border border-gray-700">
         <Maximize2 size={16} className="text-gray-400" />
      </div>

    </div>
  );
};

export default Futures;