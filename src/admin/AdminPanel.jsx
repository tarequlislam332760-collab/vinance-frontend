import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { 
  Users, DollarSign, TrendingUp, Wallet, Trash2, 
  Edit3, Save, ShieldCheck, UserPlus, ArrowUpCircle, 
  ArrowDownCircle, MoreHorizontal, X 
} from 'lucide-react';

// ✅ আপনার লাইভ ব্যাকএন্ড লিঙ্ক (ফিক্স করা হয়েছে)
const API_BASE_URL = "my-projact-sage.vercel.app";
const AdminPanel = () => {
  const { token } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ users: 0, deposit: 0, withdraw: 0, profit: 0 });
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', balance: 0, role: 'user' });

  const fetchAll = async () => {
    const t = token || localStorage.getItem('token');
    if (!t) return;
    try {
      const usersRes = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const statsRes = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error("Fetch Error:", err.message); }
  };

  useEffect(() => { fetchAll(); }, [token]);

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setFormData({ name: user.name, balance: user.balance, role: user.role });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingUser(null);
      fetchAll();
      alert('User Updated Successfully!');
    } catch (err) { alert('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAll();
    } catch (err) { alert('Delete failed'); }
  };

  // ✅ ব্যালেন্স আপডেট ফাংশনটি ব্যাকএন্ডের সাথে মিলিয়ে ফিক্স করা হয়েছে
  const updateBalance = async (id, type) => {
    const amount = prompt(`Enter amount to ${type}:`);
    if (!amount || isNaN(amount)) return;
    try {
      await axios.post(`${API_BASE_URL}/api/admin/update-balance`, {
        userId: id, 
        amount: parseFloat(amount),
        type: type // 'add' অথবা 'deduct'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      fetchAll();
      alert(`Successfully ${type === 'add' ? 'Added' : 'Deducted'} $${amount}`);
    } catch (err) { 
        console.error(err);
        alert('Balance update failed'); 
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-left">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Admin Central</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Management & Statistics Terminal</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card title="Total Traders" value={stats.users} icon={<Users size={20}/>} color="text-blue-500" />
        <Card title="Total Deposits" value={`$${stats.deposit?.toLocaleString()}`} icon={<ArrowDownCircle size={20}/>} color="text-emerald-500" />
        <Card title="Total Withdraws" value={`$${stats.withdraw?.toLocaleString()}`} icon={<ArrowUpCircle size={20}/>} color="text-red-500" />
        <Card title="Net Profit" value={`$${stats.profit?.toLocaleString()}`} icon={<TrendingUp size={20}/>} color="text-yellow-500" />
      </div>

      {/* Users Table */}
      <div className="bg-[#1e2329] rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#191d23]">
          <h3 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
            <ShieldCheck size={16} className="text-yellow-500" /> User Directory
          </h3>
          <button className="bg-yellow-500 text-black p-2 rounded-lg hover:bg-yellow-400 transition-all">
            <UserPlus size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                <th className="p-6 text-left">Trader Name</th>
                <th className="p-6 text-left">Capital Balance</th>
                <th className="p-6 text-left">Access Role</th>
                <th className="p-6 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    {editingUser === user._id ? (
                      <input 
                        className="bg-[#0b0e11] border border-yellow-500/50 rounded-lg px-3 py-1 text-white text-sm focus:outline-none"
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-yellow-500 font-black text-xs">
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{user.name}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-6 font-mono font-bold text-sm text-white">
                    {editingUser === user._id ? (
                      <input 
                        type="number" 
                        className="bg-[#0b0e11] border border-yellow-500/50 rounded-lg px-3 py-1 text-white text-sm w-32 focus:outline-none"
                        value={formData.balance} 
                        onChange={e => setFormData({ ...formData, balance: e.target.value })} 
                      />
                    ) : `$${user.balance?.toLocaleString()}`}
                  </td>

                  <td className="p-6">
                    <select 
                      disabled={editingUser !== user._id}
                      className={`bg-[#0b0e11] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-gray-800 outline-none ${user.role === 'admin' ? 'text-yellow-500' : 'text-gray-400'}`}
                      value={editingUser === user._id ? formData.role : user.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {editingUser === user._id ? (
                        <button onClick={() => handleUpdate(user._id)} className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                          <Save size={14} />
                        </button>
                      ) : (
                        <button onClick={() => handleEdit(user)} className="bg-blue-500/10 text-blue-500 p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                          <Edit3 size={14} />
                        </button>
                      )}

                      <button onClick={() => updateBalance(user._id, 'add')} className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-yellow-500 hover:text-black transition-all">+ Fund</button>
                      <button onClick={() => updateBalance(user._id, 'deduct')} className="bg-red-500/10 text-red-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">- Fund</button>
                      
                      <button onClick={() => handleDelete(user._id)} className="text-gray-600 hover:text-red-500 p-2 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon, color }) => (
  <div className="bg-[#1e2329] p-6 rounded-[1.5rem] border border-gray-800 shadow-xl relative overflow-hidden group hover:border-gray-700 transition-all">
    <div className="relative z-10 flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <h2 className="text-2xl font-black text-white italic tracking-tighter">{value}</h2>
      </div>
      <div className={`${color} p-3 bg-white/5 rounded-xl`}>{icon}</div>
    </div>
  </div>
);

export default AdminPanel;