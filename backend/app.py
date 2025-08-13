from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
import requests
import openai
import os
from dotenv import load_dotenv

load_dotenv()

client = openai.OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

app = Flask(__name__)

# Manual CORS handling
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Single route handler for both OPTIONS and POST
@app.route('/search', methods=['POST', 'OPTIONS'])
def handle_search():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        print("Handling OPTIONS preflight request")
        return '', 200
    
    # Handle POST request
    print("Handling POST request")
    print(f"Request method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    
    try:
        data = request.get_json()
        print(f"Request data: {data}")
        
        if not data or "company" not in data:
            return jsonify({"error": "Missing 'company' parameter"}), 400
        
        company = data["company"].strip()
        print(f"Searching for company: {company}")
        
        # Scrape Google News
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
        search_url = f"https://www.google.com/search?q={company}+news&tbm=nws"
        response = requests.get(search_url)  # No headers
        soup = BeautifulSoup(response.content, "html.parser")
        headlines = [h3.get_text(strip=True) for h3 in soup.find_all('h3')][:10]
        
        if not headlines:
            # Return dummy headlines for testing if none found
            return jsonify({"error": "No news found"}), 404
        
        # OpenAI Sentiment Analysis
        prompt = f"Analyze the sentiment of the following news headlines about {company}'s stock. Provide a short summary of the sentiment and calculate the average sentiment score on a scale of 0 (negative) to 10 (positive). Return only the summary in bullet points with specific yet short & concise news examples and the average sentiment score as a number. Output should be in the exact format of: Average Sentiment Score: _/10. Then the summary."
        
        try:
            ai_response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": ", ".join(headlines)}
                ]
            )
            sentiment_analysis = ai_response.choices[0].message.content.strip()
        except Exception as ai_error:
            print(f"OpenAI API error: {ai_error}")
            sentiment_analysis = f"Unable to analyze sentiment due to API error. Headlines found: {len(headlines)}. Average sentiment score: 6.0"
        
        return jsonify({
            "sentiment": sentiment_analysis,
            "headlines": headlines,
            "company": company
        })
        
    except Exception as e:
        print(f"Error in search endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/test', methods=['GET'])
def test():
    print("Test endpoint accessed")
    return jsonify({"message": "Flask server is running!", "status": "OK"})

# Add a root route for testing
@app.route('/', methods=['GET'])
def root():
    return jsonify({"message": "Flask API is running", "endpoints": ["/test", "/search"]})

if __name__ == "__main__":
    print("Starting Flask server...")
    print("Server will be available at: http://127.0.0.1:5000")
    print("Test endpoint: http://127.0.0.1:5000/test")
    app.run(debug=True, host='127.0.0.1', port=5000)