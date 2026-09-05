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
import { Vendor, VendorDetail, StateSummary } from '../api/types';
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
  const [selectedVendorDetail, setSelectedVendorDetail] = useState<VendorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load detailed transactions when vendor is selected
  useEffect(() => {
    if (!selectedVendor) {
      setSelectedVendorDetail(null);
      return;
    }
    setDetailLoading(true);
    api.getVendorDetail(selectedVendor.internal_vendor_id)
      .then(setSelectedVendorDetail)
      .catch((err) => console.error('Failed to load vendor detail:', err))
      .finally(() => setDetailLoading(false));
  }, [selectedVendor]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#121316] font-sans pb-24">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Contractor Registry', to: '/vendors', icon: Building2 }]} />

      {/* 2. Editorial Header Banner & Bento Metric Strip */}
      <div className="space-y-4 border-b border-[#E4E2DC] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="cw-badge-section">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
              § V · CONTRACTOR &amp; VENDOR REGISTRY
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#121316]">
              Executing Contractors &amp; <em className="font-serif italic font-normal text-[#C85A32]">Procurement Footprint</em>
            </h1>
            <p className="text-sm sm:text-base text-[#6E706E] max-w-2xl leading-relaxed font-normal">
              Procurement footprint, transaction concentration, and single-patron reliance across 22,377 contractors nationwide.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E4E2DC] text-xs font-mono font-medium text-[#121316] shadow-xs">
              {total.toLocaleString()} Verified Entities
            </span>
          </div>
        </div>

        {/* 4-Bento Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 01 CONTRACTORS</span>
            <strong className="text-lg sm:text-xl font-medium font-serif text-[#121316] block">22,377</strong>
            <span className="text-xs text-[#6E706E] block font-mono">Registered Entities</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 02 CAPITAL OUTLAY</span>
            <strong className="text-lg sm:text-xl font-medium font-serif text-[#121316] block">₹3,947.25 Cr</strong>
            <span className="text-xs text-[#2E7D32] block font-mono">Disbursed Outflow</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 03 TREASURY VOUCHERS</span>
            <strong className="text-lg sm:text-xl font-medium font-serif text-[#121316] block">82,296</strong>
            <span className="text-xs text-[#6E706E] block font-mono">Reconciled Lines</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 04 CONCENTRATION</span>
              <HelpTooltip
                title="Single-Patron Reliance"
                text="Proportion of a contractor's total MPLADS income originating from a single parliamentary constituency. High percentages flag lack of contractor diversification."
              />
            </div>
            <strong className="text-lg sm:text-xl font-medium font-serif text-[#C85A32] block">Single-Patron</strong>
            <span className="text-xs text-[#6E706E] block font-mono">≥85% Threshold</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E706E]" />
            <input
              type="text"
              placeholder="Search by vendor name, GSTIN, or city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E2DC] rounded-xl text-xs text-[#121316] placeholder-[#6E706E] focus:outline-none focus:border-[#121316] transition min-h-[40px]"
            />
          </form>

          {/* State Filter */}
          <div className="sm:col-span-4">
            <select
              value={state}
              onChange={(e) => updateParam('state', e.target.value || null)}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:border-[#121316] transition min-h-[40px]"
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
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:border-[#121316] transition min-h-[40px]"
            >
              <option value="total_received_amount-desc">Revenue (High → Low)</option>
              <option value="total_received_amount-asc">Revenue (Low → High)</option>
              <option value="single_mp_reliance_pct-desc">Reliance % (High → Low)</option>
              <option value="total_transaction_count-desc">Disbursements (High → Low)</option>
            </select>
          </div>
        </div>

        {(search || state) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E4E2DC] text-xs text-[#6E706E]">
            <span className="text-[10px] font-semibold uppercase font-mono text-[#6E706E]">ACTIVE FILTERS:</span>
            {search && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] font-mono text-[11px] border border-[#C85A32]/20">
                Search: "{search}"
              </span>
            )}
            {state && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] font-mono text-[11px] border border-[#E4E2DC]">
                State: {state}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-[#C85A32] hover:underline font-medium ml-auto flex items-center gap-1 text-[11px]"
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
        <div className="space-y-4">
          {/* Mobile Responsive Cards (< md) */}
          <div className="md:hidden space-y-3">
            {vendors.map((v) => {
              const reliancePct = v.single_mp_reliance_pct || 0;
              const isHighReliance = reliancePct >= 85;

              return (
                <div
                  key={v.internal_vendor_id}
                  onClick={() => setSelectedVendor(v)}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] hover:border-[#121316] transition space-y-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#6E706E]">Vendor #{v.internal_vendor_id}</span>
                    <span className="text-xs font-mono text-[#6E706E]">{v.primary_state || 'National Scope'}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#121316] line-clamp-1">
                      {v.vendor_name_normalized}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E4E2DC]">
                    <div>
                      <span className="text-[10px] text-[#6E706E] uppercase font-mono block">Cumulative Revenue</span>
                      <span className="text-sm font-bold font-mono text-[#121316]">
                        ₹{(v.total_received_amount / 1e7).toFixed(2)} Cr
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6E706E] uppercase font-mono block">Disbursements</span>
                      <span className="text-sm font-medium font-mono text-[#6E706E]">
                        {v.total_transaction_count.toLocaleString()} vouchers
                      </span>
                    </div>
                  </div>

                  {/* Reliance Progress Meter */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6E706E]">Single-Patron Reliance:</span>
                      <span className="font-mono font-medium text-[#121316]">{reliancePct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#E4E2DC] overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, reliancePct)}%` }}
                        className={`h-full rounded-full ${
                          isHighReliance ? 'bg-[#C85A32]' : reliancePct >= 50 ? 'bg-[#B25E00]' : 'bg-[#121316]'
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
                    className="w-full py-2 rounded-xl bg-white border border-[#E4E2DC] hover:bg-[#F0EFEA] text-[#121316] text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Contractor Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E706E]" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F0EFEA] text-[#6E706E] font-mono font-medium uppercase tracking-wider text-[10px] border-b border-[#E4E2DC] sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4 min-w-[240px]">Contractor / Agency</th>
                    <th className="py-3 px-4 min-w-[150px]">Primary Territory</th>
                    <th className="py-3 px-4 text-right min-w-[140px]">Cumulative Outlay</th>
                    <th className="py-3 px-4 text-center min-w-[110px]">Disbursements</th>
                    <th className="py-3 px-4 min-w-[200px]">
                      <div className="flex items-center gap-1">
                        <span>Single-Patron Reliance Index</span>
                        <HelpTooltip
                          title="Single-Patron Reliance"
                          text="Percentage of contracts won from one MP or district. Over 85% flags potential concentration."
                        />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]">
                  {vendors.map((v) => {
                    const reliancePct = v.single_mp_reliance_pct || 0;
                    const isHighReliance = reliancePct >= 85;

                    return (
                      <tr
                        key={v.internal_vendor_id}
                        onClick={() => setSelectedVendor(v)}
                        className="hover:bg-[#F0EFEA]/60 cursor-pointer transition-colors group"
                      >
                        {/* Vendor Name */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-[#121316] text-xs truncate group-hover:text-[#C85A32] transition">
                            {v.vendor_name_normalized}
                          </div>
                          <div className="text-[10px] font-mono text-[#6E706E] mt-0.5 truncate">
                            Vendor ID: {v.internal_vendor_id}
                          </div>
                        </td>

                        {/* State */}
                        <td className="py-3 px-4 text-[#6E706E] font-medium whitespace-nowrap">
                          {v.primary_state || 'National Scope'}
                        </td>

                        {/* Total Received Amount */}
                        <td className="py-3 px-4 text-right font-mono font-medium text-[#121316] tabular-nums whitespace-nowrap">
                          <div className="text-sm font-bold text-[#121316]">₹{(v.total_received_amount / 1e7).toFixed(2)} Cr</div>
                          <div className="text-[10px] text-[#6E706E] font-normal">
                            ₹{(v.total_received_amount / 1e5).toFixed(2)} Lakh
                          </div>
                        </td>

                        {/* Transactions Count */}
                        <td className="py-3 px-4 text-center font-mono text-[#121316] tabular-nums font-medium">
                          {v.total_transaction_count.toLocaleString()}
                        </td>

                        {/* Single-Patron Reliance Meter */}
                        <td className="py-3 px-4 min-w-[200px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono font-medium text-[#121316] tabular-nums">
                                {reliancePct.toFixed(1)}% Reliance
                              </span>
                              {isHighReliance && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#C85A32] bg-[#FAF0EB] px-2 py-0.5 rounded-full border border-[#C85A32]/20">
                                  High Concentration
                                </span>
                              )}
                            </div>

                            {/* Meter Bar */}
                            <div className="w-full h-1.5 rounded-full bg-[#E4E2DC] overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, reliancePct)}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isHighReliance
                                    ? 'bg-[#C85A32]'
                                    : reliancePct >= 50
                                    ? 'bg-[#B25E00]'
                                    : 'bg-[#121316]'
                                }`}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-center">
                          <span className="px-3 py-1 rounded-full bg-white border border-[#E4E2DC] group-hover:bg-[#121316] group-hover:text-[#FAF8F5] text-[#121316] font-medium text-xs inline-flex items-center gap-1 transition">
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
              className="absolute inset-0 bg-[#121316]/50 backdrop-blur-xs transition-opacity"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-[#FAF8F5] shadow-2xl z-10 flex flex-col h-full border-l border-[#E4E2DC]"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E4E2DC] flex items-center justify-between bg-[#F0EFEA]">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-medium text-[#C85A32] uppercase tracking-wider block">
                    [FILE NO. VEN-{selectedVendor.internal_vendor_id}]
                  </span>
                  <h3 className="font-serif text-xl font-medium text-[#121316] truncate max-w-xs">
                    {selectedVendor.vendor_name_normalized}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVendor(null)}
                  className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#6E706E] hover:text-[#121316] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {/* Revenue Summary */}
                <div className="p-5 rounded-2xl bg-white border border-[#E4E2DC] text-center space-y-1">
                  <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">
                    / 01 CUMULATIVE PUBLIC REVENUE
                  </span>
                  <div className="text-3xl font-serif font-medium text-[#121316]">
                    ₹{(selectedVendor.total_received_amount / 1e7).toFixed(2)} Cr
                  </div>
                  <div className="text-xs font-mono text-[#6E706E] pt-0.5">
                    {selectedVendor.total_transaction_count.toLocaleString()} Recorded Treasury Disbursements
                  </div>
                </div>

                {/* Concentration Risk Meter Card */}
                <div className="p-5 rounded-2xl bg-white border border-[#E4E2DC] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase">
                      / 02 SINGLE-PATRON RELIANCE
                    </span>
                    <span className="font-mono font-medium text-sm text-[#121316]">
                      {(selectedVendor.single_mp_reliance_pct || 0).toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#E4E2DC] overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, selectedVendor.single_mp_reliance_pct || 0)}%` }}
                      className={`h-full rounded-full ${
                        (selectedVendor.single_mp_reliance_pct || 0) >= 85
                          ? 'bg-[#C85A32]'
                          : (selectedVendor.single_mp_reliance_pct || 0) >= 50
                          ? 'bg-[#B25E00]'
                          : 'bg-[#121316]'
                      }`}
                    />
                  </div>

                  <p className="text-xs text-[#6E706E] leading-relaxed">
                    {(selectedVendor.single_mp_reliance_pct || 0) >= 85
                      ? 'High single-representative concentration: over 85% of this contractor’s public disbursements originate from a single parliamentary patron.'
                      : 'Diversified procurement footprint across multiple parliamentary allocations and implementing districts.'}
                  </p>
                </div>

                {/* Associated Parliamentary Transactions */}
                <div className="p-5 rounded-2xl bg-white border border-[#E4E2DC] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase">
                      / 03 CLIENT PAYMENTS LEDGER
                    </span>
                    <span className="text-[10px] font-mono text-[#C85A32] font-semibold">
                      Recent Ledger
                    </span>
                  </div>

                  {detailLoading ? (
                    <LoadingSkeleton rows={3} height="h-12" />
                  ) : selectedVendorDetail?.recent_transactions && selectedVendorDetail.recent_transactions.length > 0 ? (
                    <div className="divide-y divide-[#E4E2DC]">
                      {selectedVendorDetail.recent_transactions.map((tx: any) => (
                        <div key={tx.internal_transaction_id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5 truncate">
                            <span className="font-medium text-[#121316] block truncate">
                              {tx.mp_name_normalized}
                            </span>
                            <span className="text-[10px] text-[#6E706E] font-mono block">
                              Voucher #{tx.internal_transaction_id} • {tx.expenditure_date}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-medium text-[#121316] block">
                              ₹{(tx.expenditure_amount / 1e5).toFixed(2)} L
                            </span>
                            <Link
                              to={`/transactions?search=${tx.internal_transaction_id}`}
                              className="text-[10px] text-[#C85A32] hover:underline"
                            >
                              Inspect →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#6E706E] italic">No line-item voucher sample available.</p>
                  )}
                </div>

                {/* Direct Action Link to Vouchers */}
                <div className="p-4 rounded-2xl bg-[#FAF0EB] border border-[#C85A32]/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-[#121316] block font-medium text-xs">View Line-Item Vouchers</strong>
                    <span className="text-xs text-[#6E706E]">Inspect all {selectedVendor.total_transaction_count} disbursements</span>
                  </div>
                  <Link
                    to={`/transactions?search=${encodeURIComponent(selectedVendor.vendor_name_normalized)}`}
                    className="cw-btn-primary text-xs"
                  >
                    <span>Open Vouchers</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E4E2DC] flex items-center gap-2.5 text-[#121316] text-xs font-mono font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
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
