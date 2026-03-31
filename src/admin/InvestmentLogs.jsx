import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';

const InvestmentLogs = ({ data }) => { 
  const [searchTerm, setSearchTerm] = useState("");

  const logs = data || [];

  // ✅ Safety Check যোগ করা হয়েছে যাতে userId বা planId মিসিং থাকলেও ক্র্যাশ না করে
  const filteredLogs = logs.filter(log => 
    log.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.planId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            Investment <span className="text-yellow-500">Logs</span> <TrendingUp className="text-yellow-500 w-8 h-8" />
          </h2>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" /> {/* সার্চ আইকন যোগ করা হয়েছে */}
          <input 
            type="text" 
            placeholder="Search User or Plan..." 
            className="w-full bg-[#0b0e11] border border-gray-800 p-3 pl-10 rounded-2xl text-white outline-none focus:border-yellow-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-[#1e2329] rounded-[2.5rem] border border-gray-800">
        <table className="w-full text-left">
          <thead className="bg-[#0b0e11]/50">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">User Details</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Plan & ROI</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Amount</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <p className="font-black uppercase text-sm">{log.userId?.name || "Deleted User"}</p>
                    <p className="text-[10px] text-gray-500">{log.userId?.email || "N/A"}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-sm">{log.planId?.name || "Unknown Plan"}</p>
                    <p className="text-[10px] text-yellow-500 font-black">
                      {log.planId?.profitPercent || 0}% ROI
                    </p>
                  </td>
                  <td className="p-6 font-black text-green-400">${log.amount}</td>
                  <td className="p-6 text-center">
                     <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black border ${
                       log.status === 'active' 
                       ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                       : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                     }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-600 italic">No investment data found...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvestmentLogs;