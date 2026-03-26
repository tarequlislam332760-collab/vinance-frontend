import React, { useState, useContext } from 'react';
import { ArrowLeft, Wallet, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios'; // axios ইম্পোর্ট করুন

const Withdraw = () => {
  const navigate = useNavigate();
  const { user, token, setUser } = useContext(UserContext); // token এবং setUser যোগ করা হয়েছে
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (parseFloat(amount) > user?.balance) {
      alert("Insufficient balance!");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        'http://localhost:5000/api/withdraw', 
        { amount: parseFloat(amount), address }, 
        config
      );

      if (response.data) {
        // ড্যাশবোর্ডে ব্যালেন্স আপডেট করার জন্য
        setUser({ ...user, balance: response.data.newBalance });
        alert(`Withdrawal of $${amount} is successful!`);
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Withdrawal failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] p-6 text-left animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>
      
      <div className="max-w-md mx-auto bg-[#1e2329] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">Withdraw Funds</h2>
          <p className="text-gray-500 text-sm mb-8">Securely withdraw your earnings to your wallet.</p>

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="bg-[#0b0e11] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
              <span className="text-gray-500 text-xs font-bold uppercase">Available</span>
              <span className="text-yellow-500 font-mono font-bold">${user?.balance?.toLocaleString()}</span>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-2 px-1">Wallet Address (USDT TRC20)</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-3.5 text-gray-600" size={18} />
                <input 
                  type="text" required value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Paste your address here" 
                  className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-yellow-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-2 px-1">Withdraw Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-600 font-bold">$</span>
                <input 
                  type="number" required value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-yellow-500 transition-all font-mono"
                />
                <button 
                  type="button" onClick={() => setAmount(user?.balance)}
                  className="absolute right-3 top-2.5 text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1.5 rounded-lg font-bold hover:bg-yellow-500 hover:text-black transition-all"
                > MAX </button>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
              <AlertCircle className="text-yellow-500 shrink-0" size={18} />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Please double-check your address. Withdrawals cannot be recovered.
              </p>
            </div>

            <button 
              type="submit" disabled={loading}
              className={`w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Processing..." : "Confirm Withdrawal"} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;