import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
} from 'lucide-react';
import { useHouse } from '../../context/HouseContext';
import { BrandLogo } from '../common/BrandLogo';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { FollowTheMoneyModal } from '../common/FollowTheMoneyModal';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [followMoneyModalOpen, setFollowMoneyModalOpen] = useState(false);
  const { selectedHouse, setSelectedHouse } = useHouse();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Overview', end: true },
    { to: '/mps', label: 'Parliament' },
    { to: '/states', label: 'States' },
    { to: '/works', label: 'Works' },
    { to: '/transactions', label: 'Treasury' },
    { to: '/vendors', label: 'Contractors' },
    { to: '/anomalies', label: 'Signals' },
    { to: '/methodology', label: 'Methodology' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 transition-all duration-300">
        {/* Top Active Progress Glow Line */}
        <div className="h-0.5 bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#08102B] w-full" />

        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex items-center justify-between gap-4 transition-all duration-200 ${scrolled ? 'py-2.5' : 'py-3.5'}`}>
              {/* Left: Brand Mark */}
              <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
                <BrandLogo size="md" />
              </NavLink>

              {/* Center: Navigation Links (Alluxi Pill Navigation) */}
              <nav className="hidden lg:flex items-center gap-1 font-manrope font-bold text-xs text-slate-600 bg-slate-100/80 px-2 py-1.5 rounded-full border border-slate-200/70 shrink-0">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? 'bg-[#2563EB] text-white font-extrabold shadow-sm shadow-blue-500/30'
                          : 'hover:text-[#08102B] hover:bg-white/80'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              {/* Right: Search, Chamber Switcher & Alluxi CTA */}
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                {/* Global Search Button */}
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-slate-500 text-xs font-semibold transition shrink-0"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-manrope">Search</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-slate-400 border border-slate-200 font-mono font-bold">
                    ⌘K
                  </kbd>
                </button>

                {/* Chamber Selector Segment */}
                <div className="hidden sm:inline-flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200 text-xs font-manrope font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedHouse('ALL')}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                      selectedHouse === 'ALL'
                        ? 'bg-[#08102B] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHouse('LOK_SABHA')}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                      selectedHouse === 'LOK_SABHA'
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lok Sabha
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHouse('RAJYA_SABHA')}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                      selectedHouse === 'RAJYA_SABHA'
                        ? 'bg-[#1D4ED8] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rajya Sabha
                  </button>
                </div>

                {/* Alluxi Signature High-Contrast CTA Pill */}
                <button
                  type="button"
                  onClick={() => setFollowMoneyModalOpen(true)}
                  className="hidden md:inline-flex alx-btn-cta cursor-pointer text-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-manrope">Follow The Money</span>
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {/* Search Bar Mobile */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-manrope font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span>Search MPs, Works, Vendors...</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-slate-400 border border-slate-200 font-mono">
                    ⌘K
                  </kbd>
                </button>

                {/* Chamber Switcher Mobile */}
                <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl font-manrope text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedHouse('ALL')}
                    className={`flex-1 py-1.5 text-center rounded-lg transition ${
                      selectedHouse === 'ALL' ? 'bg-[#08102B] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    All Houses
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHouse('LOK_SABHA')}
                    className={`flex-1 py-1.5 text-center rounded-lg transition ${
                      selectedHouse === 'LOK_SABHA' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Lok Sabha
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHouse('RAJYA_SABHA')}
                    className={`flex-1 py-1.5 text-center rounded-lg transition ${
                      selectedHouse === 'RAJYA_SABHA' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Rajya Sabha
                  </button>
                </div>

                {/* Mobile Links */}
                <nav className="grid grid-cols-2 gap-1 pt-1 font-manrope font-bold text-xs">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-lg transition ${
                          isActive
                            ? 'bg-[#2563EB] text-white font-extrabold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setFollowMoneyModalOpen(true);
                    }}
                    className="w-full alx-btn-primary py-2.5 text-xs font-manrope font-bold"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    Launch Follow The Money Engine
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Follow The Money Modal */}
      <FollowTheMoneyModal
        isOpen={followMoneyModalOpen}
        onClose={() => setFollowMoneyModalOpen(false)}
      />
    </>
  );
};
