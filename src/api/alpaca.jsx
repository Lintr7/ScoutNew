import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TIME_PERIODS = {
  '1D': { days: 1, timeframe: '5Min', label: '1 Day' },
  '5D': { days: 5, timeframe: '15Min', label: '5 Days' },
  '1M': { days: 30, timeframe: '1Hour', label: '1 Month' },
  '6M': { days: 180, timeframe: '1Day', label: '6 Months' },
  '1Y': { days: 365, timeframe: '1Day', label: '1 Year' },
  '5Y': { days: 1825, timeframe: '1Week', label: '5 Years' }
};

const fetchAlpacaStockData = async (symbol, start, end, timeframe) => {
  const ALPACA_API_KEY = import.meta.env.VITE_ALPACA_API_KEY;
  const ALPACA_API_SECRET = import.meta.env.VITE_ALPACA_API_SECRET;

  const headers = {
    'APCA-API-KEY-ID': ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
  };
  
  const url = `https://data.alpaca.markets/v2/stocks/${symbol}/bars?start=${start}&end=${end}&timeframe=${timeframe}&feed=iex&adjustment=all`;
  
  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    if (!data.bars || data.bars.length === 0) return [];
    
    return data.bars.map(bar => ({
      t: new Date(bar.t).getTime(),
      c: bar.c,
    }));
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
};

