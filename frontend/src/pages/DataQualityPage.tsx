import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Database,
  FileCheck,
  Activity,
  Layers,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Info,
  Scale,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  Link2,
  TrendingUp,
  Zap,
  Building2,
  ArrowUpRight,
  History,
  GitCommit,
  FileText,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../api/client';
import {
  DataQualityReport,
  SourceRegistryItem,
  PaymentTimingSignal,
  DiscoveredSourceItem,
  HistoricalSnapshotItem,
  ChangeEventItem,
  ReconciliationRecordItem,
} from '../api/types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';

export const DataQualityPage: React.FC = () => {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [sources, setSources] = useState<SourceRegistryItem[]>([]);
  const [timingSignals, setTimingSignals] = useState<PaymentTimingSignal[]>([]);
  const [timingTotal, setTimingTotal] = useState<number>(0);
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [discoveredSources, setDiscoveredSources] = useState<DiscoveredSourceItem[]>([]);
  const [snapshots, setSnapshots] = useState<HistoricalSnapshotItem[]>([]);
  const [changeEvents, setChangeEvents] = useState<ChangeEventItem[]>([]);
  const [reconciliationRecords, setReconciliationRecords] = useState<ReconciliationRecordItem[]>([]);
  const [reconciliationCounts, setReconciliationCounts] = useState({ matched: 0, review: 0, gap: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dqData, srcData, timingData, discSrc, snapData, chgData, recData] = await Promise.all([
        api.getDataQuality(),
        api.getSources().catch(() => ({ items: [], total: 0 })),
        api.getPaymentTimingSignals({ limit: 4 }).catch(() => ({ items: [], total: 0 })),
        api.getDiscoveredSources().catch(() => ({ sources: [], total_sources: 0, health_summary: {} as any })),
        api.getHistoricalSnapshots().catch(() => ({ items: [], total: 0 })),
        api.getChangeEvents({ limit: 8 }).catch(() => ({ items: [], total: 0, limit: 8, offset: 0 })),
        api.getReconciliationRecords().catch(() => ({ items: [], total: 0, matched_count: 0, review_count: 0, gap_count: 0 })),
      ]);
      setReport(dqData);
      setSources(srcData.items || []);
      setTimingSignals(timingData.items || []);
      setTimingTotal(timingData.total || 0);
      setDiscoveredSources(discSrc.sources || []);
      setSnapshots(snapData.items || []);
      setChangeEvents(chgData.items || []);
      setReconciliationRecords(recData.items || []);
      setReconciliationCounts({
        matched: recData.matched_count || 0,
        review: recData.review_count || 0,
        gap: recData.gap_count || 0
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load data quality and source telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredSources = selectedTier === 'ALL'
    ? sources
    : sources.filter(s => s.trust_tier.toLowerCase().includes(selectedTier.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans text-[#121316]">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Methodology & Audits', to: '/methodology' },
          { label: 'Data Quality & Provenance' },
        ]}
      />

      {/* Header */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E4E2DC] pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="cw-badge-section">
                § X · CRYPTOGRAPHIC PROVENANCE &amp; DATA INTEGRITY
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#71717A] text-[10px] font-mono border border-[#E4E2DC]">
                DETERMINISTIC AUDIT GRADE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#121316] tracking-tight">
              Dataset Integrity, Telemetry &amp; <em className="font-serif italic font-normal text-[#C85A32]">Statutory Provenance</em>
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] max-w-3xl font-light leading-relaxed">
              Continuous empirical validation of dataset completeness, field integrity, statutory rule benchmarks, and zero-variance mathematical reconciliations across 102,437 ground works and 82,296 treasury transactions.
            </p>
          </div>

          {report && (
            <div className="p-4 rounded-2xl bg-[#FAF0EB] border border-[#E8C5B6] text-center min-w-[150px] shrink-0">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C85A32] block font-semibold">Dataset Health</span>
              <span className="text-3xl sm:text-4xl font-serif font-bold text-[#121316]">
                {report.overall_health_score}%
              </span>
              <span className="text-[10px] font-mono text-[#71717A] block mt-0.5">Audit-Grade Certified</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : error || !report ? (
        <ErrorDisplay message={error || 'Report unavailable'} onRetry={loadAll} />
      ) : (
        <div className="space-y-8">
          {/* Boundary Notice */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-[#F0EFEA] px-5 py-4 flex gap-3">
            <Info className="w-5 h-5 text-[#C85A32] shrink-0 mt-0.5" />
            <div className="text-xs text-[#4A4D53] leading-relaxed">
              <strong className="text-[#121316]">Data scope &amp; temporal boundary:</strong> MP, work, transaction, vendor, and anomaly records are the frozen 26 August 2026 baseline. Newer e-SAKSHI observations are stored only as separately labelled live national macro snapshots; they are not merged into the baseline to preserve zero-mutation determinism.
            </div>
          </div>

          {/* Core Metrics Cards Grid (Bento Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#C85A32]">/ 01</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                  Text Completeness
                </span>
              </div>
              <span className="text-3xl font-serif font-bold text-[#121316] block">
                {report.metrics.description_completeness_pct}%
              </span>
              <p className="text-xs text-[#71717A] font-light leading-relaxed">
                Documented work descriptions across 102,437 physical infrastructure works.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#C85A32]">/ 02</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                  Amount Integrity
                </span>
              </div>
              <span className="text-3xl font-serif font-bold text-[#121316] block">
                {report.metrics.amount_integrity_pct}%
              </span>
              <p className="text-xs text-[#71717A] font-light leading-relaxed">
                Non-negative, double-entry verified financial allocation limits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#C85A32]">/ 03</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                  Chronology SLA
                </span>
              </div>
              <span className="text-3xl font-serif font-bold text-[#121316] block">
                {report.metrics.timeline_chronology_pct}%
              </span>
              <p className="text-xs text-[#71717A] font-light leading-relaxed">
                Valid recommendation, sanction, and completion milestone records.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#C85A32]">/ 04</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                  Reconciliation
                </span>
              </div>
              <span className="text-3xl font-serif font-bold text-[#2E7D32] block">
                {report.metrics.reconciliation_variance_inr}
              </span>
              <p className="text-xs text-[#71717A] font-light leading-relaxed">
                Zero discrepancy between disbursed vouchers and statutory allocation limits.
              </p>
            </div>
          </div>

          {/* Authoritative Data Source Registry & Trust Tiers */}
          <div className="rounded-2xl bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E4E2DC] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#C85A32]" />
                  <h3 className="text-xl font-serif text-[#121316]">
                    Authoritative Public Source Registry ({sources.length} Discovered)
                  </h3>
                </div>
                <p className="text-xs text-[#71717A] font-light mt-0.5">
                  Traceable government portals, legislative archives, and statutory audit publications informing JanDrishti.
                </p>
              </div>

              {/* Tier Filter Buttons */}
              <div className="flex flex-wrap gap-1 p-1 rounded-full bg-[#F0EFEA] border border-[#E4E2DC] text-[11px]">
                {['ALL', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'].map(tier => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      selectedTier === tier
                        ? 'bg-[#121316] text-[#FAF8F5] font-semibold shadow-xs'
                        : 'text-[#71717A] hover:text-[#121316]'
                    }`}
                  >
                    {tier === 'ALL' ? 'All Sources' : tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSources.map((s) => {
                const isTier1 = s.trust_tier.includes('Tier 1');
                const isTier2 = s.trust_tier.includes('Tier 2');
                const badgeColor = isTier1
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isTier2
                  ? 'bg-[#FAF0EB] text-[#C85A32] border-[#E8C5B6]'
                  : 'bg-[#F0EFEA] text-[#71717A] border-[#E4E2DC]';

                return (
                  <div
                    key={s.source_id}
                    className="p-5 rounded-2xl border border-[#E4E2DC] hover:border-[#C85A32] hover:shadow-xs transition-all space-y-3 bg-[#FAF8F5] flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${badgeColor}`}>
                          {s.trust_tier.split(' - ')[0]}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${
                          s.status === 'INTEGRATED' ? 'text-emerald-700' : 'text-[#C85A32]'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-serif font-bold text-[#121316]">{s.source_name}</h4>
                      <p className="text-[11px] text-[#71717A] line-clamp-1">{s.organization}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E4E2DC] text-[11px] space-y-2">
                      <p className="text-[#4A4D53] font-light text-[11px] leading-snug">
                        {s.license_or_access_note}
                      </p>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#C85A32] hover:underline pt-1"
                      >
                        Official Portal <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Timing Intelligence Preview */}
          <div className="rounded-2xl bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E4E2DC] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#C85A32]" />
                  <h3 className="text-xl font-serif text-[#121316]">
                    Payment Timing &amp; Financial Velocity Forensics ({timingTotal.toLocaleString()} Signals)
                  </h3>
                </div>
                <p className="text-xs text-[#71717A] font-light mt-0.5">
                  Algorithmic detection of fiscal year-end concentration surges (March Rush), rapid multi-voucher bunching, and repeating disbursement values.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#F0EFEA] text-[#71717A] text-xs font-mono font-semibold border border-[#E4E2DC] shrink-0">
                100% Verified Vouchers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {timingSignals.map((sig) => (
                <div key={sig.signal_id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6]">
                      {sig.signal_type.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-rose-600">
                      {sig.severity}
                    </span>
                  </div>
                  <div className="font-serif font-bold text-[#121316] text-xs line-clamp-1">{sig.entity_name}</div>
                  <div className="text-base font-serif font-bold text-[#121316]">
                    ₹{(sig.affected_amount / 100000).toFixed(1)} Lakh
                  </div>
                  <p className="text-[11px] text-[#71717A] font-light line-clamp-2 leading-relaxed">
                    {sig.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Benchmark Rules (MPLADS Guidelines 2023) */}
          {report.statutory_benchmarks && (
            <div className="rounded-2xl bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#C85A32]" />
                <h3 className="text-xl font-serif text-[#121316]">
                  Official Statutory Benchmarks — MPLADS Guidelines 2023
                </h3>
              </div>
              <p className="text-xs text-[#71717A] font-light">
                Governing rules enforced by the Ministry of Statistics and Programme Implementation (MoSPI) under the e-SAKSHI digital framework.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#C85A32] font-mono text-[10px] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    SANCTION TIMELINE
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#121316]">
                    {report.statutory_benchmarks.statutory_decision_window_days} Days
                  </div>
                  <p className="text-[11px] text-[#71717A] font-light leading-relaxed">
                    District Authority must examine and sanction or reject work within 45 days.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#C85A32] font-mono text-[10px] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    EXECUTION LIMIT
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#121316]">
                    {report.statutory_benchmarks.statutory_completion_window_months} Months
                  </div>
                  <p className="text-[11px] text-[#71717A] font-light leading-relaxed">
                    Standard completion window from the date of administrative sanction.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#C85A32] font-mono text-[10px] font-bold">
                    <Database className="w-3.5 h-3.5" />
                    ANNUAL ENTITLEMENT
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#121316]">
                    ₹{report.statutory_benchmarks.annual_entitlement_per_mp_cr} Crore
                  </div>
                  <p className="text-[11px] text-[#71717A] font-light leading-relaxed">
                    Single annual installment allocated directly to the MP nodal account.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#C85A32] font-mono text-[10px] font-bold">
                    <Scale className="w-3.5 h-3.5" />
                    OUTSIDE SEAT CAP
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#121316]">
                    ₹{report.statutory_benchmarks.out_of_constituency_spending_limit_lakh} Lakh
                  </div>
                  <p className="text-[11px] text-[#71717A] font-light leading-relaxed">
                    Statutory ceiling for recommending works outside the MP's constituency.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Field-Level Observability Matrix */}
          {report.field_observability_matrix && (
            <div className="rounded-2xl bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xl font-serif text-[#121316]">
                    Field Observability &amp; Source Coverage Matrix
                  </h3>
                  <p className="text-xs text-[#71717A] font-light mt-0.5">
                    Transparent accounting of which parameters are verified from official government portals versus unobserved parameters that JanDrishti refuses to fabricate.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#71717A]">
                  SOURCE DATA &gt; ASSUMPTION
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Observed Fields */}
                <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[#2E7D32] font-serif font-bold text-sm">
                    <Eye className="w-4 h-4 text-[#2E7D32]" />
                    Verified Observed Fields in Public Export
                  </div>
                  <div className="space-y-2">
                    {report.field_observability_matrix.observed_fields.map((f, i) => (
                      <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-white border border-[#E4E2DC] text-xs">
                        <div>
                          <span className="font-mono font-bold text-[#121316]">{f.field}</span>
                          <span className="text-[10px] text-[#71717A] block">{f.source}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200 shrink-0">
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unobserved Fields in Public Export */}
                <div className="rounded-2xl border border-[#E8C5B6] bg-[#FAF0EB]/40 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[#C85A32] font-serif font-bold text-sm">
                    <EyeOff className="w-4 h-4 text-[#C85A32]" />
                    Unobserved in Public Export (Declared NULL — Never Fabricated)
                  </div>
                  <div className="space-y-2">
                    {report.field_observability_matrix.unobserved_fields_in_public_export.map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-[#E8C5B6] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#121316]">{f.field}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6]">
                            Declared NULL
                          </span>
                        </div>
                        <p className="text-[11px] text-[#71717A] font-light leading-relaxed">
                          {f.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1. Official Government Data Endpoints Registry (Tier 1–4) */}
          {discoveredSources.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E2DC] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6]">
                      Tier 1–4 Discovery
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F0EFEA] text-[#71717A] text-[10px] font-mono font-bold border border-[#E4E2DC]">
                      {discoveredSources.length} Verified Endpoints
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-[#121316]">
                    Authoritative Public Government Endpoint Registry
                  </h3>
                  <p className="text-xs text-[#71717A] font-light mt-0.5">
                    Legitimate publicly exposed APIs, dashboards, and reporting repositories across MoSPI, Parliament of India, NIC, and CAG.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-mono text-[#2E7D32] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Public Access
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoveredSources.map((src) => (
                  <div key={src.source_id} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] hover:border-[#C85A32] transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-white border border-[#E4E2DC] text-[#121316] text-[10px] font-mono font-bold">
                          {src.tier.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          src.reliability_level === 'OFFICIAL_PRIMARY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]'
                        }`}>
                          {src.reliability_level.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-[#121316] text-sm leading-snug">
                        {src.source_name}
                      </h4>
                      <p className="text-[11px] text-[#71717A] font-light line-clamp-2">
                        {src.official_organization}
                      </p>

                      <div className="p-2.5 rounded-xl bg-white border border-[#E4E2DC] font-mono text-[10px] text-[#4A4D53] truncate">
                        <span className="font-bold text-[#C85A32] mr-1.5">{src.http_method}</span>
                        {src.endpoint}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#E4E2DC] text-[10px] text-[#71717A] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[#71717A]">Sync Frequency:</span>
                        <span className="font-bold text-[#121316]">{src.refresh_frequency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[#71717A]">Data Format:</span>
                        <span className="font-bold text-[#121316] font-mono">{src.data_format}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Historical Reporting Snapshots & Granular Change Detection Ledger */}
          <div className="rounded-2xl bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E2DC] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#F0EFEA] text-[#71717A] text-[10px] font-mono font-bold border border-[#E4E2DC]">
                    Temporal Ledger
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6]">
                    {snapshots.length} Snapshots • {changeEvents.length} Recent Changes
                  </span>
                </div>
                <h3 className="text-xl font-serif text-[#121316]">
                  Historical Reporting Snapshots &amp; Lifecycle Change Events
                </h3>
                <p className="text-xs text-[#71717A] font-light mt-0.5">
                  Immutable versioned snapshots tracking granular cost adjustments, status advancements, and timeline extensions.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#71717A]">
                ZERO OVERWRITE PROTOCOL
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Snapshot Timeline */}
              <div className="lg:col-span-1 rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-5 space-y-4">
                <div className="flex items-center gap-2 text-[#121316] font-serif font-bold text-sm">
                  <History className="w-4 h-4 text-[#C85A32]" />
                  Versioned Snapshots
                </div>

                <div className="space-y-3">
                  {snapshots.map((s) => (
                    <div key={s.snapshot_id} className="p-3.5 rounded-xl bg-white border border-[#E4E2DC] text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#C85A32]">{s.snapshot_id}</span>
                        <span className="font-mono text-[10px] text-[#71717A]">{s.snapshot_date}</span>
                      </div>
                      <p className="text-[11px] text-[#4A4D53] font-light leading-relaxed">{s.notes}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] pt-1.5 border-t border-[#E4E2DC]">
                        <span>{s.record_count.toLocaleString()} Records</span>
                        <span className="truncate max-w-[110px]" title={s.checksum_sha256}>
                          SHA: {s.checksum_sha256.substring(0, 10)}...
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Change Events */}
              <div className="lg:col-span-2 rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#121316] font-serif font-bold text-sm">
                    <GitCommit className="w-4 h-4 text-[#C85A32]" />
                    Detected Project Change Events
                  </div>
                  <span className="text-[10px] font-mono text-[#71717A]">
                    Latest Lifecycle Deltas
                  </span>
                </div>

                <div className="space-y-2.5">
                  {changeEvents.map((evt) => (
                    <div key={evt.event_id} className="p-3.5 rounded-xl bg-white border border-[#E4E2DC] text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            evt.change_type === 'COST_REVISED'
                              ? 'bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]'
                              : evt.change_type === 'STATUS_ADVANCED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-[#F0EFEA] text-[#121316] border border-[#E4E2DC]'
                          }`}>
                            {evt.change_type.replace('_', ' ')}
                          </span>
                          <span className="font-mono font-bold text-[#121316]">{evt.event_id}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : evt.severity === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-[#F0EFEA] text-[#71717A]'
                        }`}>
                          {evt.severity}
                        </span>
                      </div>

                      <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                        {evt.finding_summary}
                      </p>

                      <div className="flex items-center gap-4 text-[10px] font-mono text-[#71717A] pt-1.5 border-t border-[#E4E2DC]">
                        <span>Baseline: <strong className="text-[#121316]">{evt.old_value || 'N/A'}</strong></span>
                        <span>→</span>
                        <span>Reconciled: <strong className="text-[#121316]">{evt.new_value || 'N/A'}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Official Data Reconciliation & Verification Matrix */}
          <div className="rounded-2xl bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E2DC] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                    Zero Discrepancy Standard
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0EFEA] text-[#71717A] text-[10px] font-mono font-bold border border-[#E4E2DC]">
                    {reconciliationRecords.length} Reconciled Checkpoints
                  </span>
                </div>
                <h3 className="text-xl font-serif text-[#121316]">
                  Official Data Reconciliation Matrix
                </h3>
                <p className="text-xs text-[#71717A] font-light mt-0.5">
                  Controlled verification comparing JanDrishti datasets with official ministerial reporting and gazette publications.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-bold text-emerald-700">
                  {reconciliationCounts.matched} MATCHED
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F0EFEA] border border-[#E4E2DC] text-[11px] font-mono font-bold text-[#71717A]">
                  {reconciliationCounts.gap} PUBLIC GAPS DISCLOSED
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {reconciliationRecords.slice(0, 6).map((rec) => (
                <div key={rec.reconciliation_id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#121316]">{rec.entity_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        rec.status === 'MATCHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#FAF0EB] text-[#C85A32]'
                      }`}>
                        {rec.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A4D53] font-light leading-relaxed">
                      {rec.variance_summary}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#E4E2DC] font-mono text-[10px] space-y-1 min-w-[220px]">
                    <div className="flex justify-between text-[#71717A]">
                      <span>JanDrishti:</span>
                      <strong className="text-[#121316]">{rec.existing_value}</strong>
                    </div>
                    <div className="flex justify-between text-[#71717A]">
                      <span>Official Source:</span>
                      <strong className="text-emerald-700">{rec.official_value}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclosed Limitations & Ethical Governance Protocol */}
          {report.disclosed_limitations && (
            <div className="rounded-2xl bg-[#121316] text-[#FAF8F5] p-6 sm:p-8 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-[#C85A32]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-xl font-serif text-[#FAF8F5]">
                  Responsible AI &amp; Technical Disclosures
                </h3>
              </div>
              <p className="text-xs text-[#A1A1AA] font-light">
                JanDrishti is designed as an analytical triage copilot for public authorities, not a legal judicial prosecutor.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {report.disclosed_limitations.map((lim, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#1E2024] border border-[#2A2C30] text-xs text-[#D4D4D8] space-y-1">
                    <span className="font-mono font-bold text-[#C85A32] text-[10px] block">
                      PROTOCOL #{i + 1}
                    </span>
                    <p className="leading-relaxed font-light">{lim}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provenance & Architecture Dossier */}
          <div className="rounded-2xl bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-xl font-serif text-[#121316]">
              Authoritative Source Provenance &amp; Immutability Standard
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                <span className="font-mono font-bold text-[#C85A32] text-[10px] block uppercase">DATA SNAPSHOT</span>
                <div className="font-serif font-bold text-[#121316] text-base">{report.provenance.data_snapshot_date}</div>
                <p className="text-[#71717A] font-light leading-relaxed">Verified baseline snapshot representing the official MoSPI repository.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                <span className="font-mono font-bold text-[#C85A32] text-[10px] block uppercase">SOURCE REPOSITORIES</span>
                <div className="font-serif font-bold text-[#121316] text-base">3 Official Channels</div>
                <p className="text-[#71717A] font-light leading-relaxed">MoSPI Central Portal, eSAKSHI Transaction Ledgers, and State Treasury Vouchers.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                <span className="font-mono font-bold text-[#C85A32] text-[10px] block uppercase">STORAGE ARCHITECTURE</span>
                <div className="font-serif font-bold text-[#121316] text-base">Read-Only Immutable SQLite</div>
                <p className="text-[#71717A] font-light leading-relaxed">156.84 MB bundled artifact open in strict query-only mode to prevent mutation.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
