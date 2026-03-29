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

      // ব্যালেন্স লোকাল স্টেটে আপডেট
      setUser({ ...user, balance: user.balance - withdrawAmt });
      
      alert("✅ " + res.data.message);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "❌ Withdrawal Failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#03101a] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-[#1aa07b]">
          <ArrowLeft size={20}/> Back
        </button>
      </div>
      <div className="max-w-md w-full bg-[#032a3b] p-8 rounded-[2.5rem] border border-[#143e52] shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
          Withdrawal <Wallet className="text-[#1aa07b]" size={28}/>
        </h2>
        
        <div className="bg-[#03101a] p-5 rounded-2xl mb-6 border border-[#143e52] text-center">
          <p className="text-gray-400 text-xs mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-[#1aa07b]">${user?.balance?.toFixed(2)}</p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-5">
          <input 
            type="text" required placeholder="USDT TRC20 Address" 
            value={address} onChange={(e) => setAddress(e.target.value)} 
            className="w-full bg-[#03101a] p-4 rounded-xl border border-[#143e52] outline-none focus:border-[#1aa07b] transition-all" 
          />
          <input 
            type="number" required placeholder="Amount (Min $10)" 
            value={amount} onChange={(e) => setAmount(e.target.value)} 
            className="w-full bg-[#03101a] p-4 rounded-xl border border-[#143e52] outline-none focus:border-[#1aa07b] transition-all" 
          />
          <button disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-[#1aa07b] hover:bg-[#158566] active:scale-95 transition-all shadow-lg flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin"/> : "Confirm Withdrawal"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Withdraw;