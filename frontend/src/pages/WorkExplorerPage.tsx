import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  IndianRupee,
  MapPin,
} from 'lucide-react';
import { api } from '../api/client';
import { Work, StateSummary, WorkCategory, DistrictItem, Constituency } from '../api/types';
import { useHouse } from '../context/HouseContext';
import { useRole } from '../context/RoleContext';
import { formatIndianCurrency, formatIndianNumber } from '../utils/formatters';
import { LifecycleBadge, CategoryBadge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { EntityDossierDrawer, DossierEntity } from '../components/common/EntityDossierDrawer';

export const WorkExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedHouse, houseLabel } = useHouse();
  const { user, currentRole } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();

  const [works, setWorks] = useState<Work[]>([]);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [categories, setCategories] = useState<WorkCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDossier, setActiveDossier] = useState<DossierEntity | null>(null);
  const [statsData, setStatsData] = useState<{ completion_rate_pct: number; total_expenditure: number } | null>(null);

  // Authority Scope Guards
  const isStateLocked = currentRole === 'STATE_NODAL_AUTHORITY' && !!user?.state;
  const isDistrictLocked = currentRole === 'DISTRICT_AUTHORITY' && !!user?.district;

  // URL Query Parameters
  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || (isStateLocked ? user?.state || '' : '');
  const district = searchParams.get('district') || (isDistrictLocked ? user?.district || '' : '');
  const constituency = searchParams.get('constituency') || '';
  const category = searchParams.get('category') || '';
  const lifecycleStatus = searchParams.get('status') || '';
  const sortBy = searchParams.get('sort_by') || 'sanctioned_amount';
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = 50;

  const [searchInput, setSearchInput] = useState(search);

  // Load Primary Macro Dictionaries + Live Stats
  useEffect(() => {
    Promise.all([api.getStates(), api.getCategories(), api.getStats()])
      .then(([statesData, categoriesData, stats]) => {
        setStates(statesData);
        setCategories(categoriesData);
        setStatsData({
          completion_rate_pct: stats?.house_breakdown?.combined?.completion_rate_pct ?? stats?.national_completion_rate_pct ?? 46.62,
          total_expenditure: stats?.total_expenditure ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  // Cascading Load: Districts and Constituencies for selected State
  useEffect(() => {
    if (state) {
      api.getDistricts({ state }).then(setDistricts).catch(() => setDistricts([]));
      api.getConstituencies({ state, limit: 300 }).then(setConstituencies).catch(() => setConstituencies([]));
    } else {
      setDistricts([]);
      setConstituencies([]);
    }
  }, [state]);

  const loadWorks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWorks({
        search: search || undefined,
        state: state || undefined,
        district: district || undefined,
        constituency: constituency || undefined,
        category: category || undefined,
        lifecycle_status: lifecycleStatus || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset,
      });
      setWorks(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load physical works from the public gazette.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorks();
  }, [search, state, district, constituency, category, lifecycleStatus, sortBy, sortOrder, offset]);

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
    const next = new URLSearchParams();
    if (isStateLocked && user?.state) {
      next.set('state', user.state);
    }
    if (isDistrictLocked && user?.district) {
      next.set('district', user.district);
    }
    setSearchParams(next);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#121316] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      <Breadcrumbs items={[{ label: 'Public Works', to: '/works', icon: Layers }]} />

      {/* GetCasework Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4E2DC] pb-6">
        <div>
          <div className="cw-badge-section mb-2">
            § I · PHYSICAL ASSETS REGISTRY
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#121316] tracking-tight">
            Public Works <span className="italic font-normal">Delivery</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-light mt-1">
            Granular statutory registry of 102,437 infrastructure works across all 28 States &amp; 8 UTs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E4E2DC] text-[#121316] text-xs font-mono font-semibold shadow-2xs">
            {formatIndianNumber(total)} Works Tracked
          </span>
        </div>
      </div>

      {/* Bento Summary Metrics (/ 01, / 02, / 03) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cw-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">/ 01 Total Projects</span>
            <span className="text-[10px] font-mono text-[#71717A]">Active Ingested</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-[#121316]">
            {formatIndianNumber(total)}
          </div>
          <div className="text-xs text-[#71717A] mt-1 font-light">
            Sanctioned across Lok Sabha &amp; Rajya Sabha allocations
          </div>
        </div>

        <div className="cw-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">/ 02 Completion SLA</span>
            <span className="text-[10px] font-mono text-[#71717A]">Statutory 18-Mo</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-[#121316]">
            {statsData ? `${statsData.completion_rate_pct.toFixed(1)}%` : '—'}
          </div>
          <div className="text-xs text-[#71717A] mt-1 font-light">
            Works completed within statutory 18-month mandate
          </div>
        </div>

        <div className="cw-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">/ 03 Capital Outlay</span>
            <span className="text-[10px] font-mono text-[#71717A]">Voucher Matched</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-[#121316]">
            {statsData ? formatIndianCurrency(statsData.total_expenditure) : '—'}
          </div>
          <div className="text-xs text-[#71717A] mt-1 font-light">
            Cumulative financial expenditure with double-entry provenance
          </div>
        </div>

      </div>

      {/* Filter Controls */}
      <div className="cw-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search by project name, UID, contractor..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs text-[#121316] placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32] transition min-h-[44px]"
            />
          </form>

          {/* State Filter */}
          <div className="lg:col-span-3">
            <select
              value={state}
              disabled={isStateLocked || isDistrictLocked}
              onChange={(e) => {
                const newState = e.target.value || null;
                const next = new URLSearchParams(searchParams);
                if (newState) next.set('state', newState); else next.delete('state');
                next.delete('district');
                next.delete('constituency');
                next.set('offset', '0');
                setSearchParams(next);
              }}
              className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition min-h-[44px] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <option value="">All States &amp; UTs</option>
              {states.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state} {isStateLocked && s.state.toUpperCase() === user?.state?.toUpperCase() ? '(Mandate Scope)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Cascading District Filter */}
          <div className="lg:col-span-3">
            <select
              value={district}
              disabled={isDistrictLocked || (!state && districts.length === 0)}
              onChange={(e) => updateParam('district', e.target.value || null)}
              className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">{state ? `All Districts in ${state}` : 'Select State for Districts'}</option>
              {districts.map((d) => (
                <option key={d.district_name} value={d.district_name}>
                  {d.district_name} {isDistrictLocked && d.district_name.toUpperCase() === user?.district?.toUpperCase() ? '(Mandate Scope)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Constituency Filter */}
          <div className="lg:col-span-2">
            <select
              value={constituency}
              disabled={!state && constituencies.length === 0}
              onChange={(e) => updateParam('constituency', e.target.value || null)}
              className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">{state ? `All Constituencies` : 'Constituency'}</option>
              {constituencies.map((c) => (
                <option key={c.constituency} value={c.constituency}>
                  {c.constituency}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Category, Lifecycle, Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1 border-t border-[#E4E2DC]/60">
          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value || null)}
              className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition min-h-[44px]"
            >
              <option value="">All Sectors / Categories</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category} ({formatIndianNumber(c.total_works)})
                </option>
              ))}
            </select>
          </div>

          {/* Lifecycle Status Filter */}
          <div>
            <select
              value={lifecycleStatus}
              onChange={(e) => updateParam('status', e.target.value || null)}
              className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition min-h-[44px]"
            >
              <option value="">All Lifecycle Stages</option>
              <option value="FULL_LIFECYCLE_MATCH">Full Lifecycle (Sanctioned + Finished)</option>
              <option value="COMPLETED_ONLY">Completed Only</option>
              <option value="SANCTIONED_ONLY">Sanctioned Only</option>
              <option value="RECOMMENDED_ONLY">Recommended Only</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort_by', e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition min-h-[44px]"
            >
              <option value="sanctioned_amount">Sort by Highest Sanctioned Cost</option>
              <option value="recommendation_date">Sort by Recommendation Date</option>
              <option value="duration_days">Sort by Execution Duration</option>
              <option value="work_id">Sort by Work ID</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(search || state || district || constituency || category || lifecycleStatus) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E4E2DC] text-xs text-[#71717A] flex-wrap">
            <span className="text-[10px] font-semibold uppercase font-mono text-[#71717A]">ACTIVE:</span>
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
            {district && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] font-semibold text-[11px] border border-[#E4E2DC]">
                District: {district}
              </span>
            )}
            {constituency && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] font-semibold text-[11px] border border-[#E4E2DC]">
                Constituency: {constituency}
              </span>
            )}
            {category && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] font-semibold text-[11px] border border-[#E4E2DC]">
                Sector: {category}
              </span>
            )}
            {lifecycleStatus && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] font-semibold text-[11px] border border-[#E4E2DC]">
                Status: {lifecycleStatus}
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

      {/* Results Table */}
      {loading ? (
        <LoadingSkeleton rows={10} height="h-14" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadWorks} />
      ) : works.length === 0 ? (
        <EmptyState
          title="No Works Found"
          description="No physical project records matched your search filters."
          onReset={handleReset}
        />
      ) : (
        <div className="space-y-4">
          {/* Mobile Responsive Cards (< md) */}
          <div className="md:hidden space-y-3">
            {works.map((w) => (
              <div
                key={w.work_id}
                onClick={() => setActiveDossier({ type: 'WORK', data: w })}
                className="cw-card p-4 hover:border-[#C85A32]/40 transition space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge category={w.category_normalized} />
                  <LifecycleBadge status={w.lifecycle_status} />
                </div>

                <div>
                  <h3 className="text-sm font-serif font-normal text-[#121316] line-clamp-2 leading-snug">
                    {w.work_description_normalized || `Project Work #${w.work_id}`}
                  </h3>
                  <span className="text-[10px] text-[#71717A] font-mono">Work ID: #{w.work_id}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#71717A] pt-2 border-t border-[#E4E2DC]">
                  <div>
                    <span className="block font-medium text-[#121316]">{w.constituency_normalized || 'Constituency'}, {w.state_normalized}</span>
                    <span className="text-[10px] text-[#71717A]">MP: {w.mp_name_normalized}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#71717A] uppercase block font-mono">Cost</span>
                    <span className="font-mono font-semibold text-[#121316] text-sm">
                      {formatIndianCurrency(w.sanctioned_amount || w.recommended_amount || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDossier({ type: 'WORK', data: w });
                    }}
                    className="flex-1 cw-btn-secondary text-xs py-2 justify-center"
                  >
                    <span>Quick Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/works/${w.work_id}`);
                    }}
                    className="flex-1 cw-btn-primary text-xs py-2 justify-center gap-1.5"
                  >
                    <span>Full Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
                    <th className="py-3.5 px-4 font-semibold">Project / Description</th>
                    <th className="py-3.5 px-4 font-semibold">Sector</th>
                    <th className="py-3.5 px-4 font-semibold">Location / MP</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Sanctioned Cost</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]">
                  {works.map((w) => (
                    <tr
                      key={w.work_id}
                      onClick={() => setActiveDossier({ type: 'WORK', data: w })}
                      className="hover:bg-[#F0EFEA] cursor-pointer transition group"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          to={`/works/${w.work_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-serif font-normal text-[#121316] group-hover:text-[#C85A32] line-clamp-2 transition hover:underline"
                        >
                          {w.work_description_normalized || `Project Work #${w.work_id}`}
                        </Link>
                        <span className="text-[10px] text-[#71717A] font-mono">UID: #{w.work_id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <CategoryBadge category={w.category_normalized} />
                      </td>
                      <td className="py-3.5 px-4 text-[#71717A]">
                        <div className="font-medium text-[#121316]">{w.constituency_normalized || 'Constituency'}, {w.state_normalized}</div>
                        <span className="text-[10px] text-[#71717A] block">MP: {w.mp_name_normalized}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#121316] text-right whitespace-nowrap">
                        {formatIndianCurrency(w.sanctioned_amount || w.recommended_amount || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <LifecycleBadge status={w.lifecycle_status} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveDossier({ type: 'WORK', data: w })}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] hover:bg-[#F0EFEA] text-[#121316] text-xs font-medium transition"
                            title="Quick Preview"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/works/${w.work_id}`)}
                            className="px-3 py-1.5 rounded-lg bg-[#121316] hover:bg-[#C85A32] text-white text-xs font-semibold transition flex items-center gap-1"
                          >
                            <span>Dossier</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
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

      {/* Slide-out Work Dossier */}
      <EntityDossierDrawer entity={activeDossier} onClose={() => setActiveDossier(null)} />
    </div>
  );
};
