import React, { useState, useRef, useEffect } from 'react';
import { BentoGridSecondDemo } from "./bentoBox";

function StockReels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const gestureBlocked = useRef(false);
  const wheelAccum = useRef(0);
  const gestureEndTimer = useRef(null);
  const unblockTimer = useRef(null);

  const WHEEL_THRESHOLD = 100;     
  const WHEEL_GESTURE_TIMEOUT = 80;
  const ANIMATION_MS = 600;       
  const BLOCK_MARGIN_MS = 50;
  const GESTURE_BLOCK_MS = ANIMATION_MS + BLOCK_MARGIN_MS;
  const SMALL_THRESHOLD = 5; 

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  const swipeToNext = () => {
    if (isAnimatingRef.current) return;
    setIsAnimating(true);
    isAnimatingRef.current = true;

    setTimeout(() => {
      setCurrentIndex((p) => p + 1);
      setIsAnimating(false);
      isAnimatingRef.current = false;
    }, ANIMATION_MS);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();

      if (gestureBlocked.current || isAnimatingRef.current) {
        return;
      }

      if (Math.abs(e.deltaY) < SMALL_THRESHOLD) return;
      wheelAccum.current += e.deltaY;

      if (gestureEndTimer.current) {
        clearTimeout(gestureEndTimer.current);
      }
      gestureEndTimer.current = setTimeout(() => {
        wheelAccum.current = 0;
        gestureEndTimer.current = null;
      }, WHEEL_GESTURE_TIMEOUT);

      if (Math.abs(wheelAccum.current) >= WHEEL_THRESHOLD) {
        if (wheelAccum.current > 0) {
          wheelAccum.current = 0;
          gestureBlocked.current = true;

          if (gestureEndTimer.current) { clearTimeout(gestureEndTimer.current); gestureEndTimer.current = null; }
          if (unblockTimer.current) { clearTimeout(unblockTimer.current); unblockTimer.current = null; }

          swipeToNext();

          unblockTimer.current = setTimeout(() => {
            gestureBlocked.current = false;
            unblockTimer.current = null;
          }, GESTURE_BLOCK_MS);
        } else {
          wheelAccum.current = 0;
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    const onKey = (ev) => {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (!isAnimatingRef.current && !gestureBlocked.current) {
          gestureBlocked.current = true;
          swipeToNext();
          if (unblockTimer.current) clearTimeout(unblockTimer.current);
          unblockTimer.current = setTimeout(() => { gestureBlocked.current = false; unblockTimer.current = null; }, GESTURE_BLOCK_MS);
        }
      }
    };
    el.addEventListener('keydown', onKey);
    el.setAttribute('tabindex', '0');
    el.style.outline = 'none';

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('keydown', onKey);
      if (gestureEndTimer.current) { clearTimeout(gestureEndTimer.current); gestureEndTimer.current = null; }
      if (unblockTimer.current) { clearTimeout(unblockTimer.current); unblockTimer.current = null; }
    };
  }, []); 

  return (
    <div
      ref={containerRef}
      className="reels"
      style={{ position: 'relative', overflow: 'hidden', height: '100vh' }}
    >
      <style>
        {`
          @keyframes synchronizedSwipe {
            from { transform: translateY(0); }
            to   { transform: translateY(-100vh); }
          }
        `}
      </style>

      <div
        key={`current-${currentIndex}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          position: 'relative',
          animation: isAnimating ? `synchronizedSwipe ${ANIMATION_MS}ms ease-out forwards` : 'none'
        }}
      >
        <BentoGridSecondDemo />
      </div>

      <div
        key={`next-${currentIndex + 1}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          position: 'absolute',
          top: '100vh',
          left: 0,
          right: 0,
          animation: isAnimating ? `synchronizedSwipe ${ANIMATION_MS}ms ease-out forwards` : 'none'
        }}
      >
        <BentoGridSecondDemo />
      </div>

      {/* down arrow */}
      <div
        onClick={() => {
          if (!isAnimatingRef.current && !gestureBlocked.current) {
            gestureBlocked.current = true;
            swipeToNext();
            if (unblockTimer.current) clearTimeout(unblockTimer.current);
            unblockTimer.current = setTimeout(() => { gestureBlocked.current = false; unblockTimer.current = null; }, GESTURE_BLOCK_MS);
          }
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '30px',
          height: '30px',
          border: '2px solid white',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRight: '2px solid white',
          borderBottom: '2px solid white',
          transform: 'rotate(45deg)',
          marginTop: '-3px'
        }} />
      </div>

      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        color: 'white',
        fontSize: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '10px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)'
      }}>
        Reel: {currentIndex + 1}
      </div>
    </div>
  );
}

export default StockReels;
