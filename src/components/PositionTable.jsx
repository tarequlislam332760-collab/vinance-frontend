import React from 'react';
import { FileText, Share2 } from 'lucide-react';

const PositionTable = ({ positions = [] }) => {
  return (
    <div className="mt-auto border-t border-gray-800 bg-[#0b0e11] min-h-[250px]">
      <div className="flex gap-6 px-4 pt-3 text-[12px] font-bold uppercase tracking-tight border-b border-gray-900">
        <button className="text-[#f0b90b] border-b-2 border-[#f0b90b] pb-2">Positions({positions.length})</button>
        <button className="text-gray-500 pb-2">Open Orders(0)</button>
        <button className="text-gray-500 pb-2">Trade History</button>
      </div>

      {positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-700">
          <FileText size={40} strokeWidth={1} className="opacity-20" />
          <p className="text-[11px] mt-3 uppercase font-bold tracking-widest opacity-40">No Open Positions</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="text-gray-500 border-b border-gray-900">
              <tr>
                <th className="p-3">Symbol</th>
                <th className="p-3">Size</th>
                <th className="p-3">Entry Price</th>
                <th className="p-3">Mark Price</th>
                <th className="p-3">PNL (ROE%)</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, i) => (
                <tr key={i} className="border-b border-gray-900 hover:bg-[#1e2329]/20">
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{pos.symbol}</span>
                      <span className={`${pos.side === 'Buy' ? 'text-[#02c076]' : 'text-[#f6465d]'} font-bold`}>
                        {pos.side} {pos.leverage}x
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-white">{pos.size}</td>
                  <td className="p-3 text-white">{pos.entryPrice}</td>
                  <td className="p-3 text-white">{pos.markPrice}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className={pos.pnl >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}>
                        {pos.pnl.toFixed(2)} USDT
                      </span>
                      <span className={pos.pnl >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}>
                        ({pos.pnlPercentage}%)
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button className="bg-[#2b3139] px-3 py-1 rounded text-white hover:bg-gray-700">Close</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PositionTable;