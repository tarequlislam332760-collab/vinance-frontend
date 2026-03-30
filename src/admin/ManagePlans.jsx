import React, { useState } from 'react';
import API from '../api';

const ManagePlans = () => {
  const [formData, setFormData] = useState({ name: '', minAmount: '', maxAmount: '', profitPercent: '', duration: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/admin/create-plan', formData);
      alert("Plan Created Successfully!");
      setFormData({ name: '', minAmount: '', maxAmount: '', profitPercent: '', duration: '' });
    } catch (err) {
      alert("Failed to create plan");
    }
  };

  return (
    <div className="bg-[#1e2329] p-8 rounded-2xl border border-gray-800 text-left">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Plan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Plan Name" className="w-full bg-black border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-yellow-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Min Amount" className="bg-black border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-yellow-500" value={formData.minAmount} onChange={(e) => setFormData({...formData, minAmount: e.target.value})} required />
          <input type="number" placeholder="Max Amount" className="bg-black border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-yellow-500" value={formData.maxAmount} onChange={(e) => setFormData({...formData, maxAmount: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Profit %" className="bg-black border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-yellow-500" value={formData.profitPercent} onChange={(e) => setFormData({...formData, profitPercent: e.target.value})} required />
          <input type="number" placeholder="Duration (Hours)" className="bg-black border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-yellow-500" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
        </div>
        <button type="submit" className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold uppercase hover:bg-yellow-600 transition-all">Create Plan</button>
      </form>
    </div>
  );
};

export default ManagePlans;