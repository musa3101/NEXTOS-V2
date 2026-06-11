import React, { useId } from "react";

interface LoaderProps {
  className?: string;
  size?: number; // scale multiplier, default is 1 (100px x 100px)
}

export function Loader({ className, size = 1 }: LoaderProps) {
  const id = useId();
  const maskId = `clipping-${id.replace(/:/g, "")}`;

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className || ""}`}
      style={{ 
        width: `${100 * size}px`, 
        height: `${100 * size}px`,
        transform: `scale(${size})`
      }}
    >
      <div className="uiverse-loader">
        <svg width="100" height="100" viewBox="0 0 100 100" className="absolute top-0 left-0 pointer-events-none">
          <defs>
            <mask id={maskId}>
              <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
              <polygon points="25,25 75,25 50,75" fill="white"></polygon>
              <polygon points="50,25 75,75 25,75" fill="white"></polygon>
              <polygon points="35,35 65,35 50,65" fill="white"></polygon>
              <polygon points="35,35 65,35 50,65" fill="white"></polygon>
              <polygon points="35,35 65,35 50,65" fill="white"></polygon>
              <polygon points="35,35 65,35 50,65" fill="white"></polygon>
            </mask>
          </defs>
        </svg>
        <div 
          className="box" 
          style={{ 
            mask: `url(#${maskId})`, 
            WebkitMask: `url(#${maskId})` 
          }}
        ></div>
      </div>
    </div>
  );
}
