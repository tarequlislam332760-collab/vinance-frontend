import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InvestmentCard from '../components/InvestmentCard';

const Investment = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    // ব্যাকএন্ড থেকে প্ল্যানগুলো নিয়ে আসা
    const fetchPlans = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/plans');
        setPlans(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlans();
  }, []);

  const handleInvest = async (plan) => {
    const amount = prompt(`Enter investment amount for ${plan.name} (Min: $${plan.minAmount}):`);
    if (amount >= plan.minAmount) {
      try {
        await axios.post('http://localhost:5000/api/invest', { planId: plan._id, amount });
        alert("Investment Successful!");
      } catch (err) {
        alert(err.response.data.message || "Error investing");
      }
    } else {
      alert("Invalid amount!");
    }
  };

  return (
    <div className="bg-main-bg min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
          AI Trading <span className="text-primary">Plans</span>
        </h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">
          Choose the best plan for your financial growth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <InvestmentCard key={plan._id} plan={plan} onInvest={handleInvest} />
        ))}
      </div>
    </div>
  );
};

export default Investment;