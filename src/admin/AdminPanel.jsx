import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import ManageUsers from './ManageUsers';
import PendingRequests from './PendingRequests';
import ManagePlans from './ManagePlans';
import InvestmentLogs from './InvestmentLogs';

const AdminPanel = () => {
  const { API_URL, token } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [investments, setInvestments] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newBalance, setNewBalance] = useState("");

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/admin/all-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || []);
      setRequests(res.data.requests || []);
      setInvestments(res.data.investments || []); 
    } catch (err) { 
      console.error("Admin fetch error", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleBalanceUpdate = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/update-balance`, 
        { userId: selectedUser._id, balance: newBalance },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert("Error updating balance"); }
  };

  if (loading) return <div className="text-center mt-20 text-yellow-500 font-black italic">ACCESSING COMMAND CENTER...</div>;

  return (
    <div className="p-8 bg-[#0b0e11] min-h-screen text-white">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-yellow-500 italic uppercase">Command Center</h2>
        <div className="flex gap-2 bg-[#1e2329] p-1 rounded-xl overflow-x-auto">
          {['users', 'requests', 'plans', 'logs'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase whitespace-nowrap ${activeTab === tab ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1e2329] rounded-[2.5rem] p-6 border border-gray-800 overflow-hidden">
        {activeTab === 'users' && <ManageUsers users={users || []} onEdit={(user) => { setSelectedUser(user); setNewBalance(user.balance); setIsModalOpen(true); }} />}
        {activeTab === 'requests' && <PendingRequests requests={requests || []} fetchData={fetchData} />}
        {activeTab === 'plans' && <ManagePlans />}
        {activeTab === 'logs' && <InvestmentLogs data={investments || []} />} 
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1e2329] p-8 rounded-[2rem] border border-gray-800 w-full max-w-xs">
            <h3 className="mb-4 font-black uppercase italic text-yellow-500">Update Balance</h3>
            <input type="number" value={newBalance} onChange={(e)=>setNewBalance(e.target.value)} className="w-full bg-black border border-gray-800 p-4 rounded-xl text-white mb-4 outline-none focus:border-yellow-500" />
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 text-gray-500 font-black uppercase text-[10px]">Cancel</button>
              <button onClick={handleBalanceUpdate} className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-black uppercase text-[10px]">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;