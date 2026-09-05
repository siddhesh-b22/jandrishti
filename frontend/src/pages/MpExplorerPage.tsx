import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Users,
  RotateCcw,
  ChevronRight,
  ArrowUpDown,
  Building2,
  Sparkles,
  MapPin,
  Layers,
  Receipt,
  ShieldAlert,
  ArrowRight,
  LayoutGrid,
  List,
  Scale,
} from 'lucide-react';
import { api } from '../api/client';
import { MP, StateSummary } from '../api/types';
import { useHouse } from '../context/HouseContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { EntityDossierDrawer, DossierEntity } from '../components/common/EntityDossierDrawer';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const MpExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedHouse, setSelectedHouse, houseLabel } = useHouse();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mps, setMps] = useState<MP[]>([]);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('TABLE');
  const [activeDossier, setActiveDossier] = useState<DossierEntity | null>(null);

  // URL Query Parameters
  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || '';
  const sortBy = searchParams.get('sort_by') || 'allocated_amount';
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = 50;

  const [searchInput, setSearchInput] = useState(search);

  // Load States list for dropdown
  useEffect(() => {
    api.getStates()
      .then(setStates)
      .catch(() => {});
  }, []);

  const loadMps = async () => {
    try {
      setLoading(true);
      setError(null);
      const houseParam = selectedHouse === 'ALL' ? undefined : selectedHouse;
      const res = await api.getMps({
        house: houseParam,
        state: state || undefined,
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset,
      });
      setMps(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load parliamentary directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMps();
  }, [selectedHouse, state, search, sortBy, sortOrder, offset]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handleReset = () => {
    setSearchInput('');
    setSelectedHouse('ALL');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#121316] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      <Breadcrumbs items={[{ label: 'Parliamentary Directory', to: '/mps', icon: Users }]} />

      {/* GetCasework Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4E2DC] pb-6">
        <div>
          <div className="cw-badge-section mb-2">
            § II · PARLIAMENTARY DIRECTORY · {selectedHouse === 'ALL' ? '778 MEMBERS' : selectedHouse === 'LOK_SABHA' ? '543 LOK SABHA' : '235 RAJYA SABHA'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#121316] tracking-tight">
            Parliamentary <span className="italic font-normal">Representatives</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-light mt-1">
            Statutory allocation balances, expenditure velocity, and ground project recommendations for all 778 Parliamentarians.
          </p>
        </div>

        {/* View Mode & Chamber Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#FAF8F5] border border-[#E4E2DC] text-xs font-medium shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                viewMode === 'TABLE' ? 'bg-[#121316] text-white shadow-xs' : 'text-[#71717A] hover:text-[#121316]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Ledger Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                viewMode === 'CARDS' ? 'bg-[#121316] text-white shadow-xs' : 'text-[#71717A] hover:text-[#121316]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento Summary Metrics (/ 01, / 02, / 03) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cw-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">/ 01 Representatives</span>
            <span className="text-[10px] font-mono text-[#71717A]">Both Houses</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-[#121316]">
            {total.toLocaleString()} MPs
          </div>
          <div className="text-xs text-[#71717A] mt-1 font-light">
            543 Lok Sabha single-member seats + 235 Rajya Sabha states representatives
          </div>
        </div>

        <div className="cw-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">/ 02 Annual Allocation</span>
            <span className="text-[10px] font-mono text-[#71717A]">MoSPI Quota</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-[#121316]">
            ₹5.00 Cr / Year
          </div>
          <div className="text-xs text-[#71717A] mt-1 font-light">
            ₹2.50 Cr per tranche transferred by District Nodal Authority
          </div>
        </div>

        <div className="cw-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">/ 03 Average Velocity</span>
            <span className="text-[10px] font-mono text-[#71717A]">National Baseline</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-[#121316]">
            89.2%
          </div>
          <div className="text-xs text-[#71717A] mt-1 font-light">
            Reconciled drawdown against recommended work orders
          </div>
        </div>
      </div>

      {/* Quick Chamber Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { label: 'All 778 MPs', house: 'ALL' },
          { label: 'Lok Sabha (543)', house: 'LOK_SABHA' },
          { label: 'Rajya Sabha (235)', house: 'RAJYA_SABHA' },
        ].map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              setSelectedHouse(chip.house as any);
              const next = new URLSearchParams(searchParams);
              next.set('offset', '0');
              setSearchParams(next);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition whitespace-nowrap border ${
              selectedHouse === chip.house
                ? 'bg-[#121316] text-white border-[#121316] shadow-xs'
                : 'bg-[#FAF8F5] text-[#71717A] border-[#E4E2DC] hover:border-[#121316] hover:text-[#121316]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="cw-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by representative name, constituency, or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-medium text-[#121316] placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32] shadow-2xs min-h-[44px]"
            />
          </form>

          <select
            value={state}
            onChange={(e) => updateParam('state', e.target.value || null)}
            className="px-4 py-2.5 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] shadow-2xs min-h-[44px]"
          >
            <option value="">All 28 States &amp; UTs ({states.length})</option>
            {states.map((s) => (
              <option key={s.state} value={s.state}>
                {s.state} ({s.total_mps} MPs)
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              const next = new URLSearchParams(searchParams);
              next.set('sort_by', sb);
              next.set('sort_order', so);
              next.set('offset', '0');
              setSearchParams(next);
            }}
            className="px-4 py-2.5 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] shadow-2xs min-h-[44px]"
          >
            <option value="allocated_amount-desc">Allocation (High → Low)</option>
            <option value="allocated_amount-asc">Allocation (Low → High)</option>
            <option value="expenditure-desc">Expenditure (High → Low)</option>
            <option value="utilization_pct-desc">Utilization % (High → Low)</option>
            <option value="recommended_works-desc">Works (High → Low)</option>
            <option value="name-asc">Name (A → Z)</option>
          </select>

          {(search || state) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchParams(new URLSearchParams());
              }}
              className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] hover:bg-[#F0EFEA] text-[#71717A] text-xs font-medium transition flex items-center gap-1.5 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Active Filters Pill Bar */}
        {(search || state || selectedHouse !== 'ALL') && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E4E2DC] text-xs text-[#71717A] flex-wrap">
            <span className="text-[10px] font-semibold uppercase font-mono text-[#71717A]">ACTIVE:</span>
            {selectedHouse !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] font-semibold text-[11px] border border-[#E8C5B6]">
                {houseLabel}
              </span>
            )}
            {search && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] font-semibold text-[11px] border border-[#E8C5B6]">
                Search: "{search}"
              </span>
            )}
            {state && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] font-semibold text-[11px] border border-[#E4E2DC]">
                State: {state}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-[#C85A32] hover:text-[#9E3E1C] font-semibold ml-auto flex items-center gap-1 hover:underline text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Results List / Grid */}
      {loading ? (
        <LoadingSkeleton rows={8} height="h-14" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadMps} />
      ) : mps.length === 0 ? (
        <EmptyState
          title="No Parliamentarians Found"
          description="No parliamentary records matched your search or state filter."
          onReset={handleReset}
        />
      ) : viewMode === 'TABLE' ? (
        <div className="space-y-4">
          {/* Mobile Responsive Cards (< md) */}
          <div className="md:hidden space-y-3">
            {mps.map((mp) => (
              <div
                key={mp.internal_mp_id}
                onClick={() => setActiveDossier({ type: 'MP', data: mp })}
                className="cw-card p-4 hover:border-[#C85A32]/40 transition space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]">
                      {mp.house === 'LOK_SABHA' ? 'Lok Sabha' : 'Rajya Sabha'}
                    </span>
                    {mp.party && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] border border-[#E4E2DC]">
                        {mp.party}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#121316]">
                    {mp.utilization_pct?.toFixed(1) || '0.0'}% Utilized
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-14 rounded-xl overflow-hidden bg-[#F0EFEA] border border-[#E4E2DC] shrink-0 flex items-center justify-center">
                    {mp.photo_url ? (
                      <img src={mp.photo_url} alt={mp.mp_name_normalized} className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    ) : (
                      <span className="font-serif font-normal text-[#71717A] text-sm">{mp.mp_name_normalized[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-normal text-[#121316] line-clamp-1">{mp.mp_name_normalized}</h3>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      {mp.constituency_normalized || 'Council of States'}, {mp.state_normalized}
                    </p>
                    {mp.profession && <span className="text-[10px] text-[#71717A] block mt-0.5">{mp.profession}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E4E2DC]">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-mono block">Allocated</span>
                    <span className="text-sm font-semibold font-mono text-[#121316]">
                      ₹{((mp.allocated_amount || 0) / 1e7).toFixed(2)} Cr
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-mono block">Disbursed</span>
                    <span className="text-sm font-semibold font-mono text-[#121316]">
                      ₹{((mp.total_expenditure || 0) / 1e7).toFixed(2)} Cr
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDossier({ type: 'MP', data: mp });
                    }}
                    className="flex-1 cw-btn-secondary text-xs py-2 justify-center"
                  >
                    <span>Quick Preview</span>
                  </button>
                  <Link
                    to={`/mps/${mp.internal_mp_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 cw-btn-primary text-xs py-2 justify-center gap-1.5"
                  >
                    <span>Full Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block bg-[#FAF8F5] rounded-2xl border border-[#E4E2DC] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F0EFEA] border-b border-[#E4E2DC] text-[#71717A] uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Representative</th>
                    <th className="py-3.5 px-4 font-semibold">Party / House</th>
                    <th className="py-3.5 px-4 font-semibold">State / Constituency</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Allocated</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Disbursed</th>
                    <th className="py-3.5 px-4 font-semibold text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>Utilization</span>
                        <HelpTooltip
                          title="MPLADS Entitlement Utilization"
                          text="Percentage of allocated funds drawn down and disbursed towards ground works."
                        />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-right">Works</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]">
                  {mps.map((mp) => (
                    <tr
                      key={mp.internal_mp_id}
                      onClick={() => setActiveDossier({ type: 'MP', data: mp })}
                      className="hover:bg-[#F0EFEA] cursor-pointer transition group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-11 rounded-lg overflow-hidden bg-[#F0EFEA] border border-[#E4E2DC] shrink-0 flex items-center justify-center">
                            {mp.photo_url ? (
                              <img src={mp.photo_url} alt={mp.mp_name_normalized} className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                            ) : (
                              <span className="font-serif font-normal text-[#71717A] text-xs">{mp.mp_name_normalized[0]}</span>
                            )}
                          </div>
                          <div>
                            <Link to={`/mps/${mp.internal_mp_id}`} onClick={(e) => e.stopPropagation()} className="font-serif font-normal text-[#121316] group-hover:text-[#C85A32] transition hover:underline">
                              {mp.mp_name_normalized}
                            </Link>
                            <span className="text-[10px] text-[#71717A] font-mono block">ID: {mp.internal_mp_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {mp.party && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] border border-[#E4E2DC]">
                              {mp.party}
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]">
                            {mp.house === 'LOK_SABHA' ? 'Lok Sabha' : 'Rajya Sabha'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#71717A]">
                        <div className="font-medium text-[#121316]">{mp.state_normalized}</div>
                        <span className="text-[11px] text-[#71717A]">{mp.constituency_normalized || 'Council of States'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#121316] text-right">
                        ₹{((mp.allocated_amount || 0) / 1e7).toFixed(2)} Cr
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#121316] text-right">
                        ₹{((mp.total_expenditure || 0) / 1e7).toFixed(2)} Cr
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-semibold text-[#121316]">
                          {mp.utilization_pct?.toFixed(1) || '0.0'}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-[#71717A]">
                        <span className="text-[#121316] font-semibold">{mp.completed_works_count || 0}</span>
                        <span className="text-[#71717A] text-[10px]"> / {mp.recommended_works_count || 0}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveDossier({ type: 'MP', data: mp })}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] hover:bg-[#F0EFEA] text-[#121316] text-xs font-medium transition"
                            title="Quick Preview"
                          >
                            Preview
                          </button>
                          <Link
                            to={`/mps/${mp.internal_mp_id}`}
                            className="px-3 py-1.5 rounded-lg bg-[#121316] hover:bg-[#C85A32] text-white text-xs font-semibold transition flex items-center gap-1"
                          >
                            <span>Profile</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Cards Grid View (>= md) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mps.map((mp) => (
            <div
              key={mp.internal_mp_id}
              onClick={() => setActiveDossier({ type: 'MP', data: mp })}
              className="cw-card p-5 hover:border-[#C85A32]/40 transition space-y-4 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]">
                  {mp.house === 'LOK_SABHA' ? 'Lok Sabha' : 'Rajya Sabha'}
                </span>
                <span className="text-xs font-mono font-semibold text-[#121316]">
                  {mp.utilization_pct?.toFixed(1) || '0.0'}% Utilized
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-16 rounded-xl overflow-hidden bg-[#F0EFEA] border border-[#E4E2DC] shrink-0 flex items-center justify-center">
                  {mp.photo_url ? (
                    <img src={mp.photo_url} alt={mp.mp_name_normalized} className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  ) : (
                    <span className="font-serif font-normal text-[#71717A] text-base">{mp.mp_name_normalized[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-serif font-normal text-[#121316] line-clamp-1">{mp.mp_name_normalized}</h3>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    {mp.constituency_normalized || 'Council of States'}, {mp.state_normalized}
                  </p>
                  {mp.party && (
                    <span className="text-[10px] font-mono text-[#71717A] block mt-0.5">Party: {mp.party}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#E4E2DC]">
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase font-mono block">Allocated</span>
                  <span className="text-sm font-semibold font-mono text-[#121316]">
                    ₹{((mp.allocated_amount || 0) / 1e7).toFixed(2)} Cr
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase font-mono block">Disbursed</span>
                  <span className="text-sm font-semibold font-mono text-[#121316]">
                    ₹{((mp.total_expenditure || 0) / 1e7).toFixed(2)} Cr
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDossier({ type: 'MP', data: mp });
                  }}
                  className="flex-1 cw-btn-secondary text-xs py-2 justify-center"
                >
                  <span>Quick Preview</span>
                </button>
                <Link
                  to={`/mps/${mp.internal_mp_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 cw-btn-primary text-xs py-2 justify-center gap-1.5"
                >
                  <span>Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Pagination */}
      <Pagination
        total={total}
        limit={limit}
        offset={offset}
        onPageChange={(newOffset) => {
          const next = new URLSearchParams(searchParams);
          next.set('offset', newOffset.toString());
          setSearchParams(next);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Slide-out MP Dossier Drawer */}
      <EntityDossierDrawer entity={activeDossier} onClose={() => setActiveDossier(null)} />
    </div>
  );
};
