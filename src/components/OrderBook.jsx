import React, { useState, useEffect } from 'react';

const OrderBook = () => {
  const [orders, setOrders] = useState({ bids: [], asks: [] });
  const [lastPrice, setLastPrice] = useState("68,277.4");

  useEffect(() => {
    // Binance WebSocket for real-time order book depth
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth10@100ms');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrders({
        asks: data.a.slice(0, 8).reverse(), // Red (Sell)
        bids: data.b.slice(0, 8),           // Green (Buy)
      });
      if (data.b[0]) setLastPrice(parseFloat(data.b[0][0]).toLocaleString());
    };

    return () => ws.close();
  }, []);

  return (
    <div className="flex flex-col bg-[#161a1e] rounded-lg p-2 w-full max-w-[120px] font-mono text-[10px]">
      <div className="flex justify-between text-gray-500 mb-1 font-bold">
        <span>Price</span>
        <span>Amount</span>
      </div>

      {/* Asks - Red */}
      <div className="flex flex-col-reverse">
        {orders.asks.map((ask, i) => (
          <div key={i} className="flex justify-between text-[#f6465d] py-[1px] relative">
             <div className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/10" style={{width: `${Math.random() * 100}%`}}></div>
             <span className="z-10">{parseFloat(ask[0]).toFixed(1)}</span>
             <span className="text-gray-400 z-10">{parseFloat(ask[1]).toFixed(3)}</span>
          </div>
        ))}
      </div>

      {/* Current Price Highlight */}
      <div className="text-center py-2 my-1 border-y border-gray-800">
        <span className="text-lg font-black text-[#0ecb81]">{lastPrice}</span>
      </div>

      {/* Bids - Green */}
      <div className="flex flex-col">
        {orders.bids.map((bid, i) => (
          <div key={i} className="flex justify-between text-[#0ecb81] py-[1px] relative">
            <div className="absolute right-0 top-0 bottom-0 bg-[#0ecb81]/10" style={{width: `${Math.random() * 100}%`}}></div>
            <span className="z-10">{parseFloat(bid[0]).toFixed(1)}</span>
            <span className="text-gray-400 z-10">{parseFloat(bid[1]).toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;