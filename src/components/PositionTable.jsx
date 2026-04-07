import React from 'react';
import { FileText } from 'lucide-react';

const PositionTable = ({ positions = [] }) => {
  return (
    <div className="mt-6 border-t border-gray-800">
      <div className="flex gap-6 p-4 text-[11px] font-black uppercase italic tracking-tighter">
        <button className="text-[#f0b90b] border-b-2 border-[#f0b90b] pb-1">Positions(0)</button>
        <button className="text-gray-500">Open Orders(0)</button>
      </div>

      {positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-600">
          <FileText size={40} strokeWidth={1} />
          <p className="text-[10px] mt-2 uppercase font-bold tracking-widest">No Open Positions</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* এখানে ট্রেড ডেটা ম্যাপ হবে */}
        </div>
      )}
    </div>
  );
};

export default PositionTable;