import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Zap, ChevronRight, TrendingUp, Heart } from 'lucide-react';
import TraderCard from '../components/TraderCard';

const TraderProfile = () => {
  const [traders, setTraders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Recommended');
  const { API_URL } = useContext(UserContext);

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        setLoading(true);
        // সরাসরি ডাটাবেস থেকে সব ট্রেডার নিয়ে আসা
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

  // --- Professional Filtering Logic ---
  const filteredTraders = useMemo(() => {
    if (activeTab === 'All Portfolios') {
      return traders; // এখানে কোনো ফিল্টার নেই, ডাটাবেসের সব ডাটা দেখাবে
    }
    if (activeTab === 'Favorite') {
      return traders.filter(t => favorites.includes(t._id)); // শুধু লাইক করাগুলো
    }
    if (activeTab === 'Recommended') {
      // এখানে শুধু সেই ট্রেডারদের দেখাবে যারা আপনার ক্রাইটেরিয়া পূরণ করে (যেমন: লাভ ১০ এর বেশি)
      // যদি ডাটাবেসে কম ডাটা থাকে তবে আপাতত সব দেখাবে, কিন্তু প্রফেশনালি এটি ফিল্টারড হবে
      return traders.filter(t => t.profit > 10 || t.winRate >= 90);
    }
    return traders;
  }, [activeTab, traders, favorites]);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  // ট্যাবগুলোর নাম ঠিক আপনার চাহিদা অনুযায়ী
  const tabs = ['Recommended', 'All Portfolios', 'Favorite'];

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-left pb-32 max-w-7xl mx-auto">
      
      {/* Premium Banner - Responsive Fix */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#f0b90b]/20 via-[#161a1e] to-transparent p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-[#f0b90b]/20 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-4 w-full">
          <div className="p-3 md:p-4 bg-[#f0b90b] rounded-2xl text-black">
            <Zap size={24} fill="black" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg md:text-xl uppercase italic tracking-tighter">Elite Trader Program</h2>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-tight">Earn up to <span className="text-[#f0b90b]">30% Profit Share!</span></p>
          </div>
        </div>
        <button className="w-full md:w-auto bg-[#f0b90b] text-black py-2.5 px-5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:scale-105 transition-all">
          Check Now <ChevronRight size={14} />
        </button>
      </div>

      {/* Tabs Menu - Mobile & Laptop Optimized */}
      <div className="flex gap-6 md:gap-10 mb-8 border-b border-[#1e2329] overflow-x-auto scrollbar-hide sticky top-0 bg-[#0b0e11] z-40 py-3">
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

      {/* Trader List - Grid View for Laptop, Single Column for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-[#161a1e] rounded-[1.5rem] animate-pulse border border-[#1e2329]"></div>
          ))
        ) : filteredTraders.length > 0 ? (
          filteredTraders.map((trader) => (
            <div key={trader._id} className="relative group">
               {/* Favorite Icon */}
               <button 
                onClick={() => toggleFavorite(trader._id)}
                className="absolute top-6 right-20 z-20 p-2 hover:scale-110 transition-transform"
               >
                <Heart 
                  size={20} 
                  fill={favorites.includes(trader._id) ? "#ef4444" : "none"} 
                  className={favorites.includes(trader._id) ? "text-red-500" : "text-gray-600 hover:text-red-400"} 
                />
               </button>
               <TraderCard trader={trader} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-[#161a1e] rounded-[2rem] border border-dashed border-gray-800">
            <TrendingUp size={30} className="text-gray-700 mx-auto mb-4 opacity-20" />
            <p className="text-gray-600 font-bold uppercase text-[10px] tracking-[0.2em]">
              No Traders found in {activeTab}
            </p>
          </div>
        )}
      </div>

      {/* Floating Button - Mobile Fix */}
      <div className="fixed bottom-8 left-0 w-full px-4 md:hidden z-50">
         <button className="w-full bg-[#f0b90b] text-black py-4 rounded-2xl font-black uppercase text-[11px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center justify-center gap-3">
            <Zap size={16} fill="black" /> Become a Lead Trader
         </button>
      </div>
    </div>
  );
};

export default TraderProfile;