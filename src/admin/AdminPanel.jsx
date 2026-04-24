import React, { useState, useEffect, useContext, useCallback } from 'react';
import API from '../api';
import { UserContext } from '../context/UserContext';
import {
  ShieldCheck, Users, Clock, PieChart, ListIcon,
  UserPlus, Trash2, TrendingUp, CheckCircle, Edit, X,
} from 'lucide-react';

import ManageUsers from './ManageUsers';
import PendingRequests from './PendingRequests';
import ManagePlans from './ManagePlans';
import InvestmentLogs from './InvestmentLogs';
import AddTrader from './AddTrader';

const AdminPanel = () => {
  const { token } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [editTraderData, setEditTraderData] = useState({
    name: '',
    profit: '',
    winRate: '',
    aum: '',
    mdd: '',
  });

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await API.get('/api/admin/all-data');
      setUsers(res.data.users || []);
      setRequests(res.data.requests || []);
      setTraders(res.data.traders || []);
      const logData =
        res.data.investments ||
        res.data.logs ||
        res.data.allInvestments ||
        res.data.requests ||
        [];
      setInvestments(logData);
    } catch (err) {
      console.error('Admin Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isPending = (t) =>
    t.status === false ||
    t.status === 'false' ||
    t.status === 'pending' ||
    t.status === null ||
    t.status === undefined;

  const isApproved = (t) =>
    t.status === true ||
    t.status === 'true' ||
    t.status === 'approved';

  const handleApproveTrader = async (traderId) => {
    try {
      await API.put(`/api/admin/edit-trader/${traderId}`, { status: true });
      alert('✅ Trader Approved Successfully!');
      fetchData();
    } catch (err) {
      alert('❌ Approval failed');
    }
  };

  const handleDeleteTrader = async (traderId) => {
    if (window.confirm('Are you sure you want to delete this trader?')) {
      try {
        await API.delete(`/api/admin/delete-trader/${traderId}`);
        alert('✅ Trader deleted successfully!');
        fetchData();
      } catch (err) {
        alert('❌ Failed to delete trader');
      }
    }
  };

  const openEditModal = (trader) => {
    setSelectedTrader(trader);
    setEditTraderData({
      name: trader.name || '',
      profit: trader.profit || '',
      winRate: trader.winRate || '',
      aum: trader.aum || '',
      mdd: trader.mdd || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditTraderSubmit = async () => {
    if (!editTraderData.name || !editTraderData.profit) {
      alert('❌ Name and Profit are required');
      return;
    }
    try {
      await API.put(`/api/admin/edit-trader/${selectedTrader._id}`, {
        ...editTraderData,
        profit: Number(editTraderData.profit),
        winRate: Number(editTraderData.winRate),
        aum: Number(editTraderData.aum),
        mdd: Number(editTraderData.mdd),
      });
      alert('✅ Trader Updated Successfully!');
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      alert('❌ Failed to update trader');
    }
  };

  const handleBalanceUpdate = async () => {
    if (!newBalance || newBalance < 0) {
      alert('❌ Invalid balance amount');
      return;
    }
    try {
      await API.post('/api/admin/update-balance', {
        userId: selectedUser._id,
        balance: Number(newBalance),
      });
      setIsModalOpen(false);
      fetchData();
      alert('✅ Balance Updated Successfully!');
    } catch (err) {
      alert('❌ Error updating balance');
    }
  };

  if (loading)
    return (
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
          Command <span className="text-white">Center</span>{' '}
          <ShieldCheck className="w-8 h-8" />
        </h2>

        <div className="flex gap-1 bg-[#161a1e] p-1.5 rounded-2xl overflow-x-auto no-scrollbar w-full md:w-auto shadow-2xl border border-[#1e2329]">
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={14} />} label="Users" />
          <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={<Clock size={14} />} label="Requests" />
          <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} icon={<PieChart size={14} />} label="Plans" />
          <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<ListIcon size={14} />} label="Logs" />
          <TabButton active={activeTab === 'traders'} onClick={() => setActiveTab('traders')} icon={<UserPlus size={14} />} label="Traders" />
        </div>
      </div>

      <div className="bg-[#161a1e] rounded-[2.5rem] p-4 md:p-8 border border-[#1e2329] shadow-2xl overflow-hidden min-h-[500px]">
        {activeTab === 'users' && (
          <ManageUsers
            users={users}
            search={searchTerm}
            setSearch={setSearchTerm}
            fetchData={fetchData}
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

        {activeTab === 'traders' && (
          <div className="space-y-12 text-left">

            {/* ── Pending Applications ── */}
            <div className="pb-10 border-b border-gray-800">
              <h3 className="font-black uppercase text-xs tracking-widest text-[#f0b90b] mb-6 flex items-center gap-2">
                <Clock size={14} /> Pending Lead Applications ({traders.filter(isPending).length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {traders.filter(isPending).map((trader) => (
                  <div
                    key={trader._id}
                    className="bg-[#0b0e11] p-5 rounded-3xl border border-dashed border-gray-700 flex justify-between items-center group"
                  >
                    <div>
                      <p className="text-white font-black text-sm">{trader.name}</p>
                      <div className="flex gap-3 mt-1">
                        <p className="text-gray-500 text-[10px] font-bold uppercase">
                          ROI: <span className="text-white">{trader.profit}%</span>
                        </p>
                        <p className="text-gray-500 text-[10px] font-bold uppercase">
                          Capital: <span className="text-white">${trader.aum}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveTrader(trader._id)}
                        className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrader(trader._id)}
                        className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {traders.filter(isPending).length === 0 && (
                <p className="text-gray-600 text-[10px] italic uppercase tracking-widest">
                  No new applications yet.
                </p>
              )}
            </div>

            {/* ── Add New Trader ── */}
            <AddTrader fetchData={fetchData} />

            {/* ── Approved Traders ── */}
            <div className="pt-10">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-400 mb-6">
                Existing Master Traders ({traders.filter(isApproved).length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {traders.filter(isApproved).map((trader) => (
                  <div
                    key={trader._id}
                    className="bg-[#0b0e11] p-5 rounded-3xl border border-gray-800 flex justify-between items-center group hover:border-[#f0b90b]/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={trader.image || trader.img || 'https://via.placeholder.com/150'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-800 group-hover:border-[#f0b90b]"
                        alt={trader.name}
                      />
                      <div>
                        <p className="text-white font-black text-sm">{trader.name}</p>
                        <p className="text-emerald-400 text-[10px] flex items-center gap-1 font-bold">
                          <TrendingUp size={10} /> +{trader.profit}% ROI
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(trader)}
                        className="p-3 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-2xl transition-all"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrader(trader._id)}
                        className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {traders.filter(isApproved).length === 0 && (
                <p className="text-gray-600 text-xs italic uppercase">
                  No approved traders found in database.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── User Balance Update Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/90 backdrop-blur-md z-[999] p-4">
          <div className="bg-[#161a1e] p-8 rounded-[2.5rem] border border-[#1e2329] w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black uppercase italic text-[#f0b90b] mb-2">
              Update Balance
            </h3>
            <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-bold border-b border-[#1e2329] pb-3">
              User: <span className="text-white ml-2">{selectedUser?.name}</span>
            </p>
            <div className="mb-6">
              <label className="text-[10px] text-gray-500 uppercase font-black mb-3 block">
                Set New Balance (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f0b90b] font-bold">$</span>
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 pl-8 rounded-2xl text-white font-mono text-2xl outline-none focus:border-[#f0b90b]"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 text-gray-500 font-black uppercase text-[10px] py-4"
              >
                Cancel
              </button>
              <button
                onClick={handleBalanceUpdate}
                className="flex-1 bg-[#f0b90b] text-black py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-[#d4a30a]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Trader Edit Modal (No Image Field) ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/90 backdrop-blur-md z-[999] p-4 overflow-y-auto">
          <div className="bg-[#161a1e] p-8 rounded-[2.5rem] border border-[#1e2329] w-full max-w-md shadow-2xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-[#f0b90b]">
                Edit Trader
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">
                  Trader Name
                </label>
                <input
                  type="text"
                  value={editTraderData.name}
                  onChange={(e) => setEditTraderData({ ...editTraderData, name: e.target.value })}
                  className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 rounded-2xl text-white outline-none focus:border-[#f0b90b]"
                />
              </div>

              {/* Profit & Win Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">
                    Profit (ROI %)
                  </label>
                  <input
                    type="number"
                    value={editTraderData.profit}
                    onChange={(e) => setEditTraderData({ ...editTraderData, profit: e.target.value })}
                    className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 rounded-2xl text-white outline-none focus:border-[#f0b90b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">
                    Win Rate (%)
                  </label>
                  <input
                    type="number"
                    value={editTraderData.winRate}
                    onChange={(e) => setEditTraderData({ ...editTraderData, winRate: e.target.value })}
                    className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 rounded-2xl text-white outline-none focus:border-[#f0b90b]"
                  />
                </div>
              </div>

              {/* AUM & MDD */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">
                    AUM ($)
                  </label>
                  <input
                    type="number"
                    value={editTraderData.aum}
                    onChange={(e) => setEditTraderData({ ...editTraderData, aum: e.target.value })}
                    className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 rounded-2xl text-white outline-none focus:border-[#f0b90b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">
                    MDD (%)
                  </label>
                  <input
                    type="number"
                    value={editTraderData.mdd}
                    onChange={(e) => setEditTraderData({ ...editTraderData, mdd: e.target.value })}
                    className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 rounded-2xl text-white outline-none focus:border-[#f0b90b]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 text-gray-500 font-black uppercase text-[10px] py-4 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTraderSubmit}
                className="flex-1 bg-[#f0b90b] text-black py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-[#d4a30a] shadow-lg"
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

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
      active
        ? 'bg-[#f0b90b] text-black shadow-lg shadow-[#f0b90b]/20'
        : 'text-gray-500 hover:text-white'
    }`}
  >
    {icon} {label}
  </button>
);

export default AdminPanel;