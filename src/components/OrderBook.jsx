import React, { useState, useEffect } from 'react';

const OrderBook = ({ symbol = "BTC" }) => {
  const [orders, setOrders] = useState({ bids: [], asks: [] });
  const [lastPrice, setLastPrice] = useState("0.0");
  const [prevPrice, setPrevPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@depth10@100ms`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrders({
        asks: data.a.slice(0, 8).reverse(),
        bids: data.b.slice(0, 8),
      });
      
      const newPrice = parseFloat(data.b[0][0]);
      setPrevPrice(prev => prev === null ? newPrice : lastPrice);
      setLastPrice(newPrice);
    };

    return () => ws.close();
  }, [symbol, lastPrice]);

  const getDepthWidth = (amount, side) => {
    const dataSet = side === 'asks' ? orders.asks : orders.bids;
    if (dataSet.length === 0) return 0;
    const max = Math.max(...dataSet.map(o => parseFloat(o[1])));
    return (parseFloat(amount) / max) * 100;
  };

  return (
    <div className="flex flex-col bg-[#161a1e]/50 p-3 w-full font-mono text-[11px] select-none border-b border-gray-800 lg:border-b-0">
      <div className="flex justify-between text-gray-500 mb-3 font-bold uppercase tracking-tighter px-1">
        <span>Price (USDT)</span>
        <span>Amount (Qty)</span>
      </div>

      <div className="flex flex-col-reverse">
        {orders.asks.map((ask, i) => (
          <div key={i} className="flex justify-between text-[#f6465d] py-[2px] relative group px-1">
            <div className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/10 transition-all duration-300" 
                 style={{ width: `${getDepthWidth(ask[1], 'asks')}%` }}></div>
            <span className="z-10 font-bold">{parseFloat(ask[0]).toFixed(1)}</span>
            <span className="text-gray-300 z-10">{parseFloat(ask[1]).toFixed(3)}</span>
          </div>
        ))}
      </div>

      <div className="py-3 my-2 border-y border-gray-800/50 flex flex-col items-center justify-center bg-[#1e2329]/30 rounded">
        <span className={`text-[18px] font-black transition-colors duration-500 ${lastPrice >= prevPrice ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
          {lastPrice.toLocaleString()}
        </span>
        <span className="text-[10px] text-gray-500 font-bold">≈ ${lastPrice.toLocaleString()}</span>
      </div>

      <div className="flex flex-col">
        {orders.bids.map((bid, i) => (
          <div key={i} className="flex justify-between text-[#02c076] py-[2px] relative px-1">
            <div className="absolute right-0 top-0 bottom-0 bg-[#02c076]/10 transition-all duration-300" 
                 style={{ width: `${getDepthWidth(bid[1], 'bids')}%` }}></div>
            <span className="z-10 font-bold">{parseFloat(bid[0]).toFixed(1)}</span>
            <span className="text-gray-300 z-10">{parseFloat(bid[1]).toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;