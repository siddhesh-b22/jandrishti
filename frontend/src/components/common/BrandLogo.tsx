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
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Editorial Monogram Badge */}
      <div
        className={`${iconSizes[size]} rounded-lg bg-[#121316] text-[#FAF8F5] flex items-center justify-center font-serif italic font-bold border border-[#2A2C32] shadow-xs shrink-0 group-hover:scale-105 transition-all duration-200 relative overflow-hidden`}
      >
        <span className="text-base sm:text-lg tracking-normal font-serif">J</span>
        <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-[#C85A32]" />
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col text-left">
        <span
          className={`${titleSizes[size]} font-sans font-bold tracking-[0.08em] uppercase leading-none ${
            isDark ? 'text-white' : 'text-[#121316]'
          }`}
        >
          Jan<span className="text-[#C85A32]">Drishti</span>
        </span>
        {showSubtitle && (
          <span
            className={`${subSizes[size]} font-mono font-medium tracking-[0.14em] uppercase mt-1 ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            }`}
          >
            MPLADS Statutory Audit
          </span>
        )}
      </div>
    </div>
  );
};
