from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
import requests
import csv
import openai
from flask_cors import CORS 
from flask_cors import cross_origin
import os
from dotenv import load_dotenv
import httpx


load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

http_client = httpx.Client(
    base_url="https://api.openai.com/v1",   
    timeout=httpx.Timeout(60.0)
)

client = openai.OpenAI(
    api_key=api_key,
    http_client=http_client
)

#client = openai.OpenAI(api_key=api_key)

app = Flask(__name__)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:5000,https://scout-stock-analyzer.vercel.app").split(',')
CORS(app, supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load S&P 500 companies
def load_companies():
    csv_path = os.path.join(BASE_DIR, "sp_500_companies.csv")
    with open(csv_path, mode="r", encoding="utf-8") as file:
        reader = csv.reader(file)
        for row in reader:  # Only one row in your file
            companies = [company.strip().lower() for company in row]  # Ensure all names are in lowercase
        return companies

sp500_companies = load_companies()

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/search', methods=['POST'])
@cross_origin() 
def search_company():
    data = request.get_json()
    if not data or "company" not in data:
        return jsonify({"error": "Missing 'company' parameter"}), 400

    company = data["company"].lower()
    if company not in sp500_companies:
        return jsonify({"error": "Invalid company"}), 400

    # Scrape Google News
    search_url = f"https://www.google.com/search?q={company}+news&tbm=nws"
    response = requests.get(search_url)
    soup = BeautifulSoup(response.content, "html.parser")

    headlines = [h3.get_text(strip=True) for h3 in soup.find_all('h3')][:10]

    if not headlines:
        return jsonify({"error": "No news found"}), 404

    # OpenAI Sentiment Analysis
    prompt = f"Analyze the sentiment of the following news headlines about {company}'s stock. Provide a short summary of the sentiment and calculate the average sentiment score on a scale of 0 (negative) to 10 (positive). Return only the summary in bullet points with specific yet short & concise news examples and the average sentiment score as a number. Output should be in the exact format of: Average Sentiment Score: _/10. Then the summary."
   
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": ", ".join(headlines)}
        ]
    )

    sentiment_analysis = response.choices[0].message.content.strip()

    return jsonify({"sentiment": sentiment_analysis})


if __name__ == "__main__":
    #app.run(debug=True)
    app.run(host="0.0.0.0", port=8000, debug=False)

application = app
