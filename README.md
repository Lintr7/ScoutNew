# Welcome to Scout! 📈📊

## What is Scout? 🤔

Scout is an AI-powered stock sentiment analyzer tailored for S&P 500 companies. Simply search for a company, and our backend will scrape Google News to gather the top 10 relevant articles. By leveraging the OpenAI API, Scout then provides an in-depth sentiment analysis along with a sentiment score (from 1 to 10) and a recommendation—keeping you updated on the latest market trends.

## Try It Out Now! 🤩

Experience Scout in action (best viewed on a laptop):  
[https://scout-new.vercel.app](https://scout-new.vercel.app)

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
