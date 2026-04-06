import React from 'react';
import axios from 'axios';
import { Search, Edit3, Trash2 } from 'lucide-react';

const ManageUsers = ({ users, search, setSearch, onEdit, fetchData }) => {

  // ইউজার ডিলিট করার ফাংশন
  const handleDelete = async (userId) => {
    const token = localStorage.getItem('token');
    const API_URL = "https://vinance-backend.vercel.app"; // আপনার ব্যাকএন্ড ইউআরএল চেক করে নেবেন

    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_URL}/api/admin/delete-user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("User deleted successfully!");
        if (fetchData) fetchData(); // ডাটা রিফ্রেশ করার জন্য
      } catch (err) {
        alert("Error: " + (err.response?.data?.message || "Failed to delete user"));
      }
    }
  };

  return (
    <div className="bg-[#1e2329] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl animate-in fade-in duration-500">
      <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
        <h3 className="font-black uppercase text-xs tracking-widest text-gray-400">Manage All Users</h3>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search email..." 
            className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-yellow-500 text-white" 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>
      <div className="overflow-x-auto text-left">
        <table className="w-full text-[12px] font-bold">
          <thead className="bg-[#0b0e11]/50 text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="p-5">User</th>
              <th className="p-5">Balance</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {users.filter(u => u.email.toLowerCase().includes(search.toLowerCase())).map(user => (
              <tr key={user._id} className="hover:bg-white/[0.02]">
                <td className="p-5">
                  <p className="text-white">{user.name}</p>
                  <p className="text-[10px] text-gray-500">{user.email}</p>
                </td>
                <td className="p-5 font-mono text-emerald-400 font-black text-sm">${user.balance.toFixed(2)}</td>
                <td className="p-5 text-right flex justify-end gap-2">
                  {/* Edit Button */}
                  <button onClick={() => onEdit(user)} className="p-2 hover:bg-yellow-500/20 rounded-lg text-yellow-500 transition-all">
                    <Edit3 size={18}/>
                  </button>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDelete(user._id)} 
                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"
                  >
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;