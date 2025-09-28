import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";

const NewsComponent = ({ symbol = 'AAPL', companyName = 'Apple' }) => {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Create cache key based on company symbol
        const cacheKey = `${symbol.toLowerCase()}-news-v`;
        const timestampKey = `${symbol.toLowerCase()}-news-timestamp`;
        
        // Check for cached data from the past hour for this specific company
        const cachedData = localStorage.getItem(cacheKey);
        const lastFetch = localStorage.getItem(timestampKey);
        const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour cache
        
        if (cachedData && lastFetch && parseInt(lastFetch) > oneHourAgo) {
          console.log(`Using cached data for ${symbol}`);
          setNewsData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        console.log(`Fetching fresh data for ${symbol}`);
        setLoading(true);
        setError(null);

        // Updated fetch to use FastAPI route
        const params = new URLSearchParams({
          companyName: companyName
        });
        
        const response = await fetch(`http://localhost:8000/news/${symbol}?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Cache the result with company-specific keys
        localStorage.setItem(cacheKey, JSON.stringify(result));
        localStorage.setItem(timestampKey, Date.now().toString());
        
        setNewsData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.log('error', err);
      }
    };

    fetchNews();
  }, [symbol, companyName]); // Re-fetch when symbol or companyName changes

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'positive') return 'border-green-500 bg-green-100 dark:bg-green-900/20 text-green-600';
    if (sentiment === 'negative') return 'border-red-500 bg-red-100 dark:bg-red-900/20 text-red-600';
    return 'border-orange-500 bg-orange-100 dark:bg-orange-900/20 text-orange-600';
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
          <p className="text-[8px] sm:text-xs text-center font-semibold text-neutral-200 mt-3 group-hover:text-purple-400 transition-colors duration-200">
            {article.title?.length > 60 ? article.title.substring(0, 60) + '...' : article.title}
          </p>
          <p className={`border text-xs rounded-full px-2 py-0.5 mt-2 ${getSentimentColor(article.sentiment || 'neutral')}`}>
            {article.sentiment?.charAt(0)?.toUpperCase() + article.sentiment?.slice(1) || 'Neutral'}
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
        initial="initial"
        whileHover="hover"
        className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center">
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
      <motion.div className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2">
        <div className="h-full w-full rounded-2xl bg-blue-300 p-4 dark:text-blue-300 dark:border-white/[0.1] border border-neutral-200 flex items-center justify-center">
          <p className="text-white text-sm">Error loading news</p>
        </div>
      </motion.div>
    );
  }

  if (!newsData?.data || newsData.data.length === 0) {
    return (
      <motion.div className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2">
        <div className="h-full w-full rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex items-center justify-center">
          <p className="text-neutral-500 text-sm">No {companyName} news found</p>
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
      initial="initial"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-3">
      
      {/* First card with left animation */}
      <motion.div
        variants={first}
        onClick={() => handleCardClick(article1)}
        className="group h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-blue-300/10 dark:border-blue-300/[0.1] hover:bg-blue-300/20 border-2 border-neutral-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
        {renderCard(article1, "No news available", "border-red-500 bg-red-100 dark:bg-red-900/20 text-red-600")}
      </motion.div>

      {/* Middle card - no animation */}
      <motion.div
        onClick={() => handleCardClick(article2)}
        className="group h-full relative z-20 w-1/3 rounded-2xl bg-white p-4 dark:bg-blue-300/10 dark:border-blue-300/[0.1] hover:bg-blue-300/20 border-2 border-neutral-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
        {renderCard(article2, "No news available", "border-green-500 bg-green-100 dark:bg-green-900/20 text-green-600")}
      </motion.div>

      {/* Third card with right animation */}
      <motion.div
        variants={second}
        onClick={() => handleCardClick(article3)}
        className="group h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-blue-300/10 dark:border-blue-300/[0.1] hover:bg-blue-300/20 border-2 border-neutral-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
        {renderCard(article3, "No news available", "border-orange-500 bg-orange-100 dark:bg-orange-900/20 text-orange-600")}
      </motion.div>
    </motion.div>
  );
};

export default NewsComponent;