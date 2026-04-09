import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const Register = () => {
  const navigate = useNavigate();
  const { API_URL } = useContext(UserContext);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', agree: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.agree) { 
      setError("Please agree to the Terms of Service"); 
      return; 
    }
    
    setIsSubmitting(true);
    
    try {
      const { name, email, password } = formData;
      
      // ব্যাকএন্ডে পাঠানোর সময় ডাটা ক্লিন করা হচ্ছে
      const response = await axios.post(`${API_URL}/api/register`, { 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (response.status === 201 || response.data.success) {
        alert("Registration Successful! Please login.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 relative overflow-hidden text-left">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md bg-[#1e2329] border border-gray-800 rounded-3xl p-10 shadow-2xl relative z-10">
        <h1 className="text-3xl font-bold text-yellow-500 mb-2 italic">VINANCE</h1>
        <p className="text-gray-400 mb-8 font-medium">Create your trading account</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-semibold">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-yellow-500 transition" size={18} />
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Your full name" 
                className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-yellow-500 text-white transition-all" 
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-semibold">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-yellow-500 transition" size={18} />
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Email address" 
                className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-yellow-500 text-white transition-all" 
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-semibold">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-yellow-500 transition" size={18} />
              <input 
                type="password" 
                name="password" 
                required 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Create password" 
                className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-yellow-500 text-white transition-all" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-1">
            <input 
              type="checkbox" 
              name="agree" 
              id="terms"
              checked={formData.agree} 
              onChange={handleChange} 
              className="w-4 h-4 accent-yellow-500 bg-[#0b0e11] rounded cursor-pointer" 
            />
            <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer select-none">
              I agree to the <span className="text-gray-300 underline">Terms of Service</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full bg-yellow-500 text-black py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/10
              ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-400'}`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>Create Account <ArrowRight size={18} /></>
            )}
          </button>
        </form>
        
        <p className="text-gray-500 text-sm mt-8 text-center font-medium">
          Already have an account? 
          <Link to="/login" className="text-yellow-500 font-bold ml-1 hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;