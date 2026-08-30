import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  IndianRupee,
  Layers,
  Receipt,
  ArrowRight,
  ShieldAlert,
  Landmark,
  MapPin,
  Building2,
  ShieldCheck,
  Droplets,
  Route,
  GraduationCap,
  HeartPulse,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  CheckCircle2,
  Search,
  Activity,
  Award,
  Sparkles,
  TrendingUp,
  Zap,
  BarChart3,
  Map as MapIcon,
} from 'lucide-react';
import { api } from '../api/client';
import { StatsResponse, StateSummary, WorkCategory } from '../api/types';
import { useHouse } from '../context/HouseContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { IndiaParliamentaryMap } from '../components/map/IndiaParliamentaryMap';
import { AnalyticsSuite } from '../components/analytics/AnalyticsSuite';
import { FollowTheMoneyModal } from '../components/common/FollowTheMoneyModal';
import { EntityDossierDrawer, DossierEntity } from '../components/common/EntityDossierDrawer';
import { useCountUp } from '../hooks/useCountUp';

// High-Resolution Iconic Public Infrastructure & National Releases
import slideParliamentChamber from '../assets/images/slide_parliament_chamber.jpg';
import slideChenab from '../assets/images/slide_chenab.jpg';
import slideAtalSetu from '../assets/images/slide_atalsetu.jpg';
import slideVandeMetro from '../assets/images/slide_vandebharat_metro.jpg';
import slidePamban from '../assets/images/slide_pamban.jpg';

