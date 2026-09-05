import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Scale,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Receipt,
  Layers,
  ChevronRight,
  Plus,
  X,
  Search,
} from 'lucide-react';
import { api } from '../api/client';
import { MP, MPDetail } from '../api/types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mpId1Param = searchParams.get('mp1') || 'INTERNAL_MP_001';
  const mpId2Param = searchParams.get('mp2') || 'INTERNAL_MP_002';

  const [mp1, setMp1] = useState<MPDetail | null>(null);
  const [mp2, setMp2] = useState<MPDetail | null>(null);
  const [allMps, setAllMps] = useState<MP[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchMp1, setSearchMp1] = useState<string>('');
  const [searchMp2, setSearchMp2] = useState<string>('');
  const [showSearch1, setShowSearch1] = useState<boolean>(false);
  const [showSearch2, setShowSearch2] = useState<boolean>(false);

  // 1. Fetch MP List for dropdown selectors
  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await api.getMps({ limit: 100 });
        setAllMps(res.items);
      } catch (err: any) {
        console.error('Failed to load MP list for comparator:', err);
      }
    };
    loadAll();
  }, []);

  const loadCompareMps = async () => {
    setLoading(true);
    setError(null);
    try {
      const [d1, d2] = await Promise.all([
        api.getMpDetail(mpId1Param),
        api.getMpDetail(mpId2Param),
      ]);
      setMp1(d1);
      setMp2(d2);
    } catch (err: any) {
      setError(err.message || 'Failed to load MP comparative dossiers');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Selected MP Profiles
  useEffect(() => {
    loadCompareMps();
  }, [mpId1Param, mpId2Param]);

  const selectMp1 = (id: string) => {
    setSearchParams({ mp1: id, mp2: mpId2Param });
    setShowSearch1(false);
  };

  const selectMp2 = (id: string) => {
    setSearchParams({ mp1: mpId1Param, mp2: id });
    setShowSearch2(false);
  };

  const filteredMps1 = allMps.filter((m) =>
    m.mp_name_normalized.toLowerCase().includes(searchMp1.toLowerCase()) ||
    m.constituency_normalized.toLowerCase().includes(searchMp1.toLowerCase())
  );

  const filteredMps2 = allMps.filter((m) =>
    m.mp_name_normalized.toLowerCase().includes(searchMp2.toLowerCase()) ||
    m.constituency_normalized.toLowerCase().includes(searchMp2.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#121316] font-sans pb-24">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Parliament', to: '/mps', icon: Users },
          { label: 'Benchmark Comparator', to: '/compare' },
        ]}
      />

      {/* 2. Editorial Header */}
      <div className="space-y-4 border-b border-[#E4E2DC] pb-6">
        <div className="space-y-1.5">
          <span className="cw-badge-section">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
            § IX · BENCHMARK COMPARATOR &amp; DIVERGENCE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#121316]">
            Parliamentary Benchmark &amp; <em className="font-serif italic font-normal text-[#C85A32]">Divergence Matrix</em>
          </h1>
          <p className="text-sm sm:text-base text-[#6E706E] max-w-2xl font-normal leading-relaxed">
            Compare two Members of Parliament side-by-side on statutory quota utilization, proposed outlays, project execution velocity, and contractor distribution.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-32" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadCompareMps} />
      ) : (
        <div className="space-y-8">
          {/* 3. Side-by-Side MP Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MP 1 Selector & Header */}
            <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                <span className="text-[10px] font-mono font-medium text-[#121316] uppercase bg-white border border-[#E4E2DC] px-2.5 py-0.5 rounded-full">
                  / CANDIDATE 01
                </span>
                <button
                  type="button"
                  onClick={() => setShowSearch1(!showSearch1)}
                  className="text-xs font-medium text-[#C85A32] hover:underline transition flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  <span>Change Representative</span>
                </button>
              </div>

              {/* Selector Popover */}
              {showSearch1 && (
                <div className="absolute inset-x-4 top-16 z-20 bg-[#FAF8F5] p-4 rounded-xl border border-[#E4E2DC] shadow-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Search candidate by name or constituency..."
                    value={searchMp1}
                    onChange={(e) => setSearchMp1(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-[#E4E2DC] rounded-lg focus:outline-none focus:border-[#121316] text-[#121316]"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-[#E4E2DC]">
                    {filteredMps1.slice(0, 8).map((m) => (
                      <button
                        key={m.internal_mp_id}
                        type="button"
                        onClick={() => selectMp1(m.internal_mp_id)}
                        className="w-full text-left p-2 hover:bg-[#F0EFEA] text-xs transition rounded-lg"
                      >
                        <div className="font-medium text-[#121316]">{m.mp_name_normalized}</div>
                        <div className="text-[10px] text-[#6E706E] font-mono">
                          {m.constituency_normalized} • {m.state_normalized} ({m.house})
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mp1 && (
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#121316] text-[#FAF8F5] flex items-center justify-center font-serif text-lg shrink-0">
                      {mp1.mp_name_normalized.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#6E706E] block">{mp1.house}</span>
                      <h2 className="font-serif text-lg font-medium text-[#121316] leading-snug">
                        {mp1.mp_name_normalized}
                      </h2>
                      <p className="text-xs text-[#6E706E]">
                        {mp1.constituency_normalized} ({mp1.state_normalized})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MP 2 Selector & Header */}
            <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                <span className="text-[10px] font-mono font-medium text-[#C85A32] uppercase bg-[#FAF0EB] border border-[#C85A32]/20 px-2.5 py-0.5 rounded-full">
                  / CANDIDATE 02
                </span>
                <button
                  type="button"
                  onClick={() => setShowSearch2(!showSearch2)}
                  className="text-xs font-medium text-[#C85A32] hover:underline transition flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  <span>Change Representative</span>
                </button>
              </div>

              {/* Selector Popover */}
              {showSearch2 && (
                <div className="absolute inset-x-4 top-16 z-20 bg-[#FAF8F5] p-4 rounded-xl border border-[#E4E2DC] shadow-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Search candidate by name or constituency..."
                    value={searchMp2}
                    onChange={(e) => setSearchMp2(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-[#E4E2DC] rounded-lg focus:outline-none focus:border-[#121316] text-[#121316]"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-[#E4E2DC]">
                    {filteredMps2.slice(0, 8).map((m) => (
                      <button
                        key={m.internal_mp_id}
                        type="button"
                        onClick={() => selectMp2(m.internal_mp_id)}
                        className="w-full text-left p-2 hover:bg-[#F0EFEA] text-xs transition rounded-lg"
                      >
                        <div className="font-medium text-[#121316]">{m.mp_name_normalized}</div>
                        <div className="text-[10px] text-[#6E706E] font-mono">
                          {m.constituency_normalized} • {m.state_normalized} ({m.house})
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mp2 && (
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#C85A32] text-[#FAF8F5] flex items-center justify-center font-serif text-lg shrink-0">
                      {mp2.mp_name_normalized.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#6E706E] block">{mp2.house}</span>
                      <h2 className="font-serif text-lg font-medium text-[#121316] leading-snug">
                        {mp2.mp_name_normalized}
                      </h2>
                      <p className="text-xs text-[#6E706E]">
                        {mp2.constituency_normalized} ({mp2.state_normalized})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Side-by-Side Key Metrics Matrix */}
          {mp1 && mp2 && (
            <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#C85A32]" />
                  <h3 className="text-xs font-mono font-medium text-[#121316] uppercase tracking-wider">
                    Comparative Performance Ledger
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#6E706E]">Standardized Indicators</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: 'Statutory Allocation Quota',
                    val1: `₹${(mp1.allocated_amount / 1e7).toFixed(2)} Cr`,
                    val2: `₹${(mp2.allocated_amount / 1e7).toFixed(2)} Cr`,
                    num1: mp1.allocated_amount,
                    num2: mp2.allocated_amount,
                    desc: 'Central exchequer entitlement release',
                  },
                  {
                    label: 'Total Verified Expenditure',
                    val1: `₹${(mp1.total_expenditure / 1e7).toFixed(2)} Cr`,
                    val2: `₹${(mp2.total_expenditure / 1e7).toFixed(2)} Cr`,
                    num1: mp1.total_expenditure,
                    num2: mp2.total_expenditure,
                    desc: 'Line-item treasury payments released',
                  },
                  {
                    label: 'Fund Utilization Rate',
                    val1: `${mp1.utilization_pct.toFixed(1)}%`,
                    val2: `${mp2.utilization_pct.toFixed(1)}%`,
                    num1: mp1.utilization_pct,
                    num2: mp2.utilization_pct,
                    desc: 'Ratio of total disbursements to quota',
                  },
                  {
                    label: 'Recommended Outlay (Telemetry)',
                    val1: `₹${((mp1.total_recommended_amount || mp1.allocated_amount) / 1e7).toFixed(2)} Cr`,
                    val2: `₹${((mp2.total_recommended_amount || mp2.allocated_amount) / 1e7).toFixed(2)} Cr`,
                    num1: mp1.total_recommended_amount || mp1.allocated_amount,
                    num2: mp2.total_recommended_amount || mp2.allocated_amount,
                    desc: 'Cumulative project value formally recommended',
                  },
                  {
                    label: 'Proposed Infrastructure Works',
                    val1: mp1.recommended_works_count.toLocaleString(),
                    val2: mp2.recommended_works_count.toLocaleString(),
                    num1: mp1.recommended_works_count,
                    num2: mp2.recommended_works_count,
                    desc: 'Total physical works recommended',
                  },
                  {
                    label: 'Completed Community Assets',
                    val1: mp1.completed_works_count.toLocaleString(),
                    val2: mp2.completed_works_count.toLocaleString(),
                    num1: mp1.completed_works_count,
                    num2: mp2.completed_works_count,
                    desc: 'Finished assets verified on ground',
                  },
                  {
                    label: 'Physical Completion Rate',
                    val1: `${mp1.completion_rate_pct.toFixed(1)}%`,
                    val2: `${mp2.completion_rate_pct.toFixed(1)}%`,
                    num1: mp1.completion_rate_pct,
                    num2: mp2.completion_rate_pct,
                    desc: 'Completed works as percentage of proposed',
                  },
                  {
                    label: 'Treasury Payment Vouchers',
                    val1: mp1.transaction_count.toLocaleString(),
                    val2: mp2.transaction_count.toLocaleString(),
                    num1: mp1.transaction_count,
                    num2: mp2.transaction_count,
                    desc: 'Individual payment disbursements released',
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="p-4 rounded-xl border border-[#E4E2DC] bg-white space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium text-[#121316]">{row.label}</span>
                        <p className="text-[10px] text-[#6E706E] font-mono">{row.desc}</p>
                      </div>
                      <div className="flex items-center gap-6 font-mono font-medium text-sm">
                        <span className="text-[#121316] min-w-20 text-right">{row.val1}</span>
                        <span className="text-[#6E706E]/40 font-normal">vs</span>
                        <span className="text-[#C85A32] min-w-20 text-left">{row.val2}</span>
                      </div>
                    </div>

                    {/* Comparative Visual Bar */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="w-full h-1.5 bg-[#E4E2DC] rounded-full overflow-hidden flex justify-end">
                        <div
                          className="h-full bg-[#121316] rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              row.num1 && (row.num1 + row.num2) > 0
                                ? (row.num1 / (row.num1 + row.num2)) * 100
                                : 50
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="w-full h-1.5 bg-[#E4E2DC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C85A32] rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              row.num2 && (row.num1 + row.num2) > 0
                                ? (row.num2 / (row.num1 + row.num2)) * 100
                                : 50
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
