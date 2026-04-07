import React, { useState, useEffect } from 'react';

const OrderBook = () => {
  const [orders, setOrders] = useState({ bids: [], asks: [] });
  const [lastPrice, setLastPrice] = useState("68,277.4");
  const [prevPrice, setPrevPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth10@100ms');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrders({
        asks: data.a.slice(0, 8).reverse(),
        bids: data.b.slice(0, 8),
      });
      
      const newPrice = parseFloat(data.b[0][0]);
      setPrevPrice(parseFloat(lastPrice.replace(/,/g, '')));
      setLastPrice(newPrice.toLocaleString(undefined, { minimumFractionDigits: 1 }));
    };

    return () => ws.close();
  }, [lastPrice]);

  const getDepthWidth = (amount, side) => {
    const max = Math.max(...(side === 'asks' ? orders.asks : orders.bids).map(o => parseFloat(o[1])));
    return (parseFloat(amount) / max) * 100;
  };

  return (
    <div className="flex flex-col bg-[#161a1e]/50 rounded-lg p-2 w-full font-mono text-[10px] select-none">
      <div className="flex justify-between text-gray-500 mb-2 font-black uppercase tracking-tighter">
        <span>Price</span>
        <span>Amount</span>
      </div>

      {/* Sell Orders (Asks) */}
      <div className="flex flex-col-reverse">
        {orders.asks.map((ask, i) => (
          <div key={i} className="flex justify-between text-[#f6465d] py-[1.5px] relative group">
            <div 
              className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/10 transition-all duration-300" 
              style={{ width: `${getDepthWidth(ask[1], 'asks')}%` }}
            ></div>
            <span className="z-10 font-bold">{parseFloat(ask[0]).toFixed(1)}</span>
            <span className="text-gray-400 z-10 font-medium">{parseFloat(ask[1]).toFixed(3)}</span>
          </div>
        ))}
      </div>

      {/* Last Price Indicator */}
      <div className="py-2 my-1 border-y border-gray-800/50 flex flex-col items-center justify-center">
        <span className={`text-[16px] font-black transition-colors duration-500 ${parseFloat(lastPrice.replace(/,/g, '')) >= prevPrice ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
          {lastPrice}
        </span>
        <span className="text-[9px] text-gray-500 font-bold">≈ ${lastPrice}</span>
      </div>

      {/* Buy Orders (Bids) */}
      <div className="flex flex-col">
        {orders.bids.map((bid, i) => (
          <div key={i} className="flex justify-between text-[#02c076] py-[1.5px] relative">
            <div 
              className="absolute right-0 top-0 bottom-0 bg-[#02c076]/10 transition-all duration-300" 
              style={{ width: `${getDepthWidth(bid[1], 'bids')}%` }}
            ></div>
            <span className="z-10 font-bold">{parseFloat(bid[0]).toFixed(1)}</span>
            <span className="text-gray-400 z-10 font-medium">{parseFloat(bid[1]).toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;