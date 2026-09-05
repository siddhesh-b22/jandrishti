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
    <div className="animate-fade-in text-[#121316] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans pb-24">
      <Breadcrumbs items={[{ label: 'Methodology & Standards', to: '/methodology', icon: BookOpen }]} />

      {/* Editorial Header */}
      <div className="space-y-4 border-b border-[#E4E2DC] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="cw-badge-section">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
              § STATUTORY ARCHITECTURE &amp; METHODOLOGY
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#121316]">
              Analytical Standards &amp; <em className="font-serif italic font-normal text-[#C85A32]">Empirical Model</em>
            </h1>
            <p className="text-sm sm:text-base text-[#6E706E] max-w-3xl font-normal leading-relaxed">
              Data provenance, non-parametric Median Absolute Deviation (MAD) signals, 3-NF normalisation, and double-entry mathematical reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E4E2DC] text-[#121316] text-xs font-mono font-medium shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>₹0.00 Variance Guaranteed</span>
            </span>
          </div>
        </div>

        {/* Bento Overview Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#6E706E] font-medium tracking-wider">/ 01 DATA PROVENANCE</span>
            <div className="font-serif text-lg text-[#121316] font-medium">MoSPI &amp; eSAKSHI Sync</div>
            <p className="text-xs text-[#6E706E]">Direct daily ingestion pipeline preserving raw statutory records without mutation.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#6E706E] font-medium tracking-wider">/ 02 STATISTICAL INFERENCE</span>
            <div className="font-serif text-lg text-[#121316] font-medium">MAD Robust Z-Score</div>
            <p className="text-xs text-[#6E706E]">Outlier-resistant scale estimator (0.6745) preventing extreme distortion in public spend.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#6E706E] font-medium tracking-wider">/ 03 RECONCILIATION</span>
            <div className="font-serif text-lg text-[#121316] font-medium">Double-Entry Ledger</div>
            <p className="text-xs text-[#6E706E]">Mathematically checked exchequer releases against line-item ground disbursements.</p>
          </div>
        </div>
      </div>

      {/* Grid: Interactive Contents Sidebar + Selected Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Index */}
        <aside className="lg:col-span-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
            <span className="text-xs font-mono font-medium text-[#6E706E] uppercase tracking-wider">
              / CHAPTER INDEX
            </span>
            <span className="text-[10px] font-mono text-[#C85A32] font-semibold bg-[#FAF0EB] px-2.5 py-0.5 rounded-full border border-[#C85A32]/20">
              0{activeTab + 1} of 0{contents.length}
            </span>
          </div>

          <nav className="space-y-1.5 text-xs">
            {contents.map((item, idx) => {
              const isSelected = activeTab === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#121316] text-[#FAF8F5] font-medium shadow-xs'
                      : 'text-[#121316] hover:bg-[#F0EFEA] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        isSelected ? 'text-[#C85A32]' : 'text-[#6E706E] group-hover:text-[#121316]'
                      }`}
                    >
                      {item.num}
                    </span>
                    <span className="text-xs">{item.label.split('. ')[1]}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition ${
                      isSelected ? 'text-[#FAF8F5] translate-x-0.5' : 'text-[#6E706E]/50 group-hover:text-[#121316]'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#E4E2DC] text-[11px] text-[#6E706E] font-mono space-y-1.5">
            <div className="flex justify-between">
              <span>Standard:</span>
              <strong className="text-[#121316] font-medium">Double-Entry Ledger</strong>
            </div>
            <div className="flex justify-between">
              <span>Baseline Date:</span>
              <span className="text-[#121316] font-medium">26 Aug 2026</span>
            </div>
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-6 min-h-[500px] flex flex-col justify-between"
            >
              {/* TAB 0: DATA INGESTION */}
              {activeTab === 0 && (
                <div className="space-y-6">
                  <div className="space-y-1.5 border-b border-[#E4E2DC] pb-4">
                    <span className="text-[10px] font-mono font-semibold text-[#C85A32] uppercase tracking-wider">
                      CHAPTER 01 / SPECIFICATION
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#121316]">
                      Statutory Data Ingestion
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#444746] leading-relaxed">
                    JanDrishti ingests data from two primary government sources: <strong>MoSPI</strong> (Ministry of Statistics and Programme Implementation) and <strong>eSAKSHI</strong> (the electronic disbursement tracking system for MPLADS — Members of Parliament Local Area Development Scheme).
                  </p>

                  <p className="text-xs sm:text-sm text-[#444746] leading-relaxed">
                    Raw records are ingested in their source format, validated for structural completeness, and loaded into a staging environment where they await normalization. No data transformation occurs during ingestion to preserve source fidelity.
                  </p>

                  {/* MoSPI & eSAKSHI Source Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-2">
                      <div className="flex items-center gap-2 text-[#C85A32]">
                        <Landmark className="w-4 h-4" />
                        <h3 className="font-serif text-sm font-medium text-[#121316]">MoSPI Architecture</h3>
                      </div>
                      <p className="text-xs text-[#6E706E] leading-relaxed">
                        Ministry of Statistics and Programme Implementation. Primary repository for MPLADS statutory sanctions, physical progress milestones, and parliamentary fund allocation data.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-2">
                      <div className="flex items-center gap-2 text-[#2E7D32]">
                        <Receipt className="w-4 h-4" />
                        <h3 className="font-serif text-sm font-medium text-[#121316]">eSAKSHI Portal</h3>
                      </div>
                      <p className="text-xs text-[#6E706E] leading-relaxed">
                        Electronic disbursement tracking system. Financial voucher records, disbursement amounts, implementing agencies, and contractor transaction data.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF0EB] border border-[#C85A32]/20 text-xs font-mono text-[#121316] flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-[#C85A32] shrink-0" />
                    <span>Baseline snapshot: 26 August 2026 · 102,437 works · 82,296 vouchers · 22,377 vendors · 778 MPs</span>
                  </div>
                </div>
              )}

              {/* TAB 1: NORMALIZATION */}
              {activeTab === 1 && (
                <div className="space-y-6">
                  <div className="space-y-1.5 border-b border-[#E4E2DC] pb-4">
                    <span className="text-[10px] font-mono font-semibold text-[#C85A32] uppercase tracking-wider">
                      CHAPTER 02 / RELATIONAL MODEL
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#121316]">
                      Third Normal Form (3-NF) Normalization
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#444746] leading-relaxed">
                    Ingested records are mapped into a standardized <strong>Third Normal Form (3-NF) relational schema</strong>. This eliminates redundancy, standardizes naming anomalies across states, and links fragmented records across ministries into deterministic relational entities.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-1.5">
                      <strong className="text-[#121316] block font-mono text-xs uppercase font-medium">/ 01 Entity Resolution</strong>
                      <p className="text-[#6E706E] leading-relaxed text-xs">Reconciles variations in representative names, phonetic spellings, and parliamentary seat identifiers.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-1.5">
                      <strong className="text-[#121316] block font-mono text-xs uppercase font-medium">/ 02 Sector Mapping</strong>
                      <p className="text-[#6E706E] leading-relaxed text-xs">Maps 200+ raw project categories into standardized statutory sectors: Water, Roads, Education, Health, Sanitation.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-1.5">
                      <strong className="text-[#121316] block font-mono text-xs uppercase font-medium">/ 03 Contractor Canonicalization</strong>
                      <p className="text-[#6E706E] leading-relaxed text-xs">Harmonizes contractor tax identifiers and municipal registration strings into unique vendor records.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FEATURE ENGINEERING */}
              {activeTab === 2 && (
                <div className="space-y-6">
                  <div className="space-y-1.5 border-b border-[#E4E2DC] pb-4">
                    <span className="text-[10px] font-mono font-semibold text-[#C85A32] uppercase tracking-wider">
                      CHAPTER 03 / METRICS
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#121316]">
                      Quantitative Feature Engineering
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#444746] leading-relaxed">
                    Quantitative features are computed across Representatives, Works, and Contractors to enable comparative benchmarks across all 28 States and 8 Union Territories:
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <strong className="text-[#121316] font-medium text-xs font-mono uppercase block">Fund Utilization Rate (%)</strong>
                        <p className="text-xs text-[#6E706E]">Ratio of cumulative disbursements to statutory entitlement.</p>
                      </div>
                      <code className="px-3 py-1 bg-[#FAF8F5] border border-[#E4E2DC] rounded-lg text-xs font-mono text-[#121316] font-medium shrink-0">
                        (Disbursed ÷ Allocated) × 100
                      </code>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <strong className="text-[#121316] font-medium text-xs font-mono uppercase block">Contractor Concentration (HHI)</strong>
                        <p className="text-xs text-[#6E706E]">Herfindahl-Hirschman Index calculating market share concentration.</p>
                      </div>
                      <code className="px-3 py-1 bg-[#FAF8F5] border border-[#E4E2DC] rounded-lg text-xs font-mono text-[#C85A32] font-medium shrink-0">
                        ∑ (Vendor Share %)²
                      </code>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <strong className="text-[#121316] font-medium text-xs font-mono uppercase block">Project Completion Velocity</strong>
                        <p className="text-xs text-[#6E706E]">Days elapsed between sanction order and physical completion certification.</p>
                      </div>
                      <code className="px-3 py-1 bg-[#FAF8F5] border border-[#E4E2DC] rounded-lg text-xs font-mono text-[#2E7D32] font-medium shrink-0">
                        Completed Date − Sanction Date
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STATISTICAL SIGNALS */}
              {activeTab === 3 && (
                <div className="space-y-6">
                  <div className="space-y-1.5 border-b border-[#E4E2DC] pb-4">
                    <span className="text-[10px] font-mono font-semibold text-[#C85A32] uppercase tracking-wider">
                      CHAPTER 04 / MATHEMATICAL FOUNDATIONS
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#121316]">
                      Statistical Signals &amp; MAD Z-Scores
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#444746] leading-relaxed">
                    JanDrishti uses <strong>Median Absolute Deviation (MAD)</strong> robust Z-scores to flag statistical anomalies rather than arbitrary thresholds. Unlike standard deviation, MAD is resilient to extreme outliers in public expenditure distributions.
                  </p>

                  {/* Formula Card */}
                  <div className="p-5 rounded-xl bg-[#121316] text-[#FAF8F5] space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span className="text-[10px] font-mono font-medium text-[#C85A32] uppercase tracking-wider">
                        ROBUST Z-SCORE FORMULA
                      </span>
                      <span className="text-[10px] font-mono text-[#FAF8F5]/60">NON-PARAMETRIC SCALE</span>
                    </div>

                    <div className="text-lg sm:text-xl font-mono text-[#C85A32] font-medium">
                      Z = 0.6745 × (x − Median) ÷ MAD
                    </div>

                    <p className="text-xs text-[#FAF8F5]/80 leading-relaxed font-sans">
                      Where <code className="text-[#FAF8F5] font-mono">MAD = Median(|x_i − Median(X)|)</code>. The factor 0.6745 makes the robust Z-score asymptotically equivalent to standard deviation for normal distributions while remaining invulnerable to outlier distortion.
                    </p>
                  </div>

                  {/* Severity Tiers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-[#E4E2DC]">
                      <span className="font-mono font-semibold text-[#C85A32] block text-xs">CRITICAL (&gt;4.0σ)</span>
                      <span className="text-[11px] text-[#6E706E]">Extreme divergence</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-[#E4E2DC]">
                      <span className="font-mono font-semibold text-[#C85A32]/80 block text-xs">HIGH (3.0 – 4.0σ)</span>
                      <span className="text-[11px] text-[#6E706E]">Significant outlier</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-[#E4E2DC]">
                      <span className="font-mono font-semibold text-[#B25E00] block text-xs">MEDIUM (2.0 – 3.0σ)</span>
                      <span className="text-[11px] text-[#6E706E]">Moderate deviation</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-[#E4E2DC]">
                      <span className="font-mono font-semibold text-[#6E706E] block text-xs">LOW (1.5 – 2.0σ)</span>
                      <span className="text-[11px] text-[#6E706E]">Minor variance</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RECONCILIATION */}
              {activeTab === 4 && (
                <div className="space-y-6">
                  <div className="space-y-1.5 border-b border-[#E4E2DC] pb-4">
                    <span className="text-[10px] font-mono font-semibold text-[#C85A32] uppercase tracking-wider">
                      CHAPTER 05 / FINANCIAL CERTAINTY
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#121316]">
                      Double-Entry Mathematical Reconciliation
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#444746] leading-relaxed">
                    Every financial calculation is subject to a strict <strong>Double-Entry Balance Verification</strong> ensuring zero discrepancy between authorized statutory allocations and line-item treasury records.
                  </p>

                  <div className="p-5 rounded-xl bg-white border border-[#E4E2DC] space-y-2">
                    <div className="flex items-center gap-2 text-[#2E7D32] font-medium text-xs font-mono uppercase">
                      <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                      <span>₹0.00 Mathematical Variance Guarantee</span>
                    </div>
                    <p className="text-xs text-[#6E706E] leading-relaxed">
                      Total Allocated Funds (₹11,667.55 Cr) = Total Disbursed Expenditure (₹3,947.25 Cr) + Total Unspent Balance (₹7,720.30 Cr). If any constituency exhibits even a ₹1.00 discrepancy, the pipeline triggers an automated lineage audit alert.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: DATA SOURCES */}
              {activeTab === 5 && (
                <div className="space-y-6">
                  <div className="space-y-1.5 border-b border-[#E4E2DC] pb-4">
                    <span className="text-[10px] font-mono font-semibold text-[#C85A32] uppercase tracking-wider">
                      CHAPTER 06 / LINEAGE
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#121316]">
                      Statutory Data Sources &amp; Provenance
                    </h2>
                  </div>

                  <div className="overflow-x-auto bg-white rounded-xl border border-[#E4E2DC]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F0EFEA] border-b border-[#E4E2DC] text-[#6E706E] font-mono text-[10px] uppercase">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Source Portal</th>
                          <th className="py-3 px-4 font-semibold">Authority</th>
                          <th className="py-3 px-4 font-semibold">Data Type</th>
                          <th className="py-3 px-4 font-semibold">Cadence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4E2DC] text-[#121316] text-xs">
                        <tr>
                          <td className="py-3 px-4 font-medium text-[#121316]">eSAKSHI Portal</td>
                          <td className="py-3 px-4 text-[#6E706E]">MoSPI / NIC</td>
                          <td className="py-3 px-4 text-[#6E706E]">Vouchers &amp; Vendors</td>
                          <td className="py-3 px-4 font-mono text-[#2E7D32] font-medium">Daily</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-[#121316]">MoSPI MPLADS Portal</td>
                          <td className="py-3 px-4 text-[#6E706E]">MoSPI</td>
                          <td className="py-3 px-4 text-[#6E706E]">Works &amp; Status</td>
                          <td className="py-3 px-4 font-mono text-[#2E7D32] font-medium">Daily</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-[#121316]">Lok Sabha Secretariat</td>
                          <td className="py-3 px-4 text-[#6E706E]">Parliament of India</td>
                          <td className="py-3 px-4 text-[#6E706E]">543 Constituencies</td>
                          <td className="py-3 px-4 font-mono text-[#6E706E]">Per Session</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-[#121316]">Rajya Sabha Secretariat</td>
                          <td className="py-3 px-4 text-[#6E706E]">Council of States</td>
                          <td className="py-3 px-4 text-[#6E706E]">235 Seats</td>
                          <td className="py-3 px-4 font-mono text-[#6E706E]">Per Session</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: DEFINITIONS */}
              {activeTab === 6 && (
                <div className="space-y-6">
                  <div className="space-y-1.5 border-b border-[#E4E2DC] pb-4">
                    <span className="text-[10px] font-mono font-semibold text-[#C85A32] uppercase tracking-wider">
                      CHAPTER 07 / GLOSSARY
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#121316]">
                      Statutory Definitions &amp; Taxonomy
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-1">
                      <strong className="text-[#121316] block font-mono text-xs uppercase font-medium">/ MPLADS</strong>
                      <p className="text-[#6E706E] leading-relaxed text-xs">Members of Parliament Local Area Development Scheme (statutory entitlement of ₹5 Crore per annum).</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-1">
                      <strong className="text-[#121316] block font-mono text-xs uppercase font-medium">/ Statutory Allocation</strong>
                      <p className="text-[#6E706E] leading-relaxed text-xs">The authorized financial ceiling of funds granted by the central exchequer per representative term.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-1">
                      <strong className="text-[#121316] block font-mono text-xs uppercase font-medium">/ Disbursed Outflow</strong>
                      <p className="text-[#6E706E] leading-relaxed text-xs">Actual exchequer capital released against verified contractor completion vouchers.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-1">
                      <strong className="text-[#121316] block font-mono text-xs uppercase font-medium">/ MAD Robust Z-Score</strong>
                      <p className="text-[#6E706E] leading-relaxed text-xs">Non-parametric statistical scale metric measuring deviation from sample median without outlier sensitivity.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Pagination Control */}
              <div className="pt-4 border-t border-[#E4E2DC] flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={activeTab === 0}
                  onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
                  className={`cw-btn-secondary ${activeTab === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Chapter</span>
                </button>

                <span className="text-[11px] font-mono text-[#6E706E]">
                  {contents[activeTab].label}
                </span>

                <button
                  type="button"
                  disabled={activeTab === contents.length - 1}
                  onClick={() => setActiveTab((prev) => Math.min(contents.length - 1, prev + 1))}
                  className={`cw-btn-primary ${activeTab === contents.length - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
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

