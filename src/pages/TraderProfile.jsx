import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Zap, ChevronRight, TrendingUp, Heart, Star, MoreHorizontal } from 'lucide-react';
import TraderCard from '../components/TraderCard';

const TraderProfile = () => {
  const [traders, setTraders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Recommended');
  
  const { API_URL } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/traders/all`);
        setTraders(res.data);
      } catch (err) {
        console.error("Error fetching traders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTraders();
  }, [API_URL]);

  const filteredTraders = useMemo(() => {
    if (activeTab === 'All Portfolios') return traders;
    if (activeTab === 'Favorite') return traders.filter(t => favorites.includes(t._id));
    if (activeTab === 'Recommended') return traders.filter(t => t.profit > 10 || t.winRate >= 90);
    return traders;
  }, [activeTab, traders, favorites]);

  const toggleFavorite = (e, id) => {
    e.stopPropagation(); 
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const handleExplore = () => {
    setActiveTab('All Portfolios'); 
    setTimeout(() => {
      const element = document.getElementById('trader-list-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const tabs = ['Recommended', 'All Portfolios', 'Favorite'];

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-left pb-60 max-w-7xl mx-auto relative font-sans">
      
      {/* Header Info - স্ক্রিনশটের মতো "Spot Copy" লুক */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-gray-300 font-bold text-sm">
          <span>Spot Copy</span>
          <ChevronRight size={14} className="rotate-90" />
        </div>
        <div className="flex gap-4">
          <MoreHorizontal size={20} className="text-gray-400" />
          <span className="text-gray-400 text-xl">×</span>
        </div>
      </div>

      {/* Premium Banner - স্ক্রিনশটের মতো টেক্সট ও আইকন */}
      <div className="relative overflow-hidden bg-[#1e2329] p-6 rounded-2xl border border-[#f0b90b]/10 mb-8 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#f0b90b]/10 rounded-xl text-[#f0b90b]">
            <Star size={22} fill="#f0b90b" /> 
          </div>
          <div className="space-y-1">
            <h2 className="text-white font-bold text-sm">Join Elite Trader Program, Up To 30% Profit Share!</h2>
            <button onClick={handleExplore} className="text-[#f0b90b] text-[11px] font-bold flex items-center gap-1 hover:underline">
              Check Now
            </button>
          </div>
        </div>
        <div className="text-gray-600 text-[10px] font-bold">2/2</div>
      </div>

      <div id="trader-list-section" className="scroll-mt-24"></div>

      {/* Tabs Menu - স্ক্রিনশটের মতো ডাইনামিক লুক */}
      <div className="flex items-center justify-between mb-6 border-b border-[#1e2329] sticky top-0 bg-[#0b0e11] z-[70] pt-2">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[12px] font-bold whitespace-nowrap pb-3 transition-all relative ${
                activeTab === tab ? 'text-white border-b-2 border-[#f0b90b]' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Smart Copy Badge */}
        <div className="flex items-center gap-1 bg-[#2b3139] px-2 py-1 rounded text-[10px] text-[#929aa5] font-bold">
           <Zap size={10} className="text-[#f0b90b]" fill="#f0b90b" /> Smart Copy
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex justify-between items-center mb-4 text-[11px] font-bold text-gray-500">
        <div className="flex items-center gap-1">
          High ROI <ChevronRight size={12} className="rotate-90" />
        </div>
        <div className="flex items-center gap-1">
          More <ChevronRight size={12} />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-[#161a1e] rounded-2xl animate-pulse border border-[#1e2329]"></div>
          ))
        ) : filteredTraders.length > 0 ? (
          filteredTraders.map((trader) => (
            <div key={trader._id} className="relative group">
                <button 
                 onClick={(e) => toggleFavorite(e, trader._id)}
                 className="absolute top-4 left-4 z-40 p-1.5 hover:scale-125 transition-all bg-black/20 rounded-full"
                >
                 <Heart 
                    size={14} 
                    fill={favorites.includes(trader._id) ? "#ef4444" : "none"} 
                    className={favorites.includes(trader._id) ? "text-red-500" : "text-gray-500"} 
                 />
                </button>
                <TraderCard trader={trader} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <TrendingUp size={30} className="text-gray-800 mx-auto mb-3" />
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No Portfolios Found</p>
          </div>
        )}
      </div>

      {/* Fixed Apply Button */}
      <div className="fixed bottom-10 left-0 w-full px-4 flex justify-center z-[50]">
          <button 
            onClick={() => navigate('/become-trader')}
            className="w-full max-w-md bg-[#f0b90b] text-black py-4 rounded-xl font-bold uppercase text-[12px] shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
             <Zap size={16} fill="black" /> Apply to be a Master Trader
          </button>
      </div>
    </div>
  );
};

export default TraderProfile;