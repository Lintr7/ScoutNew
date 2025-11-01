from fastapi import HTTPException, Request
from datetime import datetime, timedelta
from starlette.middleware.base import BaseHTTPMiddleware
import asyncio
from fastapi.responses import JSONResponse 
from typing import Optional, Tuple

VALID_SYMBOLS = {
    'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX',
    'JPM', 'BAC', 'V', 'MA', 'GS', 'MS', 'DIS', 'WMT', 'PEP', 'KO',
    'JNJ', 'PFE', 'XOM', 'CSCO', 'C', 'WFC', 'CVX', 'UNH', 'PG', 'HD',
    'ORCL', 'ADBE', 'CRM', 'INTC', 'COST', 'MCD', 'NKE', 'ABT', 'MRK',
    'T', 'VZ', 'LLY', 'ABBV', 'QCOM', 'IBM', 'TXN', 'HON', 'BA', 'GE',
    'CAT', 'UPS', 'CVS', 'MDT', 'LOW', 'PM', 'SPGI', 'AXP', 'DE', 'AMGN',
    'MDLZ', 'PYPL', 'SBUX', 'TGT', 'GM', 'F', 'DAL', 'LUV', 'BLK', 'MMM',
    'MO', 'KHC', 'GIS', 'KMB', 'CL', 'PLTR', 'INTU', 'NOW', 'ADP', 'ISRG',
    'BKNG', 'PGR', 'LMT', 'RTX', 'DUK', 'SO', 'GMAB', 'EL', 'SHW', 'TJX',
    'BK', 'FDX', 'MAR', 'CME', 'TMO', 'DHR', 'EQIX', 'CSX', 'NSC', 'HUM',
    'AON', 'MMC', 'CB', 'ALL', 'KLAC', 'FTNT', 'ALGN', 'ABNB',
    'PNC', 'RBLX', 'PANW', 'RCL', 'FAST', 'KMI', 'CTAS', 'EIX', 'HCA',
    'PTON', 'NEE', 'MU', 'VLO', 'USB', 'HLT', 'LYFT', 'EMR', 'IRM', 'AIG',
    'BMY', 'EOG', 'MCK', 'ECL', 'GILD', 'VRTX', 'MNST', 'SPG',
    'WDAY', 'ZM', 'BIIB', 'NEM', 'LHX', 'LIN', 'VICI', 'ITW',
    'REGN', 'AXON', 'CDNS', 'AMAT', 'PLUG', 'FCX', 'DLTR', 'ROKU',
    'AEP', 'TDG', 'ADI', 'CEG', 'PSX', 'BP', 'SLB', 'PH', 'WM', 'COIN',
    'AOS', 'BABA', 'UBER', 'OXY', 'FHN', 'ENPH', 'APH', 'SYK', 'BYND',
    'BDX', 'PPL', 'ACN', 'NOC', 'COP', 'DASH', 'KKR', 'MSI', 'ETR', 'HAL',
    'UNP', 'TT', 'HBAN', 'FSLR', 'CRWD', 'MET', 'SHOP', 'DOCU', 'PSA',
    'ADSK', 'CMI', 'RSG', 'OKTA', 'ETN', 'AMD', 'MCO', 'BKR', 'ICE',
    'AVGO', 'BX', 'APP', 'AFL', 'PLD', 'NXPI', 'SNPS', 'TRV',
    'LRCX', 'AZO', 'DXCM', 'EQR', 'ANET', 'IP', 'AMT', 'MELI', 'COF',
    'HWM', 'TEL', 'HOOD', 'AJG', 'APD', 'GD', 'ESS', 'SHEL', 'XYZ', 'LI',
    'ALLE', 'XPEV', 'TTD', 'CMG', 'CI', 'DLR', 'MPC', 'SNAP', 'AVB',
    'BSX', 'STX', 'CMA', 'EXPE', 'ELV', 'SCHW', 'CMCSA', 'GLW', 'DELL',
    'TFC', 'VST', 'URI', 'GEV', 'WMB', 'TMUS', 'APO', 'FI', 'PWR', 'SRE',
    'DDOG', 'SMCI', 'FICO', 'MPWR', 'YUM', 'HSY', 'CCL', 'CHTR', 'STT',
    'MTB', 'CTSH', 'SNOW', 'MDB', 'ASML', 'SPOT', 'LULU', 'ULTA',
    'DKNG', 'DPZ', 'PRU', 'MRNA', 'BNTX', 'LNG', 'DD', 'MRVL', 'ARM',
    'FIG', 'TEAM', 'EXC', 'KR', 'D', 'OTIS', 'CARR', 'ROK', "RIVN", "SE", 
    "TWLO", "DG", "ROST", "BBY", "RL", "GPS", "ANF", "LEVI", "HII", "TDY", 
    "ZTS", "IDXX", "ILMN", "EW", "HOLX", "IR", "DOV", "FTV", "SWK", "WCC", 
    "SOFI", "ALLY", "RF", "KEY", "CFG", "FITB", "DVN", "APA", "O", "CCI", "WELL", 
    "INVH", "VTR", "GME", "AMC"
}

