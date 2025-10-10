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
import time

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set in environment")

client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="News Sentiment API")

# Different cache expiration times for different APIs (in hours)
CACHE_TIMES = {
    "news": 10,          # MarketAux news 
    "finnhub": 6,       # Finnhub earnings/metrics 
    "search": 2,        # OpenAI sentiment analysis 
    "stocks": 0.1,      # Alpaca stock data
    "profile": 168      # Profile data (logo, industry) - 1 week
}

# Convert to seconds
CACHE_SECONDS = {key: hours * 3600 for key, hours in CACHE_TIMES.items()}

# Cache dictionaries - each stores {key: {"data": response, "timestamp": time.time()}}
news_cache = {}
finnhub_cache = {}
search_cache = {}
stocks_cache = {}
profile_cache = {}

def is_cache_valid(cache_entry: dict, cache_type: str) -> bool:
    """Check if a cache entry is still valid based on its type"""
    if not cache_entry:
        return False
    expiration_seconds = CACHE_SECONDS.get(cache_type, 3600)  # Default 1 hour
    return (time.time() - cache_entry["timestamp"]) < expiration_seconds

def get_cached_data(cache_dict: dict, key: str, cache_type: str):
    """Get cached data if valid, otherwise return None"""
    cache_entry = cache_dict.get(key)
    if cache_entry and is_cache_valid(cache_entry, cache_type):
        hours_valid = CACHE_TIMES.get(cache_type, 1)
        print(f"Cache HIT for {cache_type} key: {key} (valid for {hours_valid}h)")
        return cache_entry["data"]
    elif cache_entry:
        # Remove expired entry
        del cache_dict[key]
        print(f"Cache EXPIRED for {cache_type} key: {key}")
    else:
        print(f"Cache MISS for {cache_type} key: {key}")
    return None

def set_cached_data(cache_dict: dict, key: str, data, cache_type: str):
    """Store data in cache with current timestamp"""
    cache_dict[key] = {
        "data": data,
        "timestamp": time.time()
    }
    hours_valid = CACHE_TIMES.get(cache_type, 1)
    print(f"Cache SET for {cache_type} key: {key} (valid for {hours_valid}h)")

# CORS settings: allow your frontend origins here
FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://scout-new.vercel.app",
    "https://scout-reels.vercel.app",
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

# OpenAI Sentiment
@app.post("/search")
def handle_search(payload: CompanyRequest, request: Request):
    """
    POST /search - OpenAI sentiment analysis (2 hour cache)
    Body: { "company": "Apple" }
    """
    try:
        company = payload.company.strip()
        if not company:
            raise HTTPException(status_code=400, detail="Missing 'company' parameter")

        # Check cache first
        cache_key = f"search_{company.lower()}"
        cached_result = get_cached_data(search_cache, cache_key, "search")
        if cached_result:
            return cached_result

        search_url = f"https://www.google.com/search?q={company}+news&tbm=nws"
        resp = requests.get(search_url)
        soup = BeautifulSoup(resp.content, "html.parser")

        headlines = [h3.get_text(strip=True) for h3 in soup.find_all("h3")][:10]

        # Validate headlines exist and are meaningful
        if not headlines:
            raise HTTPException(status_code=404, detail="No news headlines found")
        
        # Filter out empty headlines
        meaningful_headlines = [h for h in headlines if h.strip()]
        if not meaningful_headlines:
            raise HTTPException(status_code=404, detail="No meaningful headlines found")

        # OpenAI prompt
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
                    {"role": "user", "content": ", ".join(meaningful_headlines)},
                ],
            )

            sentiment_analysis = ai_response.choices[0].message.content.strip()
            
            # Validate OpenAI returned meaningful content
            if not sentiment_analysis or len(sentiment_analysis) < 10:
                raise Exception("OpenAI returned empty or invalid response")
                
        except Exception as ai_error:
            print(f"OpenAI API error: {ai_error}")
            # Don't cache errors - raise exception instead
            raise HTTPException(status_code=503, detail="Unable to analyze sentiment - AI service unavailable")

        result = {
            "sentiment": sentiment_analysis,
            "headlines": meaningful_headlines,
            "company": company,
        }

        # Only cache successful results with valid sentiment
        set_cached_data(search_cache, cache_key, result, "search")
        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /search: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/stocks/{symbol}")
async def get_stock_data(symbol: str, start: str, end: str, timeframe: str):
    """Alpaca stock data (6 minute cache)"""
    # Check cache first
    cache_key = f"stocks_{symbol}_{start}_{end}_{timeframe}"
    cached_result = get_cached_data(stocks_cache, cache_key, "stocks")
    if cached_result:
        return cached_result

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
            result = response.json()
            
            # Validate response has meaningful data
            if not result:
                raise HTTPException(status_code=404, detail="No data returned from Alpaca")
            
            # Check if bars exist and have data
            bars = result.get('bars', [])
            if not bars or len(bars) == 0:
                raise HTTPException(status_code=404, detail=f"No stock data available for {symbol} in the specified timeframe")
            
            # Validate bars have required fields
            if not all(isinstance(bar, dict) and 'c' in bar for bar in bars):
                raise HTTPException(status_code=422, detail="Invalid stock data format received")
            
            print(f"Valid stock data for {symbol}: {len(bars)} bars")
            
            # Only cache if we have valid bars
            set_cached_data(stocks_cache, cache_key, result, "stocks")
            return result
            
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Alpaca data: {str(e)}")

