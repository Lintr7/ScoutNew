import React from "react";
import { CanvasRevealEffect } from "./ui/staticEffect";

const SlightlyLighterCyanSpotlight = ({ size = 800 }) => {
  return (
    <div style={{ position: 'relative'}} >
      <div
        style={{
          width: size,
          position: 'absolute',
          height: size,
          borderRadius: "50%",
          pointerEvents: "none",
          backgroundImage: `
            radial-gradient(70% 70% at 55% 30%, hsla(195, 90%, 48%, 0.25) 0%, hsla(195, 90%, 38%, 0.15) 40%, hsla(195, 90%, 28%, 0) 75%),
            radial-gradient(60% 60% at 50% 50%, hsla(200, 95%, 43%, 0.2) 0%, hsla(200, 90%, 33%, 0.1) 60%, transparent 90%),
            radial-gradient(60% 60% at 50% 50%, hsla(200, 85%, 38%, 0.15) 0%, hsla(200, 80%, 28%, 0.05) 70%, transparent 100%)
          `,
          filter: "blur(60px)",
          mixBlendMode: "screen",
          margin: "auto",
        }}
      />
      <div style={{position:'absolute', width: size - 250, height: size - 125, marginLeft: '9em', marginTop: '-1em', borderRadius: '50%', overflow: 'hidden'}}>
      <CanvasRevealEffect />
      </div>
    </div>
 
  );
};

export default SlightlyLighterCyanSpotlight;
