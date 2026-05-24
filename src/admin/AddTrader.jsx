import React, { useState, useContext, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { UserPlus, Save, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import axios from 'axios'; 
import API from '../api';

const AddTrader = ({ fetchData }) => {
  const { token } = useContext(UserContext);
  const fileInputRef = useRef(null); 
  const [uploading, setUploading] = useState(false); 
  
  // 🔗 ইমেজের টেক্সট লিংক আলাদাভাবে ট্র্যাক করার জন্য
  const [imgUrlText, setImgUrlText] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    profit: '',
    winRate: '',
    aum: '',
    mdd: '',
    chartData: '10, 25, 20, 45, 30, 60'
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
      // 🚀 গ্লোবাল ইন্টারসেপ্টর এড়াতে সম্পূর্ণ ক্লিন ও কাস্টম হেডারযুক্ত এক্সিওস ইনস্ট্যান্স
      const cleanAxios = axios.create(); 
      
      const res = await cleanAxios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (res.data && res.data.secure_url) {
        const uploadedSecureUrl = res.data.secure_url;
        // সফলভাবে আপলোড হলে শুধুমাত্র টেক্সট ইউআরএলটি সেভ হবে
        setImgUrlText(uploadedSecureUrl);
        setFormData((prev) => ({ ...prev, image: uploadedSecureUrl }));
      } else {
        alert('❌ Cloudinary response did not contain secure_url');
      }
      
    } catch (err) {
      console.error('Cloudinary upload error details:', err.response?.data || err.message);
      alert('❌ Image upload failed. Reason: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // ইনপুট ক্লিয়ার করা যাতে একই ফাইল আবার সিলেক্ট করা যায়
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // সেফটি চেক: কোনো করাপ্টেড ফাইল বা বেস৬৪ ডাটা যেন সাবমিট না হয়
    if (!imgUrlText) {
      alert("❌ Please upload an image or paste a valid URL link first!");
      return;
    }

    try {
      const processedData = {
        ...formData,
        image: imgUrlText, // এখানে কনফার্ম শুধু ইমেজের টেক্সট লিংকটি যাচ্ছে
        chartData: formData.chartData.split(',').map(Number),
        profit: Number(formData.profit),
        winRate: Number(formData.winRate),
        aum: Number(formData.aum),
        mdd: Number(formData.mdd)
      };

      await API.post('/api/admin/create-trader', processedData);

      alert("✅ Trader Created Successfully!");
      
      // স্টেট রিসেট
      setImgUrlText('');
      setFormData({
        name: '',
        image: '',
        profit: '',
        winRate: '',
        aum: '',
        mdd: '',
        chartData: '10, 25, 20, 45, 30, 60'
      });

      if (fetchData) fetchData();

    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || "Failed to create trader"));
    }
  };

  return (
    <div className="w-full text-white">
      <div className="max-w-2xl mx-auto bg-[#1e2329] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-[#f0b90b] uppercase italic">
          <UserPlus size={20} /> Create New Master Trader
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">

          <div className="col-span-full md:col-span-1">
            <label className="text-xs text-gray-400 block mb-2">Trader Name</label>
            <input
              type="text" required placeholder="e.g. BilluGulati"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl focus:border-[#f0b90b] outline-none text-white"
            />
          </div>

          <div className="col-span-full md:col-span-1">
            <label className="text-xs text-gray-400 block mb-2 flex items-center gap-1">
              <ImageIcon size={12} /> Trader Image URL or Upload
            </label>
            <div className="flex gap-2">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleCloudinaryUpload} 
                className="hidden" 
              />
              
              <input
                type="text" placeholder="https://imgur.com/photo.jpg"
                value={imgUrlText} 
                onChange={(e) => {
                  setImgUrlText(e.target.value);
                  setFormData({ ...formData, image: e.target.value });
                }}
                className="flex-1 bg-[#0b0e11] border border-gray-700 p-3 rounded-xl focus:border-[#f0b90b] outline-none text-white text-sm"
              />
              
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current.click()}
                className="w-12 h-12 bg-[#0b0e11] border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#f0b90b] hover:border-[#f0b90b] transition-all flex-shrink-0"
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin text-[#f0b90b]" />
                ) : (
                  <Upload size={18} />
                )}
              </button>

              {imgUrlText && !uploading && (
                <div className="w-12 h-12 rounded-xl border border-gray-700 overflow-hidden bg-black flex-shrink-0">
                  <img src={imgUrlText} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Profit (30D PnL %)</label>
            <input
              type="number" step="0.01" required placeholder="318.00"
              value={formData.profit} onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none text-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Win Rate (%)</label>
            <input
              type="number" step="0.01" required placeholder="81.87"
              value={formData.winRate} onChange={(e) => setFormData({ ...formData, winRate: e.target.value })}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none text-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">AUM (Capital $)</label>
            <input
              type="number" required placeholder="26170.62"
              value={formData.aum} onChange={(e) => setFormData({ ...formData, aum: e.target.value })}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none text-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Max Drawdown (MDD %)</label>
            <input
              type="number" step="0.01" required placeholder="8.79"
              value={formData.mdd} onChange={(e) => setFormData({ ...formData, mdd: e.target.value })}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none text-white"
            />
          </div>

          <div className="col-span-full">
            <label className="text-xs text-gray-400 block mb-2">Chart Data (comma separated numbers)</label>
            <input
              type="text" required placeholder="10, 20, 15, 35..."
              value={formData.chartData} onChange={(e) => setFormData({ ...formData, chartData: e.target.value })}
              className="w-full bg-[#0b0e11] border border-gray-700 p-3 rounded-xl outline-none text-white"
            />
          </div>

          <button
            type="submit"
            className="col-span-full bg-[#f0b90b] text-black font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-[#e0a808] transition-all uppercase text-xs"
          >
            <Save size={18} /> Deploy Trader to Market
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTrader;
