import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ChevronLeft, Bell, Star, MoreHorizontal, LayoutGrid, Zap, TrendingUp, TrendingDown } from 'lucide-react';

const TIMEFRAMES = [
  { label: '15m', value: '15' },
  { label: '1h',  value: '60' },
  { label: '4h',  value: '240' },
  { label: '1D',  value: '1D' },
];

const Trade = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);

  const [amount, setAmount]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [timeframe, setTimeframe] = useState('240');

  // ✅ NEW: Live price via WebSocket
  const [livePrice, setLivePrice]   = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [high24h, setHigh24h]       = useState(null);
  const [low24h, setLow24h]         = useState(null);
  const [vol24h, setVol24h]         = useState(null);
  const [priceUp, setPriceUp]       = useState(true);

  const currentCoin = (coinSymbol || 'btc').toUpperCase();

  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@ticker`
    );
    let prevPrice = null;
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.c);
      if (prevPrice !== null) setPriceUp(price >= prevPrice);
      prevPrice = price;
      setLivePrice(price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }));
      setPriceChange(parseFloat(d.P).toFixed(2));
      setHigh24h(parseFloat(d.h).toLocaleString());
      setLow24h(parseFloat(d.l).toLocaleString());
      setVol24h((parseFloat(d.q) / 1e9).toFixed(2) + 'B');
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [currentCoin]);

  const handleTrade = async (tradeType) => {
    const parsedAmount = parseFloat(amount);
    if (!amount || parsedAmount <= 0) return alert("অ্যামাউন্ট লিখুন");
    if (parsedAmount > (user?.balance || 0)) return alert("Balance insufficient!");

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/trade`,
        { type: tradeType, amount: parsedAmount, symbol: currentCoin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setAmount('');
      if (refreshUser) await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || "ট্রেড সফল হয়নি");
    } finally {
      setLoading(false);
    }
  };

  const priceColor = priceUp ? '#02c076' : '#f6465d';
  const changePositive = parseFloat(priceChange) >= 0;

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans">

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-[#1e2329]">
        <div className="flex items-center gap-3">
          <ChevronLeft
            size={24}
            className="text-gray-300 cursor-pointer"
            onClick={() => window.history.back()}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-white font-bold text-lg">{currentCoin}USDT</span>
              <span className="bg-[#2b3139] text-[9px] px-1 rounded text-gray-400 font-medium">Perp</span>
            </div>
            <span className="text-[10px] text-gray-500">{currentCoin === 'BTC' ? 'Bitcoin' : currentCoin}</span>
          </div>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Star size={18} className="cursor-pointer hover:text-yellow-500 transition-colors" />
          <Bell size={18} className="cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* ✅ Live Price Section */}
      <div className="px-4 py-3 flex justify-between items-start">
        <div className="flex flex-col">
          <span
            className="text-3xl font-bold transition-colors duration-300"
            style={{ color: priceColor }}
          >
            {livePrice || '---'}
          </span>
          <div className="flex items-center gap-2 text-xs mt-1">
            <span className="text-white">${livePrice || '---'}</span>
            <span style={{ color: changePositive ? '#02c076' : '#f6465d' }} className="font-bold">
              {changePositive ? '+' : ''}{priceChange || '0.00'}%
            </span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 font-mono">
            Mark Price {livePrice || '---'}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-right text-[10px] text-gray-500 font-mono">
          <div>24h High <span className="text-gray-300 ml-1">{high24h || '---'}</span></div>
          <div>24h Vol(USDT) <span className="text-gray-300 ml-1">{vol24h || '---'}</span></div>
          <div>24h Low <span className="text-gray-300 ml-1">{low24h || '---'}</span></div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-4 px-4 py-1 text-xs text-gray-500 border-b border-[#1e2329]">
        <span className="text-gray-400">Time</span>
        {TIMEFRAMES.map(tf => (
          <span
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`cursor-pointer transition-colors ${
              timeframe === tf.value
                ? 'text-white font-bold border-b border-[#f0b90b] text-[#f0b90b]'
                : 'hover:text-white'
            }`}
          >
            {tf.label}
          </span>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 w-full bg-[#0b0e11]">
        <iframe
          title="TV-Full"
          src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=true&withdateranges=true&hide_side_toolbar=true&allow_symbol_change=false&locale=en`}
          className="w-full h-full border-none"
        />
      </div>

      {/* Footer Trade Panel */}
      <div className="bg-[#161a1e] border-t border-[#1e2329] px-4 pt-4 pb-20">
        <div className="flex justify-between items-center mb-3 text-[11px]">
          <div className="flex gap-4 text-gray-400 font-bold">
            <span className="text-[#f0b90b]">MA</span>
            <span>EMA</span>
            <span>BOLL</span>
            <span>VOL</span>
          </div>
          <div className="text-gray-400">
            Available:{' '}
            <span className="text-white font-mono">
              {(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount"
              min="1"
              max={user?.balance || 0}
              className="w-full bg-[#2b3139] rounded py-3 px-3 text-white outline-none font-mono text-sm border border-transparent focus:border-[#f0b90b]"
            />
            <span className="absolute right-3 top-3.5 text-gray-500 text-xs font-bold">USDT</span>
          </div>

          {/* ✅ Quick amount buttons */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                onClick={() => setAmount(((user?.balance || 0) * pct / 100).toFixed(2))}
                className="flex-1 bg-[#2b3139] text-gray-400 text-[10px] py-1 rounded hover:bg-[#363c45] hover:text-white transition-all font-bold"
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="flex gap-3 h-12">
            <button
              disabled={loading || !amount || parseFloat(amount) <= 0}
              onClick={() => handleTrade('buy')}
              className="flex-1 bg-[#02c076] text-[#0b0e11] rounded font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? '...' : <><TrendingUp size={16}/> Long</>}
            </button>
            <button
              disabled={loading || !amount || parseFloat(amount) <= 0}
              onClick={() => handleTrade('sell')}
              className="flex-1 bg-[#f6465d] text-white rounded font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? '...' : <><TrendingDown size={16}/> Short</>}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full flex justify-around items-center py-3 bg-[#161a1e] border-t border-[#1e2329] text-[10px] text-gray-500">
        <div className="flex flex-col items-center gap-1"><MoreHorizontal size={18}/><span>More</span></div>
        <div className="flex flex-col items-center gap-1"><LayoutGrid size={18}/><span>Hub</span></div>
        <div className="flex flex-col items-center gap-1 text-[#f0b90b] font-bold"><Zap size={18}/><span>Spot</span></div>
      </div>
    </div>
  );
};

export default Trade;