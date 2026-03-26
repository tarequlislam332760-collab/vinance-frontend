import React from 'react';
import { useNavigate } from 'react-router-dom'; // এটি অবশ্যই ইমপোর্ট করতে হবে
import { Search, Activity, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Market = ({ cryptoData }) => {
  const navigate = useNavigate(); // নেভিগেশন ফাংশন তৈরি

  const handleTradeClick = (symbol) => {
    // এখানে আপনি চাইলে কুয়েরি প্যারামিটার পাঠাতে পারেন (যেমন: /trade?symbol=BTC)
    // তবে আপাতত সহজ করার জন্য সরাসরি ট্রেড পেজে পাঠিয়ে দিচ্ছি
    navigate('/trade'); 
  };

  return (
    <div className="p-4 md:p-10 text-left animate-in fade-in duration-700 pb-24 md:pb-10">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            Market Quotes <Activity className="text-yellow-500" size={32} />
          </h2>
          <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Real-time crypto asset prices</p>
        </div>
      </div>

      <div className="bg-[#1e2329] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto relative z-10">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#0b0e11]/50 backdrop-blur-md text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">
              <tr>
                <th className="p-8 text-left">Asset Name</th>
                <th className="p-8 text-left">Price (USDT)</th>
                <th className="p-8 text-left">24h Change</th>
                <th className="p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {cryptoData.map((coin) => (
                <tr key={coin.id} className="hover:bg-white/[0.03] transition-all group">
                  <td className="p-8 font-black text-white text-lg uppercase">
                    {coin.name} <span className="text-[10px] text-gray-500 ml-2">{coin.symbol}</span>
                  </td>
                  <td className="p-8 font-mono font-black text-lg text-white">
                    ${coin.price.toLocaleString()}
                  </td>
                  <td className={`p-8 font-mono font-black ${coin.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {coin.up ? '+' : ''}{coin.change}%
                  </td>
                  <td className="p-8 text-right">
                    {/* বাটনে onClick ইভেন্ট যোগ করা হয়েছে */}
                    <button 
                      onClick={() => handleTradeClick(coin.symbol)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Market;