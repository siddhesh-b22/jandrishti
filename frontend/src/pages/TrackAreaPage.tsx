import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { formatIndianCurrency, formatIndianNumber } from '../utils/formatters';
import {
  MapPin,
  Users,
  Layers,
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Activity,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import { StateSummary, Constituency, AreaTrackResponse } from '../api/types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';

import { useRole } from '../context/RoleContext';

export const TrackAreaPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, selectedState: roleState, selectedDistrict: roleDistrict } = useRole();

  // Derive defaults from authenticated user context first, then URL params, then generic fallback
  const userState = (user?.state || roleState || 'MAHARASHTRA').toUpperCase();
  const userConst = (user?.constituency || user?.district || roleDistrict || 'PUNE').toUpperCase();

  const stateParam = searchParams.get('state') || userState;
  const constParam = searchParams.get('constituency') || userConst;

  const [states, setStates] = useState<StateSummary[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [selectedState, setSelectedState] = useState<string>(stateParam);
  const [selectedConst, setSelectedConst] = useState<string>(constParam);
  
  const [areaData, setAreaData] = useState<AreaTrackResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingConsts, setLoadingConsts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [workFilterSearch, setWorkFilterSearch] = useState<string>('');
  const [workFilterStatus, setWorkFilterStatus] = useState<string>('ALL');

  // 1. Fetch all states on mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const data = await api.getStates();
        setStates(data);
      } catch (err: any) {
        console.error('Failed to load states:', err);
      }
    };
    loadStates();
  }, []);

  // 2. Fetch constituencies when state changes
  useEffect(() => {
    if (!selectedState) return;
    const loadConstituencies = async () => {
      setLoadingConsts(true);
      try {
        const data = await api.getConstituencies({ state: selectedState });
        setConstituencies(data);
        if (data.length > 0) {
          // If current selected const is not in new list, pick first
          const exists = data.some(
            (c) => c.constituency.toUpperCase() === selectedConst.toUpperCase()
          );
          if (!exists) {
            setSelectedConst(data[0].constituency);
            setSearchParams({ state: selectedState, constituency: data[0].constituency });
          }
        }
      } catch (err: any) {
        console.error('Failed to load constituencies:', err);
      } finally {
        setLoadingConsts(false);
      }
    };
    loadConstituencies();
  }, [selectedState]);

  // 3. Fetch area intelligence data when state or constituency changes
  const loadArea = useCallback(async () => {
    if (!selectedState || !selectedConst) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAreaTrack(selectedState, selectedConst);
      setAreaData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load constituency intelligence');
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedConst]);

  useEffect(() => {
    loadArea();
  }, [loadArea]);

  const handleStateChange = (st: string) => {
    setSelectedState(st);
  };

  const handleConstChange = (co: string) => {
    setSelectedConst(co);
    setSearchParams({ state: selectedState, constituency: co });
  };

  const filteredWorks = useMemo(() => {
    if (!areaData?.recent_works) return [];
    return areaData.recent_works.filter((w) => {
      const matchSearch =
        !workFilterSearch ||
        w.work_description_normalized.toLowerCase().includes(workFilterSearch.toLowerCase()) ||
        w.category_normalized.toLowerCase().includes(workFilterSearch.toLowerCase());
      const matchStatus =
        workFilterStatus === 'ALL' ||
        w.lifecycle_status.toUpperCase() === workFilterStatus.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [areaData, workFilterSearch, workFilterStatus]);

  const lsMp = areaData?.lok_sabha_mp;
  const kpi = areaData?.kpi_summary;
  const categories = areaData?.category_distribution || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#121316] font-sans pb-24">
      {/* 1. Header & Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Constituency Tracker', to: '/track-area', icon: MapPin },
          { label: `${selectedState} — ${selectedConst}`, to: `/track-area?state=${selectedState}&constituency=${selectedConst}` },
        ]}
      />

      {/* 2. Hero Interactive Area Selector */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="cw-badge-section">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
              § VIII · CONSTITUENCY TRACKER &amp; AREA INTELLIGENCE
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#121316]">
              Constituency Delivery &amp; <em className="font-serif italic font-normal text-[#C85A32]">Localized Physical Outlays</em>
            </h1>
            <p className="text-sm sm:text-base text-[#6E706E] max-w-2xl font-normal leading-relaxed">
              Explore localized physical works, cross-chamber parliamentary representation (Lok Sabha &amp; Rajya Sabha), sector outlays, and execution progress in your home constituency.
            </p>
          </div>

          {/* Area Selector Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-2 rounded-xl border border-[#E4E2DC] shadow-xs">
            {/* State Picker */}
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full sm:w-48 bg-[#FAF8F5] text-xs font-medium text-[#121316] rounded-lg px-3 py-2 border border-[#E4E2DC] focus:outline-none focus:border-[#121316] appearance-none cursor-pointer pr-8"
              >
                {states.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6E706E] text-[10px]">
                ▼
              </div>
            </div>

            {/* Constituency Picker */}
            <div className="relative">
              <select
                value={selectedConst}
                onChange={(e) => handleConstChange(e.target.value)}
                disabled={loadingConsts || constituencies.length === 0}
                className="w-full sm:w-56 bg-[#FAF8F5] text-xs font-medium text-[#121316] rounded-lg px-3 py-2 border border-[#E4E2DC] focus:outline-none focus:border-[#121316] appearance-none cursor-pointer pr-8 disabled:opacity-50"
              >
                {constituencies.map((c) => (
                  <option key={c.constituency} value={c.constituency}>
                    {c.constituency}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6E706E] text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-32" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadArea} />
      ) : (
        <div className="space-y-8">
          {/* 3. Representation Section: Lok Sabha & Rajya Sabha MPs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* A. Elected Lok Sabha MP Card */}
            <div className="lg:col-span-2 rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C85A32]" />
                  <h3 className="text-xs font-mono font-medium text-[#121316] uppercase tracking-wider">
                    Elected Lok Sabha Representative
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#FAF0EB] text-[#C85A32] border border-[#C85A32]/20">
                  Direct Mandate
                </span>
              </div>

              {lsMp ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#E4E2DC] flex items-center justify-center font-serif text-xl font-bold text-[#121316] border border-[#E4E2DC]">
                      {lsMp.mp_name_normalized.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-medium text-[#121316]">
                        {lsMp.mp_name_normalized}
                      </h2>
                      <p className="text-xs text-[#6E706E]">
                        Parliamentary Constituency: <span className="font-medium text-[#121316]">{lsMp.constituency_normalized}</span> ({lsMp.state_normalized})
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/mps/${lsMp.internal_mp_id}`}
                    className="cw-btn-primary text-xs whitespace-nowrap"
                  >
                    <span>Full MP Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-[#6E706E] italic">
                  No Lok Sabha representative record found for this selected constituency.
                </p>
              )}

              {/* MP Key Financial Snapshot */}
              {lsMp && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#E4E2DC]">
                  <div>
                    <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">Statutory Quota</span>
                    <span className="text-sm font-bold font-mono text-[#121316]">
                      {formatIndianCurrency(lsMp.allocated_amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">Disbursed</span>
                    <span className="text-sm font-bold font-mono text-[#2E7D32]">
                      {formatIndianCurrency(lsMp.total_expenditure)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">Utilization</span>
                    <span className="text-sm font-bold font-mono text-[#121316]">
                      {lsMp.utilization_pct.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">Recommended Works</span>
                    <span className="text-sm font-bold font-mono text-[#121316]">
                      {formatIndianNumber(lsMp.recommended_works_count)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* B. Rajya Sabha Supporting Parliamentarians */}
            <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C85A32]" />
                  <h3 className="text-xs font-mono font-medium text-[#121316] uppercase tracking-wider">
                    Rajya Sabha State MPs
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#C85A32] bg-[#FAF0EB] px-2.5 py-0.5 rounded-full border border-[#C85A32]/20">
                  {areaData?.rajya_sabha_mps.length || 0} Contributing
                </span>
              </div>

              <p className="text-xs text-[#6E706E] leading-relaxed">
                Council of States members whose MPLADS recommendations actively fund infrastructure in {selectedState}.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {areaData?.rajya_sabha_mps && areaData.rajya_sabha_mps.length > 0 ? (
                  areaData.rajya_sabha_mps.map((rs) => (
                    <Link
                      key={rs.internal_mp_id}
                      to={`/mps/${rs.internal_mp_id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-[#F0EFEA] border border-[#E4E2DC] transition group"
                    >
                      <div className="space-y-0.5 pr-2">
                        <h4 className="text-xs font-medium text-[#121316] group-hover:text-[#C85A32] transition">
                          {rs.mp_name_normalized}
                        </h4>
                        <span className="text-[10px] text-[#6E706E] font-mono">
                          Disbursed: {formatIndianCurrency(rs.total_expenditure)}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#6E706E] group-hover:text-[#121316] transition shrink-0" />
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-[#6E706E] italic">No direct Rajya Sabha recommendations recorded.</p>
                )}
              </div>
            </div>
          </div>

          {/* 4. Area KPI Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
              <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 01 PROPOSED OUTLAY</span>
              <div className="text-lg sm:text-xl font-medium font-serif text-[#121316]">
                {formatIndianCurrency(kpi?.total_recommended_amount || 0)}
              </div>
              <p className="text-xs text-[#6E706E] font-mono">
                {formatIndianNumber(kpi?.total_works || 0)} infrastructure proposals
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
              <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 02 DELIVERED ASSETS</span>
              <div className="text-lg sm:text-xl font-medium font-serif text-[#2E7D32]">
                {formatIndianCurrency(kpi?.completed_works_value || 0)}
              </div>
              <p className="text-xs text-[#6E706E] font-mono">
                {formatIndianNumber(kpi?.completed_works || 0)} works certified complete
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
              <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 03 COMPLETION VELOCITY</span>
              <div className="text-lg sm:text-xl font-medium font-serif text-[#121316]">
                {kpi?.completion_rate_pct || 0}%
              </div>
              <p className="text-xs text-[#6E706E] font-mono">
                {formatIndianNumber(kpi?.pending_works || 0)} works in active pipeline
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
              <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 04 IMPLEMENTING BODIES</span>
              <div className="text-lg sm:text-xl font-medium font-serif text-[#121316]">
                {areaData?.implementing_agencies.length || 0} Agencies
              </div>
              <p className="text-xs text-[#6E706E] font-mono">
                District Planning &amp; DRDA execution bodies
              </p>
            </div>
          </div>

          {/* 5. Sector & Category Distribution */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C85A32]" />
                <h3 className="text-xs font-mono font-medium text-[#121316] uppercase tracking-wider">
                  Constituency Sector Allocation Distribution
                </h3>
              </div>
              <span className="text-xs font-mono text-[#6E706E]">
                {categories.length} Development Sectors
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((c) => (
                <div
                  key={c.category}
                  className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#121316]">{c.category}</span>
                    <span className="text-xs font-mono font-medium text-[#121316]">
                      {formatIndianCurrency(c.total_amount)} ({c.share_pct}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#E4E2DC] overflow-hidden">
                    <div
                      className="h-full bg-[#121316] rounded-full"
                      style={{ width: `${Math.min(100, c.share_pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6E706E] font-mono">
                    <span>{formatIndianNumber(c.work_count)} project items</span>
                    <span>Statutory Sector</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Ground Works Registry in this Area */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#121316]">
                  Ground Infrastructure Works in {selectedConst}
                </h3>
                <p className="text-xs text-[#6E706E]">
                  Line-item physical assets funded by parliamentary allocations
                </p>
              </div>

              {/* Table Search & Status Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E706E]" />
                  <input
                    type="text"
                    placeholder="Search works..."
                    value={workFilterSearch}
                    onChange={(e) => setWorkFilterSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E4E2DC] rounded-xl focus:outline-none focus:border-[#121316] w-40 sm:w-48 text-[#121316]"
                  />
                </div>

                <select
                  value={workFilterStatus}
                  onChange={(e) => setWorkFilterStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-[#E4E2DC] rounded-xl focus:outline-none focus:border-[#121316] cursor-pointer font-medium text-[#121316]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="SANCTIONED">Sanctioned</option>
                </select>
              </div>
            </div>

            {/* Works Table */}
            <div className="overflow-x-auto rounded-xl border border-[#E4E2DC] bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E4E2DC] text-[10px] font-mono uppercase tracking-wider text-[#6E706E] bg-[#F0EFEA]">
                    <th className="py-3 px-4 font-semibold">Work ID &amp; Title</th>
                    <th className="py-3 px-4 font-semibold">Sector</th>
                    <th className="py-3 px-4 font-semibold">Cost</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Execution Agency</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]">
                  {filteredWorks.length > 0 ? (
                    filteredWorks.map((w) => (
                      <tr key={w.work_id} className="hover:bg-[#F0EFEA]/60 transition group">
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-[#121316] truncate" title={w.work_description_normalized}>
                            {w.work_description_normalized}
                          </div>
                          <span className="text-[10px] font-mono text-[#6E706E]">
                            #{w.work_id} • Year {w.completion_year || w.recommendation_year || '2024'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#6E706E]">
                          {w.category_normalized}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-[#121316]">
                          {formatIndianCurrency(w.final_amount || w.recommended_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                              w.lifecycle_status === 'COMPLETED'
                                ? 'bg-[#FAF8F5] text-[#2E7D32] border border-[#2E7D32]/30'
                                : w.lifecycle_status === 'IN_PROGRESS'
                                ? 'bg-[#FAF8F5] text-[#121316] border border-[#121316]/30'
                                : 'bg-[#FAF8F5] text-[#B25E00] border border-[#B25E00]/30'
                            }`}
                          >
                            {w.lifecycle_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#6E706E] text-[11px] truncate max-w-xs" title={w.implementing_agency_normalized}>
                          {w.implementing_agency_normalized || 'District Planning Office'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/works/${w.work_id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C85A32] hover:underline transition"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#6E706E] text-xs italic">
                        No physical works matched the current search or status filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
