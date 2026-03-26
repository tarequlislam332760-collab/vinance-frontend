import React, { useState } from 'react';
import { Bell } from 'lucide-react';

const NotificationSystem = () => {
  // ১. নোটিফিকেশন আছে কি না তা চেক করার জন্য স্টেট
  const [hasNotification, setHasNotification] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // ২. ক্লিক করলে লাল দাগ চলে যাবে এবং ড্রপডাউন দেখাবে
  const handleNotificationClick = () => {
    setHasNotification(false);
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="relative">
      <button 
        onClick={handleNotificationClick}
        className="p-2.5 bg-gray-800/50 rounded-full hover:bg-gray-700 transition-all relative group"
      >
        <Bell size={20} className="text-gray-400 group-hover:text-yellow-500" />
        
        {/* ৩. যদি নোটিফিকেশন থাকে তবেই লাল ডট দেখাবে */}
        {hasNotification && (
          <span className="absolute top-2 right-2.5 w-3 h-3 bg-red-500 border-2 border-[#1e2329] rounded-full animate-pulse"></span>
        )}
      </button>

      {/* ৪. সিম্পল নোটিফিকেশন ড্রপডাউন (অপশনাল) */}
      {showDropdown && (
        <div className="absolute right-0 mt-3 w-64 bg-[#1e2329] border border-gray-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-200">
          <h3 className="text-sm font-bold text-white mb-3 border-b border-gray-800 pb-2">Notifications</h3>
          <div className="space-y-3">
            <p className="text-xs text-gray-400 bg-gray-800/30 p-2 rounded-lg">Welcome to Vinance! Start trading now.</p>
            <p className="text-xs text-gray-400 bg-gray-800/30 p-2 rounded-lg">Market update: BTC reached $71k!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;