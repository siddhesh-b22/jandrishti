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
  Train,
} from 'lucide-react';
import { api } from '../api/client';
import { StatsResponse, StateSummary, WorkCategory } from '../api/types';
import { useHouse } from '../context/HouseContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { IndiaParliamentaryMap } from '../components/map/IndiaParliamentaryMap';
import { FollowTheMoneyModal } from '../components/common/FollowTheMoneyModal';
import { EntityDossierDrawer, DossierEntity } from '../components/common/EntityDossierDrawer';
import { useCountUp } from '../hooks/useCountUp';

// High-Resolution Iconic Public Infrastructure & National Releases
import slideParliamentChamber from '../assets/images/slide_parliament_chamber.jpg';
import slideChenab from '../assets/images/slide_chenab.jpg';
import slideAtalSetu from '../assets/images/slide_atalsetu.jpg';
import slideVandeMetro from '../assets/images/slide_vandebharat_metro.jpg'; // Vande Metro Train
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

  // Hero Carousel State (5 Iconic High-Res Photos)
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDE_DURATION = 4500; // 4.5 seconds per slide for smooth continuous auto-advance

  const heroSlides = [
    {
      id: 0,
      title: 'Sansad Bhavan',
      image: slideParliamentChamber,
      tag: 'PARLIAMENTARY SOVEREIGNTY · 778 SEATS',
      titlePart1: 'Parliamentary Allocations.',
      titleHighlight: 'Traced to Ground Delivery.',
      highlightColor: 'text-blue-400',
      desc: 'Auditing ₹11,667.55 Crore statutory development fund authorized across 778 parliamentary seats with zero accounting discrepancy.',
      stat: '₹11,667.55 Cr',
      statLabel: 'Statutory Corpus',
      meta: '778 Parliamentary Seats',
    },
    {
      id: 1,
      title: 'Chenab Bridge',
      image: slideChenab,
      tag: 'MEGA INFRASTRUCTURE · PUBLIC ASSETS',
      titlePart1: '102,437 Ground Works.',
      titleHighlight: 'Monitored Across 28 States & 8 UTs.',
      highlightColor: 'text-emerald-400',
      desc: 'Granular monitoring of drinking water pipelines, high-altitude bridges, schools, and hospitals across 28 States and 8 Union Territories.',
      stat: '102,437 Works',
      statLabel: 'Public Assets',
      meta: '28 States & 8 UTs',
    },
    {
      id: 2,
      title: 'Atal Setu Link',
      image: slideAtalSetu,
      tag: 'COASTAL CORRIDORS · ZERO VARIANCE',
      titlePart1: 'Constitutional Integrity.',
      titleHighlight: '& Mathematical Reconciliation.',
      highlightColor: 'text-amber-400',
      desc: 'Every rupee verified with strict double-entry ledger audits, ensuring ₹0.00 mathematical variance across central exchequer returns.',
      stat: '₹0.00 Variance',
      statLabel: 'Audit Standard',
      meta: 'Double-Entry Verified',
    },
    {
      id: 3,
      title: 'Vande Metro Transit',
      image: slideVandeMetro, // Vande Metro Train Official Release
      tag: 'RAPID MOBILITY · 82K+ VOUCHERS',
      titlePart1: '82,296 Treasury Records.',
      titleHighlight: 'Line-Item Lineage Verified.',
      highlightColor: 'text-sky-400',
      desc: 'Direct financial visibility connecting central allocations to district-level treasury vouchers and modern Vande Metro transit disbursements.',
      stat: '₹3,947.25 Cr',
      statLabel: 'Disbursed Funds',
      meta: '82,296 Vouchers',
    },
    {
      id: 4,
      title: 'Pamban Bridge',
      image: slidePamban,
      tag: 'MARITIME CONNECTIVITY · OPEN DATA',
      titlePart1: 'Open Fiscal Intelligence.',
      titleHighlight: 'For Every Indian Citizen.',
      highlightColor: 'text-indigo-400',
      desc: 'Transforming complex ministerial ledgers into explainable statistical signals and verifiable public records for every constituency.',
      stat: '100% Open Data',
      statLabel: 'Public Trust',
      meta: 'Single Source of Truth',
    },
  ];

  // Continuous auto-advance carousel every 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const houseParam = selectedHouse === 'ALL' ? undefined : selectedHouse;
      const [statsData, statesData, categoriesData] = await Promise.all([
        api.getStats({ house: houseParam }),
        api.getStates({ house: houseParam }),
        api.getCategories(),
      ]);
      setStats(statsData);
      setStates(statesData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load national intelligence data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedHouse]);

  const heroMpsCount = useCountUp({
    end: stats?.total_mps || 778,
    duration: 900,
    trigger: !loading,
  });

  const heroWorksCount = useCountUp({
    end: stats?.total_recommended_works || 102437,
    duration: 1000,
    trigger: !loading,
  });

  const heroSignalsCount = useCountUp({
    end: stats?.total_anomalies || 1831,
    duration: 1100,
    trigger: !loading,
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in py-6 max-w-7xl mx-auto px-4">
        <div className="h-12 w-72 shimmer-skeleton rounded-lg" />
        <div className="h-[520px] w-full shimmer-skeleton rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-36 shimmer-skeleton rounded-xl" />
          <div className="h-36 shimmer-skeleton rounded-xl" />
          <div className="h-36 shimmer-skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return <ErrorDisplay message={error || 'Failed to initialize overview'} onRetry={loadData} />;
  }

  // 3 Civic Pillars (Institutional Services)
  const servicePillars = [
    {
      icon: Users,
      title: 'Parliamentary Allocation',
      desc: 'Complete tracking of ₹11,667.55 Cr statutory development fund across 543 Lok Sabha and 235 Rajya Sabha representatives.',
      metric: '₹11,667.55 Cr Authorized',
      metricSub: '778 Representatives',
      to: '/mps',
      toLabel: 'Inspect 778 Representatives',
      badgeColor: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      icon: Layers,
      title: 'Physical Works Delivery',
      desc: 'Granular monitoring of 102,437 developmental projects across drinking water, roads, education, and community healthcare.',
      metric: '102,437 Ground Works',
      metricSub: '61,842 Completed Works',
      to: '/works',
      toLabel: 'Inspect 102K+ Works Delivered',
      badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      icon: Receipt,
      title: 'Treasury Disbursements',
      desc: 'Line-item financial verification across 82,296 treasury vouchers with verified ₹0.00 mathematical reconciliation variance.',
      metric: '₹3,947.25 Cr Disbursed',
      metricSub: '82,296 Vouchers Reconciled',
      to: '/transactions',
      toLabel: 'Inspect 82,296 Vouchers',
      badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
  ];

  // 4 Features for "Why Choose JanDrishti"
  const darkSectionFeatures = [
    {
      icon: ShieldCheck,
      title: 'Double-Entry Audit',
      desc: 'Every single rupee reconciled with verified ₹0.00 variance against central ministry statutory standards.',
    },
    {
      icon: Activity,
      title: 'MAD Robust Z-Score',
      desc: 'Empirical Median Absolute Deviation algorithms isolating statistical deviations without arbitrary thresholds.',
    },
    {
      icon: Building2,
      title: 'Contractor Reliance',
      desc: 'Quantitative Herfindahl-Hirschman Index (HHI) calculating vendor concentration across districts.',
    },
    {
      icon: FileCheck,
      title: 'Deterministic Lineage',
      desc: '100% transparent audit trails connecting results directly to official raw source datasets.',
    },
  ];

  // Case Studies
  const caseStudies = [
    {
      image: slideAtalSetu,
      category: 'DRINKING WATER & SANITATION',
      title: '31,420 Ground Projects Completed',
      desc: 'Delivering pipeline infrastructure, community water filtration, and sanitation facilities nationwide.',
      metric: '30.7% of National Works',
      to: '/works',
    },
    {
      image: slideChenab,
      category: 'ROADS, PATHWAYS & BRIDGES',
      title: '28,150 Connectivity Arteries',
      desc: 'Linking rural gram panchayats, block headquarters, and developmental zones across 36 States.',
      metric: '27.5% of National Works',
      to: '/works',
    },
    {
      image: slideVandeMetro,
      category: 'TRANSIT & HIGH-SPEED MOBILITY',
      title: 'Vande Metro & Rail Assets',
      desc: 'Modernizing railway connectivity, passenger amenities, and regional mobility corridors across India.',
      metric: '27.8% of National Works',
      to: '/works',
    },
  ];

  return (
    <div className="space-y-12 lg:space-y-16 animate-fade-in pb-20 text-[#0F172A] bg-[#F8FAFC]">
      {/* ========================================================= */}
      {/* 01. MINIMAL & ATTRACTIVE 100% VIEWPORT HERO CAROUSEL       */}
      {/* (CLEAN VIEWPORT, NO CLUTTER, FLOATING MINIMAL INDICATORS)  */}
      {/* ========================================================= */}
      <section
        className="w-full relative overflow-hidden bg-slate-950 h-[calc(100vh-68px)] min-h-[580px] flex flex-col justify-between select-none shadow-2xl border-b border-slate-800/80"
      >
        {/* Dynamic Background Image with Smooth Crossfade & Motion */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].titlePart1}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          </AnimatePresence>

          {/* Minimal Clean Vignette Overlay (Leaves image open on the right) */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20" />
        </div>

        {/* Minimal Side Arrow Buttons (Desktop) */}
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/40 hover:bg-slate-900/80 backdrop-blur-md border border-white/10 text-white items-center justify-center transition active:scale-95 shadow-md hidden md:flex hover:scale-105"
          title="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/40 hover:bg-slate-900/80 backdrop-blur-md border border-white/10 text-white items-center justify-center transition active:scale-95 shadow-md hidden md:flex hover:scale-105"
          title="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Hero Content (Clean, Minimal, Non-Cluttered) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center pt-8">
          <div className="max-w-2xl space-y-4 sm:space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3 sm:space-y-4"
              >
                {/* Minimalist Kicker Tag */}
                <div className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                    {heroSlides[currentSlide].tag}
                  </span>
                </div>

                {/* Bold Editorial Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-black text-white tracking-tight leading-[1.1] font-display drop-shadow-md">
                  <span>{heroSlides[currentSlide].titlePart1} </span>
                  <span className={`${heroSlides[currentSlide].highlightColor} block sm:inline`}>
                    {heroSlides[currentSlide].titleHighlight}
                  </span>
                </h1>

                {/* Clear Context Subtitle */}
                <p className="text-xs sm:text-sm lg:text-base text-slate-300/90 leading-relaxed font-normal font-sans drop-shadow-xs max-w-xl">
                  {heroSlides[currentSlide].desc}
                </p>

                {/* Premium Financial Intelligence Capsule */}
                <div className="inline-flex flex-wrap items-center gap-3 p-3 px-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/15 text-white shadow-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-300 font-bold block uppercase font-mono tracking-wider">
                        {heroSlides[currentSlide].statLabel}
                      </span>
                      <strong className="text-sm sm:text-base font-black font-mono text-emerald-400 tracking-tight">
                        {heroSlides[currentSlide].stat}
                      </strong>
                    </div>
                  </div>

                  <span className="h-6 w-px bg-white/20 hidden sm:block" />

                  <div className="flex items-center gap-2 text-xs font-sans text-slate-200">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono font-medium text-slate-200">
                      {heroSlides[currentSlide].meta}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/states"
                className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 font-sans"
              >
                Explore National Map
              </Link>
              <button
                type="button"
                onClick={() => setFollowTheMoneyOpen(true)}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-xs sm:text-sm shadow-sm transition font-sans"
              >
                Trace Funds Flow
              </button>
            </div>
          </div>
        </div>

        {/* SLEEK FLOATING SLIDE INDICATOR PILLS (WITH CONTINUOUS PROGRESS ANIMATION) */}
        <div className="relative z-10 w-full py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer h-1.5 relative overflow-hidden ${
                  currentSlide === idx
                    ? 'w-9 bg-white/30 shadow-md shadow-blue-500/40'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Slide ${idx + 1}: ${slide.title}`}
              >
                {currentSlide === idx && (
                  <motion.div
                    key={`pill-progress-${idx}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                    className="absolute inset-0 bg-blue-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-slate-400 font-medium hidden sm:block">
            0{currentSlide + 1} / 0{heroSlides.length} · {heroSlides[currentSlide].title}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 02. OPTIMIZED PROVENANCE TRUST RIBBON                      */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 items-center">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="truncate">
              <strong className="text-xs font-bold text-slate-900 block truncate">778 Parliament</strong>
              <span className="text-[10px] text-slate-500 font-mono">Bicameral Seats</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <strong className="text-xs font-bold text-slate-900 block truncate">MoSPI Raw Data</strong>
              <span className="text-[10px] text-slate-500 font-mono">Ministry Source</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <strong className="text-xs font-bold text-slate-900 block truncate">28 States &amp; 8 UTs</strong>
              <span className="text-[10px] text-slate-500 font-mono">Territorial Atlas</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="truncate">
              <strong className="text-xs font-bold text-slate-900 block truncate">82,296 Vouchers</strong>
              <span className="text-[10px] text-slate-500 font-mono">Treasury Lineage</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-2 rounded-xl bg-rose-50/70 border border-rose-100">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <strong className="text-xs font-bold text-rose-950 block truncate">Zero Variance</strong>
              <span className="text-[10px] text-rose-700 font-mono">₹0.00 Reconciled</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 03. OPTIMIZED CORE CIVIC PILLARS (OUR SERVICES)           */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-wider block">
              CIVIC INTELLIGENCE PLATFORM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Our Core Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Trusted by Citizens &amp; Public Auditors Nationwide
            </p>
          </div>

          <Link
            to="/states"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 font-sans shrink-0 hover:underline"
          >
            <span>View 28 States &amp; 8 UTs Overview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servicePillars.map((serv, idx) => {
            const Icon = serv.icon;
            return (
              <div
                key={idx}
                className="card-executive p-6 rounded-3xl flex flex-col justify-between space-y-5 hover:border-blue-200 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${serv.badgeColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Pillar 0{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 font-display">{serv.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {serv.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between font-mono">
                    <strong className="text-sm font-black text-slate-900">{serv.metric}</strong>
                    <span className="text-[10px] text-slate-500 font-medium">{serv.metricSub}</span>
                  </div>

                  <Link
                    to={serv.to}
                    className="w-full py-2 px-4 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold transition inline-flex items-center justify-between group"
                  >
                    <span>{serv.toLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 04. WHO WE ARE (2 LARGE PHOTO CARDS)                      */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-display">
            Who We Are
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Personalized civic intelligence to trace public funds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="card-executive rounded-3xl overflow-hidden p-5 sm:p-6 space-y-4">
            <div className="h-52 rounded-2xl overflow-hidden relative">
              <img
                src={slideChenab}
                alt="Public Works"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900">
                Ground Execution
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 font-display">Physical Infrastructure Delivery</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tracking 102,437 developmental assets including drinking water systems, road networks, schools, and hospitals across 778 parliamentary constituencies.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500">102,437 Works Monitored</span>
              <Link
                to="/works"
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                Explore Works →
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-executive rounded-3xl overflow-hidden p-5 sm:p-6 space-y-4">
            <div className="h-52 rounded-2xl overflow-hidden relative">
              <img
                src={slideParliamentChamber}
                alt="Parliamentary Oversight"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900">
                Constitutional Oversight
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 font-display">Parliamentary Ledger Reconciled</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Direct territorial accountability connecting 543 Lok Sabha and 235 Rajya Sabha representatives with 82,296 treasury vouchers and 22,377 contractors.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500">778 Representatives Tracked</span>
              <Link
                to="/mps"
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                Inspect Parliament →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 05. SPATIAL ATLAS (INDIA MAP SECTION)                     */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            TERRITORIAL CANVAS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Every Allocation Has A Geography.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Interactive visual atlas across all 28 States &amp; 8 Union Territories of India.
          </p>
        </div>

        <IndiaParliamentaryMap states={states} stats={stats} />
      </section>

      {/* ========================================================= */}
      {/* 06. WHY CHOOSE JANDRISHTI (DARK SECTION)                  */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#0F172A] text-white p-6 sm:p-10 shadow-xl space-y-8">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Why Choose JanDrishti
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Objective mathematical rigor and open data standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {darkSectionFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white text-slate-900 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug font-display">{feat.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 font-sans">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-1">
            <Link
              to="/anomalies"
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-2 font-sans"
            >
              <span>Inspect Signal Center (1,831 Signals)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 07. RECENT CASE STUDIES (3-COLUMN GRID)                   */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Recent Case Studies
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Physical project execution across key developmental sectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {caseStudies.map((cs, idx) => (
            <div
              key={idx}
              className="card-executive rounded-3xl overflow-hidden p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="h-40 rounded-2xl overflow-hidden">
                  <img
                    src={cs.image}
                    alt={cs.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block font-mono">
                  {cs.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug font-display">{cs.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  {cs.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-700">{cs.metric}</span>
                <Link
                  to={cs.to}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition font-sans"
                >
                  View Case Study →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 08. TESTIMONIALS / BENCHMARKS                             */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Public Benchmarks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Authoritative national public data metrics.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-executive p-5 rounded-2xl text-center space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <MapPin className="w-4 h-4" />
            </div>
            <strong className="text-2xl font-black text-slate-900 font-mono block">28 + 8</strong>
            <span className="text-xs font-bold text-slate-600 uppercase">28 States &amp; 8 UTs</span>
          </div>

          <div className="card-executive p-5 rounded-2xl text-center space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Users className="w-4 h-4" />
            </div>
            <strong className="text-2xl font-black text-slate-900 font-mono block">{heroMpsCount}</strong>
            <span className="text-xs font-bold text-slate-600 uppercase">Parliamentarians</span>
          </div>

          <div className="card-executive p-5 rounded-2xl text-center space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Layers className="w-4 h-4" />
            </div>
            <strong className="text-2xl font-black text-slate-900 font-mono block">{heroWorksCount.toLocaleString()}</strong>
            <span className="text-xs font-bold text-slate-600 uppercase">Physical Works</span>
          </div>

          <div className="card-executive p-5 rounded-2xl text-center space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <strong className="text-2xl font-black text-slate-900 font-mono block">{heroSignalsCount.toLocaleString()}</strong>
            <span className="text-xs font-bold text-slate-600 uppercase">MAD Signals</span>
          </div>
        </div>
      </section>

      {/* Interactive Flow Modal */}
      <FollowTheMoneyModal isOpen={followTheMoneyOpen} onClose={() => setFollowTheMoneyOpen(false)} />

      {/* Slide-out Entity Dossier */}
      <EntityDossierDrawer entity={activeDossier} onClose={() => setActiveDossier(null)} />
    </div>
  );
};
