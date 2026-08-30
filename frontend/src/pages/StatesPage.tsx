import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Search,
  ChevronRight,
  Map as MapIcon,
  TableProperties,
  Landmark,
  ArrowRight,
  Layers,
  Users,
  IndianRupee,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import { StateSummary, StatsResponse } from '../api/types';
import { useHouse } from '../context/HouseContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { IndiaParliamentaryMap } from '../components/map/IndiaParliamentaryMap';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { EntityDossierDrawer, DossierEntity } from '../components/common/EntityDossierDrawer';

export const StatesPage: React.FC = () => {
  const { selectedHouse } = useHouse();
  const [searchParams, setSearchParams] = useSearchParams();

  const [states, setStates] = useState<StateSummary[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'MAP' | 'TABLE'>('MAP');
  const [activeDossier, setActiveDossier] = useState<DossierEntity | null>(null);

  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);

  const loadStates = async () => {
    try {
      setLoading(true);
      setError(null);
      const houseParam = selectedHouse === 'ALL' ? undefined : selectedHouse;
      const [statesData, statsData] = await Promise.all([
        api.getStates({ house: houseParam }),
        api.getStats({ house: houseParam }),
      ]);
      setStates(statesData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load state analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, [selectedHouse]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set('search', searchInput.trim());
    else next.delete('search');
    setSearchParams(next);
  };

  const filteredStates = states.filter((s) =>
    s.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-[#08102B] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-manrope">
      <Breadcrumbs items={[{ label: 'National Spatial Atlas', to: '/states', icon: MapPin }]} />

      {/* Alluxi Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB] block mb-1">
            28 STATES &amp; 8 UNION TERRITORIES
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#08102B] tracking-tight">
            National Spatial Atlas
          </h1>
          <p className="text-sm text-slate-600 font-light mt-1">
            Macro-level fiscal velocity and ground implementation comparisons across all 28 States and 8 Union Territories.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('MAP')}
            className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 ${
              viewMode === 'MAP' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Interactive Map</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 ${
              viewMode === 'TABLE' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>Comparative Table</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton rows={3} height="h-28" />
          <LoadingSkeleton rows={4} height="h-28" />
        </div>
      ) : error ? (
        <ErrorDisplay message={error} onRetry={() => loadStates()} />
      ) : (
        <>
          {viewMode === 'MAP' ? (
            <div className="bg-white rounded-3xl p-4 md:p-6 shadow-3xl border border-slate-200/80">
              <IndiaParliamentaryMap
                states={states}
                stats={stats}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Filter by State or Union Territory..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] shadow-xs"
                  />
                </form>
                <div className="text-xs text-slate-500 font-bold">
                  Showing <strong className="text-[#08102B] font-mono">{filteredStates.length}</strong> of 36 Territories
                </div>
              </div>

              {/* States Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStates.map((st) => (
                  <div
                    key={st.state}
                    className="rounded-3xl bg-white p-6 shadow-3xl hover:shadow-4xl transition-all duration-300 border border-slate-200/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Territory
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          {st.total_mps} MPs
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-[#08102B] mb-4">
                        {st.state}
                      </h3>

                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium">Allocated:</span>
                          <p className="font-mono font-bold text-slate-900 mt-0.5">
                            ₹{(st.total_allocated_amount / 10000000).toFixed(2)} Cr
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Disbursed:</span>
                          <p className="font-mono font-bold text-slate-900 mt-0.5">
                            ₹{(st.total_expenditure / 10000000).toFixed(2)} Cr
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Utilization:</span>
                          <p className="font-mono font-bold text-emerald-600 mt-0.5">
                            {st.state_utilization_pct.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Delivered:</span>
                          <p className="font-mono font-bold text-slate-900 mt-0.5">
                            {st.total_completed_works.toLocaleString()} / {st.total_recommended_works.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDossier({
                            type: 'STATE',
                            data: st,
                          })
                        }
                        className="text-xs font-bold text-[#2563EB] hover:underline"
                      >
                        View State Dossier
                      </button>

                      <Link
                        to={`/mps?state=${encodeURIComponent(st.state)}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#2563EB] transition"
                      >
                        <span>Explore MPs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Entity Dossier Drawer */}
      <EntityDossierDrawer
        entity={activeDossier}
        onClose={() => setActiveDossier(null)}
      />
    </div>
  );
};
