import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Calculator,
  Building2,
  Users,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Eye,
  TrendingUp,
  Activity,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { api } from '../api/client';
import { Anomaly, StatsResponse, StateSummary } from '../api/types';
import { useHouse } from '../context/HouseContext';
import { useRole } from '../context/RoleContext';
import { SeverityBadge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { EntityDossierDrawer, DossierEntity } from '../components/common/EntityDossierDrawer';

export const AnomalyCenterPage: React.FC = () => {
  const { selectedHouse } = useHouse();
  const { user, currentRole } = useRole();
  const isStateLocked = currentRole === 'STATE_NODAL_AUTHORITY' && !!user?.state;

  const [searchParams, setSearchParams] = useSearchParams();

  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMathIds, setExpandedMathIds] = useState<Set<string>>(new Set());
  const [showGuide, setShowGuide] = useState(true);
  const [activeDossier, setActiveDossier] = useState<DossierEntity | null>(null);

  // URL Parameters
  const state = searchParams.get('state') || (isStateLocked ? user?.state || '' : '');
  const entityType = searchParams.get('entity_type') || '';
  const severity = searchParams.get('severity') || '';
  const entityId = searchParams.get('entity_id') || '';
  const sortBy = searchParams.get('sort_by') || 'severity';
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = 50;

  const [entityIdInput, setEntityIdInput] = useState(entityId);

  useEffect(() => {
    api.getStates().then(setStates).catch(() => {});
  }, []);

  const loadAnomalies = async () => {
    try {
      setLoading(true);
      setError(null);
      const [anomData, statsData] = await Promise.all([
        api.getAnomalies({
          state: state || undefined,
          entity_type: entityType || undefined,
          severity: severity || undefined,
          entity_id: entityId || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
          limit,
          offset,
        }),
        api.getStats(),
      ]);
      setAnomalies(anomData.items);
      setTotal(anomData.total);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytical signals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, [state, entityType, severity, entityId, sortBy, sortOrder, offset]);

  const updateParam = (key: string, val: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.set('offset', '0');
    setSearchParams(next);
  };

  const handleIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('entity_id', entityIdInput.trim());
  };

  const handleReset = () => {
    setEntityIdInput('');
    const next = new URLSearchParams();
    if (isStateLocked && user?.state) {
      next.set('state', user.state);
    }
    setSearchParams(next);
  };

  const toggleMathExpand = (id: string) => {
    setExpandedMathIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Helper to format friendly names for anomaly types
  const getFriendlyTypeInfo = (type: string) => {
    const map: Record<string, { label: string; icon: any; color: string; desc: string }> = {
      VENDOR_CONCENTRATION_HIGH: {
        label: 'Contractor Dominance',
        icon: Building2,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        desc: 'A large percentage of public work was allocated to a single contractor in this district.',
      },
      WORK_DURATION_OUTLIER: {
        label: 'Project Timeline Delay',
        icon: Layers,
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        desc: 'This project is taking significantly longer to complete than similar peer projects.',
      },
      COST_DEVIATION_HIGH: {
        label: 'Unusual Cost Variance',
        icon: Receipt,
        color: 'text-purple-700 bg-purple-50 border-purple-200',
        desc: 'The sanctioned cost is substantially higher than the peer median for this sector.',
      },
      UTILIZATION_DEVIATION_LOW: {
        label: 'Low Fund Utilization',
        icon: Users,
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        desc: 'Fund utilization velocity is notably lower compared to national peer parliamentarians.',
      },
      HIGH_VALUE_SINGLE_VOUCHER: {
        label: 'High-Value Payment',
        icon: FileCheck,
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        desc: 'A single treasury disbursement voucher exceeded standard district thresholds.',
      },
    };
    return (
      map[type] || {
        label: type.replace(/_/g, ' '),
        icon: Activity,
        color: 'text-slate-700 bg-slate-50 border-slate-200',
        desc: 'Statistical variation from peer baseline distributions.',
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#121316] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 font-sans">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Signal Center', to: '/anomalies', icon: ShieldAlert }]} />

      {/* 2. Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4E2DC] pb-6">
        <div className="space-y-1">
          <div className="cw-badge-section mb-2">
            § III · EMPIRICAL SIGNALS &amp; AUDIT INTELLIGENCE
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#121316] tracking-tight">
            Statistical Anomaly <span className="italic font-normal">Signals</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-3xl mt-1">
            Empirical statistical flags derived via Median Absolute Deviation (MAD). Highlight unusual variance patterns requiring human administrative review without automated accusations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className="cw-btn-secondary text-xs py-2 px-3.5"
          >
            <HelpCircle className="w-4 h-4 text-[#C85A32]" />
            <span>{showGuide ? 'Hide Methodology Guide' : 'How Signals Work'}</span>
          </button>

          <span className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E4E2DC] text-[#121316] text-xs font-mono font-semibold shadow-2xs">
            {total.toLocaleString()} Signals Verified
          </span>
        </div>
      </div>

      {/* 3. Educational Guide Banner (Collapsible) */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="cw-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                <div className="flex items-center gap-2 text-[#121316] font-serif text-base">
                  <Info className="w-4 h-4 text-[#C85A32]" />
                  <span>Understanding JanDrishti Signals (In Plain English)</span>
                </div>
                <span className="text-[10px] font-mono text-[#C85A32] bg-[#FAF0EB] px-2.5 py-0.5 rounded-full border border-[#E8C5B6]">
                  Citizen Disclosure
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-[#121316] font-semibold">
                    <span className="text-[#C85A32]">/ 01</span>
                    <span>What is a Signal?</span>
                  </div>
                  <p className="text-[#4A4D53] leading-relaxed font-light">
                    A Signal is flagged when a project, parliamentarian, or contractor deviates mathematically from peer distributions across 28 States and 8 Union Territories.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-[#121316] font-semibold">
                    <span className="text-[#C85A32]">/ 02</span>
                    <span>Does It Mean Irregularity?</span>
                  </div>
                  <p className="text-[#4A4D53] leading-relaxed font-light">
                    <strong>No.</strong> Signals are objective prompts for human audit review (e.g. disaster recovery works can naturally generate high spending velocity).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-[#121316] font-semibold">
                    <span className="text-[#C85A32]">/ 03</span>
                    <span>How Is It Calculated?</span>
                  </div>
                  <p className="text-[#4A4D53] leading-relaxed font-light">
                    We evaluate with <strong>Median Absolute Deviation (MAD)</strong>, comparing against empirical medians instead of fragile averages that are skewed by outliers.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Priority Level Selector Bento Cards */}
      {stats && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A] font-medium px-1">
            <span>Filter By Review Priority Level:</span>
            {severity && (
              <button
                type="button"
                onClick={() => updateParam('severity', null)}
                className="text-[#C85A32] hover:underline font-semibold"
              >
                Clear Level Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Critical */}
            <button
              type="button"
              onClick={() => updateParam('severity', severity === 'CRITICAL' ? null : 'CRITICAL')}
              className={`p-4 rounded-2xl text-left transition border cursor-pointer ${
                severity === 'CRITICAL'
                  ? 'bg-[#FAF0EB] border-[#C85A32] ring-1 ring-[#C85A32] shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E4E2DC] hover:border-[#C85A32]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">CRITICAL PRIORITY</span>
                <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
              </div>
              <strong className="text-2xl font-mono font-semibold text-[#121316] mt-1 block">
                {stats.critical_anomalies}
              </strong>
              <span className="text-[11px] text-[#71717A] font-light">Highest statistical variance</span>
            </button>

            {/* High */}
            <button
              type="button"
              onClick={() => updateParam('severity', severity === 'HIGH' ? null : 'HIGH')}
              className={`p-4 rounded-2xl text-left transition border cursor-pointer ${
                severity === 'HIGH'
                  ? 'bg-[#FDF6E2] border-[#946200] ring-1 ring-[#946200] shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E4E2DC] hover:border-[#946200]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#946200] uppercase tracking-widest font-semibold">HIGH PRIORITY</span>
                <span className="w-2 h-2 rounded-full bg-[#946200]" />
              </div>
              <strong className="text-2xl font-mono font-semibold text-[#121316] mt-1 block">
                {stats.high_anomalies}
              </strong>
              <span className="text-[11px] text-[#71717A] font-light">Elevated divergence</span>
            </button>

            {/* Medium */}
            <button
              type="button"
              onClick={() => updateParam('severity', severity === 'MEDIUM' ? null : 'MEDIUM')}
              className={`p-4 rounded-2xl text-left transition border cursor-pointer ${
                severity === 'MEDIUM'
                  ? 'bg-[#F0EFEA] border-[#121316] ring-1 ring-[#121316] shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E4E2DC] hover:border-[#121316]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#121316] uppercase tracking-widest font-semibold">MEDIUM PRIORITY</span>
                <span className="w-2 h-2 rounded-full bg-[#121316]" />
              </div>
              <strong className="text-2xl font-mono font-semibold text-[#121316] mt-1 block">
                {stats.medium_anomalies}
              </strong>
              <span className="text-[11px] text-[#71717A] font-light">Moderate variation</span>
            </button>

            {/* Low */}
            <button
              type="button"
              onClick={() => updateParam('severity', severity === 'LOW' ? null : 'LOW')}
              className={`p-4 rounded-2xl text-left transition border cursor-pointer ${
                severity === 'LOW'
                  ? 'bg-[#F0EFEA] border-[#71717A] ring-1 ring-[#71717A] shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E4E2DC] hover:border-[#71717A]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest font-semibold">LOW PRIORITY</span>
                <span className="w-2 h-2 rounded-full bg-[#71717A]" />
              </div>
              <strong className="text-2xl font-mono font-semibold text-[#121316] mt-1 block">
                {stats.low_anomalies}
              </strong>
              <span className="text-[11px] text-[#71717A] font-light">Baseline fluctuation</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Entity Filter Tabs, State Selector & Search Bar */}
      <div className="cw-card p-4 space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Entity Type Filter Tabs */}
          <div className="lg:col-span-5 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: '', label: 'All Signals' },
              { id: 'VENDOR', label: 'Contractors' },
              { id: 'WORK', label: 'Work Schemes' },
              { id: 'MP', label: 'MPs' },
              { id: 'TRANSACTION', label: 'Vouchers' },
            ].map((tab) => {
              const isActive = entityType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => updateParam('entity_type', tab.id || null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? 'bg-[#121316] text-white border-[#121316] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#71717A] border-[#E4E2DC] hover:text-[#121316] hover:border-[#121316]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* State Filter */}
          <div className="lg:col-span-4">
            <select
              value={state}
              disabled={isStateLocked}
              onChange={(e) => updateParam('state', e.target.value || null)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition font-sans disabled:opacity-75"
            >
              <option value="">All States &amp; UTs</option>
              {states.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state} {isStateLocked && s.state.toUpperCase() === user?.state?.toUpperCase() ? '(Mandate Scope)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleIdSearch} className="lg:col-span-3 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search by ID, keyword..."
              value={entityIdInput}
              onChange={(e) => setEntityIdInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs text-[#121316] placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition font-sans"
            />
          </form>
        </div>

        {/* Active Filter Pills Bar */}
        {(entityId || entityType || severity || state) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E4E2DC] text-xs text-[#71717A] flex-wrap">
            <span className="text-[10px] font-semibold uppercase font-mono text-[#71717A]">ACTIVE:</span>
            {state && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] font-semibold text-[11px] border border-[#E4E2DC]">
                State: {state}
              </span>
            )}
            {entityId && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] font-semibold text-[11px] border border-[#E8C5B6]">
                Search: {entityId}
              </span>
            )}
            {entityType && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] font-semibold text-[11px] border border-[#E4E2DC]">
                Target: {entityType}
              </span>
            )}
            {severity && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] font-semibold text-[11px] border border-[#E8C5B6]">
                Level: {severity}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-[#C85A32] hover:text-[#9E3E1C] font-semibold ml-auto flex items-center gap-1 hover:underline text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Human-Friendly Signal Cards */}
      {loading ? (
        <LoadingSkeleton rows={6} height="h-28" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadAnomalies} />
      ) : anomalies.length === 0 ? (
        <EmptyState
          title="No Statistical Signals Found"
          description="No anomalies matched your selected filters. All records in this view are within standard peer distributions."
          onReset={handleReset}
        />
      ) : (
        <div className="space-y-4">
          {anomalies.map((anom) => {
            const isMathExpanded = expandedMathIds.has(anom.anomaly_id);
            const typeInfo = getFriendlyTypeInfo(anom.anomaly_type);
            const TypeIcon = typeInfo.icon;

            return (
              <div
                key={anom.anomaly_id}
                className="cw-card p-5 sm:p-6 space-y-4 hover:border-[#C85A32]/40 transition"
              >
                {/* Top Row: Type, Severity, and Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <SeverityBadge severity={anom.severity} />

                    {/* Friendly Category Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-mono text-[#121316]">
                      <TypeIcon className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>{typeInfo.label}</span>
                    </div>

                    <span className="text-[11px] font-mono text-[#71717A]">
                      ID: #{anom.anomaly_id}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveDossier({ type: 'SIGNAL', data: anom })}
                    className="cw-btn-primary text-xs py-1.5 px-4 self-start sm:self-auto cursor-pointer"
                  >
                    <span>Inspect Target Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Plain-Language Reason */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-serif font-normal text-[#121316] leading-snug">
                    {anom.reason}
                  </h3>
                  <p className="text-xs text-[#71717A] font-light">
                    {typeInfo.desc}
                  </p>
                </div>

                {/* Context Strip: Target Entity, Observed vs Normal Peer Baseline */}
                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#71717A] block">
                      Target Entity
                    </span>
                    <strong className="font-mono text-[#121316] truncate block font-semibold">
                      {anom.entity_type} · #{anom.entity_id}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#71717A] block">
                      Actual Observed Value
                    </span>
                    <strong className="font-mono font-semibold text-[#C85A32] block">
                      {anom.observed_value !== undefined ? String(anom.observed_value) : 'N/A'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#71717A] block">
                      Peer Group Median
                    </span>
                    <strong className="font-mono font-semibold text-[#121316] block truncate">
                      {anom.baseline_reference || anom.threshold_value || 'National Baseline'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#71717A] block">
                      Deviation Distance
                    </span>
                    <strong className="font-mono font-semibold text-[#121316] block">
                      {anom.robust_zscore ? `${anom.robust_zscore.toFixed(1)}x Peer Spread` : 'Standard Distance'}
                    </strong>
                  </div>
                </div>

                {/* Optional Collapsible Formula for Researchers/Auditors */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleMathExpand(anom.anomaly_id)}
                    className="text-[11px] font-mono text-[#71717A] hover:text-[#C85A32] inline-flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{isMathExpanded ? 'Hide Calculation Details' : 'View Mathematical Formula (MAD Robust Z-Score)'}</span>
                    {isMathExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <AnimatePresence>
                    {isMathExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-2"
                      >
                        <div className="p-3.5 rounded-xl bg-[#121316] text-[#FAF8F5] text-xs font-mono space-y-2 border border-[#E4E2DC]">
                          <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] border-b border-[#2A2B30] pb-1.5">
                            <span>FORMULA: Z = 0.6745 × (x - median) / MAD</span>
                            <span className="text-[#C85A32]">ROBUST Z-SCORE: {anom.robust_zscore?.toFixed(3) || 'N/A'}σ</span>
                          </div>
                          <p className="text-[11px] text-[#D4D2CD] font-light leading-relaxed">
                            Calculation: (Observed: {anom.observed_value} vs Baseline: {anom.baseline_reference || anom.threshold_value || 'Peer Group'}) evaluated against empirical peer dispersion across 102,437 physical works and 778 parliamentary seats. Does NOT assert irregularity.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Pagination */}
      {total > limit && (
        <Pagination
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={(newOffset) => updateParam('offset', String(newOffset))}
        />
      )}

      {/* Slide-out Dossier Drawer */}
      <EntityDossierDrawer entity={activeDossier} onClose={() => setActiveDossier(null)} />
    </div>
  );
};
