import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { Work, StateSummary, WorkCategory } from '../api/types';
import { useHouse } from '../context/HouseContext';
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [works, setWorks] = useState<Work[]>([]);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [categories, setCategories] = useState<WorkCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDossier, setActiveDossier] = useState<DossierEntity | null>(null);

  // URL Query Parameters
  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || '';
  const category = searchParams.get('category') || '';
  const lifecycleStatus = searchParams.get('status') || '';
  const sortBy = searchParams.get('sort_by') || 'sanctioned_amount';
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = 50;

  const [searchInput, setSearchInput] = useState(search);

  // Load Filter Options
  useEffect(() => {
    Promise.all([api.getStates(), api.getCategories()])
      .then(([statesData, categoriesData]) => {
        setStates(statesData);
        setCategories(categoriesData);
      })
      .catch(() => {});
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWorks({
        search: search || undefined,
        state: state || undefined,
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
      setError(err.message || 'Failed to load physical works');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorks();
  }, [search, state, category, lifecycleStatus, sortBy, sortOrder, offset]);

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
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: 'Physical Works', to: '/works', icon: Layers }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
            PHYSICAL ASSETS REGISTRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            Public Works Delivery
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Granular registry of 102,437 physical infrastructure works across all 28 States &amp; 8 UTs.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold self-start sm:self-auto">
          {total.toLocaleString()} Works
        </span>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search works, description, ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            />
          </form>

          {/* State Filter */}
          <div className="lg:col-span-3">
            <select
              value={state}
              onChange={(e) => updateParam('state', e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            >
              <option value="">All States &amp; UTs</option>
              {states.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            >
              <option value="">All Sectors / Categories</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category} ({c.total_works.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Lifecycle Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={lifecycleStatus}
              onChange={(e) => updateParam('status', e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="RECOMMENDED">Recommended</option>
              <option value="SANCTIONED">Sanctioned</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(search || state || category || lifecycleStatus) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex-wrap">
            <span className="text-[10px] font-bold uppercase font-mono text-slate-400">ACTIVE:</span>
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
            {category && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                Sector: {category}
              </span>
            )}
            {lifecycleStatus && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                Status: {lifecycleStatus}
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Project / Description</th>
                  <th className="py-3 px-4 font-bold">Sector</th>
                  <th className="py-3 px-4 font-bold">Location / MP</th>
                  <th className="py-3 px-4 font-bold text-right">Sanctioned Cost</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {works.map((w) => (
                  <tr
                    key={w.work_id}
                    onClick={() => setActiveDossier({ type: 'WORK', data: w })}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-2">
                        {w.work_description_normalized || `Project Work #${w.work_id}`}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {w.work_id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <CategoryBadge category={w.category_normalized} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium">{w.constituency_normalized || 'Constituency'}, {w.state_normalized}</div>
                      <span className="text-[10px] text-slate-500 block">MP: {w.mp_name_normalized}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right">
                      ₹{((w.sanctioned_amount || w.recommended_amount || 0) / 1e5).toFixed(2)} L
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <LifecycleBadge status={w.lifecycle_status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDossier({ type: 'WORK', data: w });
                        }}
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
