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
    <div className="space-y-6 animate-fade-in text-[#0F172A] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: 'National Atlas', to: '/states', icon: MapPin }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
            28 STATES &amp; 8 UNION TERRITORIES
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            National Spatial Atlas
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Macro-level fiscal velocity and implementation comparisons across all 28 States and 8 Union Territories.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('MAP')}
            className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${
              viewMode === 'MAP' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Atlas Map</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${
              viewMode === 'TABLE' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>State Ledger</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} height="h-20" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadStates} />
      ) : viewMode === 'MAP' ? (
        <div className="space-y-6">
          <IndiaParliamentaryMap states={states} stats={stats} />
        </div>
      ) : (
        /* High-Density State Table */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search state..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
              />
            </form>
            <span className="text-xs font-mono text-slate-500 font-bold">
              {filteredStates.length} Territories
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">State / UT</th>
                    <th className="py-3 px-4 font-bold text-center">MPs</th>
                    <th className="py-3 px-4 font-bold text-right">Allocated</th>
                    <th className="py-3 px-4 font-bold text-right">Disbursed</th>
                    <th className="py-3 px-4 font-bold text-center">Utilization</th>
                    <th className="py-3 px-4 font-bold text-right">Proposed Works</th>
                    <th className="py-3 px-4 font-bold text-right">Completed Works</th>
                    <th className="py-3 px-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStates.map((s) => (
                    <tr
                      key={s.state}
                      onClick={() => setActiveDossier({ type: 'STATE', data: s })}
                      className="hover:bg-blue-50/40 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.state}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">{s.total_mps}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right">
                        ₹{(s.total_allocated_amount / 1e7).toFixed(2)} Cr
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-right">
                        ₹{(s.total_expenditure / 1e7).toFixed(2)} Cr
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {s.state_utilization_pct.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-slate-600">
                        {s.total_recommended_works.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-right">
                        {s.total_completed_works.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDossier({ type: 'STATE', data: s });
                          }}
                          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition"
                        >
                          Dossier →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out State Dossier */}
      <EntityDossierDrawer entity={activeDossier} onClose={() => setActiveDossier(null)} />
    </div>
  );
};
