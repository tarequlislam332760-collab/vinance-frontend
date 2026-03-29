import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyInvestments = () => {
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    const fetchMyInvests = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/my-investments');
        setInvestments(res.data);
      } catch (err) { console.error(err); }
    };
    fetchMyInvests();
  }, []);

  return (
    <div className="bg-main-bg min-h-screen pt-28 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-white uppercase italic mb-8 border-l-4 border-primary pl-4">My Investment Logs</h2>
        <div className="overflow-x-auto bg-card-bg rounded-[2rem] border border-border shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Plan Name</th>
                <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Amount</th>
                <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Profit</th>
                <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="text-white font-bold text-sm">
              {investments.map((inv, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 uppercase italic">{inv.planId.name}</td>
                  <td className="p-6 text-primary">${inv.amount}</td>
                  <td className="p-6 text-green-400">+${inv.profit}</td>
                  <td className="p-6">
                    <span className={`px-4 py-1 rounded-full text-[10px] uppercase font-black ${inv.status === 'active' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-gray-500/20 text-gray-400'}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyInvestments;