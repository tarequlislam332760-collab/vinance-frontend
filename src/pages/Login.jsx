import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api'; 
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion'; // এনিমেশনের জন্য যোগ করা হয়েছে

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext); 
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await API.post('/api/login', { email, password });
      login(res.data.user, res.data.token); 
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Email or Password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 relative overflow-hidden text-left">
      {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1e2329] border border-gray-800 rounded-3xl p-10 shadow-2xl relative z-10"
      >
        <h1 className="text-3xl font-black text-yellow-500 mb-2 tracking-tighter italic">VINANCE</h1>
        <p className="text-gray-400 mb-8 font-medium">Log In to your account</p>
        
        {/* এরর মেসেজ এনিমেশন */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-xs mb-6 font-semibold"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input 
                type="email" name="email" value={email} onChange={onChange} required 
                placeholder="Enter your email" 
                className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all text-white placeholder:text-gray-700" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input 
                type="password" name="password" value={password} onChange={onChange} required 
                placeholder="Enter your password" 
                className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all text-white placeholder:text-gray-700" 
              />
            </div>
          </div>
          
          {/* --- প্রফেশনাল এনিমেটেড বাটন --- */}
          <motion.button 
            type="submit" 
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all duration-300
              ${isSubmitting 
                ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                : "bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/10"
              }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>
        
        <p className="text-gray-500 text-sm mt-8 text-center font-medium">
          Don't have an account? 
          <Link to="/register" className="text-yellow-500 font-bold ml-2 hover:text-yellow-400 transition-colors">Register Now</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;