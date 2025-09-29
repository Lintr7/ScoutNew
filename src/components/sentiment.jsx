import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { EvervaultCard } from "./ui/cryptic";
import { HoverBorderGradientDemo } from "./ui/aceternityButton";
import { MovingBorderDemo } from "./ui/borderButton";

const companiesList = [
  "3M", "A. O. Smith", "Abbott Laboratories", "AbbVie", "Accenture", "Adobe Inc.", "Advanced Micro Devices", "AES Corporation", "Aflac", "Agilent Technologies", "Air Products", "Airbnb", "Akamai Technologies", "Albemarle Corporation", "Alexandria Real Estate Equities", "Align Technology", "Allegion", "Alliant Energy", "Allstate", "Alphabet Inc.(Class A)", "Alphabet Inc.(Class C)", "Altria", "Amazon", "Amcor", "Ameren", "American Electric Power", "American Express", "American International Group", "American Tower", "American Water Works", "Ameriprise Financial", "Ametek", "Amgen", "Amphenol", "Analog Devices", "Ansys", "Aon", "APA Corporation", "Apollo Global Management", "Apple Inc.", "Applied Materials", "Aptiv", "Arch Capital Group", "Archer Daniels Midland", "Arista Networks", "Arthur J. Gallagher & Co.", "Assurant", "AT&T", "Atmos Energy", "Autodesk", "Automatic Data Processing", "AutoZone", "AvalonBay Communities", "Avery Dennison", "Axon Enterprise", "Baker Hughes", "Ball Corporation", "Bank of America", "Baxter International", "Becton Dickinson", "Berkshire Hathaway", "Best Buy", "Bio-Techne", "Biogen", "BlackRock", "Blackstone Inc.", "BNY Mellon", "Boeing", "Booking Holdings", "BorgWarner", "Boston Scientific", "Bristol Myers Squibb", "Broadcom", "Broadridge Financial Solutions", "Brown & Brown", "Brown–Forman", "Builders FirstSource", "Bunge Global", "BXP, Inc.", "C.H. Robinson", "Cadence Design Systems", "Caesars Entertainment", "Camden Property Trust", "Campbell Soup Company", "Capital One", "Cardinal Health", "CarMax", "Carnival", "Carrier Global", "Caterpillar Inc.", "Cboe Global Markets", "CBRE Group", "CDW", "Celanese", "Cencora", "Centene Corporation", "CenterPoint Energy", "CF Industries", "Charles River Laboratories", "Charles Schwab Corporation", "Charter Communications", "Chevron Corporation", "Chipotle Mexican Grill", "Chubb Limited", "Church & Dwight", "Cigna", "Cincinnati Financial", "Cintas", "Cisco", "Citigroup", "Citizens Financial Group", "Clorox", "CME Group", "CMS Energy", "Coca-Cola Company (The)", "Cognizant", "Colgate-Palmolive", "Comcast", "Conagra Brands", "ConocoPhillips", "Consolidated Edison", "Constellation Brands", "Constellation Energy", "Cooper Companies (The)", "Copart", "Corning Inc.", "Corpay", "Corteva", "CoStar Group", "Costco", "Coterra", "CrowdStrike", "Crown Castle", "CSX Corporation", "Cummins", "CVS Health", "Danaher Corporation", "Darden Restaurants", "DaVita", "Dayforce", "Deckers Brands", "Deere & Company", "Dell Technologies", "Delta Air Lines", "Devon Energy", "Dexcom", "Diamondback Energy", "Digital Realty", "Discover Financial", "Dollar General", "Dollar Tree", "Dominion Energy", "Domino's", "Dover Corporation", "Dow Inc.", "D. R. Horton", "DTE Energy", "Duke Energy", "DuPont", "Eastman Chemical Company", "Eaton Corporation", "eBay", "Ecolab", "Edison International", "Edwards Lifesciences", "Electronic Arts", "Elevance Health", "Emerson Electric", "Enphase Energy", "Entergy", "EOG Resources", "EPAM Systems", "EQT Corporation", "Equifax", "Equinix", "Equity Residential", "Erie Indemnity", "Essex Property Trust", "Estée Lauder Companies (The)", "Everest Group", "Evergy", "Eversource Energy", "Exelon", "Expedia Group", "Expeditors International", "Extra Space Storage", "ExxonMobil", "F5, Inc.", "FactSet", "Fair Isaac", "Fastenal", "Federal Realty Investment Trust", "FedEx", "Fidelity National Information Services", "Fifth Third Bancorp", "First Solar", "FirstEnergy", "Fiserv", "FMC Corporation", "Ford Motor Company", "Fortinet", "Fortive", "Fox Corporation(Class A)", "Fox Corporation(Class B)", "Franklin Resources", "Freeport-McMoRan", "Garmin", "Gartner", "GE Aerospace", "GE HealthCare", "GE Vernova", "Gen Digital", "Generac", "General Dynamics", "General Mills", "General Motors", "Genuine Parts Company", "Gilead Sciences", "Global Payments", "Globe Life", "GoDaddy", "Goldman Sachs", "Google", "Halliburton", "Hartford (The)", "Hasbro", "HCA Healthcare", "Healthpeak Properties", "Henry Schein", "Hershey Company (The)", "Hess Corporation", "Hewlett Packard Enterprise", "Hilton Worldwide", "Hologic", "Home Depot (The)", "Honeywell", "Hormel Foods", "Host Hotels & Resorts", "Howmet Aerospace", "HP Inc.", "Hubbell Incorporated", "Humana", "Huntington Bancshares", "Huntington Ingalls Industries", "IBM", "IDEX Corporation", "Idexx Laboratories", "Illinois Tool Works", "Incyte", "Ingersoll Rand", "Insulet Corporation", "Intel", "Intercontinental Exchange", "International Flavors & Fragrances", "International Paper", "Interpublic Group of Companies (The)", "Intuit", "Intuitive Surgical", "Invesco", "Invitation Homes", "IQVIA", "Iron Mountain", "J.B. Hunt", "Jabil", "Jack Henry & Associates", "Jacobs Solutions", "Johnson & Johnson", "Johnson Controls", "JPMorgan Chase", "Juniper Networks", "Kellanova", "Kenvue", "Keurig Dr Pepper", "KeyCorp", "Keysight Technologies", "Kimberly-Clark", "Kimco Realty", "Kinder Morgan", "KKR", "KLA Corporation", "Kraft Heinz", "Kroger", "L3Harris", "LabCorp", "Lam Research", "Lamb Weston", "Las Vegas Sands", "Leidos", "Lennar", "Lennox International", "Lilly (Eli)", "Linde plc", "Live Nation Entertainment", "LKQ Corporation", "Lockheed Martin", "Loews Corporation", "Lowe's", "Lululemon Athletica", "LyondellBasell", "M&T Bank", "Marathon Petroleum", "MarketAxess", "Marriott International", "Marsh McLennan", "Martin Marietta Materials", "Masco", "Mastercard", "Match Group", "McCormick & Company", "McDonald's", "McKesson Corporation", "Medtronic", "Merck & Co.", "Meta Platforms", "MetLife", "Mettler Toledo", "MGM Resorts", "Microchip Technology", "Micron Technology", "Microsoft", "Mid-America Apartment Communities", "Moderna", "Mohawk Industries", "Molina Healthcare", "Molson Coors Beverage Company", "Mondelez International", "Monolithic Power Systems", "Monster Beverage", "Moody's Corporation", "Morgan Stanley", "Mosaic Company (The)", "Motorola Solutions", "MSCI", "Nasdaq, Inc.", "NetApp", "Netflix", "Newmont", "News Corp(Class A)", "News Corp(Class B)", "NextEra Energy", "Nike, Inc.", "NiSource", "Nordson Corporation", "Norfolk Southern Railway", "Northern Trust", "Northrop Grumman", "Norwegian Cruise Line Holdings", "NRG Energy", "Nucor", "Nvidia", "NVR, Inc.", "NXP Semiconductors", "O'Reilly Auto Parts", "Occidental Petroleum", "Old Dominion", "Omnicom Group", "ON Semiconductor", "ONEOK", "Oracle Corporation", "Otis Worldwide", "Paccar", "Packaging Corporation of America", "Palantir Technologies", "Palo Alto Networks", "Paramount Global", "Parker Hannifin", "Paychex", "Paycom", "PayPal", "Pentair", "PepsiCo", "Pfizer", "PG&E Corporation", "Philip Morris International", "Phillips 66", "Pinnacle West", "PNC Financial Services", "Pool Corporation", "PPG Industries", "PPL Corporation", "Principal Financial Group", "Procter & Gamble", "Progressive Corporation", "Prologis", "Prudential Financial", "Public Service Enterprise Group", "PTC Inc.", "Public Storage", "PulteGroup", "Quanta Services", "Qualcomm", "Quest Diagnostics", "Ralph Lauren Corporation", "Raymond James Financial", "RTX Corporation", "Realty Income", "Regency Centers", "Regeneron Pharmaceuticals", "Regions Financial Corporation", "Republic Services", "ResMed", "Revvity", "Rockwell Automation", "Rollins, Inc.", "Roper Technologies", "Ross Stores", "Royal Caribbean Group", "S&P Global", "Salesforce", "Schlumberger", "Scripps Networks", "Seagate Technology", "Sherwin-Williams", "Skechers", "Skyworks Solutions", "Slumberger", "Smith & Nephew", "Southern Company", "Southwest Airlines", "Stanley Black & Decker", "State Street Corporation", "Stryker", "SVB Financial", "Synchrony Financial", "Sysco", "T-Mobile", "Take-Two Interactive", "Target", "Teledyne Technologies", "Texas Instruments", "Tesla, Inc.", "Teradyne", "Thermo Fisher Scientific", "Tractor Supply", "Trane Technologies", "TransDigm", "Tyson Foods", "Union Pacific", "United Parcel Service", "UnitedHealth Group", "Universal Health Services", "V.F. Corporation", "Valero Energy", "Verisign", "Verizon Communications", "Vertex Pharmaceuticals", "Viatris", "Visa", "Vornado Realty", "W.W. Grainger", "Walgreens Boots Alliance", "Waste Management", "Wells Fargo", "West Pharmaceutical Services", "Wheaton Precious Metals", "Williams Companies", "Wynn Resorts", "Xcel Energy", "Xilinx", "Yum! Brands", "Zebra Technologies", "Zimmer Biomet"
];

const endpoint = 'https://scoutnew-production.up.railway.app/search';

const Sentiment = ({ symbol = 'AAPL', companyName = 'Apple' }) => {
  const [query, setQuery] = useState(companyName);
  const [sentiment, setSentiment] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (companyName) {
      setQuery(companyName);
      // Clear previous results when company changes
      setSentiment("");
      setRecommendation("");
      setError("");
    }
  }, [companyName]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a company name");
      return;
    }

    setLoading(true);
    setError("");
    setSentiment("");
    setRecommendation("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: query.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Server error. Try again.");
        return;
      }

      const result = await response.json();
      setSentiment(result.sentiment);

      const match = result.sentiment.match(/average sentiment score:\s*([\d.]+)/i);
      if (match) {
        const avgScore = parseFloat(match[1]);
        if (avgScore >= 8) {
          setRecommendation("🚀 Positive Overall Sentiment");
        } else if (avgScore <= 3) {
          setRecommendation("⚠️ Negative Overall Sentiment");
        } else {
          setRecommendation("🤔 Neutral Overall Sentiment");
        }
      }
    } catch (err) {
      setError(`Server error. Try again. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
        {!sentiment && (
          <>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transition = "all 0.5s ease 0.2s";
                e.target.style.background = "linear-gradient(135deg, #4f46e5 0%, #9333ea 90%)";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transition = "all 0.5s ease";
                e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 90%)";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            
            {loading ? "🔍 Searching..." : `Search ${companyName}`}
          </button>
          <div className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2 justify-center items-center mt-4">
            <EvervaultCard/>
          </div>
          </>
        )}
        {error && <p style={styles.error}>{error}</p>}

        {sentiment && (
          <div style={styles.resultBoxContainer}>
            <div style={styles.resultBox} className="always-scroll flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2">
              <h3 style={styles.resultTitle}>{companyName}:</h3>
              <div style={styles.resultText}>
                <ReactMarkdown 
                  components={{
                    ul: ({ children }) => <div>{children}</div>, 
                  }}
                >
                  {sentiment}
                </ReactMarkdown>
              </div>
              {recommendation && (
                <p style={styles.recommendation}>{recommendation}</p>
              )}
            </div>
          </div>
        )}
      </div>
  );
}

const styles = {
  container: {
    minHeight: "20vh",
    padding: "20px",
    display: "flex",
    position: 'relative',
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: '-1em',
  },  
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "32px",
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  input: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    zIndex: '100'
  },
  button: {
    padding: "10px 20px",
    marginTop: '1em',
    borderRadius: "18px",
    color: "#ffffff",
    fontSize: "clamp(10px, 1.2vw, 12px)",
    fontWeight: "600",
    position: 'absolute',
    border: "none",
    zIndex: '100',
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.9)",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
  },
  buttonDisabled: {
    padding: "10px 20px",
    marginTop: '1em',
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "clamp(10px, 1.2vw, 12px)",
    fontWeight: "600",
    position: 'absolute',
    border: "none",
    zIndex: '100',
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
    background: "transparent",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#ffffff",
    width: "calc(100% - 160px)",
    left: "0",
    borderRadius: "10px",
    boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
    maxHeight: "300px",
    overflowY: "auto",
    listStyle: "none",
    padding: "8px 0",
    margin: "4px 0 0 0",
    border: "1px solid #e2e8f0",
    zIndex: 1000,
    backdropFilter: "blur(10px)",
  },
  dropdownItem: {
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#fff",
    fontSize: "14px",
    color: "#374151",
    transition: "all 0.2s ease",
  },
  error: {
    color: "#ef4444",
    marginTop: "16px",
    backgroundColor: "#fef2f2",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    fontSize: "14px",
    fontWeight: "500",
  },
  resultBox: {
    marginTop: "0em",
    width: '250px',
    height: '211px',
    backgroundColor: "transparent",
    overflowY: "scroll",
    padding: "13px",
    borderRadius: "10px",
    textAlign: "left",
  },
  resultBoxContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
    position: 'relative', 
    marginTop: '1em', 
    backgroundColor: "rgba(96, 165, 250, 0.3)",
    width: '260px',
    height: '211px',
    borderRadius: "8px",
  },
  resultTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#c084fc",
    marginBottom: "16px",
    textAlign: "center",
  },
  resultText: {
    fontSize: "15px",
    color: "white",
    lineHeight: "1.7",
    marginBottom: "16px",
    textAlign: "left"
  },
  recommendation: {
    marginTop: "16px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    padding: "12px 16px",
    backgroundColor: "#27548A",
    borderRadius: "8px",
    border: "0px solid #224F85",
  },
};

export default Sentiment;