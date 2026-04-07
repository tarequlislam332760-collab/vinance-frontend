import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MoreHorizontal, X, Zap, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TraderCard from '../components/TraderCard';

const CopyTrade = () => {
  const navigate = useNavigate();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* --- UI States (সবকিছু সচল করার জন্য) --- */
  const [showBanner, setShowBanner] = useState(true);
  const [spotCopyOpen, setSpotCopyOpen] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Recommended');

  // ব্যাকএন্ড লিঙ্ক
  const API_URL = "https://vinance-backend.vercel.app/api/traders";

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        const res = await axios.get(API_URL);
        const fetchedData = Array.isArray(res.data) ? res.data : res.data.traders || [];
        setTraders(fetchedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching traders", err);
        setLoading(false);
      }
    };
    fetchTraders();
  }, []);

  return (
    <div className="bg-[#0b0e11] min-h-screen pb-20 text-white font-sans">
      
      {/* --- ১. হেডার: স্পট কপি, ৩-ডট এবং ক্লোজ (X) বাটন --- */}
      <div className="p-4 flex justify-between items-center sticky top-0 bg-[#0b0e11] z-50">
        <div className="relative">
          <button 
            onClick={() => setSpotCopyOpen(!spotCopyOpen)}
            className="flex items-center gap-1 text-lg font-bold hover:text-gray-200 transition"
          >
            Spot Copy <ChevronDown size={18} className={spotCopyOpen ? "rotate-180 transition" : "transition"} />
          </button>
          
          {spotCopyOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-[#1e2329] border border-gray-700 rounded-lg shadow-2xl z-50 p-2">
              <div className="p-3 hover:bg-[#2b3139] rounded cursor-pointer text-sm">Futures Copy</div>
              <div className="p-3 hover:bg-[#2b3139] rounded cursor-pointer text-sm">Strategy Copy</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-gray-400 relative">
          {/* ৩-ডট মেনু */}
          <MoreHorizontal 
            className="cursor-pointer hover:text-white" 
            onClick={() => setMoreOptionsOpen(!moreOptionsOpen)} 
          />
          {moreOptionsOpen && (
            <div className="absolute right-8 top-6 w-36 bg-[#1e2329] border border-gray-700 rounded shadow-xl z-50 p-2 text-sm">
              <div className="p-2 hover:bg-[#2b3139] cursor-pointer">Trade Settings</div>
              <div className="p-2 hover:bg-[#2b3139] cursor-pointer">Copy History</div>
            </div>
          )}
          {/* ক্লোজ (X) বাটন */}
          <X className="cursor-pointer hover:text-white" onClick={() => navigate(-1)} />
        </div>
      </div>

      {/* --- ২. এলিট ব্যানার (ক্লোজ বাটন সহ) --- */}
      {showBanner && (
        <div className="mx-4 bg-[#1e2329] p-4 rounded-xl flex justify-between items-center mb-4 relative border border-yellow-500/10">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">⭐</div>
            <div>
              <h4 className="font-bold text-[12px]">Join Elite Trader Program!</h4>
              <p className="text-yellow-500 text-[11px] font-bold mt-1 cursor-pointer">Check Now</p>
            </div>
          </div>
          <X 
            size={14} 
            className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-white" 
            onClick={() => setShowBanner(false)} 
          />
        </div>
      )}

      {/* --- ৩. ট্যাব এবং স্মার্ট কপি (Smart Copy) বাটন --- */}
      <div className="px-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex gap-6 text-[13px] font-bold uppercase whitespace-nowrap overflow-x-auto no-scrollbar">
          {['Recommended', 'All Portfolios', 'Favorite'].map((tab) => (
            <span 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer pb-2 transition-all ${activeTab === tab ? "text-[#f0b90b] border-b-2 border-[#f0b90b]" : "text-gray-500"}`}
            >
              {tab}
            </span>
          ))}
        </div>
        <button 
          onClick={() => alert("Smart Copy mode activated!")}
          className="flex items-center gap-1 bg-[#2b3139] text-[#f0b90b] text-[10px] px-2 py-1 rounded-md font-bold mb-2 active:scale-95 transition"
        >
          <Zap size={10} fill="#f0b90b" /> Smart Copy
        </button>
      </div>

      {/* --- ৪. High ROI এবং More বাটন --- */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
          <span>High ROI</span> <ChevronDown size={14} />
        </div>
        <div 
          className="text-xs text-gray-400 flex items-center cursor-pointer hover:text-yellow-500 transition active:scale-95"
          onClick={() => alert("Loading more traders database...")}
        >
          More <ChevronDown size={14} className="-rotate-90 ml-1" />
        </div>
      </div>

      {/* --- ৫. ট্রেডার লিস্ট (Trader Card) --- */}
      <div className="px-4 grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center mt-20 gap-3">
             <div className="w-8 h-8 border-4 border-[#f0b90b] border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-400 text-sm">Loading Traders...</p>
          </div>
        ) : traders.length > 0 ? (
          traders.map((t) => <TraderCard key={t._id} trader={t} />)
        ) : (
          <div className="text-center mt-20">
             <p className="text-gray-500">No Active Traders Found</p>
          </div>
        )}
      </div>

      {/* --- ৬. মাস্টার ট্রেডার এপ্লাই বাটন --- */}
      <div className="px-4 mt-6 mb-10">
        <button className="w-full bg-[#f0b90b] text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm active:scale-95 transition shadow-lg">
          <Zap size={16} fill="black" /> APPLY TO BE A MASTER TRADER
        </button>
      </div>
    </div>
  );
};

export default CopyTrade;