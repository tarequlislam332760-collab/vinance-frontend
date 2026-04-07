import React from 'react';
import { FileText, Share2, Edit2 } from 'lucide-react';

const PositionTable = ({ positions = [] }) => {
  return (
    <div className="mt-2 border-t border-gray-900 bg-[#0b0e11]">
      {/* Tab Headers */}
      <div className="flex gap-6 px-4 pt-3 text-[12px] font-black uppercase italic tracking-tighter border-b border-gray-900">
        <button className="text-[#f0b90b] border-b-2 border-[#f0b90b] pb-2">
          Positions({positions.length})
        </button>
        <button className="text-gray-500 pb-2">Open Orders(0)</button>
        <button className="text-gray-500 pb-2">Assets</button>
      </div>

      {positions.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 text-gray-700">
          <FileText size={48} strokeWidth={1} className="opacity-20" />
          <p className="text-[10px] mt-3 uppercase font-black tracking-[0.2em] opacity-40">
            No Open Positions
          </p>
        </div>
      ) : (
        /* Active Positions List */
        <div className="flex flex-col">
          {positions.map((pos, index) => (
            <div key={index} className="p-4 border-b border-gray-900 last:border-0">
              {/* Symbol & Leverage */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] font-black italic ${pos.side === 'Buy' ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
                    {pos.side === 'Buy' ? 'Long' : 'Short'}
                  </span>
                  <h3 className="text-white font-bold text-[14px] italic">{pos.symbol}</h3>
                  <span className="bg-[#2b3139] text-gray-400 text-[9px] px-1.5 py-0.5 rounded font-bold">
                    Cross {pos.leverage}x
                  </span>
                </div>
                <Share2 size={14} className="text-gray-500 cursor-pointer" />
              </div>

              {/* PNL Section */}
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-500 font-bold uppercase">Unrealized PNL (USDT)</span>
                   <span className={`text-[18px] font-black italic leading-none mt-1 ${pos.pnl >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
                     {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                   </span>
                </div>
                <div className="text-right">
                   <span className={`text-[12px] font-black italic ${pos.pnl >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
                     {pos.pnlPercentage}%
                   </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-3 gap-y-3 text-[11px]">
                <div className="flex flex-col">
                  <span className="text-gray-500 font-bold">Size (Cont)</span>
                  <span className="text-white font-mono">{pos.size}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-bold">Entry Price</span>
                  <span className="text-white font-mono">{pos.entryPrice}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-gray-500 font-bold">Mark Price</span>
                  <span className="text-white font-mono">{pos.markPrice}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-bold">Margin (USDT)</span>
                  <span className="text-white font-mono">{pos.margin}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-bold">Liq. Price</span>
                  <span className="text-[#f0b90b] font-mono">{pos.liqPrice}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-5">
                <button className="flex-1 bg-[#2b3139] text-white py-1.5 rounded text-[11px] font-bold hover:bg-[#363c45] transition-all">Adjust Margin</button>
                <button className="flex-1 bg-[#2b3139] text-white py-1.5 rounded text-[11px] font-bold hover:bg-[#363c45] transition-all">TP/SL</button>
                <button className="flex-1 bg-[#2b3139] text-white py-1.5 rounded text-[11px] font-bold hover:bg-[#363c45] transition-all border border-gray-700">Close Position</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PositionTable;