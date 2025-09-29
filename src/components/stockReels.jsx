import React, { useState, useRef, useEffect } from 'react';
import { BentoGridSecondDemo } from "./bentoBox";
import { BentoGridThirdDemo } from './ui/bentoBox3';

function StockReels() {
  // Initialize currentIndex from localStorage or default to 0
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('stockReelsCurrentIndex');
        return saved ? parseInt(saved, 10) : 0;
      } catch (error) {
        console.warn('Error reading from localStorage:', error);
        return 0;
      }
    }
    return 0;
  });
  
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef(null);
  const lastSwipeTime = useRef(0); // Track when the last swipe occurred
  const wheelAccum = useRef(0);
  const gestureEndTimer = useRef(null);

  const WHEEL_THRESHOLD = 100;     
  const WHEEL_GESTURE_TIMEOUT = 80;
  const ANIMATION_MS = 600;       
  const SWIPE_COOLDOWN_MS = 1000; // 1000ms cooldown between swipes
  const SMALL_THRESHOLD = 5; 

  // Array of companies to cycle through
  const companies = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "GOOGL", name: "Alphabet" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "TSLA", name: "Tesla" },
    { symbol: "AMZN", name: "Amazon" },
    { symbol: "META", name: "Meta" },
    { symbol: "NVDA", name: "NVIDIA" },
    { symbol: "NFLX", name: "Netflix" },
    { symbol: "JPM", name: "JPMorgan Chase" },
    { symbol: "BAC", name: "Bank of America" },
    { symbol: "V", name: "Visa" },
    { symbol: "MA", name: "Mastercard" },
    { symbol: "GS", name: "Goldman Sachs" },
    { symbol: "MS", name: "Morgan Stanley" },
    { symbol: "DIS", name: "Walt Disney" },
    { symbol: "WMT", name: "Walmart" },
    { symbol: "PEP", name: "PepsiCo" },
    { symbol: "KO", name: "Coca-Cola" },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "PFE", name: "Pfizer" },
    { symbol: "XOM", name: "Exxon Mobil" },
    { symbol: "CSCO", name: "Cisco Systems" },
    { symbol: "C", name: "Citigroup" },
    { symbol: "WFC", name: "Wells Fargo" },
    { symbol: "CVX", name: "Chevron" },
    { symbol: "BRK.B", name: "Berkshire Hathaway" },
    { symbol: "UNH", name: "UnitedHealth Group" },
    { symbol: "PG", name: "Procter & Gamble" },
    { symbol: "HD", name: "Home Depot" },
    { symbol: "ORCL", name: "Oracle" },
    { symbol: "ADBE", name: "Adobe" },
    { symbol: "CRM", name: "Salesforce" },
    { symbol: "INTC", name: "Intel" },
    { symbol: "COST", name: "Costco" },
    { symbol: "MCD", name: "McDonald's" },
    { symbol: "NKE", name: "Nike" },
    { symbol: "ABT", name: "Abbott Laboratories" },
    { symbol: "MRK", name: "Merck & Co." },
    { symbol: "T", name: "AT&T" },
    { symbol: "VZ", name: "Verizon" },
    { symbol: "LLY", name: "Eli Lilly" },
    { symbol: "ABBV", name: "AbbVie" },
    { symbol: "QCOM", name: "Qualcomm" },
    { symbol: "IBM", name: "IBM" },
    { symbol: "TXN", name: "Texas Instruments" },
    { symbol: "HON", name: "Honeywell" },
    { symbol: "BA", name: "Boeing" },
    { symbol: "GE", name: "General Electric" },
    { symbol: "CAT", name: "Caterpillar" },
    { symbol: "UPS", name: "United Parcel Service" },
    { symbol: "CVS", name: "CVS Health" },
    { symbol: "MDT", name: "Medtronic" },
    { symbol: "LOW", name: "Lowe's" },
    { symbol: "PM", name: "Philip Morris International" },
    { symbol: "SPGI", name: "S&P Global" },
    { symbol: "AXP", name: "American Express" },
    { symbol: "DE", name: "Deere & Company" },
    { symbol: "AMGN", name: "Amgen" },
    { symbol: "MDLZ", name: "Mondelez International" },
    { symbol: "PYPL", name: "PayPal" },
    { symbol: "SBUX", name: "Starbucks" },
    { symbol: "TGT", name: "Target" },
    { symbol: "GM", name: "General Motors" },
    { symbol: "F", name: "Ford Motor" },
    { symbol: "DAL", name: "Delta Air Lines" },
    { symbol: "LUV", name: "Southwest Airlines" },
    { symbol: "BLK", name: "BlackRock" },
    { symbol: "MMM", name: "3M" },
    { symbol: "MO", name: "Altria Group" },
    { symbol: "KHC", name: "Kraft Heinz" },
    { symbol: "GIS", name: "General Mills" },
    { symbol: "KMB", name: "Kimberly-Clark" },
    { symbol: "CL", name: "Colgate-Palmolive" },
    { symbol: "PLTR", name: "Palantir Technologies" },
    { symbol: "INTU", name: "Intuit" },
    { symbol: "NOW", name: "ServiceNow" },
    { symbol: "ADP", name: "Automatic Data Processing" },
    { symbol: "ISRG", name: "Intuitive Surgical" },
    { symbol: "BKNG", name: "Booking Holdings" },
    { symbol: "PGR", name: "Progressive" },
    { symbol: "LMT", name: "Lockheed Martin" },
    { symbol: "RTX", name: "Raytheon Technologies" },
    { symbol: "DUK", name: "Duke Energy" },
    { symbol: "SO", name: "Southern Company" },
    { symbol: "GMAB", name: "Genmab" },
    { symbol: "EL", name: "Estée Lauder" },
    { symbol: "SHW", name: "Sherwin-Williams" },
    { symbol: "TJX", name: "TJX Companies" },
    { symbol: "BK", name: "Bank of New York Mellon" },
    { symbol: "FDX", name: "FedEx" },
    { symbol: "MAR", name: "Marriott International" },
    { symbol: "CME", name: "CME Group" },
    { symbol: "TMO", name: "Thermo Fisher Scientific" },
    { symbol: "DHR", name: "Danaher" },
    { symbol: "EQIX", name: "Equinix" },
    { symbol: "CSX", name: "CSX Corporation" },
    { symbol: "NSC", name: "Norfolk Southern" },
    { symbol: "HUM", name: "Humana" },
    { symbol: "AON", name: "Aon" },
    { symbol: "MMC", name: "Marsh & McLennan" },
    { symbol: "CB", name: "Chubb" },
    { symbol: "ALL", name: "Allstate" },
  ];

  // Save to localStorage whenever currentIndex changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('stockReelsCurrentIndex', currentIndex.toString());
      } catch (error) {
        console.warn('Error saving to localStorage:', error);
      }
    }
  }, [currentIndex]);

  // Deterministic pseudo-random selection based on index
  const getCurrentCompany = (index) => {
    const seed = (index * 1664525 + 1013904223) >>> 0; // Use unsigned 32-bit
    const randomIndex = seed % companies.length;
    return companies[randomIndex];
  };

  const currentCompany = getCurrentCompany(currentIndex);
  const nextCompany = getCurrentCompany(currentIndex + 1);

  const swipeToNext = () => {
    const now = Date.now();
    
    // Check if 1000ms have passed since the last swipe
    if (now - lastSwipeTime.current < SWIPE_COOLDOWN_MS) {
      console.log(`Swipe blocked. ${SWIPE_COOLDOWN_MS - (now - lastSwipeTime.current)}ms remaining`);
      return; // Block the swipe
    }
    
    // Record this swipe time
    lastSwipeTime.current = now;
    
    // Start the swipe
    setIsAnimating(true);
    
    // Clear any wheel accumulation
    wheelAccum.current = 0;
    if (gestureEndTimer.current) {
      clearTimeout(gestureEndTimer.current);
      gestureEndTimer.current = null;
    }

    // Handle the animation and state update
    setTimeout(() => {
      setCurrentIndex((p) => p + 1);
      setIsAnimating(false);
    }, ANIMATION_MS);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();

      // Check if we're still in cooldown period
      const now = Date.now();
      if (now - lastSwipeTime.current < SWIPE_COOLDOWN_MS) {
        return; // Block all wheel events during cooldown
      }

      if (Math.abs(e.deltaY) < SMALL_THRESHOLD) return;
      wheelAccum.current += e.deltaY;

      if (gestureEndTimer.current) {
        clearTimeout(gestureEndTimer.current);
      }
      
      gestureEndTimer.current = setTimeout(() => {
        wheelAccum.current = 0;
        gestureEndTimer.current = null;
      }, WHEEL_GESTURE_TIMEOUT);

      if (Math.abs(wheelAccum.current) >= WHEEL_THRESHOLD) {
        if (wheelAccum.current > 0) {
          if (gestureEndTimer.current) {
            clearTimeout(gestureEndTimer.current);
            gestureEndTimer.current = null;
          }
          swipeToNext();
        } else {
          wheelAccum.current = 0;
        }
      }
    };

    const onKey = (ev) => {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        swipeToNext();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('keydown', onKey);
    el.setAttribute('tabindex', '0');
    el.style.outline = 'none';

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('keydown', onKey);
      if (gestureEndTimer.current) {
        clearTimeout(gestureEndTimer.current);
        gestureEndTimer.current = null;
      }
    };
  }, []); 

  const isInCooldown = () => {
    return Date.now() - lastSwipeTime.current < SWIPE_COOLDOWN_MS;
  };

  const handleArrowClick = () => {
    swipeToNext();
  };

  return (
    <div
      ref={containerRef}
      className="reels"
      style={{ position: 'relative', overflow: 'hidden', height: '100vh' }}
    >
      <style>
        {`
          @keyframes synchronizedSwipe {
            from { transform: translateY(0); }
            to   { transform: translateY(-100vh); }
          }
        `}
      </style>

      <div
        key={`current-${currentIndex}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          position: 'relative',
          animation: isAnimating ? `synchronizedSwipe ${ANIMATION_MS}ms ease-out forwards` : 'none'
        }}
      >
        <BentoGridThirdDemo 
          companySymbol={currentCompany.symbol}
          companyName={currentCompany.name}
        />
      </div>

      <div
        key={`next-${currentIndex + 1}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          position: 'absolute',
          top: '100vh',
          left: 0,
          right: 0,
          animation: isAnimating ? `synchronizedSwipe ${ANIMATION_MS}ms ease-out forwards` : 'none'
        }}
      >
        <BentoGridThirdDemo 
          companySymbol={nextCompany.symbol}
          companyName={nextCompany.name}
        />
      </div>

      {/* down arrow */}
      <div
        onClick={handleArrowClick}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '30px',
          height: '30px',
          border: '2px solid white',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          background: 'rgba(173, 216, 230, 0.1)',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          transition: 'all 0.3s ease',
          opacity: isInCooldown() ? 0.5 : 1,
          pointerEvents: isInCooldown() ? 'none' : 'auto'
        }}
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRight: '2px solid white',
          borderBottom: '2px solid white',
          transform: 'rotate(45deg)',
          marginTop: '-3px'
        }} />
      </div>
      {/* 
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        color: 'white',
        fontSize: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '10px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)'
      }}>
        Reel: {currentIndex + 1} - {getCurrentCompany(currentIndex).name}
      </div>
      */}
    </div>
  );
}

export default StockReels;