const TimePeriodToggle = ({ selectedPeriod, onPeriodChange, loading }) => {
  const periods = Object.keys(TIME_PERIODS);
  
  return (
    <div style={{fontFamily: 'Geist, sans-serif'}}className="flex flex-wrap gap-1">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          disabled={loading}
          className={`px-2 py-1 mr-1.5 mt-8 text-sm font-medium rounded-md transition-colors duration-200 ${
            selectedPeriod === period
              ? 'bg-blue-400 text-white shadow-sm'
              : ' text-gray-700 border bg-transparent hover:bg-white/20 hover:text-white/50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

const StockChart = ({ data, title, period, selectedPeriod, onPeriodChange, loading, previousClose }) => {
  // if (!data || data.length === 0) return <p>No stock data available.</p>;
  

  const formatTick = (timestamp) => {
    const date = new Date(timestamp);
    
    switch (period) {
      case '1D':
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      case '5D':
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          hour: 'numeric',
          hour12: true
        });
      case '1M':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case '6M':
      case '1Y':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case '5Y':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
      default:
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
    }
  };

  const getSampledData = () => {
    if (data.length <= 100) return data;
    const sampleRate = Math.ceil(data.length / 100);
    return data.filter((_, index) => index % sampleRate === 0);
  };

  const sampledData = getSampledData();

  const firstPrice = data[0]?.c || 0;
  const lastPrice = data[data.length - 1]?.c || 0;
  
  // For 1D period, use previous trading day's close, otherwise use first price of current period
  const basePrice = (period === '1D' && previousClose !== null) ? previousClose : firstPrice;
  const priceChange = lastPrice - basePrice;
  const priceChangePercent = basePrice !== 0 ? (priceChange / basePrice) * 100 : 0;

  

  const axisConfig = {
    xAxis: {
      dataKey: "t",
      tickFormatter: formatTick,
      tickCount: 6,
      interval: "preserveStartEnd",
      tick: { fontSize: 11, fill: 'hsla(0, 0%, 85%, 1)', fontFamily: 'Geist, sans-serif'},
      axisLine: { stroke: 'hsla(0, 0%, 50%, 1)' },  
      tickLine: { stroke: 'hsla(0, 0%, 50%, 1)' },
      angle: 0,
      textAnchor: "middle",
      height: 30
    },
    yAxis: {
      domain: ['dataMin - 5', 'dataMax + 5'],
      tick: { fontSize: 11, fill: 'hsla(0, 0%, 85%, 1)', fontFamily: 'Geist, sans-serif' },
      axisLine: { stroke: false },  
      tickLine: { stroke: false },
      tickFormatter: (value) => `${value.toFixed(2)}`,
      width: 70
    }
  };

  return (
    <div style={{ marginTop: '-0.9em' }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start justify-between w-full">
          <div>
            <h3 style={{ fontFamily: 'Geist, sans-serif', fontWeight: '700'}} className="text-2xl text-purple-400">{title}</h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-2xl font-bold font-mono text-white">
                ${lastPrice.toFixed(2)}
              </span>
              <span style={{ fontFamily: 'Geist, sans-serif', marginTop: '0.3em', marginLeft: '-0.5em'}} className={`text-sm font-medium ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-600'
              }`}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <TimePeriodToggle 
              selectedPeriod={selectedPeriod}
              onPeriodChange={onPeriodChange}
              loading={loading}
            />
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="105%" height={315} style={{marginLeft: '-1em', marginTop:'-0.5em'}}>
        <LineChart 
          data={sampledData} 
          margin={{ top: 5, right: 30, left: 0, bottom: 100 }}
          key="static-chart" 
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.2)" 
            horizontal={true}
            vertical={false}
          />
          <XAxis
            {...axisConfig.xAxis}
          />
          <YAxis
            {...axisConfig.yAxis}
          />
          <Tooltip
          cursor={{
            stroke: 'rgba(255, 255, 255, 0.5)',        
            strokeWidth: 1,          
            strokeDasharray: '2 2'   
          }}
            labelFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: period === '1D' ? '2-digit' : undefined,
                minute: period === '1D' ? '2-digit' : undefined,
                hour12: period === '1D' ? true : undefined
              });
            }}
            formatter={(value) => [`${value.toFixed(2)}`, 'Price']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '13px',
              fontFamily: 'Geist, sans-serif',
              fontWeight: '700',
            }}
          />
          <Line
            type="linear"
            dataKey="c"
            stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
            dot={false}
            strokeWidth={2}
            animationDuration={300}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
      
    </div>
  );
};

const StockDashboard = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  const [symbol, setSymbol] = useState('TSLA');
  const [previousClose, setPreviousClose] = useState(null);

  const fetchPreviousClose = async (symbol, currentDate) => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    // Handle weekends
    while (prevDate.getDay() === 0 || prevDate.getDay() === 6) {
      prevDate.setDate(prevDate.getDate() - 1);
    }
    
    const formatDateForAPI = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const prevDateStr = formatDateForAPI(prevDate);
    
    try {
      const data = await fetchAlpacaStockData(symbol, prevDateStr, prevDateStr, '1Day');
      return data.length > 0 ? data[data.length - 1].c : null;
    } catch (error) {
      console.error('Error fetching previous close:', error);
      return null;
    }
  };

  const loadStockData = async (period) => {
    try {
      setLoading(true);
      setError(null);
      
      const config = TIME_PERIODS[period];
      
      const now = new Date();
      const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
      
      let startDate, endDate;
      
      if (period === '1D') {
        const now = new Date();
        const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        
        endDate = new Date(easternTime);
        startDate = new Date(easternTime);
        
        // Check if markets are open or if it's a trading day
        const currentHour = easternTime.getHours();
        const currentMinute = easternTime.getMinutes();
        const isAfterMarketOpen = currentHour > 9 || (currentHour === 9 && currentMinute >= 30);
        const dayOfWeek = endDate.getDay(); // 0 = Sunday, 6 = Saturday
        
        // If it's weekend, go back to last Friday
        if (dayOfWeek === 0) { // Sunday
          endDate.setDate(endDate.getDate() - 2); // Go to Friday
          startDate.setDate(startDate.getDate() - 2);
        } else if (dayOfWeek === 6) { // Saturday
          endDate.setDate(endDate.getDate() - 1); // Go to Friday
          startDate.setDate(startDate.getDate() - 1);
        } else if (!isAfterMarketOpen) {
          // If it's before market open on a weekday, use previous trading day
          endDate.setDate(endDate.getDate() - 1);
          startDate.setDate(startDate.getDate() - 1);
          
          // Make sure we didn't land on a weekend
          const newDayOfWeek = endDate.getDay();
          if (newDayOfWeek === 0) { // Sunday, go to Friday
            endDate.setDate(endDate.getDate() - 2);
            startDate.setDate(startDate.getDate() - 2);
          } else if (newDayOfWeek === 6) { // Saturday, go to Friday
            endDate.setDate(endDate.getDate() - 1);
            startDate.setDate(startDate.getDate() - 1);
          }
        }
        
        startDate.setHours(8, 30, 0, 0);
        endDate.setHours(15, 0, 0, 0);
        
      } else if (period === '5D') {
        const now = new Date();
        const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));

        endDate = new Date(easternTime);

        // Find the last trading day
        let dayOfWeek = endDate.getDay();
        const currentHour = easternTime.getHours();
        const currentMinute = easternTime.getMinutes();
        const isAfterMarketOpen = currentHour > 9 || (currentHour === 9 && currentMinute >= 30);
        const isBeforeMarketClose = currentHour < 16;
        const isMarketHours = isAfterMarketOpen && isBeforeMarketClose;

        if (dayOfWeek === 0) { // Sunday
          endDate.setDate(endDate.getDate() - 2);
        } else if (dayOfWeek === 6) { // Saturday
          endDate.setDate(endDate.getDate() - 1);
        }

        // Count back trading days
        startDate = new Date(endDate);
        let tradingDaysFound = 0;

        // If it's a trading day and market hours, current day counts as 1
        const isCurrentDayTrading = (dayOfWeek >= 1 && dayOfWeek <= 5) && isMarketHours;
        const targetDays = isCurrentDayTrading ? 4 : 5; // Need 4 more days if today counts

        while (tradingDaysFound < targetDays) {
          startDate.setDate(startDate.getDate() - 1);
          const day = startDate.getDay();
          if (day !== 0 && day !== 6) { // Not weekend
            tradingDaysFound++;
          }
        }

        startDate.setHours(8, 30, 0, 0);
        endDate.setHours(15, 0, 0, 0);
                      
      } else {
        endDate = new Date(easternTime);
        startDate = new Date(easternTime);
        startDate.setDate(startDate.getDate() - config.days);
      }
      
      const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);
      
      console.log(`Fetching ${period} data from ${startDateStr} to ${endDateStr}`);
      console.log(`Current Eastern Time:`, easternTime.toLocaleString());
      
      const data = await fetchAlpacaStockData(symbol, startDateStr, endDateStr, config.timeframe);
      setStockData(data);

      // For 1D period, also fetch previous trading day's close
      if (period === '1D') {
        const prevClose = await fetchPreviousClose(symbol, startDate);
        setPreviousClose(prevClose);
      } else {
        setPreviousClose(null);
      }
    } catch (err) {
      setError('Failed to fetch stock data. Please check your API credentials.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockData(selectedPeriod);
  }, [selectedPeriod, symbol]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Stock Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-red-500">
          </p>
          <button
            onClick={() => loadStockData(selectedPeriod)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {loading ? (
        <div className="flex items-center justify-center p-12 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading {TIME_PERIODS[selectedPeriod]?.label} data...</span>
        </div>
      ) : (
        <StockChart 
          data={stockData} 
          title={`Tesla (${symbol})`}
          period={selectedPeriod}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          loading={loading}
          previousClose={previousClose}
        />
      )}
    </div>
  );
};

export default StockDashboard;