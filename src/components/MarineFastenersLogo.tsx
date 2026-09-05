import React from 'react';

interface MarineFastenersLogoProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  logoColor?: string; // used for primary brand elements like "MARINE" and the nut body
  fillColor?: string; // used for secondary elements like "Fasteners" and the waves
}

export default function MarineFastenersLogo({
  className = "",
  height = "60px",
  width = "auto",
  logoColor,
  fillColor,
}: MarineFastenersLogoProps) {
  // Brand colors matched exactly from the provided corporate logo
  const primary = logoColor || "#0a4c8a"; // Official Deep Royal Blue/Cobalt
  const secondary = fillColor || "#3fa9f5"; // Official Light Sky Blue Wave

  // Highlight line with subtle opacity to divide hex facets
  const foldLineColor = primary === "#ffffff" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.22)";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 760 220"
      className={className}
      style={{ height, width, display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Plus+Jakarta+Sans:ital,wght@1,800;1,900&display=swap');
            
            .brand-text-cursive {
              font-family: 'Great Vibes', 'Dancing Script', 'Brush Script MT', cursive;
              font-weight: 700;
              font-size: 112px;
            }
            .brand-text-bold {
              font-family: 'Helvetica Neue', Arial, 'Plus Jakarta Sans', sans-serif;
              font-weight: 900;
              font-style: italic;
              font-size: 114px;
              letter-spacing: -0.05em;
            }
          `}
        </style>
        {/* Exact mask for the central threaded hole and top-left slot */}
        <mask id="exact-nut-mask">
          {/* Keep body visible as white in mask */}
          <rect x="0" y="0" width="760" height="220" fill="#ffffff" />
          {/* Central elliptical thread hole rotated -25 degrees */}
          <ellipse cx="160" cy="120" rx="28" ry="18" transform="rotate(-25 160 120)" fill="#000000" />
          {/* Diagonal slot cut out at the top-left (rotated -55 degrees) */}
          <rect x="45" y="102" width="120" height="36" transform="rotate(-55 160 120)" fill="#000000" />
        </mask>
      </defs>

      {/* 4 Concentric Wave lines on the bottom-left curving concentric with the hex nut fold */}
      <g stroke={secondary} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.95">
        <path d="M 68,142 A 75 75 0 0, 0 102, 192" strokeWidth="2.5" />
        <path d="M 54,134 A 95 95 0 0, 0 92, 208" strokeWidth="3.2" />
        <path d="M 40,126 A 115 115 0 0, 0 82, 224" strokeWidth="4.2" />
        <path d="M 26,118 A 135 135 0 0, 0 72, 240" strokeWidth="5.2" />
      </g>

      {/* The Tilted Hex Nut Shape with exact dimensions, rotation & facet dividers */}
      <g>
        {/* Main Solid Nut body in deep brand blue (masked with the central hole and top-left slot) */}
        <polygon 
          points="110,65 195,45 250,105 210,175 125,195 70,135"
          fill={primary} 
          mask="url(#exact-nut-mask)"
        />

        {/* Thread relief blue arc inside the inner circle */}
        <path 
          d="M 142,112 A 28 18 0 0,0 174,136" 
          fill="none" 
          stroke={secondary} 
          strokeWidth="3.2" 
          strokeLinecap="round" 
        />

        {/* Ridge folding/separator lines between facets to make it look identical to the real logo */}
        <g stroke={foldLineColor} strokeWidth="2.5" strokeLinecap="round">
          {/* Left corner divider */}
          <line x1="70" y1="135" x2="132" y2="120" />
          {/* Bottom-left corner divider */}
          <line x1="125" y1="195" x2="148" y2="138" />
          {/* Bottom-right corner divider */}
          <line x1="210" y1="175" x2="175" y2="135" />
          {/* Right corner divider */}
          <line x1="250" y1="105" x2="188" y2="111" />
        </g>
      </g>

      {/* Swooshing cursive tail under MARINE, joining into the cursive script */}
      <path
        d="M 450,142 C 340,205 160,205 102,156"
        fill="none"
        stroke={secondary}
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* BRAND TEXT GROUP */}
      <g>
        {/* "MARINE" - ultra-bold condensed custom italic block text */}
        <text
          x="270"
          y="120"
          fill={primary}
          className="brand-text-bold"
        >
          MARINE
        </text>

        {/* "Fasteners" - beautiful custom handwriting cursive script overlapping */}
        <text
          x="368"
          y="184"
          fill={secondary}
          className="brand-text-cursive"
        >
          Fasteners
        </text>
      </g>
    </svg>
  );
}
