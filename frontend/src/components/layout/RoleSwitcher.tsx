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
  Layers,
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
      case 'MINISTRY_ADMIN':
      case 'MINISTRY_OFFICIAL':
        return Landmark;
      case 'STATE_NODAL_AUTHORITY':
        return Layers;
      case 'MP':
        return Users;
      case 'DISTRICT_AUTHORITY':
        return Building2;
      case 'CITIZEN':
      default:
        return ShieldCheck;
    }
  };

  const CurrentIcon = getRoleIcon(currentRole);

  return (
    <div ref={containerRef} className="relative font-sans">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current Role: ${roleConfig.label}. Tap to switch perspective.`}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F0EFEA] border border-[#E4E2DC] text-[#121316] text-xs font-medium transition min-h-[38px] cursor-pointer"
        title="Switch Governance Perspective"
      >
        <div className="w-5 h-5 rounded-full bg-[#121316] text-[#FAF8F5] flex items-center justify-center shrink-0">
          <CurrentIcon className="w-3 h-3" />
        </div>
        <span className="hidden sm:inline font-medium text-[#121316]">
          {roleConfig.shortLabel}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-[#F0EFEA] text-[#71717A] text-[9px] font-mono uppercase border border-[#E4E2DC]">
          {roleConfig.badge}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${isOpen ? 'rotate-180 text-[#C85A32]' : ''}`} />
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
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#FAF8F5] rounded-2xl p-2.5 shadow-xl border border-[#E4E2DC] z-50 space-y-1 font-sans"
            >
              <div className="px-3 py-2 border-b border-[#E4E2DC] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-medium text-[#C85A32] uppercase tracking-widest block">
                    Statutory Perspective
                  </span>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Select operational mandate to tailor analytical views
                  </p>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
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
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF0EB] border border-[#E8C5B6]'
                        : 'hover:bg-[#F0EFEA] border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-[#C85A32] text-white' : 'bg-[#E4E2DC] text-[#4A4D53]'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#121316] truncate">
                          {cfg.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />}
                      </div>
                      <p className="text-[11px] text-[#71717A] line-clamp-2 mt-0.5 leading-relaxed">
                        {cfg.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#71717A]">
                          Scope: <strong className="text-[#121316] font-normal">{cfg.scope}</strong>
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
