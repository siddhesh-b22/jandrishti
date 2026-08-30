import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'modern' | 'image' | 'hybrid';
  showSubtitle?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  theme = 'light',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
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

  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-3 select-none font-manrope ${className}`}>
      {/* People's Rights & Civic Transparency Emblem */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#08102B] p-1.5 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0 group-hover:scale-105 transition-transform duration-200 relative overflow-hidden`}
      >
        {/* Ambient Top Light Flare */}
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-white/25 rounded-full blur-xs pointer-events-none" />

        {/* People's Rights & Drishti (Vision) Vector Emblem */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white drop-shadow-sm"
        >
          {/* 1. Constitutional Protection Shield */}
          <path
            d="M12 2.5L4.5 5.5V11C4.5 16 7.8 20.3 12 21.5C16.2 20.3 19.5 16 19.5 11V5.5L12 2.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255, 255, 255, 0.08)"
          />

          {/* 2. People / Citizen Icon at center of Shield (Head + Torso) */}
          <circle cx="12" cy="9.5" r="2.2" fill="currentColor" />
          <path
            d="M8.5 16.2C8.5 14.3 10.1 13 12 13C13.9 13 15.5 14.3 15.5 16.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* 3. Drishti / Transparency Rays at top */}
          <circle cx="12" cy="4.8" r="0.9" fill="#60A5FA" />
        </svg>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col text-left">
        <span
          className={`${titleSizes[size]} font-extrabold tracking-tight leading-none ${
            isDark ? 'text-white' : 'text-[#08102B]'
          }`}
        >
          Jan<span className="text-[#2563EB]">Drishti</span>
        </span>
        {showSubtitle && (
          <span
            className={`${subSizes[size]} font-extrabold tracking-widest uppercase font-mono mt-0.5 ${
              isDark ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            People's Rights &amp; Civic Audit
          </span>
        )}
      </div>
    </div>
  );
};
