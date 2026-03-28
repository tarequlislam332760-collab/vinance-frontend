import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const Withdraw = () => {
  const navigate = useNavigate();
  const { user, token, setUser, API_URL } = useContext(UserContext); 
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(amount);

    if (withdrawAmt > user?.balance) return alert("❌ Insufficient Balance!");
    if (withdrawAmt < 10) return alert("❌ Minimum withdrawal $10");

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/withdraw`, 
        { amount: withdrawAmt, address, method: 'USDT (TRC20)' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ব্যালেন্স লোকাল স্টেটে আপডেট করা হচ্ছে
      setUser({ ...user, balance: user.balance - withdrawAmt });
      
      alert("✅ " + res.data.message);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "❌ Withdrawal Failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md mb-6"><button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400"><ArrowLeft size={20}/> Back</button></div>
      <div className="max-w-md w-full bg-[#1e2329] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">Withdrawal <Wallet className="text-yellow-500" size={28}/></h2>
        <div className="bg-[#0b0e11] p-4 rounded-2xl mb-6 border border-gray-800 text-center">
          <p className="text-gray-500 text-xs">Available Balance</p>
          <p className="text-3xl font-bold text-yellow-500">${user?.balance?.toFixed(2)}</p>
        </div>
        <form onSubmit={handleWithdraw} className="space-y-5">
          <input type="text" required placeholder="USDT TRC20 Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#0b0e11] p-4 rounded-xl border border-gray-800 outline-none focus:border-yellow-500" />
          <input type="number" required placeholder="Amount (Min $10)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#0b0e11] p-4 rounded-xl border border-gray-800 outline-none focus:border-yellow-500" />
          <button disabled={loading} className="w-full py-4 rounded-xl font-bold text-black bg-yellow-500 hover:bg-yellow-400 active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto"/> : "Confirm Withdrawal"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Withdraw;