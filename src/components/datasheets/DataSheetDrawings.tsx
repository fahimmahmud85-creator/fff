import React from 'react';

interface DrawingProps {
  type: string;
  customImage?: string;
  className?: string;
}

export const TechnicalDrawingView: React.FC<DrawingProps> = ({ type, customImage, className = "w-full h-full" }) => {
  if (customImage && customImage.trim()) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`}>
        <img src={customImage} alt="Technical Drawing" className="max-h-full max-w-full object-contain" />
      </div>
    );
  }

  switch (type) {
    case 'preset_bolt':
      return (
        <svg viewBox="0 0 400 240" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Background grid */}
          <defs>
            <pattern id="grid-bolt" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="240" fill="url(#grid-bolt)" />

          {/* Hex Bolt Head */}
          <path d="M 50 70 L 90 70 L 90 170 L 50 170 Z" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M 50 95 L 90 95" stroke="#0f172a" strokeWidth="1" strokeDasharray="2,2" />
          <path d="M 50 145 L 90 145" stroke="#0f172a" strokeWidth="1" strokeDasharray="2,2" />
          <path d="M 45 78 Q 50 70 65 70" stroke="#0f172a" strokeWidth="1" fill="none" />
          <path d="M 45 162 Q 50 170 65 170" stroke="#0f172a" strokeWidth="1" fill="none" />

          {/* Shank */}
          <rect x="90" y="85" width="110" height="70" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
          
          {/* Threaded Section */}
          <rect x="200" y="85" width="140" height="70" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
          {/* Thread Crests/Roots */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130].map(offset => (
            <line key={offset} x1={205 + offset} y1={85} x2={212 + offset} y2={155} stroke="#64748b" strokeWidth="1.2" />
          ))}
          {/* Thread Chamfer */}
          <polygon points="340,85 348,92 348,148 340,155" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.2" />

          {/* Center Line */}
          <line x1="30" y1="120" x2="365" y2="120" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="8,3,2,3" />

          {/* Dimension: Head Height k */}
          <line x1="50" y1="50" x2="90" y2="50" stroke="#0284c7" strokeWidth="1" />
          <line x1="50" y1="45" x2="50" y2="65" stroke="#0284c7" strokeWidth="0.8" />
          <line x1="90" y1="45" x2="90" y2="65" stroke="#0284c7" strokeWidth="0.8" />
          <text x="70" y="44" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">k</text>

          {/* Dimension: Total Length L */}
          <line x1="90" y1="200" x2="348" y2="200" stroke="#0284c7" strokeWidth="1" />
          <line x1="90" y1="175" x2="90" y2="205" stroke="#0284c7" strokeWidth="0.8" />
          <line x1="348" y1="160" x2="348" y2="205" stroke="#0284c7" strokeWidth="0.8" />
          <text x="219" y="215" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">L (Length)</text>

          {/* Dimension: Thread Length b */}
          <line x1="200" y1="180" x2="348" y2="180" stroke="#0284c7" strokeWidth="1" />
          <line x1="200" y1="160" x2="200" y2="185" stroke="#0284c7" strokeWidth="0.8" />
          <text x="274" y="174" fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle">b (Thread)</text>

          {/* Dimension: Diameter d */}
          <line x1="365" y1="85" x2="365" y2="155" stroke="#0284c7" strokeWidth="1" />
          <line x1="340" y1="85" x2="370" y2="85" stroke="#0284c7" strokeWidth="0.8" />
          <line x1="340" y1="155" x2="370" y2="155" stroke="#0284c7" strokeWidth="0.8" />
          <text x="382" y="123" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">Ød</text>
        </svg>
      );

    case 'preset_stud':
      return (
        <svg viewBox="0 0 400 240" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-stud" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="240" fill="url(#grid-stud)" />

          {/* Continuous Thread Rod */}
          <polygon points="52,88 60,80 340,80 348,88 348,152 340,160 60,160 52,152" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
          
          {/* Threads */}
          {Array.from({ length: 28 }).map((_, i) => (
            <line key={i} x1={60 + i * 10} y1={80} x2={68 + i * 10} y2={160} stroke="#64748b" strokeWidth="1.2" />
          ))}

          {/* Chamfers at both ends */}
          <line x1="52" y1="88" x2="52" y2="152" stroke="#0f172a" strokeWidth="1.2" />
          <line x1="348" y1="88" x2="348" y2="152" stroke="#0f172a" strokeWidth="1.2" />

          {/* Center Line */}
          <line x1="30" y1="120" x2="370" y2="120" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="8,3,2,3" />

          {/* Dimension: Total Length L */}
          <line x1="52" y1="190" x2="348" y2="190" stroke="#0284c7" strokeWidth="1" />
          <line x1="52" y1="160" x2="52" y2="195" stroke="#0284c7" strokeWidth="0.8" />
          <line x1="348" y1="160" x2="348" y2="195" stroke="#0284c7" strokeWidth="0.8" />
          <text x="200" y="205" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">L (Total Length)</text>

          {/* Dimension: Major Dia */}
          <line x1="365" y1="80" x2="365" y2="160" stroke="#0284c7" strokeWidth="1" />
          <line x1="345" y1="80" x2="370" y2="80" stroke="#0284c7" strokeWidth="0.8" />
          <line x1="345" y1="160" x2="370" y2="160" stroke="#0284c7" strokeWidth="0.8" />
          <text x="382" y="124" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">Ød</text>
        </svg>
      );

    case 'preset_washer':
      return (
        <svg viewBox="0 0 400 240" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-washer" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="240" fill="url(#grid-washer)" />

          {/* Washer Top View */}
          <circle cx="140" cy="120" r="70" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="140" cy="120" r="35" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />

          {/* Washer Section View */}
          <rect x="270" y="50" width="25" height="35" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="270" y="155" width="25" height="35" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
          {/* Section hatching */}
          <line x1="270" y1="65" x2="285" y2="50" stroke="#475569" strokeWidth="1" />
          <line x1="270" y1="80" x2="295" y2="55" stroke="#475569" strokeWidth="1" />
          <line x1="270" y1="170" x2="285" y2="155" stroke="#475569" strokeWidth="1" />
          <line x1="270" y1="185" x2="295" y2="160" stroke="#475569" strokeWidth="1" />

          {/* Center Lines */}
          <line x1="50" y1="120" x2="330" y2="120" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="8,3,2,3" />
          <line x1="140" y1="30" x2="140" y2="210" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="8,3,2,3" />

          {/* Dimensions */}
          <text x="140" y="124" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">Ød1</text>
          <text x="140" y="205" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">Ød2 (Outer)</text>
          <text x="315" y="124" fill="#0284c7" fontSize="10" fontWeight="bold">s (Thk)</text>
        </svg>
      );

    case 'preset_socket':
      return (
        <svg viewBox="0 0 400 240" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-socket" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="240" fill="url(#grid-socket)" />

          {/* Cylindrical Head */}
          <rect x="50" y="60" width="70" height="120" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" rx="2" />
          {/* Hex socket hole in head */}
          <polygon points="50,90 85,90 95,120 85,150 50,150" fill="#94a3b8" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,2" />

          {/* Knurled head ridges */}
          {[60, 68, 76, 84, 92, 100, 108].map(x => (
            <line key={x} x1={x} y1={60} x2={x} y2={180} stroke="#94a3b8" strokeWidth="0.8" />
          ))}

          {/* Shank */}
          <rect x="120" y="85" width="80" height="70" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
          {/* Thread Section */}
          <rect x="200" y="85" width="140" height="70" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130].map(offset => (
            <line key={offset} x1={205 + offset} y1={85} x2={212 + offset} y2={155} stroke="#64748b" strokeWidth="1.2" />
          ))}

          {/* Center line */}
          <line x1="30" y1="120" x2="365" y2="120" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="8,3,2,3" />

          {/* Dimension Labels */}
          <text x="85" y="48" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">k (Head Ht)</text>
          <text x="235" y="205" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">L (Length)</text>
          <text x="365" y="124" fill="#0284c7" fontSize="10" fontWeight="bold">Ød</text>
        </svg>
      );

    case 'preset_hex_nut':
    default:
      // Exact DIN 934 Hex Nut Technical Drawing (Matching Snapshot 1)
      return (
        <svg viewBox="0 0 400 240" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-nut" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="240" fill="url(#grid-nut)" />

          {/* LEFT: Front View / Hexagon Projection */}
          <g transform="translate(100, 120)">
            {/* Outer Hexagon */}
            <polygon 
              points="0,-65 56,-32 56,32 0,65 -56,32 -56,-32" 
              fill="#f8fafc" 
              stroke="#0f172a" 
              strokeWidth="1.5" 
            />
            {/* Chamfer Circle */}
            <circle cx="0" cy="0" r="54" fill="none" stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
            {/* Major Thread Dia (D) */}
            <circle cx="0" cy="0" r="32" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeDasharray="4,2" />
            {/* Minor Thread Dia (d1) */}
            <circle cx="0" cy="0" r="26" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
            
            {/* Center crosshair */}
            <line x1="-75" y1="0" x2="75" y2="0" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="8,3,2,3" />
            <line x1="0" y1="-75" x2="0" y2="75" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="8,3,2,3" />

            {/* Across Flat (s) dimension */}
            <line x1="-56" y1="-75" x2="56" y2="-75" stroke="#0284c7" strokeWidth="1" />
            <line x1="-56" y1="-68" x2="-56" y2="-80" stroke="#0284c7" strokeWidth="0.8" />
            <line x1="56" y1="-68" x2="56" y2="-80" stroke="#0284c7" strokeWidth="0.8" />
            <text x="0" y="-80" fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle">s (Across Flat)</text>

            {/* Across Corner (e) callout */}
            <text x="0" y="88" fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle">e (Across Corner)</text>
          </g>

          {/* RIGHT: Side / Cross-Section View */}
          <g transform="translate(270, 120)">
            {/* Main Nut Body */}
            <polygon 
              points="-35,-56 35,-56 40,-48 40,48 35,56 -35,56 -40,48 -40,-48" 
              fill="#f8fafc" 
              stroke="#0f172a" 
              strokeWidth="1.5" 
            />
            {/* Chamfers */}
            <line x1="-35" y1="-56" x2="-35" y2="56" stroke="#64748b" strokeWidth="1" />
            <line x1="35" y1="-56" x2="35" y2="56" stroke="#64748b" strokeWidth="1" />

            {/* Internal Thread Core (Hatched) */}
            <rect x="-35" y="-26" width="70" height="52" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="-35" y1="-12" x2="35" y2="-12" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="-35" y1="12" x2="35" y2="12" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />

            {/* Countersink bevels */}
            <line x1="-35" y1="-32" x2="-25" y2="-26" stroke="#0f172a" strokeWidth="1" />
            <line x1="-35" y1="32" x2="-25" y2="26" stroke="#0f172a" strokeWidth="1" />
            <line x1="35" y1="-32" x2="25" y2="-26" stroke="#0f172a" strokeWidth="1" />
            <line x1="35" y1="32" x2="25" y2="26" stroke="#0f172a" strokeWidth="1" />

            {/* Center line */}
            <line x1="-55" y1="0" x2="55" y2="0" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="8,3,2,3" />

            {/* Thickness (m) Dimension */}
            <line x1="-35" y1="-75" x2="35" y2="-75" stroke="#0284c7" strokeWidth="1" />
            <line x1="-35" y1="-68" x2="-35" y2="-80" stroke="#0284c7" strokeWidth="0.8" />
            <line x1="35" y1="-68" x2="35" y2="-80" stroke="#0284c7" strokeWidth="0.8" />
            <text x="0" y="-80" fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle">m (Thickness)</text>

            {/* Thread callout */}
            <text x="0" y="85" fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle">Minor Dia (d1)</text>
          </g>
        </svg>
      );
  }
};

export const HeadStampDrawingView: React.FC<DrawingProps> = ({ type, customImage, className = "w-full h-full" }) => {
  if (customImage && customImage.trim()) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`}>
        <img src={customImage} alt="Head Stamp" className="max-h-full max-w-full object-contain" />
      </div>
    );
  }

  let brandCode = "MFI";
  let gradeCode = "8";
  let standardCode = "DIN 934";

  if (type === 'stamp_mfi_8_8') {
    brandCode = "MFI";
    gradeCode = "8.8";
    standardCode = "ISO 4017";
  } else if (type === 'stamp_mfi_10_9') {
    brandCode = "MFI";
    gradeCode = "10.9";
    standardCode = "DIN 912";
  } else if (type === 'stamp_mfi_2h') {
    brandCode = "MFI";
    gradeCode = "2H";
    standardCode = "ASTM A194";
  } else if (type === 'stamp_mfi_b7') {
    brandCode = "MFI";
    gradeCode = "B7";
    standardCode = "ASTM A193";
  } else if (type === 'stamp_mfi_a4_80') {
    brandCode = "MFI";
    gradeCode = "A4-80";
    standardCode = "ISO 3506";
  }

  return (
    <svg viewBox="0 0 400 240" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-stamp" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
        </pattern>
        <filter id="emboss" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#334155" floodOpacity="0.4" />
        </filter>
      </defs>
      <rect width="400" height="240" fill="url(#grid-stamp)" />

      {/* Head Stamp Outline (Hexagon) */}
      <g transform="translate(200, 120)">
        {/* Outer Hexagon Head */}
        <polygon 
          points="0,-80 69,-40 69,40 0,80 -69,40 -69,-40" 
          fill="#f8fafc" 
          stroke="#0f172a" 
          strokeWidth="2" 
        />
        {/* Chamfer Circle on Head */}
        <circle cx="0" cy="0" r="74" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />

        {/* Central Recess or Hole if nut */}
        <circle cx="0" cy="0" r="32" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />

        {/* Embossed Brand Code: MFI */}
        <text 
          x="0" 
          y="-42" 
          fill="#0f172a" 
          fontSize="18" 
          fontWeight="900" 
          fontFamily="Arial, sans-serif" 
          letterSpacing="2" 
          textAnchor="middle"
          filter="url(#emboss)"
        >
          {brandCode}
        </text>

        {/* Embossed Grade Stamp: 8 / 8.8 / 2H / B7 */}
        <text 
          x="0" 
          y="56" 
          fill="#0f172a" 
          fontSize="17" 
          fontWeight="900" 
          fontFamily="Arial, sans-serif" 
          textAnchor="middle"
          filter="url(#emboss)"
        >
          {gradeCode}
        </text>

        {/* Dots on Left & Right Flange */}
        <circle cx="-50" cy="0" r="3.5" fill="#0f172a" />
        <circle cx="50" cy="0" r="3.5" fill="#0f172a" />
      </g>
    </svg>
  );
};
