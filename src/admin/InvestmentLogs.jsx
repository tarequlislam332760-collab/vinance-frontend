import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-center';

const InvestmentLogs = ({ data }) => { 
  const [searchTerm, setSearchTerm] = useState("");

  const logs = Array.isArray(data) ? data : [];

  const filteredLogs = logs.filter(log => {
    const search = searchTerm.toLowerCase();
    return (
      log.userId?.name?.toLowerCase().includes(search) || 
      log.planName?.toLowerCase().includes(search) || // ✅ ইউজার প্যানেল অনুযায়ী
      log.planId?.name?.toLowerCase().includes(search) ||
      log.userId?.email?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-4 md:p-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
          Investment <span className="text-yellow-500">Logs</span> 
          <TrendingUp className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />
        </h2>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search User or Plan..." 
            className="w-full bg-[#0b0e11] border border-gray-800 p-3 pl-10 rounded-2xl text-white outline-none focus:border-yellow-500 transition-all text-sm font-bold"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-[#1e2329] rounded-[2rem] md:rounded-[2.5rem] border border-gray-800 shadow-xl">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-[#0b0e11]/50 text-gray-500">
            <tr>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest">User Details</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest">Plan / Type</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest">Amount</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-5">
                    <p className="font-black uppercase text-xs md:text-sm">{log.userId?.name || "User"}</p>
                    <p className="text-[10px] text-gray-500 font-bold">{log.userId?.email || "N/A"}</p>
                  </td>
                  <td className="p-5">
                    {/* ✅ planName অথবা planId.name যেটা পাওয়া যায় সেটাই দেখাবে */}
                    <p className="font-bold text-xs md:text-sm uppercase text-yellow-500">
                        {log.planName || log.planId?.name || log.type || "Investment"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-black">
                      {log.planId?.profitPercent || 0}% ROI
                    </p>
                  </td>
                  <td className="p-5 font-black text-green-400 text-sm font-mono">
                    ${log.amount?.toLocaleString() || "0.00"}
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] uppercase font-black border ${
                      log.status?.toLowerCase() === 'active' || log.status?.toLowerCase() === 'approved'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {log.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-24 text-center text-gray-600 italic text-sm font-black uppercase">
                  No transaction data found in the records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvestmentLogs;