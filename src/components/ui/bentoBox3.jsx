"use client";
import { cn } from "../../lib/utils";
import React, { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import {
  IconBoxAlignRightFilled,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import StockDashboard from "../../api/alpaca";
import NewsComponent from "../../api/marketaux";
import Sentiment from "../sentiment";
import FinnhubEarnings from "../../api/finnhub";

export function BentoGridThirdDemo({ companySymbol, companyName }) {
  // Default values if no props are passed
  const symbol = companySymbol || "AAPL";
  const name = companyName || "Apple Inc.";

  const [earningsData, setEarningsData] = useState([]);
  const [companyMetrics, setCompanyMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawData, setRawData] = useState({});
  const [industry, setIndustry] = useState('');
  const [logo, setLogo] = useState('');

  useEffect(() => {
      if (symbol) {
        fetchAllData();
      }
    }, [symbol]);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    setRawData({});

    try {
      const cleanSymbol = symbol.trim().toUpperCase();
      
      // Build FastAPI URL
      const params = new URLSearchParams({
        company_name: companyName
      });
      
      const response = await fetch(`https://scoutnew-production.up.railway.app/finnhub/${cleanSymbol}?${params}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Server error: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If can't parse JSON, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      // Use the processed data directly from FastAPI
      const processedEarningsData = result.earnings_data || [];
      const processedCompanyMetrics = result.company_metrics || {};
      const currentRawData = result.raw_data || {};
      const logo = currentRawData.profile.logo || '';
      const industry = currentRawData.profile.finnhubIndustry || 'N/A';
      
      // Set state
      setEarningsData(processedEarningsData);
      setCompanyMetrics(processedCompanyMetrics);
      setRawData(currentRawData);
      setIndustry(industry);
      setLogo(logo);
      
      // Check for validation warnings
      if (result.validation_warnings && result.validation_warnings.length > 0) {
        console.warn('Data validation warnings:', result.validation_warnings);
      }

      // Check if we have earnings data
      if (processedEarningsData.length === 0) {
        setError('No earnings data available for this symbol');
      }

    } catch (err) {
      console.error('Fetch error:', err);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Network error - check your internet connection and server status');
      } else if (err.message.includes('timeout')) {
        setError('Request timed out - please try again');
      } else if (err.message.includes('404')) {
        setError(`No data found for symbol: ${symbol}`);
      } else if (err.message.includes('429')) {
        setError('Rate limit exceeded - please wait before retrying');
      } else if (err.message.includes('401') || err.message.includes('403')) {
        setError('API authentication error - check server configuration');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      header: <div style={{}}>
        <StockDashboard 
          className="flex-1 w-full h-full" 
          symbol={symbol}
          companyName={name}
          industry={industry}
          logo={logo}
        />
      </div>,
      className: "col-span-1 md:col-span-2",
    },

    {
      title: <span style={{ position: 'relative'}} className="text-purple-400">Key Financial Metrics</span>,
      description: (
        <span className="text-sm text-purple-50">
          Stock Stats - {name}
        </span>
      ),
      header: <FinnhubEarnings 
        symbol={symbol} 
        companyName={name} 
        earningsData={earningsData} 
        setEarningsData={setEarningsData} 
        companyMetrics={companyMetrics} 
        setCompanyMetrics={setCompanyMetrics}
        loading={loading}  
        error={error}      
        onRetry={fetchAllData}  
      />,
      className: "col-span-1 md:col-span-1",
    },
    {
      title: <span className="text-purple-400">Market News</span>,
      description: (
        <span className="text-sm text-purple-50">
          Stay updated with the latest market news for {name}
        </span>
      ),
      header: <NewsComponent symbol={symbol} companyName={name} />,
      className: "col-span-1 md:col-span-2",
    },

    {
      title: <span className="text-purple-400">LLM Sentiment Analysis</span>,
      description: (
        <span className="text-sm text-purple-50">
          Latest news on {name}
        </span>
      ),
      header: <Sentiment symbol={symbol} companyName={name} />,
      className: "col-span-1 md:col-span-1",
    },
  ];

  return (
    
    <BentoGrid className="w-full max-w-4xl mx-auto grid-cols-1 auto-rows-[20rem] md:grid-cols-3 md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={`${symbol}-${i}`} // Use symbol in key to ensure proper re-rendering
          title={item.title}
          description={item.description}
          header={item.header}
          className={cn("[&>p:text-lg]", item.className)}
          icon={item.icon} />
      ))}
    </BentoGrid>
  );
}

const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-white/[0.2] flex-col space-y-2">
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-white/[0.2] p-2  items-center space-x-2 bg-black">
        <div
          className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
        <div className="w-full h-4 rounded-full bg-neutral-900" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-white/[0.2] p-2 items-center space-x-2 w-3/4 ml-auto bg-black">
        <div className="w-full h-4 rounded-full bg-neutral-900" />
        <div
          className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-white/[0.2] p-2 items-center space-x-2 bg-black">
        <div
          className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
        <div className="w-full h-4 rounded-full bg-neutral-900" />
      </motion.div>
    </motion.div>
  );
};
const SkeletonTwo = () => {
  const variants = {
    initial: {
      width: 0,
    },
    animate: {
      width: "100%",
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      width: ["0%", "100%"],
      transition: {
        duration: 2,
      },
    },
  };
  const arr = new Array(6).fill(0);
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-white/[0.2] flex-col space-y-2">
      {arr.map((_, i) => (
        <motion.div
          key={"skelenton-two" + i}
          variants={variants}
          style={{
            maxWidth: Math.random() * (100 - 40) + 40 + "%",
          }}
          className="flex flex-row rounded-full border border-white/[0.2] p-2  items-center space-x-2 bg-black w-full h-4"></motion.div>
      ))}
    </motion.div>
  );
};
const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-white/[0.2] flex-col space-y-2"
      style={{
        background:
          "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
      }}>
      <motion.div className="h-full w-full rounded-lg"></motion.div>
    </motion.div>
  );
};

const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-white/[0.2] flex-col space-y-2">
      <motion.div
        variants={variants}
        className="flex flex-row rounded-2xl border border-white/[0.2] p-2  items-start space-x-2 bg-black">
        <img
          src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
          alt="avatar"
          height="100"
          width="100"
          className="rounded-full h-10 w-10" />
        <p className="text-xs text-neutral-500">
          There are a lot of cool framerworks out there like React, Angular,
          Vue, Svelte that can make your life ....
        </p>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-white/[0.2] p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-black">
        <p className="text-xs text-neutral-500">Use PHP.</p>
        <div
          className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
      </motion.div>
    </motion.div>
  );
};  