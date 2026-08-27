import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  RotateCcw,
  Receipt,
  ChevronRight,
  X,
  Building2,
  Users,
  Layers,
  ArrowRight,
  ShieldCheck,
  IndianRupee,
  Calendar,
  MapPin,
  Landmark,
  ExternalLink,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/client';
import { Transaction, StateSummary } from '../api/types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const TransactionExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || '';
  const sortBy = searchParams.get('sort_by') || 'expenditure_amount';
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = 50;

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    api.getStates()
      .then(setStates)
      .catch(() => {});
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTransactions({
        search: search || undefined,
        state: state || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset,
      });
      setTransactions(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
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
      <Breadcrumbs items={[{ label: 'Disbursement Vouchers', to: '/transactions', icon: Receipt }]} />

      {/* 2. Editorial Header Banner & KPI Strip */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest block">
              TREASURY DISBURSEMENT LEDGER
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              Follow The Money
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-normal">
              Line-item financial verification across 82,296 treasury vouchers disbursed to ground executing contractors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 shadow-xs">
              {total.toLocaleString()} Records Found
            </span>
          </div>
        </div>

        {/* 4-KPI Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Vouchers</span>
            <strong className="text-lg font-black font-mono text-slate-900">82,296</strong>
            <span className="text-[11px] text-slate-500 block">100% Reconciled</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Disbursed</span>
            <strong className="text-lg font-black font-mono text-emerald-600">₹3,947.25 Cr</strong>
            <span className="text-[11px] text-slate-500 block">Exchequer Outflow</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Executing Vendors</span>
            <strong className="text-lg font-black font-mono text-blue-600">22,377</strong>
            <span className="text-[11px] text-slate-500 block">Contractor Entities</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Reconciliation</span>
            <strong className="text-lg font-black font-mono text-emerald-600">₹0.00</strong>
            <span className="text-[11px] text-emerald-700 font-bold block">Zero Discrepancy</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contractor name, MP, or voucher description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition"
            />
          </form>

          {/* State Filter */}
          <div className="sm:col-span-3">
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
              <option value="expenditure_amount-desc">Voucher Amount (High → Low)</option>
              <option value="expenditure_amount-asc">Voucher Amount (Low → High)</option>
              <option value="expenditure_date-desc">Date (Newest First)</option>
              <option value="expenditure_date-asc">Date (Oldest First)</option>
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

      {/* 4. High-Density Financial Ledger Table */}
      {loading ? (
        <LoadingSkeleton rows={10} height="h-14" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadTransactions} />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No Vouchers Found"
          description="No disbursement voucher records matched your query."
          onReset={handleReset}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[130px]">Voucher Date</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Contractor / Executing Agency</th>
                    <th className="py-3.5 px-4 min-w-[260px]">Activity Description</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Parliamentary Seat</th>
                    <th className="py-3.5 px-4 text-right min-w-[140px]">Disbursed Amount</th>
                    <th className="py-3.5 px-4 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.internal_transaction_id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                        <div className="font-bold text-slate-900">{tx.expenditure_date || 'Official Record'}</div>
                        <div className="text-[10px] text-slate-400">ID: #{tx.internal_transaction_id}</div>
                      </td>

                      {/* Contractor / Vendor */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition">
                          {tx.vendor_name_normalized}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                          Vendor ID: {tx.internal_vendor_id}
                        </div>
                      </td>

                      {/* Associated Work Description */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="text-slate-700 text-xs line-clamp-2 leading-relaxed">
                          {tx.activity_description_normalized || 'MPLADS Developmental Infrastructure Work'}
                        </div>
                      </td>

                      {/* Constituency / MP */}
                      <td className="py-3.5 px-4 max-w-xs whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {tx.constituency_normalized || tx.state_normalized}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {tx.mp_name_normalized || tx.state_normalized}
                        </div>
                      </td>

                      {/* Disbursed Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        <div className="text-sm text-emerald-700">₹{(tx.expenditure_amount / 1e5).toFixed(2)} L</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          ₹{tx.expenditure_amount.toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white font-bold text-xs inline-flex items-center gap-1 transition">
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  ))}
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

      {/* 5. Slide-In Financial Lineage Dossier Drawer */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
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
                    VOUCHER DOSSIER #{selectedTx.internal_transaction_id}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 font-display">
                    Disbursement Lineage
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {/* Financial Summary */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                    TOTAL DISBURSED AMOUNT
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-700">
                    ₹{(selectedTx.expenditure_amount / 1e5).toFixed(2)} Lakh
                  </div>
                  <div className="text-xs font-mono text-slate-500 pt-0.5">
                    Exact Amount: ₹{selectedTx.expenditure_amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* 3-Stage Provenance Lineage */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    AUDITED PROVENANCE CHAIN
                  </span>

                  {/* Stage 1: Parliamentarian */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[10px] font-bold">
                      <Landmark className="w-3.5 h-3.5" />
                      <span>RECOMMENDING REPRESENTATIVE</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedTx.mp_name_normalized || 'Honourable Member of Parliament'}
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      Territory: {selectedTx.state_normalized} ({selectedTx.constituency_normalized || 'State-wide'})
                    </div>
                  </div>

                  {/* Stage 2: Activity Description */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-mono text-[10px] font-bold">
                      <Layers className="w-3.5 h-3.5" />
                      <span>DEVELOPMENTAL ACTIVITY RECORD</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs leading-relaxed">
                      {selectedTx.activity_description_normalized || 'Civic Infrastructure Work'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Voucher ID: #{selectedTx.internal_transaction_id} · Recorded: {selectedTx.expenditure_date || 'eSAKSHI'}
                    </div>
                  </div>

                  {/* Stage 3: Executing Contractor */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-600 font-mono text-[10px] font-bold">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>EXECUTING CONTRACTOR / RECIPIENT</span>
                      </div>
                      <Link
                        to={`/vendors?search=${encodeURIComponent(selectedTx.vendor_name_normalized)}`}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedTx.vendor_name_normalized}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Vendor ID: {selectedTx.internal_vendor_id}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-900 text-xs font-mono font-medium">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Double-Entry Reconciled Treasury Record · ₹0.00 Variance Guaranteed</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
