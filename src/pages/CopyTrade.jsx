import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MoreHorizontal, X, Zap, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TraderCard from '../components/TraderCard';

const CopyTrade = () => {
  const navigate = useNavigate();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* --- কন্ট্রোল স্টেট --- */
  const [showBanner, setShowBanner] = useState(true);
  const [spotCopyOpen, setSpotCopyOpen] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Recommended');

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
    <div className="bg-[#0b0e11] min-h-screen pb-24 text-white font-sans overflow-x-hidden">
      
      {/* --- ১. হেডার সেকশন (X এবং ৩-ডট ফিক্সড) --- */}
      <div className="p-4 flex justify-between items-center sticky top-0 bg-[#0b0e11] z-[100] border-b border-gray-900">
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setSpotCopyOpen(!spotCopyOpen); }}
            className="flex items-center gap-1 text-lg font-bold"
          >
            Spot Copy <ChevronDown size={18} className={spotCopyOpen ? "rotate-180" : ""} />
          </button>
          
          {spotCopyOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-[#1e2329] border border-gray-700 rounded-lg shadow-2xl p-2 z-[110]">
              <div className="p-3 hover:bg-[#2b3139] rounded cursor-pointer text-sm">Futures Copy</div>
              <div className="p-3 hover:bg-[#2b3139] rounded cursor-pointer text-sm">Strategy Copy</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-gray-400 relative">
          <MoreHorizontal 
            className="cursor-pointer hover:text-white" 
            onClick={(e) => { e.stopPropagation(); setMoreOptionsOpen(!moreOptionsOpen); }} 
          />
          {moreOptionsOpen && (
            <div className="absolute right-8 top-6 w-40 bg-[#1e2329] border border-gray-700 rounded shadow-xl p-2 z-[110] text-sm text-white">
              <div className="p-2 hover:bg-[#2b3139] cursor-pointer">Copy Settings</div>
              <div className="p-2 hover:bg-[#2b3139] cursor-pointer">Trade History</div>
            </div>
          )}
          <X className="cursor-pointer hover:text-white" onClick={() => navigate(-1)} />
        </div>
      </div>

      {/* --- ২. ব্যানার ক্লোজ বাটন --- */}
      {showBanner && (
        <div className="mx-4 mt-4 bg-[#1e2329] p-4 rounded-xl flex justify-between items-center relative border border-yellow-500/10">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500">⭐</div>
            <div>
              <h4 className="font-bold text-[12px]">Elite Trader Program</h4>
              <p className="text-yellow-500 text-[10px] font-bold cursor-pointer">Join Now</p>
            </div>
          </div>
          <X 
            size={16} 
            className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-white bg-[#0b0e11] rounded-full p-0.5" 
            onClick={() => setShowBanner(false)} 
          />
        </div>
      )}

      {/* --- ৩. ট্যাব এবং স্মার্ট কপি --- */}
      <div className="px-4 mt-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex gap-6 text-[13px] font-bold uppercase overflow-x-auto no-scrollbar">
          {['Recommended', 'All Portfolios', 'Favorite'].map((tab) => (
            <span 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer pb-2 whitespace-nowrap ${activeTab === tab ? "text-[#f0b90b] border-b-2 border-[#f0b90b]" : "text-gray-500"}`}
            >
              {tab}
            </span>
          ))}
        </div>
        <button 
          onClick={() => alert("Smart Copy is Active!")}
          className="flex items-center gap-1 bg-[#2b3139] text-[#f0b90b] text-[10px] px-2 py-1 rounded-md font-bold mb-2 active:scale-90 transition"
        >
          <Zap size={10} fill="#f0b90b" /> Smart Copy
        </button>
      </div>

      {/* --- ৪. High ROI এবং More --- */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <span>High ROI</span> <ChevronDown size={14} />
        </div>
        <div 
          className="text-xs text-gray-400 flex items-center cursor-pointer hover:text-yellow-500 font-bold active:scale-90 transition"
          onClick={() => alert("More Traders Loading...")}
        >
          More <ChevronDown size={14} className="-rotate-90 ml-1" />
        </div>
      </div>

      {/* --- ৫. ট্রেডার লিস্ট --- */}
      <div className="px-4 grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center mt-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div></div>
        ) : (
          traders.map((t) => <TraderCard key={t._id} trader={t} />)
        )}
      </div>

      {/* --- ৬. ফিক্সড বাটন --- */}
      <div className="p-4">
        <button className="w-full bg-[#f0b90b] text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xl active:scale-95 transition">
          <Zap size={16} fill="black" /> APPLY TO BE A MASTER TRADER
        </button>
      </div>
    </div>
  );
};

export default CopyTrade;