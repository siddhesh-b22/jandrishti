import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Users,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Calendar,
  Building2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Percent,
  FileCheck,
  PlusCircle,
  Copy,
} from 'lucide-react';
import { api } from '../api/client';
import { WorkDetail, WorkIntelligenceProfile } from '../api/types';
import { useRole } from '../context/RoleContext';
import { SeverityBadge, LifecycleBadge, CategoryBadge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const WorkDetailPage: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const { currentRole, roleConfig } = useRole();

  const [work, setWork] = useState<WorkDetail | null>(null);
  const [profile, setProfile] = useState<WorkIntelligenceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Case creation feedback
  const [caseCreated, setCaseCreated] = useState<string | null>(null);
  const [creatingCase, setCreatingCase] = useState(false);

  const loadWorkData = async () => {
    if (!workId) return;
    try {
      setLoading(true);
      setError(null);
      const [workRes, profileRes] = await Promise.all([
        api.getWorkDetail(workId),
        api.getWorkProfile(Number(workId)).catch(() => null),
      ]);
      setWork(workRes);
      setProfile(profileRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load project intelligence dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkData();
  }, [workId]);

  const handleInitiateCase = async () => {
    if (!work) return;
    try {
      setCreatingCase(true);
      const res = await api.createCase({
        entity_type: 'WORK',
        entity_id: `${work.work_id}`,
        title: `Comprehensive Review: ${work.work_description_normalized || `Work #${work.work_id}`}`,
        severity: profile?.risk_assessment.risk_level || 'HIGH',
        risk_score: profile?.risk_assessment.overall_score || 75.0,
        category: profile?.progress.mismatch_detected ? 'PROGRESS_MISMATCH' : 'PROJECT_AUDIT',
        assigned_to: 'District Collectorate / IDA',
        assigned_role: 'DISTRICT_AUTHORITY',
        user: roleConfig.shortLabel,
        role: currentRole,
        notes: `Initiated from 360° Project Dossier. ${profile?.risk_assessment.explainable_reasons.join(' ') || ''}`
      });
      setCaseCreated(res.case_id);
    } catch (err) {
      alert('Failed to register review case');
    } finally {
      setCreatingCase(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-6 w-64 shimmer-skeleton rounded-xl" />
        <div className="h-44 w-full shimmer-skeleton rounded-3xl" />
        <LoadingSkeleton rows={4} height="h-28" />
      </div>
    );
  }

  if (error || !work) {
    return <ErrorDisplay message={error || 'Work record not found'} onRetry={loadWorkData} />;
  }

  const anomalies = work.anomalies || [];

  const milestones = [
    { label: 'Recommended', date: work.recommendation_date, done: !!work.recommendation_date },
    { label: 'Sanctioned', date: work.sanction_date || (work.lifecycle_status in { SANCTIONED: 1, IN_PROGRESS: 1, COMPLETED: 1 } ? 'Approved' : null), done: !!work.sanction_date || work.lifecycle_status !== 'RECOMMENDED' },
    { label: 'Active Execution', date: work.lifecycle_status === 'IN_PROGRESS' || work.lifecycle_status === 'COMPLETED' ? 'On Ground' : null, done: work.lifecycle_status === 'IN_PROGRESS' || work.lifecycle_status === 'COMPLETED' },
    { label: 'Completed', date: work.completed_date, done: work.lifecycle_status === 'COMPLETED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in font-manrope pb-20">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Physical Works', to: '/works', icon: Layers },
          { label: work.state_normalized, to: `/works?state=${encodeURIComponent(work.state_normalized)}` },
          { label: `Work #${work.work_id}` },
        ]}
      />

      {/* 2. Main Project Dossier Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <LifecycleBadge status={work.lifecycle_status} />
              <CategoryBadge category={work.category_normalized || 'General'} />
              <ProvenanceBadge type="SOURCE-DERIVED" />
              <span className="text-xs text-slate-400 font-mono font-bold">UID: #{work.work_id}</span>
            </div>

            {profile && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">Risk Assessment:</span>
                <SeverityBadge severity={profile.risk_assessment.risk_level} />
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                  Score {profile.risk_assessment.overall_score}/100
                </span>
              </div>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-[#08102B] tracking-tight leading-snug">
            {work.work_description_normalized || 'MPLADS Physical Infrastructure Project'}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{work.state_normalized}</span>
              {work.constituency_normalized && <span>• {work.constituency_normalized}</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Representative:{' '}
                {work.mp_details?.mp_name_normalized ? (
                  <Link to={`/mps/${work.mp_details.internal_mp_id}`} className="text-[#2563EB] font-bold hover:underline">
                    {work.mp_details.mp_name_normalized}
                  </Link>
                ) : (
                  <span className="text-slate-500 font-mono">ID: {work.internal_mp_id || 'N/A'}</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Agency: <strong>{work.ida_normalized || 'District Authority'}</strong></span>
            </div>
          </div>
        </div>

        {/* Milestone Lifecycle Progress */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
            PROJECT EXECUTION LIFECYCLE
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {milestones.map((m) => (
              <div
                key={m.label}
                className={`p-4 rounded-2xl border transition ${
                  m.done ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 opacity-40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#08102B]">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${m.done ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>{m.label}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  {m.date || 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Recommended Allocation</span>
            <span className="text-xl font-black font-mono text-[#08102B] mt-1 block">
              {work.recommended_amount && work.recommended_amount > 0
                ? `₹${(work.recommended_amount / 1e5).toFixed(2)} Lakh`
                : 'Not specified'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Disbursed / Final Amount</span>
            <span className="text-xl font-black font-mono text-[#08102B] mt-1 block">
              {work.final_amount && work.final_amount > 0
                ? `₹${(work.final_amount / 1e5).toFixed(2)} Lakh`
                : 'Recorded in ledger'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Duration on Ground</span>
            <span className="text-xl font-black font-mono text-[#08102B] mt-1 block">
              {work.duration_days ? `${work.duration_days} Days` : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. 360° AI/ML INTELLIGENCE MODULES */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Physical vs Financial Progress & Delay Prediction (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Physical vs Financial Progress Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider block">
                    Core Intelligence · Progress Alignment
                  </span>
                  <h3 className="text-lg font-extrabold text-[#08102B]">
                    Physical vs. Financial Progress Analysis
                  </h3>
                </div>
                {profile.progress.mismatch_detected ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-mono font-bold border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Mismatch Flagged
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Balanced Outflow
                  </span>
                )}
              </div>

              {/* Progress Dual Gauge Bars */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Financial Fund Utilization:</span>
                    <span className="font-mono font-bold text-[#08102B]">{profile.progress.financial_pct}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, profile.progress.financial_pct)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Physical Ground Delivery:</span>
                    <span className="font-mono font-bold text-[#08102B]">{profile.progress.physical_pct}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, profile.progress.physical_pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-light leading-relaxed pt-1">
                {profile.progress.mismatch_detected
                  ? `Financial expenditure leads physical milestone completion by ${profile.progress.divergence_index} percentage points. Recommended to withhold subsequent tranche releases pending on-site physical certification.`
                  : `Financial disbursement is in healthy alignment with current ground milestone execution.`}
              </p>
            </div>

            {/* Delay Prediction & Early Warning */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider block">
                    Predictive Analytics
                  </span>
                  <h3 className="text-lg font-extrabold text-[#08102B]">
                    Delay Prediction &amp; Timeline Forecast
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  profile.delay_prediction.status === 'CRITICALLY_DELAYED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : profile.delay_prediction.status === 'SCHEDULE_RISK'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {profile.delay_prediction.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Delay Probability</span>
                  <span className="text-xl font-black font-mono text-[#08102B]">
                    {Math.round(profile.delay_prediction.probability * 100)}%
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Category Benchmark</span>
                  <span className="text-xl font-black font-mono text-[#08102B]">
                    {profile.delay_prediction.category_median_days} Days
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Schedule Ratio</span>
                  <span className="text-xl font-black font-mono text-[#08102B]">
                    {profile.delay_prediction.schedule_deviation}x
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Automated Compliance Checklist & Multi-Factor Risk (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Automated Compliance Scorecard */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider block">
                    Governance Audit
                  </span>
                  <h3 className="text-base font-extrabold text-[#08102B]">
                    Compliance Scorecard
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-[#08102B]">
                    {profile.compliance.score}/100
                  </span>
                  <span className={`block text-[10px] font-bold ${
                    profile.compliance.status === 'COMPLIANT' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {profile.compliance.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {profile.compliance.checks.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    {c.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-[#08102B]">{c.name}</div>
                      <div className="text-[11px] text-slate-500 font-light mt-0.5">{c.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainable AI Risk Assessment */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                  Explainable Risk Factors
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">Multi-Factor Weighting</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Timeline &amp; Schedule Risk:</span>
                  <strong className="font-mono">{profile.risk_assessment.factors.timeline_risk}/100</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Progress Mismatch Risk:</span>
                  <strong className="font-mono">{profile.risk_assessment.factors.mismatch_risk}/100</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Cost Deviation Risk:</span>
                  <strong className="font-mono">{profile.risk_assessment.factors.cost_deviation_risk}/100</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Compliance Gap Risk:</span>
                  <strong className="font-mono">{profile.risk_assessment.factors.compliance_gap_risk}/100</strong>
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="pt-2 border-t border-slate-100">
                {caseCreated ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Review Case Registered: <strong>{caseCreated}</strong></span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={creatingCase}
                    onClick={handleInitiateCase}
                    className="w-full py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{creatingCase ? 'Registering...' : 'Initiate Administrative Review Case'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Flagged Statistical Anomalies */}
      {anomalies.length > 0 && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-extrabold text-rose-950">
                Flagged Statistical Signals ({anomalies.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-rose-700">MAD Empirical Outliers</span>
          </div>

          <div className="space-y-3">
            {anomalies.map((a) => (
              <div key={a.anomaly_id} className="p-4 rounded-2xl bg-white border border-rose-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#08102B]">{a.anomaly_type.replace(/_/g, ' ')}</span>
                  <SeverityBadge severity={a.severity} />
                </div>
                <p className="text-xs text-slate-600 font-light">{a.reason}</p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Method: {a.detection_method} · Score: {(a.anomaly_score * 100).toFixed(1)}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