COMPANY_NAMES = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet',
    'MSFT': 'Microsoft',
    'TSLA': 'Tesla',
    'AMZN': 'Amazon',
    'META': 'Meta',
    'NVDA': 'NVIDIA',
    'NFLX': 'Netflix',
    'JPM': 'JPMorgan Chase',
    'BAC': 'Bank of America',
    'V': 'Visa',
    'MA': 'Mastercard',
    'GS': 'Goldman Sachs',
    'MS': 'Morgan Stanley',
    'DIS': 'Walt Disney',
    'WMT': 'Walmart',
    'PEP': 'PepsiCo',
    'KO': 'Coca-Cola',
    'JNJ': 'Johnson & Johnson',
    'PFE': 'Pfizer',
    'XOM': 'Exxon Mobil',
    'CSCO': 'Cisco Systems',
    'C': 'Citigroup',
    'WFC': 'Wells Fargo',
    'CVX': 'Chevron',
    'UNH': 'UnitedHealth Group',
    'PG': 'Procter & Gamble',
    'HD': 'Home Depot',
    'ORCL': 'Oracle',
    'ADBE': 'Adobe',
    'CRM': 'Salesforce',
    'INTC': 'Intel',
    'COST': 'Costco',
    'MCD': "McDonald's",
    'NKE': 'Nike',
    'ABT': 'Abbott Laboratories',
    'MRK': 'Merck & Co.',
    'T': 'AT&T',
    'VZ': 'Verizon',
    'LLY': 'Eli Lilly',
    'ABBV': 'AbbVie',
    'QCOM': 'Qualcomm',
    'IBM': 'IBM',
    'TXN': 'Texas Instruments',
    'HON': 'Honeywell',
    'BA': 'Boeing',
    'GE': 'General Electric',
    'CAT': 'Caterpillar',
    'UPS': 'United Parcel Service',
    'CVS': 'CVS Health',
    'MDT': 'Medtronic',
    'LOW': "Lowe's",
    'PM': 'Philip Morris International',
    'SPGI': 'S&P Global',
    'AXP': 'American Express',
    'DE': 'Deere & Company',
    'AMGN': 'Amgen',
    'MDLZ': 'Mondelez International',
    'PYPL': 'PayPal',
    'SBUX': 'Starbucks',
    'TGT': 'Target',
    'GM': 'General Motors',
    'F': 'Ford Motor',
    'DAL': 'Delta Air Lines',
    'LUV': 'Southwest Airlines',
    'BLK': 'BlackRock',
    'MMM': '3M',
    'MO': 'Altria Group',
    'KHC': 'Kraft Heinz',
    'GIS': 'General Mills',
    'KMB': 'Kimberly-Clark',
    'CL': 'Colgate-Palmolive',
    'PLTR': 'Palantir Technologies',
    'INTU': 'Intuit',
    'NOW': 'ServiceNow',
    'ADP': 'Automatic Data Processing',
    'ISRG': 'Intuitive Surgical',
    'BKNG': 'Booking Holdings',
    'PGR': 'Progressive',
    'LMT': 'Lockheed Martin',
    'RTX': 'Raytheon Technologies',
    'DUK': 'Duke Energy',
    'SO': 'Southern Company',
    'GMAB': 'Genmab',
    'EL': 'Estée Lauder',
    'SHW': 'Sherwin-Williams',
    'TJX': 'TJX Companies',
    'BK': 'Bank of New York Mellon',
    'FDX': 'FedEx',
    'MAR': 'Marriott International',
    'CME': 'CME Group',
    'TMO': 'Thermo Fisher Scientific',
    'DHR': 'Danaher',
    'EQIX': 'Equinix',
    'CSX': 'CSX Corporation',
    'NSC': 'Norfolk Southern',
    'HUM': 'Humana',
    'AON': 'Aon',
    'MMC': 'Marsh & McLennan',
    'CB': 'Chubb',
    'ALL': 'Allstate',
    'KLAC': 'KLA',
    'FTNT': 'Fortinet',
    'ALGN': 'Align Technology',
    'ABNB': 'Airbnb',
    'PNC': 'PNC Financial Services Group',
    'RBLX': 'Roblox',
    'PANW': 'Palo Alto Networks',
    'RCL': 'Royal Caribbean Group',
    'FAST': 'Fastenal',
    'KMI': 'Kinder Morgan',
    'CTAS': 'Cintas',
    'EIX': 'Edison International',
    'HCA': 'HCA Healthcare',
    'PTON': 'Peloton Interactive',
    'NEE': 'NextEra Energy',
    'MU': 'Micron Technology',
    'VLO': 'Valero Energy',
    'USB': 'U.S. Bancorp',
    'HLT': 'Hilton Worldwide Holdings',
    'LYFT': 'Lyft',
    'EMR': 'Emerson Electric',
    'IRM': 'Iron Mountain',
    'AIG': 'American International Group',
    'BMY': 'Bristol-Myers Squibb',
    'EOG': 'EOG Resources',
    'MCK': 'McKesson',
    'ECL': 'Ecolab',
    'GILD': 'Gilead Sciences',
    'VRTX': 'Vertex Pharmaceuticals',
    'MNST': 'Monster Beverage',
    'SPG': 'Simon Property Group',
    'WDAY': 'Workday',
    'ZM': 'Zoom Video Communications',
    'BIIB': 'Biogen',
    'NEM': 'Newmont',
    'LHX': 'L3Harris Technologies',
    'LIN': 'Linde',
    'VICI': 'VICI Properties',
    'ITW': 'Illinois Tool Works',
    'REGN': 'Regeneron Pharmaceuticals',
    'AXON': 'Axon Enterprise',
    'CDNS': 'Cadence Design Systems',
    'AMAT': 'Applied Materials',
    'PLUG': 'Plug Power',
    'FCX': 'Freeport-McMoRan',
    'DLTR': 'Dollar Tree',
    'ROKU': 'Roku',
    'AEP': 'American Electric Power',
    'TDG': 'TransDigm Group',
    'ADI': 'Analog Devices',
    'CEG': 'Constellation Energy',
    'PSX': 'Phillips 66',
    'BP': 'BP',
    'SLB': 'Schlumberger',
    'PH': 'Parker-Hannifin',
    'WM': 'Waste Management',
    'COIN': 'Coinbase Global',
    'AOS': 'A. O. Smith',
    'BABA': 'Alibaba Group',
    'UBER': 'Uber Technologies',
    'OXY': 'Occidental Petroleum',
    'FHN': 'First Horizon',
    'ENPH': 'Enphase Energy',
    'APH': 'Amphenol',
    'SYK': 'Stryker',
    'BYND': 'Beyond Meat',
    'BDX': 'Becton, Dickinson',
    'ACN': 'Accenture',
    'NOC': 'Northrop Grumman',
    'COP': 'ConocoPhillips',
    'DASH': 'DoorDash',
    'KKR': 'KKR',
    'MSI': 'Motorola Solutions',
    'ETR': 'Entergy',
    'HAL': 'Halliburton',
    'UNP': 'Union Pacific',
    'TT': 'Trane Technologies',
    'HBAN': 'Huntington Bancshares',
    'FSLR': 'First Solar',
    'CRWD': 'CrowdStrike',
    'MET': 'MetLife',
    'SHOP': 'Shopify',
    'DOCU': 'DocuSign',
    'PSA': 'Public Storage',
    'ADSK': 'Autodesk',
    'CMI': 'Cummins',
    'RSG': 'Republic Services',
    'OKTA': 'Okta',
    'ETN': 'Eaton',
    'AMD': 'Advanced Micro Devices',
    'MCO': "Moody's",
    'BKR': 'Baker Hughes',
    'ICE': 'Intercontinental Exchange',
    'AVGO': 'Broadcom',
    'BX': 'Blackstone',
    'APP': 'AppLovin',
    'AFL': 'Aflac',
    'PLD': 'Prologis',
    'NXPI': 'NXP Semiconductors',
    'SNPS': 'Synopsys',
    'TRV': 'Travelers',
    'LRCX': 'Lam Research',
    'AZO': 'AutoZone',
    'DXCM': 'DexCom',
    'EQR': 'Equity Residential',
    'ANET': 'Arista Networks',
    'IP': 'International Paper',
    'AMT': 'American Tower',
    'MELI': 'MercadoLibre',
    'COF': 'Capital One Financial',
    'HWM': 'Howmet Aerospace',
    'TEL': 'TE Connectivity',
    'HOOD': 'Robinhood Markets',
    'AJG': 'Arthur J. Gallagher',
    'APD': 'Air Products and Chemicals',
    'GD': 'General Dynamics',
    'ESS': 'Essex Property Trust',
    'SHEL': 'Shell',
    'XYZ': 'Block',
    'LI': 'Li Auto',
    'ALLE': 'Allegion',
    'XPEV': 'XPeng',
    'TTD': 'The Trade Desk',
    'CMG': 'Chipotle Mexican Grill',
    'CI': 'Cigna Group',
    'DLR': 'Digital Realty Trust',
    'MPC': 'Marathon Petroleum',
    'SNAP': 'Snap',
    'AVB': 'AvalonBay Communities',
    'BSX': 'Boston Scientific',
    'STX': 'Seagate Technology',
    'CMA': 'Comerica',
    'EXPE': 'Expedia Group',
    'ELV': 'Elevance Health',
    'SCHW': 'Charles Schwab',
    'CMCSA': 'Comcast',
    'GLW': 'Corning',
    'DELL': 'Dell Technologies',
    'TFC': 'Truist Financial',
    'VST': 'Vistra',
    'URI': 'United Rentals',
    'GEV': 'GE Vernova',
    'WMB': 'Williams Companies',
    'TMUS': 'T-Mobile US',
    'APO': 'Apollo Global Management',
    'FI': 'Fiserv',
    'PWR': 'Quanta Services',
    'SRE': 'Sempra Energy',
    'DDOG': 'Datadog',
    'SMCI': 'Super Micro Computer',
    'FICO': 'Fair Isaac',
    'MPWR': 'Monolithic Power Systems',
    'YUM': 'Yum! Brands',
    'HSY': 'Hershey Company',
    'CCL': 'Carnival',
    'CHTR': 'Charter Communications',
    'STT': 'State Street Corporation',
    'MTB': 'M&T Bank',
    'CTSH': 'Cognizant',
    'SNOW': 'Snowflake',
    'MDB': 'MongoDB',
    'ASML': 'ASML',
    'SPOT': 'Spotify',
    'LULU': 'Lululemon',
    'ULTA': 'Ulta Beauty',
    'DKNG': 'DraftKings',
    'DPZ': "Domino's Pizza",
    'PRU': 'Prudential Financial',
    'MRNA': 'Moderna',
    'BNTX': 'BioNTech',
    'LNG': 'Cheniere Energy',
    'DD': 'DuPont de Nemours',
    'MRVL': 'Marvell Technology',
    'ARM': 'Arm Holdings',
    'FIG': 'Figma',
    'TEAM': 'Atlassian',
    'EXC': 'Exelon Corporation',
    'KR': 'Kroger',
    'D': 'Dominion Energy',
    'OTIS': 'Otis Worldwide',
    'CARR': 'Carrier Global',
    'ROK': 'Rockwell Automation',
    "RIVN": "Rivian",
    "SE": "Sea Limited",
    "TWLO": "Twilio",
    "DG": "Dollar General",
    "ROST": "Ross Stores",
    "BBY": "Best Buy",
    "RL": "Ralph Lauren",
    "GPS": "Gap",
    "ANF": "Abercrombie & Fitch",
    "LEVI": "Levi Strauss",
    "HII": "Huntington Ingalls Industries",
    "TDY": "Teledyne Technologies",
    "ZTS": "Zoetis",
    "IDXX": "Idexx Laboratories",
    "ILMN": "Illumina",
    "EW": "Edwards Lifesciences",
    "HOLX": "Hologic",
    "IR": "Ingersoll Rand",
    "DOV": "Dover Corporation",
    "FTV": "Fortive",
    "SWK": "Stanley Black & Decker",
    "WCC": "Wesco International",
    "SOFI": "SoFi Technologies",
    "ALLY": "Ally Financial",
    "RF": "Regions Financial",
    "KEY": "KeyCorp",
    "CFG": "Citizens Financial",
    "FITB": "Fifth Third Bancorp",
    "DVN": "Devon Energy",
    "APA": "APA Corporation",
    "O": "Realty Income",
    "CCI": "Crown Castle",
    "WELL": "Welltower",
    "INVH": "Invitation Homes",
    "VTR": "Ventas",
    "GME": "GameStop",
    "AMC": "AMC Entertainment"
}

