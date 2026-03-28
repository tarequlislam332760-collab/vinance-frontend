import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Bitcoin, Loader2 } from 'lucide-react';
import { UserContext } from '../context/UserContext'; 
import axios from 'axios';

const WalletPage = () => {
  // Context থেকে API_URL এবং token নেওয়া হচ্ছে যাতে সব পেজে মিল থাকে
  const { user, refreshUser, API_URL, token } = useContext(UserContext); 
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      // টোকেন বা API_URL না থাকলে রিকোয়েস্ট পাঠানোর দরকার নেই
      if (!token || !API_URL) return;

      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // ডেটা ফরম্যাট চেক করা হচ্ছে (Array অথবা Object.transactions)
        const historyData = Array.isArray(res.data) ? res.data : (res.data.transactions || []);
        setTransactions(historyData);
        
        if (refreshUser) await refreshUser(); 
      } catch (err) {
        console.error("Fetch Error:", err);
        setTransactions([]); // এরর হলে লিস্ট খালি রাখা হবে
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [token, API_URL, refreshUser]); // ডিপেন্ডেন্সি আপডেট করা হয়েছে

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-left pb-24 md:pb-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ব্যালেন্স কার্ড */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1e2329] to-[#161a1e] border border-gray-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 text-yellow-500"><Wallet size={120} /></div>
          <div className="relative z-10">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Total Balance</p>
            <h2 className="text-5xl md:text-6xl font-mono font-black text-white mb-8 tracking-tighter">
              ${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
            </h2>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/deposit')} className="flex-1 bg-yellow-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase text-xs hover:bg-yellow-400 transition-all">
                <ArrowDownLeft size={18} /> Deposit
              </button>
              <button onClick={() => navigate('/withdraw')} className="flex-1 bg-white/5 text-white font-black py-4 rounded-2xl border border-gray-800 flex items-center justify-center gap-2 uppercase text-xs hover:bg-white/10 transition-all">
                <ArrowUpRight size={18} /> Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* অ্যাসেট সেকশন */}
        <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-8 shadow-xl">
          <h3 className="font-black text-white uppercase text-sm mb-6 tracking-widest">Assets</h3>
          <div className="flex items-center justify-between p-4 bg-[#0b0e11] rounded-2xl border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Bitcoin size={20}/></div>
              <p className="font-bold text-white text-sm">USDT</p>
            </div>
            <p className="font-mono font-bold text-white">${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</p>
          </div>
        </div>

        {/* ট্রানজেকশন টেবিল */}
        <div className="lg:col-span-3 bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
          <h3 className="font-black text-white uppercase text-sm mb-8 flex items-center gap-2 tracking-[0.2em]"><Clock size={18} className="text-yellow-500" /> Recent Activity</h3>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-yellow-500" size={40} /></div>
            ) : (
              <table className="w-full">
                <thead className="text-[10px] text-gray-600 uppercase font-black border-b border-gray-800">
                  <tr>
                    <th className="pb-4 text-left px-2">Type/Method</th>
                    <th className="pb-4 text-left px-2">Amount</th>
                    <th className="pb-4 text-left px-2">Status</th>
                    <th className="pb-4 text-right px-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 px-2 font-bold text-white text-sm uppercase">
                          <span className="text-gray-500 mr-2 text-[10px] font-black italic">{tx.method || tx.symbol || 'System'}</span>
                          {tx.type}
                        </td>
                        <td className={`py-5 px-2 font-mono font-black text-sm ${tx.type === 'withdraw' || tx.type === 'sell' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {tx.type === 'withdraw' || tx.type === 'sell' ? '-' : '+'}${tx.amount}
                        </td>
                        <td className="py-5 px-2">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                            tx.status === 'approved' || tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                            tx.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>{tx.status}</span>
                        </td>
                        <td className="py-5 px-2 text-right text-[10px] text-gray-500 font-mono">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="py-20 text-center text-gray-600 text-[10px] font-black uppercase italic tracking-widest">No Transactions Found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;