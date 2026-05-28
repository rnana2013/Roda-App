import React from 'react';

interface PitStopLogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const PitStopLogo: React.FC<PitStopLogoProps> = ({ 
  className = '', 
  width = '100%', 
  height = '100%' 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
      <svg 
        viewBox="0 0 540 100" 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg"
        className="select-none overflow-visible"
      >
        <g transform="skewX(-16) translate(15, 0)">
          {/* Layer 1: Extra thick outer dark charcoal contour to merge all letters into a single cohesive badge */}
          <text 
            x="240" 
            y="68" 
            textAnchor="middle"
            fontFamily="'Impact', 'Arial Black', sans-serif" 
            fontWeight="900" 
            fontSize="72"
            stroke="#1e1e1f" 
            strokeWidth="18" 
            strokeLinejoin="round" 
            strokeLinecap="round" 
            fill="#1e1e1f"
            letterSpacing="-2"
          >
            PIT STOP APP
          </text>
          
          {/* Layer 2: Medium black stroke to smooth and shape the contours */}
          <text 
            x="240" 
            y="68" 
            textAnchor="middle"
            fontFamily="'Impact', 'Arial Black', sans-serif" 
            fontWeight="900" 
            fontSize="72"
            stroke="#1e1e1f" 
            strokeWidth="10" 
            strokeLinejoin="round" 
            strokeLinecap="round" 
            fill="#1e1e1f"
            letterSpacing="-2"
          >
            PIT STOP APP
          </text>

          {/* Layer 3: Vibrant cyber yellow core with a subtle separating outline inside the badge */}
          <text 
            x="240" 
            y="68" 
            textAnchor="middle"
            fontFamily="'Impact', 'Arial Black', sans-serif" 
            fontWeight="900" 
            fontSize="72"
            stroke="#1e1e1f"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="#FCED15"
            letterSpacing="-2"
          >
            PIT STOP APP
          </text>
        </g>
      </svg>
    </div>
  );
};

export default PitStopLogo;
