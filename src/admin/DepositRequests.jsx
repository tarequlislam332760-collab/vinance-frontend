import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { CheckCircle, XCircle, Clock, Search, ExternalLink } from 'lucide-react';

const DepositRequests = () => {
  const { token } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ডাটা ফেচ করার ফাংশন
  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/deposits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching deposits:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // রিকোয়েস্ট অ্যাপ্রুভ বা রিজেক্ট করার ফাংশন
  const handleAction = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/deposit/${id}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Request ${status} successfully!`);
      fetchRequests(); // লিস্ট আপডেট করা
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <div className="p-8 text-yellow-500 font-bold">Loading requests...</div>;

  return (
    <div className="p-4 md:p-8 text-left animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Deposit Requests</h2>
        <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-lg border border-yellow-500/20 text-sm font-bold">
          Pending: {requests.filter(r => r.status === 'pending').length}
        </div>
      </div>

      <div className="bg-[#1e2329] rounded-2xl border border-gray-800 overflow-x-auto shadow-2xl">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr className="border-b border-gray-800">
              <th className="p-5">User / Email</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Method / TRX ID</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {requests.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-500">No deposit requests found.</td></tr>
            ) : (
              requests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-800/40 transition-all">
                  <td className="p-5">
                    <div className="font-bold text-white">{req.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{req.user?.email}</div>
                  </td>
                  <td className="p-5 font-mono text-emerald-400 font-bold">${req.amount}</td>
                  <td className="p-5">
                    <div className="text-sm text-gray-200 uppercase font-bold">{req.method}</div>
                    <div className="text-xs text-gray-500 font-mono">TRX: {req.transactionId}</div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                      req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {req.status === 'pending' && <Clock size={12} />}
                      {req.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(req._id, 'approved')}
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(req._id, 'rejected')}
                          className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepositRequests;