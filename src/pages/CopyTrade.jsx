import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TraderCard from '../components/TraderCard';

const CopyTrade = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  // আপনার Vercel ব্যাকএন্ড লিঙ্কটি এখানে দিন
  const API_URL = "https://vinance-backend.vercel.app/api/traders";

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        const res = await axios.get(API_URL);
        setTraders(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching traders", err);
        setLoading(false);
      }
    };
    fetchTraders();
  }, []);

  return (
    <div className="bg-[#0b0e11] min-h-screen pb-20 text-white">
      {/* Header section with tabs like 'Recommended', 'All Portfolios' */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex gap-6 text-sm font-bold uppercase overflow-x-auto">
          <span className="text-[#f0b90b] border-b-2 border-[#f0b90b] pb-1">Recommended</span>
          <span className="text-gray-500">All Portfolios</span>
          <span className="text-gray-500">Favorite</span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-center mt-10">Loading Traders...</p>
        ) : traders.length > 0 ? (
          traders.map((t) => <TraderCard key={t._id} trader={t} />)
        ) : (
          <p className="text-center mt-10 text-gray-500">No Active Traders Found</p>
        )}
      </div>
    </div>
  );
};

export default CopyTrade;