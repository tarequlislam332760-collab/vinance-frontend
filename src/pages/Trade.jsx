import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Star, Bell, ChevronDown, Search, Loader2, FileText, MoreHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─── Styles ─── */
const TradeStyles = () => (
  <style>{`
    .spot-wrap { font-family:'Roboto Mono',monospace; background:#0b0e11; color:#848e9c; min-height:100vh; display:flex; flex-direction:column; }
    .spot-header { display:flex; align-items:center; gap:20px; padding:8px 16px; border-bottom:1px solid #1e2329; background:#0b0e11; }
    .spot-main { display:flex; flex:1; overflow:hidden; }
    
    /* Layout Columns */
    .col-orderbook { width: 280px; border-right: 1px solid #1e2329; display: flex; flex-direction: column; }
    .col-chart { flex: 1; display: flex; flex-direction: column; overflow-y: auto; border-right: 1px solid #1e2329; }
    .col-markets { width: 300px; display: flex; flex-direction: column; }

    /* Inputs & Buttons */
    .trade-input-group { background: #2b3139; border-radius: 4px; display: flex; align-items: center; padding: 8px 12px; margin-bottom: 12px; }
    .trade-input-group input { background: transparent; border: none; color: #eaecef; outline: none; width: 100%; font-size: 14px; }
    .trade-label { font-size: 12px; color: #848e9c; margin-bottom: 4px; }
    
    .buy-btn { width: 100%; padding: 12px; background: #0ecb81; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
    .sell-btn { width: 100%; padding: 12px; background: #f6465d; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
    .buy-btn:hover { background: #0fb574; }
    .sell-btn:hover { background: #e03d52; }

    /* Tabs */
    .tab-item { padding: 10px 15px; cursor: pointer; font-size: 13px; border-bottom: 2px solid transparent; }
    .tab-item.active { color: #f0b90b; border-bottom-color: #f0b90b; }
    
    .ob-row { display: flex; justify-content: space-between; padding: 2px 8px; font-size: 11px; position: relative; }
    .depth-bg { position: absolute; right: 0; top: 0; bottom: 0; opacity: 0.15; z-index: 0; }
    
    @media (max-width: 1200px) { .col-markets { display: none; } }
  `}</style>
);

