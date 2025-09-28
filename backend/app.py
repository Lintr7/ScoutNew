from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bs4 import BeautifulSoup
import requests
import openai
import os
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI, HTTPException
import os
from datetime import datetime, timedelta
import urllib.parse
import asyncio
from typing import Optional, Dict, Any

# Load .env
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set in environment")

# initialize OpenAI client (your earlier style)
client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="News Sentiment API")

# CORS settings: allow your frontend origins here
FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # add production origin(s) here, e.g. "https://yourdomain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


class CompanyRequest(BaseModel):
    company: str


@app.post("/search")
def handle_search(payload: CompanyRequest, request: Request):
    """
    POST /search
    Body: { "company": "Apple" }
    """
    try:
        company = payload.company.strip()
        if not company:
            raise HTTPException(status_code=400, detail="Missing 'company' parameter")

        search_url = f"https://www.google.com/search?q={company}+news&tbm=nws"
        resp = requests.get(search_url)
        soup = BeautifulSoup(resp.content, "html.parser")

        soup = BeautifulSoup(resp.content, "html.parser")
        headlines = [h3.get_text(strip=True) for h3 in soup.find_all("h3")][:10]

        if not headlines:
            raise HTTPException(status_code=404, detail="No news found")

        # OpenAI prompt (same as your prompt)
        prompt = (
            f"Analyze the sentiment of the following news headlines about {company}'s stock. "
            "Provide a short summary of the sentiment and calculate the average sentiment score on a scale "
            "of 0 (negative) to 10 (positive). Return only the summary in bullet points with specific yet short & concise "
            "news examples and the average sentiment score as a number. Output should be in the exact format of: "
            "Average Sentiment Score: _/10. Then the summary."
        )

        try:
            ai_response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": ", ".join(headlines)},
                ],
            )
            # Extract content (depends on client response shape)
            sentiment_analysis = ai_response.choices[0].message.content.strip()
        except Exception as ai_error:
            # degrade gracefully if OpenAI fails
            print(f"OpenAI API error: {ai_error}")
            sentiment_analysis = (
                "Unable to analyze sentiment due to API error. "
            )

        return {
            "sentiment": sentiment_analysis,
            "headlines": headlines,
            "company": company,
        }

    except HTTPException:

        raise
    except Exception as e:
        print(f"Error in /search: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/stocks/{symbol}")
