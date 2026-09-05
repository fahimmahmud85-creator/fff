import React, { useState, useEffect, useId } from 'react';
import { getActiveCompany, CompanyProfile } from '../utils/companyProfile';

export default function ClassicLiveClock({ 
  className = '', 
  size = 'w-[190px] h-[190px]',
  whiteMode = false,
  company
}: { 
  className?: string; 
  size?: string;
  whiteMode?: boolean;
  company?: CompanyProfile;
} = {}) {
  // Always default to UAE (GST) / Asia/Dubai for the analog clock terminal
  const ianaTimezone = 'Asia/Dubai';
  
  const [activeComp, setActiveComp] = useState<CompanyProfile>(() => company || getActiveCompany());

  useEffect(() => {
    if (company) {
      setActiveComp(company);
      return;
    }
    const handleCompChange = (e: any) => {
      setActiveComp(getActiveCompany());
    };
    window.addEventListener('active_company_changed', handleCompChange);
    window.addEventListener('company_profile_updated', handleCompChange);
    return () => {
      window.removeEventListener('active_company_changed', handleCompChange);
      window.removeEventListener('company_profile_updated', handleCompChange);
    };
  }, [company]);
  
  const baseId = useId();
  const safeId = baseId.replace(/[^a-zA-Z0-9-]/g, '');
  const bezelId = `bezel-grad-${safeId}`;
  const faceGradId = `face-grad-${safeId}`;
  const glassGradId = `glass-grad-${safeId}`;
  const metalInnerId = `metal-inner-${safeId}`;
  const handShadowId = `hand-shadow-${safeId}`;
  const dialShadowId = `dial-shadow-${safeId}`;
  const centralHubId = `central-hub-${safeId}`;

  // Smooth fluid Swiss-style sweep movement states
  const [timeState, setTimeState] = useState({
    hours: 12,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  useEffect(() => {
    let animId: number;

    const updateClock = () => {
      const now = new Date();
      
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: ianaTimezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        const formattedParts = formatter.formatToParts(now);
        const parts: { [key: string]: string } = {};
        formattedParts.forEach(p => {
          parts[p.type] = p.value;
        });

        const h = parseInt(parts.hour || '0', 10);
        const m = parseInt(parts.minute || '0', 10);
        const s = parseInt(parts.second || '0', 10);
        const ms = now.getMilliseconds();

        setTimeState({
          hours: h,
          minutes: m,
          seconds: s,
          milliseconds: ms,
        });

      } catch (err) {
        // Fallback to local system time in case of any conversion error
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        const ms = now.getMilliseconds();
        setTimeState({
          hours: h,
          minutes: m,
          seconds: s,
          milliseconds: ms,
        });
      }

      animId = requestAnimationFrame(updateClock);
    };

    animId = requestAnimationFrame(updateClock);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Calculate high-fidelity fractional angles for fluid Swiss sweep motion
  const secFrac = timeState.seconds + timeState.milliseconds / 1000;
  const minFrac = timeState.minutes + secFrac / 60;
  const hourFrac = (timeState.hours % 12) + minFrac / 60;

  const secondHandAngle = secFrac * 6; // 360 deg / 60 s = 6 deg per s
  const minuteHandAngle = minFrac * 6; // 360 deg / 60 m = 6 deg per m
  const hourHandAngle = hourFrac * 30; // 360 deg / 12 h = 30 deg per h

  // Generate ticks around the clock face
  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const isHour = i % 5 === 0;
      
      if (isHour) {
        // High-definition classic black station hour bar (thicker, sharp)
        ticks.push(
          <line
            key={`tick-${i}`}
            x1="200"
            y1="24"
            x2="200"
            y2="42"
            stroke="#0f172a"
            strokeWidth="3.8"
            strokeLinecap="butt"
            transform={`rotate(${angle}, 200, 200)`}
          />
        );
      } else {
        // Slim slate minute tick
        ticks.push(
          <line
            key={`tick-${i}`}
            x1="200"
            y1="24"
            x2="200"
            y2="31"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeLinecap="butt"
            transform={`rotate(${angle}, 200, 200)`}
          />
        );
      }
    }
    return ticks;
  };

  // Render high-contrast geometric number markers
  const renderNumbers = () => {
    const numbers = [];
    const radius = 132; // optimal spacing for clean legibility
    for (let i = 1; i <= 12; i++) {
      const angleRad = ((i * 30 - 90) * Math.PI) / 180;
      const x = 200 + radius * Math.cos(angleRad);
      const y = 200 + radius * Math.sin(angleRad);
      
      numbers.push(
        <text
          key={`num-${i}`}
          x={x}
          y={y + 8} // center alignment correction
          textAnchor="middle"
          className="fill-slate-950 font-sans font-bold select-none tracking-tight"
          fontSize="26"
          style={{ textShadow: '0px 0.5px 1px rgba(255,255,255,0.8)' }}
        >
          {i}
        </text>
      );
    }
    return numbers;
  };

  return (
    <div id="mfi-chronometer-root" className={`flex flex-col items-center justify-center ${className}`}>
      {/* Container holding the high-definition clock */}
      <div className={`relative aspect-square flex items-center justify-center bg-transparent rounded-full select-none ${size}`}>
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full select-none"
          id="station-clock-svg"
        >
          <defs>
            {/* Multi-stop 3D Chrome Bezel linear gradient for ultra-realistic metal reflections */}
            <linearGradient id={bezelId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="10%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#94a3b8" />
              <stop offset="35%" stopColor="#cbd5e1" />
              <stop offset="45%" stopColor="#f1f5f9" />
              <stop offset="55%" stopColor="#64748b" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="85%" stopColor="#475569" />
              <stop offset="93%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Concentric inner metal highlight ring gradient */}
            <linearGradient id={metalInnerId} x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#cbd5e1" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#475569" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
            </linearGradient>

            {/* Polished central pivot silver cap gradient */}
            <linearGradient id={centralHubId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Dial gradient with realistic soft inner-shadow shading */}
            <radialGradient id={faceGradId} cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#fcfcfd" />
              <stop offset="92%" stopColor="#f4f6fa" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>

            {/* Diagonal protective glass crystal light reflection gradient */}
            <linearGradient id={glassGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            {/* Drop shadow for analog hands to float with high-fidelity depth */}
            <filter id={handShadowId} x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="3.0" dy="4.5" stdDeviation="2.5" floodColor="#090d16" floodOpacity="0.25" />
            </filter>

            {/* Outer bezel depth-shadow */}
            <filter id={dialShadowId} x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#020617" floodOpacity="0.16" />
            </filter>
          </defs>

          {/* Casing Drop Shadow */}
          <circle
            cx="200"
            cy="200"
            r="194"
            fill="none"
            filter={`url(#${dialShadowId})`}
          />

          {/* Outer Chrome Bezel Casing */}
          <circle
            cx="200"
            cy="200"
            r="194"
            fill={`url(#${bezelId})`}
          />

          {/* Inner Dark-Metal Inset Bevel (Groove) */}
          <circle
            cx="200"
            cy="200"
            r="184"
            fill={whiteMode ? "#e2e8f0" : "#1e293b"}
          />

          {/* Concentric Polished Highlight Inner Bezel Ring */}
          <circle
            cx="200"
            cy="200"
            r="182.5"
            fill={`url(#${metalInnerId})`}
          />

          {/* Clock Dial Face Plate (Off-white radial shaded dial) */}
          <circle
            cx="200"
            cy="200"
            r="179"
            fill={`url(#${faceGradId})`}
          />

          {/* Faint rail track ring frame for tick markers */}
          <circle
            cx="200"
            cy="200"
            r="171.5"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            opacity="0.85"
          />

          {/* Render 60 Minute/Hour Ticks */}
          {renderTicks()}

          {/* Render Hour Numbers 1 to 12 */}
          {renderNumbers()}

          {/* BRANDING: "GST" under 12 o'clock */}
          <text
            x="200"
            y="114"
            textAnchor="middle"
            className="fill-[#FF6B00] font-mono font-bold tracking-[0.45em] uppercase select-none"
            fontSize="9.5"
          >
            GST
          </text>

          {/* BRANDING: Dynamic Active Company name above 6 o'clock */}
          <text
            x="200"
            y="260"
            textAnchor="middle"
            className="fill-slate-950 font-sans font-bold tracking-[0.24em] select-none uppercase"
            fontSize={(activeComp.shortName || activeComp.name || '').length > 14 ? "9.5" : "11.5"}
          >
            {activeComp.shortName || activeComp.name || 'MARINE FASTENERS'}
          </text>
          
          <text
            x="200"
            y="275"
            textAnchor="middle"
            className="fill-slate-500 font-mono font-bold tracking-[0.32em] select-none uppercase"
            fontSize="8.5"
          >
            {activeComp.id === 'comp-bmm' ? 'DUBAI, UAE' : activeComp.id === 'comp-umi' ? 'AJMAN, UAE' : 'AJMAN, UAE'}
          </text>

          {/* 1. Hour Hand (sleek black, tapered tip design with tail counterbalance) */}
          <g transform={`rotate(${hourHandAngle}, 200, 200)`} filter={`url(#${handShadowId})`}>
            {/* Main Hour Hand Bar */}
            <path
              d="M 194.2,226 L 195.2,106 C 195.2,102 204.8,102 204.8,106 L 205.8,226 Z"
              fill="#090d16"
            />
          </g>

          {/* 2. Minute Hand (sleek black, longer and thinner tapered design) */}
          <g transform={`rotate(${minuteHandAngle}, 200, 200)`} filter={`url(#${handShadowId})`}>
            {/* Main Minute Hand Bar */}
            <path
              d="M 196.2,230 L 197.2,46 C 197.2,43 202.8,43 202.8,46 L 203.8,230 Z"
              fill="#090d16"
            />
          </g>

          {/* 3. Second Hand (vibrant premium orange station needle with black counterweight pointer) */}
          <g transform={`rotate(${secondHandAngle}, 200, 200)`} filter={`url(#${handShadowId})`}>
            {/* Tail counterbalance (dark metal/black) */}
            <line
              x1="200"
              y1="200"
              x2="200"
              y2="252"
              stroke="#090d16"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {/* Slim orange needle pointer */}
            <line
              x1="200"
              y1="200"
              x2="200"
              y2="34"
              stroke="#FF6B00"
              strokeWidth="2.0"
              strokeLinecap="round"
            />
          </g>

          {/* Multi-layered Shiny Center Hub Cap Pin */}
          <circle
            cx="200"
            cy="200"
            r="12.5"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="0.5"
          />
          <circle
            cx="200"
            cy="200"
            r="11.5"
            fill={`url(#${centralHubId})`}
            filter="drop-shadow(0px 1px 1.5px rgba(0,0,0,0.3))"
          />
          {/* Inner Orange Core */}
          <circle
            cx="200"
            cy="200"
            r="6.8"
            fill="#FF6B00"
          />
          {/* Speck/Highlight of light reflection */}
          <circle
            cx="198"
            cy="198"
            r="2.5"
            fill="#ffffff"
            opacity="0.8"
          />

          {/* 3D Glass Crystal Dome Overlay (diagonal glare reflection) */}
          <circle
            cx="200"
            cy="200"
            r="179"
            fill={`url(#${glassGradId})`}
            pointerEvents="none"
          />
        </svg>
      </div>
    </div>
  );
}

