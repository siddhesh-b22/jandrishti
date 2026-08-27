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
import { Anomaly, StatsResponse } from '../api/types';
import { useHouse } from '../context/HouseContext';
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMathIds, setExpandedMathIds] = useState<Set<string>>(new Set());
  const [showGuide, setShowGuide] = useState(true);
  const [activeDossier, setActiveDossier] = useState<DossierEntity | null>(null);

  // URL Parameters
  const entityType = searchParams.get('entity_type') || '';
  const severity = searchParams.get('severity') || '';
  const entityId = searchParams.get('entity_id') || '';
  const sortBy = searchParams.get('sort_by') || 'severity';
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = 50;

  const [entityIdInput, setEntityIdInput] = useState(entityId);

  const loadAnomalies = async () => {
    try {
      setLoading(true);
      setError(null);
      const [anomData, statsData] = await Promise.all([
        api.getAnomalies({
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
  }, [entityType, severity, entityId, sortBy, sortOrder, offset]);

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
    setSearchParams(new URLSearchParams());
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
    <div className="space-y-8 animate-fade-in text-[#0F172A] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Signal Center', to: '/anomalies', icon: ShieldAlert }]} />

      {/* 2. Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-rose-700 uppercase tracking-widest">
              PUBLIC TRANSPARENCY &amp; AUDIT INTELLIGENCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Analytical Signal Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-3xl">
            Signals are automated statistical alerts that highlight unusual patterns in public spending (such as contractor concentration or project delays).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1.5 border border-blue-200"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showGuide ? 'Hide Guide' : 'How Signals Work'}</span>
          </button>

          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-mono font-bold">
            {total.toLocaleString()} Signals Verified
          </span>
        </div>
      </div>

      {/* 3. Plain-English Educational Guide Banner (Collapsible) */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Understanding JanDrishti Signals (In Plain English)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                  Citizen Guide
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white/80 border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono text-[10px]">
                      1
                    </span>
                    <span>What is a Signal?</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-sans">
                    A Signal is triggered when a project, representative, or contractor deviates mathematically from peer averages across 28 States and 8 Union Territories.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono text-[10px]">
                      2
                    </span>
                    <span>Does It Mean Wrongdoing?</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-sans">
                    <strong>No.</strong> Signals are objective markers for administrative review (e.g. emergency flood relief works can trigger high spending signals naturally).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-mono text-[10px]">
                      3
                    </span>
                    <span>How Is It Calculated?</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-sans">
                    We use <strong>Median Absolute Deviation (MAD)</strong>, which compares data against true medians instead of easily skewed averages.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Priority Level Selector Cards */}
      {stats && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Filter By Review Priority Level:</span>
            {severity && (
              <button
                type="button"
                onClick={() => updateParam('severity', null)}
                className="text-blue-600 hover:underline font-bold"
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
                  ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-700 uppercase font-mono">CRITICAL PRIORITY</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
              <strong className="text-2xl font-black text-rose-900 font-mono mt-1 block">
                {stats.critical_anomalies}
              </strong>
              <span className="text-[11px] text-slate-500 font-medium">Highest statistical deviation</span>
            </button>

            {/* High */}
            <button
              type="button"
              onClick={() => updateParam('severity', severity === 'HIGH' ? null : 'HIGH')}
              className={`p-4 rounded-2xl text-left transition border cursor-pointer ${
                severity === 'HIGH'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase font-mono">HIGH PRIORITY</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>
              <strong className="text-2xl font-black text-amber-900 font-mono mt-1 block">
                {stats.high_anomalies}
              </strong>
              <span className="text-[11px] text-slate-500 font-medium">Elevated variation</span>
            </button>

            {/* Medium */}
            <button
              type="button"
              onClick={() => updateParam('severity', severity === 'MEDIUM' ? null : 'MEDIUM')}
              className={`p-4 rounded-2xl text-left transition border cursor-pointer ${
                severity === 'MEDIUM'
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 uppercase font-mono">MEDIUM PRIORITY</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              </div>
              <strong className="text-2xl font-black text-blue-900 font-mono mt-1 block">
                {stats.medium_anomalies}
              </strong>
              <span className="text-[11px] text-slate-500 font-medium">Moderate divergence</span>
            </button>

            {/* Low */}
            <button
              type="button"
              onClick={() => updateParam('severity', severity === 'LOW' ? null : 'LOW')}
              className={`p-4 rounded-2xl text-left transition border cursor-pointer ${
                severity === 'LOW'
                  ? 'bg-slate-100 border-slate-500 ring-2 ring-slate-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase font-mono">LOW PRIORITY</span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              </div>
              <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {stats.low_anomalies}
              </strong>
              <span className="text-[11px] text-slate-500 font-medium">Minor baseline variation</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Entity Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Entity Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: '', label: 'All Signals' },
              { id: 'VENDOR', label: 'Contractors' },
              { id: 'WORK', label: 'Work Projects' },
              { id: 'MP', label: 'Parliamentarians' },
              { id: 'TRANSACTION', label: 'Vouchers' },
            ].map((tab) => {
              const isActive = entityType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => updateParam('entity_type', tab.id || null)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <form onSubmit={handleIdSearch} className="relative sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, keyword, or name..."
              value={entityIdInput}
              onChange={(e) => setEntityIdInput(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition font-sans"
            />
          </form>
        </div>

        {/* Active Filter Pills Bar */}
        {(entityId || entityType || severity) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex-wrap">
            <span className="text-[10px] font-bold uppercase font-mono text-slate-400">ACTIVE:</span>
            {entityId && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                Search: {entityId}
              </span>
            )}
            {entityType && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[11px]">
                Target: {entityType}
              </span>
            )}
            {severity && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 font-bold text-[11px]">
                Level: {severity}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-800 font-bold ml-auto flex items-center gap-1 hover:underline text-[11px] cursor-pointer"
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
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition p-5 sm:p-6 space-y-4"
              >
                {/* Top Row: Type, Severity, and Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <SeverityBadge severity={anom.severity} />

                    {/* Friendly Category Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${typeInfo.color}`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                      <span>{typeInfo.label}</span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      ID: #{anom.anomaly_id}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveDossier({ type: 'SIGNAL', data: anom })}
                    className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <span>Inspect Target Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Plain-Language Reason */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-sans leading-snug">
                    {anom.reason}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {typeInfo.desc}
                  </p>
                </div>

                {/* Context Strip: Target Entity, Observed vs Normal Peer Baseline */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                      Target Entity
                    </span>
                    <strong className="font-bold text-slate-900 truncate block">
                      {anom.entity_type} · #{anom.entity_id}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                      Actual Observed Value
                    </span>
                    <strong className="font-mono font-bold text-rose-700 block">
                      {anom.observed_value !== undefined ? String(anom.observed_value) : 'N/A'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                      Peer Group Median
                    </span>
                    <strong className="font-mono font-bold text-slate-700 block truncate">
                      {anom.baseline_reference || anom.threshold_value || 'National Baseline'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                      Deviation Distance
                    </span>
                    <strong className="font-mono font-bold text-blue-700 block">
                      {anom.robust_zscore ? `${anom.robust_zscore.toFixed(1)}x Peer Spread` : 'Standard Distance'}
                    </strong>
                  </div>
                </div>

                {/* Optional Collapsible Formula for Researchers/Auditors */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleMathExpand(anom.anomaly_id)}
                    className="text-[11px] font-bold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 cursor-pointer transition"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{isMathExpanded ? 'Hide Calculation Details' : 'View Mathematical Formula (MAD Z-Score)'}</span>
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
                        <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                            <span>FORMULA: Z = 0.6745 × (x - median) / MAD</span>
                            <span>ROBUST Z-SCORE: {anom.robust_zscore?.toFixed(3) || 'N/A'}σ</span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            Calculation: (Observed: {anom.observed_value} vs Baseline: {anom.baseline_reference || anom.threshold_value || 'Peer Group'}) evaluated against empirical peer dispersion across 102,437 physical works and 778 parliamentary seats.
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
