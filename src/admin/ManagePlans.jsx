import React, { useState } from 'react';
import axios from 'axios';

const ManagePlans = () => {
  const [formData, setFormData] = useState({
    name: '', minAmount: '', maxAmount: '', profitPercent: '', durationHours: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/plans', formData);
      alert("Plan Created Successfully!");
      setFormData({ name: '', minAmount: '', maxAmount: '', profitPercent: '', durationHours: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-card-bg p-8 rounded-[2rem] border border-border">
      <h2 className="text-2xl font-black text-white uppercase italic mb-6">Create New Plan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Plan Name" 
          className="w-full bg-main-bg border border-border p-4 rounded-xl text-white outline-none focus:border-primary"
          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Min Amount" className="bg-main-bg border border-border p-4 rounded-xl text-white" value={formData.minAmount} onChange={(e) => setFormData({...formData, minAmount: e.target.value})} />
          <input type="number" placeholder="Max Amount" className="bg-main-bg border border-border p-4 rounded-xl text-white" value={formData.maxAmount} onChange={(e) => setFormData({...formData, maxAmount: e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase">Create Plan</button>
      </form>
    </div>
  );
};

export default ManagePlans;