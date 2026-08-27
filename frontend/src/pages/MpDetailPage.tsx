import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  IndianRupee,
  Layers,
  Receipt,
  Building2,
  Info,
  ShieldAlert,
  MapPin,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api/client';
import { MPDetail, Work, Transaction } from '../api/types';
import { SeverityBadge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const MpDetailPage: React.FC = () => {
  const { mpId } = useParams<{ mpId: string }>();
  const [mp, setMp] = useState<MPDetail | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WORKS' | 'TRANSACTIONS' | 'VENDORS' | 'SIGNALS'>('OVERVIEW');

  const loadMp = async () => {
    if (!mpId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMpDetail(mpId);
      setMp(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load MP profile');
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
    if (activeTab === 'WORKS' && works.length === 0 && mp.house !== 'RAJYA_SABHA') {
      setTabLoading(true);
      api.getWorks({ mp_id: mp.internal_mp_id, limit: 50 })
        .then((res) => setWorks(res.items))
        .catch(() => {})
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'TRANSACTIONS' && transactions.length === 0 && mp.house !== 'RAJYA_SABHA') {
      setTabLoading(true);
      api.getTransactions({ search: mp.mp_name_normalized, limit: 50 })
        .then((res) => setTransactions(res.items))
        .catch(() => {})
        .finally(() => setTabLoading(false));
    }
  }, [activeTab, mpId, mp]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-6 w-64 shimmer-skeleton rounded-xl" />
        <div className="h-32 w-full shimmer-skeleton rounded-2xl" />
        <LoadingSkeleton rows={4} height="h-28" />
      </div>
    );
  }

  if (error || !mp) {
    return <ErrorDisplay message={error || 'MP profile not found'} onRetry={loadMp} />;
  }

  const isLs = mp.house === 'LOK_SABHA';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in text-[#0F172A] font-sans pb-20">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Parliament', to: '/mps', icon: Users },
          { label: mp.mp_name_normalized, to: `/mps/${mp.internal_mp_id}` },
        ]}
      />

      {/* 2. Executive Representative Dossier Header */}
      <div className="rounded-3xl border border-warm-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                isLs ? 'bg-navy-950 text-white' : 'bg-saffron-500 text-white'
              }`}
            >
              {getInitials(mp.mp_name_normalized)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isLs ? 'bg-navy-950 text-white' : 'bg-saffron-100 text-saffron-800'
                  }`}
                >
                  {isLs ? '18th Lok Sabha' : 'Rajya Sabha'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-mono text-slate-400 font-bold">ID: {mp.internal_mp_id}</span>
                <ProvenanceBadge type="SOURCE-DERIVED" />
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight font-display">
                {mp.mp_name_normalized}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-saffron-500" />
                <span>
                  {mp.constituency_normalized ? `${mp.constituency_normalized} Constituency, ` : ''}
                  {mp.state_normalized}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Macro Metric Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-warm-canvas p-4 rounded-2xl border border-warm-border">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Allocated</span>
              <span className="text-base font-black font-mono text-navy-950">₹{allocCr} Cr</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Disbursed</span>
              <span className="text-base font-black font-mono text-brand-700">₹{expCr} Cr</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Utilization</span>
              <span className="text-base font-black font-mono text-navy-950">{utilPct.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Signals</span>
              <span className="text-base font-black font-mono text-coral-700">{anomalies.length}</span>
            </div>
          </div>
        </div>

        {/* Investigative Tab Selector */}
        <div className="flex items-center gap-2 border-t border-warm-border pt-4 overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'OVERVIEW', label: 'Overview & Lineage' },
              { id: 'WORKS', label: `Works (${mp.recommended_works_count.toLocaleString()})` },
              { id: 'TRANSACTIONS', label: 'Disbursement Vouchers' },
              { id: 'VENDORS', label: `Contractors (${topVendors.length})` },
              { id: 'SIGNALS', label: `Signals (${anomalies.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-navy-950 text-white shadow-xs'
                  : 'bg-warm-canvas text-slate-600 hover:bg-warm-tint'
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
          {/* Vertical Financial Lineage Story */}
          <div className="rounded-3xl border border-warm-border bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-navy-950" />
                <h3 className="text-sm font-bold text-navy-950 uppercase font-mono tracking-wider">
                  Parliamentary Expenditure Lineage Journey
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold">End-to-End Capital Trace</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Stage 01</span>
                <h4 className="text-xs font-bold text-navy-950">Statutory Allocation</h4>
                <div className="text-lg font-black font-mono text-navy-950">₹{allocCr} Cr</div>
                <p className="text-[11px] text-slate-500">Government of India public fund allocation</p>
              </div>

              <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Stage 02</span>
                <h4 className="text-xs font-bold text-navy-950">Proposed Works</h4>
                <div className="text-lg font-black font-mono text-navy-950">{mp.recommended_works_count.toLocaleString()}</div>
                <p className="text-[11px] text-slate-500">Developmental projects submitted by MP</p>
              </div>

              <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Stage 03</span>
                <h4 className="text-xs font-bold text-navy-950">Verified Disbursements</h4>
                <div className="text-lg font-black font-mono text-brand-700">₹{expCr} Cr</div>
                <p className="text-[11px] text-slate-500">Expenditure transferred to executing agencies</p>
              </div>

              <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Stage 04</span>
                <h4 className="text-xs font-bold text-navy-950">Exchequer Surplus</h4>
                <div className="text-lg font-black font-mono text-amber-700">₹{unspentCr} Cr</div>
                <p className="text-[11px] text-slate-500">Unspent balance eligible for subsequent release</p>
              </div>
            </div>
          </div>

          {/* Top Vendors Preview */}
          {topVendors.length > 0 && (
            <div className="rounded-3xl border border-warm-border bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-navy-950 uppercase font-mono tracking-wider">
                Primary Implementing Contractors / Vendors ({topVendors.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {topVendors.slice(0, 6).map((v) => (
                  <div key={v.internal_vendor_id || v.vendor_name} className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-1">
                    <div className="font-bold text-navy-950 text-xs truncate">{v.vendor_name}</div>
                    <div className="text-base font-black font-mono text-navy-950">₹{(v.total_amount / 1e7).toFixed(2)} Cr</div>
                    <div className="text-[10px] text-slate-500 font-mono">{v.txn_count} disbursements</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rajya Sabha Provenance Disclosure if Applicable */}
          {!isLs && (
            <div className="p-4 rounded-2xl bg-warm-tint border border-warm-border text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-navy-950">
                <Info className="w-4 h-4 text-slate-500" />
                <span>Rajya Sabha Source Lineage Disclosure</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Rajya Sabha representatives represent whole States &amp; Union Territories under the Fourth Schedule. Allocation and macro expenditure metrics are verified against official parliamentary returns. Line-item work records are reported at nodal district implementation level.
              </p>
            </div>
          )}
        </div>
      )}

      {/* WORKS TAB */}
      {activeTab === 'WORKS' && (
        <div className="rounded-3xl border border-warm-border bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-navy-950 uppercase font-mono tracking-wider">
            Works Proposed by {mp.mp_name_normalized}
          </h3>
          {tabLoading ? (
            <LoadingSkeleton rows={5} height="h-16" />
          ) : works.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {isLs ? 'No individual work items returned for this representative.' : 'Detailed work items not available in verified export for Rajya Sabha scope.'}
            </div>
          ) : (
            <div className="divide-y divide-warm-border">
              {works.map((w) => (
                <div key={w.work_id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-warm-canvas/60 px-3 rounded-xl transition">
                  <div>
                    <div className="font-bold text-navy-950 text-xs">{w.work_description_normalized || 'MPLADS Physical Work Item'}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{w.category_normalized}</span>
                      <span>•</span>
                      <span className="font-mono">{w.lifecycle_status}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono font-bold text-navy-950 text-xs">
                    {w.sanctioned_amount ? `₹${(w.sanctioned_amount / 1e5).toFixed(2)} L` : 'Not recorded'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="rounded-3xl border border-warm-border bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-navy-950 uppercase font-mono tracking-wider">
            Disbursement Vouchers Ledger
          </h3>
          {tabLoading ? (
            <LoadingSkeleton rows={5} height="h-16" />
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {isLs ? 'No voucher records found matching this representative.' : 'Line-item vouchers not available in verified export for Rajya Sabha scope.'}
            </div>
          ) : (
            <div className="divide-y divide-warm-border">
              {transactions.map((tx) => (
                <div key={tx.internal_transaction_id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-warm-canvas/60 px-3 rounded-xl transition">
                  <div>
                    <div className="font-bold text-navy-950 text-xs">{tx.vendor_name_normalized}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{tx.activity_description_normalized || 'Work disbursement'}</div>
                  </div>
                  <div className="text-right shrink-0 font-mono font-bold text-navy-950 text-xs">
                    ₹{(tx.expenditure_amount / 1e5).toFixed(2)} Lakh
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VENDORS TAB */}
      {activeTab === 'VENDORS' && (
        <div className="rounded-3xl border border-warm-border bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-navy-950 uppercase font-mono tracking-wider">
            Contractor Procurement Portfolio
          </h3>
          {topVendors.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No contractor relationships recorded for this MP.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {topVendors.map((v) => (
                <div key={v.internal_vendor_id || v.vendor_name} className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-2">
                  <span className="font-bold text-navy-950 text-xs block truncate">{v.vendor_name}</span>
                  <div className="text-base font-black font-mono text-navy-950">₹{(v.total_amount / 1e7).toFixed(2)} Cr</div>
                  <div className="text-[11px] text-slate-500 font-mono">{v.txn_count} disbursements</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SIGNALS TAB */}
      {activeTab === 'SIGNALS' && (
        <div className="rounded-3xl border border-warm-border bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-navy-950 uppercase font-mono tracking-wider">
            Explainable Analytical Signals ({anomalies.length})
          </h3>
          {anomalies.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No statistical anomalies flagged for this representative.
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.map((a) => (
                <div key={a.anomaly_id} className="p-4 rounded-2xl border border-warm-border bg-warm-canvas/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-navy-950">{a.anomaly_type}</span>
                    <SeverityBadge severity={a.severity} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{a.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
