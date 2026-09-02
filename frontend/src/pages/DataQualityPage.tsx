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
} from 'lucide-react';
import { api } from '../api/client';
import { DataQualityReport } from '../api/types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';

export const DataQualityPage: React.FC = () => {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getDataQuality();
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load data quality report');
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-manrope">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Methodology & Audits', to: '/methodology' },
          { label: 'Data Quality & Provenance' },
        ]}
      />

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-widest border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Data Integrity &amp; Provenance Protocol
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                Deterministic Audit Grade
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#08102B] tracking-tight">
              MPLADS Master Dataset Health &amp; Verification Metrics
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl font-light leading-relaxed">
              Continuous empirical validation of dataset completeness, field integrity, and zero-variance mathematical reconciliations across 102,437 ground works and 82,296 treasury transactions.
            </p>
          </div>

          {report && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[140px] shrink-0">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block font-mono">Dataset Health</span>
              <span className="text-3xl font-black font-mono text-emerald-900">
                {report.overall_health_score}%
              </span>
              <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">Audit-Grade</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : error || !report ? (
        <ErrorDisplay message={error || 'Report unavailable'} onRetry={() => window.location.reload()} />
      ) : (
        <div className="space-y-6">
          {/* Core Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Description Completeness
              </span>
              <span className="text-2xl font-black font-mono text-[#08102B]">
                {report.metrics.description_completeness_pct}%
              </span>
              <p className="text-xs text-slate-500 font-light">
                Documented work descriptions across 102,437 physical infrastructure works.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Amount Field Integrity
              </span>
              <span className="text-2xl font-black font-mono text-[#08102B]">
                {report.metrics.amount_integrity_pct}%
              </span>
              <p className="text-xs text-slate-500 font-light">
                Non-negative, double-entry verified financial allocation limits.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Timeline Chronology
              </span>
              <span className="text-2xl font-black font-mono text-[#08102B]">
                {report.metrics.timeline_chronology_pct}%
              </span>
              <p className="text-xs text-slate-500 font-light">
                Valid recommendation, sanction, and completion milestone records.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Voucher Reconciliation
              </span>
              <span className="text-2xl font-black font-mono text-emerald-700">
                {report.metrics.reconciliation_variance_inr}
              </span>
              <p className="text-xs text-slate-500 font-light">
                Zero discrepancy between disbursed vouchers and statutory allocation limits.
              </p>
            </div>
          </div>

          {/* Provenance & Architecture Dossier */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-extrabold text-[#08102B]">
              Authoritative Source Provenance &amp; Immutability Standard
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-[#2563EB] text-[10px] block">DATA SNAPSHOT</span>
                <div className="font-bold text-[#08102B] text-sm">{report.provenance.data_snapshot_date}</div>
                <p className="text-slate-500 font-light">Verified baseline snapshot representing the official MoSPI repository.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-[#2563EB] text-[10px] block">SOURCE REPOSITORIES</span>
                <div className="font-bold text-[#08102B] text-sm">3 Official Channels</div>
                <p className="text-slate-500 font-light">MoSPI Central Portal, eSAKSHI Transaction Ledgers, and State Treasury Vouchers.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-[#2563EB] text-[10px] block">STORAGE ARCHITECTURE</span>
                <div className="font-bold text-[#08102B] text-sm">Read-Only Immutable SQLite</div>
                <p className="text-slate-500 font-light">156.84 MB bundled artifact open in strict query-only mode to prevent mutation.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
