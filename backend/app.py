from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bs4 import BeautifulSoup
import requests
import openai
import os
from dotenv import load_dotenv

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
        # Grab headline text from h3 tags (same as your old logic)
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
        # re-raise FastAPI HTTPExceptions
        raise
    except Exception as e:
        print(f"Error in /search: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/test")
def test():
    return {"message": "FastAPI server is running!", "status": "OK"}


@app.get("/")
def root():
    return {"message": "FastAPI API is running", "endpoints": ["/test", "/search"]}
