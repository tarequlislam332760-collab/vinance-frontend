import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, API_URL } = useContext(UserContext); 
  
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
      // ইমেইল ট্রিম এবং ছোট হাতের করা হয়েছে যাতে ব্যাকএন্ডে ম্যাচ করে
      const res = await axios.post(`${API_URL}/api/login`, { 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (res.data.token) {
        // টোকেন এবং ইউজার ডাটা কনটেক্সটে পাঠানো হচ্ছে
        login(res.data.token, res.data.user); 
        navigate('/dashboard'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Email or Password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-[#1e2329] border border-gray-800 rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-yellow-500 mb-2 italic">VINANCE</h1>
        <p className="text-gray-400 mb-8 font-medium">Log In to your account</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm mb-6 animate-shake">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-semibold">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-gray-600 group-focus-within:text-yellow-500 transition" size={18} />
              <input 
                type="email" 
                name="email" 
                value={email} 
                onChange={onChange} 
                required 
                placeholder="Enter your email"
                className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-yellow-500 transition-all" 
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-semibold">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-gray-600 group-focus-within:text-yellow-500 transition" size={18} />
              <input 
                type="password" 
                name="password" 
                value={password} 
                onChange={onChange} 
                required 
                placeholder="Enter password"
                className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-yellow-500 transition-all" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full bg-yellow-500 text-black py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95
              ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-400 shadow-lg shadow-yellow-500/10'}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Signing In...</span>
              </>
            ) : (
              <>Log In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-8 text-center">
          Don't have an account? 
          <Link to="/register" className="text-yellow-500 font-bold ml-1 hover:underline">Register Now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;