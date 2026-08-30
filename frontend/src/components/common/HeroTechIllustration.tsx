import React from 'react';

export const HeroTechIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto flex items-center justify-center py-2 select-none">
      {/* Soft Ambient Backlight Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-100/70 via-indigo-100/50 to-emerald-50/60 rounded-full blur-3xl -z-10" />

      <svg
        viewBox="0 0 540 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        {/* ================= BACKGROUND: PARLIAMENT & CONSTITUTIONAL DOME ================= */}
        {/* Sansad Dome Silhouette */}
        <path
          d="M 170 120 C 170 50 310 50 310 120 Z"
          fill="#EFF6FF"
          stroke="#08102B"
          strokeWidth="3"
        />
        {/* Dome Finial / Ashoka Pillar Beacon */}
        <line x1="240" y1="50" x2="240" y2="25" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
        <circle cx="240" cy="22" r="6" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="240" cy="22" r="12" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />

        {/* Parliament Base Columns */}
        <rect x="155" y="120" width="170" height="24" rx="4" fill="#FFFFFF" stroke="#08102B" strokeWidth="3" />
        <line x1="180" y1="120" x2="180" y2="144" stroke="#08102B" strokeWidth="2.5" />
        <line x1="210" y1="120" x2="210" y2="144" stroke="#08102B" strokeWidth="2.5" />
        <line x1="240" y1="120" x2="240" y2="144" stroke="#08102B" strokeWidth="2.5" />
        <line x1="270" y1="120" x2="270" y2="144" stroke="#08102B" strokeWidth="2.5" />
        <line x1="300" y1="120" x2="300" y2="144" stroke="#08102B" strokeWidth="2.5" />

        {/* ================= MAIN CIVIC INTELLIGENCE INTERACTIVE TERMINAL ================= */}
        {/* Main Terminal Screen Outer Chassis */}
        <rect
          x="70"
          y="100"
          width="320"
          height="195"
          rx="20"
          fill="#FFFFFF"
          stroke="#08102B"
          strokeWidth="4"
        />

        {/* Inner Glass Display Screen */}
        <rect
          x="84"
          y="114"
          width="292"
          height="167"
          rx="12"
          fill="#F8FAFC"
        />

        {/* Terminal Header Bar */}
        <rect
          x="84"
          y="114"
          width="292"
          height="28"
          rx="8"
          fill="#EFF6FF"
        />
        {/* Traffic Light Dots */}
        <circle cx="102" cy="128" r="4" fill="#EF4444" />
        <circle cx="116" cy="128" r="4" fill="#F59E0B" />
        <circle cx="130" cy="128" r="4" fill="#10B981" />
        <rect x="150" y="122" width="120" height="12" rx="6" fill="#DBEAFE" />

        {/* Live Public Audit Financial Wave (Line Graph) */}
        <path
          d="M 105 235 L 145 190 L 195 210 L 250 155 L 305 175 L 355 135"
          fill="none"
          stroke="#2563EB"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gradient Fill Under Graph */}
        <path
          d="M 105 235 L 145 190 L 195 210 L 250 155 L 305 175 L 355 135 L 355 260 L 105 260 Z"
          fill="url(#civicGraphGrad)"
          opacity="0.25"
        />

        {/* Graph Data Node Points */}
        <circle cx="105" cy="235" r="5.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="145" cy="190" r="5.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="195" cy="210" r="5.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="250" cy="155" r="5.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="305" cy="175" r="5.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
        <circle cx="355" cy="135" r="7" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />

        {/* Zero Variance Shield Floating Card */}
        <g transform="translate(195, 175)">
          <rect width="95" height="34" rx="10" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
          <circle cx="16" cy="17" r="7" fill="#ECFDF5" />
          <path d="M13 17 L15.5 19.5 L19.5 14.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="30" y="16" fill="#065F46" fontSize="9" fontWeight="800" fontFamily="system-ui, sans-serif">
            ₹0.00 VARIANCE
          </text>
          <text x="30" y="27" fill="#047857" fontSize="7.5" fontWeight="600" fontFamily="system-ui, sans-serif">
            Double-Entry Verified
          </text>
        </g>

        {/* Terminal Pedestal Base */}
        <path
          d="M 40 295 L 420 295 L 440 315 C 440 320 435 324 430 324 L 30 324 C 25 324 20 320 20 315 Z"
          fill="#FFFFFF"
          stroke="#08102B"
          strokeWidth="4"
        />
        <rect x="200" y="302" width="60" height="6" rx="3" fill="#CBD5E1" />

        {/* ================= CITIZENS / PEOPLE'S RIGHTS FIGURE (Right Side) ================= */}
        {/* Citizen 1 (Lead Citizen auditing public works with transparency shield) */}
        <g transform="translate(390, 110)">
          {/* Citizen Body */}
          <circle cx="45" cy="30" r="16" fill="#FFFFFF" stroke="#08102B" strokeWidth="3.5" />
          {/* Hair / Head detail */}
          <path d="M 32 26 C 35 18 55 18 58 26" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Citizen Torso */}
          <path
            d="M 18 105 C 18 65 72 65 72 105 Z"
            fill="#FFFFFF"
            stroke="#08102B"
            strokeWidth="3.5"
          />

          {/* Citizen Badge / People's Rights Sash */}
          <path d="M 28 72 L 62 102" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />

          {/* Floating People's Rights Card Held by Citizen */}
          <rect x="-25" y="55" width="60" height="75" rx="12" fill="#FFFFFF" stroke="#08102B" strokeWidth="3.5" />
          <rect x="-16" y="65" width="42" height="12" rx="4" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="5" y="74" textAnchor="middle" fill="#1E40AF" fontSize="7" fontWeight="bold" fontFamily="system-ui">
            CITIZEN RIGHT
          </text>
          
          {/* Mini Verified Checkmark on Card */}
          <circle cx="5" cy="98" r="14" fill="#2563EB" />
          <path d="M -1 98 L 3 102 L 11 94" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="5" y="122" textAnchor="middle" fill="#08102B" fontSize="6.5" fontWeight="bold" fontFamily="system-ui">
            100% PUBLIC
          </text>
        </g>

        {/* ================= CONNECTED GROUND ASSET NODES (Water, Roads, School) ================= */}
        {/* Node 1: 28 States & 8 UTs Geo Beacon */}
        <g transform="translate(30, 75)">
          <circle cx="20" cy="20" r="18" fill="#FFFFFF" stroke="#08102B" strokeWidth="3" />
          <path d="M 20 8 L 24 16 L 32 17 L 26 23 L 28 31 L 20 27 L 12 31 L 14 23 L 8 17 L 16 16 Z" fill="#F59E0B" />
          <text x="20" y="48" textAnchor="middle" fill="#08102B" fontSize="8" fontWeight="bold" fontFamily="system-ui">
            28 States · 8 UTs
          </text>
        </g>
        <line x1="68" y1="95" x2="88" y2="115" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />

        {/* Node 2: 102,437 Public Works Node */}
        <g transform="translate(30, 200)">
          <circle cx="18" cy="18" r="16" fill="#FFFFFF" stroke="#08102B" strokeWidth="3" />
          <path d="M 10 22 L 18 10 L 26 22 Z" fill="#2563EB" />
          <text x="18" y="44" textAnchor="middle" fill="#08102B" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">
            102K Works
          </text>
        </g>
        <line x1="62" y1="215" x2="84" y2="215" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />

        {/* Gradients */}
        <defs>
          <linearGradient id="civicGraphGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
