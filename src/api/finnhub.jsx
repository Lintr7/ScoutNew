import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FinnhubEarnings = ({ 
  symbol = 'GOOGL', 
  companyName = 'Google', 
  earningsData, 
  companyMetrics,
  loading,
  error,
  onRetry
}) => {
  
  const safeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    const absNum = Math.abs(num);
    if (absNum >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (absNum >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (absNum >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (absNum >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const expected = safeNumber(data.expected, 0);
    const actual = safeNumber(data.actual, 0);
    const surprise = data.surprise || '0';

    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{label}</p>
        <p style={styles.tooltipExpected}>Expected EPS: ${expected.toFixed(2)}</p>
        <p style={styles.tooltipActual}>Actual EPS: ${actual.toFixed(2)}</p>
        <p style={styles.tooltipSurprise}>Surprise: {surprise}%</p>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {loading && (
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading financial data...</p>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          <h4>Error</h4>
          <p>API limit reached<br/> Please wait</p>
          <button onClick={onRetry} style={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {!error && !loading && earningsData && earningsData.length > 0 && (
        <div style={styles.chartContainer}>
          <ResponsiveContainer width="160%" height="65%">
            <BarChart data={earningsData} barGap={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(0, 0%, 50%, 1)" />
              <XAxis dataKey="quarter" interval={0} fontSize={10} axisLine={{ stroke:"hsla(0, 0%, 50%, 1)" }} stroke="hsla(0, 0%, 85%, 1)" />
              <YAxis 
                fontSize={10} 
                stroke="hsla(0, 0%, 85%, 1)"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${safeNumber(value, 0).toFixed(2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="expected" fill="#3b82f6" name="Expected EPS" radius={[2, 2, 0, 0]} />
              <Bar dataKey="actual" fill="#a78bfa" name="Actual EPS" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && earningsData && earningsData.length > 0 && (
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Market Cap</div>
            <div style={styles.metricValue}>${formatNumber(companyMetrics?.marketCap)}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>P/E Ratio</div>
            <div style={styles.metricValue}>
              {companyMetrics?.peRatio ? companyMetrics.peRatio.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>52W High</div>
            <div style={styles.metricValue}>
              ${companyMetrics?.weekHigh52 ? companyMetrics.weekHigh52.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>52W Low</div>
            <div style={styles.metricValue}>
              ${companyMetrics?.weekLow52 ? companyMetrics.weekLow52.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Gross Margin</div>
            <div style={styles.metricValue}>
              {companyMetrics?.grossMargin ? (companyMetrics.grossMargin / 100).toFixed(1) + '%' : 'N/A'}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>10D Avg Volume</div>
            <div style={styles.metricValue}>
              {companyMetrics?.volume10Day ? formatNumber(companyMetrics.volume10Day * 1000000) : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (!earningsData || earningsData.length === 0) && (
        <div style={styles.noData}>
          <h4>No Data Available</h4>
          <p>No earnings data found for symbol: {symbol}</p>
          <p>This could mean:</p>
          <ul>
            <li>Invalid or non-existent stock symbol</li>
            <li>Company doesn't report quarterly earnings</li>
            <li>Data not available in Finnhub's database</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    marginLeft: '0.4em',
    marginTop: '-3.7em',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    marginTop: '-4em',
  },
  metricCard: {
    width: '100%',
    marginLeft: '-0.3em',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#6BA6FF',
    marginBottom: '2px',
    textTransform: 'uppercase',
    fontWeight: '1000',
  },
  metricValue: {
    fontSize: '9.5px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#D1D9E6',
  },
  chartContainer: { 
    width: '80%',
    height:'100%',
    padding: '14px',
    boxSizing: 'border-box',
    display: 'grid',
    placeItems: 'center',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
    marginTop: '3em',
  },
  error: {
    textAlign: 'center',
    padding: '13px',
    color: '#dc2626',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    marginLeft: '-0.5em',
    marginTop: '5em'
  },
  retryButton: {
    marginTop: '12px',
    padding: '8px 16px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  noData: {
    fontSize: '13px',
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    marginTop: '4em',
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '11px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  tooltipLabel: {
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#259bf5',
  },
  tooltipExpected: {
    color: '#3b82f6',
    fontSize: '12px',
    margin: '2px 0',
  },
  tooltipActual: {
    color: '#a78bfa',
    fontSize: '12px',
    margin: '2px 0',
  },
  tooltipSurprise: {
    color: '#10b981',
    fontSize: '12px',
    fontWeight: 'bold',
    margin: '2px 0',
  },
};

export default FinnhubEarnings;