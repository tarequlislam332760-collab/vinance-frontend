import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Bell, Star, Search, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Trade = () => {
  const { coinSymbol } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, token } = useContext(UserContext);
  const coin = (coinSymbol || 'BTC').toUpperCase();

  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceUp, setPriceUp] = useState(true);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // WebSocket for Live Price
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.c).toFixed(2);
      setCurrentPrice((prev) => {
        setPriceUp(parseFloat(price) >= parseFloat(prev));
        return price;
      });
    };
    return () => ws.close();
  }, [coin]);

  const handleTrade = async (side) => {
    const amount = side === 'buy' ? buyAmount : sellAmount;
    if (!amount || amount <= 0) return toast.error("Enter amount");
    setLoading(true);
    try {
      await axios.post(`https://vinance-backend-1.onrender.com/api/trade`, 
        { type: side, amount: parseFloat(amount), symbol: coin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${side.toUpperCase()} Success!`);
      refreshUser();
      setBuyAmount(''); setSellAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Trade failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="trade-container" style={{ background: '#0b0e11', color: '#848e9c', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Roboto, sans-serif' }}>
      
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 16px', borderBottom: '1px solid #1e2329' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#eaecef' }}>{coin}/USDT</span>
          <span style={{ color: priceUp ? '#0ecb81' : '#f6465d', fontSize: '18px', fontWeight: 'bold' }}>{currentPrice}</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '11px' }}>
          <div><div style={{ color: '#5e6673' }}>24h Change</div><div style={{ color: '#0ecb81' }}>+2.45%</div></div>
          <div><div style={{ color: '#5e6673' }}>24h High</div><div style={{ color: '#eaecef' }}>65,240.00</div></div>
        </div>
      </div>

      {/* 2. Main Layout (3 Columns) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: Order Book */}
        <div style={{ width: '250px', borderRight: '1px solid #1e2329', display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
          <div style={{ padding: '8px', fontWeight: 'bold' }}>Order Book</div>
          <div style={{ flex: 1, overflowY: 'hidden', padding: '0 8px' }}>
            {/* Asks (Red) */}
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#f6465d', padding: '2px 0' }}>
                <span>{ (parseFloat(currentPrice) + (i * 0.5)).toFixed(2) }</span>
                <span style={{ color: '#eaecef' }}>{(Math.random() * 0.1).toFixed(4)}</span>
              </div>
            ))}
            {/* Price Divider */}
            <div style={{ padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: priceUp ? '#0ecb81' : '#f6465d', textAlign: 'center' }}>
              {currentPrice}
            </div>
            {/* Bids (Green) */}
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#0ecb81', padding: '2px 0' }}>
                <span>{ (parseFloat(currentPrice) - (i * 0.5)).toFixed(2) }</span>
                <span style={{ color: '#eaecef' }}>{(Math.random() * 0.1).toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: Chart & Trade Form */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e2329', overflowY: 'auto' }}>
          {/* Chart Section */}
          <div style={{ height: '400px', background: '#000' }}>
            <iframe
              title="TradingView"
              src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT&interval=1H&theme=dark&style=1`}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>

          {/* Trade Form Section (Like image_937d1e.png but improved) */}
          <div style={{ padding: '20px', borderTop: '1px solid #1e2329' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Buy Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px' }}>Available: <span style={{ color: '#eaecef' }}>{user?.balance?.toFixed(2)} USDT</span></div>
                  <div style={{ background: '#2b3139', padding: '8px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <input type="number" value={currentPrice} readOnly style={{ background: 'transparent', border: 'none', color: '#eaecef', outline: 'none', width: '100%' }} />
                    <span style={{ fontSize: '12px' }}>USDT</span>
                  </div>
                  <div style={{ background: '#2b3139', padding: '8px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <input type="number" placeholder="Amount" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#eaecef', outline: 'none', width: '100%' }} />
                    <span style={{ fontSize: '12px' }}>{coin}</span>
                  </div>
                  <button onClick={() => handleTrade('buy')} style={{ background: '#0ecb81', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Buy {coin}
                  </button>
                </div>

                {/* Sell Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px' }}>Available: <span style={{ color: '#eaecef' }}>0.00 {coin}</span></div>
                  <div style={{ background: '#2b3139', padding: '8px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <input type="number" value={currentPrice} readOnly style={{ background: 'transparent', border: 'none', color: '#eaecef', outline: 'none', width: '100%' }} />
                    <span style={{ fontSize: '12px' }}>USDT</span>
                  </div>
                  <div style={{ background: '#2b3139', padding: '8px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <input type="number" placeholder="Amount" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#eaecef', outline: 'none', width: '100%' }} />
                    <span style={{ fontSize: '12px' }}>{coin}</span>
                  </div>
                  <button onClick={() => handleTrade('sell')} style={{ background: '#f6465d', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Sell {coin}
                  </button>
                </div>
             </div>
          </div>

          {/* History Section */}
          <div style={{ borderTop: '1px solid #1e2329', padding: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '2px solid #f0b90b', display: 'inline-block', paddingBottom: '5px', marginBottom: '15px' }}>Open Orders</div>
            <div style={{ textAlign: 'center', padding: '30px', color: '#5e6673' }}>
              <FileText size={40} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
              <p style={{ fontSize: '12px' }}>You have no open orders.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Markets */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px' }}>
            <div style={{ background: '#2b3139', borderRadius: '4px', padding: '6px 10px', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ marginRight: '8px' }} />
              <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '12px', outline: 'none' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {['BTC', 'ETH', 'BNB', 'SOL', 'DOT'].map((sym) => (
              <div key={sym} onClick={() => navigate(`/trade/${sym}`)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', cursor: 'pointer', fontSize: '13px', color: '#eaecef' }}>
                <span>{sym}/USDT</span>
                <span style={{ color: '#0ecb81' }}>+1.20%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Trade;
