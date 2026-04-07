import React, { useState } from 'react';

const LeverageSlider = ({ onChange }) => {
  const [val, setVal] = useState(20); // ডিফল্ট ২০ সেট করা

  const handleChange = (e) => {
    const value = e.target.value;
    setVal(value);
    if (onChange) onChange(value);
  };

  // স্লাইডারের নিচে ১০০ পর্যন্ত মার্কিং দেখানোর জন্য
  const marks = [1, 25, 50, 75, 100];

  return (
    <div className="mt-4 mb-6 px-1">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Leverage</span>
          <span className="bg-[#f0b90b]/10 text-[#f0b90b] text-[10px] px-2 py-0.5 rounded font-bold">Cross</span>
        </div>
        <span className="text-[#f0b90b] font-black italic text-sm">{val}x</span>
      </div>
      
      <div className="relative pt-1">
        <input 
          type="range" 
          min="1" 
          max="100"  // এখানে ১০০ পর্যন্ত লিমিট করে দেওয়া হয়েছে
          step="1"
          value={val} 
          onChange={handleChange}
          className="w-full h-1.5 bg-[#2b3139] rounded-lg appearance-none cursor-pointer accent-[#f0b90b] hover:accent-[#f0b90b]"
        />
        
        {/* স্লাইডারের নিচের ডট এবং নাম্বারসমূহ */}
        <div className="flex justify-between mt-2 px-0.5">
          {marks.map(mark => (
            <div key={mark} className="flex flex-col items-center">
              <div className={`h-1 w-0.5 ${val >= mark ? 'bg-[#f0b90b]' : 'bg-gray-700'}`}></div>
              <span className={`text-[8px] mt-1 font-bold ${val >= mark ? 'text-gray-300' : 'text-gray-600'}`}>
                {mark}x
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* বাইনান্স স্টাইল কুইক সিলেক্ট বাটন (ঐচ্ছিক) */}
      <div className="flex justify-between mt-4 gap-1">
        {[25, 50, 75, 100].map(m => (
          <button 
            key={m}
            onClick={() => { setVal(m); if(onChange) onChange(m); }}
            className={`flex-1 py-1 rounded text-[9px] font-black transition-all ${val == m ? 'bg-[#f0b90b] text-black' : 'bg-[#2b3139] text-gray-400'}`}
          >
            {m}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeverageSlider;