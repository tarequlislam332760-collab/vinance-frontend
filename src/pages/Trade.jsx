import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Activity, ChevronLeft, Bell, Star, MoreHorizontal, LayoutGrid, Zap } from 'lucide-react';

const Trade = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('buy'); 
  const [timeframe, setTimeframe] = useState('240'); 

  const currentCoin = (coinSymbol || 'btc').toUpperCase();

  const handleTrade = async (type) => {
    if (!amount || parseFloat(amount) <= 0) return alert("অ্যামাউন্ট লিখুন");
    setLoading(true);
    try {
      // এখানে type হিসেবে 'activeTab' এর ভ্যালু সরাসরি যাচ্ছে
      const res = await axios.post(`${API_URL}/api/trade`, 
        { 
          type: type, 
          amount: parseFloat(amount), 
          symbol: currentCoin 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setAmount('');
      if (refreshUser) await refreshUser(); 
    } catch (err) { 
      alert(err.response?.data?.message || "ট্রেড সফল হয়নি"); 
    } finally { setLoading(false); }
  };

  const handlePercentClick = (percent) => {
    if (!user?.balance) return;
    const calculatedAmount = (user.balance * percent) / 100;
    setAmount(calculatedAmount.toFixed(2));
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#0b0e11]">
        <div className="flex items-center gap-3">
          <ChevronLeft size={24} className="text-gray-300 cursor-pointer" onClick={() => window.history.back()} />
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-lg">{currentCoin}/USDT</span>
            <span className="bg-[#2b3139] text-[9px] px-1 rounded text-gray-400 font-bold">Spot</span>
          </div>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Star size={18} />
          <Bell size={18} />
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 w-full relative">
        <iframe 
          title="TV-Full" 
          src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=true&withdateranges=true&hide_side_toolbar=true&allow_symbol_change=false&locale=en`} 
          className="absolute inset-0 w-full h-full border-none"
        ></iframe>
      </div>
      
      {/* Action Panel */}
      <div className="w-full bg-[#161a1e] border-t border-[#1e2329] p-4 pb-24 relative z-[50]">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-6 text-xs font-bold uppercase">
              <button 
                onClick={() => setActiveTab('buy')}
                className={`pb-1 border-b-2 ${activeTab === 'buy' ? 'text-[#00c076] border-[#00c076]' : 'text-gray-500 border-transparent'}`}
              >Buy</button>
              <button 
                onClick={() => setActiveTab('sell')}
                className={`pb-1 border-b-2 ${activeTab === 'sell' ? 'text-[#f6465d] border-[#f6465d]' : 'text-gray-500 border-transparent'}`}
              >Sell</button>
            </div>
            <div className="text-[10px] text-gray-400">
              Avbl: <span className="text-white font-mono">{user?.balance?.toLocaleString() || '0.00'} USDT</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-[1.2] space-y-3">
              <div className="relative">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e)=>setAmount(e.target.value)} 
                  placeholder="Amount" 
                  className="w-full bg-[#2b3139] rounded-sm py-2 px-3 text-white outline-none font-mono text-sm" 
                />
                <span className="absolute right-3 top-2.5 text-gray-500 text-[10px] font-bold">USDT</span>
              </div>
              <div className="flex justify-between gap-1">
                {[25, 50, 75, 100].map((p) => (
                  <button key={p} onClick={() => handlePercentClick(p)} className="flex-1 bg-[#2b3139] text-[10px] text-gray-400 py-1 rounded-sm">{p}%</button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              {/* handleTrade ফাংশনে activeTab ভেরিয়েবলটি পাঠানো হচ্ছে */}
              <button 
                disabled={loading}
                onClick={() => handleTrade(activeTab)} 
                className={`h-full w-full rounded-sm font-bold text-sm transition-all ${activeTab === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}
              >
                {loading ? '...' : activeTab === 'buy' ? 'Buy Long' : 'Sell Short'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="fixed bottom-0 w-full flex justify-around items-center py-3 bg-[#161a1e] border-t border-[#1e2329] text-[10px] text-gray-500">
        <div className="flex flex-col items-center gap-1 cursor-pointer"><MoreHorizontal size={18}/><span>More</span></div>
        <div className="flex flex-col items-center gap-1 cursor-pointer"><LayoutGrid size={18}/><span>Hub</span></div>
        <div className="flex flex-col items-center gap-1 text-[#f0b90b] cursor-pointer"><Zap size={18}/><span>Spot</span></div>
      </div>
    </div>
  );
};

export default Trade;