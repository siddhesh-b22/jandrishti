import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Landmark,
  Users,
  Building2,
  ShieldCheck,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { useRole, UserRole, ROLE_CONFIGS } from '../../context/RoleContext';

export const RoleSwitcher: React.FC = () => {
  const { currentRole, roleConfig, setRole } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'MINISTRY_OFFICIAL':
        return Landmark;
      case 'MP':
        return Users;
      case 'DISTRICT_AUTHORITY':
        return Building2;
      case 'CITIZEN':
        return ShieldCheck;
    }
  };

  const CurrentIcon = getRoleIcon(currentRole);

  return (
    <div ref={containerRef} className="relative font-manrope">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current Role: ${roleConfig.label}. Tap to switch perspective.`}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition shadow-2xs min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
        title="Switch Governance Perspective"
      >
        <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0">
          <CurrentIcon className="w-3.5 h-3.5" />
        </div>
        <span className="hidden sm:inline font-bold text-[#08102B]">
          {roleConfig.shortLabel}
        </span>
        <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-[#2563EB] text-[9px] font-extrabold uppercase border border-blue-200">
          {roleConfig.badge}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#2563EB]' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="listbox"
              aria-label="Stakeholder Perspectives"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 z-50 space-y-1"
            >
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-widest block">
                    Tailored Governance Mode
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your operational role to highlight relevant insights
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
              </div>

              {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((rKey) => {
                const cfg = ROLE_CONFIGS[rKey];
                const Icon = getRoleIcon(rKey);
                const isSelected = currentRole === rKey;

                return (
                  <button
                    key={rKey}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setRole(rKey);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-3 min-h-[44px] cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200 shadow-2xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#08102B] truncate">
                          {cfg.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 font-light line-clamp-2 mt-0.5 leading-relaxed">
                        {cfg.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          Scope: <strong className="text-slate-700">{cfg.scope}</strong>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
