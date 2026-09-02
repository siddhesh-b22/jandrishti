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
import { DuplicatePair } from '../api/types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { DuplicateComparisonModal } from '../components/common/DuplicateComparisonModal';

export const DuplicateDetectionPage: React.FC = () => {
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minSimilarity, setMinSimilarity] = useState<number>(0.60);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-manrope">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Public Works', to: '/works' },
          { label: 'Duplicate & Overlap Detection Studio' },
        ]}
      />

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-widest border border-amber-200">
                <Copy className="w-3 h-3 text-amber-600" />
                AI-Powered De-duplication Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                Jaccard Token + Spatial Matching
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#08102B] tracking-tight">
              Duplicate &amp; Overlapping Works Detection Studio
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl font-light leading-relaxed">
              Scans 102,437 physical infrastructure works across 36 jurisdictions to detect potential duplicate sanctions, repeated descriptions, and overlapping geographical outlays.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Flagged Clusters</span>
              <span className="text-2xl font-black font-mono text-[#08102B]">{duplicates.length}</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-700">Min Similarity:</span>
            {[0.60, 0.70, 0.80].map((sim) => (
              <button
                key={sim}
                type="button"
                onClick={() => setMinSimilarity(sim)}
                className={`px-3 py-1 rounded-full font-bold transition ${
                  minSimilarity === sim
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {Math.round(sim * 100)}%+ Match
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-400">
            Status: <strong className="text-amber-700">Requires Review</strong> · Final verification by human engineers
          </div>
        </div>
      </div>

      {/* List of Duplicate Candidates */}
      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadDuplicates} />
      ) : duplicates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-base font-extrabold text-[#08102B]">No Overlapping Works Detected</h3>
          <p className="text-xs text-slate-500 font-light">
            No projects exceed the selected similarity threshold in this scope.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicates.map((pair) => (
            <div
              key={pair.pair_id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-mono font-bold border border-rose-200">
                    {Math.round(pair.similarity_score * 100)}% Similarity
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {pair.pair_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold">
                    Requires Review
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActivePair(pair);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <span>Compare Side-by-Side</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Side-by-Side Quick Summary Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Work A Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#2563EB] text-[10px]">
                      PROJECT A · WORK #{pair.work_a.work_id}
                    </span>
                    <span className="font-mono font-bold text-[#08102B]">
                      ₹{pair.work_a.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#08102B] leading-snug line-clamp-2">
                    {pair.work_a.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-light">
                    {pair.work_a.constituency}, {pair.work_a.state} · {pair.work_a.mp_name}
                  </div>
                </div>

                {/* Work B Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#2563EB] text-[10px]">
                      PROJECT B · WORK #{pair.work_b.work_id}
                    </span>
                    <span className="font-mono font-bold text-[#08102B]">
                      ₹{pair.work_b.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#08102B] leading-snug line-clamp-2">
                    {pair.work_b.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-light">
                    {pair.work_b.constituency}, {pair.work_b.state} · {pair.work_b.mp_name}
                  </div>
                </div>
              </div>

              {/* Similarity Reasons */}
              <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap pt-1">
                <strong className="text-slate-800">Contributory Indicators:</strong>
                {pair.reasons.map((r, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-100">
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
