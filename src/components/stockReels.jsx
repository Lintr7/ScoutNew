import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BentoGridSecondDemo } from "./bentoBox";
import { BentoGridThirdDemo } from './ui/bentoBox3';
import { User } from 'lucide-react';


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

  // Handle clicks outside the dropdown
  const containerRef = useRef(null);
  const lastSwipeTime = useRef(0); // Track when the last swipe occurred
  const wheelAccum = useRef(0);
  const gestureEndTimer = useRef(null);

  const WHEEL_THRESHOLD = 100;     
  const WHEEL_GESTURE_TIMEOUT = 80;
  const ANIMATION_MS = 600;       
  const SWIPE_COOLDOWN_MS = 1000; // 1000ms cooldown between swipes
  const SMALL_THRESHOLD = 5; 

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
    { symbol: "FCEL", name: "FuelCell Energy" },
    { symbol: "KLAC", name: "KLA" },
    { symbol: "FTNT", name: "Fortinet" },
    { symbol: "ALGN", name: "Align Technology" },
    { symbol: "ABNB", name: "Airbnb" },
    { symbol: "PNC", name: "PNC Financial Services Group" },
    { symbol: "RBLX", name: "Roblox" },
    { symbol: "PANW", name: "Palo Alto Networks" },
    { symbol: "RCL", name: "Royal Caribbean Group" },
    { symbol: "FAST", name: "Fastenal" },
    { symbol: "KMI", name: "Kinder Morgan" },
    { symbol: "CTAS", name: "Cintas" },
    { symbol: "EIX", name: "Edison International" },
    { symbol: "HCA", name: "HCA Healthcare" },
    { symbol: "PTON", name: "Peloton Interactive" },
    { symbol: "NEE", name: "NextEra Energy" },
    { symbol: "MU", name: "Micron Technology" },
    { symbol: "VLO", name: "Valero Energy" },
    { symbol: "USB", name: "U.S. Bancorp" },
    { symbol: "HLT", name: "Hilton Worldwide Holdings" },
    { symbol: "LYFT", name: "Lyft" },
    { symbol: "EMR", name: "Emerson Electric" },
    { symbol: "IRM", name: "Iron Mountain" },
    { symbol: "AIG", name: "American International Group" },
    { symbol: "BMY", name: "Bristol-Myers Squibb" },
    { symbol: "EOG", name: "EOG Resources" },
    { symbol: "MCK", name: "McKesson" },
    { symbol: "ECL", name: "Ecolab" },
    { symbol: "GILD", name: "Gilead Sciences" },
    { symbol: "VRTX", name: "Vertex Pharmaceuticals" },
    { symbol: "MNST", name: "Monster Beverage" },
    { symbol: "SPG", name: "Simon Property Group" },
    { symbol: "WDAY", name: "Workday" },
    { symbol: "ZM", name: "Zoom Video Communications" },
    { symbol: "BIIB", name: "Biogen" },
    { symbol: "NEM", name: "Newmont" },
    { symbol: "LHX", name: "L3Harris Technologies" },
    { symbol: "LIN", name: "Linde" },
    { symbol: "VICI", name: "VICI Properties" },
    { symbol: "ITW", name: "Illinois Tool Works" },
    { symbol: "REGN", name: "Regeneron Pharmaceuticals" },
    { symbol: "AXON", name: "Axon Enterprise" },
    { symbol: "CDNS", name: "Cadence Design Systems" },
    { symbol: "AMAT", name: "Applied Materials" },
    { symbol: "PLUG", name: "Plug Power" },
    { symbol: "FCX", name: "Freeport-McMoRan" },
    { symbol: "DLTR", name: "Dollar Tree" },
    { symbol: "ROKU", name: "Roku" },
    { symbol: "AEP", name: "American Electric Power" },
    { symbol: "TDG", name: "TransDigm Group" },
    { symbol: "ADI", name: "Analog Devices" },
    { symbol: "CEG", name: "Constellation Energy" },
    { symbol: "PSX", name: "Phillips 66" },
    { symbol: "BP", name: "BP" },
    { symbol: "SLB", name: "Schlumberger" },
    { symbol: "PH", name: "Parker-Hannifin" },
    { symbol: "WM", name: "Waste Management" },
    { symbol: "COIN", name: "Coinbase Global" },
    { symbol: "AOS", name: "A. O. Smith" },
    { symbol: "BABA", name: "Alibaba Group" },
    { symbol: "UBER", name: "Uber Technologies" },
    { symbol: "OXY", name: "Occidental Petroleum" },
    { symbol: "FHN", name: "First Horizon" },
    { symbol: "ENPH", name: "Enphase Energy" },
    { symbol: "APH", name: "Amphenol" },
    { symbol: "SYK", name: "Stryker" },
    { symbol: "BYND", name: "Beyond Meat" },
    { symbol: "BDX", name: "Becton, Dickinson" },
    { symbol: "ACN", name: "Accenture" },
    { symbol: "NOC", name: "Northrop Grumman" },
    { symbol: "COP", name: "ConocoPhillips" },
    { symbol: "DASH", name: "DoorDash" },
    { symbol: "KKR", name: "KKR" },
    { symbol: "MSI", name: "Motorola Solutions" },
    { symbol: "ETR", name: "Entergy" },
    { symbol: "HAL", name: "Halliburton" },
    { symbol: "UNP", name: "Union Pacific" },
    { symbol: "TT", name: "Trane Technologies" },
    { symbol: "HBAN", name: "Huntington Bancshares" },
    { symbol: "FSLR", name: "First Solar" },
    { symbol: "CRWD", name: "CrowdStrike" },
    { symbol: "MET", name: "MetLife" },
    { symbol: "SHOP", name: "Shopify" },
    { symbol: "DOCU", name: "DocuSign" },
    { symbol: "PSA", name: "Public Storage" },
    { symbol: "ADSK", name: "Autodesk" },
    { symbol: "CMI", name: "Cummins" },
    { symbol: "RSG", name: "Republic Services" },
    { symbol: "OKTA", name: "Okta" },
    { symbol: "ETN", name: "Eaton" },
    { symbol: "AMD", name: "Advanced Micro Devices" },
    { symbol: "MCO", name: "Moody's" },
    { symbol: "BKR", name: "Baker Hughes" },
    { symbol: "ICE", name: "Intercontinental Exchange" },
    { symbol: "AVGO", name: "Broadcom" },
    { symbol: "BX", name: "Blackstone" },
    { symbol: "APP", name: "AppLovin" },
    { symbol: "AFL", name: "Aflac" },
    { symbol: "PLD", name: "Prologis" },
    { symbol: "NXPI", name: "NXP Semiconductors" },
    { symbol: "SNPS", name: "Synopsys" },
    { symbol: "TRV", name: "Travelers" },
    { symbol: "LRCX", name: "Lam Research" },
    { symbol: "AZO", name: "AutoZone" },
    { symbol: "DXCM", name: "DexCom" },
    { symbol: "EQR", name: "Equity Residential" },
    { symbol: "ANET", name: "Arista Networks" },
    { symbol: "IP", name: "International Paper" },
    { symbol: "AMT", name: "American Tower" },
    { symbol: "MELI", name: "MercadoLibre" },
    { symbol: "COF", name: "Capital One Financial" },
    { symbol: "HWM", name: "Howmet Aerospace" },
    { symbol: "TEL", name: "TE Connectivity" },
    { symbol: "HOOD", name: "Robinhood Markets" },
    { symbol: "AJG", name: "Arthur J. Gallagher" },
    { symbol: "APD", name: "Air Products and Chemicals" },
    { symbol: "GD", name: "General Dynamics" },
    { symbol: "ESS", name: "Essex Property Trust" },
    { symbol: "SHEL", name: "Shell" },   
    { symbol: "XYZ", name: "Block" },
    { symbol: "LI", name: "Li Auto" },
    { symbol: "ALLE", name: "Allegion" },
    { symbol: "XPEV", name: "XPeng" },
    { symbol: "TTD", name: "The Trade Desk" },
    { symbol: "CMG", name: "Chipotle Mexican Grill" },
    { symbol: "CI", name: "Cigna Group" },
    { symbol: "DLR", name: "Digital Realty Trust" },
    { symbol: "MPC", name: "Marathon Petroleum" },
    { symbol: "SNAP", name: "Snap" },
    { symbol: "AVB", name: "AvalonBay Communities" },
    { symbol: "BSX", name: "Boston Scientific" },
    { symbol: "STX", name: "Seagate Technology" },
    { symbol: "CMA", name: "Comerica" },
    { symbol: "EXPE", name: "Expedia Group" },
    { symbol: "ELV", name: "Elevance Health" },   
    { symbol: "SCHW", name: "Charles Schwab" },
    { symbol: "CMCSA", name: "Comcast" },
    { symbol: "GLW", name: "Corning" },
    { symbol: "DELL", name: "Dell Technologies" },
    { symbol: "TFC", name: "Truist Financial" },
    { symbol: "VST", name: "Vistra" },
    { symbol: "URI", name: "United Rentals" },
    { symbol: "GEV", name: "GE Vernova" },
    { symbol: "WMB", name: "Williams Companies" },
    { symbol: "TMUS", name: "T-Mobile US" },
    { symbol: "APO", name: "Apollo Global Management" },
    { symbol: "FI", name: "Fiserv" },
    { symbol: "PWR", name: "Quanta Services" },
    { symbol: "SRE", name: "Sempra Energy" },
    { symbol: "DDOG", name: "Datadog" },
    { symbol: "SMCI", name: "Super Micro Computer" },
    { symbol: "FICO", name: "Fair Isaac" },
    { symbol: "MPWR", name: "Monolithic Power Systems" },
    { symbol: "YUM", name: "Yum! Brands" },
    { symbol: "HSY", name: "Hershey Company" },
    { symbol: "CCL", name: "Carnival" },
    { symbol: "CHTR", name: "Charter Communications" },
    { symbol: "STT", name: "State Street Corporation" },
    { symbol: "MTB", name: "M&T Bank" },
    { symbol: "CTSH", name: "Cognizant" },
    { symbol: "SNOW", name: "Snowflake" },
    { symbol: "MDB", name: "MongoDB" },
    { symbol: "ASML", name: "ASML" },
    { symbol: "SPOT", name: "Spotify" },
    { symbol: "LULU", name: "Lululemon" },
    { symbol: "ULTA", name: "Ulta Beauty" },
    { symbol: "DKNG", name: "DraftKings" },
    { symbol: "DPZ", name: "Domino's Pizza" },
    { symbol: "PRU", name: "Prudential Financial" },
    { symbol: "MRNA", name: "Moderna" },
    { symbol: "BNTX", name: "BioNTech" },
    { symbol: "LNG", name: "Cheniere Energy" },
    { symbol: "DD", name: "DuPont de Nemours" },
    { symbol: "MRVL", name: "Marvell Technology" },
    { symbol: "ARM", name: "Arm Holdings" },
    { symbol: "FIG", name: "Figma" },
    { symbol: "TEAM", name: "Atlassian" },
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

  // Random Reel Function
  const daySeed = useMemo(() => {
    return new Date().toISOString().slice(0, 10)
      .split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  }, []); // Empty dependency - calculates once per mount

  const getShuffledCompanies = (seed) => {
    const shuffled = [...companies];
    let currentSeed = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      currentSeed = (currentSeed * 1664525 + 1013904223) >>> 0;
      const j = currentSeed % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Create shuffled array once per day - MEMOIZED
  const shuffledCompanies = useMemo(() => {
    return getShuffledCompanies(daySeed);
  }, [daySeed]); // Only recalculates if daySeed changes

  const getCurrentCompany = (index) => {
    return shuffledCompanies[index % shuffledCompanies.length];
  };

  /*
  const getCurrentCompany = (index) => {
    let s = index + 1;
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return companies[(s >>> 0) % companies.length];
  };
  const getCurrentCompany = (index) => {
    const seed = (index * 1664525 + 1013904223) >>> 0;
    const randomIndex = seed % companies.length;
    return companies[randomIndex];
  };
  */
  

  const currentCompany = getCurrentCompany(currentIndex);
  const nextCompany = getCurrentCompany(currentIndex + 1);
  const [cooldownActive, setCooldownActive] = useState(false);

  const swipeToNext = () => {
    const now = Date.now();
    
    // Check if 1000ms have passed since the last swipe
    if (now - lastSwipeTime.current < SWIPE_COOLDOWN_MS) {
      // console.log(`Swipe blocked. ${SWIPE_COOLDOWN_MS - (now - lastSwipeTime.current)}ms remaining`);
      return; // Block the swipe
    }
    
    // Record this swipe time
    lastSwipeTime.current = now;
    
    // Start the swipe
    setIsAnimating(true);
    setCooldownActive(true); 
    
    // Clear any wheel accumulation
    wheelAccum.current = 0;
    if (gestureEndTimer.current) {
      clearTimeout(gestureEndTimer.current);
      gestureEndTimer.current = null;
    }

    // Update index and stop animation after ANIMATION_MS
    setTimeout(() => {
      setCurrentIndex((p) => p + 1);
      setIsAnimating(false);
    }, ANIMATION_MS + 100);
    
    // Re-enable button after SWIPE_COOLDOWN_MS
    setTimeout(() => {
      setCooldownActive(false);
    }, SWIPE_COOLDOWN_MS);
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

  const handleArrowClick = () => {
    swipeToNext();
  };


  return (
    <div
      ref={containerRef}
      className="reels"
      style={{ position: 'relative', overflow: 'hidden', height: '100dvh', width: '100dvw', maxWidth: '100dvw', maxHeight: '100dvh'}}
    >
      <div className="hidden md:block" style={{ 
          backgroundColor: 'rgb(1,3,33)', 
          width: '100%', 
          position: 'absolute', 
          top: '0em', 
          height: '48px', 
          borderTopLeftRadius: '1rem',
          zIndex: '1',
        }}></div>
      <style>
        {`
          @keyframes synchronizedSwipe {
            from { transform: translateY(0); }
            to   { transform: translateY(-100vh); }
          }
          
          @keyframes floatUpDown {
            0% { 
              transform: translateX(-50%) translateY(0);
            }
            50% { 
              transform: translateX(-50%) translateY(-5px);
            }
            100% { 
              transform: translateX(-50%) translateY(0);
            }
          }
        `}
      </style>
      


      {/*
      <img src="logoScout.png" style={{top: '5px', left: '15px', position: 'absolute', height: '38px', width: '38px', userSelect: 'none', zIndex: '51'}}/>
      */}
      <div
        key={`current-${currentIndex}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',  // Changed from minHeight
          width: '100vw',   // Added explicit width
          position: 'absolute',
          overflow: 'hidden', // Prevent scrollbars
          animation: isAnimating ? `synchronizedSwipe ${ANIMATION_MS}ms ease-out forwards` : 'none'
        }}
      >
        
        <div style={{display: 'flex', justifyContent:'center', alignItems: 'center',  marginRight: '2em'}} className="bento-scale-wrapper">
          <BentoGridThirdDemo
            companySymbol={currentCompany.symbol}
            companyName={currentCompany.name}
          />
        </div>
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
       <div style={{display: 'flex', justifyContent:'center', alignItems: 'center',  marginRight: '2em'}} className="bento-scale-wrapper">
          <BentoGridThirdDemo
            companySymbol={nextCompany.symbol}
            companyName={nextCompany.name}
          />
        </div>
      </div>

      {/* down arrow */}
      <div
        onClick={handleArrowClick}
        style={{
          position: 'fixed',
          bottom: '1.35em',
          left: '50%',
          width: '35px',
          height: '35px',
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
          opacity: cooldownActive ? 0.5 : 1,
          pointerEvents: cooldownActive ? 'none' : 'auto',
          animation: 'floatUpDown 2s ease-in-out infinite',
          animationPlayState: cooldownActive ? 'paused' : 'running'
        }}
      >
        <div style={{
          width: '9px',
          height: '9px',
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