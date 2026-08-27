import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Search,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useHouse } from '../../context/HouseContext';
import { BrandLogo } from '../common/BrandLogo';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-200 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between gap-4 transition-all duration-200 ${scrolled ? 'py-2.5' : 'py-3.5'}`}>
            {/* Left: Brand Mark */}
            <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
              <BrandLogo size="md" />
            </NavLink>

            {/* Center: Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 font-medium text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-full border border-slate-200/60 shrink-0">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-full transition duration-150 whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'hover:text-slate-900 hover:bg-slate-200/60'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right: Search & Single-Line Chamber Switcher */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Global Search Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 text-xs transition shrink-0"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-slate-400 border border-slate-200 font-mono font-bold">
                  ⌘K
                </kbd>
              </button>

              {/* Single-Line Sleek Chamber Switcher (No awkward wrapping!) */}
              <div className="hidden sm:flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs shrink-0 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedHouse('ALL')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    selectedHouse === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>All</span>
                  <span className={`text-[10px] font-mono ${selectedHouse === 'ALL' ? 'text-blue-600 font-extrabold' : 'text-slate-400'}`}>
                    778
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedHouse('LOK_SABHA')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    selectedHouse === 'LOK_SABHA'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Lok Sabha</span>
                  <span className={`text-[10px] font-mono ${selectedHouse === 'LOK_SABHA' ? 'text-blue-600 font-extrabold' : 'text-slate-400'}`}>
                    543
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedHouse('RAJYA_SABHA')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    selectedHouse === 'RAJYA_SABHA'
                      ? 'bg-white text-amber-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Rajya Sabha</span>
                  <span className={`text-[10px] font-mono ${selectedHouse === 'RAJYA_SABHA' ? 'text-amber-600 font-extrabold' : 'text-slate-400'}`}>
                    235
                  </span>
                </button>
              </div>

              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="sm:hidden p-2 rounded-full bg-slate-100 text-slate-700"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-full bg-slate-100 text-slate-700"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 text-sm font-medium shadow-lg"
            >
              {/* Mobile Chamber Segmented Control */}
              <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 grid grid-cols-3 gap-1 text-xs font-bold text-center">
                <button
                  type="button"
                  onClick={() => setSelectedHouse('ALL')}
                  className={`py-1.5 rounded-lg transition ${
                    selectedHouse === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700'
                  }`}
                >
                  All (778)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHouse('LOK_SABHA')}
                  className={`py-1.5 rounded-lg transition ${
                    selectedHouse === 'LOK_SABHA' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-700'
                  }`}
                >
                  Lok Sabha (543)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHouse('RAJYA_SABHA')}
                  className={`py-1.5 rounded-lg transition ${
                    selectedHouse === 'RAJYA_SABHA' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-700'
                  }`}
                >
                  Rajya Sabha (235)
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="grid grid-cols-2 gap-1 pt-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg transition font-bold text-xs ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
};
