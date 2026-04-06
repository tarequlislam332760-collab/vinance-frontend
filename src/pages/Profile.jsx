import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { User, Mail, Wallet, ShieldCheck, Save } from 'lucide-react';

const Profile = () => {
  const { API_URL } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // ✅ প্রোফাইল ডাটা ফেচ করা
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data);
        setName(res.data.name);
      } catch (err) {
        console.error("Profile fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [API_URL]);

  // ✅ প্রোফাইল আপডেট করা (নাম ও পাসওয়ার্ড)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/profile/update`, 
        { name, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile Updated Successfully!");
      setPassword(''); // পাসওয়ার্ড ফিল্ড খালি করা
    } catch (err) {
      alert("Update failed!");
    }
  };

  if (loading) return <div className="text-white p-10">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-6 pb-24">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <User className="text-[#f0b90b]" /> Account Profile
      </h2>

      {/* User Info Card */}
      <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#f0b90b] rounded-full flex items-center justify-center text-black font-bold text-2xl uppercase">
            {userData?.name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold">{userData?.name}</h3>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <Mail size={14} /> {userData?.email}
            </p>
          </div>
        </div>

        {/* Balance Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#2b3139] p-4 rounded-xl">
            <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
              <Wallet size={12} /> Total Balance
            </p>
            <h4 className="text-[#f0b90b] font-bold text-lg">${userData?.balance?.toLocaleString()}</h4>
          </div>
          <div className="bg-[#2b3139] p-4 rounded-xl">
            <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
              <ShieldCheck size={12} /> Account Role
            </p>
            <h4 className="text-green-500 font-bold text-lg uppercase">{userData?.role}</h4>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleUpdate} className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800">
        <h3 className="font-bold mb-4">Edit Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-[#f0b90b]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">New Password (leave blank to keep current)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-[#f0b90b]"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-[#f0b90b] text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;