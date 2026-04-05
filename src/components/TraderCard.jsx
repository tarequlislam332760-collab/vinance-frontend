const TraderCard = ({ trader }) => {
  return (
    <div className="bg-[#1e2329] p-4 rounded-xl shadow-md border border-transparent hover:border-gray-700">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img src={trader.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
               className="w-10 h-10 rounded-full bg-gray-700" alt="trader" />
          <div>
            <h4 className="font-bold text-sm text-white">{trader.name}</h4>
            <p className="text-[10px] text-gray-400">👤 {trader.followers}/300 API</p>
          </div>
        </div>
        <button className="bg-[#f0b90b] text-black text-xs font-bold px-4 py-1.5 rounded hover:opacity-80">
          Copy
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-gray-500 uppercase">30D PnL (USDT)</p>
          <p className="text-[#02c076] font-bold text-lg">+{trader.profit || "0.00"}</p>
          <p className="text-[#02c076] text-[10px]">ROI {trader.winRate || "0.00"}%</p>
        </div>
        <div className="flex items-end justify-end">
           {/* গ্রাফের জায়গায় ছোট একটি ইমেজ দিতে পারেন */}
           <div className="w-16 h-8 bg-green-900/20 rounded border-b border-green-500"></div>
        </div>
      </div>
    </div>
  );
};

export default TraderCard;