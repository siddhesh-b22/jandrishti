import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    <div className="space-y-8 animate-fade-in text-[#08102B] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-manrope">
      <Breadcrumbs items={[{ label: 'Parliamentary Directory', to: '/mps', icon: Users }]} />

      {/* Alluxi Modern Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB] block mb-1">
            PARLIAMENTARY DIRECTORY · {selectedHouse === 'ALL' ? '778 MEMBERS' : selectedHouse === 'LOK_SABHA' ? '543 LOK SABHA' : '235 RAJYA SABHA'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#08102B] tracking-tight">
            Parliamentary Representatives
          </h1>
          <p className="text-sm text-slate-600 font-light mt-1">
            Statutory allocation balances, expenditure tracking, and ground project recommendations for all 778 Parliamentarians.
          </p>
        </div>

        {/* View Mode & Chamber Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                viewMode === 'TABLE' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Ledger Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                viewMode === 'CARDS' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar (Alluxi Rounded Capsule) */}
      <div className="bg-white rounded-3xl p-5 shadow-3xl border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by representative name, constituency, or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] shadow-xs min-h-[44px]"
            />
          </form>

          <select
            value={state}
            onChange={(e) => updateParam('state', e.target.value || null)}
            className="px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 shadow-xs"
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
            className="px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 shadow-xs"
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
              className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Active Filters Pill Bar */}
        {(search || state || selectedHouse !== 'ALL') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex-wrap">
            <span className="text-[10px] font-bold uppercase font-mono text-slate-400">ACTIVE:</span>
            {selectedHouse !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                {houseLabel}
              </span>
            )}
            {search && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                Search: "{search}"
              </span>
            )}
            {state && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                State: {state}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-800 font-bold ml-auto flex items-center gap-1 hover:underline text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Results List / Grid */}
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
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    mp.house === 'LOK_SABHA' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {mp.house === 'LOK_SABHA' ? 'Lok Sabha' : 'Rajya Sabha'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {mp.utilization_pct?.toFixed(1) || '0.0'}% Utilized
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{mp.mp_name_normalized}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {mp.constituency_normalized || 'Council of States'}, {mp.state_normalized}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Allocated</span>
                    <span className="text-sm font-black font-mono text-slate-900">
                      ₹{((mp.allocated_amount || 0) / 1e7).toFixed(2)} Cr
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Disbursed</span>
                    <span className="text-sm font-black font-mono text-emerald-600">
                      ₹{((mp.total_expenditure || 0) / 1e7).toFixed(2)} Cr
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDossier({ type: 'MP', data: mp });
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#2563EB] hover:text-white text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <span>Inspect Representative Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">Representative</th>
                    <th className="py-3 px-4 font-bold">House / Constituency</th>
                    <th className="py-3 px-4 font-bold">State</th>
                    <th className="py-3 px-4 font-bold text-right">Allocated</th>
                    <th className="py-3 px-4 font-bold text-right">Disbursed</th>
                    <th className="py-3 px-4 font-bold text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>Utilization</span>
                        <HelpTooltip
                          title="MPLADS Entitlement Utilization"
                          text="Percentage of allocated funds drawn down and disbursed towards ground works."
                        />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-bold text-right">Works</th>
                    <th className="py-3 px-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100">
                {mps.map((mp) => (
                  <tr
                    key={mp.internal_mp_id}
                    onClick={() => setActiveDossier({ type: 'MP', data: mp })}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{mp.mp_name_normalized}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{mp.internal_mp_id}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium">{mp.constituency_normalized || 'Council of States'}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        mp.house === 'LOK_SABHA' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {mp.house === 'LOK_SABHA' ? 'Lok Sabha' : 'Rajya Sabha'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{mp.state_normalized}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right">
                      ₹{((mp.allocated_amount || 0) / 1e7).toFixed(2)} Cr
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-right">
                      ₹{((mp.total_expenditure || 0) / 1e7).toFixed(2)} Cr
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-slate-800">
                        {mp.utilization_pct?.toFixed(1) || '0.0'}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-700">
                      <span className="text-slate-900 font-bold">{mp.completed_works_count || 0}</span>
                      <span className="text-slate-400 text-[10px]"> / {mp.recommended_works_count || 0}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDossier({ type: 'MP', data: mp });
                        }}
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      ) : (
        /* Compact Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mps.map((mp) => (
            <div
              key={mp.internal_mp_id}
              onClick={() => setActiveDossier({ type: 'MP', data: mp })}
              className="card-executive p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 hover:border-blue-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    mp.house === 'LOK_SABHA' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {mp.house === 'LOK_SABHA' ? '18th Lok Sabha' : 'Rajya Sabha'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{mp.internal_mp_id}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">{mp.mp_name_normalized}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {mp.constituency_normalized ? `${mp.constituency_normalized}, ` : ''}{mp.state_normalized}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Allocated:</span>
                  <strong className="text-slate-900">₹{((mp.allocated_amount || 0) / 1e7).toFixed(2)} Cr</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Disbursed:</span>
                  <strong className="text-emerald-600">₹{((mp.total_expenditure || 0) / 1e7).toFixed(2)} Cr</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Works Built:</span>
                  <strong className="text-slate-900">{mp.completed_works_count || 0} / {mp.recommended_works_count || 0}</strong>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <span>View MP Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
