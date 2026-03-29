import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import InvestmentCard from '../components/InvestmentCard';
import { PieChart, Loader2 } from 'lucide-react';

const Investment = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { API_URL, token, refreshUser } = useContext(UserContext);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // ব্যাকএন্ড থেকে প্ল্যানগুলো নিয়ে আসা
        const res = await axios.get(`${API_URL}/api/investments/plans`);
        setPlans(res.data);
      } catch (err) {
        console.error("Plans fetching error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [API_URL]);

  const handleInvest = async (plan) => {
    const amount = prompt(`Enter investment amount for ${plan.name}\n(Min: $${plan.minAmount} - Max: $${plan.maxAmount}):`);
    
    if (!amount || isNaN(amount)) return;

    if (parseFloat(amount) >= plan.minAmount && parseFloat(amount) <= plan.maxAmount) {
      try {
        const res = await axios.post(
          `${API_URL}/api/investments/invest`, 
          { planId: plan._id, amount: parseFloat(amount) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert("Investment Successful! Your profit will be added soon.");
        if (refreshUser) await refreshUser(); // ব্যালেন্স আপডেট করার জন্য
      } catch (err) {
        alert(err.response?.data?.message || "Error investing. Please check your balance.");
      }
    } else {
      alert(`Please enter an amount between $${plan.minAmount} and $${plan.maxAmount}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main-bg flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary animate-spin" size={48} />
        <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest italic">Syncing AI Plans...</p>
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen pt-28 pb-32 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <PieChart size={40} />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
          AI Trading <span className="text-primary">Plans</span>
        </h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] max-w-md mx-auto leading-relaxed">
          Automated AI-driven investment strategies for consistent growth
        </p>
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <InvestmentCard key={plan._id} plan={plan} onInvest={handleInvest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card-bg border border-dashed border-border rounded-[3rem] max-w-2xl mx-auto">
          <p className="text-gray-600 font-black uppercase text-sm tracking-widest italic">No investment plans available right now.</p>
        </div>
      )}
    </div>
  );
};

export default Investment;