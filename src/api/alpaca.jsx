import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

const TIME_PERIODS = {
  '1D': { days: 1, timeframe: '5Min', label: '1 Day' },
  '5D': { days: 5, timeframe: '15Min', label: '5 Days' },
  '1M': { days: 30, timeframe: '1Hour', label: '1 Month' },
  '6M': { days: 180, timeframe: '1Day', label: '6 Months' },
  '1Y': { days: 365, timeframe: '1Day', label: '1 Year' },
  '5Y': { days: 1825, timeframe: '1Week', label: '5 Years' }
};

const fetchAlpacaStockData = async (symbol, start, end, timeframe) => {
  try {
    const response = await fetch(`https://scoutnew-production.up.railway.app/stocks/${symbol}?start=${start}&end=${end}&timeframe=${timeframe}`);
    
    if (!response.ok) {
      // Log the actual error response
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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


// Helper function to check if market is currently open
const isMarketOpen = (easternTime) => {
  const day = easternTime.getDay();
  const hour = easternTime.getHours();
  const minute = easternTime.getMinutes();
  
  // Not a weekday
  if (day === 0 || day === 6) return false;
  
  // Before 9:30 AM
  if (hour < 9 || (hour === 9 && minute < 30)) return false;
  
  // After 4:00 PM
  if (hour >= 16) return false;
  
  return true;
};

// Helper function to filter data to market hours only
const filterToMarketHours = (data) => {
  return data.filter(point => {
    const date = new Date(point.t);
    const easternTime = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const hour = easternTime.getHours();
    const minute = easternTime.getMinutes();
    
    // Keep data between 9:30 AM and 4:00 PM ET (inclusive of 4:00 PM)
    return (hour > 9 || (hour === 9 && minute >= 30)) && (hour < 16 || (hour === 16 && minute === 0));
  });
};

const TimePeriodToggle = ({ selectedPeriod, onPeriodChange, loading }) => {
  const periods = Object.keys(TIME_PERIODS);
  
  return (
    <div style={{fontFamily: 'Geist, sans-serif', position: 'absolute', marginTop: '0.4em'}}className="flex gap-1 overflow-x-hidden">
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

const StockChart = ({ data, title, period, selectedPeriod, onPeriodChange, loading, previousClose, logo, industry }) => {
  // Filter data to market hours for 1D and 5D periods
  const filteredData = (period === '1D' || period === '5D') ? filterToMarketHours(data) : data;

  // Calculate dynamic Y-axis range for more dramatic visualization
  const calculateYAxisDomain = () => {
    if (!filteredData || filteredData.length === 0) return ['dataMin - 5', 'dataMax + 5'];
    
    const prices = filteredData.map(d => d.c);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Use a smaller padding for dramatic effect - only 10-20% of the actual range
    let padding;
    if (period === '1D') {
      // For 1D, use very tight padding (5% of range, minimum $0.50)
      padding = Math.max(priceRange * 0.05, 0.5);
    } else if (period === '5D') {
      // For 5D, use moderate padding (8% of range, minimum $1)
      padding = Math.max(priceRange * 0.08, 1);
    } else {
      // For longer periods, use slightly more padding (15% of range)
      padding = Math.max(priceRange * 0.15, priceRange * 0.1);
    }
    
    return [minPrice - padding, maxPrice + padding];
  };

  const formatTick = (timestamp) => {
    const date = new Date(timestamp);
    
    switch (period) {
      case '1D':
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/New_York'
        });
      case '5D':
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          hour: 'numeric',
          hour12: true,
          timeZone: 'America/New_York'
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
    if (filteredData.length <= 100) return filteredData;
    const sampleRate = Math.ceil(filteredData.length / 100);
    return filteredData.filter((_, index) => index % sampleRate === 0);
  };

  const sampledData = getSampledData();

  const firstPrice = filteredData[0]?.c || 0;
  const lastPrice = filteredData[filteredData.length - 1]?.c || 0;
  
  // For 1D period, use previous trading day's close, otherwise use first price of current period
  const basePrice = (period === '1D' && previousClose !== null) ? previousClose : firstPrice;
  const priceChange = lastPrice - basePrice;
  const priceChangePercent = basePrice !== 0 ? (priceChange / basePrice) * 100 : 0;

  const yAxisDomain = calculateYAxisDomain();

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
      domain: yAxisDomain,
      tick: { fontSize: 11, fill: 'hsla(0, 0%, 85%, 1)', fontFamily: 'Geist, sans-serif' },
      axisLine: { stroke: false },  
      tickLine: { stroke: false },
      tickFormatter: (value) => `${value.toFixed(2)}`,
      width: 70
    }
  };

  const [isFavorited, setIsFavorited] = useState(false);

  const handleClick = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <div style={{ marginTop: '-1.3em'}}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start w-full">
          <div>
            <div style={{ marginLeft: '-1em' }} className="flex items-center gap-2 overflow-hidden">
              <img
                src={logo}
                style={{ width: "42px", height: "42px", flexShrink: 0 }}
                alt="logo"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <h3
                  className="text-2xl text-purple-400 font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ fontFamily: 'Geist, sans-serif' }}
                >
                  {title}
                </h3>
                <h3 style={{marginTop: '-0.3em'}} className="text-sm text-purple-100 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                  {industry}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-0.5">
              <span style={{ marginLeft: '-0.5em' }} className="text-2xl font-bold font-mono text-white">
                ${lastPrice.toFixed(2)}
              </span>
              <span style={{ fontFamily: 'Geist, sans-serif', marginTop: '0.3em', marginLeft: '-0.5em'}} className={`text-sm font-medium ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-600'
              }`}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div style={{marginTop: '0.5em'}} className="flex flex-col items-end gap-2 whitespace-nowrap ml-auto">
            <button
              onClick={handleClick}
              className="z-10 transition-all hover:scale-105 active:scale-100 cursor-pointer"
              aria-label={isFavorited ? "Unfavorite" : "Favorite"}
            >
              <Star
                size={26}
                className={isFavorited ? "fill-yellow-400 text-yellow-400" : "text-yellow-400"}
              />
            </button>
            <TimePeriodToggle 
              selectedPeriod={selectedPeriod}
              onPeriodChange={onPeriodChange}
              loading={loading}
            />
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="111%" height={315} style={{marginLeft: '-1.9em', marginTop:'-0.9em'}}>
        <AreaChart 
          data={sampledData} 
          margin={{ top: 5, right: 30, left: 0, bottom: 100 }}
          key="static-chart" 
        >
          <defs>
            <linearGradient id="priceGradientGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="priceGradientRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
                hour12: period === '1D' ? true : undefined,
                timeZone: 'America/New_York'
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
          <Area
            type="linear"
            dataKey="c"
            stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
            fill={priceChange >= 0 ? 'url(#priceGradientGreen)' : 'url(#priceGradientRed)'}
            strokeWidth={2}
            animationDuration={300}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
      
    </div>
  );
};

const StockDashboard = ({ symbol = 'AAPL', companyName = 'Apple Inc.', className, industry, logo }) => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  // const [symbol, setSymbol] = useState('GOOG');
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
        endDate = new Date(easternTime);
        startDate = new Date(easternTime);
        
        // Check if it's a weekend
        const dayOfWeek = endDate.getDay();
        const currentHour = easternTime.getHours();
        const currentMinute = easternTime.getMinutes();
        
        if (dayOfWeek === 0) { // Sunday - use Friday
          endDate.setDate(endDate.getDate() - 2);
          startDate.setDate(startDate.getDate() - 2);
          // Full trading day
          startDate.setHours(9, 30, 0, 0);
          endDate.setHours(16, 0, 0, 0);
        } else if (dayOfWeek === 6) { // Saturday - use Friday
          endDate.setDate(endDate.getDate() - 1);
          startDate.setDate(startDate.getDate() - 1);
          // Full trading day
          startDate.setHours(9, 30, 0, 0);
          endDate.setHours(16, 0, 0, 0);
        } else if (currentHour < 9 || (currentHour === 9 && currentMinute < 30)) {
          // Weekday before market open - use previous trading day
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
          // Full trading day
          startDate.setHours(9, 30, 0, 0);
          endDate.setHours(16, 0, 0, 0);
        } else {
          // It's a trading day - show today's data
          startDate.setHours(9, 30, 0, 0);
          
          if (isMarketOpen(easternTime)) {
            // Market is open - show up to current time
            endDate = new Date(easternTime);
          } else {
            // Market is closed but it's a trading day - show full day
            endDate.setHours(16, 0, 0, 0);
          }
        }
        
      } else if (period === '5D') {
        const now = new Date();
        const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        
        endDate = new Date(easternTime);
        
        // If it's weekend, move to Friday
        let dayOfWeek = endDate.getDay();
        if (dayOfWeek === 0) { // Sunday
          endDate.setDate(endDate.getDate() - 2);
        } else if (dayOfWeek === 6) { // Saturday
          endDate.setDate(endDate.getDate() - 1);
        }

        // Set end time
        if (isMarketOpen(easternTime) && (dayOfWeek >= 1 && dayOfWeek <= 5)) {
          // Market is open - use current time
          endDate = new Date(easternTime);
        } else {
          // Market closed or weekend - use market close time
          endDate.setHours(16, 0, 0, 0);
        }

        // Find the 5 most recent trading days (including today if it's a trading day)
        const tradingDays = [];
        let currentDate = new Date(endDate);
        
        // If today is a trading day, include it
        const todayIsTrading = (currentDate.getDay() >= 1 && currentDate.getDay() <= 5);
        if (todayIsTrading) {
          tradingDays.push(new Date(currentDate));
        }
        
        // Find the remaining days to make 5 total
        while (tradingDays.length < 5) {
          currentDate.setDate(currentDate.getDate() - 1);
          const day = currentDate.getDay();
          if (day !== 0 && day !== 6) { // Not weekend
            tradingDays.push(new Date(currentDate));
          }
        }
        
        // Start date is the earliest of the 5 trading days
        startDate = new Date(tradingDays[tradingDays.length - 1]);
        startDate.setHours(9, 30, 0, 0);
                      
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
      console.log(`Market Open:`, isMarketOpen(easternTime));
      if (period === '5D') {
        console.log(`Trading days range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
      }
      
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
    
    // Set up auto-refresh for 1D when market is open
    let refreshInterval;
    if (selectedPeriod === '1D') {
      const now = new Date();
      const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
      
      if (isMarketOpen(easternTime)) {
        // Refresh every 5 minutes when market is open
        refreshInterval = setInterval(() => {
          loadStockData('1D');
        }, 5 * 60 * 1000); // 5 minutes
      }
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
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
          title={`${companyName} (${symbol})`}
          period={selectedPeriod}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          loading={loading}
          previousClose={previousClose}
          logo = {logo}
          industry = {industry}
        />
      )}
    </div>
  );
};

export default StockDashboard;