import React from 'react';
import { Sparkles, Eye, ShieldCheck } from 'lucide-react';
import logoImg from '../Logo/Logo SIH26102-Photoroom.png';

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

  if (variant === 'image') {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <img
          src={logoImg}
          alt="JanDrishti Civic Intelligence"
          className={`${size === 'sm' ? 'h-8' : size === 'md' ? 'h-10' : size === 'lg' ? 'h-12' : 'h-16'} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
        />
      </div>
    );
  }

  if (variant === 'hybrid') {
    return (
      <div className={`flex items-center gap-3 select-none font-manrope ${className}`}>
        <img
          src={logoImg}
          alt="JanDrishti"
          className={`${size === 'sm' ? 'h-7' : size === 'md' ? 'h-9' : 'h-11'} w-auto object-contain`}
        />
        <div className="flex flex-col">
          <span className={`${titleSizes[size]} font-extrabold tracking-tight text-[#08102B] leading-none`}>
            Jan<span className="text-[#2563EB]">Drishti</span>
          </span>
          {showSubtitle && (
            <span className={`${subSizes[size]} font-extrabold text-slate-400 tracking-widest uppercase font-mono mt-0.5`}>
              Civic Intelligence
            </span>
          )}
        </div>
      </div>
    );
  }

  // Modern Alluxi-styled Icon Lockup (Drishti / Civic Vision Emblem)
  return (
    <div className={`flex items-center gap-2.5 select-none font-manrope ${className}`}>
      {/* Modern Geometric Civic Vision Emblem */}
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-[#2563EB] via-[#1D4ED8] to-[#60A5FA] p-0.5 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0 group-hover:scale-105 transition-transform duration-200 relative overflow-hidden`}>
        {/* Ambient Corner Flare */}
        <div className="absolute top-0 right-0 w-3 h-3 bg-white/30 rounded-full blur-xs pointer-events-none" />
        
        {/* Civic Vision Geometric Star & Eye SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
        >
          {/* 8-Ray Civic Star Structure (Alluxi Style) */}
          <path
            d="M12 2V6M12 18V22M2 12H6M18 12H22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Central Drishti Vision Core */}
          <circle cx="12" cy="12" r="3.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="#1D4ED8" />
        </svg>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col text-left">
        <span className={`${titleSizes[size]} font-extrabold tracking-tight text-[#08102B] leading-none`}>
          Jan<span className="text-[#2563EB]">Drishti</span>
        </span>
        {showSubtitle && (
          <span className={`${subSizes[size]} font-extrabold text-slate-400 tracking-widest uppercase font-mono mt-0.5`}>
            Civic Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
