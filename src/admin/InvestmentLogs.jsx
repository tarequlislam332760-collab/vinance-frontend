import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, TrendingUp } from 'lucide-react';

const InvestmentLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/investments');
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };
    fetchLogs();
  }, []);

  // সার্চ ফিল্টারিং লজিক
  const filteredLogs = logs.filter(log => 
    log.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.planId.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            Investment <span className="text-primary">Logs</span> <TrendingUp className="text-primary w-8 h-8" />
          </h2>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Monitor all active and completed user investments
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search User or Plan..." 
            className="w-full bg-card-bg border border-border p-3 pl-12 rounded-2xl text-white outline-none focus:border-primary font-bold text-sm transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card-bg rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">User Details</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Plan & ROI</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Invested Amount</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Current Profit</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {filteredLogs.map((log, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <p className="font-black uppercase italic text-sm">{log.userId.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold">{log.userId.email}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-sm text-gray-300">{log.planId.name}</p>
                    <p className="text-[10px] text-primary font-black uppercase">{log.planId.profitPercent}% ROI</p>
                  </td>
                  <td className="p-6 font-black text-white italic">
                    ${log.amount.toFixed(2)}
                  </td>
                  <td className="p-6">
                    <span className="text-green-400 font-black italic">+${log.profit.toFixed(2)}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      log.status === 'active' 
                      ? 'bg-primary/10 text-primary border-primary/30 animate-pulse' 
                      : 'bg-gray-500/10 text-gray-500 border-gray-500/30'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500 font-black uppercase italic tracking-widest">
                    No investment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvestmentLogs;