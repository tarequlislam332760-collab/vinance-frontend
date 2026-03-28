import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import ManageUsers from './ManageUsers';
import PendingRequests from './PendingRequests';

const AdminPanel = () => {
  const { API_URL, token } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newBalance, setNewBalance] = useState("");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/all-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || []);
      setRequests(res.data.requests || []);
    } catch (err) { console.error("Admin fetch error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchData(); 
  }, [API_URL, token]);

  const handleBalanceUpdate = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/update-balance`, 
        { userId: selectedUser._id, balance: newBalance },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert("Balance update failed"); }
  };

  const handleRequest = async (id, status) => {
    try {
      await axios.post(`${API_URL}/api/admin/handle-request`, 
        { requestId: id, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) { alert("Action failed"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-yellow-500 font-black uppercase italic animate-pulse">LOADING ADMIN DATA...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#0b0e11] min-h-screen text-left">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-yellow-500 italic uppercase tracking-tighter">Command Center</h2>
        <div className="flex gap-2 bg-[#1e2329] p-1 rounded-xl border border-gray-800">
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'users' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}>Users</button>
          <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'requests' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}>Requests</button>
        </div>
      </div>

      <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-6 md:p-8">
        {activeTab === 'users' ? (
          <ManageUsers 
            users={users} 
            search={search} 
            setSearch={setSearch} 
            onEdit={(user) => { setSelectedUser(user); setNewBalance(user.balance); setIsModalOpen(true); }} 
          />
        ) : (
          <PendingRequests requests={requests} handleRequest={handleRequest} />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-6 text-left">
          <div className="bg-[#1e2329] border border-gray-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase italic mb-6">Update Balance</h3>
            <input type="number" value={newBalance} onChange={(e)=>setNewBalance(e.target.value)} className="w-full bg-[#0b0e11] border border-gray-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-yellow-500 font-mono text-xl mb-6" />
            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-500 font-black uppercase text-[10px]">Cancel</button>
              <button onClick={handleBalanceUpdate} className="flex-1 bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase text-[10px]">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;