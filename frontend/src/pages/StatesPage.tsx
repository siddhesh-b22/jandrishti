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
import defaultStatesData from '../data/defaultStatesData.json';

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
        api.getStates({ house: houseParam }).catch(() => (defaultStatesData as unknown as StateSummary[])),
        api.getStats({ house: houseParam }).catch(() => null),
      ]);
      const validStates = statesData && statesData.length > 0
        ? statesData
        : (defaultStatesData as unknown as StateSummary[]);
      setStates(validStates);
      setStats(statsData);
    } catch (err: any) {
      console.warn('StatesPage: error loading states, using offline fallback', err);
      setStates(defaultStatesData as unknown as StateSummary[]);
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
    <div className="space-y-8 text-[#121316] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans pb-24">
      <Breadcrumbs items={[{ label: 'National Spatial Atlas', to: '/states', icon: MapPin }]} />

      {/* Editorial Header */}
      <div className="space-y-4 border-b border-[#E4E2DC] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="cw-badge-section">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
              § VII · NATIONAL SPATIAL DISPARITY ATLAS
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#121316]">
              National Spatial Atlas &amp; <em className="font-serif italic font-normal text-[#C85A32]">Territorial Velocity</em>
            </h1>
            <p className="text-sm sm:text-base text-[#6E706E] max-w-2xl leading-relaxed font-normal">
              Macro-level fiscal velocity and ground implementation comparisons across all 28 States and 8 Union Territories.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#FAF8F5] border border-[#E4E2DC] text-xs font-medium shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                viewMode === 'MAP' ? 'bg-[#121316] text-[#FAF8F5] shadow-xs' : 'text-[#6E706E] hover:text-[#121316]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                viewMode === 'TABLE' ? 'bg-[#121316] text-[#FAF8F5] shadow-xs' : 'text-[#6E706E] hover:text-[#121316]'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Territory Index</span>
            </button>
          </div>
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
            <div className="bg-[#FAF8F5] rounded-2xl p-4 md:p-6 border border-[#E4E2DC]">
              <IndiaParliamentaryMap
                states={states}
                stats={stats}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC]">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
                  <Search className="w-4 h-4 text-[#6E706E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Filter by State or Union Territory..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E4E2DC] bg-white text-xs font-medium text-[#121316] placeholder-[#6E706E] focus:outline-none focus:border-[#121316]"
                  />
                </form>
                <div className="text-xs text-[#6E706E] font-mono">
                  Showing <strong className="text-[#121316]">{filteredStates.length}</strong> of 36 Territories
                </div>
              </div>

              {/* States Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStates.map((st) => (
                  <div
                    key={st.state}
                    className="rounded-2xl bg-[#FAF8F5] p-6 border border-[#E4E2DC] hover:border-[#121316] transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase tracking-wider">
                          / TERRITORY
                        </span>
                        <span className="text-xs font-mono font-medium text-[#C85A32] bg-[#FAF0EB] px-2.5 py-0.5 rounded-full border border-[#C85A32]/20">
                          {st.total_mps} MPs
                        </span>
                      </div>

                      <h3 className="font-serif text-xl font-medium text-[#121316] mb-4">
                        {st.state}
                      </h3>

                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E4E2DC] text-xs">
                        <div>
                          <span className="text-[#6E706E] font-mono text-[11px] block">Allocated</span>
                          <p className="font-mono font-medium text-[#121316] mt-0.5">
                            ₹{(st.total_allocated_amount / 10000000).toFixed(2)} Cr
                          </p>
                        </div>
                        <div>
                          <span className="text-[#6E706E] font-mono text-[11px] block">Disbursed</span>
                          <p className="font-mono font-medium text-[#121316] mt-0.5">
                            ₹{(st.total_expenditure / 10000000).toFixed(2)} Cr
                          </p>
                        </div>
                        <div>
                          <span className="text-[#6E706E] font-mono text-[11px] block">Utilization</span>
                          <p className="font-mono font-medium text-[#2E7D32] mt-0.5">
                            {st.state_utilization_pct.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-[#6E706E] font-mono text-[11px] block">Completion</span>
                          <p className="font-mono font-medium text-[#121316] mt-0.5">
                            {st.total_completed_works.toLocaleString()} / {st.total_recommended_works.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDossier({
                            type: 'STATE',
                            data: st,
                          })
                        }
                        className="text-[#C85A32] hover:underline font-medium"
                      >
                        View State Dossier
                      </button>

                      <Link
                        to={`/mps?state=${encodeURIComponent(st.state)}`}
                        className="inline-flex items-center gap-1 text-[#121316] hover:text-[#C85A32] font-medium transition"
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
