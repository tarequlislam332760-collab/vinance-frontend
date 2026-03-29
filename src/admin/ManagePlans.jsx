import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const ManagePlans = () => {
  const { token } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '', minAmount: '', maxAmount: '', profitPercent: '', duration: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/plans', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Plan Created Successfully!");
      setFormData({ name: '', minAmount: '', maxAmount: '', profitPercent: '', duration: '' });
    } catch (err) {
      alert("Failed to create plan");
    }
  };

  return (
    <div className="bg-card-bg p-8 rounded-[2rem] border border-border text-left">
      <h2 className="text-2xl font-black text-white uppercase italic mb-6">Create New Plan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Plan Name (e.g. Starter)" 
          className="w-full bg-main-bg border border-border p-4 rounded-xl text-white outline-none focus:border-primary"
          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Min Amount" className="bg-main-bg border border-border p-4 rounded-xl text-white" value={formData.minAmount} onChange={(e) => setFormData({...formData, minAmount: e.target.value})} required />
          <input type="number" placeholder="Max Amount" className="bg-main-bg border border-border p-4 rounded-xl text-white" value={formData.maxAmount} onChange={(e) => setFormData({...formData, maxAmount: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Profit %" className="bg-main-bg border border-border p-4 rounded-xl text-white" value={formData.profitPercent} onChange={(e) => setFormData({...formData, profitPercent: e.target.value})} required />
          <input type="number" placeholder="Duration (Hours)" className="bg-main-bg border border-border p-4 rounded-xl text-white" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
        </div>
        <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-primary-hover transition-all">Create Plan</button>
      </form>
    </div>
  );
};

export default ManagePlans;