import React from "react";

const logos = [
  '/slide6.png',
  '/slide5.png',
  '/slide4.png',
  '/slide3.png',
  '/slide2.png',
  '/slide7.png',
  '/slide8.png',
  '/slide9.png',
  '/slide10.png',
  '/slide11.png',
  '/slide12.png',
  '/slide13.png',
  '/slide1.png',
  '/slide14.png',
  '/slide15.png',
];

export default function LogoCarousel2() {
return (
  <>
    <style>{`
      .carousel {
        display: flex;
        overflow: hidden;
        width: 100%;
        position: relative;
        user-select: none;
        padding: 1em 0;
      }
      .carousel::before,
      .carousel::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100px;
        z-index: 10;
        pointer-events: none;
      }
      .carousel::before {
        left: 0;
        z-index: 100;
        background: linear-gradient(to right, rgba(1, 3, 33, 1), transparent);
      }
      .carousel::after {
        right: 0;
        background: linear-gradient(to left, rgba(1, 3, 33, 1), transparent);
      }
      .track {
        display: flex;
        animation: scroll 20s linear infinite;
      }
      .track:hover {
        animation-play-state: paused; /* pause on hover */
      }
      .logo-container {
        flex: 0 0 auto;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 110px; /* fixed width container */
        height: 65px; /* fixed height container */
      }
      .logo {
        max-width: 100%;
        max-height: 100%;
        filter: brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(2976%) hue-rotate(184deg) brightness(104%) contrast(101%) opacity(0.66);
        transition: none;
        position: relative;
        z-index: 0;
        user-select: none;
        pointer-events: none;
      }
      .logo:hover {
        filter: brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(2976%) hue-rotate(184deg) brightness(104%) contrast(101%) opacity(0.66);
        cursor: default;
      }
      @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
    `}</style>
    <div className="carousel" aria-label="Company logos carousel">
      <div className="track" aria-live="polite">
        {[...logos, ...logos].map((logo, idx) => (
          <div className="logo-container" key={idx}>
            <img
            src={logo}
            alt={`Company logo ${idx + 1}`}
            className="logo"
            draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  </>
 );
}