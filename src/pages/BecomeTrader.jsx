import React, { useState, useContext } from 'react';
import { ShieldCheck, Zap, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const BecomeTrader = () => {
  const navigate = useNavigate();
  const { API_URL, token } = useContext(UserContext); // Context থেকে token ও নিলাম

  const [experience, setExperience] = useState("");
  const [capital, setCapital] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // সাকসেস মেসেজের জন্য

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      
      // ১. টোকেন সংগ্রহ (কনটেক্সট না থাকলে লোকাল স্টোরেজ থেকে)
      const authToken = token || localStorage.getItem('token');
      
      // ২. ব্যাকএন্ডে ডাটা পাঠানো (সঠিক হেডার সহ)
      const response = await axios.post(`${API_URL || 'https://vinance-backend.vercel.app'}/api/traders/apply`, 
        { experience, capital },
        { 
          headers: { 
            Authorization: `Bearer ${authToken}` 
          } 
        }
      );

      // ৩. সাকসেস হ্যান্ডলিং
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/trader-profile'); 
      }, 2500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Connection Error! Check your backend.";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-12 bg-[#0b0e11] min-h-screen text-white text-left font-sans">
      <div className="max-w-2xl mx-auto mb-6 md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 bg-[#161a1e] rounded-full border border-[#1e2329]">
           <ChevronLeft size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="max-w-xl mx-auto bg-[#161a1e] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-[#1e2329] shadow-2xl relative overflow-hidden">
        
        {/* সাকসেস ওভারলে (সফল হলে এটি আসবে) */}
        {showSuccess && (
          <div className="absolute inset-0 bg-[#161a1e] z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="p-5 bg-green-500/20 rounded-full text-green-500 mb-4">
              <CheckCircle size={60} />
            </div>
            <h2 className="text-2xl font-black uppercase italic italic">Application Submitted!</h2>
            <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">Review will take 24 hours. Redirecting...</p>
          </div>
        )}

        <div className="relative z-10">
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
            <div className="group">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-4 mb-2 block tracking-widest transition-colors group-focus-within:text-[#f0b90b]">
                Trading Experience (Years)
              </label>
              <input 
                type="number" 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 3" 
                className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 md:p-5 rounded-2xl text-sm md:text-base text-white focus:border-[#f0b90b] outline-none transition-all" 
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-4 mb-2 block tracking-widest transition-colors group-focus-within:text-[#f0b90b]">
                Initial Trading Capital ($)
              </label>
              <input 
                type="number" 
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="Minimum $500" 
                className="w-full bg-[#0b0e11] border border-[#1e2329] p-4 md:p-5 rounded-2xl text-sm md:text-base text-white focus:border-[#f0b90b] outline-none transition-all" 
              />
            </div>

            <div className="pt-4 pb-10 md:pb-0">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
                  isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#f0b90b] text-black'
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