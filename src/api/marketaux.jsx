import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";

const NewsComponent = ({ symbol = 'AAPL', companyName = 'Apple' }) => {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 499);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // console.log(`Fetching fresh data for ${symbol}`);
        setLoading(true);
        setError(null);

        // Updated fetch to use FastAPI route
        const params = new URLSearchParams({
          companyName: companyName
        });
        
        const response = await fetch(`https://scoutnew-production.up.railway.app/news/${symbol}?${params}`);
        /* const response = await fetch(`http://127.0.0.1:8000/news/${symbol}?${params}`); */
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        setNewsData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        // console.log('error', err);
      }
    };

    fetchNews();
  }, [symbol, companyName]); // Re-fetch when symbol or companyName changes

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0) return 'border-green-500 bg-green-900/20 text-green-600';
    if (sentiment < 0) return 'border-red-500 bg-red-900/20 text-red-600';
    return 'border-orange-500 bg-orange-900/20 text-orange-600';
  };

  const getArticleSentiment = (article) => {
    return article?.entities?.[0]?.sentiment_score || 0;
  };

  // Fixed animation variants
  const first = {
    initial: { x: 25, rotate: -3 },
    hover: { x: 0, rotate: 0 }
  };
  
  const second = {
    initial: { x: -25, rotate: 3 },
    hover: { x: 0, rotate: 0 }
  };

  // Safe click handler
  const handleCardClick = (article) => {
    if (article && article.url) {
      window.open(article.url, '_blank');
    }
  };

  // Helper function to render a single card
  const renderCard = (article, fallbackText, fallbackColor) => {
    if (article) {
      const sentiment = getArticleSentiment(article);
      return (
        <>
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="rounded-lg w-full h-20 object-cover mt-1"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <p className="text-[12px] sm:text-xs text-center font-semibold text-neutral-200 mt-3 group-hover:text-purple-400 transition-colors duration-200">
            {article.title?.length > 60 ? article.title.substring(0, 60) + '...' : article.title}
          </p>
          <p className={`border text-xs rounded-full px-2 py-0.5 mt-2 ${getSentimentColor(sentiment)}`}>
            {article.source}
          </p>
        </>
      );
    } else {
      return (
        <>
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
          <p className="text-xs text-center font-semibold text-neutral-500 mt-4">
            {fallbackText}
          </p>
          <p className={`border text-xs rounded-full px-2 py-0.5 mt-4 ${fallbackColor}`}>
            Unavailable
          </p>
        </>
      );
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={isMobile ? "hover" : "initial"}
        animate={isMobile ? "hover" : "initial"}
        whileHover="hover"
        className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-white/[0.2] flex-row space-x-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-full w-1/3 rounded-2xl bg-black/30 p-4 border-black/[0.1] border flex flex-col items-center justify-center">
            <div className="animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded-full w-16"></div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-white/[0.2] flex-row space-x-2">
        <div className="h-full w-full rounded-2xl bg-blue-300/70 p-4 text-blue-300 border-white/[0.1] border flex items-center justify-center">
          <p className="text-white text-sm text-center">API Limit Reached <br /> Please wait</p>
        </div>
      </motion.div>
    );
  }

  if (!newsData?.data || newsData.data.length === 0) {
    return (
      <motion.div className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-white/[0.2] flex-row space-x-2">
        <div className="h-full w-full rounded-2xl bg-black/30 p-4 dark:bg-black/30 dark:border-white/[0.1] border border-white/[0.1] flex items-center justify-center">
          <p className="text-neutral-300 text-sm">No recent {companyName} news found</p>
        </div>
      </motion.div>
    );
  }

  // Get the first 3 articles safely
  const articles = newsData?.data ? newsData.data.slice(0, 3) : [];
  const article1 = articles[0] || null;
  const article2 = articles[1] || null;  
  const article3 = articles[2] || null;

  return (
    <motion.div
      initial={isMobile ? "hover" : "initial"}
      animate={isMobile ? "hover" : "initial"}
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-white/[0.2] flex-row space-x-3">
      
      {/* First card - animation disabled on mobile */}
      <motion.div
        variants={first}
        onClick={() => handleCardClick(article1)}
        className="group h-full w-1/3 rounded-2xl  p-4 bg-blue-300/10 border-blue-300/[0.1] hover:bg-blue-300/20 border-2 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
        {renderCard(article1, "No news available", "border-red-500 bg-red-900/20 text-red-600")}
      </motion.div>

      {/* Middle card - no animation */}
      <motion.div
        onClick={() => handleCardClick(article2)}
        className="group h-full relative z-20 w-1/3 rounded-2xl  p-4 bg-blue-300/10 border-blue-300/[0.1] hover:bg-blue-300/20 border-2  flex flex-col items-center justify-center cursor-pointer overflow-hidden">
        {renderCard(article2, "No news available", "border-green-500 bg-green-900/20 text-green-600")}
      </motion.div>

      {/* Third card - animation disabled on mobile */}
      <motion.div
        variants={second}
        onClick={() => handleCardClick(article3)}
        className="group h-full w-1/3 rounded-2xl p-4 bg-blue-300/10 border-blue-300/[0.1] hover:bg-blue-300/20 border-2  flex flex-col items-center justify-center cursor-pointer overflow-hidden">
        {renderCard(article3, "No news available", "border-orange-500 bg-orange-900/20 text-orange-600")}
      </motion.div>
    </motion.div>
  );
};

export default NewsComponent;