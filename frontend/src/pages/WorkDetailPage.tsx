import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  CheckCircle2,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { api } from '../api/client';
import { WorkDetail } from '../api/types';
import { SeverityBadge, LifecycleBadge, CategoryBadge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const WorkDetailPage: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const [work, setWork] = useState<WorkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWork = async () => {
    if (!workId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWorkDetail(workId);
      setWork(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load work details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWork();
  }, [workId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-6 w-64 shimmer-skeleton rounded-xl" />
        <div className="h-40 w-full shimmer-skeleton rounded-2xl" />
        <LoadingSkeleton rows={4} height="h-28" />
      </div>
    );
  }

  if (error || !work) {
    return <ErrorDisplay message={error || 'Work record not found'} onRetry={loadWork} />;
  }

  const anomalies = work.anomalies || [];

  const milestones = [
    { label: 'Recommended', date: work.recommendation_date, done: !!work.recommendation_date },
    { label: 'Sanctioned', date: work.sanction_date, done: !!work.sanction_date },
    { label: 'In Progress', date: work.lifecycle_status === 'IN_PROGRESS' || work.lifecycle_status === 'COMPLETED' ? 'Active Execution' : null, done: work.lifecycle_status === 'IN_PROGRESS' || work.lifecycle_status === 'COMPLETED' },
    { label: 'Completed', date: work.completed_date, done: work.lifecycle_status === 'COMPLETED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in text-[#0F172A] font-sans pb-20">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Physical Works', to: '/works', icon: Layers },
          { label: work.state_normalized, to: `/works?state=${encodeURIComponent(work.state_normalized)}` },
          { label: `Work #${work.work_id}` },
        ]}
      />

      {/* 2. Main Project Dossier Header */}
      <div className="rounded-3xl border border-warm-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-3 border-b border-warm-border pb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <LifecycleBadge status={work.lifecycle_status} />
            <CategoryBadge category={work.category_normalized || 'General'} />
            <ProvenanceBadge type="SOURCE-DERIVED" />
            <span className="text-xs text-slate-400 font-mono font-bold">UID: #{work.work_id}</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-navy-950 tracking-tight leading-snug font-display">
            {work.work_description_normalized || 'MPLADS Physical Infrastructure Project'}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-saffron-500" />
              <span>{work.state_normalized}</span>
              {work.constituency_normalized && <span>• {work.constituency_normalized}</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Representative:{' '}
                {work.mp_details?.mp_name_normalized ? (
                  <Link to={`/mps/${work.mp_details.internal_mp_id}`} className="text-brand-600 font-bold hover:underline">
                    {work.mp_details.mp_name_normalized}
                  </Link>
                ) : (
                  <span className="text-slate-500 font-mono">ID: {work.internal_mp_id || 'N/A'}</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            PROJECT EXECUTION LIFECYCLE
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {milestones.map((m) => (
              <div
                key={m.label}
                className={`p-4 rounded-2xl border transition ${
                  m.done ? 'bg-warm-canvas border-warm-border' : 'bg-white border-warm-border/50 opacity-40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${m.done ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>{m.label}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  {m.date || 'Not recorded'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Sanctioned Amount</span>
            <span className="text-xl font-black font-mono text-navy-950 mt-1 block">
              {work.sanctioned_amount !== null && work.sanctioned_amount !== undefined && work.sanctioned_amount > 0
                ? `₹${(work.sanctioned_amount / 1e5).toFixed(2)} Lakh`
                : 'Not recorded in source'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Recommended Amount</span>
            <span className="text-xl font-black font-mono text-navy-950 mt-1 block">
              {work.recommended_amount !== null && work.recommended_amount !== undefined && work.recommended_amount > 0
                ? `₹${(work.recommended_amount / 1e5).toFixed(2)} Lakh`
                : 'Not recorded in source'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Implementing Agency (IDA)</span>
            <span className="text-xs font-bold text-navy-950 mt-1 block truncate">
              {work.ida_normalized || 'District Implementing Authority'}
            </span>
          </div>
        </div>

        {/* Statistical Signals */}
        {anomalies.length > 0 && (
          <div className="p-4 rounded-2xl border border-coral-200 bg-coral-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-coral-600" />
              <h3 className="text-xs font-bold text-coral-900 uppercase font-mono tracking-wider">
                Flagged Analytical Signals ({anomalies.length})
              </h3>
            </div>
            <div className="space-y-2">
              {anomalies.map((a) => (
                <div key={a.anomaly_id} className="p-3 rounded-xl bg-white border border-coral-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-navy-950">{a.anomaly_type}</span>
                    <SeverityBadge severity={a.severity} />
                  </div>
                  <p className="text-xs text-slate-600">{a.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
