import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Zap, ChevronRight, TrendingUp, Heart, Star, CheckCircle2 } from 'lucide-react'; // CheckCircle2 যোগ করা হয়েছে
import TraderCard from '../components/TraderCard';

const TraderProfile = () => {
  const [traders, setTraders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Recommended');
  const [copySuccess, setCopySuccess] = useState(null); // কপি স্ট্যাটাস ট্র্যাক করার জন্য
  
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

  // --- কপি ফাংশন ---
  const handleCopy = async (e, text, id) => {
    e.stopPropagation(); // কার্ডের ক্লিক ইভেন্ট থামাবে
    try {
      await navigator.clipboard.writeText(text); // ক্লিপবোর্ডে কপি করবে
      setCopySuccess(id); // নির্দিষ্ট ট্রেডারের জন্য সাকসেস দেখাবে
      setTimeout(() => setCopySuccess(null), 2000); // ২ সেকেন্ড পর মেসেজ চলে যাবে
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const filteredTraders = useMemo(() => {
    if (activeTab === 'All Portfolios') return traders;
    if (activeTab === 'Favorite') return traders.filter(t => favorites.includes(t._id));
    if (activeTab === 'Recommended') return traders.filter(t => t.profit > 10 || t.winRate >= 90);
    return traders;
  }, [activeTab, traders, favorites]);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const tabs = ['Recommended', 'All Portfolios', 'Favorite'];

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-left pb-60 max-w-7xl mx-auto relative">
      
      {/* Premium Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#f0b90b]/20 via-[#161a1e] to-transparent p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-[#f0b90b]/20 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-4 w-full">
          <div className="p-3 md:p-4 bg-[#f0b90b] rounded-2xl text-black">
            <Star size={24} fill="black" /> 
          </div>
          <div>
            <h2 className="text-white font-black text-lg md:text-xl uppercase italic tracking-tighter">Master Portfolio Selection</h2>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-tight">Copy High-Performance <span className="text-[#f0b90b]">Elite Strategies!</span></p>
          </div>
        </div>
        <button className="w-full md:w-auto bg-[#f0b90b] text-black py-2.5 px-5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:scale-105 transition-all">
          Explore Now <ChevronRight size={14} />
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-6 md:gap-10 mb-8 border-b border-[#1e2329] overflow-x-auto scrollbar-hide sticky top-0 bg-[#0b0e11] z-[70] py-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[10px] md:text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap pb-4 transition-all duration-300 relative ${
              activeTab === tab ? 'text-[#f0b90b]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#f0b90b] shadow-[0_0_10px_#f0b90b]"></span>
            )}
          </button>
        ))}
      </div>

      {/* Trader List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-[#161a1e] rounded-[1.5rem] animate-pulse border border-[#1e2329]"></div>
          ))
        ) : filteredTraders.length > 0 ? (
          filteredTraders.map((trader) => (
            <div key={trader._id} className="relative group">
                <button 
                 onClick={() => toggleFavorite(trader._id)}
                 className="absolute top-6 right-4 md:right-6 z-20 p-2 hover:scale-110 transition-transform"
                >
                 <Heart 
                   size={20} 
                   fill={favorites.includes(trader._id) ? "#ef4444" : "none"} 
                   className={favorites.includes(trader._id) ? "text-red-500" : "text-gray-600 hover:text-red-400"} 
                 />
                </button>

                {/* --- Copy Button Overlay --- */}
                <div className="absolute bottom-6 right-4 md:right-6 z-30">
                  <button 
                    onClick={(e) => handleCopy(e, trader.name, trader._id)} 
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-black text-[10px] uppercase transition-all duration-300 pointer-events-auto border ${
                      copySuccess === trader._id 
                      ? 'bg-[#00c076] text-white border-[#00c076]' 
                      : 'bg-[#f0b90b] text-black border-[#f0b90b] hover:bg-white hover:text-black'
                    }`}
                  >
                    {copySuccess === trader._id ? (
                      <><CheckCircle2 size={12} /> Copied</>
                    ) : (
                      'Copy'
                    )}
                  </button>
                </div>

                <TraderCard trader={trader} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-[#161a1e] rounded-[2rem] border border-dashed border-gray-800">
            <TrendingUp size={30} className="text-gray-700 mx-auto mb-4 opacity-20" />
            <p className="text-gray-600 font-bold uppercase text-[10px] tracking-[0.2em]">No Portfolios found in {activeTab}</p>
          </div>
        )}
      </div>

      {/* --- Professional Floating Button --- */}
      <div className="fixed bottom-24 left-0 w-full px-4 flex justify-center z-[50] pointer-events-none">
          <button 
            onClick={() => navigate('/become-trader')}
            className="pointer-events-auto w-full md:w-auto md:min-w-[400px] bg-[#f0b90b] text-black py-4 md:py-5 px-10 rounded-2xl md:rounded-full font-black uppercase text-[11px] md:text-sm shadow-[0_15px_40px_rgba(240,185,11,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-all duration-300 border border-white/10"
          >
             <Zap size={18} fill="black" /> 
             Apply to be a Master Trader
          </button>
      </div>
    </div>
  );
};

export default TraderProfile;