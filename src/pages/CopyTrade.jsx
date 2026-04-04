import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TraderCard from '../components/TraderCard';

const CopyTrade = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // আপনার লাইভ ব্যাকএন্ড লিঙ্কটি এখানে দিন (নিচেরটি উদাহরণ)
  const API_URL = "https://vinance-backend.vercel.app/api/traders";

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        
        // কনসোলে চেক করার জন্য যে ডাটা আসছে কিনা
        console.log("Traders Data:", res.data);
        
        setTraders(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load traders. Check Console.");
        setLoading(false);
      }
    };
    fetchTraders();
  }, []);

  return (
    <div className="bg-[#0b0e11] min-h-screen p-6 md:p-12 text-white">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-[#f0b90b] text-4xl font-black uppercase italic tracking-tighter">
          Elite Traders
        </h1>
        <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">
          Copy the best, trade like a pro
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-[#f0b90b] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold">Connecting to Market...</p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-20 text-red-500 font-bold">
            {error}
          </div>
        ) : traders.length > 0 ? (
          traders.map((trader) => (
            <TraderCard key={trader._id} trader={trader} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-[#1e2329] rounded-[2rem]">
            <p className="text-gray-500 font-black uppercase">No Active Traders Found in Database</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyTrade;