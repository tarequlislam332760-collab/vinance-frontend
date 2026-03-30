import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const DepositRequests = () => {
  const { token } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('https://vinance-backend.vercel.app/api/admin/deposits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    try {
      await axios.put(`https://vinance-backend.vercel.app/api/admin/deposit/${id}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Request ${status} successfully!`);
      fetchRequests();
    } catch (err) {
      alert("Action failed");
    }
  };

  if (loading) return <div className="p-8 text-yellow-500 font-bold">Loading...</div>;

  return (
    <div className="p-8 text-left text-white">
      <h2 className="text-3xl font-bold mb-8">Deposit Requests</h2>
      <div className="bg-[#1e2329] rounded-2xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-5">User</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Method</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {requests.map((req) => (
              <tr key={req._id}>
                <td className="p-5">
                  <div className="font-bold">{req.user?.name}</div>
                  <div className="text-xs text-gray-500">{req.user?.email}</div>
                </td>
                <td className="p-5 text-emerald-400 font-bold">${req.amount}</td>
                <td className="p-5">{req.method} <br/><span className="text-xs text-gray-500">{req.transactionId}</span></td>
                <td className="p-5">{req.status}</td>
                <td className="p-5 text-right">
                  {req.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleAction(req._id, 'approved')} className="p-2 bg-emerald-600 rounded-lg"><CheckCircle size={18} /></button>
                      <button onClick={() => handleAction(req._id, 'rejected')} className="p-2 bg-red-600 rounded-lg"><XCircle size={18} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepositRequests;