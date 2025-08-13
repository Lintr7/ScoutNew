import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const companiesList = [
  "3M", "A. O. Smith", "Abbott Laboratories", "AbbVie", "Accenture", "Adobe Inc.", "Advanced Micro Devices", "AES Corporation", "Aflac", "Agilent Technologies", "Air Products", "Airbnb", "Akamai Technologies", "Albemarle Corporation", "Alexandria Real Estate Equities", "Align Technology", "Allegion", "Alliant Energy", "Allstate", "Alphabet Inc.(Class A)", "Alphabet Inc.(Class C)", "Altria", "Amazon", "Amcor", "Ameren", "American Electric Power", "American Express", "American International Group", "American Tower", "American Water Works", "Ameriprise Financial", "Ametek", "Amgen", "Amphenol", "Analog Devices", "Ansys", "Aon", "APA Corporation", "Apollo Global Management", "Apple Inc.", "Applied Materials", "Aptiv", "Arch Capital Group", "Archer Daniels Midland", "Arista Networks", "Arthur J. Gallagher & Co.", "Assurant", "AT&T", "Atmos Energy", "Autodesk", "Automatic Data Processing", "AutoZone", "AvalonBay Communities", "Avery Dennison", "Axon Enterprise", "Baker Hughes", "Ball Corporation", "Bank of America", "Baxter International", "Becton Dickinson", "Berkshire Hathaway", "Best Buy", "Bio-Techne", "Biogen", "BlackRock", "Blackstone Inc.", "BNY Mellon", "Boeing", "Booking Holdings", "BorgWarner", "Boston Scientific", "Bristol Myers Squibb", "Broadcom", "Broadridge Financial Solutions", "Brown & Brown", "Brown–Forman", "Builders FirstSource", "Bunge Global", "BXP, Inc.", "C.H. Robinson", "Cadence Design Systems", "Caesars Entertainment", "Camden Property Trust", "Campbell Soup Company", "Camping World", "Capital One", "Cardinal Health", "CarMax", "Carnival", "Carrier Global", "Caterpillar Inc.", "Cboe Global Markets", "CBRE Group", "CDW", "Celanese", "Cencora", "Centene Corporation", "CenterPoint Energy", "CF Industries", "Charles River Laboratories", "Charles Schwab Corporation", "Charter Communications", "Chevron Corporation", "Chipotle Mexican Grill", "Chubb Limited", "Church & Dwight", "Cigna", "Cincinnati Financial", "Cintas", "Cisco", "Citigroup", "Citizens Financial Group", "Clorox", "CME Group", "CMS Energy", "Coca-Cola Company (The)", "Cognizant", "Colgate-Palmolive", "Comcast", "Conagra Brands", "ConocoPhillips", "Consolidated Edison", "Constellation Brands", "Constellation Energy", "Cooper Companies (The)", "Copart", "Corning Inc.", "Corpay", "Corteva", "CoStar Group", "Costco", "Coterra", "CrowdStrike", "Crown Castle", "CSX Corporation", "Cummins", "CVS Health", "Danaher Corporation", "Darden Restaurants", "DaVita", "Dayforce", "Deckers Brands", "Deere & Company", "Dell Technologies", "Delta Air Lines", "Devon Energy", "Dexcom", "Diamondback Energy", "Digital Realty", "Discover Financial", "Dollar General", "Dollar Tree", "Dominion Energy", "Domino's", "Dover Corporation", "Dow Inc.", "D. R. Horton", "DTE Energy", "Duke Energy", "DuPont", "Eastman Chemical Company", "Eaton Corporation", "eBay", "Ecolab", "Edison International", "Edwards Lifesciences", "Electronic Arts", "Elevance Health", "Emerson Electric", "Enphase Energy", "Entergy", "EOG Resources", "EPAM Systems", "EQT Corporation", "Equifax", "Equinix", "Equity Residential", "Erie Indemnity", "Essex Property Trust", "Estée Lauder Companies (The)", "Everest Group", "Evergy", "Eversource Energy", "Exelon", "Expedia Group", "Expeditors International", "Extra Space Storage", "ExxonMobil", "F5, Inc.", "FactSet", "Fair Isaac", "Fastenal", "Federal Realty Investment Trust", "FedEx", "Fidelity National Information Services", "Fifth Third Bancorp", "First Solar", "FirstEnergy", "Fiserv", "FMC Corporation", "Ford Motor Company", "Fortinet", "Fortive", "Fox Corporation(Class A)", "Fox Corporation(Class B)", "Franklin Resources", "Freeport-McMoRan", "Garmin", "Gartner", "GE Aerospace", "GE HealthCare", "GE Vernova", "Gen Digital", "Generac", "General Dynamics", "General Mills", "General Motors", "Genuine Parts Company", "Gilead Sciences", "Global Payments", "Globe Life", "GoDaddy", "Goldman Sachs", "Halliburton", "Hartford (The)", "Hasbro", "HCA Healthcare", "Healthpeak Properties", "Henry Schein", "Hershey Company (The)", "Hess Corporation", "Hewlett Packard Enterprise", "Hilton Worldwide", "Hologic", "Home Depot (The)", "Honeywell", "Hormel Foods", "Host Hotels & Resorts", "Howmet Aerospace", "HP Inc.", "Hubbell Incorporated", "Humana", "Huntington Bancshares", "Huntington Ingalls Industries", "IBM", "IDEX Corporation", "Idexx Laboratories", "Illinois Tool Works", "Incyte", "Ingersoll Rand", "Insulet Corporation", "Intel", "Intercontinental Exchange", "International Flavors & Fragrances", "International Paper", "Interpublic Group of Companies (The)", "Intuit", "Intuitive Surgical", "Invesco", "Invitation Homes", "IQVIA", "Iron Mountain", "J.B. Hunt", "Jabil", "Jack Henry & Associates", "Jacobs Solutions", "Johnson & Johnson", "Johnson Controls", "JPMorgan Chase", "Juniper Networks", "Kellanova", "Kenvue", "Keurig Dr Pepper", "KeyCorp", "Keysight Technologies", "Kimberly-Clark", "Kimco Realty", "Kinder Morgan", "KKR", "KLA Corporation", "Kraft Heinz", "Kroger", "L3Harris", "LabCorp", "Lam Research", "Lamb Weston", "Las Vegas Sands", "Leidos", "Lennar", "Lennox International", "Lilly (Eli)", "Linde plc", "Live Nation Entertainment", "LKQ Corporation", "Lockheed Martin", "Loews Corporation", "Lowe's", "Lululemon Athletica", "LyondellBasell", "M&T Bank", "Marathon Petroleum", "MarketAxess", "Marriott International", "Marsh McLennan", "Martin Marietta Materials", "Masco", "Mastercard", "Match Group", "McCormick & Company", "McDonald's", "McKesson Corporation", "Medtronic", "Merck & Co.", "Meta Platforms", "MetLife", "Mettler Toledo", "MGM Resorts", "Microchip Technology", "Micron Technology", "Microsoft", "Mid-America Apartment Communities", "Moderna", "Mohawk Industries", "Molina Healthcare", "Molson Coors Beverage Company", "Mondelez International", "Monolithic Power Systems", "Monster Beverage", "Moody's Corporation", "Morgan Stanley", "Mosaic Company (The)", "Motorola Solutions", "MSCI", "Nasdaq, Inc.", "NetApp", "Netflix", "Newmont", "News Corp(Class A)", "News Corp(Class B)", "NextEra Energy", "Nike, Inc.", "NiSource", "Nordson Corporation", "Norfolk Southern Railway", "Northern Trust", "Northrop Grumman", "Norwegian Cruise Line Holdings", "NRG Energy", "Nucor", "Nvidia", "NVR, Inc.", "NXP Semiconductors", "O'Reilly Auto Parts", "Occidental Petroleum", "Old Dominion", "Omnicom Group", "ON Semiconductor", "ONEOK", "Oracle Corporation", "Otis Worldwide", "Paccar", "Packaging Corporation of America", "Palantir Technologies", "Palo Alto Networks", "Paramount Global", "Parker Hannifin", "Paychex", "Paycom", "PayPal", "Pentair", "PepsiCo", "Pfizer", "PG&E Corporation", "Philip Morris International", "Phillips 66", "Pinnacle West", "PNC Financial Services", "Pool Corporation", "PPG Industries", "PPL Corporation", "Principal Financial Group", "Procter & Gamble", "Progressive Corporation", "Prologis", "Prudential Financial", "Public Service Enterprise Group", "PTC Inc.", "Public Storage", "PulteGroup", "Quanta Services", "Qualcomm", "Quest Diagnostics", "Ralph Lauren Corporation", "Raymond James Financial", "RTX Corporation", "Realty Income", "Regency Centers", "Regeneron Pharmaceuticals", "Regions Financial Corporation", "Republic Services", "ResMed", "Revvity", "Rockwell Automation", "Rollins, Inc.", "Roper Technologies", "Ross Stores", "Royal Caribbean Group", "S&P Global", "Salesforce", "Schlumberger", "Scripps Networks", "Seagate Technology", "Sherwin-Williams", "Skechers", "Skyworks Solutions", "Slumberger", "Smith & Nephew", "Southern Company", "Southwest Airlines", "Stanley Black & Decker", "State Street Corporation", "Stryker", "SVB Financial", "Synchrony Financial", "Sysco", "T-Mobile", "Take-Two Interactive", "Target", "Teledyne Technologies", "Texas Instruments", "Tesla, Inc.", "Teradyne", "Thermo Fisher Scientific", "Tractor Supply", "Trane Technologies", "TransDigm", "Tyson Foods", "Union Pacific", "United Parcel Service", "UnitedHealth Group", "Universal Health Services", "V.F. Corporation", "Valero Energy", "Verisign", "Verizon Communications", "Vertex Pharmaceuticals", "Viatris", "Visa", "Vornado Realty", "W.W. Grainger", "Walgreens Boots Alliance", "Waste Management", "Wells Fargo", "West Pharmaceutical Services", "Wheaton Precious Metals", "Williams Companies", "Wynn Resorts", "Xcel Energy", "Xilinx", "Yum! Brands", "Zebra Technologies", "Zimmer Biomet"
];

function Sentiment() {
  const [query, setQuery] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [sentiment, setSentiment] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.length > 0) {
      const filtered = companiesList.filter((company) =>
        company.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies([]);
    }
  }, [query]);

  const handleSelectCompany = (company) => {
    setQuery(company);
    setFilteredCompanies([]);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setSentiment("");
    setRecommendation("");

    try {
      const response = await fetch('http://127.0.0.1:5000/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
            company: query.trim() 
        })
      });


      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Server error. Try again.");
        return;
      }

      const result = await response.json();
      setSentiment(result.sentiment);

      const match = result.sentiment.match(/average sentiment score:\s*([\d.]+)/i);
      if (match) {
        const avgScore = parseFloat(match[1]);
        if (avgScore >= 8) {
          setRecommendation("🚀 You should BUY.");
        } else if (avgScore < 4) {
          setRecommendation("⚠️ You should SELL.");
        } else {
          setRecommendation("🤔 You should HOLD if you own it, or don’t buy yet.");
        }
      }
    } catch (err) {
      setError(`Server error. Try again.${err}`);
    }

    setLoading(false);
  };

  return (
      <div style={styles.card}>
        <h2 style={styles.title}>📊 Stock Sentiment Analysis</h2>
        <p style={styles.description}>
          Get AI-driven sentiment analysis for stocks based on recent news.
        </p>  
        <p style={{ fontWeight: '600', fontSize: '1.2em' }}>
          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div style={styles.inputContainer}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter company name..."
            style={styles.input}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? "🔍 Searching..." : "Search"}
          </button>
        </div>

        {/* Dynamic Dropdown */}
        {filteredCompanies.length > 0 && (
          <ul style={styles.dropdown}>
            {filteredCompanies.map((company, index) => (
              <li key={index} onClick={() => handleSelectCompany(company)} style={styles.dropdownItem}>
                {company}
              </li>
            ))}
          </ul>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {sentiment && (
          <div style={styles.resultBox}>
            <h3 style={styles.resultTitle}>Sentiment Analysis:</h3>
            <p style={styles.resultText}><ReactMarkdown components={{
          ul: ({ children }) => <div>{children}</div>, 
        }}>{sentiment}</ReactMarkdown></p>
            <p style={styles.recommendation}>{recommendation}</p>
          </div>
        )}
      </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    maxWidth: "550px",
    width: "100%",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "8px",
  },
  description: {
    fontSize: "16px",
    color: "#475569",
    marginBottom: "20px",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    position: "relative",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    transition: "0.3s",
  },
  buttonDisabled: {
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: "#94a3b8",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#ffffff",
    width: "20%", // Reduced width
    borderRadius: "8px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    maxHeight: "200px",
    overflowY: "auto",
    listStyle: "none",
    padding: "0",
    marginTop: "2px",
    border: "1px solid #e2e8f0",
    zIndex: 1000,
    left: "35%", // Centering dropdown under input
  },
  dropdownItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#fff",
  },
  dropdownItemHover: {
    backgroundColor: "#f3f4f6",
  },
  error: {
    color: "red",
    marginTop: "12px",
  },
  resultBox: {
    marginTop: "20px",
    backgroundColor: "#f1f5f9",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.05)",
  },
  resultTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#334155",
  },
  resultText: {
    fontSize: "16px",
    color: "#475569",
  },
  recommendation: {
    marginTop: "8px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2563eb",
  },
};

export default Sentiment;