def validate_symbol(symbol: str) -> str:
    """Validate and normalize stock symbol"""
    symbol = symbol.strip().upper()
    
    if not symbol or len(symbol) > 5:
        raise HTTPException(status_code=400, detail="Invalid symbol format")
    
    if symbol not in VALID_SYMBOLS:
        raise HTTPException(
            status_code=404,
            detail=f"Symbol '{symbol}' not supported. We track {len(VALID_SYMBOLS)} companies."
        )
    
    return symbol

VALID_TIMEFRAMES = {'1Min', '5Min', '15Min', '1Hour', '1Day', '1Week'}

def validate_stocks_request(
    request: Request,
    symbol: str,
    start: str,
    end: str,
    timeframe: str
) -> tuple:
    """Validate stock data request parameters"""
    
    symbol = validate_symbol(symbol)
    now = datetime.now()
    
    try:
        start_date = datetime.strptime(start, '%Y-%m-%d')
        end_date = datetime.strptime(end, '%Y-%m-%d')
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    if start_date > now or end_date > now:
        raise HTTPException(status_code=400, detail="Cannot request future dates")
    
    max_past = now - timedelta(days=365*10)
    if start_date < max_past:
        raise HTTPException(status_code=400, detail="Start date too far in past (max 10 years)")
    
    if timeframe not in VALID_TIMEFRAMES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid timeframe. Must be one of: {', '.join(VALID_TIMEFRAMES)}"
        )
    
    return symbol, start, end, timeframe


