import React from 'react';

export const HeroTechIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center py-4 select-none">
      {/* Soft Ambient Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-100/60 via-indigo-100/40 to-blue-50/60 rounded-full blur-3xl -z-10" />

      <svg
        viewBox="0 0 520 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        {/* ================= LAPTOP ================= */}
        {/* Laptop Screen Outer Frame */}
        <rect
          x="30"
          y="35"
          width="310"
          height="200"
          rx="18"
          fill="#FFFFFF"
          stroke="#08102B"
          strokeWidth="4"
        />

        {/* Laptop Inner Display Screen */}
        <rect
          x="44"
          y="49"
          width="282"
          height="172"
          rx="10"
          fill="#EFF6FF"
        />

        {/* Laptop Display Header Bar */}
        <rect
          x="44"
          y="49"
          width="282"
          height="24"
          rx="6"
          fill="#DBEAFE"
        />
        <circle cx="60" cy="61" r="3.5" fill="#EF4444" />
        <circle cx="72" cy="61" r="3.5" fill="#F59E0B" />
        <circle cx="84" cy="61" r="3.5" fill="#10B981" />
        <rect x="105" y="56" width="90" height="10" rx="5" fill="#BFDBFE" />

        {/* Financial Line Graph on Laptop Screen */}
        <path
          d="M 65 175 L 110 145 L 160 160 L 210 110 L 260 125 L 305 85"
          fill="none"
          stroke="#2563EB"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Graph Gradient Area Under Line */}
        <path
          d="M 65 175 L 110 145 L 160 160 L 210 110 L 260 125 L 305 85 L 305 200 L 65 200 Z"
          fill="url(#laptopGraphGradient)"
          opacity="0.3"
        />

        {/* Graph Data Points (Connected Circles) */}
        <circle cx="65" cy="175" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="110" cy="145" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="160" cy="160" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="210" cy="110" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="260" cy="125" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="305" cy="85" r="6" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />

        {/* Mini Pill Stat Badge on Laptop */}
        <rect x="235" y="150" width="75" height="28" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2" />
        <text x="245" y="168" fill="#1E3A8A" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          ₹0.00 Var
        </text>

        {/* Laptop Base (Keyboard Hinge & Chassis) */}
        <path
          d="M 10 235 L 360 235 L 375 255 C 375 260 370 264 365 264 L 5 264 C 0 264 -5 260 -5 255 Z"
          fill="#FFFFFF"
          stroke="#08102B"
          strokeWidth="4"
        />
        {/* Trackpad notch */}
        <rect x="155" y="240" width="60" height="5" rx="2.5" fill="#CBD5E1" />

        {/* ================= SMARTPHONE ================= */}
        {/* Smartphone Body */}
        <rect
          x="330"
          y="75"
          width="135"
          height="220"
          rx="24"
          fill="#FFFFFF"
          stroke="#08102B"
          strokeWidth="4"
        />

        {/* Smartphone Screen */}
        <rect
          x="342"
          y="92"
          width="111"
          height="186"
          rx="14"
          fill="#EFF6FF"
        />

        {/* Smartphone Speaker Ear-Piece */}
        <rect x="380" y="82" width="35" height="4" rx="2" fill="#08102B" />

        {/* Smartphone Home Indicator Circle */}
        <circle cx="397.5" cy="265" r="7" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />

        {/* Smartphone Code Symbol </ > */}
        <text
          x="397.5"
          y="185"
          textAnchor="middle"
          fill="#2563EB"
          fontSize="36"
          fontWeight="bold"
          fontFamily="monospace"
        >
          &lt;/&gt;
        </text>

        {/* Mini Verified Shield Badge floating over Phone */}
        <rect x="360" y="205" width="75" height="24" rx="12" fill="#10B981" />
        <text x="397.5" y="221" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          100% Lineage
        </text>

        {/* Gradients */}
        <defs>
          <linearGradient id="laptopGraphGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
