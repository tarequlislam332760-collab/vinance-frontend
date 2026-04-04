import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TraderCard from '../components/TraderCard'; 

const CopyTrade = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        // নোট: ব্যাকএন্ড লাইভ হয়ে গেলে নিচের URL টি আপনার Vercel API লিঙ্ক দিয়ে পরিবর্তন করবেন
        const res = await axios.get("http://localhost:5000/api/traders");
        setTraders(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching traders:", err);
        setLoading(false);
      }
    };
    fetchTraders();
  }, []);

  return (
    <div className="bg-[#0b0e11] min-h-screen p-6 md:p-12">
      {/* Header Section - আপনার ডিজাইন অনুযায়ী */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-[#f0b90b]/20 to-transparent p-6 rounded-[2rem] border-l-4 border-[#f0b90b] mb-8">
           <h1 className="text-[#f0b90b] text-4xl font-black uppercase italic tracking-tighter">
             Elite Trader Program
           </h1>
           <p className="text-gray-300 text-sm font-bold mt-1">
             Join and earn up to 30% Profit Share!
           </p>
        </div>
        
        <div className="flex gap-6 border-b border-gray-800 pb-2">
           <button className="text-[#f0b90b] font-black border-b-2 border-[#f0b90b] pb-2 text-xs uppercase">Recommended</button>
           <button className="text-gray-500 font-bold text-xs uppercase hover:text-gray-300">All Portfolios</button>
           <button className="text-gray-500 font-bold text-xs uppercase hover:text-gray-300">Favorite</button>
        </div>
      </div>

      {/* Traders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-[#f0b90b] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Syncing Market Data...</p>
          </div>
        ) : traders.length > 0 ? (
          traders.map((trader) => (
            <TraderCard key={trader._id} trader={trader} />
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-[#161a1e] border-2 border-dashed border-[#1e2329] rounded-[3rem]">
            <p className="text-gray-500 font-black uppercase tracking-widest">
              No Active Traders Found in Database
            </p>
            <p className="text-gray-600 text-[10px] mt-2">Please add traders via Admin API or MongoDB Atlas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyTrade;