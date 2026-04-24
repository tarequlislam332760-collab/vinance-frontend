import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Settings, Wallet } from 'lucide-react';
import { UserContext } from '../context/UserContext'; // Context ইমপোর্ট করুন

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // ✅ Context থেকে ইউজার ডাটা এবং লগআউট ফাংশন নিন
  const { user, setUser } = useContext(UserContext); 
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ লগআউট ফাংশন
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setShowProfile(false);
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: "Success! $5,000 demo balance added.", time: "2m ago" },
    { id: 2, text: "Bitcoin price reached $70,880.", time: "1h ago" }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0b0e11]/90 backdrop-blur-lg border-b border-gray-800 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-lg shadow-yellow-500/20">
            <span className="text-black font-black text-xl">V</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Vinance</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {['Markets', 'Trade', 'Features'].map((item) => (
              <Link 
                key={item} 
                to={`/${item.toLowerCase()}`} 
                className="text-sm font-bold text-gray-400 hover:text-yellow-500 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
          
          <div className="h-6 w-[1px] bg-gray-800 mx-2"></div>

          {/* Icons & Actions */}
          <div className="flex items-center gap-5 relative">
            
            {/* Notification */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="text-gray-400 hover:text-yellow-500 transition-colors relative p-1"
              >
                <Bell size={22} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0b0e11]"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-72 bg-[#1e2329] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <span className="font-bold text-white">Notifications</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors">
                        <p className="text-sm text-gray-300 mb-1">{n.text}</p>
                        <span className="text-[10px] text-gray-500">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ প্রোফাইল ড্রপডাউন (শুধুমাত্র লগইন থাকলে দেখাবে) */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                  className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700 transition-all"
                >
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-[10px] font-bold uppercase">
                    {user.name?.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-gray-300">${user.balance?.toLocaleString()}</span>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-4 w-56 bg-[#1e2329] border border-gray-800 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200">
                    <div className="p-3 border-b border-gray-800 mb-2">
                        <p className="text-xs text-gray-500 font-bold uppercase">Account</p>
                        <p className="text-sm text-white font-bold truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-3 p-3 text-sm font-bold text-gray-300 hover:bg-gray-800 rounded-xl transition-colors">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/wallet" onClick={() => setShowProfile(false)} className="flex items-center gap-3 p-3 text-sm font-bold text-gray-300 hover:bg-gray-800 rounded-xl transition-colors">
                      <Wallet size={16} /> Wallet
                    </Link>
                    <div className="h-[1px] bg-gray-800 my-1 mx-2"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ✅ লগইন না থাকলে এই বাটনগুলো দেখাবে */
              <div className="flex items-center gap-4">
                 <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white">Log In</Link>
                 <Link 
                  to="/register" 
                  className="bg-yellow-500 text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-yellow-400 transition-all shadow-xl active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1e2329] border-b border-gray-800 p-6 flex flex-col gap-6 md:hidden">
          <Link to="/markets" onClick={()=>setIsOpen(false)} className="text-lg font-bold text-white">Markets</Link>
          <Link to="/trade" onClick={()=>setIsOpen(false)} className="text-lg font-bold text-white">Trade</Link>
          {user && <Link to="/profile" onClick={()=>setIsOpen(false)} className="text-lg font-bold text-white">Profile</Link>}
          <div className="h-[1px] bg-gray-800"></div>
          {!user ? (
            <>
              <Link to="/login" onClick={()=>setIsOpen(false)} className="text-lg font-bold text-gray-400">Log In</Link>
              <Link to="/register" onClick={()=>setIsOpen(false)} className="bg-yellow-500 text-black p-4 rounded-2xl text-center font-bold">Register Now</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="text-lg font-bold text-red-500 text-left">Log Out</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;