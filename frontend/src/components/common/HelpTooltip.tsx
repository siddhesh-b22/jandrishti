import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  text: string;
  title?: string;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ text, title, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click (especially on mobile)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isVisible]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        aria-label={title ? `Help for ${title}` : 'Help information'}
        aria-expanded={isVisible}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
        className="p-1 rounded-full text-slate-400 hover:text-[#2563EB] focus-visible:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-colors cursor-pointer inline-flex items-center justify-center min-w-[24px] min-h-[24px]"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 bg-[#08102B] text-white text-xs rounded-2xl shadow-xl border border-slate-700 pointer-events-auto animate-fade-in font-manrope text-left"
        >
          {title && (
            <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5 border-b border-slate-700/80 pb-1 text-[#60A5FA]">
              <span>{title}</span>
            </div>
          )}
          <p className="text-slate-200 text-[11px] leading-relaxed font-light font-sans">
            {text}
          </p>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#08102B] rotate-45 border-r border-b border-slate-700 -mt-1" />
        </div>
      )}
    </div>
  );
};
