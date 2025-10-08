import StockReels from '../components/stockReels';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { IconDeviceMobile, IconSearch, IconStar } from '@tabler/icons-react';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { User } from 'lucide-react';
import SearchStock from './searchStock';
import Favorites from './favorites';
import { useSearchParams } from 'react-router-dom';

function useUserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const avatarUrl = user.user_metadata?.avatar_url;
        setAvatarUrl(avatarUrl);
      }
    };
    getUser();
  }, []);

  return avatarUrl;
}

function Stocks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const dropdownRef = useRef(null);
  const avatarUrl = useUserAvatar();
  const { user, signOut } = useAuth();
  
  const [currentView, setCurrentView] = useState(() => {
    const viewFromUrl = searchParams.get('view');
    return viewFromUrl && ['reels', 'search', 'favorites'].includes(viewFromUrl) 
      ? viewFromUrl 
      : 'reels';
  });

  const getEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email || 'No email';
    setEmail(userEmail);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    getEmail();
  }, []);

  useEffect(() => {
    setSearchParams({ view: currentView });
  }, [currentView, setSearchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const links = [
    {
      label: "Reels",
      onClick: () => {
        setCurrentView('reels');
        if (window.innerWidth < 768) setOpen(false);
      },
      icon: <IconDeviceMobile className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      isActive: currentView === 'reels'
    },
    {
      label: "Search",
      onClick: () => {
        setCurrentView('search');
        if (window.innerWidth < 768) setOpen(false);
      },
      icon: <IconSearch className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      isActive: currentView === 'search'
    },
    {
      label: "Watchlist",
      onClick: () => {
        setCurrentView('favorites');
        if (window.innerWidth < 768) setOpen(false);
      },
      icon: <IconStar className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      isActive: currentView === 'favorites'
    },
  ];

  const renderContent = () => {
    switch(currentView) {
      case 'reels':
        return <StockReels />;
      case 'search':
        return <SearchStock />;
      case 'favorites':
        return <Favorites />;
      default:
        return <StockReels />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900">
      
      {/* Desktop border - hidden on mobile */}
      <div className="hidden md:block" style={{ 
        borderTop: '1px solid rgba(135, 206, 250, 0.1)', 
        height: '1px', 
        width: '100%', 
        position: 'absolute', 
        marginTop: '3em', 
        zIndex: '1001'
      }}></div>
      
      {/* Desktop avatar dropdown - hidden on mobile */}
      <div ref={dropdownRef} className="" style={{ 
        position: 'fixed', 
        top: '6px', 
        right: '15px', 
        zIndex: 100 
      }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User avatar"
            referrerPolicy="no-referrer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
          />
        ) : (
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <User size={20} color="#666" />
          </div>
        )}
    
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            maxWidth: '300px',
            top: '43px',
            right: '5px',
            backgroundColor: '#011930',
            border: '1px solid #01203d',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            minWidth: '100px',
            padding: '14px 20px'
          }}>
            <p style={{ color: 'white', marginBottom: '10px' }}>{email}</p>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              style={{
                maxWidth: '150px',
                marginTop: '10px',
                padding: '7px 15px',
                border: 'none',
                fontWeight: 'bold',
                cursor: isSigningOut ? 'not-allowed' : 'pointer'
              }}
              className={`${
                isSigningOut
                  ? 'bg-red-600 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white rounded-md text-sm font-medium flex items-center justify-center gap-2`}
            >
              {isSigningOut && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        )}
      </div>
      
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="z-1001 justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mb-8 flex items-center gap-2 z-100">
              <img
                src="/logoScout.png"
                className="h-7 w-7 flex-shrink-0 rounded-full"
                alt="Avatar"
              />
              <span style={{ 
                fontFamily: "'SF Mono', Monaco, monospace", 
                fontSize: '1.5em'
              }} className="text-[#9167fb]">
                Scout
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  style={{ paddingLeft: '3px' }}
                  className={`${
                    link.isActive
                      ? 'bg-blue-500/30 bg-opacity-20 border border-blue-400/30 border-opacity-30 rounded-lg'
                      : ''
                  }`}
                >
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      
      {/* Main Content - add padding top on mobile for header */}
      <div className="flex-1 overflow-auto p-0 md:pt-0">
        <div style={{zIndex:'-1', backgroundColor: 'rgb(5, 12, 34)'}} className="rounded-tl-2xl border-neutral-700 h-full overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Stocks;