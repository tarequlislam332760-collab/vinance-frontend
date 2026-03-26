import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext'; 

// আপনার ভেরসেল ব্যাকএন্ড লিঙ্কটি এখানে দিন
const API_BASE_URL = "https://vinance-backend.vercel.app"; 

const TradePage = () => {
  const [tradeType, setTradeType] = useState('buy'); 
  const [amount, setAmount] = useState(''); 
  const { user, token, setUser } = useContext(UserContext);
  
  // লাইভ প্রাইস স্টোর করার স্টেট
  const [livePrice, setLivePrice] = useState(70880.45); 

  // লাইভ প্রাইস ফেচ করার জন্য useEffect
  useEffect(() => {
    const fetchLivePrice = async () => {
      try {
        // লোকালহোস্ট পরিবর্তন করে API_BASE_URL ব্যবহার করা হয়েছে
        const res = await axios.get(`${API_BASE_URL}/api/crypto`);
        const btcData = res.data.find(coin => coin.symbol === 'BTC');
        if (btcData) {
          setLivePrice(btcData.price);
        }
      } catch (err) {
        console.error("Price update failed:", err);
      }
    };

    fetchLivePrice(); 
    const interval = setInterval(fetchLivePrice, 30000); 
    return () => clearInterval(interval); 
  }, []);

  const handleTrade = async () => {
    if (!amount || amount <= 0) return alert("Please enter a valid amount");

    try {
      // লোকালহোস্ট পরিবর্তন করে API_BASE_URL ব্যবহার করা হয়েছে
      const res = await axios.post(`${API_BASE_URL}/api/trade`, 
        { 
          type: tradeType, 
          amount: amount, 
          symbol: 'BTC',
          price: livePrice 
        },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      alert(res.data.message);
      setUser(prev => ({ ...prev, balance: res.data.newBalance }));
      setAmount('');
    } catch (err) {
      alert(err.response?.data?.message || "Trade failed. Please check your connection.");
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-6 min-h-screen text-left bg-[#0b0e11]">
      <div className="flex-1 bg-[#1e2329] border border-gray-800 rounded-3xl overflow-hidden min-h-[500px] shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#191d23]">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg text-white">BTC / USDT</span>
            <span className="text-emerald-400 font-mono text-sm">${livePrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex-1 bg-[#161a1e] flex items-center justify-center text-gray-600">
           <iframe
             title="TradingView Chart"
             src="https://s.tradingview.com/widgetembed/?symbol=BINANCE:BTCUSDT&theme=dark&style=1&locale=en"
             style={{ width: '100%', height: '100%', border: 'none' }}
           ></iframe>
        </div>
      </div>

      <div className="w-full lg:w-96">
        <div className="bg-[#1e2329] border border-gray-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex gap-2 mb-6 p-1 bg-[#0b0e11] rounded-xl border border-gray-800">
            <button onClick={() => setTradeType('buy')} className={`flex-1 py-3 rounded-lg font-bold transition-all ${tradeType === 'buy' ? 'bg-emerald-500 text-black' : 'text-gray-500'}`}>Buy</button>
            <button onClick={() => setTradeType('sell')} className={`flex-1 py-3 rounded-lg font-bold transition-all ${tradeType === 'sell' ? 'bg-red-500 text-white' : 'text-gray-500'}`}>Sell</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block uppercase font-bold tracking-widest">Price (USDT)</label>
              <input type="text" disabled className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl p-3 text-sm text-gray-400 font-mono" placeholder={livePrice.toLocaleString()} value={livePrice.toLocaleString()} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block uppercase font-bold tracking-widest">Amount (USDT)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-yellow-500" placeholder="0.00" />
            </div>

            <div className="pt-4 border-t border-gray-800/50">
               <div className="flex justify-between text-xs text-gray-500 mb-3 font-bold">
                 <span>AVAILABLE BALANCE:</span>
                 <span className="text-yellow-500">${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <button onClick={handleTrade} className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-[0.98] ${tradeType === 'buy' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>
                 {tradeType === 'buy' ? 'Buy BTC' : 'Sell BTC'}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePage;