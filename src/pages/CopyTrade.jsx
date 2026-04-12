import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MoreHorizontal, X, Zap, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TraderCard from '../components/TraderCard';

const CopyTrade = () => {
  const navigate = useNavigate();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); 

  /* --- কন্ট্রোল স্টেট --- */
  const [showBanner, setShowBanner] = useState(true);
  const [spotCopyOpen, setSpotCopyOpen] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Recommended');

  const API_URL = "https://vinance-backend.vercel.app/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // ১. ট্রেডার লিস্ট আনা
        const res = await axios.get(`${API_URL}/traders/all`);
        const fetchedData = Array.isArray(res.data) ? res.data : res.data.traders || [];
        setTraders(fetchedData);

        // ২. ইউজার প্রোফাইল আনা
        if (token) {
          const userRes = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(userRes.data);
          console.log("Current User Role:", userRes.data.role); // ব্রাউজার কনসোলে চেক করার জন্য
        }
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trader?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/admin/delete-trader/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTraders(traders.filter(t => t._id !== id));
        alert("Deleted Successfully!");
      } catch (err) {
        alert("Delete failed!");
      }
    }
  };

  return (
    <div className="bg-[#0b0e11] min-h-screen pb-24 text-white font-sans overflow-x-hidden">
      
      {/* --- ১. হেডার সেকশন --- */}
      <div className="p-4 flex justify-between items-center sticky top-0 bg-[#0b0e11] z-[110] border-b border-gray-900">
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setSpotCopyOpen(!spotCopyOpen); }}
            className="flex items-center gap-1 text-lg font-bold"
          >
            Spot Copy <ChevronDown size={18} className={spotCopyOpen ? "rotate-180" : ""} />
          </button>
          
          {spotCopyOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-[#1e2329] border border-gray-700 rounded-lg shadow-2xl p-2 z-[120]">
              <div className="p-3 hover:bg-[#2b3139] rounded cursor-pointer text-sm">Futures Copy</div>
              <div className="p-3 hover:bg-[#2b3139] rounded cursor-pointer text-sm">Strategy Copy</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-gray-400 relative">
          <MoreHorizontal 
            className="cursor-pointer hover:text-white" 
            onClick={(e) => { e.stopPropagation(); setMoreOptionsOpen(!moreOptionsOpen); }} 
          />
          {moreOptionsOpen && (
            <div className="absolute right-8 top-6 w-40 bg-[#1e2329] border border-gray-700 rounded shadow-xl p-2 z-[120] text-sm text-white">
              <div className="p-2 hover:bg-[#2b3139] cursor-pointer">Copy Settings</div>
              <div className="p-2 hover:bg-[#2b3139] cursor-pointer">Trade History</div>
            </div>
          )}
          <X className="cursor-pointer hover:text-white" onClick={() => navigate(-1)} />
        </div>
      </div>

      {/* --- ২. ব্যানার --- */}
      {showBanner && (
        <div className="mx-4 mt-4 bg-[#1e2329] p-4 rounded-xl flex justify-between items-center relative border border-yellow-500/10">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500">⭐</div>
            <div>
              <h4 className="font-bold text-[12px]">Elite Trader Program</h4>
              <p className="text-yellow-500 text-[10px] font-bold cursor-pointer">Join Now</p>
            </div>
          </div>
          <X 
            size={16} 
            className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-white bg-[#0b0e11] rounded-full p-0.5" 
            onClick={() => setShowBanner(false)} 
          />
        </div>
      )}

      {/* --- ৩. ট্যাব --- */}
      <div className="px-4 mt-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex gap-6 text-[13px] font-bold uppercase overflow-x-auto no-scrollbar">
          {['Recommended', 'All Portfolios', 'Favorite'].map((tab) => (
            <span 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer pb-2 whitespace-nowrap ${activeTab === tab ? "text-[#f0b90b] border-b-2 border-[#f0b90b]" : "text-gray-500"}`}
            >
              {tab}
            </span>
          ))}
        </div>
        <button className="flex items-center gap-1 bg-[#2b3139] text-[#f0b90b] text-[10px] px-2 py-1 rounded-md font-bold mb-2 active:scale-90 transition">
          <Zap size={10} fill="#f0b90b" /> Smart Copy
        </button>
      </div>

      {/* --- ৪. ট্রেডার লিস্ট --- */}
      <div className="px-4 grid grid-cols-1 gap-6 mt-6">
        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          traders.map((t) => (
            <div key={t._id} className="relative overflow-visible">
              
              {/* এডমিন কন্ট্রোল বাটনগুলো কার্ডের একদম উপরে এবং বাইরে পজিশন করা হয়েছে */}
              {user?.role === 'admin' && (
                <div className="absolute -top-3 -right-1 flex gap-2 z-[999]">
                  <button 
                    onClick={() => navigate(`/admin/edit-trader/${t._id}`)}
                    className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition shadow-2xl border border-blue-400"
                    title="Edit Trader"
                  >
                    <Edit size={14} className="text-white" />
                  </button>
                  <button 
                    onClick={() => handleDelete(t._id)}
                    className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition shadow-2xl border border-red-400"
                    title="Delete Trader"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              )}

              <TraderCard trader={t} />
            </div>
          ))
        )}
      </div>

      {/* --- ৫. ফিক্সড বাটন --- */}
      <div className="p-4 mt-4">
        <button className="w-full bg-[#f0b90b] text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xl active:scale-95 transition uppercase">
          <Zap size={16} fill="black" /> Apply to be a Master Trader
        </button>
      </div>
    </div>
  );
};

export default CopyTrade;