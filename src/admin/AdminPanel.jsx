import React, { useState, useEffect, useContext } from 'react';
import API from '../api'; // ✅ আপনার custom axios instance ব্যবহার করুন
import { UserContext } from '../context/UserContext';
import ManageUsers from './ManageUsers';
import PendingRequests from './PendingRequests';
import ManagePlans from './ManagePlans';
import InvestmentLogs from './InvestmentLogs';

const AdminPanel = () => {
  const { token } = useContext(UserContext); // context থেকে শুধু token নিচ্ছি
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [investments, setInvestments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // সার্চের জন্য
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newBalance, setNewBalance] = useState("");

  // ✅ ডাটা ফেচ করার ফাংশন যা সব ফাইলে প্রপস হিসেবে পাঠানো যাবে
  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await API.get('/api/admin/all-data'); // api.js এ baseURL থাকলে শুধু পাথটুকু দিলেই হবে
      setUsers(res.data.users || []);
      setRequests(res.data.requests || []);
      setInvestments(res.data.investments || []); 
    } catch (err) { 
      console.error("Admin fetch error", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [token]);

  // ✅ ব্যালেন্স আপডেট লজিক
  const handleBalanceUpdate = async () => {
    try {
      await API.post('/api/admin/update-balance', { 
        userId: selectedUser._id, 
        balance: newBalance 
      });
      setIsModalOpen(false);
      fetchData(); // আপডেট হওয়ার পর লিস্ট রিফ্রেশ করা
    } catch (err) { 
      alert("Error updating balance"); 
    }
  };

  if (loading) return <div className="text-center mt-20 text-yellow-500 font-black italic">ACCESSING COMMAND CENTER...</div>;

  return (
    <div className="p-8 bg-[#0b0e11] min-h-screen text-white text-left">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-yellow-500 italic uppercase">Command Center</h2>
        <div className="flex gap-2 bg-[#1e2329] p-1 rounded-xl overflow-x-auto">
          {['users', 'requests', 'plans', 'logs'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === tab ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1e2329] rounded-[2.5rem] p-6 border border-gray-800 overflow-hidden shadow-2xl">
        {/* ✅ এখানে সব কম্পোনেন্টে প্রয়োজনীয় ডাটা এবং ফাংশন পাঠানো হয়েছে */}
        {activeTab === 'users' && (
          <ManageUsers 
            users={users} 
            search={searchTerm} 
            setSearch={setSearchTerm} 
            onEdit={(user) => { setSelectedUser(user); setNewBalance(user.balance); setIsModalOpen(true); }} 
          />
        )}
        
        {activeTab === 'requests' && (
          <PendingRequests 
            requests={requests} 
            fetchData={fetchData} 
          />
        )}
        
        {activeTab === 'plans' && <ManagePlans />}
        
        {activeTab === 'logs' && <InvestmentLogs data={investments} />} 
      </div>

      {/* ✅ ব্যালেন্স আপডেট মডাল */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1e2329] p-8 rounded-[2rem] border border-gray-800 w-full max-w-xs shadow-2xl">
            <h3 className="mb-4 font-black uppercase italic text-yellow-500">Update Balance</h3>
            <p className="text-[10px] text-gray-500 mb-2 uppercase">User: {selectedUser?.name}</p>
            <input 
              type="number" 
              value={newBalance} 
              onChange={(e)=>setNewBalance(e.target.value)} 
              className="w-full bg-black border border-gray-800 p-4 rounded-xl text-white mb-4 outline-none focus:border-yellow-500" 
            />
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 text-gray-500 font-black uppercase text-[10px] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleBalanceUpdate} className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-black uppercase text-[10px] hover:bg-yellow-600 transition-all">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;