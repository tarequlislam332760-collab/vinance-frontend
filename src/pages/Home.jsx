import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";

// ১. এই নিচের লিঙ্কটি আপনার নিজের Vercel Backend URL দিয়ে পরিবর্তন করুন
const API_BASE_URL = "https://vinance-backend.vercel.app"; 

const Home = () => {
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // ব্যাকএন্ড থেকে ডাটা আনা
    const fetchHomeData = async () => {
      try {
        // localhost:5000 এর বদলে এখন Vercel লিঙ্ক ব্যবহার হচ্ছে
        const messageRes = await axios.get(`${API_BASE_URL}/api/message`);
        setMessage(messageRes.data.message);

        // যদি আপনার ব্যাকএন্ডে স্ট্যাটস এপিআই থাকে তবে এটি আনলক করতে পারেন
        // const statsRes = await axios.get(`${API_BASE_URL}/api/stats`);
        // setStats(statsRes.data);
      } catch (err) {
        console.error("Connection error:", err);
        setMessage("Professional Trading Scripts Marketplace");
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/market?q=${searchQuery}`);
    }
  };

  const categories = [
    { title: 'Crypto Themes', count: stats?.crypto || '1,200', icon: '💎', path: '/market/crypto' },
    { title: 'Trading Scripts', count: stats?.scripts || '850', icon: '📊', path: '/market/scripts' },
    { title: 'Site Templates', count: stats?.templates || '2,400', icon: '🖥️', path: '/market/templates' },
    { title: 'Marketing Tools', count: stats?.marketing || '450', icon: '🚀', path: '/market/tools' },
    { title: 'Payment Gateways', count: stats?.payments || '120', icon: '💳', path: '/market/gateways' },
    { title: 'Blogging Scripts', count: stats?.blog || '980', icon: '✍️', path: '/market/blog' },
  ];

  return (
    <div className="bg-[#0b0e11] min-h-screen font-sans text-gray-300 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 border-b border-gray-900 text-center">
        <div className="max-w-5xl mx-auto">
          {message && (
            <div className="inline-block bg-yellow-500/10 text-yellow-500 text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-yellow-500/20 uppercase tracking-[0.2em] animate-pulse">
              {message}
            </div>
          )}
          
          <h1 className="text-4xl md:text-7xl font-black text-white leading-tight mb-8">
            Vinance Digital Trading <br />
            <span className="text-yellow-500">Marketplace</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            The world's most powerful trading scripts and digital assets. 
            Join thousands of traders and developers today.
          </p>

          <form onSubmit={handleSearch} className="bg-white rounded-full p-1.5 flex items-center shadow-2xl max-w-3xl mx-auto overflow-hidden border-4 border-gray-800/50">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scripts, themes or tools..." 
              className="flex-1 px-4 md:px-8 py-3 md:py-4 text-gray-800 bg-transparent outline-none text-base"
            />
            <button type="submit" className="bg-yellow-500 text-black px-6 md:px-10 py-3 md:py-4 rounded-full font-bold hover:bg-yellow-400 transition-all flex items-center gap-2">
              <Search className="w-5 h-5" /> 
              <span className="hidden md:inline">Search</span>
            </button>
          </form>
        </div>
      </header>

      {/* Category Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Browse Categories</h2>
            <p className="text-gray-500">Explore over 10,000+ digital assets</p>
          </div>
          <Link to="/market" className="text-yellow-500 font-bold flex items-center gap-2 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              onClick={() => navigate(cat.path)}
              className="bg-[#1e2329] p-10 rounded-[2.5rem] border border-gray-800 hover:border-yellow-500/40 transition-all group cursor-pointer shadow-xl hover:-translate-y-2 text-left"
            >
              <div className="text-5xl mb-6 bg-[#0b0e11] w-20 h-20 flex items-center justify-center rounded-2xl border border-gray-800 group-hover:bg-yellow-500/10 transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-500 transition-colors">{cat.title}</h3>
              <p className="text-gray-500 font-medium">{cat.count} items available</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#14171a] py-20 px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { Icon: Shield, title: "Secure Trading", desc: "Your assets are protected with industry-leading security." },
            { Icon: Zap, title: "Instant Execution", desc: "Experience lightning-fast trade processing at any time." },
            { Icon: Globe, title: "Global Access", desc: "Access the marketplace from anywhere in the world." }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center">
              <feature.Icon className="w-12 h-12 text-yellow-500 mb-4" />
              <h4 className="text-white font-bold text-xl mb-2">{feature.title}</h4>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-black mb-6">Ready to start trading?</h2>
            <p className="text-yellow-900 text-lg mb-10 font-bold uppercase tracking-widest">Get $5,000 free demo balance now</p>
            <Link to="/register" className="bg-black text-white px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl inline-block">
              Create Free Account
            </Link>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      <footer className="py-10 text-center border-t border-gray-900">
        <p className="text-gray-600 text-sm">© 2026 Vinance Marketplace. Built for high-performance trading.</p>
      </footer>
    </div>
  );
};

export default Home;