import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { ChevronDown, MoreHorizontal, LayoutGrid, Info, Maximize2, History } from 'lucide-react';
import OrderBook from '../components/OrderBook';
import LeverageSlider from '../components/LeverageSlider';
import PositionTable from '../components/PositionTable';

const Futures = () => {
  const { coinSymbol } = useParams();
  const { user } = useContext(UserContext);
  const [side, setSide] = useState('buy'); 
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#848e9c] font-sans overflow-hidden select-none">
      
      {/* 1. Header Tabs */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#161a1e] border-b border-gray-900">
        <div className="flex items-center gap-5 text-[12px] font-bold tracking-tight">
          <span className="text-gray-500 hover:text-white cursor-pointer">USDⓈ-M</span>
          <span className="text-white border-b-2 border-[#f0b90b] pb-1">COIN-M</span>
          <span className="text-gray-500 hover:text-white cursor-pointer">Options</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
           <History size={18} />
           <MoreHorizontal size={20} />
        </div>
      </div>

      {/* 2. Coin Info */}
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex flex-col">
          <h2 className="text-white font-bold text-[17px] flex items-center gap-1 italic">
            {currentCoin}USD <span className="bg-[#2b3139] text-[9px] px-1 py-0.5 rounded text-[#02c076] font-normal not-italic ml-1">Perp</span> 
            <ChevronDown size={14} className="text-gray-500" />
          </h2>
          <span className="text-[#f6465d] text-[11px] font-bold font-mono">-2.51%</span>
        </div>
        <div className="flex gap-4 items-center text-gray-400">
          <LayoutGrid size={18} className="hover:text-white cursor-pointer" />
          <div className="w-8 h-8 flex items-center justify-center bg-[#2b3139] rounded-full text-[#f0b90b]">
             <span className="text-[10px] font-black italic">!</span>
          </div>
        </div>
      </div>

      {/* 3. Main Trading Section */}
      <div className="flex flex-1 overflow-hidden px-3 gap-3">
        
        {/* Left Side: Trade Controller */}
        <div className="w-[58%] flex flex-col gap-3 overflow-y-auto pb-24 no-scrollbar">
          <div className="flex gap-1.5 text-[10px] font-black uppercase italic">
            <button className="bg-[#2b3139] flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-white border border-gray-800">Cross <ChevronDown size={10}/></button>
            <button className="bg-[#2b3139] flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-white border border-gray-800">20x <ChevronDown size={10}/></button>
          </div>

          <div className="flex bg-[#2b3139] rounded-lg h-9 overflow-hidden relative border border-gray-800">
            <button onClick={() => setSide('buy')} className={`flex-1 text-[12px] font-black uppercase italic transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11] clip-path-buy z-10' : 'text-gray-500'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`flex-1 text-[12px] font-black uppercase italic transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white clip-path-sell z-10' : 'text-gray-500'}`}>Sell</button>
          </div>

          <div className="space-y-2.5">
            <div className="bg-[#2b3139] py-2 px-3 rounded text-[11px] text-gray-300 flex justify-between items-center font-bold border border-gray-800/50">
              <span>Limit Order</span>
              <ChevronDown size={14} className="text-gray-500" />
            </div>

            <div className="flex items-center bg-[#2b3139] rounded h-10 px-3 border border-transparent focus-within:border-[#f0b90b]">
              <div className="flex-1 flex flex-col">
                <span className="text-[8px] text-gray-500 uppercase font-black">Price (USD)</span>
                <input type="text" value="68274.4" className="bg-transparent text-white text-[14px] font-bold outline-none font-mono" readOnly/>
              </div>
              <span className="text-[#f0b90b] text-[10px] font-black border-l border-gray-700 pl-3">BBO</span>
            </div>

            <div className="flex items-center bg-[#2b3139] rounded h-10 px-3 border border-transparent focus-within:border-[#f0b90b]">
              <div className="flex-1 flex flex-col">
                <span className="text-[8px] text-gray-500 uppercase font-black">Amount (Cont)</span>
                <input type="number" placeholder="0" className="bg-transparent text-white text-[14px] font-bold outline-none placeholder:text-gray-700" />
              </div>
              <ChevronDown size={14} className="text-gray-500" />
            </div>

            <LeverageSlider />

            <div className="flex justify-between text-[10px] font-bold mt-1">
               <span className="text-gray-500">Available</span>
               <span className="text-white">0.0000 BTC <span className="text-[#f0b90b] ml-1">⇄</span></span>
            </div>

            <button className={`w-full py-3 rounded-lg font-black text-[14px] uppercase italic tracking-tighter shadow-lg transition-transform active:scale-95 ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}>
              {side === 'buy' ? 'Open Long' : 'Open Short'}
            </button>
          </div>
        </div>

        {/* Right Side: Order Book */}
        <div className="w-[42%] flex flex-col pt-1">
          <OrderBook />
        </div>
      </div>

      {/* 4. Bottom Positions Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b0e11] border-t border-gray-900 pb-16 md:pb-0 z-40">
        <PositionTable />
      </div>

      {/* 5. Chart Floating Button */}
      <div className="absolute bottom-32 right-4 bg-[#1e2329] p-3 rounded-full border border-gray-700 shadow-2xl text-[#f0b90b] active:scale-90 transition-all cursor-pointer">
          <Maximize2 size={20} />
      </div>

    </div>
  );
};

export default Futures;