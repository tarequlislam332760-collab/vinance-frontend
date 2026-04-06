import React from 'react';
import axios from 'axios';
import { Trash2, TrendingUp } from 'lucide-react';

const ManageTraders = ({ traders, fetchData }) => {

  const handleDeleteTrader = async (traderId) => {
    const token = localStorage.getItem('token');
    const API_URL = "https://vinance-backend.vercel.app";

    if (window.confirm("Are you sure you want to delete this trader?")) {
      try {
        await axios.delete(`${API_URL}/api/admin/delete-trader/${traderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Trader Deleted Successfully!");
        if (fetchData) fetchData(); // ডাটা রিফ্রেশ করবে
      } catch (err) {
        alert("Error deleting trader");
      }
    }
  };

  return (
    <div className="bg-[#1e2329] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl p-6">
      <h3 className="text-gray-400 font-black uppercase text-xs mb-6 tracking-widest">Active Master Traders</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {traders.map((trader) => (
          <div key={trader._id} className="bg-[#0b0e11] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src={trader.image || "https://via.placeholder.com/50"} 
                className="w-10 h-10 rounded-full object-cover border border-gray-700" 
                alt={trader.name} 
              />
              <div>
                <p className="text-white font-bold text-sm">{trader.name}</p>
                <p className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <TrendingUp size={10} /> +${trader.profit} Profit
                </p>
              </div>
            </div>

            <button 
              onClick={() => handleDeleteTrader(trader._id)}
              className="p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"
              title="Delete Trader"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
      
      {traders.length === 0 && (
        <p className="text-gray-500 text-center py-10 text-sm italic">No traders found.</p>
      )}
    </div>
  );
};

export default ManageTraders;