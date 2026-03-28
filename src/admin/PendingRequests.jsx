import React from 'react';

const PendingRequests = ({ requests, handleRequest }) => {
  return (
    <div className="bg-[#1e2329] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-gray-800 text-left">
        <h3 className="font-black uppercase text-xs tracking-widest text-gray-400">Transaction Requests</h3>
      </div>
      <div className="overflow-x-auto text-left">
        <table className="w-full text-[11px] font-bold">
          <thead className="bg-[#0b0e11]/50 text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="p-5">Type</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {requests.length > 0 ? requests.map(req => (
              <tr key={req._id} className="hover:bg-white/[0.02]">
                <td className={`p-5 uppercase font-black ${req.type === 'deposit' ? 'text-blue-400' : 'text-red-400'}`}>
                  {req.type}
                </td>
                <td className="p-5 font-mono text-white text-sm">${req.amount}</td>
                <td className="p-5 uppercase text-yellow-500">{req.status}</td>
                <td className="p-5 text-right space-x-2">
                  <button onClick={() => handleRequest(req._id, 'completed')} className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">Approve</button>
                  <button onClick={() => handleRequest(req._id, 'rejected')} className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all">Reject</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="p-10 text-center text-gray-600 uppercase italic">No Pending Requests</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingRequests;