import React, { useState } from 'react';

const LeverageSlider = ({ onChange }) => {
  const [val, setVal] = useState(20);
  const marks = [1, 25, 50, 75, 100];

  const updateVal = (newVal) => {
    setVal(newVal);
    if (onChange) onChange(newVal);
  };

  return (
    <div className="mt-2 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-gray-500 uppercase font-bold">Leverage</span>
        <span className="text-[#f0b90b] font-black text-xs bg-[#f0b90b]/10 px-2 py-0.5 rounded">{val}x</span>
      </div>
      
      <input 
        type="range" min="1" max="100" step="1"
        value={val} 
        onChange={(e) => updateVal(e.target.value)}
        className="w-full h-1 bg-[#2b3139] rounded-lg appearance-none cursor-pointer accent-[#f0b90b]"
      />
      
      <div className="flex justify-between mt-3 gap-1.5">
        {marks.slice(1).map(m => (
          <button 
            key={m}
            onClick={() => updateVal(m)}
            className={`flex-1 py-1 rounded text-[10px] font-bold transition-all border ${val == m ? 'bg-[#f0b90b] text-black border-[#f0b90b]' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
          >
            {m}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeverageSlider;