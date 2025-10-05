import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { EvervaultCard } from "./ui/cryptic";
import { HoverBorderGradientDemo } from "./ui/aceternityButton";
import { MovingBorderDemo } from "./ui/borderButton";

const endpoint = 'https://scoutnew-production.up.railway.app/search';

const Sentiment = ({ symbol = 'AAPL', companyName = 'Apple' }) => {
  const [query, setQuery] = useState(companyName);
  const [sentiment, setSentiment] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (companyName) {
      setQuery(companyName);
      // Clear previous results when company changes
      setSentiment("");
      setRecommendation("");
      setError("");
    }
  }, [companyName]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a company name");
      return;
    }

    setLoading(true);
    setError("");
    setSentiment("");
    setRecommendation("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: query.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Server error. Try again.");
        return;
      }

      const result = await response.json();
      setSentiment(result.sentiment);

      const match = result.sentiment.match(/average sentiment score:\s*([\d.]+)/i);
      if (match) {
        const avgScore = parseFloat(match[1]);
        if (avgScore >= 7) {
          setRecommendation("🚀 Positive Overall Sentiment");
        } else if (avgScore <= 3) {
          setRecommendation("⚠️ Negative Overall Sentiment");
        } else {
          setRecommendation("🤔 Neutral Overall Sentiment");
        }
      }
    } catch (err) {
      setError(`Server error. Try again. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
        {!sentiment && (
          <>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transition = "all 0.5s ease 0.1s";
                e.target.style.background = "linear-gradient(135deg, #4f46e5 0%, #9333ea 90%)";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transition = "all 0.5s ease";
                e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 90%)";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            
            {loading ? "🔍 Searching..." : `Search ${companyName}`}
          </button>
          <div className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2 justify-center items-center mt-4">
            <EvervaultCard/>
          </div>
          </>
        )}
        {error && <p style={styles.error}>{error}</p>}

        {sentiment && (
          <div style={styles.resultBoxContainer}>
            <div style={styles.resultBox} className="always-scroll flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2">
              <h3 style={styles.resultTitle}>{companyName}:</h3>
              <div style={styles.resultText}>
                <ReactMarkdown 
                  components={{
                    ul: ({ children }) => <div>{children}</div>, 
                  }}
                >
                  {sentiment}
                </ReactMarkdown>
              </div>
              {recommendation && (
                <p style={styles.recommendation}>{recommendation}</p>
              )}
            </div>
          </div>
        )}
      </div>
  );
}

const styles = {
  container: {
    minHeight: "20vh",
    padding: "20px",
    display: "flex",
    position: 'relative',
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: '-1em',
  },  
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "32px",
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  input: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    zIndex: '100'
  },
  button: {
    padding: "10px 20px",
    marginTop: '1em',
    borderRadius: "18px",
    color: "#ffffff",
    maxWidth: '200px',
    fontSize: "clamp(10px, 1.2vw, 12px)",
    fontWeight: "600",
    position: 'absolute',
    border: "none",
    zIndex: '100',
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.9)",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
  },
  buttonDisabled: {
    padding: "10px 20px",
    marginTop: '1em',
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "clamp(10px, 1.2vw, 12px)",
    fontWeight: "600",
    position: 'absolute',
    border: "none",
    zIndex: '100',
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
    background: "transparent",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#ffffff",
    width: "calc(100% - 160px)",
    left: "0",
    borderRadius: "10px",
    boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
    maxHeight: "300px",
    overflowY: "auto",
    listStyle: "none",
    padding: "8px 0",
    margin: "4px 0 0 0",
    border: "1px solid #e2e8f0",
    zIndex: 1000,
    backdropFilter: "blur(10px)",
  },
  dropdownItem: {
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#fff",
    fontSize: "14px",
    color: "#374151",
    transition: "all 0.2s ease",
  },
  error: {
    color: "#ef4444",
    marginTop: "10em",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    fontSize: "14px",
    fontWeight: "500",
    position: 'absolute',
    zIndex: '100',
  },
  resultBox: {
    marginTop: "0em",
    width: '250px',
    height: '211px',
    backgroundColor: "transparent",
    overflowY: "scroll",
    padding: "13px",
    borderRadius: "10px",
    textAlign: "left",
  },
  resultBoxContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start', 
    position: 'relative', 
    marginTop: '1em', 
    backgroundColor: "rgba(96, 165, 250, 0.3)",
    width: '260px',
    height: '211px',
    borderRadius: "8px",
  },
  resultTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#c084fc",
    marginBottom: "16px",
    textAlign: "center",
  },
  resultText: {
    fontSize: "15px",
    color: "white",
    lineHeight: "1.7",
    marginBottom: "16px",
    textAlign: "left"
  },
  recommendation: {
    marginTop: "16px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    padding: "12px 16px",
    backgroundColor: "#27548A",
    borderRadius: "8px",
    border: "0px solid #224F85",
  },
};

export default Sentiment;