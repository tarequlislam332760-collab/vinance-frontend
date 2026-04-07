import React, { useState, useContext } from 'react';
import { ShieldCheck, Zap, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const BecomeTrader = () => {
  const navigate = useNavigate();
  const { API_URL, token, user } = useContext(UserContext); // Context থেকে প্রয়োজনীয় ডাটা নিলাম

  // স্টেট ম্যানেজমেন্ট
  const [experience, setExperience] = useState("");
  const [capital, setCapital] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ১. ফ্রন্টএন্ড ভ্যালিডেশন
    if (!experience || !capital) {
      alert("Please fill in all the required fields!");
      return;
    }

    if (parseFloat(capital) < 500) {
      alert("Minimum initial capital required is $500.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // ২. টোকেন সংগ্রহ (কনটেক্সট না থাকলে লোকাল স্টোরেজ থেকে)
      const authToken = token || localStorage.getItem('token');
      
      // ৩. ব্যাকএন্ডে ডাটা পাঠানো (সঠিক হেডার ও পাথ সহ)
      // নোট: আপনার ব্যাকএন্ডের পাথ অনুযায়ী '/api/traders/apply' নিশ্চিত করুন
      const response = await axios.post(`${API_URL || 'https://vinance-backend.vercel.app'}/api/traders/apply`, 
        { 
          name: user?.name || "Trader Applicant", // ব্যাকএন্ডে name রিকোয়ার্ড থাকলে
          experience: Number(experience), 
          capital: Number(capital) 
        },
        { 
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // ৪. সাকসেস হ্যান্ডলিং (সরাসরি সাকসেস স্ক্রিন দেখাবে)
      if (response.data.success || response.status === 201) {
        setShowSuccess(true);
        // ২.৫ সেকেন্ড পর প্রোফাইল পেজে পাঠিয়ে দিবে
        setTimeout(() => {
          navigate('/trader-profile'); 
        }, 2500);
      }

    } catch (err) {
      // ৫. এরর হ্যান্ডলিং (ব্যাকএন্ড থেকে আসা মেসেজ দেখাবে)
      const errorMsg = err.response?.data?.message || "Connection Error! Check your backend.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-12 bg-[#0b0e11] min-h-screen text-white text-left font-sans">
      {/* মোবাইল ব্যাক বাটন */}
      <div className="max-w-2xl mx-auto mb-6 md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 bg-[#161a1e] rounded-full border border-[#1e2329]">
           <ChevronLeft size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="max-w-xl mx-auto bg-[#161a1e] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-[#1e2329] shadow-2xl relative overflow-hidden">
        
        {/* গ্লো ইফেক্ট */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0b90b]/5 blur-[60px] rounded-full -mr-10 -mt-10"></div>
        
        {/* সাকসেস ওভারলে (সফল হলে এই পর্দাটি সামনে আসবে) */}
        {showSuccess && (
          <div className="absolute inset-0 bg-[#161a1e] z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="p-5 bg-green-500/20 rounded-full text-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <CheckCircle size={60} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Application Submitted!</h2>
            <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.2em]">Review will take 24 hours. Redirecting...</p>
          </div>
        )}

        <div className="relative z-10">
          {/* হেডার সেকশন */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-10 text-center md:text-left">
            <div className="p-5 bg-[#f0b90b] rounded-[1.5rem] text-black shadow-[0_0_20px_rgba(240,185,11,0.2)]">
              <ShieldCheck size={36} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Become a Lead</h1>
              <p className="text-[#f0b90b] text-[10px] font-black uppercase tracking-[0.2em] bg-[#f0b90b]/10 py-1 px-3 rounded-full inline-block">
                Earn 30% Profit Share
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-7">
            {/* এক্সপেরিয়েন্স ফিল্ড */}
            <div className="group">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-4 mb-2 block tracking-widest transition-colors group-focus-within:text-[#f0b90b]">
                Trading Experience (Years)
              </label>
              <input 
                type="number" 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 3" 
                className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 md:p-5 rounded-2xl text-sm md:text-base text-white focus:border-[#f0b90b] outline-none transition-all focus:ring-1 focus:ring-[#f0b90b]/30" 
              />
            </div>

            {/* ক্যাপিটাল ফিল্ড */}
            <div className="group">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-4 mb-2 block tracking-widest transition-colors group-focus-within:text-[#f0b90b]">
                Initial Trading Capital ($)
              </label>
              <input 
                type="number" 
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="Minimum $500" 
                className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 md:p-5 rounded-2xl text-sm md:text-base text-white focus:border-[#f0b90b] outline-none transition-all focus:ring-1 focus:ring-[#f0b90b]/30" 
              />
            </div>

            {/* সাবমিট বাটন */}
            <div className="pt-4 pb-10 md:pb-0">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
                  isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#f0b90b] text-black hover:bg-[#d4a30a]'
                }`}
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Zap size={16} fill="black" /> Submit Application</>
                )}
              </button>
              <p className="text-center text-[9px] text-gray-600 mt-4 uppercase font-bold tracking-tighter italic">
                * By submitting you agree to our trader terms and conditions
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeTrader;