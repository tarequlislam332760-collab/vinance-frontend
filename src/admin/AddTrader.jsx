import React, { useState, useContext, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { UserPlus, Save, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import axios from 'axios'; 
import API from '../api';

const AddTrader = ({ fetchData }) => {
  const { token } = useContext(UserContext);
  const fileInputRef = useRef(null); 
  const [uploading, setUploading] = useState(false); 
  
  // 🔗 স্ক্রিনশট অনুযায়ী আপনার UI এর বর্তমান ফিল্ডগুলো দিয়ে স্টেট তৈরি করা হলো
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    roi: '',
    pnl: '',
    aum: '',
    winRate: '',
    followers: '',
    daysActive: ''
  });

  // ☁️ ক্লাউডিনারি সরাসরি ফ্রন্টএন্ড আপলোড ফাংশন
  const handleCloudinaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const cloudName = 'dfe3wlx4u'; 
    const uploadPreset = 'trader_preset'; 

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);

    try {
      // 🚀 গ্লোবাল ইন্টারসেপ্টর এড়াতে আইসোলেটেড এক্সিওস
      const cleanAxios = axios.create(); 
      
      const res = await cleanAxios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      if (res.data && res.data.secure_url) {
        const uploadedSecureUrl = res.data.secure_url;
        // সফলভাবে আপলোড হলে স্টেটে ইমেজ ইউআরএল বসে যাবে এবং প্রিভিউ দেখাবে
        setFormData((prev) => ({ ...prev, image: uploadedSecureUrl }));
      } else {
        alert('❌ Cloudinary response did not contain secure_url');
      }
      
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      alert('❌ Image upload failed. Please check your preset or network.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      alert("❌ Please upload an image or paste a valid URL link first!");
      return;
    }

    try {
      // ব্যাকএন্ডের রিকোয়ারমেন্ট অনুযায়ী ডাটা টাইপ কনভার্ট করা
      const processedData = {
        ...formData,
        roi: Number(formData.roi),
        pnl: Number(formData.pnl),
        aum: Number(formData.aum),
        winRate: Number(formData.winRate),
        followers: Number(formData.followers),
        daysActive: Number(formData.daysActive)
      };

      await API.post('/api/admin/create-trader', processedData);

      alert("✅ Trader Created Successfully!");
      
      // স্টেট সম্পূর্ণ রিসেট
      setFormData({
        name: '',
        image: '',
        roi: '',
        pnl: '',
        aum: '',
        winRate: '',
        followers: '',
        daysActive: ''
      });

      if (fetchData) fetchData();

    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || "Failed to create trader"));
    }
  };

  return (
    <div className="w-full text-white">
      <div className="max-w-5xl mx-auto bg-[#161a1e] p-6 rounded-2xl border border-gray-800 shadow-2xl">
        <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-[#f0b90b] uppercase tracking-wider">
          <UserPlus size={16} /> Add New Trader
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          
          {/* ইমেজ আপলোড সেকশন (আপনার স্ক্রিনশট ১:১ অনুযায়ী) */}
          <div className="flex items-center gap-4 bg-[#1e232a] p-4 rounded-xl border border-gray-800">
            {/* অ্যাভাটার / আপলোড বাটন */}
            <div 
              onClick={() => !uploading && fileInputRef.current.click()}
              className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 bg-[#161a1e] flex flex-shrink-0 items-center justify-center cursor-pointer hover:border-[#f0b90b] transition-all overflow-hidden"
            >
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-[#f0b90b]" />
              ) : formData.image ? (
                <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Upload size={20} className="text-gray-400" />
              )}
            </div>

            {/* টেক্সট ইউআরএল ইনপুট */}
            <div className="flex-1">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleCloudinaryUpload} 
                className="hidden" 
              />
              <input
                type="text" 
                placeholder="Or paste image URL"
                value={formData.image} 
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full bg-[#161a1e] border border-gray-700 p-3 rounded-xl focus:border-[#f0b90b] outline-none text-white text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Click avatar to upload from gallery</p>
            </div>
          </div>

          {/* ইনপুট গ্রিড (স্ক্রিনশটের লেআউট অনুযায়ী) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Trader Name *</label>
              <input
                type="text" required placeholder="CryptoMaster"
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#161a1e] border border-gray-700 p-2.5 rounded-lg focus:border-[#f0b90b] outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">ROI (%)</label>
              <input
                type="number" required placeholder="45"
                value={formData.roi} onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                className="w-full bg-[#161a1e] border border-gray-700 p-2.5 rounded-lg focus:border-[#f0b90b] outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">PNL ($)</label>
              <input
                type="number" required placeholder="12500"
                value={formData.pnl} onChange={(e) => setFormData({ ...formData, pnl: e.target.value })}
                className="w-full bg-[#161a1e] border border-gray-700 p-2.5 rounded-lg focus:border-[#f0b90b] outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">AUM ($)</label>
              <input
                type="number" required placeholder="250000"
                value={formData.aum} onChange={(e) => setFormData({ ...formData, aum: e.target.value })}
                className="w-full bg-[#161a1e] border border-gray-700 p-2.5 rounded-lg focus:border-[#f0b90b] outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Win Rate (%)</label>
              <input
                type="number" required placeholder="78"
                value={formData.winRate} onChange={(e) => setFormData({ ...formData, winRate: e.target.value })}
                className="w-full bg-[#161a1e] border border-gray-700 p-2.5 rounded-lg focus:border-[#f0b90b] outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Followers</label>
              <input
                type="number" required placeholder="320"
                value={formData.followers} onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                className="w-full bg-[#161a1e] border border-gray-700 p-2.5 rounded-lg focus:border-[#f0b90b] outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Days Active</label>
              <input
                type="number" required placeholder="120"
                value={formData.daysActive} onChange={(e) => setFormData({ ...formData, daysActive: e.target.value })}
                className="w-full bg-[#161a1e] border border-gray-700 p-2.5 rounded-lg focus:border-[#f0b90b] outline-none text-white text-sm"
              />
            </div>

          </div>

          {/* সাবমিট বাটন */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="bg-[#f0b90b] text-black font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e0a808] transition-all text-xs disabled:opacity-50"
            >
              <UserPlus size={16} /> Add Trader
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddTrader;
