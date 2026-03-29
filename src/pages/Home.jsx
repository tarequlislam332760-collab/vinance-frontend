import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";

const Home = () => {
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const messageRes = await axios.get('http://localhost:5000/api/message');
        setMessage(messageRes.data.message);
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
    <div className="bg-main-bg min-h-screen font-sans text-gray-300 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 border-b border-border">
        <div className="max-w-5xl mx-auto text-center">
          {message && (
            <div className="inline-block bg-primary/10 text-primary text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-primary/20 uppercase tracking-[0.2em] animate-pulse">
              {message}
            </div>
          )}
          
          <h1 className="text-4xl md:text-7xl font-black text-white leading-tight mb-8 uppercase italic tracking-tighter">
            Vinance Digital Trading <br />
            <span className="text-primary">Marketplace</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            The world's most powerful trading scripts and digital assets. 
            Join thousands of traders and developers today.
          </p>

          <form onSubmit={handleSearch} className="bg-white rounded-full p-1.5 flex items-center shadow-2xl max-w-3xl mx-auto overflow-hidden border-4 border-border/50">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scripts, themes or tools..." 
              className="flex-1 px-4 md:px-8 py-3 md:py-4 text-gray-800 bg-transparent outline-none text-base font-medium"
            />
            <button type="submit" className="bg-primary text-white px-6 md:px-10 py-3 md:py-4 rounded-full font-black hover:bg-primary-hover transition-all flex items-center gap-2 uppercase text-sm tracking-widest">
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
            <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tight">Browse Categories</h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Explore over 10,000+ digital assets</p>
          </div>
          <Link to="/market" className="text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              onClick={() => navigate(cat.path)}
              className="bg-card-bg p-10 rounded-[2.5rem] border border-border hover:border-primary/40 transition-all group cursor-pointer shadow-xl hover:-translate-y-2 text-left"
            >
              <div className="text-5xl mb-6 bg-main-bg w-20 h-20 flex items-center justify-center rounded-2xl border border-border group-hover:bg-primary/10 transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-primary transition-colors uppercase tracking-tight italic">{cat.title}</h3>
              <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">{cat.count} items available</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card-bg/30 py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { Icon: Shield, title: "Secure Trading", desc: "Your assets are protected with industry-leading security." },
            { Icon: Zap, title: "Instant Execution", desc: "Experience lightning-fast trade processing at any time." },
            { Icon: Globe, title: "Global Access", desc: "Access the marketplace from anywhere in the world." }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center">
              <feature.Icon className="w-12 h-12 text-primary mb-4" />
              <h4 className="text-white font-black uppercase italic tracking-tight text-xl mb-2">{feature.title}</h4>
              <p className="text-gray-500 text-xs font-bold leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-primary-hover p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase italic tracking-tighter">Ready to start trading?</h2>
            <p className="text-white/80 text-lg mb-10 font-black uppercase tracking-widest">Get $5,000 free demo balance now</p>
            <Link to="/register" className="bg-main-bg text-primary px-12 py-5 rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl inline-block uppercase tracking-widest border border-primary/20">
              Create Free Account
            </Link>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      <footer className="py-10 text-center border-t border-border">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 Vinance Marketplace. Built for high-performance trading.</p>
      </footer>
    </div>
  );
};

export default Home;