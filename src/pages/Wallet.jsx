import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, 
  Clock, ShieldCheck, ChevronRight, Bitcoin
} from 'lucide-react';
import { UserContext } from '../context/UserContext'; // আপনার কন্টেক্সট পাথ অনুযায়ী চেক করুন

const WalletPage = () => {
  const { user } = useContext(UserContext); // কনটেক্সট থেকে ইউজার ডাটা নেয়া
  const navigate = useNavigate();

  // রিসেন্ট ট্রানজ্যাকশন স্ট্যাটিক রাখা হয়েছে, তবে ব্যালেন্স ডাইনামিক
  const transactions = [
    { id: 1, type: 'Deposit', amount: '+ $500.00', status: 'Completed', date: 'Mar 24, 2026' },
    { id: 2, type: 'Withdraw', amount: '- $120.00', status: 'Pending', date: 'Mar 23, 2026' },
  ];

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-left pb-24 md:pb-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">My Wallet</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Manage your assets and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1e2329] to-[#161a1e] border border-gray-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 text-yellow-500">
            <Wallet size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
                <ShieldCheck size={18} />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verified Account</span>
            </div>

            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Total Available Balance</p>
            <h2 className="text-5xl md:text-6xl font-mono font-black text-white mb-8 tracking-tighter">
              ${user?.balance?.toLocaleString() || "0.00"}
            </h2>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/deposit')}
                className="flex-1 min-w-[140px] bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 uppercase text-xs tracking-widest"
              >
                <ArrowDownLeft size={18} /> Deposit
              </button>
              <button 
                onClick={() => navigate('/withdraw')}
                className="flex-1 min-w-[140px] bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-gray-800 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase text-xs tracking-widest"
              >
                <ArrowUpRight size={18} /> Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Assets Summary */}
        <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-8 shadow-xl">
          <h3 className="font-black text-white uppercase text-sm mb-6 tracking-widest">Asset Distribution</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Bitcoin size={20}/></div>
                <div>
                  <p className="font-bold text-white text-sm">USDT</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Tether</p>
                </div>
              </div>
              <p className="font-mono font-bold text-white text-right">${user?.balance?.toLocaleString()}</p>
            </div>
            <div className="pt-4 border-t border-gray-800 text-center">
               <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest italic">More assets coming soon</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3 bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-white uppercase text-sm tracking-widest flex items-center gap-2">
              <Clock size={18} className="text-yellow-500" /> Recent Transactions
            </h3>
            <button className="text-[10px] font-black text-yellow-500 uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-[9px] text-gray-600 uppercase font-black border-b border-gray-800">
                <tr>
                  <th className="pb-4 text-left">Type</th>
                  <th className="pb-4 text-left">Amount</th>
                  <th className="pb-4 text-left">Status</th>
                  <th className="pb-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="group">
                    <td className="py-5 font-bold text-white text-sm uppercase tracking-tighter">{tx.type}</td>
                    <td className={`py-5 font-mono font-black text-sm ${tx.type === 'Deposit' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount}
                    </td>
                    <td className="py-5">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-5 text-right text-[10px] font-bold text-gray-500 uppercase">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WalletPage;