import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  ShieldCheck,
  ShieldAlert,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCheck,
  Zap,
  Activity,
  Layers,
  Receipt,
  Building2,
  Lock,
} from 'lucide-react';

interface StageDetail {
  id: number;
  step: string;
  title: string;
  tagline: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  bgGrad: string;
  accentBorder: string;
  description: string;
  technicalSpecs: Array<{ label: string; value: string }>;
  deliverables: string[];
  ctaLink: string;
  ctaText: string;
}

export const HowJanDrishtiWorks: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages: StageDetail[] = [
    {
      id: 1,
      step: '01',
      title: 'Official Registry Ingestion',
      tagline: 'Multi-Source Parsing & Immutable Data Architecture',
      badge: '100% Traceable Lineage',
      icon: Database,
      color: '#2563EB',
      bgGrad: 'from-blue-600/10 via-blue-500/5 to-transparent',
      accentBorder: 'border-blue-500/30',
      description:
        'JanDrishti continuously ingests public developmental data directly from official government registries including MoSPI and the eSAKSHI portal. Over 102,437 physical works, 82,296 treasury vouchers, and 22,377 vendors are ingested into a high-performance, read-only immutable SQLite architecture.',
      technicalSpecs: [
        { label: 'Scope', value: '778 Parliamentarians (543 LS / 235 RS)' },
        { label: 'Coverage', value: '28 States & 8 Union Territories' },
        { label: 'Ingested Works', value: '102,437 Physical Ground Projects' },
        { label: 'Treasury Records', value: '82,296 Line-Item Vouchers' },
      ],
      deliverables: [
        'Automated ETL normalization across 36 State jurisdictions',
        'Immutable SQLite schema preventing unauthorized data mutations',
        'Standardized category taxonomy (Water, Roads, Education, Health)',
      ],
      ctaLink: '/works',
      ctaText: 'Inspect Ingested Works Registry',
    },
    {
      id: 2,
      step: '02',
      title: 'Deterministic Double-Entry Reconciliation',
      tagline: 'Ledger Audit with Zero Accounting Discrepancy',
      badge: '₹0.00 Variance Guaranteed',
      icon: ShieldCheck,
      color: '#10B981',
      bgGrad: 'from-emerald-600/10 via-emerald-500/5 to-transparent',
      accentBorder: 'border-emerald-500/30',
      description:
        'Every rupee of the ₹11,667.55 Cr statutory allocation is mathematically balanced against central exchequer releases and line-item expenditure vouchers. JanDrishti guarantees a strict ₹0.00 accounting discrepancy across all 778 parliamentary portfolios.',
      technicalSpecs: [
        { label: 'Statutory Corpus', value: '₹11,667.55 Crore Total' },
        { label: 'Disbursed Spend', value: '₹3,947.25 Crore (33.8%)' },
        { label: 'Unspent Balance', value: '₹7,720.30 Crore (66.2%)' },
        { label: 'Accounting Error', value: '₹0.00 Exact Mathematical Zero' },
      ],
      deliverables: [
        'Double-entry validation matching statutory releases to vouchers',
        'Strict isolation between sanctioned funds and actual disbursements',
        'Zero-trust validation pipeline executing deterministic checks',
      ],
      ctaLink: '/methodology',
      ctaText: 'View Double-Entry Ledger Proofs',
    },
    {
      id: 3,
      step: '03',
      title: 'MAD Robust Statistical Analysis',
      tagline: 'Objective Anomaly Detection Without Political Bias',
      badge: '1,831 Objective Flags',
      icon: ShieldAlert,
      color: '#F59E0B',
      bgGrad: 'from-amber-600/10 via-amber-500/5 to-transparent',
      accentBorder: 'border-amber-500/30',
      description:
        'Rather than subjective human flagging, JanDrishti employs the Median Absolute Deviation (MAD) algorithm—a non-parametric, outlier-resilient statistical model. It detects 1,831 empirical deviations across vendor monopolies, cost overruns, timeline stalls, and disbursement velocity.',
      technicalSpecs: [
        { label: 'Total Flags', value: '1,831 MAD Statistical Signals' },
        { label: 'Critical Risk', value: '21 Signals (Z > 4.5 or HHI > 8000)' },
        { label: 'High Priority', value: '614 Signals (Substantial Variance)' },
        { label: 'Algorithm', value: 'Modified Z-Score via Median Absolute Deviation' },
      ],
      deliverables: [
        'Contractor Concentration Index (Herfindahl-Hirschman HHI)',
        'Project execution duration vs national median benchmark',
        'Explainable audit trails with exact mathematical formulas',
      ],
      ctaLink: '/anomalies',
      ctaText: 'Inspect 1,831 MAD Audit Signals',
    },
    {
      id: 4,
      step: '04',
      title: 'Public Dossiers & Citizen Access',
      tagline: 'Open Democratic Access for 1.4 Billion Citizens',
      badge: 'Free & Open Public API',
      icon: Users,
      color: '#8B5CF6',
      bgGrad: 'from-purple-600/10 via-purple-500/5 to-transparent',
      accentBorder: 'border-purple-500/30',
      description:
        'Empowering democratic accountability by translating complex public exchequer data into instant, searchable citizen dossiers, interactive geospatial maps, money flow tracers, and high-performance open REST APIs.',
      technicalSpecs: [
        { label: 'Geospatial Atlas', value: 'Interactive 28 States & 8 UTs Map' },
        { label: 'Search Speed', value: '< 25ms Real-Time Filter Engine' },
        { label: 'API Specs', value: 'FastAPI OpenAPI / Swagger Interactive Specs' },
        { label: 'Public Export', value: 'CSV, JSON & PDF Dossiers' },
      ],
      deliverables: [
        'Constituency report cards for all 778 Members of Parliament',
        'Interactive Money Flow tracer linking MPs, Contractors, and Works',
        'Open REST API powering researchers, journalists, and civic advocates',
      ],
      ctaLink: '/mps',
      ctaText: 'Explore Parliamentarians Directory',
    },
  ];

  const current = stages.find((s) => s.id === activeStage) || stages[0];
  const CurrentIcon = current.icon;

  return (
    <div className="space-y-6 font-manrope">
      {/* 1. Header & Tagline */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#2563EB] text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          End-to-End Verification Pipeline
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#08102B] tracking-tight">
          How JanDrishti Processes Public Finance
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
          From raw parliamentary records to mathematical reconciliation and objective civic dossiers.
        </p>
      </div>

      {/* 2. Interactive 4-Step Stepper Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isActive = stage.id === activeStage;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStage(stage.id)}
              className={`p-3 rounded-xl transition-all duration-200 text-left flex items-center gap-3 relative ${
                isActive
                  ? 'bg-white text-[#08102B] shadow-sm border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                  isActive ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {stage.step}
              </span>
              <div className="truncate">
                <div className="text-xs font-extrabold truncate">{stage.title}</div>
                <div className="text-[10px] text-slate-400 font-medium truncate">{stage.badge}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Active Stage Deep-Dive Showcase Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl bg-white p-5 sm:p-7 shadow-3xl border border-slate-200/90 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
        >
          {/* Left Column: Description & Deliverables */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2.5">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20"
                style={{ backgroundColor: current.color }}
              >
                <CurrentIcon className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  STAGE {current.step} OF 04
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#08102B] leading-tight">
                  {current.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
              {current.description}
            </p>

            {/* Key Deliverables Checkmarks */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                Verification Deliverables:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {current.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <Link
                to={current.ctaLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{current.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Live Technical Specifications Grid */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#08102B] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
                Technical Parameters
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                Verified
              </span>
            </div>

            <div className="space-y-2.5">
              {current.technicalSpecs.map((spec, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-500 font-medium">{spec.label}:</span>
                  <strong className="text-slate-900 font-mono font-bold text-right ml-2">
                    {spec.value}
                  </strong>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[10px] text-slate-400 font-mono text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Read-Only Immutable Production Engine</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
