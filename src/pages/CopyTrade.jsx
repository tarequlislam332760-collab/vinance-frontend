import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MoreHorizontal, X, Zap, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TraderCard from '../components/TraderCard';

const CopyTrade = () => {
  const navigate = useNavigate();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // ইউজার রোল চেক করার জন্য

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

        // ২. ইউজার প্রোফাইল আনা (রোল চেক করার জন্য)
        if (token) {
          const userRes = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(userRes.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- ট্রেডার ডিলিট করার ফাংশন ---
  const handleDelete = async (id) => {
    if (window.confirm("আপনি কি নিশ্চিত যে এই মাস্টার ট্রেডারকে ডিলিট করতে চান?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/admin/delete-trader/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // ডিলিট হওয়ার পর লিস্ট আপডেট করা
        setTraders(traders.filter(t => t._id !== id));
        alert("ট্রেডার ডিলিট হয়েছে!");
      } catch (err) {
        alert("ডিলিট করতে সমস্যা হয়েছে।");
      }
    }
  };

  return (
    <div className="bg-[#0b0e11] min-h-screen pb-24 text-white font-sans overflow-x-hidden">
      
      {/* --- ১. হেডার সেকশন --- */}
      <div className="p-4 flex justify-between items-center sticky top-0 bg-[#0b0e11] z-[100] border-b border-gray-900">
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setSpotCopyOpen(!spotCopyOpen); }}
            className="flex items-center gap-1 text-lg font-bold"
          >
            Spot Copy <ChevronDown size={18} className={spotCopyOpen ? "rotate-180" : ""} />
          </button>
          
          {spotCopyOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-[#1e2329] border border-gray-700 rounded-lg shadow-2xl p-2 z-[110]">
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
            <div className="absolute right-8 top-6 w-40 bg-[#1e2329] border border-gray-700 rounded shadow-xl p-2 z-[110] text-sm text-white">
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

      {/* --- ৩. ট্যাব এবং স্মার্ট কপি --- */}
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
        <button 
          onClick={() => alert("Smart Copy is Active!")}
          className="flex items-center gap-1 bg-[#2b3139] text-[#f0b90b] text-[10px] px-2 py-1 rounded-md font-bold mb-2 active:scale-90 transition"
        >
          <Zap size={10} fill="#f0b90b" /> Smart Copy
        </button>
      </div>

      {/* --- ৪. High ROI এবং More --- */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <span>High ROI</span> <ChevronDown size={14} />
        </div>
        <div 
          className="text-xs text-gray-400 flex items-center cursor-pointer hover:text-yellow-500 font-bold active:scale-90 transition"
          onClick={() => alert("More Traders Loading...")}
        >
          More <ChevronDown size={14} className="-rotate-90 ml-1" />
        </div>
      </div>

      {/* --- ৫. ট্রেডার লিস্ট (Edit/Delete বাটন সহ) --- */}
      <div className="px-4 grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center mt-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div></div>
        ) : (
          traders.map((t) => (
            <div key={t._id} className="relative group">
              <TraderCard trader={t} />
              
              {/* যদি অ্যাডমিন লগইন থাকে তবে এডিট এবং ডিলিট বাটন দেখাবে */}
              {user?.role === 'admin' && (
                <div className="absolute top-2 right-2 flex gap-2 z-[50]">
                  <button 
                    onClick={() => navigate(`/admin/edit-trader/${t._id}`)}
                    className="p-1.5 bg-blue-600 rounded-md hover:bg-blue-700 transition"
                    title="Edit Trader"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(t._id)}
                    className="p-1.5 bg-red-600 rounded-md hover:bg-red-700 transition"
                    title="Delete Trader"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- ৬. ফিক্সড বাটন --- */}
      <div className="p-4">
        <button className="w-full bg-[#f0b90b] text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xl active:scale-95 transition">
          <Zap size={16} fill="black" /> APPLY TO BE A MASTER TRADER
        </button>
      </div>
    </div>
  );
};

export default CopyTrade;