export const OverviewPage: React.FC = () => {
  const { selectedHouse, setSelectedHouse } = useHouse();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [categories, setCategories] = useState<WorkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followTheMoneyOpen, setFollowTheMoneyOpen] = useState(false);
  const [activeDossier, setActiveDossier] = useState<DossierEntity | null>(null);
  const [commandViewMode, setCommandViewMode] = useState<'GRAPHS' | 'MAP'>('GRAPHS');

  // Hero Carousel State (5 Iconic High-Res Photos)
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDE_DURATION = 4500;

  const heroSlides = [
    {
      id: 0,
      title: 'Sansad Bhavan',
      image: slideParliamentChamber,
      tag: 'PARLIAMENTARY SOVEREIGNTY · 778 SEATS',
      titlePart1: 'Parliamentary Allocations.',
      titleHighlight: 'Traced to Ground Delivery.',
      desc: 'Auditing ₹11,667.55 Crore statutory development fund authorized across 778 parliamentary seats with zero accounting discrepancy.',
      stat: '₹11,667.55 Cr',
      statLabel: 'Statutory Corpus',
    },
    {
      id: 1,
      title: 'Chenab Bridge',
      image: slideChenab,
      tag: 'MEGA INFRASTRUCTURE · PUBLIC ASSETS',
      titlePart1: '102,437 Ground Works.',
      titleHighlight: 'Monitored Across 28 States & 8 UTs.',
      desc: 'Granular monitoring of drinking water pipelines, high-altitude bridges, schools, and hospitals across 28 States and 8 Union Territories.',
      stat: '102,437 Works',
      statLabel: 'Public Assets',
    },
    {
      id: 2,
      title: 'Atal Setu Link',
      image: slideAtalSetu,
      tag: 'COASTAL CORRIDORS · ZERO VARIANCE',
      titlePart1: 'Constitutional Integrity.',
      titleHighlight: '& Mathematical Reconciliation.',
      desc: 'Every rupee verified with strict double-entry ledger audits, ensuring ₹0.00 mathematical variance across central exchequer returns.',
      stat: '₹0.00 Variance',
      statLabel: 'Audit Standard',
    },
    {
      id: 3,
      title: 'Vande Metro Transit',
      image: slideVandeMetro,
      tag: 'RAPID MOBILITY · 82K+ VOUCHERS',
      titlePart1: '82,296 Treasury Records.',
      titleHighlight: 'Line-Item Lineage Verified.',
      desc: 'Direct financial visibility connecting central allocations to district-level treasury vouchers and modern Vande Metro transit disbursements.',
      stat: '₹3,947.25 Cr',
      statLabel: 'Disbursed Funds',
    },
    {
      id: 4,
      title: 'Pamban Bridge',
      image: slidePamban,
      tag: 'MARITIME CONNECTIVITY · OPEN DATA',
      titlePart1: 'Open Fiscal Intelligence.',
      titleHighlight: 'Empowering Every Citizen.',
      desc: 'Bridging public fund governance and grassroots visibility through explainable algorithms, interactive cartography, and vendor tracking.',
      stat: '22,377 Vendors',
      statLabel: 'Procurement Entities',
    },
  ];

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [statsData, statesData, catData] = await Promise.all([
          api.getStats({ house: selectedHouse === 'ALL' ? undefined : selectedHouse }),
          api.getStates({ house: selectedHouse === 'ALL' ? undefined : selectedHouse }),
          api.getCategories(),
        ]);
        setStats(statsData);
        setStates(statesData);
        setCategories(catData);
      } catch (err: any) {
        setError(err.message || 'Failed to connect to the JanDrishti analytical backend.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedHouse]);

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <LoadingSkeleton rows={3} height="h-24" />
        <LoadingSkeleton rows={4} height="h-32" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorDisplay
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const activeSlideData = heroSlides[currentSlide];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-manrope">
      {/* 01. ALLUXI-STYLE COMPACT HIGH-IMPACT HERO SECTION */}
      <section className="bg-[#F1F5F9] pt-6 md:pt-10 pb-8 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Column: Alluxi Typography & Dual CTA */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-4">
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-extrabold uppercase tracking-widest text-[#2563EB]">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
                </span>
                <span>Civic Intelligence &amp; Fiscal Forensics</span>
              </div>

              {/* Alluxi Signature Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl text-[#08102B] font-extrabold leading-[1.12] tracking-tight">
                Public finance is <span className="text-[#2563EB]">complex.</span> <br />
                Your civic intelligence <span className="text-[#2563EB]">shouldn't be.</span>
              </h1>

              {/* Body Subtitle */}
              <p className="text-slate-600 font-normal text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                Tracking ₹11,667.55 Crore across 102,437 works and 82,296 treasury vouchers for 778 Parliamentarians in 28 States &amp; 8 UTs. Deterministically reconciled to ₹0.00 variance.
              </p>

              {/* Action Buttons & Verified Checkmarks */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/mps"
                  className="w-full sm:w-auto alx-btn-primary text-center whitespace-nowrap cursor-pointer text-xs sm:text-sm"
                >
                  <span>Explore All 778 MPs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setFollowTheMoneyOpen(true)}
                  className="w-full sm:w-auto alx-btn-secondary text-center whitespace-nowrap cursor-pointer text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Follow The Money</span>
                </button>
              </div>

              {/* 3-Point Verified Assurance Checklist */}
              <ul className="pt-2 space-y-1.5 text-slate-600 font-medium text-xs text-left max-w-md mx-auto lg:mx-0">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>₹0.00 Reconciliation Variance:</strong> 100% matched to treasury vouchers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>100% Traceable Lineage:</strong> Official MoSPI &amp; eSAKSHI data</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>Explainable MAD Z-Scores:</strong> 1,831 non-accusatory analytical signals</span>
                </li>
              </ul>
            </div>

            {/* Right Column: Compact Device Frame & Photo Carousel */}
            <div className="lg:col-span-6 w-full">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="relative rounded-3xl bg-white p-3 shadow-3xl border border-slate-200/80 overflow-hidden group">
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeSlideData.id}
                        src={activeSlideData.image}
                        alt={activeSlideData.title}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full object-cover select-none"
                      />
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#08102B]/90 via-[#08102B]/30 to-transparent" />

                    <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[#08102B] text-[10px] font-extrabold tracking-wide uppercase shadow-md backdrop-blur-md">
                        {activeSlideData.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 z-20 text-white">
                      <p className="text-lg sm:text-xl font-extrabold tracking-tight drop-shadow-md">
                        {activeSlideData.title}
                      </p>
                      <p className="text-xs text-slate-200 line-clamp-2 mt-0.5 font-light">
                        {activeSlideData.desc}
                      </p>
                    </div>
                  </div>

                  {/* Carousel Navigation Strip */}
                  <div className="pt-2.5 pb-0.5 flex items-center justify-between gap-2 px-1.5">
                    <div className="flex items-center gap-1.5">
                      {heroSlides.map((slide, idx) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentSlide
                              ? 'w-6 bg-[#2563EB]'
                              : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#08102B] bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      <span className="font-mono text-[#2563EB]">{activeSlideData.stat}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 text-[10px]">{activeSlideData.statLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COVERAGE & TRUST MARQUEE TICKER */}
        <div className="pt-6 md:pt-8">
          <div className="relative overflow-hidden group/carousel py-1">
            <div className="flex gap-3 md:gap-4 animate-carousel-left group-hover/carousel:[animation-play-state:paused] w-max">
              {[
                '🏛️ MoSPI Official Portal',
                '🇮🇳 28 States & 8 UTs',
                '👥 778 Parliamentarians',
                '🏗️ 102,437 Physical Works',
                '📜 82,296 Treasury Vouchers',
                '🏢 22,377 Contractors',
                '🛡️ ₹0.00 Ledger Variance',
                '⚡ 1,831 MAD Signals',
                '📊 eSAKSHI Central Engine',
                '🏛️ MoSPI Official Portal',
                '🇮🇳 28 States & 8 UTs',
                '👥 778 Parliamentarians',
                '🏗️ 102,437 Physical Works',
                '📜 82,296 Treasury Vouchers',
                '🏢 22,377 Contractors',
                '🛡️ ₹0.00 Ledger Variance',
                '⚡ 1,831 MAD Signals',
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs text-xs font-bold text-slate-700 whitespace-nowrap"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#F1F5F9] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#F1F5F9] to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 02. WHY CIVIC TEAMS PICK JANDRISHTI (3 Compact Bento Outcome Cards) */}
      <section className="py-10 md:py-14 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Outcome Card 1: Zero Reconciliation Variance */}
            <div className="flex flex-col h-full rounded-3xl bg-white p-5 md:p-6 shadow-3xl hover:shadow-4xl transition-all duration-300 border border-slate-200/80">
              <p className="text-3xl sm:text-4xl font-extrabold leading-none tabular-nums bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] bg-clip-text text-transparent font-mono">
                ₹0.00
              </p>
              <p className="mt-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Reconciliation Variance
              </p>
              <h3 className="mt-3 pt-3 border-t border-slate-100 text-base md:text-lg text-[#08102B] font-extrabold">
                Zero rupee accounting discrepancy
              </h3>
              <p className="mt-1 text-xs md:text-sm text-slate-600 font-light leading-relaxed">
                100% of ₹3,947.25 Cr disbursed funds mathematically validated against line-item treasury vouchers.
              </p>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Double-Entry Reconciled
                </span>
                <Link
                  to="/methodology"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
                >
                  <span>Learn more</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Outcome Card 2: 102,437 Ground Projects */}
            <div className="flex flex-col h-full rounded-3xl bg-white p-5 md:p-6 shadow-3xl hover:shadow-4xl transition-all duration-300 border border-slate-200/80">
              <p className="text-3xl sm:text-4xl font-extrabold leading-none tabular-nums bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] bg-clip-text text-transparent font-mono">
                102,437
              </p>
              <p className="mt-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Physical Works Monitored
              </p>
              <h3 className="mt-3 pt-3 border-t border-slate-100 text-base md:text-lg text-[#08102B] font-extrabold">
                Ground infrastructure tracked end-to-end
              </h3>
              <p className="mt-1 text-xs md:text-sm text-slate-600 font-light leading-relaxed">
                Granular tracking of drinking water, roads, educational halls, and healthcare from recommendation to verified execution.
              </p>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  49.0% Delivery Rate
                </span>
                <Link
                  to="/works"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
                >
                  <span>Explore Works</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Outcome Card 3: 1,831 Statistical Signals */}
            <div className="flex flex-col h-full rounded-3xl bg-white p-5 md:p-6 shadow-3xl hover:shadow-4xl transition-all duration-300 border border-slate-200/80">
              <p className="text-3xl sm:text-4xl font-extrabold leading-none tabular-nums bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] bg-clip-text text-transparent font-mono">
                1,831
              </p>
              <p className="mt-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                MAD Statistical Signals
              </p>
              <h3 className="mt-3 pt-3 border-t border-slate-100 text-base md:text-lg text-[#08102B] font-extrabold">
                Objective audit signals, zero accusation
              </h3>
              <p className="mt-1 text-xs md:text-sm text-slate-600 font-light leading-relaxed">
                Median Absolute Deviation robust Z-score flagging vendor concentration, budget variance, and fund stall without bias.
              </p>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  21 Critical · 614 High
                </span>
                <Link
                  to="/anomalies"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
                >
                  <span>Inspect Signals</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03. INTERACTIVE ANALYTICAL & GEOSPATIAL COMMAND CENTER (High-Impact Graph Suite) */}
      <section className="py-10 md:py-14 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB] block">
                Visual Analytics &amp; Spatial Intelligence
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#08102B] tracking-tight mt-1">
                Forensic Command Center
              </h2>
            </div>

            {/* View Mode Switcher: Graphs vs Map */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setCommandViewMode('GRAPHS')}
                className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 ${
                  commandViewMode === 'GRAPHS' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Graphical Analytics</span>
              </button>
              <button
                type="button"
                onClick={() => setCommandViewMode('MAP')}
                className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 ${
                  commandViewMode === 'MAP' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span>28 States &amp; 8 UTs Map</span>
              </button>
            </div>
          </div>

          {/* Conditional Command View: Analytics Hub vs India Map */}
          {commandViewMode === 'GRAPHS' && stats ? (
            <AnalyticsSuite
              stats={stats}
              states={states}
              categories={categories}
              onSelectState={(stName) => navigate(`/mps?state=${encodeURIComponent(stName)}`)}
            />
          ) : (
            <div className="bg-white rounded-3xl p-4 md:p-6 shadow-3xl border border-slate-200/80">
              <IndiaParliamentaryMap
                states={states}
                stats={stats}
                onFollowTheMoney={() => setFollowTheMoneyOpen(true)}
              />
            </div>
          )}
        </div>
      </section>

      {/* 04. STREAMLINED DIGITAL SOLUTIONS SHOWCASE */}
      <section className="py-10 md:py-14 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB]">
              National Explorers
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#08102B] tracking-tight">
              Data solutions for real public accountability
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Portfolio 1: Parliamentarians */}
            <Link
              to="/mps"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-3xl hover:shadow-4xl transition-all duration-300 aspect-[16/11] flex flex-col justify-end p-5"
            >
              <img
                src={slideParliamentChamber}
                alt="Parliament"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08102B] via-[#08102B]/40 to-transparent" />
              <div className="relative z-10 space-y-1.5">
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#08102B] text-[10px] font-extrabold">
                    778 Members
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-extrabold">
                    Parliament
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Parliamentary Profiles
                </h3>
                <p className="text-xs text-slate-200 font-light line-clamp-1">
                  Performance cards and statutory allocation balances for all MPs.
                </p>
              </div>
            </Link>

            {/* Portfolio 2: Physical Works */}
            <Link
              to="/works"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-3xl hover:shadow-4xl transition-all duration-300 aspect-[16/11] flex flex-col justify-end p-5"
            >
              <img
                src={slideChenab}
                alt="Works"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08102B] via-[#08102B]/40 to-transparent" />
              <div className="relative z-10 space-y-1.5">
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#08102B] text-[10px] font-extrabold">
                    102,437 Works
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                    Infrastructure
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Physical Infrastructure
                </h3>
                <p className="text-xs text-slate-200 font-light line-clamp-1">
                  Drinking water, transportation, education, and healthcare projects.
                </p>
              </div>
            </Link>

            {/* Portfolio 3: Treasury Disbursements */}
            <Link
              to="/transactions"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-3xl hover:shadow-4xl transition-all duration-300 aspect-[16/11] flex flex-col justify-end p-5"
            >
              <img
                src={slideVandeMetro}
                alt="Treasury"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08102B] via-[#08102B]/40 to-transparent" />
              <div className="relative z-10 space-y-1.5">
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#08102B] text-[10px] font-extrabold">
                    82,296 Vouchers
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-extrabold">
                    Treasury
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Treasury Disbursements
                </h3>
                <p className="text-xs text-slate-200 font-light line-clamp-1">
                  Line-item disbursement vouchers matching central releases.
                </p>
              </div>
            </Link>

            {/* Portfolio 4: Contractor Intelligence */}
            <Link
              to="/vendors"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-3xl hover:shadow-4xl transition-all duration-300 aspect-[16/11] flex flex-col justify-end p-5"
            >
              <img
                src={slideAtalSetu}
                alt="Contractors"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08102B] via-[#08102B]/40 to-transparent" />
              <div className="relative z-10 space-y-1.5">
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#08102B] text-[10px] font-extrabold">
                    22,377 Vendors
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
                    Procurement
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Contractor Footprints
                </h3>
                <p className="text-xs text-slate-200 font-light line-clamp-1">
                  Procurement market share and patron reliance tracking.
                </p>
              </div>
            </Link>

            {/* Portfolio 5: 28 States & 8 UTs Atlas */}
            <Link
              to="/states"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-3xl hover:shadow-4xl transition-all duration-300 aspect-[16/11] flex flex-col justify-end p-5"
            >
              <img
                src={slidePamban}
                alt="States"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08102B] via-[#08102B]/40 to-transparent" />
              <div className="relative z-10 space-y-1.5">
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#08102B] text-[10px] font-extrabold">
                    36 Territories
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-extrabold">
                    Geospatial
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Spatial State Atlas
                </h3>
                <p className="text-xs text-slate-200 font-light line-clamp-1">
                  State and union territory fund utilization comparison cards.
                </p>
              </div>
            </Link>

            {/* Portfolio 6: Anomaly Signal Center */}
            <Link
              to="/anomalies"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-3xl hover:shadow-4xl transition-all duration-300 aspect-[16/11] flex flex-col justify-end p-5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#08102B] via-[#1E1B4B] to-[#BE123C]/80" />
              <div className="relative z-10 space-y-1.5">
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#08102B] text-[10px] font-extrabold">
                    1,831 Signals
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold">
                    Audit Engine
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  MAD Signal Center
                </h3>
                <p className="text-xs text-slate-200 font-light line-clamp-1">
                  Empirical statistical deviations across 5 audit categories.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 05. 4-STEP CIVIC DATA FORENSIC PIPELINE */}
      <section className="py-10 md:py-14 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB]">
              Architecture &amp; Proofs
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#08102B] tracking-tight">
              From raw government data to verified intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 shadow-xs space-y-2">
              <span className="text-2xl font-extrabold text-[#2563EB] font-mono">01</span>
              <h3 className="text-base font-extrabold text-[#08102B]">Data Ingestion</h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Automated ingestion of official reports across 778 MPs, 102K works, and 82K vouchers.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 shadow-xs space-y-2">
              <span className="text-2xl font-extrabold text-[#2563EB] font-mono">02</span>
              <h3 className="text-base font-extrabold text-[#08102B]">Ledger Validation</h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Double-entry fiscal validation verifying reconciliations with ₹0.00 discrepancy.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 shadow-xs space-y-2">
              <span className="text-2xl font-extrabold text-[#2563EB] font-mono">03</span>
              <h3 className="text-base font-extrabold text-[#08102B]">MAD Robust Z-Scores</h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Empirical anomaly engine computing 1,831 objective signals without outlier distortion.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 shadow-xs space-y-2">
              <span className="text-2xl font-extrabold text-[#2563EB] font-mono">04</span>
              <h3 className="text-base font-extrabold text-[#08102B]">Citizen Dossiers</h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Instant generation of verifiable entity dossiers, geospatial maps, and CSV exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 06. COMPACT HIGH-CONVERSION CIVIC CALL-TO-ACTION */}
      <section className="py-12 md:py-16 bg-[#08102B] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#2563EB]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#1E3A8A]/30 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Empowering Democratic Transparency
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Ready to audit your constituency's public developmental funds?
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
            Search any Member of Parliament, track local infrastructure delivery, and inspect treasury vouchers in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/mps"
              className="w-full sm:w-auto alx-btn-primary px-6 py-3 text-sm font-bold"
            >
              <span>Explore All 778 MPs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => setFollowTheMoneyOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition border border-white/20 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Launch Money Flow Tracer</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modals and Drawers */}
      <FollowTheMoneyModal
        isOpen={followTheMoneyOpen}
        onClose={() => setFollowTheMoneyOpen(false)}
      />

      <EntityDossierDrawer
        entity={activeDossier}
        onClose={() => setActiveDossier(null)}
      />
    </div>
  );
};
