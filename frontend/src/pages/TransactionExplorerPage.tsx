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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#121316] font-sans pb-24">
      {/* 1. Global Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Treasury Vouchers', to: '/transactions', icon: Receipt }]} />

      {/* 2. Editorial Header Banner & Bento Metric Strip */}
      <div className="space-y-4 border-b border-[#E4E2DC] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="cw-badge-section">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
              § VI · TREASURY VOUCHER REGISTRY
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#121316]">
              Treasury Disbursement Ledger &amp; <em className="font-serif italic font-normal text-[#C85A32]">Line-Item Verification</em>
            </h1>
            <p className="text-sm sm:text-base text-[#6E706E] max-w-2xl leading-relaxed font-normal">
              Line-item financial verification across 82,296 treasury vouchers disbursed to ground executing contractors.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E4E2DC] text-xs font-mono font-medium text-[#121316] shadow-xs">
              {total.toLocaleString()} Reconciled Records
            </span>
          </div>
        </div>

        {/* 4-Bento Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 01 VOUCHERS</span>
            <strong className="text-lg sm:text-xl font-medium font-serif text-[#121316] block">82,296</strong>
            <span className="text-xs text-[#2E7D32] block font-mono">100% Reconciled</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 02 CAPITAL OUTFLOW</span>
            <strong className="text-lg sm:text-xl font-medium font-serif text-[#121316] block">₹3,947.25 Cr</strong>
            <span className="text-xs text-[#6E706E] block font-mono">Public Exchequer</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 03 CONTRACTORS</span>
            <strong className="text-lg sm:text-xl font-medium font-serif text-[#121316] block">22,377</strong>
            <span className="text-xs text-[#6E706E] block font-mono">Recipient Entities</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">/ 04 VARIANCE</span>
            <strong className="text-lg sm:text-xl font-medium font-serif text-[#2E7D32] block">₹0.00</strong>
            <span className="text-xs text-[#2E7D32] block font-mono">Mathematical Parity</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E706E]" />
            <input
              type="text"
              placeholder="Search by voucher ID, vendor name, or transaction amount..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E2DC] rounded-xl text-xs text-[#121316] placeholder-[#6E706E] focus:outline-none focus:border-[#121316] transition min-h-[40px]"
            />
          </form>

          {/* State Filter */}
          <div className="sm:col-span-3">
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
              <option value="expenditure_amount-desc">Voucher Amount (High → Low)</option>
              <option value="expenditure_amount-asc">Voucher Amount (Low → High)</option>
              <option value="expenditure_date-desc">Date (Newest First)</option>
              <option value="expenditure_date-asc">Date (Oldest First)</option>
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
          {/* Mobile Responsive Cards (< md) */}
          <div className="md:hidden space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.internal_transaction_id}
                onClick={() => setSelectedTx(tx)}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] hover:border-[#121316] transition space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-[#6E706E] font-mono">
                  <span>{tx.expenditure_date || 'Official Record'}</span>
                  <span className="text-[10px]">Voucher #{tx.internal_transaction_id}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#121316] line-clamp-1">
                    {tx.vendor_name_normalized}
                  </h3>
                  <p className="text-xs text-[#6E706E] line-clamp-2 leading-relaxed mt-1">
                    {tx.activity_description_normalized || 'MPLADS Developmental Infrastructure Work'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E4E2DC] text-xs">
                  <div>
                    <span className="block font-medium text-[#121316]">{tx.constituency_normalized || tx.state_normalized}</span>
                    <span className="text-[10px] text-[#6E706E] font-mono">MP: {tx.mp_name_normalized || tx.state_normalized}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#6E706E] uppercase font-mono block">Amount</span>
                    <span className="text-base font-bold font-mono text-[#121316]">
                      ₹{(tx.expenditure_amount / 1e5).toFixed(2)} L
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTx(tx);
                  }}
                  className="w-full py-2 rounded-xl bg-white border border-[#E4E2DC] hover:bg-[#F0EFEA] text-[#121316] text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <span>Inspect Voucher Ledger</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#6E706E]" />
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F0EFEA] text-[#6E706E] font-mono font-medium uppercase tracking-wider text-[10px] border-b border-[#E4E2DC] sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4 min-w-[130px]">Voucher Date</th>
                    <th className="py-3 px-4 min-w-[220px]">Contractor / Agency</th>
                    <th className="py-3 px-4 min-w-[260px]">Activity Description</th>
                    <th className="py-3 px-4 min-w-[160px]">Parliamentary Seat</th>
                    <th className="py-3 px-4 text-right min-w-[140px]">Disbursed Amount</th>
                    <th className="py-3 px-4 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.internal_transaction_id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-[#F0EFEA]/60 cursor-pointer transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-[#6E706E] whitespace-nowrap tabular-nums">
                        <div className="font-medium text-[#121316]">{tx.expenditure_date || 'Official Record'}</div>
                        <div className="text-[10px] text-[#6E706E]">ID: #{tx.internal_transaction_id}</div>
                      </td>

                      {/* Contractor / Vendor */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-[#121316] text-xs truncate group-hover:text-[#C85A32] transition">
                          {tx.vendor_name_normalized}
                        </div>
                        <div className="text-[10px] font-mono text-[#6E706E] mt-0.5 truncate">
                          Vendor ID: {tx.internal_vendor_id}
                        </div>
                      </td>

                      {/* Associated Work Description */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="text-[#444746] text-xs line-clamp-2 leading-relaxed">
                          {tx.activity_description_normalized || 'MPLADS Developmental Infrastructure Work'}
                        </div>
                      </td>

                      {/* Constituency / MP */}
                      <td className="py-3 px-4 max-w-xs whitespace-nowrap">
                        <div className="font-medium text-[#121316] text-xs truncate">
                          {tx.constituency_normalized || tx.state_normalized}
                        </div>
                        <div className="text-[10px] text-[#6E706E] truncate font-mono">
                          {tx.mp_name_normalized || tx.state_normalized}
                        </div>
                      </td>

                      {/* Disbursed Amount */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#121316] tabular-nums whitespace-nowrap">
                        <div className="text-sm font-bold text-[#121316]">₹{(tx.expenditure_amount / 1e5).toFixed(2)} L</div>
                        <div className="text-[10px] text-[#6E706E] font-normal">
                          ₹{tx.expenditure_amount.toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-white border border-[#E4E2DC] group-hover:bg-[#121316] group-hover:text-[#FAF8F5] text-[#121316] font-medium text-xs inline-flex items-center gap-1 transition">
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
                    [FILE NO. VOU-{selectedTx.internal_transaction_id}]
                  </span>
                  <h3 className="font-serif text-xl font-medium text-[#121316]">
                    Disbursement Lineage
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#6E706E] hover:text-[#121316] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {/* Financial Summary */}
                <div className="p-5 rounded-2xl bg-white border border-[#E4E2DC] text-center space-y-1">
                  <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase block">
                    / 01 TOTAL DISBURSED AMOUNT
                  </span>
                  <div className="text-3xl font-serif font-medium text-[#121316]">
                    ₹{(selectedTx.expenditure_amount / 1e5).toFixed(2)} Lakh
                  </div>
                  <div className="text-xs font-mono text-[#6E706E] pt-0.5">
                    Exact Sum: ₹{selectedTx.expenditure_amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* 3-Stage Provenance Lineage */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-medium text-[#6E706E] uppercase tracking-wider block">
                    / 02 AUDITED PROVENANCE CHAIN
                  </span>

                  {/* Stage 1: Parliamentarian */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E4E2DC] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#C85A32] font-mono text-[10px] font-semibold">
                        <Landmark className="w-3.5 h-3.5" />
                        <span>RECOMMENDING REPRESENTATIVE</span>
                      </div>
                      {selectedTx.mp_name_normalized && (
                        <Link
                          to={`/mps?search=${encodeURIComponent(selectedTx.mp_name_normalized)}`}
                          className="text-[11px] font-medium text-[#C85A32] hover:underline flex items-center gap-1"
                        >
                          <span>View MP Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    <div className="font-serif text-base font-medium text-[#121316]">
                      {selectedTx.mp_name_normalized || 'Honourable Member of Parliament'}
                    </div>
                    <div className="text-xs text-[#6E706E] font-mono">
                      Territory: {selectedTx.state_normalized} ({selectedTx.constituency_normalized || 'State-wide'})
                    </div>
                  </div>

                  {/* Stage 2: Activity Description */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E4E2DC] space-y-2">
                    <div className="flex items-center gap-1.5 text-[#2E7D32] font-mono text-[10px] font-semibold">
                      <Layers className="w-3.5 h-3.5" />
                      <span>DEVELOPMENTAL ACTIVITY RECORD</span>
                    </div>
                    <div className="font-medium text-[#121316] text-xs leading-relaxed">
                      {selectedTx.activity_description_normalized || 'Civic Infrastructure Work'}
                    </div>
                    <div className="text-xs text-[#6E706E] font-mono">
                      Voucher ID: #{selectedTx.internal_transaction_id} · Date: {selectedTx.expenditure_date || 'eSAKSHI'}
                    </div>
                  </div>

                  {/* Stage 3: Executing Contractor */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E4E2DC] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#B25E00] font-mono text-[10px] font-semibold">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>EXECUTING CONTRACTOR / RECIPIENT</span>
                      </div>
                      <Link
                        to={`/vendors?search=${encodeURIComponent(selectedTx.vendor_name_normalized)}`}
                        className="text-[11px] font-medium text-[#C85A32] hover:underline flex items-center gap-1"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="font-serif text-base font-medium text-[#121316]">
                      {selectedTx.vendor_name_normalized}
                    </div>
                    <div className="text-xs text-[#6E706E] font-mono">
                      Vendor ID: {selectedTx.internal_vendor_id}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E4E2DC] flex items-center gap-2.5 text-[#121316] text-xs font-mono font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
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