def validate_news_request(
    request: Request,
    symbol: str,
    company_name: str
) -> tuple:
    """Validate news request and return canonical company name"""
    
    symbol = validate_symbol(symbol)
    
    canonical_name = COMPANY_NAMES.get(symbol)
    if not canonical_name:
        raise HTTPException(status_code=404, detail="Company name not found")
    
    return symbol, canonical_name


def validate_finnhub_request(
    request: Request,
    symbol: str,
    company_name: Optional[str] 
) -> Tuple[str, str]:
    """Validate Finnhub request and return canonical company name"""
    
    symbol = validate_symbol(symbol)
    
    canonical_name = COMPANY_NAMES.get(symbol, symbol)
    
    return symbol, canonical_name

VALID_COMPANY_NAMES = set(COMPANY_NAMES.values())

def validate_search_request(request: Request, company: str) -> str:
    """Validate search/sentiment request"""
    
    company = company.strip()
    
    if not company or len(company) < 2:
        raise HTTPException(status_code=400, detail="Company name too short")
    
    if len(company) > 100:
        raise HTTPException(status_code=400, detail="Company name too long")
   
    if company not in VALID_COMPANY_NAMES:
       raise HTTPException(status_code=400, detail="Invalid Company")
    
    return company


class TimeoutMiddleware(BaseHTTPMiddleware):
    """Middleware to enforce request timeout"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            # 30 second timeout for all requests
            return await asyncio.wait_for(call_next(request), timeout=30.0)
        except asyncio.TimeoutError:
            return JSONResponse(
                status_code=504,
                content={"detail": "Request timeout"}
            )