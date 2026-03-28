import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Loader2 } from 'lucide-react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const Withdraw = () => {
  const navigate = useNavigate();
  // Context থেকে API_URL টা নিয়ে আসা ভালো, যা আমরা UserContext-এ সেট করেছিলাম
  const { user, token, setUser, API_URL } = useContext(UserContext); 
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // যদি API_URL কন্টেক্সটে না থাকে, তবে এখানে এভাবে লিখে দিতে পারেন:
  const BASE_URL = API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://your-backend.vercel.app");

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(amount);

    if (withdrawAmt > user?.balance) return alert("❌ Insufficient Balance!");
    if (withdrawAmt <= 0) return alert("❌ Please enter a valid amount");

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/withdraw`, 
        { amount: withdrawAmt, address }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ১. গ্লোবাল স্টেট আপডেট (ব্যালেন্স সাথে সাথে কমবে)
      setUser({ ...user, balance: res.data.newBalance });
      
      alert("✅ " + res.data.message);
      navigate('/dashboard'); // সফল হলে ড্যাশবোর্ডে নিয়ে যাবে
    } catch (err) {
      alert(err.response?.data?.message || "❌ Withdrawal Failed. Please try again.");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-[#1e2329] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
          Withdrawal <Wallet className="text-yellow-500" size={28}/>
        </h2>

        {/* ব্যালেন্স কার্ড */}
        <div className="bg-[#0b0e11] p-4 rounded-2xl mb-6 border border-gray-800 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest">Available Balance</p>
          <p className="text-3xl font-bold text-yellow-500 mt-1">${user?.balance?.toFixed(2)}</p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block ml-1">USDT TRC20 Address</label>
            <input 
              type="text" 
              required 
              placeholder="Ex: TWD7jF..." 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="w-full bg-[#0b0e11] p-4 rounded-xl border border-gray-800 outline-none focus:border-yellow-500 transition-all" 
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block ml-1">Amount to Withdraw</label>
            <input 
              type="number" 
              required 
              placeholder="Min $10" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className="w-full bg-[#0b0e11] p-4 rounded-xl border border-gray-800 outline-none focus:border-yellow-500 transition-all" 
            />
          </div>

          <button 
            type="submit"
            disabled={loading} 
            className={`w-full py-4 rounded-xl font-bold text-black transition-all ${loading ? 'bg-gray-600' : 'bg-yellow-500 hover:bg-yellow-400 active:scale-95'}`}
          >
            {loading ? <Loader2 className="animate-spin mx-auto"/> : "Confirm Withdrawal"}
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-500 mt-6">
          Withdrawals are processed within 24 hours.
        </p>
      </div>
    </div>
  );
};

export default Withdraw;