MARKETAUX_API_KEY = os.getenv("MARKETAUX_API_KEY")
@app.get("/news/{symbol}")
async def get_news(
    symbol: str,
    company_name: str = Query(..., alias="companyName")
):
    """MarketAux news (10 hour cache)"""
    # Check cache first
    cache_key = f"news_{symbol.lower()}_{company_name.lower()}"
    cached_result = get_cached_data(news_cache, cache_key, "news")
    if cached_result:
        return cached_result

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
            
            # Validate response has articles
            if not result:
                raise HTTPException(status_code=404, detail="No response from MarketAux API")
            
            articles = result.get('data', [])
            if not articles or len(articles) == 0:
                raise HTTPException(status_code=404, detail=f"No news articles found for {company_name}")
            
            # Validate articles have required fields
            valid_articles = [
                article for article in articles 
                if isinstance(article, dict) and article.get('title') and article.get('url')
            ]
            
            if not valid_articles:
                raise HTTPException(status_code=404, detail="No valid news articles found")
            
            # Update result with only valid articles
            result['data'] = valid_articles
            
            print(f"Valid news for {company_name}: {len(valid_articles)} articles")
            
            # Only cache if we have valid articles
            set_cached_data(news_cache, cache_key, result, "news")
            return result
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timeout")
    except HTTPException:
        raise
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
    """Finnhub earnings/metrics (6 hour cache for main data, 1 week for profile)"""
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required")
    
    if not FINNHUB_API_KEY or FINNHUB_API_KEY == "YOUR_FINNHUB_API_KEY":
        raise HTTPException(status_code=500, detail="Finnhub API key not configured")
    
    clean_symbol = symbol.strip().upper()
    
    # Check main finnhub cache first
    cache_key = f"finnhub_{clean_symbol.lower()}"
    if company_name:
        cache_key += f"_{company_name.lower()}"
    cached_result = get_cached_data(finnhub_cache, cache_key, "finnhub")
    if cached_result:
        return cached_result
    
    # Check profile cache separately (longer duration)
    profile_cache_key = f"profile_{clean_symbol.lower()}"
    cached_profile = get_cached_data(profile_cache, profile_cache_key, "profile")
    
    # Build API URLs
    endpoints = {
        "earnings": f"{FINNHUB_BASE_URL}/stock/earnings?symbol={clean_symbol}&token={FINNHUB_API_KEY}",
        "profile": f"{FINNHUB_BASE_URL}/stock/profile2?symbol={clean_symbol}&token={FINNHUB_API_KEY}",
        "metrics": f"{FINNHUB_BASE_URL}/stock/metric?symbol={clean_symbol}&metric=all&token={FINNHUB_API_KEY}"
    }
    
    try:
        # If we have cached profile, only fetch earnings and metrics
        if cached_profile:
            print(f"Using cached profile for {clean_symbol}")
            tasks = [
                fetch_with_timeout(endpoints["earnings"]),
                fetch_with_timeout(endpoints["metrics"]),
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            earnings_data, metrics_data = results
            profile_data = cached_profile  # Use cached profile
        else:
            # Fetch all data including profile
            print(f"Fetching fresh profile for {clean_symbol}")
            tasks = [
                fetch_with_timeout(endpoints["earnings"]),
                fetch_with_timeout(endpoints["profile"]),
                fetch_with_timeout(endpoints["metrics"]),
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            earnings_data, profile_data, metrics_data = results
        
        # Handle individual API failures
        raw_data = {}
        for i, (key, result) in enumerate(zip(["earnings", "profile", "metrics"], 
                                               [earnings_data, profile_data, metrics_data])):
            if isinstance(result, Exception):
                raw_data[key] = {"error": str(result)}
                print(f"Error fetching {key}: {result}")
            else:
                raw_data[key] = result
        
        # FOR TESTING - Set dummy data for disabled endpoints
        raw_data["quote"] = {"test": "disabled - removed quote endpoint"}
        
        # Process earnings data
        processed_earnings = []
        if not isinstance(earnings_data, Exception) and isinstance(earnings_data, list):
            if len(earnings_data) == 0:
                raise HTTPException(status_code=404, detail=f"No earnings data available for symbol {clean_symbol}")
            processed_earnings = process_earnings_data(earnings_data)
        elif isinstance(earnings_data, Exception):
            raise HTTPException(status_code=500, detail=f"Failed to fetch earnings data: {str(earnings_data)}")
        
        if not processed_earnings or len(processed_earnings) == 0:
            raise HTTPException(status_code=404, detail=f"No valid earnings data after processing for symbol {clean_symbol}")
        
        profile = profile_data if not isinstance(profile_data, Exception) else {}
        quote = {} 
        metrics = metrics_data if not isinstance(metrics_data, Exception) else {}
        
        company_metrics = process_company_metrics(profile, quote, metrics)
        
        # Validate critical data - check if we have meaningful data from all sources
        has_meaningful_earnings = len(processed_earnings) > 0
        
        # CRITICAL: Market cap must exist - every public company has market cap
        market_cap = profile.get('marketCapitalization', 0)
        has_valid_market_cap = market_cap > 0
        has_meaningful_profile = has_valid_market_cap and profile.get('name')
        
        # Metrics validation - market cap is critical, others are optional
        has_meaningful_metrics = company_metrics.get('marketCap', 0) > 0
        
        # Check if profile has logo and industry (for separate caching)
        # Validate that they're not just present, but actually have meaningful values
        logo = profile.get('logo', '').strip()
        industry = profile.get('finnhubIndustry', '').strip()
        has_profile_identity = (
            logo and logo != '' and logo.lower() != 'n/a' and logo.lower() != 'null' and
            industry and industry != '' and industry.lower() != 'n/a' and industry.lower() != 'null'
        )
        
        # Only cache if we have meaningful data from at least 2 out of 3 sources
        # CRITICAL REQUIREMENT: Market cap must always be valid
        data_sources_count = sum([has_meaningful_earnings, has_meaningful_profile, has_meaningful_metrics])
        has_meaningful_data = data_sources_count >= 2 and has_valid_market_cap
        
        # Build validation warnings
        validation_warnings = []
        if not has_meaningful_earnings:
            validation_warnings.append("No earnings data")
        if not has_valid_market_cap:
            validation_warnings.append("CRITICAL: No market cap data - cannot cache")
        if not has_meaningful_profile:
            validation_warnings.append("No profile data")
        if not has_meaningful_metrics:
            validation_warnings.append("No metrics data")
        
        if not has_meaningful_data:
            if not has_valid_market_cap:
                validation_warnings.append(f"Market cap is required but missing - not caching")
                print(f"CRITICAL: {clean_symbol} has no market cap - not caching")
            else:
                validation_warnings.append(f"Insufficient data (only {data_sources_count}/3 sources available) - not caching")
                print(f"Warning: Insufficient data for {clean_symbol} ({data_sources_count}/3 sources) - not caching")
        
        if not has_profile_identity:
            validation_warnings.append(f"Profile missing logo or industry - profile not cached")
            print(f"Profile for {clean_symbol} missing valid logo/industry - not caching profile")
        
        response_data = {
            "symbol": clean_symbol,
            "company_name": company_name,
            "timestamp": datetime.utcnow().isoformat(),
            "earnings_data": processed_earnings,
            "company_metrics": company_metrics,
            "raw_data": raw_data,
            "validation_warnings": validation_warnings if validation_warnings else ["All data validated successfully"]
        }
        
        # Cache profile separately if it has meaningful identity data (logo + industry)
        if has_profile_identity and not cached_profile:
            set_cached_data(profile_cache, profile_cache_key, profile, "profile")
            print(f"Cached profile for {clean_symbol} (valid for 1 week)")
        
        # Only cache main response if we have meaningful data
        if has_meaningful_data:
            set_cached_data(finnhub_cache, cache_key, response_data, "finnhub")
            print(f"Cached valid data for {clean_symbol}")
        else:
            print(f"Skipping cache for {clean_symbol} - no meaningful data")
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error processing data: {str(e)}")

@app.get("/cache/stats")
def get_cache_stats():
    """Debug endpoint to see cache statistics"""
    def get_cache_info(cache_dict, name):
        total_entries = len(cache_dict)
        valid_entries = sum(1 for entry in cache_dict.values() if is_cache_valid(entry, name))
        expired_entries = total_entries - valid_entries
        cache_hours = CACHE_TIMES.get(name, 1)
        return {
            "name": name,
            "cache_hours": cache_hours,
            "total_entries": total_entries,
            "valid_entries": valid_entries,
            "expired_entries": expired_entries
        }
    
    return {
        "cache_times": CACHE_TIMES,
        "caches": [
            get_cache_info(news_cache, "news"),
            get_cache_info(finnhub_cache, "finnhub"),
            get_cache_info(search_cache, "search"),
            get_cache_info(stocks_cache, "stocks"),
            get_cache_info(profile_cache, "profile")
        ]
    }

@app.get("/cache/clear")
def clear_all_caches():
    """Debug endpoint to clear all caches"""
    news_cache.clear()
    finnhub_cache.clear()
    search_cache.clear()
    stocks_cache.clear()
    profile_cache.clear()
    return {"message": "All caches cleared"}
    
@app.get("/test")
def test():
    return {"message": "FastAPI server is running!", "status": "OK"}