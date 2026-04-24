import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Settings, Wallet } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const { user, setUser } = useContext(UserContext); 
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.navbar-dropdown')) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setShowProfile(false);
    setIsOpen(false);
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: "Success! $5,000 demo balance added.", time: "2m ago" },
    { id: 2, text: "Bitcoin price reached $70,880.", time: "1h ago" }
  ];

  const navLinks = ['Markets', 'Trade', 'Features'];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0b0e11]/90 backdrop-blur-lg border-b border-gray-800 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-lg shadow-yellow-500/20">
            <span className="text-black font-black text-lg sm:text-xl">V</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">Vinance</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((item) => (
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

          <div className="flex items-center gap-5 relative navbar-dropdown">
            
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

            {/* Profile Dropdown */}
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

        {/* Mobile Right Side */}
        <div className="flex items-center gap-3 md:hidden">

          {/* Mobile Notification Bell */}
          <div className="relative navbar-dropdown">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="text-gray-400 hover:text-yellow-500 transition-colors relative p-1"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0b0e11]"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] max-w-sm bg-[#1e2329] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-gray-800">
                  <span className="font-bold text-white">Notifications</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
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

          {/* Mobile Profile Avatar (if logged in) */}
          {user && (
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs font-bold uppercase">
              {user.name?.charAt(0)}
            </div>
          )}

          {/* Hamburger */}
          <button 
            className="text-gray-400 hover:text-white p-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1e2329]/98 backdrop-blur-lg border-b border-gray-800 p-6 flex flex-col gap-1 md:hidden shadow-2xl">
          
          {/* Nav Links */}
          <div className="mb-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Navigation</p>
            {navLinks.map((item) => (
              <Link 
                key={item}
                to={`/${item.toLowerCase()}`} 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-3 px-3 py-3.5 text-base font-bold text-white hover:text-yellow-500 hover:bg-white/5 rounded-xl transition-all"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="h-[1px] bg-gray-800 my-2"></div>

          {/* User Section */}
          {user ? (
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Account</p>
              
              {/* User Info Card */}
              <div className="bg-[#0b0e11] rounded-2xl p-4 mb-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-black text-lg uppercase flex-shrink-0">
                  {user.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{user.name}</p>
                  <p className="text-gray-400 text-xs truncate">{user.email}</p>
                  <p className="text-yellow-500 text-xs font-black">${user.balance?.toLocaleString()}</p>
                </div>
              </div>

              <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3.5 text-base font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <User size={18} className="text-yellow-500" /> My Profile
              </Link>
              <Link to="/wallet" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3.5 text-base font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Wallet size={18} className="text-yellow-500" /> Wallet
              </Link>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3.5 text-base font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Settings size={18} className="text-yellow-500" /> Dashboard
              </Link>

              <div className="h-[1px] bg-gray-800 my-3"></div>

              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-3 py-3.5 text-base font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)} 
                className="w-full text-center py-3.5 text-base font-bold text-gray-300 hover:text-white border border-gray-700 rounded-2xl hover:border-gray-500 transition-all"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)} 
                className="w-full text-center bg-yellow-500 text-black py-3.5 rounded-2xl text-base font-bold hover:bg-yellow-400 transition-all shadow-xl"
              >
                Get Started →
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;