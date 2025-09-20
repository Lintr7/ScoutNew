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
            'api_token': 'b5tzk2xYMO2TL3VXGeT3DVJFTBEKYP9gPVhIawuf',
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


@app.get("/test")
def test():
    return {"message": "FastAPI server is running!", "status": "OK"}