async def get_stock_data(symbol: str, start: str, end: str, timeframe: str):
    ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
    ALPACA_API_SECRET = os.getenv("ALPACA_API_SECRET")
    
    if not ALPACA_API_KEY or not ALPACA_API_SECRET:
        raise HTTPException(status_code=500, detail="Alpaca API credentials not configured")
    
    headers = {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
    }
    
    url = f"https://data.alpaca.markets/v2/stocks/{symbol}/bars"
    params = {
        'start': start,
        'end': end,
        'timeframe': timeframe,
        'feed': 'iex',
        'adjustment': 'all'
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Alpaca data: {str(e)}")

MARKETAUX_API_KEY = os.getenv("MARKETAUX_API_KEY")
@app.get("/news/{symbol}")
async def get_news(
    symbol: str,
    company_name: str = Query(..., alias="companyName")
):
    try:
        # Calculate date 30 days ago
        thirty_days_ago = datetime.now() - timedelta(days=30)
        date_string = thirty_days_ago.strftime('%Y-%m-%d')
        
        # Prepare parameters
        params = {
            'api_token': MARKETAUX_API_KEY,
            'search': company_name,
            'limit': '50',
            'published_after': date_string,
            'sort': 'relevance',
            'sort_order': 'desc',
            'language': 'en',
            'domains': 'bloomberg.com,reuters.com,wsj.com,cnbc.com,marketwatch.com,finance.yahoo.com,forbes.com,businessinsider.com'
        }
        
        # Build query string
        query_params = urllib.parse.urlencode(params)
        url = f"https://api.marketaux.com/v1/news/all?{query_params}"
        
        # Make the API request
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30.0)
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"API error: {response.status_code}")
            
            result = response.json()
            return result
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timeout")
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(err)}")

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
FINNHUB_BASE_URL = "https://finnhub.io/api/v1"
async def fetch_with_timeout(url: str, timeout: int = 10) -> Dict[Any, Any]:
    """Fetch data from URL with timeout handling"""
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=408, detail="Request timeout")
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise HTTPException(status_code=401, detail="Invalid API key")
            elif e.response.status_code == 403:
                raise HTTPException(status_code=403, detail="API access forbidden - check subscription level")
            elif e.response.status_code == 429:
                raise HTTPException(status_code=429, detail="Rate limit exceeded")
            elif e.response.status_code == 500:
                raise HTTPException(status_code=500, detail="Finnhub server error")
            else:
                raise HTTPException(status_code=e.response.status_code, detail=f"API error: {e.response.status_code}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

def safe_number(value: Any, fallback: float = 0.0) -> float:
    """Safely convert value to number with fallback"""
    try:
        if value is None:
            return fallback
        num = float(value)
        return num if not (num != num) else fallback  # Check for NaN
    except (ValueError, TypeError):
        return fallback

def process_earnings_data(earnings_array: list) -> list:
    """Process raw earnings data into the format expected by frontend"""
    if not earnings_array:
        return []
    
    processed_earnings = []
    for i, earning in enumerate(earnings_array[:4]):
        try:
            period = earning.get('period')
            if period:
                period_date = datetime.fromisoformat(period.replace('Z', '+00:00'))
                quarter = f"Q{earning.get('quarter', i+1)} {earning.get('year', period_date.year)}"
            else:
                quarter = f"Q{i+1}"
            
            expected = safe_number(earning.get('estimate'), 0)
            actual = safe_number(earning.get('actual'), 0)
            surprise = safe_number(earning.get('surprisePercent'), 0)
            
            processed_earnings.append({
                "quarter": quarter,
                "expected": expected,
                "actual": actual,
                "surprise": round(surprise, 2),
                "period": period
            })
        except Exception as e:
            print(f"Error processing earning {i}: {e}")
            continue
    
    # Reverse to show chronological order (oldest to newest)
    return list(reversed(processed_earnings))

def process_company_metrics(profile: dict, quote: dict, metrics: dict) -> dict:
    """Process company metrics from API responses"""
    metrics_data = metrics.get('metric', {}) if metrics else {}
    
    return {
        "marketCap": safe_number(profile.get('marketCapitalization', 0) * 1000000, 0),
        "grossMargin": safe_number(metrics_data.get('grossMarginTTM'), 0),
        "dayChange": safe_number(quote.get('d'), 0),
        "dayChangePercent": safe_number(quote.get('dp'), 0),
        "peRatio": safe_number(metrics_data.get('peTTM'), 0),
        "volume10Day": safe_number(metrics_data.get('10DayAverageTradingVolume'), 0),
        "weekHigh52": safe_number(metrics_data.get('52WeekHigh'), 0),
        "weekLow52": safe_number(metrics_data.get('52WeekLow'), 0),
    }

@app.get("/finnhub/{symbol}")
async def get_finnhub_data(
    symbol: str,
    company_name: Optional[str] = Query(None, description="Company name for reference")
):
    """
    Fetch comprehensive Finnhub data for a stock symbol
    
    Args:
        symbol: Stock symbol (e.g., AAPL, GOOGL)
        company_name: Optional company name for reference
    
    Returns:
        JSON object containing earnings data, company metrics, and raw API responses
    """
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required")
    
    if not FINNHUB_API_KEY or FINNHUB_API_KEY == "YOUR_FINNHUB_API_KEY":
        raise HTTPException(status_code=500, detail="Finnhub API key not configured")
    
    clean_symbol = symbol.strip().upper()
    
    # Build API URLs
    endpoints = {
        "earnings": f"{FINNHUB_BASE_URL}/stock/earnings?symbol={clean_symbol}&token={FINNHUB_API_KEY}",
        "profile": f"{FINNHUB_BASE_URL}/stock/profile2?symbol={clean_symbol}&token={FINNHUB_API_KEY}",
        "quote": f"{FINNHUB_BASE_URL}/quote?symbol={clean_symbol}&token={FINNHUB_API_KEY}",
        "metrics": f"{FINNHUB_BASE_URL}/stock/metric?symbol={clean_symbol}&metric=all&token={FINNHUB_API_KEY}"
    }
    
    try:
        # Fetch all data in parallel
        tasks = [
            fetch_with_timeout(endpoints["earnings"]),
            fetch_with_timeout(endpoints["profile"]),
            fetch_with_timeout(endpoints["quote"]),
            fetch_with_timeout(endpoints["metrics"])
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        earnings_data, profile_data, quote_data, metrics_data = results
        
        # Handle individual API failures
        raw_data = {}
        for i, (key, result) in enumerate(zip(["earnings", "profile", "quote", "metrics"], results)):
            if isinstance(result, Exception):
                raw_data[key] = {"error": str(result)}
                print(f"Error fetching {key}: {result}")
            else:
                raw_data[key] = result
        
        # Process earnings data
        processed_earnings = []
        if not isinstance(earnings_data, Exception) and isinstance(earnings_data, list):
            if len(earnings_data) == 0:
                raise HTTPException(status_code=404, detail=f"No earnings data available for symbol {clean_symbol}")
            processed_earnings = process_earnings_data(earnings_data)
        elif isinstance(earnings_data, Exception):
            raise HTTPException(status_code=500, detail=f"Failed to fetch earnings data: {str(earnings_data)}")
        
        # Process company metrics
        profile = profile_data if not isinstance(profile_data, Exception) else {}
        quote = quote_data if not isinstance(quote_data, Exception) else {}
        metrics = metrics_data if not isinstance(metrics_data, Exception) else {}
        
        company_metrics = process_company_metrics(profile, quote, metrics)
        
        # Validate critical data
        validation_warnings = []
        if not quote.get('c'):
            validation_warnings.append("No current price data")
        if not profile.get('marketCapitalization'):
            validation_warnings.append("No market cap data")
        
        response_data = {
            "symbol": clean_symbol,
            "company_name": company_name,
            "timestamp": datetime.utcnow().isoformat(),
            "earnings_data": processed_earnings,
            "company_metrics": company_metrics,
            "raw_data": raw_data,
            "validation_warnings": validation_warnings
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error processing data: {str(e)}")



@app.get("/test")
def test():
    return {"message": "FastAPI server is running!", "status": "OK"}