/* ─── Order Book Component ─── */
const SpotOrderBook = ({ symbol, currentPrice, priceUp }) => {
  const [book, setBook] = useState({ asks: [], bids: [] });
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@depth10@500ms`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setBook({ asks: (d.a || []).slice(0, 15).reverse(), bids: (d.b || []).slice(0, 15) });
    };
    return () => ws.close();
  }, [symbol]);

  return (
    <div className="col-orderbook">
      <div style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', color: '#eaecef' }}>Order Book</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '10px' }}>
        <span>Price(USDT)</span><span>Amount({symbol})</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {book.asks.map((ask, i) => (
          <div key={i} className="ob-row">
            <div className="depth-bg" style={{ width: '40%', background: '#f6465d' }} />
            <span style={{ color: '#f6465d' }}>{parseFloat(ask[0]).toFixed(2)}</span>
            <span style={{ color: '#eaecef', zIndex: 1 }}>{parseFloat(ask[1]).toFixed(4)}</span>
          </div>
        ))}
        <div style={{ padding: '12px 8px', fontSize: '18px', fontWeight: 'bold', color: priceUp ? '#0ecb81' : '#f6465d', borderY: '1px solid #1e2329' }}>
          {currentPrice} {priceUp ? '↑' : '↓'}
        </div>
        {book.bids.map((bid, i) => (
          <div key={i} className="ob-row">
            <div className="depth-bg" style={{ width: '40%', background: '#0ecb81' }} />
            <span style={{ color: '#0ecb81' }}>{parseFloat(bid[0]).toFixed(2)}</span>
            <span style={{ color: '#eaecef', zIndex: 1 }}>{parseFloat(bid[1]).toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Trade Component ─── */
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
  const [activePosTab, setActivePosTab] = useState('open');

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
    <>
      <TradeStyles />
      <div className="spot-wrap">
        {/* Header */}
        <div className="spot-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#eaecef' }}>{coin}/USDT</span>
            <span style={{ color: priceUp ? '#0ecb81' : '#f6465d', fontSize: '18px', fontWeight: 'bold' }}>{currentPrice}</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '11px' }}>
            <div><div style={{ color: '#5e6673' }}>24h Change</div><div style={{ color: '#0ecb81' }}>+2.45%</div></div>
            <div><div style={{ color: '#5e6673' }}>24h High</div><div style={{ color: '#eaecef' }}>64,200.00</div></div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}><Bell size={16} /><Star size={16} /></div>
          </div>
        </div>

        <div className="spot-main">
          {/* Left: Orderbook */}
          <SpotOrderBook symbol={coin} currentPrice={currentPrice} priceUp={priceUp} />

          {/* Center: Chart + Forms */}
          <div className="col-chart">
            <div style={{ height: '450px', background: '#000' }}>
              <iframe
                title="TradingView"
                src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT&interval=1H&theme=dark&style=1`}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            {/* Trade Forms */}
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', borderTop: '1px solid #1e2329' }}>
              {/* Buy Form */}
              <div>
                <div className="trade-label">Available: <span style={{ color: '#eaecef' }}>{user?.balance?.toFixed(2)} USDT</span></div>
                <div className="trade-input-group">
                  <input type="number" placeholder="Price" value={currentPrice} readOnly />
                  <span style={{ fontSize: '12px' }}>USDT</span>
                </div>
                <div className="trade-input-group">
                  <input type="number" placeholder="Amount" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} />
                  <span style={{ fontSize: '12px' }}>{coin}</span>
                </div>
                <button className="buy-btn" onClick={() => handleTrade('buy')} disabled={loading}>
                  {loading ? 'Processing...' : `Buy ${coin}`}
                </button>
              </div>

              {/* Sell Form */}
              <div>
                <div className="trade-label">Available: <span style={{ color: '#eaecef' }}>0.00 {coin}</span></div>
                <div className="trade-input-group">
                  <input type="number" placeholder="Price" value={currentPrice} readOnly />
                  <span style={{ fontSize: '12px' }}>USDT</span>
                </div>
                <div className="trade-input-group">
                  <input type="number" placeholder="Amount" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
                  <span style={{ fontSize: '12px' }}>{coin}</span>
                </div>
                <button className="sell-btn" onClick={() => handleTrade('sell')} disabled={loading}>
                  {loading ? 'Processing...' : `Sell ${coin}`}
                </button>
              </div>
            </div>

            {/* Bottom History */}
            <div style={{ borderTop: '1px solid #1e2329', flex: 1 }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #1e2329' }}>
                <div className={`tab-item ${activePosTab === 'open' ? 'active' : ''}`} onClick={() => setActivePosTab('open')}>Open Orders(0)</div>
                <div className={`tab-item ${activePosTab === 'history' ? 'active' : ''}`} onClick={() => setActivePosTab('history')}>Order History</div>
              </div>
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <FileText size={40} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
                <p style={{ fontSize: '12px' }}>You have no open orders.</p>
              </div>
            </div>
          </div>

          {/* Right: Market List */}
          <div className="col-markets">
            <div style={{ padding: '12px', borderBottom: '1px solid #1e2329' }}>
              <div style={{ background: '#2b3139', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ marginRight: '8px' }} />
                <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '12px' }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', fontSize: '12px' }}>
              {['BTC', 'ETH', 'BNB', 'SOL', 'XRP'].map((sym) => (
                <div key={sym} onClick={() => navigate(`/trade/${sym}`)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', cursor: 'pointer' }}>
                  <span style={{ color: '#eaecef' }}>{sym}/USDT</span>
                  <span style={{ color: '#0ecb81' }}>+1.2%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Trade;
