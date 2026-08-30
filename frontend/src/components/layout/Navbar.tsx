import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Search,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Users,
  Building2,
  Receipt,
  MapPin,
  ShieldAlert,
  FileText,
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    setDropdownOpen(false);
  }, [location.pathname]);

  const explorerLinks = [
    { to: '/mps', label: '778 Parliamentarians', desc: 'Lok Sabha & Rajya Sabha MPs', icon: Users },
    { to: '/states', label: '28 States & 8 UTs', desc: 'National Spatial Atlas', icon: MapPin },
    { to: '/works', label: '102,437 Physical Works', desc: 'Ground Infrastructure', icon: Layers },
    { to: '/transactions', label: '82,296 Vouchers', desc: 'Treasury Disbursements', icon: Receipt },
    { to: '/vendors', label: '22,377 Contractors', desc: 'Vendor Intelligence', icon: Building2 },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-200 font-manrope ${scrolled ? 'shadow-xs border-b border-slate-200/80' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo */}
            <NavLink to="/" className="flex items-center group">
              <BrandLogo size="md" />
            </NavLink>

            {/* Center: Clean Text Navigation Links (Exact Alluxi Style) */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
              {/* Explorers Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-[#2563EB] py-2 transition"
                >
                  <span>Explorers</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-[#2563EB]' : 'text-slate-400'}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-72 bg-white rounded-2xl p-2 shadow-2xl border border-slate-200/90 z-50"
                    >
                      <div className="space-y-0.5">
                        {explorerLinks.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition group"
                            >
                              <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#08102B] group-hover:text-[#2563EB] transition">
                                  {item.label}
                                </div>
                                <div className="text-[11px] text-slate-500 font-light">
                                  {item.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink
                to="/mps"
                className={({ isActive }) =>
                  `hover:text-[#2563EB] transition ${isActive ? 'text-[#2563EB] font-bold' : ''}`
                }
              >
                Parliament
              </NavLink>

              <NavLink
                to="/works"
                className={({ isActive }) =>
                  `hover:text-[#2563EB] transition ${isActive ? 'text-[#2563EB] font-bold' : ''}`
                }
              >
                Public Works
              </NavLink>

              <NavLink
                to="/anomalies"
                className={({ isActive }) =>
                  `hover:text-[#2563EB] transition flex items-center gap-1.5 ${isActive ? 'text-[#2563EB] font-bold' : ''}`
                }
              >
                <span>Signals</span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 text-[10px] font-mono font-bold border border-rose-200">
                  1,831
                </span>
              </NavLink>

              <NavLink
                to="/methodology"
                className={({ isActive }) =>
                  `hover:text-[#2563EB] transition ${isActive ? 'text-[#2563EB] font-bold' : ''}`
                }
              >
                Methodology
              </NavLink>
            </nav>

            {/* Right: Search + Alluxi Style CTA Button */}
            <div className="flex items-center gap-3">
              {/* Quick Search Shortcut */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="hidden sm:flex items-center gap-2 p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition"
                title="Search (⌘K)"
              >
                <Search className="w-4 h-4 text-slate-600" />
              </button>

              {/* Alluxi Pill CTA Button */}
              <button
                type="button"
                onClick={() => setFollowMoneyModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-md shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Follow The Money</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-6 space-y-4"
            >
              <div className="space-y-2">
                <Link
                  to="/mps"
                  className="block px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-50"
                >
                  Parliament (778 MPs)
                </Link>
                <Link
                  to="/states"
                  className="block px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-50"
                >
                  28 States &amp; 8 UTs Atlas
                </Link>
                <Link
                  to="/works"
                  className="block px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-50"
                >
                  102,437 Public Works
                </Link>
                <Link
                  to="/transactions"
                  className="block px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-50"
                >
                  82,296 Treasury Vouchers
                </Link>
                <Link
                  to="/vendors"
                  className="block px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-50"
                >
                  22,377 Contractors
                </Link>
                <Link
                  to="/anomalies"
                  className="block px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-50"
                >
                  1,831 MAD Signals
                </Link>
                <Link
                  to="/methodology"
                  className="block px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-50"
                >
                  Technical Methodology
                </Link>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setFollowMoneyModalOpen(true);
                  }}
                  className="w-full py-3 rounded-full bg-[#2563EB] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Follow The Money</span>
                </button>
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
