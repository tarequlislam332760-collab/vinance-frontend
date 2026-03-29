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
    } catch (err) { console.error("Fetch error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  // নতুন ব্যালেন্স আপডেট লজিক (কানেক্টেড)
  const handleBalanceUpdate = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/update-balance`, 
        { userId: selectedUser._id, balance: newBalance },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(false);
      fetchData(); // ডাটা রিফ্রেশ
      alert("Balance Updated Successfully!");
    } catch (err) { alert("Failed to update balance"); }
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

  if (loading) return <div className="h-screen flex items-center justify-center text-yellow-500 font-black animate-pulse uppercase">LOADING COMMAND CENTER...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#0b0e11] min-h-screen text-left pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black text-yellow-500 italic uppercase tracking-tighter">Command Center</h2>
        
        {/* ট্যাব নেভিগেশন */}
        <div className="flex flex-wrap gap-2 bg-[#1e2329] p-1 rounded-xl border border-gray-800">
          {['users', 'requests', 'plans', 'logs'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>
              {tab === 'logs' ? 'Invest Logs' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-6 shadow-2xl">
        {activeTab === 'users' && <ManageUsers users={users} search={search} setSearch={setSearch} onEdit={(user) => { setSelectedUser(user); setNewBalance(user.balance); setIsModalOpen(true); }} />}
        {activeTab === 'requests' && <PendingRequests requests={requests} handleRequest={handleRequest} />}
        {activeTab === 'plans' && <ManagePlans />}
        {activeTab === 'logs' && <InvestmentLogs />}
      </div>

      {/* Balance Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-6">
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