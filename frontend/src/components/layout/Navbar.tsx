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
  Copy,
} from 'lucide-react';
import { useHouse } from '../../context/HouseContext';
import { BrandLogo } from '../common/BrandLogo';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { FollowTheMoneyModal } from '../common/FollowTheMoneyModal';
import { RoleSwitcher } from './RoleSwitcher';

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
    { to: '/duplicates', label: 'Duplicate Work Studio', desc: 'AI/ML Overlap & Similarity', icon: Copy },
    { to: '/data-quality', label: 'Data Quality & Provenance', desc: 'Dataset Health & Proofs', icon: ShieldCheck },
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
                to="/cases"
                className={({ isActive }) =>
                  `hover:text-[#2563EB] transition flex items-center gap-1.5 ${isActive ? 'text-[#2563EB] font-bold' : ''}`
                }
              >
                <span>Alerts &amp; Cases</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-mono font-bold border border-blue-200">
                  Live Hub
                </span>
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

            {/* Right: Role Switcher + Search + Alluxi Style CTA Button */}
            <div className="flex items-center gap-2.5">
              {/* Stakeholder Role Switcher */}
              <RoleSwitcher />

              {/* Quick Search Shortcut */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="hidden sm:flex items-center gap-2 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
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
            <>
              <div
                className="fixed inset-0 top-20 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                id="mobile-navigation"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-2xl px-4 py-5 space-y-4 max-h-[80vh] overflow-y-auto z-50"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 block mb-1">
                    Risk &amp; Governance Command
                  </span>
                  <Link
                    to="/cases"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-blue-50/70 hover:text-[#2563EB] min-h-[44px] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                      <span>Alerts &amp; Review Cases</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-mono font-bold border border-blue-200">
                      Live Hub
                    </span>
                  </Link>
                  <Link
                    to="/duplicates"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 min-h-[44px] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Copy className="w-4 h-4 text-amber-600" />
                      <span>Duplicate Work Studio</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                      AI Scope
                    </span>
                  </Link>
                  <Link
                    to="/anomalies"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 min-h-[44px] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-rose-500" />
                      <span>Statistical Signals</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-mono font-bold border border-rose-200">
                      1,831
                    </span>
                  </Link>
                  <Link
                    to="/data-quality"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 min-h-[44px] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Data Quality &amp; Provenance</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                      96.4%
                    </span>
                  </Link>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 block mb-1">
                    Public Explorers
                  </span>
                  <Link
                    to="/works"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 min-h-[44px] transition"
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>102,437 Public Works</span>
                  </Link>
                  <Link
                    to="/transactions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 min-h-[44px] transition"
                  >
                    <Receipt className="w-4 h-4 text-slate-500" />
                    <span>82,296 Treasury Vouchers</span>
                  </Link>
                  <Link
                    to="/vendors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 min-h-[44px] transition"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>22,377 Contractors</span>
                  </Link>
                  <Link
                    to="/mps"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 min-h-[44px] transition"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>778 Parliamentarians</span>
                  </Link>
                  <Link
                    to="/states"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 min-h-[44px] transition"
                  >
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>28 States &amp; 8 UTs Atlas</span>
                  </Link>
                  <Link
                    to="/methodology"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 min-h-[44px] transition"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Technical Methodology</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setFollowMoneyModalOpen(true);
                    }}
                    className="w-full py-3 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md min-h-[44px] cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Follow The Money Tracker</span>
                  </button>
                </div>
              </motion.div>
            </>
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
