# Welcome to Scout! 📈📊

## What is Scout? 🤔

Scout is an AI-powered stock platform that allows you to view stocks in an Instagram reels format. We provide the latest news, price movement, financial metrics, and LLM-powered sentiment analysis on popular stocks.

## Try It Out Now! 🤩

Experience Scout in action (best viewed on a laptop):  
Coming soon!

## Tech Stack 🛠️

**Frontend:**
- React.js
- AceternityUI

**Backend:**
- FastAPI
- AWS Elastic Beanstalk (for backend deployment)
- Python (for web scraping and OpenAI sentiment analysis)
- Marketaux, Finnhub, and Alpaca API calls

## Challenges Faced 😰

During development, we tackled several challenges:

- **Responsive Design:** Ensuring our React components scaled and displayed correctly across different screen sizes required meticulous adjustments and testing.
- **AWS Elastic Beanstalk:** Configuring and restructuring files to meet AWS deployment requirements definitely proved to be a complicated.
- **API Communication:** Initially, our API endpoint calls failed due to mixed content issues (HTTPS on the frontend vs. HTTP on the backend). We resolved this by implementing a secure proxy to align both endpoints under HTTPS.
