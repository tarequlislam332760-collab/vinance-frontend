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
        const res = await axios.get(`${API_URL}/api/plans`); // লিঙ্ক ঠিক করা হয়েছে
        setPlans(res.data);
      } catch (err) {
        console.error("Fetch plans error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [API_URL]);

  const handleInvest = async (plan) => {
    const amount = prompt(`Enter amount ($${plan.minAmount} - $${plan.maxAmount}):`);
    if (!amount || isNaN(amount)) return;

    try {
      await axios.post(
        `${API_URL}/api/invest`, // লিঙ্ক ঠিক করা হয়েছে
        { planId: plan._id, amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Investment Successful!");
      if (refreshUser) await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || "Check balance or network.");
    }
  };

  if (loading) return <Loader2 className="animate-spin text-primary mx-auto mt-20" />;

  return (
    <div className="bg-main-bg min-h-screen pt-28 px-6 pb-20">
      <h1 className="text-center text-4xl font-black text-white mb-10 uppercase italic">AI Trading Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map(plan => (
          <InvestmentCard key={plan._id} plan={plan} onInvest={handleInvest} />
        ))}
      </div>
    </div>
  );
};

export default Investment;