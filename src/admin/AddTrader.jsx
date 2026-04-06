import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { UserPlus, TrendingUp, Percent, DollarSign, Activity, Save } from 'lucide-react';

const AddTrader = () => {
  const { API_URL } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '',
    profit: '',
    winRate: '',
    aum: '',
    mdd: '',
    chartData: '10, 25, 20, 45, 30, 60' // ডিফল্ট গ্রাফ ডাটা
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // স্ট্রিং চার্ট ডাটাকে অ্যারেতে রূপান্তর
      const processedData = {
        ...formData,
        chartData: formData.chartData.split(',').map(Number),
        profit: Number(formData.profit),
        winRate: Number(formData.winRate),
        aum: Number(formData.aum),
        mdd: Number(formData.mdd)
      };

      await axios.post(`${API_URL}/api/admin/create-trader`, processedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Trader Created Successfully!");
      setFormData({ name: '', profit: '', winRate: '', aum: '', mdd: '', chartData: '10, 25, 20, 45, 30, 60' });
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed to create trader"));
    }
  };

  return (
    <div className="p-6 bg-[#0b0e11] min-h-screen text-white">
      <div className="max-w-2xl mx-auto bg-[#1e2329] p-8 rounded-3xl border border-gray-800 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#f0b90b]">
          <UserPlus /> Create New Master Trader
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-full">
            <label className="text-xs text-gray-400 block mb-2">Trader Name</label>
            <input 
              type="text" required placeholder="e.g. BilluGulati"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl focus:border-[#f0b90b] outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Profit (30D PnL %)</label>
            <input 
              type="number" step="0.01" required placeholder="318.00"
              value={formData.profit} onChange={(e) => setFormData({...formData, profit: e.target.value})}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Win Rate (%)</label>
            <input 
              type="number" step="0.01" required placeholder="81.87"
              value={formData.winRate} onChange={(e) => setFormData({...formData, winRate: e.target.value})}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">AUM (Assets Under Management)</label>
            <input 
              type="number" required placeholder="26170.62"
              value={formData.aum} onChange={(e) => setFormData({...formData, aum: e.target.value})}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Max Drawdown (MDD %)</label>
            <input 
              type="number" step="0.01" required placeholder="8.79"
              value={formData.mdd} onChange={(e) => setFormData({...formData, mdd: e.target.value})}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none"
            />
          </div>

          <div className="col-span-full">
            <label className="text-xs text-gray-400 block mb-2">Chart Data (Comma Separated)</label>
            <input 
              type="text" required placeholder="10, 20, 15, 35..."
              value={formData.chartData} onChange={(e) => setFormData({...formData, chartData: e.target.value})}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none"
            />
          </div>

          <button 
            type="submit" 
            className="col-span-full bg-[#f0b90b] text-black font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-[#e0a808] transition-all"
          >
            <Save size={20} /> Deploy Trader to Market
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTrader;