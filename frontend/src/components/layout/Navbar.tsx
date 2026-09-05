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
  Users,
  Building2,
  Receipt,
  MapPin,
  ShieldAlert,
  FileText,
  Copy,
  Scale,
  LayoutDashboard,
  UploadCloud,
  Landmark,
  Compass,
  FileCheck,
  LogIn,
  LogOut,
  Sparkles,
  Sliders
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { FollowTheMoneyModal } from '../common/FollowTheMoneyModal';
import { useRole } from '../../context/RoleContext';
import { getRoleHomeRoute, getNavStructureForRole } from '../../utils/roleRoutes';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, roleConfig } = useRole();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [followMoneyModalOpen, setFollowMoneyModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
    setActiveDropdown(null);
  }, [location.pathname]);

  const navStructure = getNavStructureForRole(user?.role);
  const homeRoute = getRoleHomeRoute(user?.role);

  return (
    <>
      <header className={`sticky top-0 z-50 bg-[#FAF8F5]/94 backdrop-blur-md transition-all duration-200 border-b ${scrolled ? 'border-[#E4E2DC] shadow-xs' : 'border-[#E4E2DC]/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[4.75rem] py-2.5 sm:py-3.5">
            {/* Left: Brand Monogram & Name */}
            <Link to={homeRoute} className="flex items-center group">
              <BrandLogo size="md" />
            </Link>

            {/* Center: Truly Role-Adaptive Navigation Links (Strictly No Locked Items) */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#4A4D53] tracking-[0.04em] uppercase font-sans">
              {/* Primary Links Permitted for This Role */}
              {navStructure.primaryLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `hover:text-[#121316] transition ${isActive ? 'text-[#C85A32] font-semibold' : ''}`
                  }
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}

              {/* Dynamic Dropdowns Permitted for This Role */}
              {navStructure.dropdowns?.map((dropdown) => (
                <div
                  key={dropdown.key}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(dropdown.key)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 py-2 hover:text-[#121316] transition cursor-pointer ${
                      dropdown.items.some((item) => location.pathname.startsWith(item.to))
                        ? 'text-[#C85A32] font-semibold'
                        : ''
                    }`}
                  >
                    <span>{dropdown.title}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        activeDropdown === dropdown.key ? 'rotate-180 text-[#C85A32]' : 'text-[#71717A]'
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === dropdown.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 w-80 bg-[#FAF8F5] rounded-2xl p-2 shadow-xl border border-[#E4E2DC] z-50 normal-case"
                      >
                        <div className="px-3 py-1.5 border-b border-[#E4E2DC] mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C85A32] font-semibold">
                            {dropdown.title}
                          </span>
                          <span className="text-[9px] font-mono text-[#71717A]">Role Permitted</span>
                        </div>
                        <div className="space-y-0.5">
                          {dropdown.items.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-start gap-3 p-2 rounded-xl hover:bg-[#F0EFEA] transition group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-[#121316] group-hover:text-[#C85A32] transition">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.2 rounded bg-[#FAF0EB] text-[#C85A32] text-[9px] font-mono border border-[#E8C5B6]">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                {item.desc && (
                                  <div className="text-[11px] text-[#71717A] font-light truncate">
                                    {item.desc}
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right: Role Identity Badge or Official Login */}
            <div className="flex items-center gap-2.5">
              {/* Quick Search Trigger */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[#F0EFEA] text-[#71717A] transition border border-[#E4E2DC] text-xs font-mono cursor-pointer"
                title="Search (⌘K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="text-[11px]">⌘K</span>
              </button>

              {/* Follow The Money Modal Trigger */}
              <button
                type="button"
                onClick={() => setFollowMoneyModalOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] text-xs text-[#121316] border border-[#E4E2DC] hover:border-[#C85A32] transition cursor-pointer font-sans"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                <span className="font-medium text-xs">Trace Money</span>
              </button>

              {/* Login / Auth Identity Badge */}
              {isAuthenticated && user ? (
                <div className="relative font-sans">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF0EB] hover:bg-[#F3E5DE] border border-[#E8C5B6] text-xs transition cursor-pointer min-h-[38px]"
                    title={`Logged in as ${user.display_name} (${user.role})`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-[10px] font-bold">
                      {user.display_name.charAt(0)}
                    </div>
                    <span className="hidden xl:inline text-[#121316] font-medium max-w-[130px] truncate">
                      {user.display_name}
                    </span>
                    <span className="hidden md:inline px-1.5 py-0.2 rounded bg-white text-[#C85A32] text-[9px] font-mono uppercase border border-[#E8C5B6]">
                      {user.jurisdiction}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#71717A]" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                          aria-hidden="true"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-72 bg-[#FAF8F5] rounded-2xl p-3 shadow-xl border border-[#E4E2DC] z-50 normal-case space-y-2.5"
                        >
                          <div className="border-b border-[#E4E2DC] pb-2 px-1">
                            <div className="text-xs font-semibold text-[#121316]">{user.display_name}</div>
                            <div className="text-[10px] font-mono text-[#71717A] mt-0.5">
                              Role: <span className="text-[#C85A32] font-semibold">{user.role}</span>
                            </div>
                            <div className="text-[10px] font-mono text-[#71717A]">
                              Scope: <span className="text-[#121316] font-medium">{user.jurisdiction_type} ({user.jurisdiction})</span>
                            </div>
                            <div className="mt-1.5">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#EBF5EE] text-[#1E7E34] border border-[#BCE2C5]">
                                ✓ Statutory Official Mandate
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Link
                              to={homeRoute}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-[#F0EFEA] text-[#121316] transition"
                            >
                              <span>Open Role Workspace</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
                            </Link>
                            <Link
                              to="/login"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-[#F0EFEA] text-[#121316] transition"
                            >
                              <span>Switch Official Identity</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                logout();
                                setUserMenuOpen(false);
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-[#FAF0EB] text-[#C85A32] transition cursor-pointer font-medium"
                            >
                              <span>Sign Out to Citizen Mode</span>
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E4E2DC] hover:border-[#C85A32] bg-[#FAF8F5] hover:bg-white text-xs text-[#121316] transition min-h-[38px] shadow-2xs group"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#C85A32] group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-semibold tracking-wide">Official Login</span>
                  <span className="hidden md:inline text-[10px] text-[#71717A] font-mono border-l border-[#E4E2DC] pl-2">Authorities</span>
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#4A4D53] hover:text-[#121316] hover:bg-[#F0EFEA] transition"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden bg-[#FAF8F5] border-b border-[#E4E2DC] shadow-2xl px-4 py-5 space-y-4 max-h-[80vh] overflow-y-auto font-sans"
            >
              {/* Primary Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-medium text-[#71717A] uppercase tracking-widest px-3 block mb-1">
                  Permitted Modules
                </span>
                {navStructure.primaryLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-[#121316] hover:bg-[#F0EFEA] transition text-xs uppercase"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
                  </Link>
                ))}
              </div>

              {/* Dropdowns on Mobile */}
              {navStructure.dropdowns?.map((dropdown) => (
                <div key={dropdown.key} className="space-y-1 pt-2 border-t border-[#E4E2DC]">
                  <span className="text-[10px] font-mono font-medium text-[#71717A] uppercase tracking-widest px-3 block mb-1">
                    {dropdown.title}
                  </span>
                  {dropdown.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#121316] hover:bg-[#F0EFEA] transition"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-[#FAF0EB] text-[#C85A32] text-[9px] font-mono">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ))}

              {/* Login or Sign out on Mobile */}
              <div className="pt-2 border-t border-[#E4E2DC]">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full cw-btn-primary py-2.5 text-xs text-center justify-center flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Official Authority Sign In</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white border border-[#E4E2DC] text-xs text-[#C85A32] font-semibold text-center justify-center flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out to Citizen Mode</span>
                  </button>
                )}
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
