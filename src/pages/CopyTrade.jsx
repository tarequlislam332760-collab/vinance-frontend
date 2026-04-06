import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TraderCard from '../components/TraderCard';

const CopyTrade = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ব্যাকএন্ড লিঙ্ক (নিশ্চিত করুন আপনার ব্যাকএন্ডে এই রাউটটি ডাটা পাঠায়)
  const API_URL = "https://vinance-backend.vercel.app/api/traders";

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        const res = await axios.get(API_URL);
        // যদি ডাটা সরাসরি অ্যারে হিসেবে আসে তবে res.data, নাহলে res.data.traders
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
    <div className="bg-[#0b0e11] min-h-screen pb-20 text-white">
      <div className="p-4 border-b border-gray-800">
        <div className="flex gap-6 text-sm font-bold uppercase overflow-x-auto whitespace-nowrap">
          <span className="text-[#f0b90b] border-b-2 border-[#f0b90b] pb-1">Recommended</span>
          <span className="text-gray-500">All Portfolios</span>
          <span className="text-gray-500">Favorite</span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 gap-4">
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
             <p className="text-xs text-gray-600 mt-2">Add traders from Admin Panel</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyTrade;