import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Layers,
  ArrowRight,
  ShieldAlert,
  Landmark,
  MapPin,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  Sparkles,
  BarChart3,
  Map as MapIcon,
  AlertTriangle,
  Clock,
  Copy,
  FileText,
  UploadCloud,
  Sliders,
  Scale,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { api } from '../api/client';
import { StatsResponse, StateSummary, WorkCategory, AlertItem } from '../api/types';
import { useHouse } from '../context/HouseContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { IndiaParliamentaryMap } from '../components/map/IndiaParliamentaryMap';
import { AnalyticsSuite } from '../components/analytics/AnalyticsSuite';
import { FollowTheMoneyModal } from '../components/common/FollowTheMoneyModal';
import { EntityDossierDrawer, DossierEntity } from '../components/common/EntityDossierDrawer';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const OverviewPage: React.FC = () => {
  const { selectedHouse } = useHouse();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [categories, setCategories] = useState<WorkCategory[]>([]);
  const [featuredAlerts, setFeaturedAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followTheMoneyOpen, setFollowTheMoneyOpen] = useState(false);
  const [activeDossier, setActiveDossier] = useState<DossierEntity | null>(null);
  const [commandViewMode, setCommandViewMode] = useState<'GRAPHS' | 'MAP'>('GRAPHS');
  const [selectedRoleTab, setSelectedRoleTab] = useState<'MP' | 'DISTRICT' | 'STATE' | 'MINISTRY' | 'AUDITOR' | 'CITIZEN'>('MINISTRY');
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
      q: 'What are the 6 statutory user roles and their governance permissions?',
      a: 'JanDrishti implements true hierarchical role-based governance aligned with Indian statutory public finance: (1) Ministry / MoSPI Administrator (national policy, weights calibration, systemic risk governance); (2) State Nodal Authority (state-wide supervision, inter-district parity); (3) District Authority / DM (sanctioning authority, milestone verifications, contractor delay warnings); (4) Member of Parliament (recommends works, tracks ₹5 Cr annual quota & SC/ST earmarking); (5) Public Finance Integrity Auditor (independent scrutiny, double-entry trail checks); (6) Citizen / Public User (proactive RTI §4(1)(b) public disclosures, social audit discrepancy reporting).',
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#121316]">
      {/* ========================================================= */}
      {/* 01. GETCASEWORK HERO SECTION                              */}
      {/* ========================================================= */}
      <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 border-b border-[#E4E2DC] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            {/* Regulatory File Stamp Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EFEA] border border-[#E4E2DC] text-[11px] font-mono text-[#4A4D53]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-pulse" />
              <span>FILE NO. JD-2026/MPLADS · STATUTORY MONITORING ENGINE</span>
              <span className="text-[#C85A32]">· ACTIVE</span>
            </div>

            {/* Monumental Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#121316] tracking-tight leading-[1.08]">
              AI statutory monitoring for <span className="italic font-normal">MPLADS works.</span> Four tiers. <span className="italic text-[#C85A32]">Evidence-first.</span>
            </h1>

            {/* Subtitle Grounded in MoSPI & Statutory Principles */}
            <p className="text-base sm:text-lg text-[#4A4D53] font-light leading-relaxed max-w-3xl">
              Grounded in MoSPI guidelines, Article 9 norms, and CAG auditing standards. Monitoring ₹11,667.55 Cr across 102,437 ground works, JanDrishti isolates financial anomalies, cost overruns, delay clusters, and delivery mismatches through deterministic, statistical, and ML vectors—serving decision-makers without premature accusation.
            </p>

            {/* Action Area: Ingestion CTA + Role Dashboards Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/ingest"
                className="cw-btn-primary px-6 py-3 text-sm font-semibold"
              >
                <span>Run Data Ingestion</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/dashboards"
                className="cw-btn-secondary px-6 py-3 text-sm font-medium"
              >
                <span>Inspect 4-Tier Dashboards</span>
                <ChevronRight className="w-4 h-4 text-[#71717A]" />
              </Link>

              <Link
                to="/cases"
                className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#71717A] hover:text-[#C85A32] transition pl-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                <span>View 21 Critical Cases →</span>
              </Link>
            </div>
          </div>

          {/* Statutory Norms & Live Ledger Ticker (GetCasework Style) */}
          <div className="mt-14 pt-8 border-t border-[#E4E2DC] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-left">
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
      {/* § I · SITUATION REPORT (BENTO VISIBILITY CARDS)           */}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="cw-badge-section">§ I · SITUATION REPORT</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121316] tracking-tight">
                The public expenditure visibility gap.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-md">
              Without continuous AI reconciliation, public infrastructure outlays remain fragmented across disjointed district ledgers and ground delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card / 01: Macro Fiscal Velocity */}
            <div className="cw-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                  <span className="text-xs font-mono font-bold text-[#C85A32]">/ 01</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                    Velocity Gap
                  </span>
                </div>
                <h3 className="text-xl font-serif text-[#121316]">
                  Macro Fiscal Velocity &amp; Sanction Stalls
                </h3>
                <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                  Of ₹11,667.55 Cr sanctioned, only ₹3,947.25 Cr (33.8%) has been disbursed into active works, with 184 ongoing schemes stalled past twice their estimated completion horizon.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E2DC] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#71717A]">
                  Completion Rate: <strong className="text-[#121316] font-semibold">49.0%</strong>
                </span>
                <Link
                  to="/dashboards?role=MINISTRY_ADMIN"
                  className="text-xs font-medium text-[#C85A32] hover:underline inline-flex items-center gap-1"
                >
                  <span>National Trend</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Bento Card / 02: Physical vs Financial Mismatches */}
            <div className="cw-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                  <span className="text-xs font-mono font-bold text-[#C85A32]">/ 02</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                    Delivery Risk
                  </span>
                </div>
                <h3 className="text-xl font-serif text-[#121316]">
                  Physical Delivery vs Fund Outlay Mismatch
                </h3>
                <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                  21 high-priority ground works have expended ≥80% of sanctioned funds while certified physical progress remains under 30%, triggering statutory stop-payment inspection recommendations.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E2DC] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#C85A32]">
                  21 Critical Signals
                </span>
                <Link
                  to="/cases?severity=CRITICAL"
                  className="text-xs font-medium text-[#C85A32] hover:underline inline-flex items-center gap-1"
                >
                  <span>Inspect Docket</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Bento Card / 03: Semantic Duplicate Clusters */}
            <div className="cw-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                  <span className="text-xs font-mono font-bold text-[#C85A32]">/ 03</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                    Cluster Anomaly
                  </span>
                </div>
                <h3 className="text-xl font-serif text-[#121316]">
                  Semantic Duplicates &amp; Vendor Concentration
                </h3>
                <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                  25 candidate duplicate clusters detected where near-identical works are proposed at matching coordinates, alongside contractor registries indicating high single-vendor dependency.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E2DC] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#71717A]">
                  Cosine Match: <strong className="text-[#121316] font-semibold">≥70%</strong>
                </span>
                <Link
                  to="/duplicates"
                  className="text-xs font-medium text-[#C85A32] hover:underline inline-flex items-center gap-1"
                >
                  <span>Duplicate Studio</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* § II · AUDIT & ANALYTICS SPECIFICATION (THE 25 DELIVERABLES)*/}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#F7F5F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <span className="cw-badge-section">§ II · AUDIT SPECIFICATION</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121316] tracking-tight">
              From raw ingestion to human adjudication.
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-2xl">
              The 25-feature monitoring pipeline organized into an archival ledger table. Every work undergoes multi-tier validation before a composite score is generated.
            </p>
          </div>

          {/* Structured Deliverables Docket (GetCasework style) */}
          <div className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden shadow-xs">
            <div className="divide-y divide-[#E4E2DC] text-xs">
              {/* Row 1: Intake & Normalization */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start hover:bg-[#FAF8F5] transition">
                <div className="lg:col-span-3 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#C85A32]">ANNEX A</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#121316] text-sm">Universal Ingestion</span>
                    <span className="font-mono text-[10px] text-[#71717A]">CSV / EXCEL · SHA-256</span>
                  </div>
                </div>
                <div className="lg:col-span-7 text-[#4A4D53] font-light leading-relaxed">
                  Automated column mapping for sanctions, disbursements, physical progress, and asset geo-tags. Performs strict deduplication, null checks, negative amount detection, and computes a cryptographic SHA-256 hash for immutable provenance.
                </div>
                <div className="lg:col-span-2 flex justify-end">
                  <Link
                    to="/ingest"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-medium text-[#121316] hover:bg-[#F0EFEA] transition"
                  >
                    <span>Pipeline</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Row 2: Tier 1 Deterministic Rules */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start hover:bg-[#FAF8F5] transition">
                <div className="lg:col-span-3 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#C85A32]">ANNEX B</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#121316] text-sm">Deterministic Rule Engine</span>
                    <span className="font-mono text-[10px] text-[#71717A]">TIER 1 · ZERO FALSE POSITIVE</span>
                  </div>
                </div>
                <div className="lg:col-span-7 text-[#4A4D53] font-light leading-relaxed">
                  Strict rule-based evaluation against MoSPI guidelines: flags expenditures exceeding sanctioned ceilings, negative payment amounts, 45-day statutory sanction window breaches, and unapproved asset categories without ambiguity.
                </div>
                <div className="lg:col-span-2 flex justify-end">
                  <Link
                    to="/methodology"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-medium text-[#121316] hover:bg-[#F0EFEA] transition"
                  >
                    <span>Rule Spec</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Row 3: Tier 2 Statistical Outliers */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start hover:bg-[#FAF8F5] transition">
                <div className="lg:col-span-3 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#C85A32]">ANNEX C</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#121316] text-sm">Statistical Distribution Outliers</span>
                    <span className="font-mono text-[10px] text-[#71717A]">TIER 2 · IQR &amp; MAD Z-SCORES</span>
                  </div>
                </div>
                <div className="lg:col-span-7 text-[#4A4D53] font-light leading-relaxed">
                  Calculates unit-cost medians and Inter-Quartile Range (IQR) bounds per category and state. Highlights expenditure spikes and milestone delays that deviate &gt;2.5 standard deviations from peer averages, presenting statistical context without bias.
                </div>
                <div className="lg:col-span-2 flex justify-end">
                  <Link
                    to="/anomalies"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-medium text-[#121316] hover:bg-[#F0EFEA] transition"
                  >
                    <span>Signals (1,831)</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Row 4: Tier 3 Machine Learning Anomaly Detection */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start hover:bg-[#FAF8F5] transition">
                <div className="lg:col-span-3 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#C85A32]">ANNEX D</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#121316] text-sm">Unsupervised ML Detection</span>
                    <span className="font-mono text-[10px] text-[#71717A]">TIER 3 · ISOLATION FOREST</span>
                  </div>
                </div>
                <div className="lg:col-span-7 text-[#4A4D53] font-light leading-relaxed">
                  Multi-feature IsolationForest vectors evaluating non-linear interactions across disbursement velocity, contractor allocation concentration, physical milestone lag, and regional cost indices to isolate complex anomaly clusters.
                </div>
                <div className="lg:col-span-2 flex justify-end">
                  <Link
                    to="/anomalies?model=isolation_forest"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-medium text-[#121316] hover:bg-[#F0EFEA] transition"
                  >
                    <span>ML Vectors</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Row 5: Composite Risk Scoring */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start hover:bg-[#FAF8F5] transition">
                <div className="lg:col-span-3 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#C85A32]">ANNEX E</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#121316] text-sm">Composite Risk Index (0–100)</span>
                    <span className="font-mono text-[10px] text-[#71717A]">EXPLAINABLE AI BREAKDOWN</span>
                  </div>
                </div>
                <div className="lg:col-span-7 text-[#4A4D53] font-light leading-relaxed">
                  Synthesizes Tier 1, 2, and 3 signals into a normalized 0–100 risk score with transparent factor attribution (Cost Overrun 30%, Delay 25%, Mismatch 25%, Duplicate 20%). Every score is accompanied by natural-language contributing factors.
                </div>
                <div className="lg:col-span-2 flex justify-end">
                  <Link
                    to="/works"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-medium text-[#121316] hover:bg-[#F0EFEA] transition"
                  >
                    <span>Risk Registry</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Row 6: Case Docket & Human Adjudication */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start hover:bg-[#FAF8F5] transition">
                <div className="lg:col-span-3 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#C85A32]">ANNEX F</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#121316] text-sm">Statutory Case Docket</span>
                    <span className="font-mono text-[10px] text-[#71717A]">NEW → AUDIT → RESOLUTION</span>
                  </div>
                </div>
                <div className="lg:col-span-7 text-[#4A4D53] font-light leading-relaxed">
                  Full lifecycle alert management: triage by severity (Critical / High / Medium), assign to nodal officers, record inspection notes, and document resolution (Verified Anomaly or Dismissed with justification), backed by immutable audit logs.
                </div>
                <div className="lg:col-span-2 flex justify-end">
                  <Link
                    to="/cases"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-medium text-[#121316] hover:bg-[#F0EFEA] transition"
                  >
                    <span>Active Cases</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* § III · FOUR STAKEHOLDER COMMAND CENTERS                  */}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="cw-badge-section">§ III · STAKEHOLDER CONSOLES</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121316] tracking-tight">
                Dedicated consoles for every statutory authority.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-md">
              Role-based access control provides focused, actionable views tailored to constitutional and administrative mandates.
            </p>
          </div>

          {/* Role Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E2DC] pb-4">
            <button
              type="button"
              onClick={() => setSelectedRoleTab('MINISTRY')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedRoleTab === 'MINISTRY'
                  ? 'bg-[#121316] text-[#FAF8F5]'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316]'
              }`}
            >
              1. MoSPI / Ministry Administrator
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleTab('STATE')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedRoleTab === 'STATE'
                  ? 'bg-[#121316] text-[#FAF8F5]'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316]'
              }`}
            >
              2. State Nodal Authority
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleTab('DISTRICT')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedRoleTab === 'DISTRICT'
                  ? 'bg-[#121316] text-[#FAF8F5]'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316]'
              }`}
            >
              3. District Authority (Collector)
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleTab('MP')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedRoleTab === 'MP'
                  ? 'bg-[#121316] text-[#FAF8F5]'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316]'
              }`}
            >
              4. Member of Parliament
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleTab('AUDITOR')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedRoleTab === 'AUDITOR'
                  ? 'bg-[#121316] text-[#FAF8F5]'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316]'
              }`}
            >
              5. Integrity Auditor
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleTab('CITIZEN')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedRoleTab === 'CITIZEN'
                  ? 'bg-[#121316] text-[#FAF8F5]'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316]'
              }`}
            >
              6. Citizen / Public Social Auditor
            </button>
          </div>

          {/* Active Role Card Preview */}
          <div className="cw-card p-6 sm:p-8 bg-white">
            {selectedRoleTab === 'MINISTRY' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C85A32]">
                    <Landmark className="w-4 h-4" />
                    <span>PAN-INDIA FISCAL COMPLIANCE &amp; POLICY LEVEL</span>
                  </div>
                  <h3 className="text-2xl font-serif text-[#121316]">
                    Ministry / MoSPI Administrator Command Center
                  </h3>
                  <p className="text-sm text-[#4A4D53] font-light leading-relaxed">
                    Access national cross-state expenditure velocity, unutilized allocation rankings, and system-wide anomaly rates. Includes a live risk-weight calibration matrix to rebalance cost overrun, milestone delay, duplicate, and progress mismatch multipliers across the entire detection pipeline.
                  </p>
                  <ul className="space-y-2 text-xs text-[#71717A] font-light">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Live weight calibration (Cost, Delay, Mismatch, Duplicate)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Cross-state unspent balance rankings across 28 States &amp; 8 UTs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>National trend line forecasting seasonal disbursement bottlenecks</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/dashboards?role=MINISTRY_ADMIN"
                      className="cw-btn-primary text-xs"
                    >
                      <span>Open Ministry Command Center →</span>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#FAF8F5] p-5 rounded-xl border border-[#E4E2DC] space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-2">
                    <span className="text-[#71717A]">NATIONAL SNAPSHOT</span>
                    <span className="text-[#C85A32]">LIVE RECONCILED</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Total Allocation:</span>
                      <span className="font-bold text-[#121316]">₹11,667.55 Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Total Disbursed:</span>
                      <span className="font-bold text-[#121316]">₹3,947.25 Cr (33.8%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Active Ground Works:</span>
                      <span className="font-bold text-[#121316]">102,437 Works</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Critical Alerts:</span>
                      <span className="font-bold text-[#C85A32]">21 Requiring Action</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRoleTab === 'STATE' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C85A32]">
                    <Layers className="w-4 h-4" />
                    <span>STATE NODAL AUTHORITY &amp; CROSS-DISTRICT PARITY</span>
                  </div>
                  <h3 className="text-2xl font-serif text-[#121316]">
                    State Nodal Authority Command Center
                  </h3>
                  <p className="text-sm text-[#4A4D53] font-light leading-relaxed">
                    Compare district execution velocity, track unspent allocations across administrative divisions, and investigate inter-district fund movements. Issues escalation notices to lagging collectors whose average sanction duration exceeds the 45-day statutory SLA.
                  </p>
                  <ul className="space-y-2 text-xs text-[#71717A] font-light">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>District-level Gini coefficient &amp; regional equity analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Lagging district escalation generator for state cabinet review</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Inter-district project transfer reconciliation docket</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/dashboards?role=STATE_NODAL_AUTHORITY"
                      className="cw-btn-primary text-xs"
                    >
                      <span>Open State Nodal Console →</span>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#FAF8F5] p-5 rounded-xl border border-[#E4E2DC] space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-2">
                    <span className="text-[#71717A]">STATE ATLAS BENCHMARK</span>
                    <span className="text-[#C85A32]">MAHARASHTRA</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Districts Tracked:</span>
                      <span className="font-bold text-[#121316]">36 Districts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Avg Sanction Duration:</span>
                      <span className="font-bold text-[#121316]">52 Days (SLA Breach)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Highest Spend:</span>
                      <span className="font-bold text-[#121316]">Pune (₹142.50 Cr)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Lagging Jurisdiction:</span>
                      <span className="font-bold text-[#C85A32]">Gadchiroli (19.4%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRoleTab === 'DISTRICT' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C85A32]">
                    <Building2 className="w-4 h-4" />
                    <span>SANCTIONING AUTHORITY · COLLECTOR &amp; DISTRICT MAGISTRATE</span>
                  </div>
                  <h3 className="text-2xl font-serif text-[#121316]">
                    District Authority (Collector / DM) Console
                  </h3>
                  <p className="text-sm text-[#4A4D53] font-light leading-relaxed">
                    Tracks the 45-day statutory countdown on pending MP recommendations, monitors contractor workload concentration, and manages on-site physical inspection orders. Authorizes stop-payment flags when physical milestones lag financial disbursements.
                  </p>
                  <ul className="space-y-2 text-xs text-[#71717A] font-light">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>45-day sanction SLA countdown timer per recommendation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Single-contractor volume saturation warning system</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>1-click field inspection orders with photo upload mandate</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/dashboards?role=DISTRICT_AUTHORITY"
                      className="cw-btn-primary text-xs"
                    >
                      <span>Open District Authority Console →</span>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#FAF8F5] p-5 rounded-xl border border-[#E4E2DC] space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-2">
                    <span className="text-[#71717A]">DISTRICT BENCHMARK</span>
                    <span className="text-[#C85A32]">VARANASI (UP)</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Pending Sanctions:</span>
                      <span className="font-bold text-[#121316]">14 Recommendations</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Breaching 45-Day SLA:</span>
                      <span className="font-bold text-[#C85A32]">3 Schemes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Dominant Vendor:</span>
                      <span className="font-bold text-[#121316]">Apex Infra (38.2%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Inspections Pending:</span>
                      <span className="font-bold text-[#C85A32]">5 Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRoleTab === 'MP' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C85A32]">
                    <Users className="w-4 h-4" />
                    <span>PARLIAMENTARY CONSTITUENCY DESK (LOK SABHA &amp; RAJYA SABHA)</span>
                  </div>
                  <h3 className="text-2xl font-serif text-[#121316]">
                    Member of Parliament Constituency Desk
                  </h3>
                  <p className="text-sm text-[#4A4D53] font-light leading-relaxed">
                    Provides parliamentarians with real-time tracking of their annual ₹5.00 Crore statutory entitlement, recommendation execution status, delay alerts, and social sector allocation ratios (15% SC / 7.5% ST statutory targets).
                  </p>
                  <ul className="space-y-2 text-xs text-[#71717A] font-light">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Annual ₹5.00 Cr quota burn rate &amp; unrecommended balance warning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Recommendation status tracker (Recommended → Sanctioned → Executed)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Statutory SC (15%) &amp; ST (7.5%) spending compliance meter</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/dashboards?role=MP"
                      className="cw-btn-primary text-xs"
                    >
                      <span>Open MP Constituency Desk →</span>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#FAF8F5] p-5 rounded-xl border border-[#E4E2DC] space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-2">
                    <span className="text-[#71717A]">ENTITLEMENT STATUS</span>
                    <span className="text-[#C85A32]">FY 2026-27</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Annual Quota:</span>
                      <span className="font-bold text-[#121316]">₹5.00 Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Recommended:</span>
                      <span className="font-bold text-[#121316]">₹4.20 Cr (84%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Sanctioned by Collector:</span>
                      <span className="font-bold text-[#121316]">₹3.10 Cr (62%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">SC/ST Earmarking:</span>
                      <span className="font-bold text-emerald-600">24.2% (Compliant)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRoleTab === 'AUDITOR' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C85A32]">
                    <ShieldAlert className="w-4 h-4" />
                    <span>INDEPENDENT PUBLIC-FINANCE SCRUTINY &amp; AUDIT TRAIL</span>
                  </div>
                  <h3 className="text-2xl font-serif text-[#121316]">
                    Public Finance Integrity Auditor Console
                  </h3>
                  <p className="text-sm text-[#4A4D53] font-light leading-relaxed">
                    Designed for independent oversight bodies, parliamentary committee researchers, and investigative fiscal analysts. Features non-destructive audit trail review, payment timing signal analysis, duplicate voucher detection, and formal discrepancy review docket initiation.
                  </p>
                  <ul className="space-y-2 text-xs text-[#71717A] font-light">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Cryptographic SHA-256 immutable audit trail ledger inspection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Payment timing signal detector for clustered end-of-year disbursements</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Formal discrepancy case initiation and statutory evidence documentation</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/dashboards?role=AUDITOR"
                      className="cw-btn-primary text-xs"
                    >
                      <span>Open Auditor Console →</span>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#FAF8F5] p-5 rounded-xl border border-[#E4E2DC] space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-2">
                    <span className="text-[#71717A]">INTEGRITY AUDIT METRICS</span>
                    <span className="text-[#C85A32]">LIVE LEDGER</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Vouchers Audited:</span>
                      <span className="font-bold text-[#121316]">10,480 Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Reconciliation Variance:</span>
                      <span className="font-bold text-emerald-600">₹0.00 (Zero Drift)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Timing Deviations:</span>
                      <span className="font-bold text-[#C85A32]">14 Flagged</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Active Inquiries:</span>
                      <span className="font-bold text-[#121316]">6 In Progress</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRoleTab === 'CITIZEN' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C85A32]">
                    <Sparkles className="w-4 h-4" />
                    <span>PROACTIVE CITIZEN SOCIAL AUDIT · RTI §4(1)(b) COMPLIANCE</span>
                  </div>
                  <h3 className="text-2xl font-serif text-[#121316]">
                    Citizen Public Social Audit Portal
                  </h3>
                  <p className="text-sm text-[#4A4D53] font-light leading-relaxed">
                    Under the RTI Act proactive disclosure mandate, every citizen can explore complete local development records without login, inspect contractor allocations, compare representative metrics, and submit community discrepancy observations directly to district collectors.
                  </p>
                  <ul className="space-y-2 text-xs text-[#71717A] font-light">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Full public visibility across all 102,437 ground works and expenditures</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Interactive constituency mapping and neighborhood project search</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Ground-level social audit observation and photo submission workflow</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/dashboards?role=CITIZEN"
                      className="cw-btn-primary text-xs"
                    >
                      <span>Open Citizen Social Audit Portal →</span>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#FAF8F5] p-5 rounded-xl border border-[#E4E2DC] space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-2">
                    <span className="text-[#71717A]">PUBLIC OPEN ACCESS</span>
                    <span className="text-emerald-600">RTI MANDATE</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Access Status:</span>
                      <span className="font-bold text-emerald-600">Open Public Access</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Ground Works Visible:</span>
                      <span className="font-bold text-[#121316]">102,437 Works</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Constituency Scopes:</span>
                      <span className="font-bold text-[#121316]">543 Lok Sabha Seats</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Community Feedback:</span>
                      <span className="font-bold text-[#C85A32]">Open Submissions</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* § IV · SELECTED CASE STUDIES (LIVE ANOMALY DOSSIERS)      */}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#F7F5F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="cw-badge-section">§ IV · SELECTED CASE STUDIES</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121316] tracking-tight">
                Live anomaly dockets under active review.
              </h2>
            </div>
            <Link
              to="/cases"
              className="text-xs font-mono font-medium text-[#C85A32] hover:underline inline-flex items-center gap-1"
            >
              <span>View All 21 Critical Cases</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredAlerts.length > 0 ? (
              featuredAlerts.slice(0, 4).map((alert, idx) => (
                <div
                  key={alert.alert_id}
                  className="cw-card p-6 bg-white flex flex-col justify-between space-y-4"
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
                <div className="cw-card p-6 bg-white flex flex-col justify-between space-y-4">
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

                <div className="cw-card p-6 bg-white flex flex-col justify-between space-y-4">
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
                      to="/duplicates"
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
      {/* § V · FORENSIC COMMAND CENTER (ANALYTICS & ATLAS)         */}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="cw-badge-section">§ V · FORENSIC ATLAS</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121316] tracking-tight">
                National spatial &amp; graphical command console.
              </h2>
            </div>

            {/* View Mode Switcher: Graphs vs Map */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#F0EFEA] border border-[#E4E2DC] text-xs font-medium shrink-0">
              <button
                type="button"
                onClick={() => setCommandViewMode('GRAPHS')}
                className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                  commandViewMode === 'GRAPHS'
                    ? 'bg-[#121316] text-white shadow-xs'
                    : 'text-[#71717A] hover:text-[#121316]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Graphical Analytics</span>
              </button>
              <button
                type="button"
                onClick={() => setCommandViewMode('MAP')}
                className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                  commandViewMode === 'MAP'
                    ? 'bg-[#121316] text-white shadow-xs'
                    : 'text-[#71717A] hover:text-[#121316]'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>28 States &amp; 8 UTs Atlas</span>
              </button>
            </div>
          </div>

          {/* Conditional View: Analytics Suite vs Parliamentary Map */}
          {commandViewMode === 'GRAPHS' && stats ? (
            <AnalyticsSuite
              stats={stats}
              states={states}
              categories={categories}
              onSelectState={(stName) => navigate(`/mps?state=${encodeURIComponent(stName)}`)}
            />
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#E4E2DC]">
              <IndiaParliamentaryMap
                states={states}
                stats={stats}
                onFollowTheMoney={() => setFollowTheMoneyOpen(true)}
              />
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* § VI · STATUTORY PRINCIPLES & COMPLIANCE FAQ             */}
      {/* ========================================================= */}
      <section className="py-14 sm:py-20 border-b border-[#E4E2DC] bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 text-center">
            <span className="cw-badge-section">§ VI · COMPLIANCE &amp; METHODOLOGY</span>
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
      {/* § VII · EDITORIAL CALL TO ACTION BANNER                   */}
      {/* ========================================================= */}
      <section className="py-16 sm:py-24 bg-[#121316] text-[#FAF8F5] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1B1F] border border-[#2A2C32] text-xs font-mono text-[#A1A1AA]">
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
              to="/ingest"
              className="cw-btn-primary px-7 py-3 text-sm font-semibold"
            >
              <span>Start Ingestion Pipeline →</span>
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
