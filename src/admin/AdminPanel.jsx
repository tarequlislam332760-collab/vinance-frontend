import React, { useState, useEffect, useContext, useCallback } from 'react';
import API from '../api'; 
import { UserContext } from '../context/UserContext';
import { Search, TrendingUp, ShieldCheck, Users, Clock, PieChart, ListIcon } from 'lucide-react';

// Sub-components
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

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await API.get('/api/admin/all-data');
      
      console.log("Full Backend Data:", res.data); 

      setUsers(res.data.users || []);
      setRequests(res.data.requests || []);

      // ✅ ব্যাকএন্ড থেকে আসা ডাটা ফিল্টার করা হচ্ছে
      // এখানে investments এর পাশাপাশি requests ডাটাও চেক করা হচ্ছে যাতে লগ খালি না থাকে
      const logData = res.data.investments || res.data.logs || res.data.allInvestments || res.data.requests || [];
      setInvestments(logData);
      
    } catch (err) {
      console.error("Admin Fetch error:", err);
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
      alert("Balance Updated Successfully!");
    } catch (err) {
      alert("Error updating balance");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0b0e11]">
      <div className="text-[#f0b90b] font-black italic animate-pulse uppercase tracking-widest text-xl">
        Accessing Command Center...
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-white text-left">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h2 className="text-3xl font-black text-[#f0b90b] italic uppercase tracking-tighter flex items-center gap-3">
          Command <span className="text-white">Center</span> <ShieldCheck className="w-8 h-8"/>
        </h2>

        <div className="flex gap-1 bg-[#161a1e] p-1.5 rounded-2xl overflow-x-auto no-scrollbar w-full md:w-auto shadow-2xl border border-[#1e2329]">
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={14}/>} label="Users" />
          <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={<Clock size={14}/>} label="Requests" />
          <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} icon={<PieChart size={14}/>} label="Plans" />
          <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<ListIcon size={14}/>} label="Logs" />
        </div>
      </div>

      <div className="bg-[#161a1e] rounded-[2.5rem] p-4 md:p-8 border border-[#1e2329] shadow-2xl overflow-hidden min-h-[500px]">
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
        {activeTab === 'requests' && <PendingRequests requests={requests} fetchData={fetchData} />}
        {activeTab === 'plans' && <ManagePlans fetchData={fetchData} />}
        {activeTab === 'logs' && <InvestmentLogs data={investments} />}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/90 backdrop-blur-md z-[999] p-4">
          <div className="bg-[#161a1e] p-8 rounded-[2.5rem] border border-[#1e2329] w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-black uppercase italic text-[#f0b90b] mb-2">Update Balance</h3>
            <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-bold border-b border-[#1e2329] pb-3">
              User: <span className="text-white ml-2">{selectedUser?.name}</span>
            </p>

            <div className="mb-6">
              <label className="text-[10px] text-gray-500 uppercase font-black mb-3 block">Set New Balance (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f0b90b] font-bold">$</span>
                <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 pl-8 rounded-2xl text-white font-mono text-2xl outline-none focus:border-[#f0b90b] transition-all"
                    placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 text-gray-500 font-black uppercase text-[10px] py-4 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleBalanceUpdate} className="flex-1 bg-[#f0b90b] text-black py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-[#d4a30a] transition-all shadow-lg active:scale-95">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${active ? 'bg-[#f0b90b] text-black shadow-lg shadow-[#f0b90b]/20' : 'text-gray-500 hover:text-white'}`}>{icon} {label}</button>
);

export default AdminPanel;