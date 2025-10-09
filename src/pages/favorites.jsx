import React, { useState, useEffect } from 'react';
import { getFavorites, removeFavorite } from '../api/supabaseFavorites';
import { supabase } from '../lib/supabaseClient';
import { Star } from 'lucide-react';
import { BentoGridThirdDemo } from '../components/ui/bentoBox3';
import { ArrowLeft } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isReel, setReel] = useState(true);
  const [selectedFavorite, setSelectedFavorite] = useState(null);


  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    loadFavorites();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('favorites_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time change detected:', payload);
          loadFavorites(); // Reload favorites when something changes
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (symbol) => {
  try {
    // Optimistically update the UI - remove from local state immediately
    setFavorites(favorites.filter(fav => fav.symbol !== symbol));
    
    await removeFavorite(symbol);
    console.log(`Removed ${symbol} from favorites`);
  } catch (error) {
    console.error('Error removing favorite:', error);
    alert(error.message);
    // If error, reload to get the correct state
    loadFavorites();
  }
};
  /*
  if (!user) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Please log in to view your favorites</p>
      </div>
    );
  }
  */

  if (loading) {
    return (
      <div className="mt-10 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-white">Loading favorites...</span>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Star size={48} className="mt-10 mx-auto mb-4 text-gray-300" />
        <p>No favorites yet. Start adding stocks to your watchlist!</p>
      </div>
    );
  }

  const handleClick = (favorite) => {
    setReel(false);
    setSelectedFavorite(favorite);
  };

  return (
    <div style={{ backgroundColor: 'rgb(5, 12, 34)', width: '100%', overflowY: 'auto', position: 'relative'}}>
        <div className="hidden md:block" style={{ 
          backgroundColor: 'rgb(5, 12, 34)', 
          width: '100%', 
          position: 'fixed', 
          top: '0em', 
          height: '48px', 
          borderTopLeftRadius: '1rem',
          zIndex: '1',
        }}></div>
        {isReel ? (
        <>
            <h2 style={{zIndex: '-1'}} className="flex justify-center pb-5 text-3xl font-bold text-purple-400 mt-15">
            My Watchlist
            </h2>
            <div className="flex justify-center px-10 md:px-8">
            <div className="w-full max-w-3xl"> 
                <div className="grid gap-4"> 
                {favorites.map((favorite) => (
                    <div
                    key={favorite.id}
                    onClick={() => handleClick(favorite)}
                    className="flex items-center justify-between p-4 w-full bg-gray-700/60 rounded-lg shadow hover:shadow-md hover:bg-gray-700 hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
                    >
                    <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-purple-400/90">{favorite.company_name}</h3>
                        <p className="text-gray-400">{favorite.symbol}</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(favorite.symbol);
                        }}
                        className="text-yellow-400 hover:text-yellow-500 transition-colors hover:scale-110 cursor-pointer"
                        aria-label="Remove from favorites"
                    >
                        <Star size={24} className="fill-yellow-400" />
                    </button>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </>
        ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginRight: '2em'}}>
            <button
                className='mobile-button'
                onClick={() => {
                setReel(true);
                }}
                style={{
                position: 'absolute',
                height: '40px',
                width: '40px',
                top: '4em',
                left: '1em',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                zIndex: 10
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
                <ArrowLeft size={20} />
            </button>
            <div className="bento-scale-wrapper2 mt-20">
                <BentoGridThirdDemo companySymbol={selectedFavorite.symbol} companyName={selectedFavorite.company_name} />
            </div>
            </div>
        )}
    </div>
);
}

export default Favorites;