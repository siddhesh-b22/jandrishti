import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  Search,
  Filter,
  ArrowRight,
  Layers,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../api/client';
import { DuplicatePair, StateSummary, WorkCategory } from '../api/types';
import { useRole } from '../context/RoleContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { DuplicateComparisonModal } from '../components/common/DuplicateComparisonModal';

export const DuplicateDetectionPage: React.FC = () => {
  const { user, currentRole } = useRole();
  const isStateLocked = currentRole === 'STATE_NODAL_AUTHORITY' && !!user?.state;

  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([]);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [categories, setCategories] = useState<WorkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedState, setSelectedState] = useState<string>(isStateLocked ? user?.state || '' : '');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minSimilarity, setMinSimilarity] = useState<number>(0.60);

  useEffect(() => {
    Promise.all([api.getStates(), api.getCategories()])
      .then(([statesData, categoriesData]) => {
        setStates(statesData);
        setCategories(categoriesData);
      })
      .catch(() => {});
  }, []);

  // Active modal comparison
  const [activePair, setActivePair] = useState<DuplicatePair | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadDuplicates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDuplicates({
        state: selectedState || undefined,
        category: selectedCategory || undefined,
        min_similarity: minSimilarity,
        limit: 30,
      });
      setDuplicates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load duplicate work clusters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDuplicates();
  }, [selectedState, selectedCategory, minSimilarity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in font-sans text-[#121316]">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Public Works', to: '/works' },
          { label: 'Duplicate & Overlap Detection Studio' },
        ]}
      />

      {/* GetCasework Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4E2DC] pb-6">
        <div className="space-y-1">
          <div className="cw-badge-section mb-2">
            § IV · SPATIAL &amp; TEXTUAL DUPLICATE CLUSTERING
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#121316] tracking-tight">
            Duplicate Work <span className="italic font-normal">Detection Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] max-w-3xl font-light mt-1">
            Scans 102,437 physical works to identify high semantic similarity (TF-IDF cosine) and geospatial proximity for human administrative verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E4E2DC] text-[#121316] text-xs font-mono font-semibold shadow-2xs">
            {duplicates.length} Clusters Flagged
          </span>
        </div>
      </div>

      {/* Bento Summary Metrics (/ 01, / 02, / 03) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cw-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">/ 01 Flagged Pairs</span>
            <span className="text-[10px] font-mono text-[#71717A]">Active In Scope</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-[#121316]">
            {duplicates.length} Pairs
          </div>
          <div className="text-xs text-[#71717A] mt-1 font-light">
            Works exceeding text &amp; spatial overlap thresholds
          </div>
        </div>

        <div className="cw-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">/ 02 Analytical Model</span>
            <span className="text-[10px] font-mono text-[#71717A]">Cosine + Geo</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-[#121316]">
            TF-IDF 3-Gram
          </div>
          <div className="text-xs text-[#71717A] mt-1 font-light">
            Tokenized n-gram cosine matching combined with GPS radii
          </div>
        </div>

        <div className="cw-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-widest font-semibold">/ 03 Statutory Notice</span>
            <span className="text-[10px] font-mono text-[#71717A]">Norms Check</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-[#121316]">
            Review Required
          </div>
          <div className="text-xs text-[#71717A] mt-1 font-light">
            Empirical flag for engineer inspection; does NOT assert irregularity
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="cw-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* State Filter */}
          <div className="lg:col-span-5">
            <select
              value={selectedState}
              disabled={isStateLocked}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition min-h-[44px] disabled:opacity-75"
            >
              <option value="">All States &amp; UTs</option>
              {states.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state} {isStateLocked && s.state.toUpperCase() === user?.state?.toUpperCase() ? '(Mandate Scope)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl text-xs font-medium text-[#121316] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition min-h-[44px]"
            >
              <option value="">All Project Sectors</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Action */}
          <div className="lg:col-span-2 flex items-center justify-end">
            {(selectedState || selectedCategory || minSimilarity !== 0.60) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedState(isStateLocked ? user?.state || '' : '');
                  setSelectedCategory('');
                  setMinSimilarity(0.60);
                }}
                className="text-[#C85A32] hover:text-[#9E3E1C] font-semibold text-xs flex items-center gap-1 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E4E2DC]/60">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-mono text-[#71717A] text-[11px] uppercase tracking-wider">Similarity Threshold:</span>
            {[0.60, 0.70, 0.80].map((sim) => (
              <button
                key={sim}
                type="button"
                onClick={() => setMinSimilarity(sim)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition cursor-pointer border ${
                  minSimilarity === sim
                    ? 'bg-[#121316] text-white border-[#121316] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#71717A] border-[#E4E2DC] hover:border-[#121316] hover:text-[#121316]'
                }`}
              >
                {Math.round(sim * 100)}%+ Match
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[#71717A]">
            Empirical Threshold: <strong className="text-[#C85A32]">Cosine &gt;= {Math.round(minSimilarity * 100)}%</strong>
          </div>
        </div>
      </div>

      {/* List of Duplicate Candidates */}
      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadDuplicates} />
      ) : duplicates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-serif font-normal text-[#121316]">No Overlapping Works Detected</h3>
          <p className="text-xs text-[#71717A] font-light">
            No physical infrastructure projects exceed the selected similarity threshold in this scope.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicates.map((pair) => (
            <div
              key={pair.pair_id}
              className="cw-card p-5 sm:p-6 space-y-4 hover:border-[#C85A32]/40 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E2DC] pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-xs font-mono font-semibold border border-[#E8C5B6]">
                    {Math.round(pair.similarity_score * 100)}% Similarity
                  </span>
                  <span className="text-xs font-mono text-[#71717A]">
                    {pair.pair_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] text-[10px] font-mono border border-[#E4E2DC]">
                    Human Review Required
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActivePair(pair);
                    setIsModalOpen(true);
                  }}
                  className="cw-btn-primary text-xs py-1.5 px-4 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>Compare Side-by-Side</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Side-by-Side Quick Summary Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Work A Preview */}
                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#C85A32] text-[10px] font-semibold">
                      PROJECT A · WORK #{pair.work_a.work_id}
                    </span>
                    <span className="font-mono font-semibold text-[#121316]">
                      ₹{pair.work_a.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <h4 className="font-serif text-[#121316] text-sm leading-snug line-clamp-2">
                    {pair.work_a.title}
                  </h4>
                  <div className="text-[11px] text-[#71717A] font-light">
                    {pair.work_a.constituency}, {pair.work_a.state} · {pair.work_a.mp_name}
                  </div>
                </div>

                {/* Work B Preview */}
                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#C85A32] text-[10px] font-semibold">
                      PROJECT B · WORK #{pair.work_b.work_id}
                    </span>
                    <span className="font-mono font-semibold text-[#121316]">
                      ₹{pair.work_b.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <h4 className="font-serif text-[#121316] text-sm leading-snug line-clamp-2">
                    {pair.work_b.title}
                  </h4>
                  <div className="text-[11px] text-[#71717A] font-light">
                    {pair.work_b.constituency}, {pair.work_b.state} · {pair.work_b.mp_name}
                  </div>
                </div>
              </div>

              {/* Similarity Reasons */}
              <div className="flex items-center gap-2 text-xs text-[#71717A] flex-wrap pt-1">
                <strong className="text-[#121316] font-semibold">Contributing Factors:</strong>
                {pair.reasons.map((r, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#121316] text-[11px] font-mono border border-[#E4E2DC]">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Modal */}
      <DuplicateComparisonModal
        pair={activePair}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
