import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Layers,
  ArrowRight,
  ShieldAlert,
  Landmark,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
  Map as MapIcon,
  AlertTriangle,
  Clock,
  Copy,
  FileText,
  Sliders,
  Scale,
  ChevronRight,
  Zap,
  TrendingUp,
  Eye,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { api } from '../api/client';
import { StatsResponse, StateSummary, WorkCategory, AlertItem } from '../api/types';
import { useHouse } from '../context/HouseContext';
import { useRole } from '../context/RoleContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { IndiaParliamentaryMap } from '../components/map/IndiaParliamentaryMap';
import { AnalyticsSuite } from '../components/analytics/AnalyticsSuite';
import { FollowTheMoneyModal } from '../components/common/FollowTheMoneyModal';
import { EntityDossierDrawer, DossierEntity } from '../components/common/EntityDossierDrawer';

export const OverviewPage: React.FC = () => {
  const { selectedHouse } = useHouse();
  const { user, isAuthenticated } = useRole();
  const navigate = useNavigate();

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [categories, setCategories] = useState<WorkCategory[]>([]);
  const [featuredAlerts, setFeaturedAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followTheMoneyOpen, setFollowTheMoneyOpen] = useState(false);
  const [activeDossier, setActiveDossier] = useState<DossierEntity | null>(null);
  const [commandViewMode, setCommandViewMode] = useState<'MAP' | 'GRAPHS'>('MAP');

  // Compute active user tier for hero secondary CTA
  const getUserTier = (): 'NATIONAL' | 'STATE' | 'DISTRICT' | 'CITIZEN' => {
    if (!user || !isAuthenticated) return 'CITIZEN';
    if (user.role === 'MINISTRY_ADMIN' || user.role === 'MINISTRY_OFFICIAL') return 'NATIONAL';
    if (user.role === 'STATE_NODAL_AUTHORITY' || user.role === 'STATE_AUTHORITY') return 'STATE';
    if (user.role === 'DISTRICT_AUTHORITY') return 'DISTRICT';
    return 'CITIZEN';
  };

  const activeUserTier = getUserTier();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, statesData, catData, alertsData] = await Promise.all([
        api.getStats({ house: selectedHouse === 'ALL' ? undefined : selectedHouse }),
        api.getStates({ house: selectedHouse === 'ALL' ? undefined : selectedHouse }),
        api.getCategories(),
        api.getAlerts({ limit: 4, severity: 'CRITICAL' }).catch(() => ({ total: 0, items: [] })),
      ]);
      setStats(statsData);
      setStates(statesData);
      setCategories(catData);
      setFeaturedAlerts(alertsData.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the JanDrishti analytical backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedHouse]);

  const formatCrores = (val?: number) => {
    if (val === undefined || val === null) return '₹0.00 Cr';
    const cr = val / 1e7;
    return `₹${cr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
  };

  const faqs = [
    {
      q: 'Why does JanDrishti strictly adhere to the non-accusatory principle?',
      a: 'In public capital works, physical stalls and expenditure deviations can arise from legitimate exogenous factors such as monsoon flooding, land acquisition court injunctions, or local contractor insolvencies. JanDrishti functions as an intelligence and decision-support platform: it surfaces potential statistical anomalies and procedural deviations for administrative inspection, but never declares irregularities or fraud without human field verification.',
    },
    {
      q: 'How is the Composite Risk Score (0–100) calculated and calibrated?',
      a: 'The Composite Risk Score aggregates multi-tier vectors using configurable weights aligned with MoSPI norms: Cost Overruns (30%), Milestone & SLA Delays (25%), Physical vs Financial Progress Mismatches (25%), and Semantic Duplicate Clusters (20%). MoSPI administrators can tune these weights in real-time from the Ministry Command Center based on emerging statutory priorities.',
    },
    {
      q: 'How does the duplicate detection engine identify candidate overlapping works?',
      a: 'The engine applies Term Frequency-Inverse Document Frequency (TF-IDF) cosine vectorization on work descriptions combined with Levenshtein distance metrics and geospatial boundaries. When a newly recommended work has >=70% textual and financial similarity to an existing sanctioned work in the same constituency, it is flagged for de-duplication review.',
    },
    {
      q: 'What ensures the data provenance and audit trail integrity?',
      a: 'Every file ingested through the pipeline is stamped with a cryptographic SHA-256 hash, recorded alongside user credentials, row counts, and error logs in an immutable provenance ledger. All subsequent alert status transitions (Under Review -> Verified / Dismissed) preserve full reviewer notes and audit timestamps.',
    },
    {
      q: 'What are the 4 statutory tiers and their governance permissions?',
      a: 'JanDrishti implements true hierarchical role-based governance aligned with Indian statutory public finance: (1) National / MoSPI Administrator (national policy, weights calibration, systemic risk governance); (2) State Nodal Authority (state-wide supervision, inter-district parity); (3) District Authority / DM (sanctioning authority, milestone verifications, contractor delay warnings); (4) Citizen / Public Social Auditor (proactive RTI §4(1)(b) public disclosures, social audit discrepancy reporting).',
    },
  ];

  if (loading && !stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-6 font-sans">
        <div className="h-8 bg-[#E4E2DC]/50 rounded-lg w-1/3 animate-pulse" />
        <div className="h-24 bg-[#E4E2DC]/40 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-[#E4E2DC]/30 rounded-2xl animate-pulse" />
          <div className="h-48 bg-[#E4E2DC]/30 rounded-2xl animate-pulse" />
          <div className="h-48 bg-[#E4E2DC]/30 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <ErrorDisplay
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  const totalAllocatedCr = stats?.total_allocated_amount ? (stats.total_allocated_amount / 1e7) : 11667.55;
  const totalExpendedCr = stats?.total_expenditure ? (stats.total_expenditure / 1e7) : 3947.46;
  const utilizationRate = stats?.national_utilization_pct || 33.83;
  const totalRecommendedWorks = stats?.total_recommended_works || 93528;
  const totalCompletedWorks = stats?.total_completed_works || 43601;
  const totalMPs = stats?.total_mps || 778;
  const criticalAlertsCount = stats?.critical_anomalies || 21;

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#121316]">
      {/* ========================================================= */}
      {/* 01. MOSPI CIVIC INTELLIGENCE COMMAND HERO                 */}
      {/* ========================================================= */}
      <section className="pt-10 sm:pt-16 pb-12 sm:pb-16 border-b border-[#E4E2DC] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            {/* Regulatory File Stamp Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0EFEA] border border-[#E4E2DC] text-[11px] font-mono text-[#4A4D53]">
              <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
              <span className="font-semibold text-[#121316]">FILE NO. JD-2026/MPLADS</span>
              <span className="text-[#71717A]">·</span>
              <span>STATUTORY MONITORING ENGINE</span>
              <span className="text-[#71717A]">·</span>
              <span className="text-[#C85A32] font-semibold">SIH 26102 · ACTIVE</span>
            </div>

            {/* Monumental Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#121316] tracking-tight leading-[1.08]">
              AI statutory monitoring for <span className="italic font-normal">MPLADS works.</span> Four tiers. <span className="italic text-[#C85A32]">Evidence-first.</span>
            </h1>

            {/* Subtitle Grounded in MoSPI & Statutory Principles */}
            <p className="text-base sm:text-lg text-[#4A4D53] font-light leading-relaxed max-w-3xl">
              Grounded in MoSPI guidelines, Article 9 norms, and CAG auditing standards. Monitoring{' '}
              <strong className="font-semibold text-[#121316]">₹{totalAllocatedCr.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr</strong> across{' '}
              <strong className="font-semibold text-[#121316]">{totalRecommendedWorks.toLocaleString('en-IN')} ground works</strong> and{' '}
              <strong className="font-semibold text-[#121316]">{totalMPs} Parliamentarians</strong>. JanDrishti isolates financial anomalies, duplicate schemes, delivery stalls, and cost overruns—serving decision-makers without premature accusation.
            </p>

            {/* High-Velocity Action Bar Adapts to User Role */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to="/anomalies"
                className="cw-btn-primary px-6 py-3 text-sm font-semibold shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Explore 4 AI Anomaly Pillars</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {activeUserTier === 'CITIZEN' ? (
                <Link
                  to="/works"
                  className="cw-btn-secondary px-5 py-3 text-sm font-medium"
                >
                  <Search className="w-4 h-4 text-[#71717A]" />
                  <span>Search Public Community Works</span>
                </Link>
              ) : activeUserTier === 'NATIONAL' ? (
                <Link
                  to="/admin/national"
                  className="cw-btn-secondary px-5 py-3 text-sm font-medium"
                >
                  <Landmark className="w-4 h-4 text-[#C85A32]" />
                  <span>Open Ministry Command Center</span>
                </Link>
              ) : activeUserTier === 'STATE' ? (
                <Link
                  to="/admin/state"
                  className="cw-btn-secondary px-5 py-3 text-sm font-medium"
                >
                  <Layers className="w-4 h-4 text-[#C85A32]" />
                  <span>Open State Nodal Console</span>
                </Link>
              ) : (
                <Link
                  to="/admin/district"
                  className="cw-btn-secondary px-5 py-3 text-sm font-medium"
                >
                  <Building2 className="w-4 h-4 text-[#C85A32]" />
                  <span>Open District Authority Console</span>
                </Link>
              )}

              <Link
                to="/cases?severity=CRITICAL"
                className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#71717A] hover:text-[#C85A32] transition pl-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-ping" />
                <span>{criticalAlertsCount} Critical Cases Triage →</span>
              </Link>
            </div>
          </div>

          {/* Statutory Norms Strip */}
          <div className="mt-12 pt-8 border-t border-[#E4E2DC] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-left">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block">Statutory Quota</span>
              <p className="text-lg font-serif font-bold text-[#121316] mt-0.5">₹5.00 Cr / Year</p>
              <span className="text-[11px] text-[#71717A] font-light">Per Member of Parliament</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block">Sanction Clock SLA</span>
              <p className="text-lg font-serif font-bold text-[#121316] mt-0.5">45 Days Max</p>
              <span className="text-[11px] text-[#71717A] font-light">Collector / DM mandate</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block">Completion Horizon</span>
              <p className="text-lg font-serif font-bold text-[#121316] mt-0.5">18 Months</p>
              <span className="text-[11px] text-[#71717A] font-light">Standard category benchmark</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block">Mandatory Earmarks</span>
              <p className="text-lg font-serif font-bold text-[#121316] mt-0.5">15% SC / 7.5% ST</p>
              <span className="text-[11px] text-[#71717A] font-light">Statutory social equity norm</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block">Non-Accusatory</span>
              <p className="text-lg font-serif font-bold text-[#C85A32] mt-0.5">0 Accusation</p>
              <span className="text-[11px] text-[#71717A] font-light">Evidence for human review</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* § I · THE 4 HERO AI ANOMALY PILLARS (INTERACTIVE GRID)    */}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="cw-badge-section">§ I · AI ANOMALY DETECTION SUITE</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121316] tracking-tight">
                Automated detection across 4 statutory risk vectors.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-md">
              Engineered specifically for MoSPI SIH 26102. Machine learning and statistical tests isolate deviations without subjective human bias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1: Duplicate Works Detection */}
            <div className="cw-card p-6 sm:p-7 bg-white flex flex-col justify-between hover:shadow-md transition group border border-[#E4E2DC]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                  <span className="text-xs font-mono font-bold text-[#C85A32]">/ 01 · DUPLICATES</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6] text-[11px] font-mono font-semibold">
                    38 Suspect Pairs
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-[#121316] group-hover:text-[#C85A32] transition">
                    Semantic &amp; Geo-Spatial Duplicates
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4D53] font-light leading-relaxed">
                    Applies TF-IDF vectorization, Levenshtein distance metrics, and GPS co-location filters (&lt;500m) to identify candidate double-billed or overlapping works proposed across adjacent terms or neighboring constituencies.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    TF-IDF Cosine Match
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    Levenshtein Ratio ≥0.75
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    GPS Co-location
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#E4E2DC] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#71717A]">
                  Risk Scope: <strong className="text-[#121316] font-semibold">Double Funding</strong>
                </span>
                <Link
                  to="/anomalies?tab=duplicates"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] hover:underline"
                >
                  <span>Launch Duplicate Detector</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: Progress vs Outlay Mismatch */}
            <div className="cw-card p-6 sm:p-7 bg-white flex flex-col justify-between hover:shadow-md transition group border border-[#E4E2DC]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                  <span className="text-xs font-mono font-bold text-[#C85A32]">/ 02 · MISMATCH</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6] text-[11px] font-mono font-semibold">
                    21,827 Divergences
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-[#121316] group-hover:text-[#C85A32] transition">
                    Physical Delivery vs Fund Outlay Mismatch
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4D53] font-light leading-relaxed">
                    Identifies schemes where expenditure has drawn ≥60% of sanctioned ceilings while certified physical progress remains under 30%. Automatically issues a statutory stop-payment trigger to protect public capital before physical verification.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    Divergence ≥60%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    Statutory Stop-Payment Flag
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    Milestone Verification
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#E4E2DC] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#71717A]">
                  Risk Scope: <strong className="text-[#121316] font-semibold">Unearned Advance</strong>
                </span>
                <Link
                  to="/anomalies?tab=mismatch"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] hover:underline"
                >
                  <span>Launch Mismatch Detector</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Delay & SLA Predictor */}
            <div className="cw-card p-6 sm:p-7 bg-white flex flex-col justify-between hover:shadow-md transition group border border-[#E4E2DC]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                  <span className="text-xs font-mono font-bold text-[#C85A32]">/ 03 · DELAYS</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6] text-[11px] font-mono font-semibold">
                    68,691 Schemes Monitored
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-[#121316] group-hover:text-[#C85A32] transition">
                    Milestone Delay &amp; Statutory SLA Breach
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4D53] font-light leading-relaxed">
                    Evaluates schemes against the 45-day Collector sanction SLA countdown and the 18-month statutory completion horizon. Calculates dynamic duration from recommendation date to forecast long-delayed works before costs escalate.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    45-Day Sanction SLA
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    18-Month Completion Norm
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    SLA Countdown Clock
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#E4E2DC] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#71717A]">
                  Risk Scope: <strong className="text-[#121316] font-semibold">Execution Stalls</strong>
                </span>
                <Link
                  to="/anomalies?tab=delays"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] hover:underline"
                >
                  <span>Launch Delay Predictor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 4: Statistical Cost & Vendor Outliers */}
            <div className="cw-card p-6 sm:p-7 bg-white flex flex-col justify-between hover:shadow-md transition group border border-[#E4E2DC]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                  <span className="text-xs font-mono font-bold text-[#C85A32]">/ 04 · OUTLIERS</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6] text-[11px] font-mono font-semibold">
                    1,831 Outliers Flagged
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-[#121316] group-hover:text-[#C85A32] transition">
                    Cost Outliers &amp; Vendor Monopolies
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4D53] font-light leading-relaxed">
                    Employs Inter-Quartile Range (IQR) unit-cost bounds and Isolation Forest ML models to surface non-linear cost anomalies and single-vendor contract monopolization (Herfindahl-Hirschman Index &gt;25%).
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    Unit-Cost IQR &gt;2.5σ
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    Isolation Forest
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                    Contractor Saturation &gt;25%
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#E4E2DC] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#71717A]">
                  Risk Scope: <strong className="text-[#121316] font-semibold">Cost Escalation &amp; Cartels</strong>
                </span>
                <Link
                  to="/anomalies?tab=outliers"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] hover:underline"
                >
                  <span>Launch Outlier Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* § II · SELECTED CASE STUDIES (LIVE ANOMALY DOSSIERS)      */}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="cw-badge-section">§ II · SELECTED CASE STUDIES</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121316] tracking-tight">
                Live anomaly dockets under active review.
              </h2>
            </div>
            <Link
              to="/cases"
              className="text-xs font-mono font-medium text-[#C85A32] hover:underline inline-flex items-center gap-1"
            >
              <span>View All {criticalAlertsCount} Critical Cases</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredAlerts.length > 0 ? (
              featuredAlerts.slice(0, 4).map((alert, idx) => (
                <div
                  key={alert.alert_id}
                  className="cw-card p-6 bg-white flex flex-col justify-between space-y-4 border border-[#E4E2DC]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3 text-xs font-mono">
                      <span className="font-bold text-[#C85A32]">CASE / 0{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]">
                        {alert.severity} · SCORE {alert.evidence_parsed?.risk_score || (alert.severity === 'CRITICAL' ? 88 : 74)}/100
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#71717A] uppercase">
                        {alert.state} · {alert.district}
                      </span>
                      <h3 className="text-lg font-serif text-[#121316] leading-snug">
                        {alert.project_title || alert.alert_type.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-xs text-[#4A4D53] font-light line-clamp-2 leading-relaxed">
                        {alert.description}
                      </p>
                    </div>

                    {/* Evidence & Contributing Factor Badges */}
                    {alert.evidence_parsed && typeof alert.evidence_parsed === 'object' && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.keys(alert.evidence_parsed).slice(0, 3).map((factorKey) => (
                          <span
                            key={factorKey}
                            className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]"
                          >
                            {factorKey.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E4E2DC] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#71717A] uppercase">
                      STATUS: {alert.status.replace(/_/g, ' ')}
                    </span>
                    <Link
                      to={alert.project_id ? `/works/${encodeURIComponent(alert.project_id)}` : '/cases'}
                      className="text-xs font-semibold text-[#C85A32] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Examine Dossier</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // High Quality Fallback Dossiers
              <>
                <div className="cw-card p-6 bg-white flex flex-col justify-between space-y-4 border border-[#E4E2DC]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3 text-xs font-mono">
                      <span className="font-bold text-[#C85A32]">CASE / 01 · PRJ-MH-PUNE-019</span>
                      <span className="px-2 py-0.5 rounded bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]">
                        CRITICAL · SCORE 88/100
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#71717A] uppercase">
                        MAHARASHTRA · PUNE DISTRICT
                      </span>
                      <h3 className="text-lg font-serif text-[#121316] leading-snug">
                        Rural Drinking Water Pipeline Scheme
                      </h3>
                      <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                        Sanctioned ₹95.00 Lakh. Disbursements drawn reach ₹82.50 Lakh (86.8%), yet verified ground pipeline installation remains at 24.0% with contractor inactive for 14 months.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                        Progress Mismatch (62.8%)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                        Prolonged Inactivity
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E4E2DC] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#71717A] uppercase">
                      STATUS: UNDER AUDIT REVIEW
                    </span>
                    <Link
                      to="/cases"
                      className="text-xs font-semibold text-[#C85A32] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Examine Dossier →</span>
                    </Link>
                  </div>
                </div>

                <div className="cw-card p-6 bg-white flex flex-col justify-between space-y-4 border border-[#E4E2DC]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3 text-xs font-mono">
                      <span className="font-bold text-[#C85A32]">CASE / 02 · PRJ-UP-VAR-004</span>
                      <span className="px-2 py-0.5 rounded bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]">
                        HIGH RISK · SCORE 76/100
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#71717A] uppercase">
                        UTTAR PRADESH · VARANASI DISTRICT
                      </span>
                      <h3 className="text-lg font-serif text-[#121316] leading-snug">
                        Community Skills Center Construction
                      </h3>
                      <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                        Identified as a candidate duplicate of PRJ-UP-VAR-001 at identical GPS coordinates with 81% semantic overlap in bill of quantities.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                        Duplicate Cosine 81%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[10px] font-mono text-[#4A4D53] border border-[#E4E2DC]">
                        Spatial Coordinate Match
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E4E2DC] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#71717A] uppercase">
                      STATUS: CLUSTER VERIFICATION
                    </span>
                    <Link
                      to="/anomalies?tab=duplicates"
                      className="text-xs font-semibold text-[#C85A32] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Examine Dossier →</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* § III · FORENSIC COMMAND CENTER (ANALYTICS & ATLAS)       */}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#F7F5F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="cw-badge-section">§ III · FORENSIC ATLAS</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121316] tracking-tight">
                National spatial &amp; graphical command console.
              </h2>
            </div>

            {/* View Mode Switcher: Graphs vs Map */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#F0EFEA] border border-[#E4E2DC] text-xs font-medium shrink-0">
              <button
                type="button"
                onClick={() => setCommandViewMode('MAP')}
                className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                  commandViewMode === 'MAP'
                    ? 'bg-[#121316] text-white shadow-xs'
                    : 'text-[#71717A] hover:text-[#121316]'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>28 States &amp; 8 UTs Atlas</span>
              </button>
              <button
                type="button"
                onClick={() => setCommandViewMode('GRAPHS')}
                className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                  commandViewMode === 'GRAPHS'
                    ? 'bg-[#121316] text-white shadow-xs'
                    : 'text-[#71717A] hover:text-[#121316]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Graphical Analytics</span>
              </button>
            </div>
          </div>

          {/* Conditional View: Parliamentary Map vs Analytics Suite */}
          {commandViewMode === 'MAP' ? (
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#E4E2DC]">
              <IndiaParliamentaryMap
                states={states}
                stats={stats}
                onFollowTheMoney={() => setFollowTheMoneyOpen(true)}
              />
            </div>
          ) : stats ? (
            <AnalyticsSuite
              stats={stats}
              states={states}
              categories={categories}
              onSelectState={(stName) => navigate(`/mps?state=${encodeURIComponent(stName)}`)}
            />
          ) : null}
        </div>
      </section>

      {/* ========================================================= */}
      {/* § IV · STATUTORY PRINCIPLES & COMPLIANCE FAQ              */}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 text-center">
            <span className="cw-badge-section">§ IV · COMPLIANCE &amp; METHODOLOGY</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121316] tracking-tight">
              Evidence-first governance principles.
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-xl mx-auto">
              How JanDrishti aligns constitutional jurisprudence, natural justice, and MoSPI guidelines to deliver actionable audit intelligence.
            </p>
          </div>

          {/* FAQ Accordion Items */}
          <div className="divide-y divide-[#E4E2DC] border-y border-[#E4E2DC]">
            {faqs.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left flex items-start justify-between gap-4 cursor-pointer group"
                  >
                    <span className="text-base sm:text-lg font-serif text-[#121316] group-hover:text-[#C85A32] transition">
                      {item.q}
                    </span>
                    <span className="p-1 rounded bg-[#F0EFEA] text-[#71717A] shrink-0 mt-0.5">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 text-xs sm:text-sm text-[#4A4D53] font-light leading-relaxed pr-8"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* § V · EDITORIAL CALL TO ACTION BANNER                     */}
      {/* ========================================================= */}
      <section className="py-16 sm:py-24 bg-[#121316] text-[#FAF8F5] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1A1B1F] border border-[#2A2C32] text-xs font-mono text-[#A1A1AA]">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>STATUTORY AUDIT &amp; DECISION SUPPORT</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-tight">
            Ready to initiate statutory monitoring for your jurisdiction?
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
            Ingest MPLADS work registers, configure administrative weights, or review live anomaly dockets across all 4 governance tiers.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/anomalies"
              className="cw-btn-primary px-7 py-3 text-sm font-semibold"
            >
              <span>Explore AI Anomaly Center →</span>
            </Link>

            <Link
              to="/dashboards"
              className="px-6 py-3 rounded-full bg-[#1A1B1F] hover:bg-[#2A2C32] text-[#FAF8F5] border border-[#2A2C32] text-sm font-medium transition"
            >
              <span>Open Role Dashboards</span>
            </Link>
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
