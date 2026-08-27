import React from 'react';
import logoImg from '../Logo/Logo SIH26102-Photoroom.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src={logoImg}
        alt="JanDrishti — Empowering Citizens"
        className={`${heightClasses[size]} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
      />
    </div>
  );
};
