import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Zap, ChevronRight, TrendingUp, Heart } from 'lucide-react';
import TraderCard from '../components/TraderCard';

const TraderProfile = () => {
  const [traders, setTraders] = useState([]);
  const [favorites, setFavorites] = useState([]); // ফেভারিট আইডি সেভ করার জন্য
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Recommended');
  const { API_URL } = useContext(UserContext);

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

  // --- Filtering Logic (এই অংশটিই আপনার দরকার) ---
  const filteredTraders = useMemo(() => {
    if (activeTab === 'All Portfolios') {
      return traders; // সব ট্রেডার দেখাবে
    }
    if (activeTab === 'Favorite') {
      return traders.filter(t => favorites.includes(t._id)); // শুধু ফেভারিটগুলো
    }
    if (activeTab === 'Recommended') {
      return traders.filter(t => t.winRate >= 90 || t.profit > 10); // ভালো পারফর্মারদের দেখাবে
    }
    return traders;
  }, [activeTab, traders, favorites]);

  // ফেভারিট অ্যাড বা রিমুভ করার ফাংশন
  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const tabs = ['Recommended', 'All Portfolios', 'Favorite'];

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-left pb-32 max-w-7xl mx-auto">
      
      {/* Banner Section */}
      <div className="bg-gradient-to-br from-[#f0b90b]/20 via-[#161a1e] to-transparent p-5 md:p-8 rounded-[2rem] border border-[#f0b90b]/20 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-[#f0b90b]/5">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-4 bg-[#f0b90b] rounded-2xl text-black animate-pulse">
            <Zap size={28} fill="black" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg md:text-2xl uppercase italic tracking-tighter">Elite Trader Program</h2>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold">Earn up to <span className="text-[#f0b90b]">30% Profit Share!</span></p>
          </div>
        </div>
        <button className="w-full md:w-auto bg-[#f0b90b]/10 text-[#f0b90b] py-3 px-6 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-[#f0b90b]/20">
          Check Now <ChevronRight size={16} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 md:gap-8 mb-8 border-b border-[#1e2329] overflow-x-auto scrollbar-hide sticky top-0 bg-[#0b0e11] z-40 py-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap pb-4 transition-all duration-300 relative ${
              activeTab === tab ? 'text-[#f0b90b]' : 'text-gray-500'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#f0b90b] rounded-t-full shadow-[0_-4px_10px_rgba(240,185,11,0.5)]"></span>
            )}
          </button>
        ))}
      </div>

      {/* Trader List Section */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-[#161a1e] rounded-[2rem] animate-pulse border border-[#1e2329]"></div>
          ))
        ) : filteredTraders.length > 0 ? (
          filteredTraders.map((trader) => (
            <div key={trader._id} className="relative">
               {/* ফেভারিট বাটন (Optional) */}
               <button 
                onClick={() => toggleFavorite(trader._id)}
                className="absolute top-6 right-20 z-10 text-gray-500 hover:text-red-500 transition-colors"
               >
                <Heart size={18} fill={favorites.includes(trader._id) ? "#ef4444" : "none"} color={favorites.includes(trader._id) ? "#ef4444" : "currentColor"} />
               </button>
               <TraderCard trader={trader} />
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-[#161a1e] rounded-[2.5rem] border border-[#1e2329]">
            <TrendingUp size={24} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
              No traders found in {activeTab}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Floating FAB */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:hidden z-50 w-[90%]">
         <button className="w-full bg-[#f0b90b] text-black py-4 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <Zap size={16} fill="black" /> Become a Lead Trader
         </button>
      </div>
    </div>
  );
};

export default TraderProfile;