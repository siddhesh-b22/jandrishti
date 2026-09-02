import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Building2,
  RotateCcw,
  Percent,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  MapPin,
  Receipt,
  Layers,
  X,
  ExternalLink,
  Users,
  Activity,
} from 'lucide-react';
import { api } from '../api/client';
import { Vendor, StateSummary } from '../api/types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const VendorExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Query Parameters
  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || '';
  const sortBy = searchParams.get('sort_by') || 'total_received_amount';
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = 50;

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    api.getStates()
      .then(setStates)
      .catch(() => {});
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getVendors({
        search: search || undefined,
        state: state || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset,
      });
      setVendors(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load contractor intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [search, state, sortBy, sortOrder, offset]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-[#0F172A] font-sans pb-20">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Contractors', to: '/vendors', icon: Building2 }]} />

      {/* 2. Editorial Header Banner & KPI Strip */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest block">
              CONTRACTOR PROCUREMENT INTELLIGENCE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              Executing Contractors
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-normal">
              Procurement footprint, transaction concentration, and single-patron reliance across 22,377 contractors nationwide.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 shadow-xs">
              {total.toLocaleString()} Contractors
            </span>
          </div>
        </div>

        {/* 4-KPI Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Contractors</span>
            <strong className="text-lg font-black font-mono text-slate-900">22,377</strong>
            <span className="text-[11px] text-slate-500 block">Registered Entities</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Capital Executed</span>
            <strong className="text-lg font-black font-mono text-emerald-600">₹3,947.25 Cr</strong>
            <span className="text-[11px] text-slate-500 block">Disbursed Funds</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Vouchers</span>
            <strong className="text-lg font-black font-mono text-blue-600">82,296</strong>
            <span className="text-[11px] text-slate-500 block">Treasury Records</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">High Reliance</span>
              <HelpTooltip
                title="Single-Patron Reliance"
                text="Proportion of a contractor's total MPLADS income originating from a single parliamentary constituency. High percentages flag lack of contractor diversification."
              />
            </div>
            <strong className="text-lg font-black font-mono text-amber-600">Single-Patron</strong>
            <span className="text-[11px] text-slate-500 block">≥85% Concentration</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vendor name, GSTIN, or city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition min-h-[44px]"
            />
          </form>

          {/* State Filter */}
          <div className="sm:col-span-4">
            <select
              value={state}
              onChange={(e) => updateParam('state', e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition"
            >
              <option value="">All States ({states.length})</option>
              {states.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-3">
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition"
            >
              <option value="total_received_amount-desc">Revenue (High → Low)</option>
              <option value="total_received_amount-asc">Revenue (Low → High)</option>
              <option value="single_mp_reliance_pct-desc">Reliance % (High → Low)</option>
              <option value="total_transaction_count-desc">Disbursements (High → Low)</option>
            </select>
          </div>
        </div>

        {(search || state) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="text-[10px] font-bold uppercase font-mono text-slate-400">ACTIVE FILTERS:</span>
            {search && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[11px]">
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

      {/* 4. High-Density Procurement Table */}
      {loading ? (
        <LoadingSkeleton rows={10} height="h-16" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadVendors} />
      ) : vendors.length === 0 ? (
        <EmptyState
          title="No Contractors Found"
          description="No contractor records matched your query or filter parameters."
          onReset={handleReset}
        />
      ) : (
        <div className="space-y-4 font-manrope">
          {/* Mobile Responsive Cards (< md) */}
          <div className="md:hidden space-y-3">
            {vendors.map((v) => {
              const reliancePct = v.single_mp_reliance_pct || 0;
              const isHighReliance = reliancePct >= 85;

              return (
                <div
                  key={v.internal_vendor_id}
                  onClick={() => setSelectedVendor(v)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition space-y-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">Vendor #{v.internal_vendor_id}</span>
                    <span className="text-xs font-medium text-slate-600">{v.primary_state || 'National Scope'}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {v.vendor_name_normalized}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Cumulative Revenue</span>
                      <span className="text-sm font-black font-mono text-emerald-700">
                        ₹{(v.total_received_amount / 1e7).toFixed(2)} Cr
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Disbursements</span>
                      <span className="text-sm font-bold font-mono text-slate-800">
                        {v.total_transaction_count.toLocaleString()} vouchers
                      </span>
                    </div>
                  </div>

                  {/* Reliance Progress Meter */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Single-Patron Reliance:</span>
                      <span className="font-mono font-bold text-slate-900">{reliancePct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, reliancePct)}%` }}
                        className={`h-full rounded-full ${
                          isHighReliance ? 'bg-rose-500' : reliancePct >= 50 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVendor(v);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#2563EB] hover:text-white text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <span>Inspect Contractor Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[240px]">Contractor / Agency</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Primary Territory</th>
                    <th className="py-3.5 px-4 text-right min-w-[140px]">Cumulative Revenue</th>
                    <th className="py-3.5 px-4 text-center min-w-[110px]">Disbursements</th>
                    <th className="py-3.5 px-4 min-w-[200px]">
                      <div className="flex items-center gap-1">
                        <span>Single-Patron Reliance Index</span>
                        <HelpTooltip
                          title="Single-Patron Reliance"
                          text="Percentage of contracts won from one MP or district. Over 85% flags potential concentration."
                        />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map((v) => {
                    const reliancePct = v.single_mp_reliance_pct || 0;
                    const isHighReliance = reliancePct >= 85;

                    return (
                      <tr
                        key={v.internal_vendor_id}
                        onClick={() => setSelectedVendor(v)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                      >
                        {/* Vendor Name */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition">
                            {v.vendor_name_normalized}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                            Vendor ID: {v.internal_vendor_id}
                          </div>
                        </td>

                        {/* State */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {v.primary_state || 'National Scope'}
                        </td>

                        {/* Total Received Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          <div className="text-sm text-emerald-700">₹{(v.total_received_amount / 1e7).toFixed(2)} Cr</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            ₹{(v.total_received_amount / 1e5).toFixed(2)} Lakh
                          </div>
                        </td>

                        {/* Transactions Count */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-700 tabular-nums font-bold">
                          {v.total_transaction_count.toLocaleString()}
                        </td>

                        {/* Single-Patron Reliance Meter (0% ──────── 100%) */}
                        <td className="py-3.5 px-4 min-w-[200px]">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                {reliancePct.toFixed(1)}% Reliance
                              </span>
                              {isHighReliance && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                  High Concentration
                                </span>
                              )}
                            </div>

                            {/* Meter Bar */}
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, reliancePct)}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isHighReliance
                                    ? 'bg-rose-500'
                                    : reliancePct >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-blue-600'
                                }`}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white font-bold text-xs inline-flex items-center gap-1 transition">
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
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
        </div>
      )}

      {/* 5. Slide-In Contractor Dossier Drawer */}
      <AnimatePresence>
        {selectedVendor && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVendor(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white shadow-2xl z-10 flex flex-col h-full border-l border-slate-200"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">
                    CONTRACTOR DOSSIER #{selectedVendor.internal_vendor_id}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 font-display truncate max-w-xs">
                    {selectedVendor.vendor_name_normalized}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVendor(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {/* Revenue Summary */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                    CUMULATIVE PUBLIC REVENUE
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-700">
                    ₹{(selectedVendor.total_received_amount / 1e7).toFixed(2)} Cr
                  </div>
                  <div className="text-xs font-mono text-slate-500 pt-0.5">
                    {selectedVendor.total_transaction_count.toLocaleString()} Recorded Treasury Disbursements
                  </div>
                </div>

                {/* Concentration Risk Meter Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      SINGLE-PATRON RELIANCE
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {(selectedVendor.single_mp_reliance_pct || 0).toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, selectedVendor.single_mp_reliance_pct || 0)}%` }}
                      className={`h-full rounded-full ${
                        (selectedVendor.single_mp_reliance_pct || 0) >= 85
                          ? 'bg-rose-500'
                          : (selectedVendor.single_mp_reliance_pct || 0) >= 50
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {(selectedVendor.single_mp_reliance_pct || 0) >= 85
                      ? 'High single-representative concentration: over 85% of this contractor’s public disbursements originate from a single parliamentary patron.'
                      : 'Diversified procurement footprint across multiple parliamentary allocations and implementing districts.'}
                  </p>
                </div>

                {/* Direct Action Link to Vouchers */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 block font-bold text-xs">View Line-Item Vouchers</strong>
                    <span className="text-[11px] text-slate-600">Inspect all {selectedVendor.total_transaction_count} disbursements</span>
                  </div>
                  <Link
                    to={`/transactions?search=${encodeURIComponent(selectedVendor.vendor_name_normalized)}`}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                  >
                    <span>Open Vouchers</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-900 text-xs font-mono font-medium">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Verified MoSPI &amp; eSAKSHI Public Contractor Record</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
