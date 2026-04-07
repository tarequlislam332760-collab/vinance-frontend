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
        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Leverage</span>
        <span className="text-[#f0b90b] font-black italic text-xs bg-[#f0b90b]/10 px-2 py-0.5 rounded">{val}x</span>
      </div>
      
      <div className="relative px-1">
        <input 
          type="range" min="1" max="100" step="1"
          value={val} 
          onChange={(e) => updateVal(e.target.value)}
          className="w-full h-1 bg-[#2b3139] rounded-lg appearance-none cursor-pointer accent-[#f0b90b]"
        />
        
        <div className="flex justify-between mt-1.5 px-0.5">
          {marks.map(mark => (
            <div key={mark} className="flex flex-col items-center">
              <div className={`h-1 w-[1px] ${val >= mark ? 'bg-[#f0b90b]' : 'bg-gray-700'}`}></div>
              <span className={`text-[8px] mt-1 font-bold ${val >= mark ? 'text-gray-300' : 'text-gray-600'}`}>
                {mark}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-4 gap-1.5">
        {[25, 50, 75, 100].map(m => (
          <button 
            key={m}
            onClick={() => updateVal(m)}
            className={`flex-1 py-1 rounded-md text-[9px] font-black transition-all border ${val == m ? 'bg-[#f0b90b] text-black border-[#f0b90b]' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
          >
            {m}%
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeverageSlider;