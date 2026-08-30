import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'modern' | 'image' | 'hybrid';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'modern',
  showSubtitle = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  // Modern People's Civic Rights & Democratic Oversight Emblem
  // Fuses: 1. Civic Protection Shield (Rights) + 2. Three Sovereign Citizens / People ("Jan") + 3. Radiant Eye of Transparency ("Drishti")
  return (
    <div className={`flex items-center gap-3 select-none font-manrope ${className}`}>
      {/* People's Rights & Civic Drishti Emblem */}
      <div
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#08102B] p-1.5 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0 group-hover:scale-105 transition-all duration-300 relative overflow-hidden border border-white/20`}
      >
        {/* Soft Radial Ambient Flare */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-white/25 rounded-full blur-xs pointer-events-none" />

        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Outer Protective Shield of Public Rights */}
          <path
            d="M16 2.5 L28 7 C28 17 21 25.5 16 29.5 C11 25.5 4 17 4 7 Z"
            fill="url(#shieldFillGradient)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Central Eye / Drishti Arc of Democratic Oversight */}
          <path
            d="M8.5 13 C11 9.5 21 9.5 23.5 13 C21 16.5 11 16.5 8.5 13 Z"
            fill="#FFFFFF"
            fillOpacity="0.15"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Center Iris: Ashoka Chakra / Sovereign Citizen Sun */}
          <circle cx="16" cy="13" r="2.4" fill="#FFFFFF" />
          <circle cx="16" cy="13" r="1.1" fill="#2563EB" />

          {/* People / Citizens Triad ("Jan" - Community of Citizens Standing for Rights) */}
          {/* Left Citizen */}
          <circle cx="11.5" cy="19.5" r="1.4" fill="#93C5FD" />
          <path
            d="M8.8 24.5 C8.8 22.2 10.2 21.5 11.5 21.5 C12.8 21.5 14.2 22.2 14.2 24.5"
            stroke="#93C5FD"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Right Citizen */}
          <circle cx="20.5" cy="19.5" r="1.4" fill="#93C5FD" />
          <path
            d="M17.8 24.5 C17.8 22.2 19.2 21.5 20.5 21.5 C21.8 21.5 23.2 22.2 23.2 24.5"
            stroke="#93C5FD"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Center Lead Sovereign Citizen */}
          <circle cx="16" cy="18" r="1.8" fill="#FFFFFF" />
          <path
            d="M12.8 25.5 C12.8 22.8 14.4 21.8 16 21.8 C17.6 21.8 19.2 22.8 19.2 25.5"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="shieldFillGradient" x1="16" y1="2.5" x2="16" y2="29.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563EB" stopOpacity="0.6" />
              <stop offset="1" stopColor="#08102B" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col text-left">
        <span className={`${titleSizes[size]} font-extrabold tracking-tight text-[#08102B] leading-none`}>
          Jan<span className="text-[#2563EB]">Drishti</span>
        </span>
        {showSubtitle && (
          <span className={`${subSizes[size]} font-extrabold text-slate-400 tracking-widest uppercase font-mono mt-1`}>
            People's Civic Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
