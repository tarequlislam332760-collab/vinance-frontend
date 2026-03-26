import React, { useEffect, useRef } from 'react';

const TradingChart = () => {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "calendar": false,
        "container_id": "tradingview_chart"
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div id="tradingview_chart" className="h-[400px] md:h-[500px] w-full"></div>
    </div>
  );
};

export default TradingChart;