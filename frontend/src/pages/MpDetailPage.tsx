import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  TrendingUp,
  Receipt,
  Layers,
  Building2,
  ShieldAlert,
  Info,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Activity,
  Scale,
  Mail,
  Phone,
  Briefcase,
  User,
  Home,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../api/client';
import {
  MPDetail,
  Work,
  Transaction,
  EntityMediaItem,
  EntityProfile,
  EntityTimelineResponse,
} from '../api/types';
import { SeverityBadge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const MpDetailPage: React.FC = () => {
  const { mpId } = useParams<{ mpId: string }>();

  const [mp, setMp] = useState<MPDetail | null>(null);
  const [profile, setProfile] = useState<EntityProfile | null>(null);
  const [timeline, setTimeline] = useState<EntityTimelineResponse | null>(null);
  const [media, setMedia] = useState<EntityMediaItem | null>(null);
  const [imgError, setImgError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WORKS' | 'TRANSACTIONS' | 'VENDORS' | 'SIGNALS'>('OVERVIEW');
  const [works, setWorks] = useState<Work[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const loadMp = async () => {
    if (!mpId) return;
    try {
      setLoading(true);
      setError(null);
      const [mpRes, profileRes, timelineRes, mediaRes] = await Promise.all([
        api.getMpDetail(mpId),
        api.getEntityProfile('MP', mpId).catch(() => null),
        api.getMpTimeline(mpId).catch(() => null),
        api.getEntityMedia('MP', mpId).catch(() => null),
      ]);

      setMp(mpRes);
      setProfile(profileRes);
      setTimeline(timelineRes);
      if (mediaRes && mediaRes.items.length > 0) {
        setMedia(mediaRes.items[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load parliamentary representative dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMp();
  }, [mpId]);

  // Lazy load sub-lists when switching tabs
  useEffect(() => {
    if (!mpId || !mp) return;
    if (activeTab === 'WORKS' && works.length === 0) {
      setTabLoading(true);
      api.getWorks({ mp_id: mp.internal_mp_id, limit: 50 })
        .then((res) => setWorks(res.items))
        .catch(() => {})
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'TRANSACTIONS' && transactions.length === 0) {
      setTabLoading(true);
      api.getTransactions({ search: mp.mp_name_normalized, limit: 50 })
        .then((res) => setTransactions(res.items))
        .catch(() => {})
        .finally(() => setTabLoading(false));
    }
  }, [activeTab, mpId, mp]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 py-8 font-manrope">
        <div className="h-6 w-64 shimmer-skeleton rounded-xl" />
        <div className="h-36 w-full shimmer-skeleton rounded-3xl" />
        <LoadingSkeleton rows={4} height="h-28" />
      </div>
    );
  }

  if (error || !mp) {
    return <ErrorDisplay message={error || 'MP profile not found'} onRetry={loadMp} />;
  }

  const isLs = mp.house === 'LOK_SABHA' || mp.house === 'Lok Sabha' || mp.house === '18th Lok Sabha';
  const allocCr = (mp.allocated_amount / 1e7).toFixed(2);
  const expCr = (mp.total_expenditure / 1e7).toFixed(2);
  const unspentCr = (mp.unspent_amount / 1e7).toFixed(2);
  const utilPct = mp.utilization_pct || 0;

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || 'M').toUpperCase();
  };

  const topVendors = mp.top_vendors || [];
  const anomalies = mp.anomalies || [];
  const photoSrc = mp.photo_url || media?.source_url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#121316] font-sans pb-20">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Parliament', to: '/mps', icon: Users },
          { label: mp.mp_name_normalized, to: `/mps/${mp.internal_mp_id}` },
        ]}
      />

      {/* 2. Executive Representative Dossier Header */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Official Photo Avatar with Provenance */}
            <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-[#E4E2DC] bg-[#FAF8F5] flex items-center justify-center shadow-xs">
              {photoSrc && !imgError ? (
                <img
                  src={photoSrc}
                  alt={mp.mp_name_normalized}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center font-serif font-bold text-2xl text-white ${
                    isLs ? 'bg-[#121316]' : 'bg-[#C85A32]'
                  }`}
                >
                  {getInitials(mp.mp_name_normalized)}
                </div>
              )}
              <span
                className="absolute bottom-0 inset-x-0 bg-[#121316]/90 backdrop-blur-xs text-[#FAF8F5] text-[8px] font-mono font-bold text-center py-0.5 tracking-wider"
                title="Attribution: Sansad.in / Parliament of India"
              >
                OFFICIAL
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="cw-badge-section">
                  FILE NO. MP-{mp.internal_mp_id} · {isLs ? '18TH LOK SABHA' : 'RAJYA SABHA'}
                </span>
                {mp.party && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] text-[10px] font-mono font-semibold border border-[#E4E2DC]">
                    {mp.party}
                  </span>
                )}
                <ProvenanceBadge type="SOURCE-DERIVED" />
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#121316] tracking-tight">
                {mp.mp_name_normalized}
              </h1>

              <div className="flex items-center gap-3 text-xs text-[#71717A] font-light flex-wrap">
                <div className="flex items-center gap-1 font-semibold text-[#121316]">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                  <span>
                    {mp.constituency_normalized ? `${mp.constituency_normalized} Constituency, ` : ''}
                    {mp.state_normalized}
                  </span>
                </div>
                {mp.profession && (
                  <>
                    <span className="text-[#E4E2DC]">•</span>
                    <span className="flex items-center gap-1 text-[#71717A]">
                      <Briefcase className="w-3 h-3 text-[#71717A]" />
                      <span>{mp.profession}</span>
                    </span>
                  </>
                )}
              </div>

              {profile?.biography_summary && (
                <p className="text-xs text-[#4A4D53] max-w-xl line-clamp-2 pt-0.5 font-light leading-relaxed">
                  {profile.biography_summary}
                </p>
              )}
            </div>
          </div>

          {/* Quick Macro Metric Stats & CTAs */}
          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex items-center gap-2">
              <Link
                to={`/compare?mp1=${mp.internal_mp_id}`}
                className="cw-btn-secondary text-xs"
              >
                <Scale className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Compare Candidate</span>
              </Link>
              {mp.constituency_normalized && (
                <Link
                  to={`/track-area?state=${encodeURIComponent(mp.state_normalized)}&constituency=${encodeURIComponent(mp.constituency_normalized)}`}
                  className="cw-btn-secondary text-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Track Area</span>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E4E2DC] w-full">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase block">Quota</span>
                <span className="text-base font-serif font-bold text-[#121316]">₹{allocCr} Cr</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase block">Disbursed</span>
                <span className="text-base font-serif font-bold text-[#C85A32]">₹{expCr} Cr</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase block">Utilization</span>
                <span className="text-base font-serif font-bold text-[#121316]">{utilPct.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase block">Signals</span>
                <span className="text-base font-serif font-bold text-rose-600">{anomalies.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2.1 OFFICIAL CONTACT & PARLIAMENTARY PROFILE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#E4E2DC] text-xs">
          {/* Email & Phone Contact Card */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider block">
              Official Communication Channels
            </span>

            <div className="space-y-2">
              {mp.email && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[#4A4D53] truncate">
                    <Mail className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                    <a
                      href={`mailto:${mp.email.split(',')[0].trim()}`}
                      className="text-[#121316] font-medium hover:underline truncate"
                      title={mp.email}
                    >
                      {mp.email.split(',')[0].trim()}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(mp.email || '', 'email')}
                    className="p-1 rounded text-[#71717A] hover:text-[#121316] transition cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {mp.contact_number ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[#4A4D53]">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <a
                      href={`tel:${mp.contact_number}`}
                      className="font-mono font-bold text-[#121316] hover:underline"
                    >
                      {mp.contact_number}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(mp.contact_number || '', 'phone')}
                    className="p-1 rounded text-[#71717A] hover:text-[#121316] transition cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[#71717A]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Official Nodal Line in Sansad Directory</span>
                </div>
              )}
            </div>
          </div>

          {/* Addresses Card */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
              Addresses &amp; Secretariat
            </span>

            <div className="space-y-1.5 text-[11px]">
              {mp.delhi_address && (
                <div className="text-[#4A4D53] leading-snug">
                  <strong className="text-[#121316] block text-[10px] font-mono uppercase text-[#71717A]">Delhi Residence:</strong>
                  <span className="font-light">{mp.delhi_address}</span>
                </div>
              )}
              {mp.permanent_address && (
                <div className="text-[#4A4D53] leading-snug pt-1">
                  <strong className="text-[#121316] block text-[10px] font-mono uppercase text-[#71717A]">Constituency Address:</strong>
                  <span className="line-clamp-2 font-light">{mp.permanent_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Parliamentary & Political Metadata */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
              Political &amp; Demographic Profile
            </span>

            <div className="space-y-1 text-[#4A4D53] text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Party Affiliation:</span>
                <strong className="text-[#121316]">{mp.party_name_full || mp.party || 'Independent'}</strong>
              </div>
              {mp.dob && (
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Date of Birth:</span>
                  <span className="font-mono text-[#121316]">{mp.dob}</span>
                </div>
              )}
              {mp.gender && (
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Gender:</span>
                  <span className="text-[#121316]">{mp.gender}</span>
                </div>
              )}
              {mp.sansad_mp_code && (
                <div className="pt-1.5 border-t border-[#E4E2DC] flex items-center justify-between">
                  <span className="text-[10px] text-[#71717A] font-mono">Sansad Code: #{mp.sansad_mp_code}</span>
                  <a
                    href={`https://sansad.in/ls/members/biography/${mp.sansad_mp_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono font-semibold text-[#C85A32] hover:underline flex items-center gap-1"
                  >
                    <span>Sansad Biography</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Investigative Tab Selector */}
        <div className="flex items-center gap-1.5 border-t border-[#E4E2DC] pt-4 overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'OVERVIEW', label: 'Overview & Portfolio Timeline' },
              { id: 'WORKS', label: `Works (${mp.recommended_works_count.toLocaleString()})` },
              { id: 'TRANSACTIONS', label: 'Treasury Vouchers' },
              { id: 'VENDORS', label: `Contractors (${topVendors.length})` },
              { id: 'SIGNALS', label: `Signals (${anomalies.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#121316] text-[#FAF8F5] shadow-xs'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* A. Chronological Parliamentary Milestone Timeline */}
          {timeline && timeline.milestones.length > 0 && (
            <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C85A32]" />
                  <h3 className="text-xs font-serif font-bold text-[#121316] uppercase tracking-wider">
                    Portfolio Lifecycle Timeline &amp; Statutory Benchmarks
                  </h3>
                </div>
                <span className="text-[10px] text-[#C85A32] font-mono font-bold bg-[#FAF0EB] px-2.5 py-0.5 rounded-full border border-[#E8C5B6]">
                  MPLADS Guidelines 2023
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {timeline.milestones.map((m) => (
                  <div key={m.milestone_id} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#C85A32] bg-[#FAF0EB] px-2 py-0.5 rounded-md border border-[#E8C5B6]">
                        {m.event_type}
                      </span>
                      {m.date && <span className="text-[11px] font-mono text-[#71717A]">{m.date}</span>}
                    </div>
                    <h4 className="text-xs font-serif font-bold text-[#121316]">{m.title}</h4>
                    <p className="text-[11px] text-[#71717A] font-light leading-relaxed">{m.description}</p>
                    {m.amount && (
                      <div className="text-xs font-mono font-bold text-[#2E7D32]">
                        ₹{(m.amount / 1e5).toFixed(2)} Lakh
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Statutory Rules Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-[#71717A] border-t border-[#E4E2DC]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                  <span><strong>Sanction Decision Limit:</strong> 45 calendar days from recommendation (Clause 3.2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                  <span><strong>Execution Target Limit:</strong> 18 months from administrative sanction (Clause 4.1)</span>
                </div>
              </div>
            </div>
          )}

          {/* B. Vertical Financial Lineage Journey */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#121316]" />
                <h3 className="text-xs font-serif font-bold text-[#121316] uppercase tracking-wider">
                  Parliamentary Fund Utilization Lineage
                </h3>
              </div>
              <span className="text-xs text-[#71717A] font-mono font-semibold">End-to-End Treasury Reconciliation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase">Stage 01</span>
                <h4 className="text-xs font-serif font-bold text-[#121316]">Statutory Quota</h4>
                <div className="text-xl font-serif font-bold text-[#121316]">₹{allocCr} Cr</div>
                <p className="text-[11px] text-[#71717A] font-light">Central exchequer entitlement release</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase">Stage 02</span>
                <h4 className="text-xs font-serif font-bold text-[#121316]">Proposed Works</h4>
                <div className="text-xl font-serif font-bold text-[#121316]">{mp.recommended_works_count.toLocaleString()}</div>
                <p className="text-[11px] text-[#71717A] font-light">Physical infrastructure recommended</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase">Stage 03</span>
                <h4 className="text-xs font-serif font-bold text-[#121316]">Ground Completed</h4>
                <div className="text-xl font-serif font-bold text-[#2E7D32]">{mp.completed_works_count.toLocaleString()}</div>
                <p className="text-[11px] text-[#71717A] font-light">
                  {mp.completion_rate_pct ? `${mp.completion_rate_pct.toFixed(1)}% delivery success` : 'Execution ongoing'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase">Stage 04</span>
                <h4 className="text-xs font-serif font-bold text-[#121316]">Exchequer Outlay</h4>
                <div className="text-xl font-serif font-bold text-[#C85A32]">₹{expCr} Cr</div>
                <p className="text-[11px] text-[#71717A] font-light">{utilPct.toFixed(1)}% quota drawdown</p>
              </div>
            </div>
          </div>

          {/* C. Top Vendor Concentration Preview */}
          {topVendors.length > 0 && (
            <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C85A32]" />
                  <h3 className="text-xs font-serif font-bold text-[#121316] uppercase tracking-wider">
                    Key Contracting Partners
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('VENDORS')}
                  className="text-xs text-[#C85A32] hover:underline font-semibold flex items-center gap-1 cursor-pointer font-mono"
                >
                  <span>View All ({topVendors.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                {topVendors.slice(0, 3).map((v) => (
                  <div key={v.internal_vendor_id} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#71717A]">ID: {v.internal_vendor_id}</span>
                      <span className="text-xs font-mono font-bold text-[#C85A32]">₹{(v.total_amount / 1e5).toFixed(2)} L</span>
                    </div>
                    <h4 className="text-xs font-serif font-bold text-[#121316] truncate">{v.vendor_name}</h4>
                    <span className="text-[11px] text-[#71717A] block font-light">{v.txn_count} payment vouchers</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* WORKS TAB */}
      {activeTab === 'WORKS' && (
        <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
            <h3 className="text-xl font-serif text-[#121316]">
              Recommended Ground Works ({works.length > 0 ? works.length : mp.recommended_works_count})
            </h3>
            <Link to={`/works?mp_id=${mp.internal_mp_id}`} className="text-xs text-[#C85A32] font-semibold hover:underline flex items-center gap-1 font-mono">
              <span>Open in Full Explorer</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {tabLoading ? (
            <LoadingSkeleton rows={5} height="h-16" />
          ) : works.length === 0 ? (
            <p className="text-xs text-[#71717A] py-6 text-center">No individual works recorded.</p>
          ) : (
            <div className="divide-y divide-[#E4E2DC]">
              {works.map((w) => (
                <div key={w.work_id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <Link to={`/works/${w.work_id}`} className="text-xs font-semibold text-[#121316] hover:text-[#C85A32]">
                      {w.work_description_normalized || `Work #${w.work_id}`}
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-[#71717A] mt-0.5">
                      <span className="font-mono">#{w.work_id}</span>
                      <span>•</span>
                      <span>{w.category_normalized}</span>
                      <span>•</span>
                      <span className="font-bold text-[#2E7D32]">{w.lifecycle_status}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-xs">
                    <span className="font-bold text-[#121316]">
                      ₹{(((w.sanctioned_amount || w.recommended_amount || w.final_amount || 0)) / 1e5).toFixed(2)} L
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
            <h3 className="text-xl font-serif text-[#121316]">Treasury Disbursement Vouchers</h3>
            <Link to={`/transactions?search=${encodeURIComponent(mp.mp_name_normalized)}`} className="text-xs text-[#C85A32] font-semibold hover:underline flex items-center gap-1 font-mono">
              <span>Open in Voucher Explorer</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {tabLoading ? (
            <LoadingSkeleton rows={5} height="h-16" />
          ) : transactions.length === 0 ? (
            <p className="text-xs text-[#71717A] py-6 text-center">No transactions recorded.</p>
          ) : (
            <div className="divide-y divide-[#E4E2DC] font-mono text-xs">
              {transactions.map((tx) => (
                <div key={tx.internal_transaction_id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-[#C85A32]">{tx.internal_transaction_id}</span>
                    <span className="text-[#4A4D53] font-sans ml-2 text-xs">{tx.vendor_name_normalized}</span>
                    <div className="text-[10px] text-[#71717A] mt-0.5">{tx.expenditure_date}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#121316]">₹{tx.expenditure_amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VENDORS TAB */}
      {activeTab === 'VENDORS' && (
        <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-xl font-serif text-[#121316] border-b border-[#E4E2DC] pb-3">
            Top Contracting Vendors ({topVendors.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topVendors.map((v) => (
              <div key={v.internal_vendor_id} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <span className="text-[10px] font-mono text-[#71717A]">ID: {v.internal_vendor_id}</span>
                <Link to={`/vendors/${v.internal_vendor_id}`} className="text-xs font-serif font-bold text-[#121316] hover:text-[#C85A32] block truncate">
                  {v.vendor_name}
                </Link>
                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span className="text-[#71717A]">{v.txn_count} vouchers</span>
                  <span className="font-bold text-[#C85A32]">₹{(v.total_amount / 1e5).toFixed(2)} L</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIGNALS TAB */}
      {activeTab === 'SIGNALS' && (
        <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-xl font-serif text-[#121316] border-b border-[#E4E2DC] pb-3">
            Flagged Statistical Audit Signals ({anomalies.length})
          </h3>
          {anomalies.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-[#2E7D32] mx-auto" />
              <div className="text-xs font-bold text-[#2E7D32]">Zero Statistical Signals Flagged</div>
              <p className="text-[11px] text-[#2E7D32] font-light">No statistical outliers or single-vendor concentrations detected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.map((a: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FAF0EB] border border-[#E8C5B6] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-[#121316]">{a.anomaly_type?.replace(/_/g, ' ')}</span>
                    <SeverityBadge severity={a.severity} />
                  </div>
                  <p className="text-xs text-[#4A4D53] font-light leading-relaxed">{a.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
