import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import Sentiment from '../components/sentiment';
import StockReels from '../components/stockReels';

function Stocks() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false); // Reset loading state on error
    }
  };

  return (
    <>
      <div style={{ position: 'relative', backgroundColor: 'rgb(1, 3, 33)', minHeight: '100vh', overflow: 'auto'}}>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          style={{ position: 'absolute', zIndex: '100' }}
          className={`${
            isSigningOut 
              ? 'bg-red-600 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'
          } text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2`}
        >
          {isSigningOut && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          )}
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
        <StockReels/>
      </div>
    </>
  );
}

export default Stocks;