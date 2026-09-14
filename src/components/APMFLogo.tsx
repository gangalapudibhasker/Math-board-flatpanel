import React from 'react';

interface APMFLogoProps {
  className?: string;
  size?: number;
}

/**
 * Andhra Pradesh Mathematics Forum (APMF) Official Hexagonal Iris Logo
 * Recreated with exact 6-blade colorful geometric aperture and central APMF monogram
 */
export const APMFLogo: React.FC<APMFLogoProps> = ({ className = 'w-9 h-9', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 200 200"
      className={`${className} shrink-0 drop-shadow-sm select-none`}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Andhra Pradesh Mathematics Forum Logo"
    >
      {/* Outer Hexagon Clipping / Background */}
      <defs>
        <clipPath id="hexClip">
          {/* Regular hexagon centered at (100, 100), radius 96 */}
          <polygon points="100,6 184,53 184,147 100,194 16,147 16,53" />
        </clipPath>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.25" />
        </filter>
      </defs>

      <g clipPath="url(#hexClip)">
        {/* White base */}
        <rect width="200" height="200" fill="#FFFFFF" />

        {/* 6 Colorful Aperture / Shutter Blades */}
        {/* 1. Golden Yellow / Amber (Upper Left) */}
        <polygon points="16,53 100,6 100,58 54,92" fill="#F59E0B" />

        {/* 2. Slate Charcoal (Top) */}
        <polygon points="100,6 184,53 138,87 100,58" fill="#374151" />

        {/* 3. Magenta Pink / Fuchsia (Upper Right) */}
        <polygon points="184,53 184,147 138,113 138,87" fill="#DB2777" />

        {/* 4. Royal Blue (Lower Right) */}
        <polygon points="184,147 100,194 100,142 138,113" fill="#2563EB" />

        {/* 5. Vivid Green (Bottom) */}
        <polygon points="100,194 16,147 62,113 100,142" fill="#16A34A" />

        {/* 6. Crimson Red (Lower Left) */}
        <polygon points="16,147 16,53 54,92 62,113" fill="#DC2626" />

        {/* Subtle blade segment lines for authentic depth */}
        <line x1="54" y1="92" x2="16" y2="53" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="100" y1="58" x2="100" y2="6" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="138" y1="87" x2="184" y2="53" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="138" y1="113" x2="184" y2="147" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="100" y1="142" x2="100" y2="194" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="62" y1="113" x2="16" y2="147" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />

        {/* Central White Aperture Opening */}
        <polygon points="100,58 138,87 138,113 100,142 62,113 54,92" fill="#FFFFFF" />

        {/* Outer Circular Swirl / Rings */}
        <circle cx="106" cy="100" r="23" stroke="#a5b4fc" strokeWidth="6" fill="none" strokeDasharray="95 40" strokeLinecap="round" />
        <circle cx="94" cy="100" r="18" fill="#1e1b4b" />

        {/* AP Monogram inside navy circle */}
        <text
          x="93"
          y="105"
          fill="#ffffff"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="-0.5px"
        >
          AP
        </text>

        {/* M and F text */}
        <text
          x="110"
          y="106"
          fill="#1e1b4b"
          fontSize="14"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
        >
          M
        </text>
        <text
          x="124"
          y="106"
          fill="#1e3a8a"
          fontSize="14"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
        >
          F
        </text>
      </g>

      {/* Hexagon Border */}
      <polygon
        points="100,6 184,53 184,147 100,194 16,147 16,53"
        stroke="#ffffff"
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
};
