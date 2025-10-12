"use client"
import { PlaceholdersAndVanishInput } from "../components/ui/searchComponent";
import { BentoGridThirdDemo } from "../components/ui/bentoBox3";
import { TypewriterEffectSmooth } from "../components/ui/typewriterEffect";
import { ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from "react";
import { LayoutTextFlip } from "../components/ui/layout-text-flip";
import { motion } from "framer-motion";

const searchSuggestions = [
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
  { symbol: "EXC", name: "Exelon" },
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
  { symbol: "WELL", name: "Welltower" },
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
  { symbol: "DTE", name: "DTE Energy" },
  { symbol: "VICI", name: "VICI Properties" },
  { symbol: "ITW", name: "Illinois Tool Works" },
  { symbol: "REGN", name: "Regeneron Pharmaceuticals" },
  { symbol: "AXON", name: "Axon Enterprise" },
  { symbol: "CDNS", name: "Cadence Design Systems" },
  { symbol: "ZTS", name: "Zoetis" },
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
  { symbol: "PPL", name: "PPL" },
  { symbol: "ACN", name: "Accenture" },
  { symbol: "NOC", name: "Northrop Grumman" },
  { symbol: "COP", name: "ConocoPhillips" },
  { symbol: "DASH", name: "DoorDash" },
  { symbol: "KKR", name: "KKR" },
  { symbol: "ORLY", name: "O'Reilly Automotive" },
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
  { symbol: "TXT", name: "Textron" },
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
  { symbol: "ROK", name: "Rockwell Automation" },
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
  { symbol: "CTSH", name: "Cognizant" }
];

function SearchStock() {
  const [searchValue, setSearchValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const placeholders = [
    "Search for Apple...",
    "Search for Tesla...",
    "Search for Microsoft...",
    "Search for Amazon...",
    "Search for Meta...",
    "Search for Google...",
    "Search for NVIDIA...",
  ];

  const words = [
    {
      text: "Search",
    },
    {
      text: "any",
    },
    {
      text: "company",
    },
    {
      text: "with",
    },
    {
      text: "Scout.",
      className: "text-purple-400",
    },
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setSelectedIndex(-1);
    console.log(value);

    if (value.trim() === '') {
      setFilteredSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Filter suggestions based on company name or symbol
    const filtered = searchSuggestions.filter(stock =>
      stock.name.toLowerCase().includes(value.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);

    setFilteredSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", searchValue);
    setShowDropdown(false);
    
    // If a suggestion is highlighted, use it
    if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
      setSelectedStock(filteredSuggestions[selectedIndex]);
      return;
    }
    
    // Find the stock that matches the search value
    const matchedStock = searchSuggestions.find(stock => 
      stock.name.toLowerCase() === searchValue.toLowerCase() ||
      stock.symbol.toLowerCase() === searchValue.toLowerCase()
    );
    
    if (matchedStock) {
      setSelectedStock(matchedStock);
    }
  };

  const handleSuggestionClick = (stock) => {
    setSearchValue(stock.name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    // Keep focus on input so user can press Enter
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.focus();
      }
    }, 0);
  };

  return(
    <div style={{overflowX: 'hidden', position: 'relative', backgroundColor: 'rgb(1,3,33)', width: '100%', height: '100dvh', overflow:'hidden'}}>
      {!selectedStock ? (
        <div className="h-[40rem] flex flex-col justify-center items-center px-4">
          <h2 style={{marginTop: '-1.7em', position: 'absolute'}} className="typing bg-gradient-to-b from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-7xl font-medium tracking-tight text-transparent md:text-7xl">
            <TypewriterEffectSmooth words={words} />
          </h2>
          <div style={{position: 'absolute'}} >
            <motion.div className="relative mx-4 my-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
              <LayoutTextFlip
                text="Analyze "
                words={[
                  { text: "Apple", image: "/slide5.png" }, 
                  { text: "Tesla", image: "/slide3.png" }, 
                  { text: "Microsoft", image: "/microsoftLogo.png" }, 
                  { text: "Amazon", image: "/amazonLogo.png" },
                  { text: "Meta", image: "/metaLogo.png" }, 
                  { text: "Google", image: "/googleLogo.png" }, 
                  { text: "NVIDIA", image: "/nvidiaLogo.png" }, 
                ]}
              />
            </motion.div>
          </div>
          <div className="search-bar" style={{marginTop: '20em', position: 'absolute', width: '100%'}}>
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={handleSubmit}
              value={searchValue}
            />
            
            {showDropdown && (
              <div ref={dropdownRef} 
              className="w-110 sm:w-110 md:w-110 lg:w-full xl:w-full"
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: '600px',
                marginTop: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000
              }}>
                {filteredSuggestions.map((stock, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(stock)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: idx < filteredSuggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.6)' : 'none',
                      transition: 'background-color 0.2s',
                      backgroundColor: selectedIndex === idx ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedIndex === idx ? 'rgba(255, 255, 255, 0.2)' : 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'white', fontSize: '14px' }}>{stock.name}</span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', fontWeight: 'bold' }}>{stock.symbol}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', position: 'relative', marginRight: '2em'}}>
          <button
            onClick={() => {
              setSelectedStock(null);
              setSearchValue('');
            }}
            className="mobile-button2"
            style={{
              position: 'absolute',
              height: '40px',
              width: '40px',
              top: '4em',
              left: '1em',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="bento-scale-wrapper3">
            <BentoGridThirdDemo companySymbol={selectedStock.symbol} companyName={selectedStock.name} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchStock;