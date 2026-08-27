import React, { useState } from 'react';
import {
  Database,
  Calculator,
  GitBranch,
  ShieldCheck,
  Info,
  Cpu,
  Layers,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Receipt,
  Building2,
  Activity,
  Calendar,
  ExternalLink,
  ChevronRight,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const MethodologyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const contents = [
    { id: 'ingestion', label: '1. Data Ingestion', num: '01' },
    { id: 'normalization', label: '2. Normalization', num: '02' },
    { id: 'features', label: '3. Feature Engineering', num: '03' },
    { id: 'signals', label: '4. Statistical Signals', num: '04' },
    { id: 'reconciliation', label: '5. Reconciliation', num: '05' },
    { id: 'sources', label: '6. Data Sources', num: '06' },
    { id: 'definitions', label: '7. Definitions', num: '07' },
  ];

  return (
    <div className="animate-fade-in text-[#0F172A] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans pb-20">
      <Breadcrumbs items={[{ label: 'Methodology', to: '/methodology', icon: BookOpen }]} />

      {/* Sleek, Compact, Optimized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest">
              DATA PROVENANCE &amp; PIPELINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            How JanDrishti Works
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Data provenance, analytical methods, statistical signals, and reconciliation — explained for all audiences.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>₹0.00 Variance Verified</span>
          </span>
        </div>
      </div>

      {/* Grid: Interactive Contents Sidebar + Focused Selected Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Contents List */}
        <aside className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Contents
            </span>
            <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
              0{activeTab + 1} / 0{contents.length}
            </span>
          </div>

          <nav className="space-y-1 text-xs font-medium">
            {contents.map((item, idx) => {
              const isSelected = activeTab === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-mono font-black ${
                        isSelected ? 'text-blue-200' : 'text-slate-400 group-hover:text-blue-600'
                      }`}
                    >
                      {item.num}
                    </span>
                    <span className="text-xs">{item.label.split('. ')[1]}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition ${
                      isSelected ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono space-y-1">
            <div className="flex justify-between">
              <span>Audit Standard:</span>
              <strong className="text-emerald-700 font-bold">Double-Entry Ledger</strong>
            </div>
            <div className="flex justify-between">
              <span>Live Snapshot:</span>
              <span className="text-slate-700 font-bold">26 Aug 2026</span>
            </div>
          </div>
        </aside>

        {/* Right Main Panel: ONLY Renders the Selected Content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-5 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 min-h-[460px] flex flex-col justify-between"
            >
              {/* TAB 0: DATA INGESTION */}
              {activeTab === 0 && (
                <div className="space-y-5">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">CHAPTER 01</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                      Data Ingestion
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    JanDrishti ingests data from two primary government sources: <strong>MoSPI</strong> (Ministry of Statistics and Programme Implementation) and <strong>eSAKSHI</strong> (the electronic disbursement tracking system for MPLADS — Members of Parliament Local Area Development Scheme).
                  </p>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    Raw records are ingested in their source format, validated for structural completeness, and loaded into a staging environment where they await normalization. No data transformation occurs during ingestion to preserve source fidelity.
                  </p>

                  {/* MoSPI & eSAKSHI Source Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Landmark className="w-4 h-4" />
                        <h3 className="text-sm font-bold text-slate-900 font-display">MoSPI</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Ministry of Statistics and Programme Implementation. Primary source for MPLADS work records, statutory sanctions, physical progress, and parliamentary fund allocation data.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Receipt className="w-4 h-4" />
                        <h3 className="text-sm font-bold text-slate-900 font-display">eSAKSHI</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Electronic disbursement tracking system. Financial voucher records, disbursement amounts, executing agencies, and vendor transaction data.
                      </p>
                    </div>
                  </div>

                  {/* Current Snapshot */}
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs font-mono text-blue-950 flex items-center gap-2 font-medium">
                    <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Current snapshot: 26 August 2026 · 102,437 works · 82,296 vouchers · 22,377 vendors · 778 MPs</span>
                  </div>
                </div>
              )}

              {/* TAB 1: NORMALIZATION */}
              {activeTab === 1 && (
                <div className="space-y-5">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">CHAPTER 02</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                      Normalization
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    Ingested records are mapped into a standardized <strong>Third Normal Form (3-NF) relational schema</strong>. This eliminates redundancy, standardizes naming anomalies across states, and links fragmented records across ministries into deterministic relational entities.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <strong className="text-slate-900 block font-bold text-xs">Entity Resolution</strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">Reconciles variations in representative names, phonetic spellings, and parliamentary seat IDs.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <strong className="text-slate-900 block font-bold text-xs">Sector Categorization</strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">Maps 200+ raw project categories into standardized sectors: Water, Roads, Education, Health, Sanitation.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <strong className="text-slate-900 block font-bold text-xs">Vendor Deduplication</strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">Harmonizes contractor tax IDs and municipal contractor registration strings into unique vendor records.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FEATURE ENGINEERING */}
              {activeTab === 2 && (
                <div className="space-y-5">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">CHAPTER 03</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                      Feature Engineering
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    Quantitative features are computed across Representatives, Works, and Contractors to enable comparative benchmarks across all 28 States and 8 Union Territories:
                  </p>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-slate-900 font-bold text-xs">Fund Utilization Rate (%)</strong>
                        <p className="text-[11px] text-slate-500">Ratio of cumulative disbursements to statutory entitlement.</p>
                      </div>
                      <code className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-blue-700 font-bold shrink-0">
                        (Disbursed ÷ Allocated) × 100
                      </code>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-slate-900 font-bold text-xs">Vendor Concentration Index (HHI)</strong>
                        <p className="text-[11px] text-slate-500">Herfindahl-Hirschman Index calculating market share concentration.</p>
                      </div>
                      <code className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-amber-700 font-bold shrink-0">
                        ∑ (Vendor Share %)²
                      </code>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-slate-900 font-bold text-xs">Project Completion Velocity</strong>
                        <p className="text-[11px] text-slate-500">Days between sanction and physical completion certification.</p>
                      </div>
                      <code className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-emerald-700 font-bold shrink-0">
                        Completed Date − Sanction Date
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STATISTICAL SIGNALS */}
              {activeTab === 3 && (
                <div className="space-y-5">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">CHAPTER 04</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                      Statistical Signals
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    JanDrishti uses <strong>Median Absolute Deviation (MAD)</strong> robust Z-scores to flag statistical anomalies rather than arbitrary thresholds. Unlike standard deviation, MAD is resilient to extreme outliers in public expenditure distributions.
                  </p>

                  {/* Formula Card */}
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                        ROBUST Z-SCORE FORMULA
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">NON-PARAMETRIC</span>
                    </div>

                    <div className="text-lg sm:text-xl font-mono text-emerald-400 font-bold">
                      Z = 0.6745 × (x − Median) ÷ MAD
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Where <code>MAD = Median(|x_i − Median(X)|)</code>. The factor 0.6745 makes the robust Z-score asymptotically equivalent to standard deviation for normal distributions while remaining invulnerable to outlier distortion.
                    </p>
                  </div>

                  {/* Severity Tiers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="font-bold text-rose-700 block text-xs">CRITICAL (&gt;4.0σ)</span>
                      <span className="text-[10px] text-slate-600">Extreme divergence</span>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                      <span className="font-bold text-orange-700 block text-xs">HIGH (3.0 – 4.0σ)</span>
                      <span className="text-[10px] text-slate-600">Significant outlier</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="font-bold text-amber-700 block text-xs">MEDIUM (2.0 – 3.0σ)</span>
                      <span className="text-[10px] text-slate-600">Moderate divergence</span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <span className="font-bold text-blue-700 block text-xs">LOW (1.5 – 2.0σ)</span>
                      <span className="text-[10px] text-slate-600">Minor variance</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RECONCILIATION */}
              {activeTab === 4 && (
                <div className="space-y-5">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">CHAPTER 05</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                      Reconciliation
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    Every financial calculation is subject to a strict <strong>Double-Entry Balance Verification</strong> ensuring zero discrepancy between authorized statutory allocations and line-item treasury records.
                  </p>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>₹0.00 Mathematical Variance Guarantee</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Total Allocated Funds (₹11,667.55 Cr) = Total Disbursed Expenditure (₹3,947.25 Cr) + Total Unspent Balance (₹7,720.30 Cr). If any constituency exhibits even a ₹1.00 discrepancy, the pipeline triggers an automated lineage audit alert.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: DATA SOURCES */}
              {activeTab === 5 && (
                <div className="space-y-5">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">CHAPTER 06</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                      Data Sources &amp; Provenance
                    </h2>
                  </div>

                  <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3 font-bold">Source Portal</th>
                          <th className="py-2.5 px-3 font-bold">Authority</th>
                          <th className="py-2.5 px-3 font-bold">Data Type</th>
                          <th className="py-2.5 px-3 font-bold">Cadence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900">eSAKSHI Portal</td>
                          <td className="py-2.5 px-3">MoSPI / NIC</td>
                          <td className="py-2.5 px-3">Vouchers &amp; Vendors</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">Daily</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900">MoSPI MPLADS Portal</td>
                          <td className="py-2.5 px-3">MoSPI</td>
                          <td className="py-2.5 px-3">Works &amp; Status</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">Daily</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900">Lok Sabha Secretariat</td>
                          <td className="py-2.5 px-3">Parliament</td>
                          <td className="py-2.5 px-3">543 Seats</td>
                          <td className="py-2.5 px-3 font-mono">Per Session</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900">Rajya Sabha Secretariat</td>
                          <td className="py-2.5 px-3">Council of States</td>
                          <td className="py-2.5 px-3">235 Seats</td>
                          <td className="py-2.5 px-3 font-mono">Per Session</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: DEFINITIONS */}
              {activeTab === 6 && (
                <div className="space-y-5">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">CHAPTER 07</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                      Definitions &amp; Glossary
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <strong className="text-slate-900 block font-bold text-xs">MPLADS</strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">Members of Parliament Local Area Development Scheme (₹5 Cr/year).</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <strong className="text-slate-900 block font-bold text-xs">Statutory Allocation</strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">The authorized ceiling of funds granted by central exchequer per term.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <strong className="text-slate-900 block font-bold text-xs">Disbursed Expenditure</strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">Actual financial capital released against verified contractor bills.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <strong className="text-slate-900 block font-bold text-xs">MAD Robust Z-Score</strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">Non-parametric statistical metric measuring deviations from baseline.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Pagination Control */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <button
                  type="button"
                  disabled={activeTab === 0}
                  onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
                  className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Chapter</span>
                </button>

                <span className="text-[11px] font-mono text-slate-400">
                  {contents[activeTab].label}
                </span>

                <button
                  type="button"
                  disabled={activeTab === contents.length - 1}
                  onClick={() => setActiveTab((prev) => Math.min(contents.length - 1, prev + 1))}
                  className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === contents.length - 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                  }`}
                >
                  <span>Next Chapter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
