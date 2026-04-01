import React, { useState, useEffect, useContext, useCallback } from 'react';
import API from '../api'; 
import { UserContext } from '../context/UserContext';
import ManageUsers from './ManageUsers';
import PendingRequests from './PendingRequests';
import ManagePlans from './ManagePlans';
import InvestmentLogs from './InvestmentLogs';

const AdminPanel = () => {
  const { token } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [investments, setInvestments] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newBalance, setNewBalance] = useState("");

  // ডাটা ফেচ করার ফাংশন
  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await API.get('/api/admin/all-data');
      
      if (res.data) {
        setUsers(res.data.users || []);
        setRequests(res.data.requests || []);
        setInvestments(res.data.investments || []);
      }
      
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBalanceUpdate = async () => {
    if (!newBalance || newBalance < 0) {
      alert("Invalid balance amount");
      return;
    }

    try {
      await API.post('/api/admin/update-balance', {
        userId: selectedUser._id,
        balance: newBalance
      });

      setIsModalOpen(false);
      fetchData(); 
      alert("Balance Updated!");
    } catch (err) {
      alert("Error updating balance");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0b0e11]">
      <div className="text-yellow-500 font-black italic animate-pulse uppercase tracking-widest">
        Accessing Command Center...
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-white text-left font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h2 className="text-3xl font-black text-yellow-500 italic uppercase tracking-tighter">
          Command <span className="text-white">Center</span>
        </h2>

        <div className="flex gap-2 bg-[#1e2329] p-1.5 rounded-2xl overflow-x-auto no-scrollbar w-full md:w-auto shadow-xl border border-gray-800">
          {['users', 'requests', 'plans', 'logs'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-[#1e2329] rounded-[2.5rem] p-4 md:p-8 border border-gray-800 shadow-2xl overflow-hidden min-h-[400px]">
        {activeTab === 'users' && (
          <ManageUsers
            users={users}
            search={searchTerm}
            setSearch={setSearchTerm}
            onEdit={(user) => {
              setSelectedUser(user);
              setNewBalance(user.balance);
              setIsModalOpen(true);
            }}
          />
        )}

        {activeTab === 'requests' && (
          <PendingRequests requests={requests} fetchData={fetchData} />
        )}

        {activeTab === 'plans' && <ManagePlans fetchData={fetchData} />}

        {/* ✅ Fix: Logs ট্যাবে requests ডাটা পাঠানো হয়েছে যাতে সব ট্রানজেকশন দেখা যায় */}
        {activeTab === 'logs' && <InvestmentLogs data={requests} />}
      </div>

      {/* Balance Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/90 backdrop-blur-sm z-[999] p-4">
          <div className="bg-[#1e2329] p-8 rounded-[2.5rem] border border-gray-800 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-black uppercase italic text-yellow-500 mb-2">Update Balance</h3>
            <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-bold border-b border-gray-800 pb-2">
              User: <span className="text-white">{selectedUser?.name}</span>
            </p>

            <div className="mb-6">
              <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">New Balance (USD)</label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="w-full bg-black border border-gray-800 p-4 rounded-2xl text-white font-mono text-xl outline-none focus:border-yellow-500 transition-colors"
                placeholder="0.00"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 text-gray-500 font-black uppercase text-[10px] py-4 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleBalanceUpdate} 
                className="flex-1 bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-yellow-400 transition-all shadow-lg active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;