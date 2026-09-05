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
  ChevronDown,
  ChevronUp,
  Receipt,
  IndianRupee,
  Compass,
  FileText,
  ExternalLink,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import { WorkDetail, WorkIntelligenceProfile, WorkRiskSummary } from '../api/types';
import { useRole } from '../context/RoleContext';
import { formatIndianCurrency, formatIndianNumber } from '../utils/formatters';
import { SeverityBadge, LifecycleBadge, CategoryBadge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const WorkDetailPage: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const { currentRole, roleConfig, canEdit } = useRole();

  const [work, setWork] = useState<WorkDetail | null>(null);
  const [profile, setProfile] = useState<WorkIntelligenceProfile | null>(null);
  const [riskSummary, setRiskSummary] = useState<WorkRiskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Case creation feedback
  const [caseCreated, setCaseCreated] = useState<string | null>(null);
  const [creatingCase, setCreatingCase] = useState(false);
  const [showAdvancedTechnical, setShowAdvancedTechnical] = useState(false);

  const loadWorkData = async () => {
    if (!workId) return;
    try {
      setLoading(true);
      setError(null);
      const [workRes, profileRes, riskRes] = await Promise.all([
        api.getWorkDetail(workId),
        api.getWorkProfile(Number(workId)).catch(() => null),
        api.getWorkRiskSummary(workId).catch(() => null),
      ]);
      setWork(workRes);
      setProfile(profileRes);
      setRiskSummary(riskRes);
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

  // Citizen Social Audit state
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [citizenStatus, setCitizenStatus] = useState('IN_PROGRESS');
  const [hasBoard, setHasBoard] = useState('YES');
  const [citizenNotes, setCitizenNotes] = useState('');
  const [submittingCitizenAudit, setSubmittingCitizenAudit] = useState(false);
  const [citizenAuditSuccess, setCitizenAuditSuccess] = useState<string | null>(null);

  const handleCitizenAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!work) return;
    try {
      setSubmittingCitizenAudit(true);
      const res = await api.createCase({
        entity_type: 'WORK',
        entity_id: `${work.work_id}`,
        title: `Citizen Social Audit: ${work.work_description_normalized || `Work #${work.work_id}`}`,
        severity: citizenStatus === 'CANNOT_LOCATE' ? 'HIGH' : 'MEDIUM',
        risk_score: citizenStatus === 'CANNOT_LOCATE' ? 85.0 : 45.0,
        category: 'SOCIAL_AUDIT',
        assigned_to: 'District Collectorate / Social Audit Cell',
        assigned_role: 'DISTRICT_AUTHORITY',
        user: 'Citizen Social Auditor',
        role: 'CITIZEN',
        notes: `Physical Status: ${citizenStatus} | Display Board Present: ${hasBoard} | Observations: ${citizenNotes || 'Ground inspection verified by local resident under RTI §4(1)(b).'}`
      });
      setCitizenAuditSuccess(res.case_id);
      setShowCitizenModal(false);
    } catch (err) {
      alert('Failed to submit social audit observation');
    } finally {
      setSubmittingCitizenAudit(false);
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
  const relatedTransactions = work.related_transactions || [];
  const sanctionedAmt = work.sanctioned_amount || work.recommended_amount || work.final_amount || 0;

  const milestones = [
    { label: 'Recommended', date: work.recommendation_date, done: !!work.recommendation_date },
    { label: 'Sanctioned', date: work.sanction_date || (work.lifecycle_status in { SANCTIONED: 1, IN_PROGRESS: 1, COMPLETED: 1 } ? 'Approved' : null), done: !!work.sanction_date || work.lifecycle_status !== 'RECOMMENDED' },
    { label: 'Active Execution', date: work.lifecycle_status === 'IN_PROGRESS' || work.lifecycle_status === 'COMPLETED' ? 'On Ground' : null, done: work.lifecycle_status === 'IN_PROGRESS' || work.lifecycle_status === 'COMPLETED' },
    { label: 'Completed', date: work.completed_date, done: work.lifecycle_status === 'COMPLETED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans text-[#121316] pb-20">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Physical Works', to: '/works', icon: Layers },
          { label: work.state_normalized, to: `/works?state=${encodeURIComponent(work.state_normalized)}` },
          { label: `Work #${work.work_id}` },
        ]}
      />

      {/* 2. Main Project Dossier Header */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-4 border-b border-[#E4E2DC] pb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="cw-badge-section">
                FILE NO. WRK-{work.work_id} · PHYSICAL INFRASTRUCTURE
              </span>
              <LifecycleBadge status={work.lifecycle_status} />
              <CategoryBadge category={work.category_normalized || 'General'} />
              <ProvenanceBadge type="SOURCE-DERIVED" />
            </div>

            {profile && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#71717A]">Risk Assessment:</span>
                <SeverityBadge severity={profile.risk_assessment.risk_level} />
                <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] text-xs font-mono font-bold border border-[#E4E2DC]">
                  Score {profile.risk_assessment.overall_score}/100
                </span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#121316] tracking-tight leading-snug">
            {work.work_description_normalized || 'MPLADS Physical Infrastructure Project'}
          </h1>

          <div className="flex items-center gap-4 text-xs text-[#71717A] flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold text-[#121316]">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{work.state_normalized}</span>
              {work.constituency_normalized && <span>• {work.constituency_normalized}</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#71717A]" />
              <span>
                Representative:{' '}
                {work.mp_details?.mp_name_normalized ? (
                  <Link to={`/mps/${work.mp_details.internal_mp_id}`} className="text-[#C85A32] font-semibold hover:underline">
                    {work.mp_details.mp_name_normalized}
                  </Link>
                ) : (
                  <span className="text-[#71717A] font-mono">ID: {work.internal_mp_id || 'N/A'}</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Agency: <strong className="text-[#121316]">{work.ida_normalized || 'District Authority'}</strong></span>
            </div>
          </div>

          {/* Statutory Action Bar */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {canEdit() ? (
              <button
                type="button"
                onClick={handleInitiateCase}
                disabled={creatingCase || !!caseCreated}
                className="cw-btn-primary text-xs flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>
                  {creatingCase
                    ? 'Docketing Review Case...'
                    : caseCreated
                    ? `Case #${caseCreated} Docketed`
                    : 'Initiate Statutory Review Case'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowCitizenModal(true)}
                className="cw-btn-secondary text-xs flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Submit Ground Social Audit Observation</span>
              </button>
            )}
          </div>

          {caseCreated && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Statutory administrative case <strong>#{caseCreated}</strong> has been registered on the district review docket.</span>
              </div>
              <Link to="/cases" className="font-semibold underline hover:text-emerald-950 shrink-0">
                View in Cases &amp; Alerts &rarr;
              </Link>
            </div>
          )}

          {citizenAuditSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Citizen Social Audit observation <strong>#{citizenAuditSuccess}</strong> logged with District Authority under RTI &sect;4(1)(b).</span>
              </div>
              <Link to="/cases" className="font-semibold underline hover:text-emerald-950 shrink-0">
                Inspect Public Docket &rarr;
              </Link>
            </div>
          )}

          {/* Plain-Language 4-Question Audit Explanation */}
          {profile && (profile.progress.mismatch_detected || profile.risk_assessment.risk_level !== 'LOW') && (
            <div className="mt-4 p-5 rounded-2xl bg-[#FAF0EB] border border-[#E8C5B6] space-y-3">
              <div className="flex items-center gap-2 text-[#C85A32]">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  Four-Question Government Audit Finding
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-[#E8C5B6] space-y-1">
                  <strong className="block text-[10px] font-mono uppercase text-[#C85A32]">
                    1. What happened?
                  </strong>
                  <p className="text-[#4A4D53] leading-relaxed font-light">
                    {profile.progress.mismatch_detected
                      ? `Fund expenditure leads physical delivery by ${profile.progress.divergence_index} percentage points.`
                      : profile.delay_prediction.status === 'CRITICALLY_DELAYED'
                      ? `Project execution is running ${profile.delay_prediction.schedule_deviation}x past the category benchmark.`
                      : 'Multi-factor statutory risk score is elevated for this public scheme.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E8C5B6] space-y-1">
                  <strong className="block text-[10px] font-mono uppercase text-amber-800">
                    2. Why was it flagged?
                  </strong>
                  <p className="text-[#4A4D53] leading-relaxed font-light">
                    {profile.risk_assessment.explainable_reasons[0] || 'Statistical divergence exceeds category baseline (MAD Robust Z-Score > 2.5).'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E8C5B6] space-y-1">
                  <strong className="block text-[10px] font-mono uppercase text-[#121316]">
                    3. What should be reviewed?
                  </strong>
                  <p className="text-[#4A4D53] leading-relaxed font-light">
                    Issue inquiry to {work.ida_normalized || 'the Implementing District Authority'} and inspect on-site geo-tagged asset photographs.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E8C5B6] space-y-1">
                  <strong className="block text-[10px] font-mono uppercase text-[#2E7D32]">
                    4. How was it detected?
                  </strong>
                  <p className="text-[#4A4D53] leading-relaxed font-light">
                    Automated deterministic comparison against MPLADS Guidelines 2023 &amp; Robust MAD scoring.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Milestone Lifecycle Progress */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-widest block">
            PROJECT EXECUTION LIFECYCLE
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {milestones.map((m) => (
              <div
                key={m.label}
                className={`p-4 rounded-2xl border transition ${
                  m.done ? 'bg-[#FAF8F5] border-[#E4E2DC]' : 'bg-white border-[#E4E2DC]/60 opacity-40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#121316]">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${m.done ? 'text-[#2E7D32]' : 'text-slate-300'}`} />
                  <span>{m.label}</span>
                </div>
                <div className="text-[11px] font-mono text-[#71717A] mt-1">
                  {m.date || 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Highlights (Bento Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-[#FAF0EB] border border-[#E8C5B6] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#C85A32]">/ 01</span>
              <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase">Sanctioned</span>
            </div>
            <span className="text-2xl font-serif font-bold text-[#121316] block">
              {sanctionedAmt > 0 ? formatIndianCurrency(sanctionedAmt) : '₹0.00'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#71717A]">/ 02</span>
              <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase">Recommended</span>
            </div>
            <span className="text-2xl font-serif font-bold text-[#121316] block">
              {work.recommended_amount && work.recommended_amount > 0
                ? formatIndianCurrency(work.recommended_amount)
                : 'Not specified'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#71717A]">/ 03</span>
              <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase">Disbursed</span>
            </div>
            <span className="text-2xl font-serif font-bold text-[#121316] block">
              {work.final_amount && work.final_amount > 0
                ? formatIndianCurrency(work.final_amount)
                : 'Ledger baseline'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#71717A]">/ 04</span>
              <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase">Duration</span>
            </div>
            <span className="text-2xl font-serif font-bold text-[#121316] block">
              {work.duration_days ? `${work.duration_days} Days` : 'In Execution'}
            </span>
          </div>
        </div>
      </div>

      {/* 2.5 AGGREGATED WORK RISK SYNTHESIS (Work Requires Attention Standard) */}
      {riskSummary && (
        <div className={`rounded-2xl p-6 sm:p-8 border shadow-xs space-y-4 ${
          riskSummary.overall_risk_level === 'CRITICAL'
            ? 'bg-[#FAF0EB] border-[#E8C5B6]'
            : riskSummary.overall_risk_level === 'HIGH'
            ? 'bg-amber-50/50 border-amber-200'
            : 'bg-emerald-50/30 border-emerald-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E2DC] pb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                riskSummary.overall_risk_level === 'CRITICAL' ? 'bg-[#C85A32]' :
                riskSummary.overall_risk_level === 'HIGH' ? 'bg-amber-500' : 'bg-[#2E7D32]'
              }`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    riskSummary.overall_risk_level === 'CRITICAL'
                      ? 'bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]'
                      : riskSummary.overall_risk_level === 'HIGH'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {riskSummary.requires_attention ? 'Work Requires Attention' : 'Normal Operation'}
                  </span>
                  <span className="font-mono text-xs text-[#71717A]">
                    Risk Score: <strong className="text-[#121316]">{riskSummary.risk_score}</strong> / 100
                  </span>
                </div>
                <h3 className="text-xl font-serif text-[#121316] mt-0.5">
                  Aggregated Project Risk Synthesis
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#71717A]">
                {riskSummary.contributing_signals.length} Signals • {riskSummary.change_events.length} Change Deltas
              </span>
            </div>
          </div>

          <p className="text-sm font-light text-[#4A4D53] leading-relaxed">
            {riskSummary.headline_finding}
          </p>

          {/* Statutory Citations & Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-1.5">
              <span className="font-mono font-bold text-[#71717A] text-[10px] uppercase block">
                Statutory Citations &amp; Norms
              </span>
              <ul className="space-y-1">
                {riskSummary.statutory_citations.map((cit, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-[#4A4D53]">
                    <span className="text-[#C85A32] font-bold">•</span> {cit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-1.5">
              <span className="font-mono font-bold text-[#71717A] text-[10px] uppercase block">
                Recommended Actionable Protocol
              </span>
              <p className="text-[#4A4D53] font-light leading-relaxed">
                {riskSummary.recommended_action}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADMINISTRATIVE & LOCATION INTELLIGENCE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Geographic Hierarchy */}
        <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#C85A32]">
            <Compass className="w-4 h-4" />
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[#121316]">
              Administrative Location
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#E4E2DC]">
              <span className="text-[#71717A]">State / UT:</span>
              <strong className="text-[#121316]">{work.state_normalized}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E4E2DC]">
              <span className="text-[#71717A]">Constituency:</span>
              <strong className="text-[#121316]">{work.constituency_normalized || 'State Representation'}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E4E2DC]">
              <span className="text-[#71717A]">Block / Tehsil:</span>
              <span className="font-mono text-[#121316]">{work.block || 'Constituency Central'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E4E2DC]">
              <span className="text-[#71717A]">Gram Panchayat:</span>
              <span className="font-mono text-[#121316]">{work.gram_panchayat || 'Designated Ward'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#71717A]">Village / Locality:</span>
              <span className="font-mono text-[#121316]">{work.village || 'Site Locality'}</span>
            </div>
          </div>
        </div>

        {/* Implementing Agency & Contractor */}
        <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#C85A32]">
            <Building2 className="w-4 h-4" />
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[#121316]">
              Agency &amp; Contractor
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="space-y-1 py-1.5 border-b border-[#E4E2DC]">
              <span className="text-[#71717A] block">Implementing Agency (IDA):</span>
              <strong className="text-[#121316] leading-snug block">{work.ida_normalized}</strong>
              {work.implementing_agency_details && (
                <span className="text-[10px] text-[#71717A] font-mono block">
                  IDA Disbursed: ₹{((work.implementing_agency_details.total_expenditure || 0) / 1e7).toFixed(2)} Cr
                </span>
              )}
            </div>

            <div className="space-y-1 py-1.5">
              <span className="text-[#71717A] block">Assigned Contractor / Vendor:</span>
              <div className="flex items-center justify-between">
                <strong className="text-[#121316] font-mono">
                  {work.work_contractor || 'Recorded in Line-Item Vouchers'}
                </strong>
                {work.work_contractor && (
                  <Link
                    to={`/vendors?search=${encodeURIComponent(work.work_contractor)}`}
                    className="text-xs font-semibold text-[#C85A32] hover:underline flex items-center gap-1"
                  >
                    <span>Vendor</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Provenance & Reconciliation Metadata */}
        <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#2E7D32]">
            <FileText className="w-4 h-4" />
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[#121316]">
              Provenance &amp; Audit Trail
            </h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-[#E4E2DC]">
              <span className="text-[#71717A]">Matching Method:</span>
              <strong className="text-[#121316]">{work.match_method}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E4E2DC]">
              <span className="text-[#71717A]">Matching Confidence:</span>
              <strong className="text-[#2E7D32]">{(work.match_confidence * 100).toFixed(0)}%</strong>
            </div>
            <div className="space-y-1 py-1.5">
              <span className="text-[#71717A] block">Source File:</span>
              <span className="text-[11px] text-[#4A4D53] break-all">{work.source_files}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LINKED FINANCIAL DISBURSEMENT VOUCHERS */}
      {relatedTransactions.length > 0 && (
        <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#C85A32]" />
              <h3 className="text-xl font-serif text-[#121316]">
                Linked Line-Item Disbursement Vouchers ({relatedTransactions.length})
              </h3>
            </div>
            <Link
              to={`/transactions?mp_id=${encodeURIComponent(work.internal_mp_id || '')}`}
              className="text-xs font-semibold text-[#C85A32] hover:underline flex items-center gap-1 font-mono"
            >
              <span>Explore All Vouchers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0EFEA] border-b border-[#E4E2DC] text-[#71717A] uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Voucher ID</th>
                  <th className="py-2.5 px-3 font-bold">Contractor / Vendor</th>
                  <th className="py-2.5 px-3 font-bold">Activity Description</th>
                  <th className="py-2.5 px-3 font-bold text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC]">
                {relatedTransactions.map((tx) => (
                  <tr key={tx.internal_transaction_id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#C85A32]">
                      {tx.internal_transaction_id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#121316]">
                      <Link
                        to={`/vendors/${tx.internal_vendor_id}`}
                        className="hover:text-[#C85A32] hover:underline"
                      >
                        {tx.vendor_name_normalized}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-[#4A4D53] max-w-xs truncate font-light">
                      {tx.activity_description_normalized}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#121316] text-right">
                      ₹{tx.expenditure_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        tx.payment_status === 'Payment Success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {tx.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. 360° AI/ML INTELLIGENCE MODULES */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Physical vs Financial Progress & Delay Prediction (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Physical vs Financial Progress Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider block">
                    Core Intelligence · Progress Alignment
                  </span>
                  <h3 className="text-xl font-serif text-[#121316]">
                    Physical vs. Financial Progress Analysis
                  </h3>
                </div>
                {profile.progress.mismatch_detected ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-xs font-mono font-bold border border-[#E8C5B6] flex items-center gap-1">
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
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#121316]">Financial Fund Utilization:</span>
                    <span className="font-mono font-bold text-[#C85A32]">{profile.progress.financial_pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F0EFEA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C85A32] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, profile.progress.financial_pct)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#121316]">Physical Ground Delivery:</span>
                    <span className="font-mono font-bold text-[#2E7D32]">{profile.progress.physical_pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F0EFEA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2E7D32] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, profile.progress.physical_pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#71717A] font-light leading-relaxed pt-1">
                {profile.progress.mismatch_detected
                  ? `Financial expenditure leads physical milestone completion by ${profile.progress.divergence_index} percentage points. Recommended to withhold subsequent tranche releases pending on-site physical certification.`
                  : `Financial disbursement is in healthy alignment with current ground milestone execution.`}
              </p>
            </div>

            {/* Delay Prediction & Early Warning */}
            <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider block">
                    Predictive Analytics
                  </span>
                  <h3 className="text-xl font-serif text-[#121316]">
                    Delay Prediction &amp; Timeline Forecast
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  profile.delay_prediction.status === 'CRITICALLY_DELAYED'
                    ? 'bg-[#FAF0EB] text-[#C85A32] border-[#E8C5B6]'
                    : profile.delay_prediction.status === 'SCHEDULE_RISK'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {profile.delay_prediction.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase block">Delay Probability</span>
                  <span className="text-2xl font-serif font-bold text-[#121316]">
                    {Math.round(profile.delay_prediction.probability * 100)}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase block">Category Benchmark</span>
                  <span className="text-2xl font-serif font-bold text-[#121316]">
                    {profile.delay_prediction.category_median_days} Days
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase block">Schedule Ratio</span>
                  <span className="text-2xl font-serif font-bold text-[#121316]">
                    {profile.delay_prediction.schedule_deviation}x
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Automated Compliance Checklist & Multi-Factor Risk (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Automated Compliance Scorecard */}
            <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider block">
                    Governance Audit
                  </span>
                  <h3 className="text-lg font-serif text-[#121316]">
                    Compliance Scorecard
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-serif font-bold text-[#121316]">
                    {profile.compliance.score}/100
                  </span>
                  <span className={`block text-[10px] font-mono font-bold ${
                    profile.compliance.status === 'COMPLIANT' ? 'text-[#2E7D32]' : 'text-amber-700'
                  }`}>
                    {profile.compliance.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {profile.compliance.checks.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] flex items-start gap-2.5">
                    {c.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-[#121316]">{c.name}</div>
                      <div className="text-[11px] text-[#71717A] font-light mt-0.5">{c.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainable AI Risk Assessment */}
            <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider">
                  Explainable Risk Factors
                </span>
                <span className="text-xs font-mono text-[#71717A]">Multi-Factor Weighting</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Timeline &amp; Schedule Risk:</span>
                  <strong className="font-mono text-[#121316]">{profile.risk_assessment.factors.timeline_risk}/100</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Progress Mismatch Risk:</span>
                  <strong className="font-mono text-[#121316]">{profile.risk_assessment.factors.mismatch_risk}/100</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Cost Deviation Risk:</span>
                  <strong className="font-mono text-[#121316]">{profile.risk_assessment.factors.cost_deviation_risk}/100</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Compliance Gap Risk:</span>
                  <strong className="font-mono text-[#121316]">{profile.risk_assessment.factors.compliance_gap_risk}/100</strong>
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="pt-2 border-t border-[#E4E2DC]">
                {caseCreated ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Review Case Registered: <strong>{caseCreated}</strong></span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={creatingCase}
                    onClick={handleInitiateCase}
                    className="w-full cw-btn-primary py-3 text-xs font-semibold justify-center min-h-[44px]"
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

      {/* Progressive Disclosure: Advanced Technical Details for Analysts */}
      {profile && (
        <div className="rounded-2xl border border-[#E4E2DC] bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <button
            type="button"
            aria-expanded={showAdvancedTechnical}
            onClick={() => setShowAdvancedTechnical(!showAdvancedTechnical)}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider block">
                Progressive Disclosure · Technical Deep-Dive
              </span>
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#121316] group-hover:text-[#C85A32] transition-colors">
                Show Advanced Technical Calculations &amp; Model Parameters
              </h3>
            </div>
            <div className="p-2 rounded-full bg-[#F0EFEA] group-hover:bg-[#FAF0EB] text-[#71717A] group-hover:text-[#C85A32] transition">
              {showAdvancedTechnical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showAdvancedTechnical && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-[#E4E2DC] text-xs text-[#4A4D53]"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                  <span className="font-mono font-bold text-[#71717A] text-[10px] uppercase block">Divergence Index Formula</span>
                  <p className="font-mono text-[#121316] text-sm">Index = Fin% - Phys%</p>
                  <p className="text-[11px] text-[#71717A] font-light leading-relaxed">
                    Observed: {profile.progress.financial_pct}% - {profile.progress.physical_pct}% = <strong>{profile.progress.divergence_index} pts</strong> (Trigger threshold: &ge; 30 pts).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                  <span className="font-mono font-bold text-[#71717A] text-[10px] uppercase block">Delay Probability Function</span>
                  <p className="font-mono text-[#121316] text-sm">P = 1 / (1 + e^-k(ratio - 1))</p>
                  <p className="text-[11px] text-[#71717A] font-light leading-relaxed">
                    Schedule Ratio: <strong>{profile.delay_prediction.schedule_deviation}x</strong> vs. category median of {profile.delay_prediction.category_median_days} days.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1.5">
                  <span className="font-mono font-bold text-[#71717A] text-[10px] uppercase block">5-Point Compliance Matrix</span>
                  <p className="font-mono text-[#121316] text-sm">Score: {profile.compliance.score} / 100</p>
                  <p className="text-[11px] text-[#71717A] font-light leading-relaxed">
                    5 statutory governance checks weighted at 20 points each. Status: <strong>{profile.compliance.status}</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 6. Flagged Statistical Anomalies */}
      {anomalies.length > 0 && (
        <div className="rounded-2xl border border-[#E8C5B6] bg-[#FAF0EB]/40 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#C85A32]" />
              <h3 className="text-xl font-serif text-[#121316]">
                Flagged Statistical Signals ({anomalies.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-[#C85A32] font-semibold">MAD Empirical Outliers</span>
          </div>

          <div className="space-y-3">
            {anomalies.map((a) => (
              <div key={a.anomaly_id} className="p-4 rounded-xl bg-white border border-[#E8C5B6] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#121316]">{a.anomaly_type.replace(/_/g, ' ')}</span>
                  <SeverityBadge severity={a.severity} />
                </div>
                <p className="text-xs text-[#4A4D53] font-light leading-relaxed">{a.reason}</p>
                <div className="text-[11px] font-mono text-[#71717A] pt-1">
                  Method: {a.detection_method} · Score: {(a.anomaly_score * 100).toFixed(1)}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Citizen Social Audit Observation Modal */}
      <AnimatePresence>
        {showCitizenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#E4E2DC] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C85A32]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CITIZEN SOCIAL AUDIT · RTI §4(1)(b)</span>
                  </div>
                  <h3 className="text-xl font-serif text-[#121316]">
                    Submit Ground Observation
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCitizenModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#F0EFEA] text-[#71717A] transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCitizenAuditSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#121316]">
                    Observed Physical Progress On Ground
                  </label>
                  <select
                    value={citizenStatus}
                    onChange={(e) => setCitizenStatus(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl px-3 py-2.5 text-xs font-medium text-[#121316] focus:outline-none focus:border-[#121316]"
                  >
                    <option value="IN_PROGRESS">In Progress (Active Work Underway)</option>
                    <option value="COMPLETED">Completed (Asset Delivered and In Use)</option>
                    <option value="NOT_STARTED">Not Started (No Physical Activity Seen)</option>
                    <option value="CANNOT_LOCATE">Discrepancy / Cannot Locate Asset On Site</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#121316]">
                    Statutory MPLADS Project Board Present?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="board"
                        value="YES"
                        checked={hasBoard === 'YES'}
                        onChange={() => setHasBoard('YES')}
                        className="text-[#C85A32]"
                      />
                      <span>Yes, Board Displayed</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="board"
                        value="NO"
                        checked={hasBoard === 'NO'}
                        onChange={() => setHasBoard('NO')}
                        className="text-[#C85A32]"
                      />
                      <span>No Board Visible</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#121316]">
                    Field Observation Notes &amp; Geo-tag Remarks
                  </label>
                  <textarea
                    rows={4}
                    value={citizenNotes}
                    onChange={(e) => setCitizenNotes(e.target.value)}
                    placeholder="Describe the physical status, quality, signage, or any discrepancies between sanctioned scope and actual site condition..."
                    className="w-full bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl p-3 text-xs text-[#121316] placeholder:text-[#71717A] focus:outline-none focus:border-[#121316]"
                  />
                  <span className="text-[10px] text-[#71717A]">
                    Observations are logged into the public district social audit ledger under RTI proactive disclosure.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4E2DC]">
                  <button
                    type="button"
                    onClick={() => setShowCitizenModal(false)}
                    className="cw-btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCitizenAudit}
                    className="cw-btn-primary text-xs flex items-center gap-2"
                  >
                    {submittingCitizenAudit ? 'Logging Observation...' : 'Submit to District Ledger'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
