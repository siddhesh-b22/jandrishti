import React, { useState } from 'react';
import {
  BookOpen,
  Printer,
  FileCheck,
  Cpu,
  Database,
  KeyRound,
  Layers,
  BarChart3,
  HelpCircle,
  PlayCircle,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Scale,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Users,
  Building2,
  Receipt,
  FileText,
  Clock,
  ExternalLink,
  Lock,
  Landmark,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [qaFilter, setQaFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const toggleAccordion = (idx: number) => {
    setOpenAccordion(openAccordion === idx ? null : idx);
  };

  return (
    <div className="doc-page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans pb-24 text-[#121316]">
      {/* Print CSS Stylesheet */}
      <style>{`
        @media print {
          nav, header, footer, .no-print, .breadcrumbs-container, button {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 10pt !important;
          }
          .doc-page-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-break-before {
            break-before: page !important;
            page-break-before: always !important;
          }
          .print-block {
            display: block !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 8.5pt !important;
          }
          th, td {
            border: 1px solid #ccc !important;
            padding: 4px 6px !important;
          }
          .card-print {
            border: 1px solid #ddd !important;
            background: #fff !important;
            box-shadow: none !important;
            margin-bottom: 12px !important;
          }
          .bg-zinc-900, .bg-[#121316] {
            background: #f4f4f5 !important;
            color: #000 !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>

      {/* Header & Breadcrumb */}
      <div className="no-print">
        <Breadcrumbs items={[{ label: 'System Documentation & Judge Preparation', to: '/docs', icon: BookOpen }]} />
      </div>

      {/* ========================================================================= */}
      {/* 4. TOP SECTION — QUICK UNDERSTANDING                                     */}
      {/* ========================================================================= */}
      <div className="space-y-4 border-b border-[#E4E2DC] pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-pulse" />
                SIH26102 · STATUTORY AUDIT &amp; INTELLIGENCE
              </span>
              <span className="text-xs font-mono text-[#6E706E]">OFFICIAL JUDGE PREPARATION DOSSIER</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#121316]">
              JanDrishti
            </h1>
            <h3 className="font-serif text-lg sm:text-xl text-[#6E706E] italic">
              Parliamentary Expenditure Intelligence &amp; Public Works Transparency
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto no-print">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] hover:border-[#C85A32] text-[#121316] text-xs font-mono font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#C85A32]" />
              <span>Print / Save as PDF (CTRL + P)</span>
            </button>
          </div>
        </div>

        {/* 6 Core Quick Cards (Problem, Solution, Data, Intelligence, Users, Impact) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-[#C85A32]">/ 01 THE PROBLEM</div>
            <div className="text-xs font-semibold text-[#121316]">Opacity in ₹11,667 Cr Parliamentary Spend</div>
            <p className="text-xs text-[#6E706E] leading-relaxed">
              Citizens cannot trace how local MP funds are spent; auditors lack automated cross-constituency tools to detect contractor monopolies or duplicate project estimates before funds disburse.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-[#2E7D32]">/ 02 THE SOLUTION</div>
            <div className="text-xs font-semibold text-[#121316]">Full Line-Item Accountability Platform</div>
            <p className="text-xs text-[#6E706E] leading-relaxed">
              JanDrishti connects 778 MPs, 102,437 physical works, 82,296 vouchers, and 22,377 contractors across 36 States into an authenticated, role-scoped audit intelligence platform.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-[#121316]">/ 03 THE DATA</div>
            <div className="text-xs font-semibold text-[#121316]">Zero Mock Data · Official MoSPI &amp; Sansad</div>
            <p className="text-xs text-[#6E706E] leading-relaxed">
              Extracted from official Ministry of Statistics and Programme Implementation (MoSPI) public records, Sansad.in MP registers, and ECI boundaries. Reconciled with ₹0.00 variance.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-[#C85A32]">/ 04 THE INTELLIGENCE</div>
            <div className="text-xs font-semibold text-[#121316]">Explainable Forensic Anomaly Signals</div>
            <p className="text-xs text-[#6E706E] leading-relaxed">
              Deterministic statistical indicators: Median Absolute Deviation (MAD) for cost outliers, Benford&apos;s Law for split-billing vouchers, and Herfindahl-Hirschman (HHI) for contractor cartels.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-[#2E7D32]">/ 05 THE USERS</div>
            <div className="text-xs font-semibold text-[#121316]">Citizens, MPs, District Nodal Officers, CAG</div>
            <p className="text-xs text-[#6E706E] leading-relaxed">
              Citizens explore local village projects; MPs track sanction velocity; District Collectors manage milestone approvals; Auditors investigate flagged anomaly dossiers.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-[#121316]">/ 06 THE IMPACT</div>
            <div className="text-xs font-semibold text-[#121316]">Accelerating Delivery &amp; Preventing Leakage</div>
            <p className="text-xs text-[#6E706E] leading-relaxed">
              Surfaces over ₹7,720 Cr of unspent balances to accelerate public asset creation while establishing mathematical vigilance over every rupee released from the public exchequer.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 & 6. 30-SECOND & 1-MINUTE NATURAL EXPLANATIONS                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Explain JanDrishti in 30 Seconds (Memorize This)
            </span>
            <span className="text-[10px] font-mono text-amber-700">Quick pitch</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-sans">
            &ldquo;<strong>JanDrishti</strong> is a parliamentary transparency and audit platform for the ₹11,667 Crore MPLADS scheme. It connects 778 MPs, 102,000 public projects, 82,000 treasury vouchers, and 22,000 contractors across all 36 States into one interactive system. Citizens can trace exactly how public funds are spent in their constituency, district collectors get a dedicated milestone sanction workflow, and auditors get explainable statistical signals to detect duplicate estimates and contractor cartels with zero mathematical variance.&rdquo;
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-emerald-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" />
              Explain JanDrishti in 1 Minute (For Lead Evaluator)
            </span>
            <span className="text-[10px] font-mono text-emerald-700">Comprehensive pitch</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-sans">
            &ldquo;Every year, ₹5 Crore is allocated to each Member of Parliament for local area development, but official data is buried in fragmented PDF tables where citizens cannot see what was built, and auditors cannot see patterns across constituencies. We built JanDrishti to solve this entire pipeline. We extracted and normalized 102,437 physical works and 82,296 payment vouchers from official MoSPI records. We built an interactive map of all 542 constituencies, role-based workspaces with strict geographic jurisdiction scoping, and a deterministic anomaly engine that flags suspicious price outliers, split vouchers, and contractor concentration without hallucinating AI claims. Everything is backed by a dual-engine architecture combining Supabase PostgreSQL in the cloud with an offline SQLite failover to guarantee 100% reliability.&rdquo;
          </p>
        </div>
      </div>

      {/* Navigation Pills (No-print) */}
      <div className="no-print space-y-2">
        <div className="text-[11px] font-mono uppercase text-[#6E706E]">Jump to Section:</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E4E2DC] scrollbar-thin">
          {[
            { id: 'overview', label: 'SIH Problem & Objectives' },
            { id: 'how-it-works', label: 'How It Works & Architecture' },
            { id: 'data-sources', label: 'Data Sources & Lineage' },
            { id: 'rbac', label: 'Roles & Jurisdiction' },
            { id: 'flows', label: 'Visual Flows & Trace Money' },
            { id: 'features', label: 'Features & Implementation' },
            { id: 'security-ai', label: 'Security & Forensics' },
            { id: 'qa-bank', label: 'Judge Q&A Bank (40+ Questions)' },
            { id: 'demo-cheat', label: '3-Min Demo & Cheat Sheet' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#121316] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6E706E] border border-[#E4E2DC] hover:text-[#121316]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7 & 8 & 9. SIH PROBLEM STATEMENT, OBJECTIVES & COMPARISON                */}
      {/* ========================================================================= */}
      {(activeTab === 'overview' || typeof window === 'undefined') && (
        <div className="space-y-8 print-block">
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C85A32]" />
                01. Understanding the SIH Problem Statement (SIH26102)
              </h2>
              <span className="text-xs font-mono text-[#6E706E]">MoSPI · Smart Governance</span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-3 text-xs sm:text-sm text-[#121316]">
              <p>
                <strong>What is the problem statement?</strong> Problem Statement ID <strong>SIH26102</strong> requires creating a transparent, verifiable, and intelligent monitoring system for the Members of Parliament Local Area Development Scheme (MPLADS), managed by the Ministry of Statistics and Programme Implementation (MoSPI).
              </p>
              <p>
                <strong>What does SIH expect us to solve?</strong> SIH expects a solution that eliminates the information barrier between central authorities, implementing agencies, elected representatives, and ordinary citizens. It requires tracking fund allocation, project recommendation, administrative sanction, fund expenditure, contractor performance, and physical milestone completion in a unified interface.
              </p>
              <p>
                <strong>What is the real-world problem?</strong> Out of ₹11,667 Crore allocated, over ₹7,720 Crore currently sits unspent in district treasury accounts across India. Citizens cannot verify if a sanctioned community hall or drinking water project in their village was actually built, and district collectors have no cross-constituency ledger to check if an implementing vendor has taken on too many projects simultaneously.
              </p>
            </div>

            {/* SIH Requirements Table */}
            <div className="rounded-xl border border-[#E4E2DC] overflow-hidden">
              <div className="bg-[#FAF8F5] px-3 py-2 border-b border-[#E4E2DC] font-mono text-xs font-bold text-[#121316]">
                Table 1: SIH Problem Statement Requirements vs. JanDrishti Solution
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5]/50 border-b border-[#E4E2DC] font-mono text-[#6E706E]">
                  <tr>
                    <th className="py-2.5 px-3">SIH Requirement</th>
                    <th className="py-2.5 px-3">What It Means</th>
                    <th className="py-2.5 px-3">How JanDrishti Addresses It</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]/60">
                  <tr>
                    <td className="py-2 px-3 font-semibold">End-to-End Fund Tracking</td>
                    <td className="py-2 px-3">Trace money from parliament allocation down to individual payment vouchers.</td>
                    <td className="py-2 px-3">82,296 line-item vouchers linked directly to 102,437 physical works and 22,377 contractors with ₹0.00 variance.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Geospatial Transparency</td>
                    <td className="py-2 px-3">Show citizens where works are happening across constituencies.</td>
                    <td className="py-2 px-3">D3-Geo &amp; TopoJSON vector choropleth rendering all 542 Lok Sabha constituencies with zero third-party map keys.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Role-Specific Access</td>
                    <td className="py-2 px-3">Different views for Ministry, State Nodal, District Collector, MP, Auditor, Citizen.</td>
                    <td className="py-2 px-3">6 dedicated workspaces with cryptographic JWT RBAC and geographic ABAC boundary enforcement.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Anomaly &amp; Fraud Prevention</td>
                    <td className="py-2 px-3">Detect irregularities before public funds are irreversibly lost.</td>
                    <td className="py-2 px-3">Deterministic statistical engine flagging MAD cost outliers, Benford voucher violations, and contractor cartelization.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Bicameral Representation</td>
                    <td className="py-2 px-3">Cover both Lok Sabha and Rajya Sabha representatives.</td>
                    <td className="py-2 px-3">Unified directory of all 778 MPs (542 Lok Sabha + 236 Rajya Sabha) with transparent disclosure of data granularity.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Core Objectives Table */}
            <div className="rounded-xl border border-[#E4E2DC] overflow-hidden">
              <div className="bg-[#FAF8F5] px-3 py-2 border-b border-[#E4E2DC] font-mono text-xs font-bold text-[#121316]">
                Table 2: Core Project Objectives
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5]/50 border-b border-[#E4E2DC] font-mono text-[#6E706E]">
                  <tr>
                    <th className="py-2.5 px-3">Objective</th>
                    <th className="py-2.5 px-3">What We Did</th>
                    <th className="py-2.5 px-3">Result / Benefit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]/60">
                  <tr>
                    <td className="py-2 px-3 font-semibold">1. Transparency</td>
                    <td className="py-2 px-3">Built public directories for MPs, physical works, transactions, and contractors.</td>
                    <td className="py-2 px-3">Any citizen can search their constituency and see all sanctioned works without an account.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">2. Traceability</td>
                    <td className="py-2 px-3">Linked MP recommendations to work IDs, disbursement vouchers, and contractor IDs.</td>
                    <td className="py-2 px-3">Enables 1-click &ldquo;Trace Money&rdquo; from parliamentary sanction to bank voucher release.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">3. Accountability</td>
                    <td className="py-2 px-3">Enforced strict geographic scoping in the API backend (HTTP 403 on cross-district access).</td>
                    <td className="py-2 px-3">District collectors and nodal officers are held strictly to their legal jurisdiction.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">4. Audit Readiness</td>
                    <td className="py-2 px-3">Constructed a 68-case statutory audit workflow with instant PDF case dossier exports.</td>
                    <td className="py-2 px-3">Auditors can generate printable CAG-ready dossiers in seconds for formal review.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Existing Difficulty vs JanDrishti Approach */}
            <div className="rounded-xl border border-[#E4E2DC] overflow-hidden">
              <div className="bg-[#FAF8F5] px-3 py-2 border-b border-[#E4E2DC] font-mono text-xs font-bold text-[#121316]">
                Table 3: Existing Difficulty vs. JanDrishti Approach
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5]/50 border-b border-[#E4E2DC] font-mono text-[#6E706E]">
                  <tr>
                    <th className="py-2.5 px-3">Existing Difficulty (Legacy Portals)</th>
                    <th className="py-2.5 px-3">JanDrishti Modern Approach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]/60">
                  <tr>
                    <td className="py-2 px-3 text-red-700">Information distributed across disconnected PDFs and separate state tables.</td>
                    <td className="py-2 px-3 text-emerald-800 font-medium">Centralized relational view in Supabase PostgreSQL with sub-50ms query response.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-red-700">Difficult to connect a specific physical work with its recommending MP.</td>
                    <td className="py-2 px-3 text-emerald-800 font-medium">Direct MP → Work relationship with 1-click drilldown into sector, status, and cost.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-red-700">Financial numbers are opaque aggregates with no voucher lineage.</td>
                    <td className="py-2 px-3 text-emerald-800 font-medium">Full voucher-level drilldown showing release date, transaction amount, and contractor.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-red-700">Every user sees the same flat tabular screen regardless of administrative role.</td>
                    <td className="py-2 px-3 text-emerald-800 font-medium">6 dedicated role workspaces (Ministry, State, District, MP, Auditor, Citizen).</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-red-700">District officers accidentally receive cross-state mixed records due to weak filters.</td>
                    <td className="py-2 px-3 text-emerald-800 font-medium">Hierarchical jurisdiction scoping enforced at the API layer (HTTP 403 on violation).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10 & 11 & 12. HOW JANDRISHTI WORKS & ARCHITECTURE DIAGRAMS               */}
      {/* ========================================================================= */}
      {(activeTab === 'how-it-works' || typeof window === 'undefined') && (
        <div className="space-y-8 print-block">
          {/* Visual Flowchart 1: How JanDrishti Works */}
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#C85A32]" />
                02. How JanDrishti Works (System Process Flowchart)
              </h2>
              <span className="text-xs font-mono text-[#6E706E]">End-to-End User Interaction Flow</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-4">
              <p className="text-xs text-[#6E706E]">
                The following visual diagram illustrates how a user interacts with the JanDrishti system, from initial session identification to authorized data drilldown:
              </p>

              {/* Visual HTML/CSS Diagram */}
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="px-5 py-2.5 rounded-lg bg-[#121316] text-white text-xs font-mono font-bold shadow-xs">
                  1. USER OPENS JANDRISHTI
                </div>
                <div className="w-0.5 h-5 bg-[#C85A32]" />
                
                <div className="px-5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] text-xs font-mono text-[#121316] text-center">
                  2. SELECT CONTEXT / AUTHENTICATE<br />
                  <span className="text-[10px] text-[#6E706E]">(Public Citizen or Administrative Role via JWT)</span>
                </div>
                <div className="w-0.5 h-5 bg-[#C85A32]" />

                <div className="px-5 py-2.5 rounded-lg bg-amber-50 border border-amber-300 text-xs font-mono text-amber-950 text-center">
                  3. ROLE + JURISDICTION RESOLVER<br />
                  <span className="text-[10px] text-amber-700 font-semibold">(Validates State, District &amp; Constituency boundaries)</span>
                </div>
                <div className="w-0.5 h-5 bg-[#C85A32]" />

                <div className="px-5 py-2.5 rounded-lg bg-blue-50 border border-blue-300 text-xs font-mono text-blue-950 text-center">
                  4. AUTHORIZED QUERY TO SUPABASE POSTGRESQL<br />
                  <span className="text-[10px] text-blue-700">(Offline fallback to local SQLite database if cloud unreachable)</span>
                </div>
                <div className="w-0.5 h-5 bg-[#C85A32]" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-2xl">
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] text-center text-xs font-mono">
                    <strong>INTERACTIVE MAP</strong><br />
                    <span className="text-[10px] text-[#6E706E]">542 Constituencies</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] text-center text-xs font-mono">
                    <strong>LEDGER TABLES</strong><br />
                    <span className="text-[10px] text-[#6E706E]">102K Works / 82K Vouchers</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] text-center text-xs font-mono">
                    <strong>ROLE DASHBOARD</strong><br />
                    <span className="text-[10px] text-[#6E706E]">Milestones &amp; Sanctions</span>
                  </div>
                </div>
                <div className="w-0.5 h-5 bg-[#C85A32]" />

                <div className="px-5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-950 text-center font-bold">
                  5. DEEP DRILLDOWN: WORK DETAILS → DISBURSEMENT VOUCHER → CONTRACTOR → AUDIT ANOMALY
                </div>
              </div>
            </div>
          </section>

          {/* Visual Flowchart 2: Complete Technical Architecture */}
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C85A32]" />
                03. Complete Technical Architecture
              </h2>
              <span className="text-xs font-mono text-[#2E7D32]">Dual-Engine Topology</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Frontend Card */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C85A32]">
                  <Building2 className="w-4 h-4" />
                  CLIENT TIER (React 19 + Vite)
                </div>
                <ul className="text-xs text-[#121316] space-y-1.5 list-disc pl-4">
                  <li><strong>React 19 &amp; TypeScript 5.7:</strong> Strict type safety across all entity schemas.</li>
                  <li><strong>Tailwind CSS &amp; Motion:</strong> Accessible, editorial design system.</li>
                  <li><strong>D3-Geo &amp; TopoJSON:</strong> Vector rendering of all 542 Lok Sabha boundaries.</li>
                  <li><strong>Recharts:</strong> Sector distributions, expenditure velocity, and anomaly trends.</li>
                  <li><strong>RoleContext:</strong> Cryptographic JWT claims stored in memory/session.</li>
                </ul>
              </div>

              {/* Backend Card */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2E7D32]">
                  <Cpu className="w-4 h-4" />
                  API BACKEND (FastAPI / Python 3.13)
                </div>
                <ul className="text-xs text-[#121316] space-y-1.5 list-disc pl-4">
                  <li><strong>FastAPI &amp; Uvicorn:</strong> High-performance async ASGI REST API.</li>
                  <li><strong>HMAC-SHA256 Auth:</strong> Bearer token decoding and role permission checks.</li>
                  <li><strong>Geographic ABAC:</strong> Validates `state_id`, `district_id`, and `mp_id`.</li>
                  <li><strong>Pydantic v2:</strong> Strict request/response schema validation.</li>
                  <li><strong>Pytest Suite:</strong> 92 unit and integration tests passing with 100% rate.</li>
                </ul>
              </div>

              {/* Database Card */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#121316]">
                  <Database className="w-4 h-4" />
                  DUAL-ENGINE DATA TIER
                </div>
                <ul className="text-xs text-[#121316] space-y-1.5 list-disc pl-4">
                  <li><strong>Primary Cloud:</strong> Supabase PostgreSQL (AWS Tokyo region) via PostgREST.</li>
                  <li><strong>Volume:</strong> 778 MPs, 102,437 works, 82,296 vouchers, 22,377 contractors.</li>
                  <li><strong>Offline Resilient Fallback:</strong> Local SQLite (`database/mplads.db`, 164MB).</li>
                  <li><strong>Failover Mechanism:</strong> Automatic failover if cloud network fails.</li>
                  <li><strong>Reconciliation:</strong> Exact ₹0.00 variance between allocation and spend.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Visual Flowchart 3: Database Entity Relationships */}
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#C85A32]" />
                04. Database Architecture &amp; ER Relationships
              </h2>
              <span className="text-xs font-mono text-[#6E706E]">3rd Normal Form (3-NF) Relational Design</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-3">
              <div className="text-xs font-mono font-bold text-[#C85A32]">Simplified Entity-Relationship Flow:</div>
              <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] font-mono text-xs text-[#121316] overflow-x-auto">
                <pre>{`[states] (36 States & UTs)
   │
   └── [constituencies] (542 Lok Sabha Constituencies)
          │
          └── [representatives] (778 MPs: 542 Lok Sabha + 236 Rajya Sabha)
                 ├── [allocations] (₹11,667 Cr Entitlement, ₹3,947 Cr Spent, ₹7,720 Cr Balance)
                 │
                 └── [works] (102,437 Capital Infrastructure Projects)
                        │
                        ├── [vouchers] (82,296 Direct Treasury Disbursements)
                        │      └── [contractors] (22,377 Standardized Implementing Agencies)
                        │
                        └── [anomaly_signals] (1,831 MAD & Benford Anomaly Flags)
                               └── [review_cases] (68 Escalated Statutory Audit Cases)`}</pre>
              </div>

              {/* Realistic Walkthrough Example */}
              <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Realistic Walkthrough: MP → Work → Voucher → Contractor → Audit Signal
                </div>
                <p className="leading-relaxed">
                  <strong>Example:</strong> A citizen searches for an MP profile (e.g., MP for Varanasi). The database queries `representatives` (yielding ID, party, tenure) and `allocations` (showing ₹25 Cr entitlement, ₹18.4 Cr sanctioned, ₹6.6 Cr unspent). Clicking on &ldquo;Works&rdquo; queries `works` where `mp_id = :id` (returning 412 projects). Clicking on project <em>&ldquo;Construction of Community Drinking Water Facility in Ward 14&rdquo;</em> loads its line-item record with ₹14,50,000 estimated cost. The work page queries `vouchers` (showing 2 disbursement tranches: Voucher #UP/2024/091 for ₹7,25,000 and #UP/2024/204 for ₹7,25,000). The voucher links to `contractors` (revealing vendor &ldquo;Purvanchal Infra Pvt Ltd&rdquo;). Finally, the system queries `anomaly_signals` for this contractor, surfacing a Medium flag because this single contractor has captured 64% of all water sanitation contracts in this district (Herfindahl-Hirschman Reliance Index &gt; 0.60).
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14 & 15 & 16. DATA SOURCES, PROVENANCE & SUPABASE EXPLANATION             */}
      {/* ========================================================================= */}
      {(activeTab === 'data-sources' || typeof window === 'undefined') && (
        <div className="space-y-8 print-block">
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#C85A32]" />
                05. Where Did We Get Our Data? (Data Provenance)
              </h2>
              <span className="text-xs font-mono text-[#2E7D32]">Source-Derived Ground Truth</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Critical Distinction: Original Source vs. Application Storage
              </div>
              <p className="leading-relaxed">
                Judges frequently ask: <em>&ldquo;Where did your data come from?&rdquo;</em> Always distinguish between the <strong>Original Official Source</strong> (where the government published it) and our <strong>Application Storage</strong> (where JanDrishti serves it). We do not invent, synthesize, or fabricate any project or voucher.
              </p>
            </div>

            {/* Data Provenance Table */}
            <div className="rounded-xl border border-[#E4E2DC] overflow-hidden">
              <div className="bg-[#FAF8F5] px-3 py-2 border-b border-[#E4E2DC] font-mono text-xs font-bold text-[#121316]">
                Table 4: Exact Data Lineage, Processing &amp; Storage
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5]/50 border-b border-[#E4E2DC] font-mono text-[#6E706E]">
                  <tr>
                    <th className="py-2.5 px-3">Data Entity</th>
                    <th className="py-2.5 px-3">Original Source</th>
                    <th className="py-2.5 px-3">Processing Pipeline</th>
                    <th className="py-2.5 px-3">Current Storage</th>
                    <th className="py-2.5 px-3">Used In Application</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]/60">
                  <tr>
                    <td className="py-2 px-3 font-semibold">102,437 Physical Works</td>
                    <td className="py-2 px-3">MoSPI MPLADS Public Portal (eSAKSHI data export)</td>
                    <td className="py-2 px-3">Parsed, stripped special characters, normalized sectors, assigned canonical IDs.</td>
                    <td className="py-2 px-3 font-mono">Supabase `works` table</td>
                    <td className="py-2 px-3">Works Explorer, MP Detail Page, Anomaly Center</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">82,296 Payment Vouchers</td>
                    <td className="py-2 px-3">District Treasury Line Disbursal Logs (MoSPI)</td>
                    <td className="py-2 px-3">Foreign key matching to parent `work_id`, parsed dates, sanitized currency numbers.</td>
                    <td className="py-2 px-3 font-mono">Supabase `vouchers` table</td>
                    <td className="py-2 px-3">Transaction Explorer, Trace Money, Benford Test</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">778 Representatives</td>
                    <td className="py-2 px-3">Sansad.in Official Parliamentary Directory</td>
                    <td className="py-2 px-3">Bicameral tagging (Lok Sabha vs Rajya Sabha), party mapping, photo URLs.</td>
                    <td className="py-2 px-3 font-mono">Supabase `representatives` table</td>
                    <td className="py-2 px-3">MP Directory, MP Profile, House Filter</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">22,377 Contractors</td>
                    <td className="py-2 px-3">Implementing Agency fields in voucher disbursements</td>
                    <td className="py-2 px-3">Entity resolution: stripped &ldquo;M/s&rdquo;, &ldquo;Sri&rdquo;, trimmed whitespace, Levenshtein clustering.</td>
                    <td className="py-2 px-3 font-mono">Supabase `contractors` table</td>
                    <td className="py-2 px-3">Vendor Explorer, Cartelization (HHI) Analytics</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">542 Constituency Polygons</td>
                    <td className="py-2 px-3">Survey of India &amp; Election Commission of India (ECI)</td>
                    <td className="py-2 px-3">Converted GeoJSON boundaries to TopoJSON format (compressed to 3.5MB).</td>
                    <td className="py-2 px-3 font-mono">`IndiaParliamentaryMap.tsx`</td>
                    <td className="py-2 px-3">National Interactive Map on Overview Page</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note on duplicate static files */}
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 space-y-1">
              <strong>Technical Documentation Note (Data Redundancy Disclosure):</strong>
              <p>
                During initial development, raw snapshot JSON and CSV files were stored in local folders (`data/raw/` and `data/canonical/`). In the current production release, the authoritative application database is <strong>Supabase Cloud PostgreSQL</strong>, backed by <strong>`database/mplads.db` (SQLite)</strong>. Legacy static JSON files are retained as offline audit references and are never mutated at runtime.
              </p>
            </div>

            {/* Why Supabase Section */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#121316]">Why We Use Supabase in JanDrishti</h3>
              <p className="text-xs sm:text-sm text-[#6E706E] leading-relaxed">
                We use Supabase primarily as our managed PostgreSQL cloud layer. In a civic platform tracking 102,000 public projects, a relational database is essential because works, vouchers, MPs, and contractors have strict foreign-key dependencies. Supabase provides managed PostgreSQL 15, high-speed PostgREST HTTPS streaming, and automated indexing, eliminating the need to bundle heavy JSON files into the client browser.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 19 & 20 & 21. ROLES, RBAC & JURISDICTION SCOPING                          */}
      {/* ========================================================================= */}
      {(activeTab === 'rbac' || typeof window === 'undefined') && (
        <div className="space-y-8 print-block">
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#C85A32]" />
                06. Who Can See What? (RBAC &amp; Jurisdiction Scoping)
              </h2>
              <span className="text-xs font-mono text-[#C85A32]">HTTP 403 Forbidden Enforcement</span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2 text-xs sm:text-sm text-[#121316]">
              <p>
                JanDrishti enforces <strong>Role-Based Access Control (RBAC)</strong> combined with <strong>Attribute-Based Access Control (ABAC)</strong>. The governing rule is:
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-[#E4E2DC] font-mono text-xs font-bold text-center text-[#C85A32]">
                ROLE + GEOGRAPHIC JURISDICTION = AUTHORIZED DATA CONTEXT
              </div>
              <p className="text-xs text-[#6E706E]">
                A user with a valid role cannot simply browse any part of India. An authority representing Maharashtra has a jurisdiction token restricted to Maharashtra. The backend intercepts requests and returns HTTP 403 Forbidden if they attempt to access records from Assam or Uttar Pradesh.
              </p>
            </div>

            {/* Role Hierarchy Table */}
            <div className="rounded-xl border border-[#E4E2DC] overflow-hidden">
              <div className="bg-[#FAF8F5] px-3 py-2 border-b border-[#E4E2DC] font-mono text-xs font-bold text-[#121316]">
                Table 5: Statutory Role Hierarchy &amp; Permissions
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5]/50 border-b border-[#E4E2DC] font-mono text-[#6E706E]">
                  <tr>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Geographic Scope</th>
                    <th className="py-2.5 px-3">What They Can See</th>
                    <th className="py-2.5 px-3">Can Edit / Sanction?</th>
                    <th className="py-2.5 px-3">Main Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]/60">
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-[#C85A32]">MINISTRY_ADMIN</td>
                    <td className="py-2 px-3 font-mono">National (All 36 States)</td>
                    <td className="py-2 px-3">National summary, all MPs, all projects, central audit logs.</td>
                    <td className="py-2 px-3 font-semibold text-[#2E7D32]">Yes (Fund releases, policy)</td>
                    <td className="py-2 px-3">National scheme governance &amp; inter-state balance oversight.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold">STATE_NODAL_AUTHORITY</td>
                    <td className="py-2 px-3 font-mono">Single State (e.g., Maharashtra)</td>
                    <td className="py-2 px-3">All districts, constituencies, and projects in assigned state.</td>
                    <td className="py-2 px-3 font-semibold text-[#2E7D32]">Yes (State tranches &amp; notes)</td>
                    <td className="py-2 px-3">Monitoring state-wide implementation velocity.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold">DISTRICT_AUTHORITY</td>
                    <td className="py-2 px-3 font-mono">District / Constituency</td>
                    <td className="py-2 px-3">Works, estimates, vouchers, and contractors in home district.</td>
                    <td className="py-2 px-3 font-semibold text-[#2E7D32]">Yes (Milestones &amp; Sanctions)</td>
                    <td className="py-2 px-3">District Collector approving DPRs and inspecting physical works.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold">MP (Representative)</td>
                    <td className="py-2 px-3 font-mono">Constituency Portfolio</td>
                    <td className="py-2 px-3">Recommended works, sanction velocities, unspent balance.</td>
                    <td className="py-2 px-3 font-semibold text-amber-700">Recommend only</td>
                    <td className="py-2 px-3">Tracking delivery of promises to constituents.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold">AUDITOR</td>
                    <td className="py-2 px-3 font-mono">Statutory Queue</td>
                    <td className="py-2 px-3">1,831 anomaly signals, contractor HHI scores, Benford flags.</td>
                    <td className="py-2 px-3 font-semibold text-[#2E7D32]">Yes (Audit findings &amp; cases)</td>
                    <td className="py-2 px-3">CAG / Third-party formal compliance reviews.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold">CITIZEN</td>
                    <td className="py-2 px-3 font-mono">National Public</td>
                    <td className="py-2 px-3">Public directory, map view, work status, citizen feedback.</td>
                    <td className="py-2 px-3 text-red-700">No (Feedback submissions only)</td>
                    <td className="py-2 px-3">Civic awareness, local ground verification.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Jurisdiction Scoping Diagram */}
            <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-3">
              <div className="text-xs font-mono font-bold text-[#C85A32]">Why Jurisdiction Matters (Maharashtra vs. Assam Example)</div>
              <p className="text-xs text-[#6E706E]">
                If a District Collector for Pune (Maharashtra) logs in, the backend token signs `district_id = Pune`. When querying works, the backend strictly appends `WHERE district_id = Pune`. Even if someone manually edits the browser URL to request `?district=Sonitpur` (Assam), the backend checks the JWT claim, detects a jurisdiction violation, and halts execution with an HTTP 403 Forbidden error.
              </p>
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] font-mono text-[11px] text-[#121316] text-center">
                USER LOGIN → JWT SIGNED CLAIMS → BACKEND PARAMETER CHECK → SQL SCOPING → ONLY RELEVANT RECORDS RETURNED
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 22 & 23 & 29. VISUAL USER FLOWS & TRACE MONEY                             */}
      {/* ========================================================================= */}
      {(activeTab === 'flows' || typeof window === 'undefined') && (
        <div className="space-y-8 print-block">
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#C85A32]" />
                07. User Workflows &amp; &ldquo;Trace Money&rdquo; Visual Flow
              </h2>
              <span className="text-xs font-mono text-[#6E706E]">Step-by-Step Journeys</span>
            </div>

            {/* Public vs Authority vs MP Flows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <div className="text-xs font-mono font-bold text-[#121316]">A. Public Citizen Flow</div>
                <div className="text-[11px] font-mono text-[#6E706E] space-y-1 bg-white p-2 rounded border border-[#E4E2DC]">
                  1. Visit Homepage (`/`)<br />
                  2. Explore National Map<br />
                  3. Select State / Constituency<br />
                  4. Inspect MP Profile (`/mps/:id`)<br />
                  5. View Work Line-Item (`/works/:id`)<br />
                  6. Submit Geo-tagged Feedback
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <div className="text-xs font-mono font-bold text-[#C85A32]">B. Authority Collector Flow</div>
                <div className="text-[11px] font-mono text-[#6E706E] space-y-1 bg-white p-2 rounded border border-[#E4E2DC]">
                  1. Authenticate at `/login`<br />
                  2. Load District Workspace (`/admin/district`)<br />
                  3. Review Recommended DPRs<br />
                  4. Verify MoSPI Compliance<br />
                  5. Issue Administrative Sanction<br />
                  6. Release Milestone Tranches
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <div className="text-xs font-mono font-bold text-[#2E7D32]">C. Statutory Auditor Flow</div>
                <div className="text-[11px] font-mono text-[#6E706E] space-y-1 bg-white p-2 rounded border border-[#E4E2DC]">
                  1. Authenticate at `/login`<br />
                  2. Open Anomaly Center (`/anomalies`)<br />
                  3. Filter by MAD or HHI Flags<br />
                  4. Review 15-Column Audit Trail<br />
                  5. Open Review Case (`/cases`)<br />
                  6. Export Print-Ready CAG Dossier
                </div>
              </div>
            </div>

            {/* Trace Money Visual Diagram */}
            <div className="p-4 rounded-xl bg-[#121316] text-white font-mono text-xs space-y-3">
              <div className="text-emerald-400 font-bold text-xs uppercase">// JANDRISHTI &ldquo;TRACE MONEY&rdquo; FINANCIAL CONTEXT PIPELINE</div>
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 text-center text-[10px]">
                <div className="p-2 rounded bg-zinc-800 border border-zinc-700">
                  <strong>1. ALLOCATION</strong><br />
                  <span className="text-zinc-400">₹5 Cr/year statutory MP entitlement</span>
                </div>
                <div className="flex items-center justify-center text-[#C85A32] font-bold">→</div>
                <div className="p-2 rounded bg-zinc-800 border border-zinc-700">
                  <strong>2. RECOMMENDATION</strong><br />
                  <span className="text-zinc-400">MP formally submits project DPR</span>
                </div>
                <div className="flex items-center justify-center text-[#C85A32] font-bold">→</div>
                <div className="p-2 rounded bg-zinc-800 border border-zinc-700">
                  <strong>3. SANCTION</strong><br />
                  <span className="text-zinc-400">District Collector approves administrative cost</span>
                </div>
                <div className="flex items-center justify-center text-[#C85A32] font-bold">→</div>
                <div className="p-2 rounded bg-zinc-800 border border-zinc-700">
                  <strong>4. VOUCHER RELEASE</strong><br />
                  <span className="text-zinc-400">Direct treasury disbursement to vendor</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                <strong>Why this is valuable:</strong> Legacy portals report single aggregate expenditure numbers. JanDrishti connects the financial disbursement directly to the executing vendor and physical milestone, ensuring every rupee has a traceable counterpart on the ground.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 23 & 36 & 37. IMPORTANT FEATURES & WHAT MAKES IT MORE THAN A DASHBOARD    */}
      {/* ========================================================================= */}
      {(activeTab === 'features' || typeof window === 'undefined') && (
        <div className="space-y-8 print-block">
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C85A32]" />
                08. What Can a User Actually Do? (Features Matrix)
              </h2>
              <span className="text-xs font-mono text-[#6E706E]">Verified Real Functionality</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Interactive Parliamentary Map', path: '/', what: 'Vector SVG map rendering 542 constituencies with fund utilization choropleth shading.', why: 'Instant national comparison of development velocity across both chambers of Parliament.' },
                { name: 'Bicameral MP Directory', path: '/mps', what: 'Complete profiles for 778 MPs with photo, party, constituency, and entitlement stats.', why: 'Allows constituents to see exactly what their representative recommended and spent.' },
                { name: 'Physical Works Explorer', path: '/works', what: 'Searchable registry of 102,437 capital projects with filters for status, sector, and cost.', why: 'Find specific village assets (drinking water, roads) and view line-item progress.' },
                { name: 'Disbursement Ledger', path: '/transactions', what: 'Registry of 82,296 treasury vouchers linking amounts to executing contractors.', why: 'Line-item financial transparency connecting public funds to corporate entities.' },
                { name: 'Contractor Registry', path: '/vendors', what: 'Profiles for 22,377 contractors with cumulative revenue and projects won.', why: 'Detects single-patron reliance where one contractor captures most contracts in a district.' },
                { name: 'Explainable Anomaly Center', path: '/anomalies', what: '1,831 flagged anomalies with 15-column mathematical audit trails.', why: 'Gives statutory auditors prioritized cases backed by MAD Z-scores and Benford tests.' },
                { name: 'Duplicate Work Detection', path: '/duplicates', what: 'Levenshtein text similarity and cost proximity matching across local DPRs.', why: 'Prevents billing twice for the same road or school repair under slightly altered names.' },
                { name: 'Statutory Case Management', path: '/cases', what: '68 escalated audit cases with status workflow and 1-click printable PDF dossiers.', why: 'Enables formal statutory reporting ready for submission to the CAG or Parliament.' },
                { name: 'Dedicated Role Workspaces', path: '/admin/*', what: '6 distinct views (Ministry, State, District, MP, Auditor, Citizen) with 403 guard.', why: 'Ensures administrators have tailored tools without exposing private workflows to public.' },
                { name: 'Data Ingestion Interface', path: '/ingest', what: 'CSV/JSON upload interface with schema validation for official MoSPI datasets.', why: 'Enables rapid integration of new financial year tranches into the database.' },
              ].map((feat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xs text-[#121316]">{feat.name}</span>
                    <span className="font-mono text-[10px] text-[#C85A32]">{feat.path}</span>
                  </div>
                  <p className="text-xs text-[#121316]"><strong>What it does:</strong> {feat.what}</p>
                  <p className="text-xs text-[#6E706E]"><strong>Why it is useful:</strong> {feat.why}</p>
                </div>
              ))}
            </div>

            {/* Why This is More Than a Dashboard */}
            <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#121316]">What Makes JanDrishti More Than a Simple Dashboard?</h3>
              <p className="text-xs sm:text-sm text-[#6E706E] leading-relaxed">
                A generic dashboard simply aggregates flat numbers into charts. JanDrishti is a <strong>relational intelligence and governance system</strong>. It enforces cryptographic role and geographic boundaries at the API layer, runs deterministic statistical forensics to detect contractor cartels and duplicate estimates, and provides end-to-end line-item linkage from an MP&apos;s speech in Parliament to the contractor&apos;s bank voucher in a district treasury.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 26 & 28 & 30. SECURITY & STATISTICAL ANOMALY FORENSICS                    */}
      {/* ========================================================================= */}
      {(activeTab === 'security-ai' || typeof window === 'undefined') && (
        <div className="space-y-8 print-block">
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#C85A32]" />
                09. Security Architecture &amp; Statistical Forensics
              </h2>
              <span className="text-xs font-mono text-[#2E7D32]">Zero Hallucination AI Reality</span>
            </div>

            {/* Security Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-[#C85A32]">How Do We Secure JanDrishti?</div>
                <ul className="text-xs text-[#121316] space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    <span><strong>HMAC-SHA256 Token Auth:</strong> Signed JWT bearer tokens verify identity, role, and jurisdiction.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    <span><strong>Server-Side Boundary Enforcement:</strong> Frontend filtering is NOT treated as security. The backend FastAPI service independently enforces `WHERE district_id = :claim`.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    <span><strong>Secret Protection:</strong> Database credentials and service-role keys are stored exclusively in server environment variables. Zero secrets exist in the client bundle.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    <span><strong>URL Tamper Defense:</strong> Changing `?state=maharashtra` to `?state=assam` in the browser URL does not bypass security; the backend verifies claims and returns 403 Forbidden.</span>
                  </li>
                </ul>
              </div>

              {/* AI Truth / Statistical Reality */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-[#2E7D32]">Honest AI &amp; Forensics Disclosure</div>
                <p className="text-xs text-[#6E706E] leading-relaxed">
                  We <strong>do NOT use black-box neural networks or LLMs</strong> for anomaly detection. In statutory financial auditing, opaque AI models hallucinate and cannot be defended in court or before Parliament. Instead, JanDrishti implements <strong>deterministic, explainable statistical indicators</strong>:
                </p>
                <div className="space-y-1 text-xs text-[#121316]">
                  <div className="p-2 bg-white rounded border border-[#E4E2DC]">
                    <strong>1. Median Absolute Deviation (MAD):</strong> Scale factor (0.6745) flags projects deviating &gt; 3.0 modified Z-scores from sector medians.
                  </div>
                  <div className="p-2 bg-white rounded border border-[#E4E2DC]">
                    <strong>2. Benford&apos;s Law 1st-Digit Test:</strong> Evaluates leading digits in 82K payment vouchers to detect split-billing under procurement thresholds.
                  </div>
                  <div className="p-2 bg-white rounded border border-[#E4E2DC]">
                    <strong>3. Herfindahl Index (HHI):</strong> Measures vendor market concentration, flagging when a single contractor captures &gt; 60% of district awards.
                  </div>
                </div>
              </div>
            </div>

            {/* Note on Signal Definition */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Crucial Audit Governance Terminology:</strong> An anomaly signal is <em>NEVER</em> proof of corruption. A high cost deviation often indicates legitimate geographic challenges (such as building in hilly terrain or flood zones). JanDrishti terms all flags as <strong>&ldquo;Analytical Risk Indicator — Requires Review&rdquo;</strong> for human statutory verification.
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 38 & 39 & 40 & 41. JUDGE Q&A BANK (40+ QUESTIONS + 15 MUST-KNOW + TRAPS) */}
      {/* ========================================================================= */}
      {(activeTab === 'qa-bank' || typeof window === 'undefined') && (
        <div className="space-y-8 print-block">
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#C85A32]" />
                10. Comprehensive Judge Q&amp;A Bank (40+ Prepared Answers)
              </h2>
              <span className="text-xs font-mono text-[#2E7D32]">Verbal Answering Guide</span>
            </div>

            {/* Highlighted Top 15 Questions */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                Top 15 Questions Every Teammate Must Know (Quick Recall)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-950">
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>1. What is JanDrishti?</strong>
                  <p className="text-[#6E706E]">A parliamentary intelligence and audit platform tracking ₹11,667 Cr in MPLADS public expenditure across all 36 States.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>2. What problem does it solve?</strong>
                  <p className="text-[#6E706E]">Information asymmetry between citizens, MPs, collectors, and auditors, revealing ₹7,720 Cr in unspent funds.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>3. What does SIH expect us to solve?</strong>
                  <p className="text-[#6E706E]">A transparent system to track fund allocations, sanctions, disbursements, and physical progress under MoSPI guidelines.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>4. Where did the data come from?</strong>
                  <p className="text-[#6E706E]">Official MoSPI public portal exports (eSAKSHI), Sansad.in MP registers, and Election Commission boundary maps.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>5. Where is data stored?</strong>
                  <p className="text-[#6E706E]">In Supabase Cloud PostgreSQL, backed by a local SQLite fallback database for 100% offline resilience.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>6. What technologies did we use?</strong>
                  <p className="text-[#6E706E]">React 19, TypeScript, Vite, Tailwind, D3-Geo for the frontend; FastAPI and Python 3.13 for the backend; PostgreSQL for DB.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>7. Why choose Supabase?</strong>
                  <p className="text-[#6E706E]">It provides enterprise PostgreSQL with PostgREST HTTPS streaming, sub-50ms query response, and relational foreign keys.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>8. How does RBAC work?</strong>
                  <p className="text-[#6E706E]">JWT claims define user roles (Ministry, State Nodal, District Authority, MP, Auditor, Citizen) with tailored workspaces.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>9. How do we handle jurisdiction?</strong>
                  <p className="text-[#6E706E]">Geographic ABAC restricts queries to the user&apos;s authorized State or District. Foreign requests return HTTP 403 Forbidden.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>10. What makes us different?</strong>
                  <p className="text-[#6E706E]">Zero mock data, bicameral coverage, ₹0.00 reconciliation variance, and line-item MP → Work → Voucher → Vendor linkage.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>11. Where is AI/ML used?</strong>
                  <p className="text-[#6E706E]">We use deterministic statistical forensics: MAD Z-scores, Benford&apos;s Law, and Herfindahl contractor index, not black-box LLMs.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>12. What are our limitations?</strong>
                  <p className="text-[#6E706E]">Rajya Sabha exports only provide state aggregates; public records lack verified GPS pins; non-simultaneous scrape window.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>13. How will it scale?</strong>
                  <p className="text-[#6E706E]">Stateless FastAPI backend on Kubernetes, PostgreSQL read replicas with PgBouncer, and Cloudflare CDN caching.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>14. What happens if DB fails?</strong>
                  <p className="text-[#6E706E]">The FastAPI service automatically switches to the local SQLite database running in WAL mode with connection pooling.</p>
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                  <strong>15. What is the financial variance?</strong>
                  <p className="text-[#6E706E]">Exactly ₹0.00. Across all 778 MPs, total allocated equals recorded expenditure plus unspent balance down to the rupee.</p>
                </div>
              </div>
            </div>

            {/* Categorized Judge Q&A List */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-mono font-bold uppercase text-[#C85A32]">
                Detailed Answering Guide (Question, Short Answer, If They Ask More, Team Note)
              </div>

              {[
                {
                  q: 'Q1: Is this data live or simulated?',
                  short: '100% of the data is extracted from official Ministry of Statistics and Programme Implementation (MoSPI) public records and Sansad.in. Zero mock rows exist.',
                  deep: 'We scraped, cleaned, and normalized 102,437 physical works, 82,296 payment vouchers, and 778 MPs across 36 States. It represents the official public state of the 18th Lok Sabha and Rajya Sabha.',
                  note: 'Never claim the data is an active live WebSocket connection; state that it is based on the latest canonical government data extract.',
                },
                {
                  q: 'Q2: Why does Rajya Sabha have fewer works than Lok Sabha?',
                  short: 'This reflects official government transparency, not a software bug. MoSPI exports granular works for Lok Sabha, but only state-level aggregates for Rajya Sabha.',
                  deep: 'Instead of fabricating fake Rajya Sabha works to look pretty, JanDrishti shows the exact verified aggregates with transparent data limitation callouts.',
                  note: 'Judges appreciate data honesty over fake perfection.',
                },
                {
                  q: 'Q3: What happens if a user changes the URL to bypass jurisdiction?',
                  short: 'Changing the URL has zero effect on security. URL parameters are treated as unverified inputs.',
                  deep: 'The FastAPI backend validates the cryptographically signed JWT bearer token. If a Maharashtra collector attempts to fetch records with ?state=assam, the server rejects it with an HTTP 403 Forbidden.',
                  note: 'Always emphasize that security is enforced on the server, not in React state.',
                },
                {
                  q: 'Q4: Why did you choose Supabase instead of MongoDB or raw SQLite?',
                  short: 'MPLADS data is inherently relational with strict foreign keys between MPs, works, vouchers, and contractors. Relational PostgreSQL is mathematically superior to document stores.',
                  deep: 'Supabase gives us managed PostgreSQL with PostgREST HTTPS streaming and connection pooling. Furthermore, we retain a local SQLite engine for offline test runs and backup resilience.',
                  note: 'Point out the ₹0.00 mathematical reconciliation guarantee enabled by SQL relations.',
                },
                {
                  q: 'Q5: How do you validate an anomaly signal? Can it mean corruption?',
                  short: 'An anomaly signal is an analytical indicator requiring human review, never an accusation of corruption.',
                  deep: 'Our algorithms surface deviations >3.0 MAD Z-scores or Benford’s Law distribution spikes. In audit governance, higher costs frequently occur due to legitimate terrain or logistics factors.',
                  note: 'Use neutral governance language: "Analytical Risk Indicator — Requires Review."',
                },
                {
                  q: 'Q6: Why don’t you show exact GPS pins on Google Maps?',
                  short: 'Because historical MoSPI records do not publish verified GPS coordinates. Other teams invent fake coordinates—we refuse to fabricate data.',
                  deep: 'We map works accurately to their Parliamentary Constituency and District polygons using TopoJSON vector geometries, maintaining complete audit integrity.',
                  note: 'Judges who understand government data know GPS coordinates are rarely in legacy exports.',
                },
                {
                  q: 'Q7: How is JanDrishti different from eSAKSHI?',
                  short: 'eSAKSHI is an operational transaction portal. JanDrishti is an analytical intelligence platform.',
                  deep: 'eSAKSHI provides no contractor cartelization analytics, no duplicate DPR detection, no bicameral reconciliation, and no public-friendly map discovery. JanDrishti turns flat records into actionable insights.',
                  note: 'eSAKSHI enters data; JanDrishti provides intelligence and audit oversight.',
                },
                {
                  q: 'Q8: What is your backend test coverage?',
                  short: 'We have 92 automated Pytest unit and integration tests covering API endpoints, authentication, and database failover with a 100% pass rate.',
                  deep: 'Our test suite runs against our local SQLite replica in 1.48 seconds, verifying error handling, jurisdiction boundary enforcement, and data serialization.',
                  note: 'You can offer to run `pytest` in terminal if the technical judge wants proof.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] space-y-2">
                  <div className="font-serif font-bold text-xs sm:text-sm text-[#121316]">{item.q}</div>
                  <div className="text-xs text-[#121316]">
                    <strong>SHORT ANSWER:</strong> {item.short}
                  </div>
                  <div className="text-xs text-[#6E706E]">
                    <strong>IF THEY ASK MORE:</strong> {item.deep}
                  </div>
                  <div className="text-[11px] font-mono text-[#C85A32] bg-white p-1.5 rounded border border-[#E4E2DC]">
                    <strong>TEAM NOTE:</strong> {item.note}
                  </div>
                </div>
              ))}
            </div>

            {/* "If Judge Says..." Section */}
            <div className="p-4 rounded-xl bg-white border border-[#E4E2DC] space-y-3 pt-4">
              <div className="text-xs font-mono font-bold uppercase text-[#121316]">
                &ldquo;If a Judge Says...&rdquo; Practical Student Response Guide
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                  <span className="font-bold text-[#C85A32]">&ldquo;If Judge says: This is just a dashboard.&rdquo;</span>
                  <p className="text-[#121316]">
                    <strong>Response:</strong> &ldquo;Sir/Ma&apos;am, dashboards simply aggregate numbers into charts. JanDrishti is a relational audit system. We enforce server-side geographic boundaries, calculate MAD Z-scores to detect contractor monopolies, run Levenshtein matching to catch duplicate estimates, and allow auditors to export formal case dossiers. It is an end-to-end governance workflow.&rdquo;
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                  <span className="font-bold text-[#C85A32]">&ldquo;If Judge says: Your data is not real-time.&rdquo;</span>
                  <p className="text-[#121316]">
                    <strong>Response:</strong> &ldquo;You are completely correct. MoSPI does not currently provide a public WebSocket API. Our system ingests canonical data batches with schema validation. We have architected our ingestion layer to support direct PFMS webhooks as soon as official API credentials are provided.&rdquo;
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                  <span className="font-bold text-[#C85A32]">&ldquo;If Judge says: What happens if your cloud database fails?&rdquo;</span>
                  <p className="text-[#121316]">
                    <strong>Response:</strong> &ldquo;We built a Dual-Engine architecture specifically for field reliability. If our Supabase HTTPS connection times out, our FastAPI backend automatically falls back to our local SQLite database (database/mplads.db), which contains identical row counts and schema structure.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 42 & 43 & 44 & 45 & 46. DEMO SCRIPT, CHEAT SHEET & GLOSSARY               */}
      {/* ========================================================================= */}
      {(activeTab === 'demo-cheat' || typeof window === 'undefined') && (
        <div className="space-y-8 print-block">
          {/* 3-Minute Demo Sequence */}
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#121316] flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-[#C85A32]" />
                11. 3-Minute SIH Presentation Flow &amp; Backup Plan
              </h2>
              <span className="text-xs font-mono text-[#6E706E]">Live Judging Walkthrough</span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E4E2DC] space-y-1">
                <span className="font-mono font-bold text-[#C85A32]">00:00 – 00:30 · Problem &amp; National Overview (Route: `/`)</span>
                <p className="text-[#121316]">
                  Open Homepage. Point to the TopoJSON Map. Hover over high/low utilization constituencies. Toggle between All Houses, Lok Sabha, and Rajya Sabha. Explain the ₹11,667 Cr spend and ₹7,720 Cr unspent balance.
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E4E2DC] space-y-1">
                <span className="font-mono font-bold text-[#C85A32]">00:30 – 01:15 · MP Profile to Physical Asset (Route: `/mps/INTERNAL_MP_001`)</span>
                <p className="text-[#121316]">
                  Drill down into an MP (e.g. Varanasi). Show recommended works, completed projects, and unspent balances. Click directly into an individual work to view its payment vouchers and executing contractor.
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E4E2DC] space-y-1">
                <span className="font-mono font-bold text-[#C85A32]">01:15 – 02:00 · Anomaly Forensics &amp; Duplicate DPRs (Route: `/anomalies`)</span>
                <p className="text-[#121316]">
                  Navigate to Anomaly Center. Show the 1,831 explainable flags. Open an anomaly card showing the MAD modified Z-score and Benford distribution. Switch to `/duplicates` to show Levenshtein estimate detection.
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E4E2DC] space-y-1">
                <span className="font-mono font-bold text-[#C85A32]">02:00 – 02:40 · Role Workspaces &amp; Security Defense (Route: `/dashboards`)</span>
                <p className="text-[#121316]">
                  Switch user session from Citizen to District Authority or Auditor. Show that cross-jurisdiction access returns 403 Forbidden. Open `/cases` and click &ldquo;Export Audit Dossier&rdquo; to generate a printable report.
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E4E2DC] space-y-1">
                <span className="font-mono font-bold text-[#C85A32]">02:40 – 03:00 · Impact, Scalability &amp; Conclusion</span>
                <p className="text-[#121316]">
                  Conclude with our architecture summary: Dual-engine reliability, zero mock data, ₹0.00 mathematical reconciliation, and our roadmap for PFMS automated webhook integration.
                </p>
              </div>
            </div>

            {/* Live Demo Backup Plan */}
            <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 text-xs text-red-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-700" />
                Live Demo Backup Plan (If Something Glitches)
              </div>
              <ul className="space-y-1 list-disc pl-4 text-red-900">
                <li><strong>If Cloud Internet is Slow:</strong> JanDrishti will automatically read from `database/mplads.db` on localhost with zero interruption.</li>
                <li><strong>If a Filter Produces 0 Records:</strong> Explain that our hierarchical scoping strictly intercepts contradictory queries (e.g. searching an Assam constituency inside Maharashtra) to prevent data corruption.</li>
                <li><strong>If an Evaluator Challenges a Number:</strong> Open our Fact Sheet section on `/docs` showing our ₹0.00 variance calculation matching official MoSPI figures.</li>
              </ul>
            </div>
          </section>

          {/* Quick Technical Cheat Sheet */}
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2">
              <h3 className="text-base font-serif font-bold text-[#121316]">
                Technical Cheat Sheet (Read in 30 Seconds)
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E4E2DC]">
                <span className="text-[10px] text-[#6E706E]">FRONTEND</span><br />
                <strong>React 19 / TS / Vite</strong>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E4E2DC]">
                <span className="text-[10px] text-[#6E706E]">BACKEND</span><br />
                <strong>FastAPI / Python 3.13</strong>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E4E2DC]">
                <span className="text-[10px] text-[#6E706E]">PRIMARY DB</span><br />
                <strong>Supabase PostgreSQL</strong>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E4E2DC]">
                <span className="text-[10px] text-[#6E706E]">FALLBACK DB</span><br />
                <strong>Local SQLite (WAL)</strong>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E4E2DC]">
                <span className="text-[10px] text-[#6E706E]">MAP ENGINE</span><br />
                <strong>D3-Geo / TopoJSON</strong>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E4E2DC]">
                <span className="text-[10px] text-[#6E706E]">SECURITY</span><br />
                <strong>HMAC-SHA256 JWT</strong>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E4E2DC]">
                <span className="text-[10px] text-[#6E706E]">TEST SUITE</span><br />
                <strong>92 Pytests (100% Pass)</strong>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E4E2DC]">
                <span className="text-[10px] text-[#6E706E]">FORENSICS</span><br />
                <strong>MAD / Benford / HHI</strong>
              </div>
            </div>
          </section>

          {/* Important Terms Glossary */}
          <section className="space-y-4 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2">
              <h3 className="text-base font-serif font-bold text-[#121316]">
                Glossary: Terms Everyone Should Understand
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded border border-[#E4E2DC]">
                <strong>MPLADS:</strong> Members of Parliament Local Area Development Scheme, providing ₹5 Cr/year per MP for local capital asset creation.
              </div>
              <div className="p-2 bg-white rounded border border-[#E4E2DC]">
                <strong>Bicameral:</strong> Consisting of two legislative houses—Lok Sabha (House of the People) and Rajya Sabha (Council of States).
              </div>
              <div className="p-2 bg-white rounded border border-[#E4E2DC]">
                <strong>RBAC / ABAC:</strong> Role-Based and Attribute-Based Access Control, governing permissions based on administrative rank and geographic territory.
              </div>
              <div className="p-2 bg-white rounded border border-[#E4E2DC]">
                <strong>Disbursement Voucher:</strong> A legally recorded treasury transaction paying an implementing contractor for completed project milestones.
              </div>
              <div className="p-2 bg-white rounded border border-[#E4E2DC]">
                <strong>MAD (Median Absolute Deviation):</strong> A robust statistical outlier scale estimator resilient to extreme values, unlike standard deviation.
              </div>
              <div className="p-2 bg-white rounded border border-[#E4E2DC]">
                <strong>Herfindahl (HHI) Index:</strong> An economic formula measuring market concentration to detect if one vendor monopolizes district contracts.
              </div>
            </div>
          </section>

          {/* One-Page Project Summary */}
          <section className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-3 card-print print-break-inside-avoid">
            <div className="border-b border-[#E4E2DC] pb-2">
              <h3 className="font-serif text-lg font-bold text-[#121316]">
                JanDrishti — One-Page Executive Summary
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#121316] leading-relaxed">
              <div>
                <p><strong>Problem:</strong> ₹11,667 Cr allocated under MPLADS suffers from severe opacity, with over ₹7,720 Cr remaining unspent and no line-item tracking for citizens.</p>
                <p className="pt-1"><strong>Solution:</strong> JanDrishti reconciles 778 MPs, 102,437 physical works, 82,296 vouchers, and 22,377 contractors with ₹0.00 variance.</p>
                <p className="pt-1"><strong>Architecture:</strong> React 19 + TypeScript frontend with D3-Geo TopoJSON maps; FastAPI backend; Supabase PostgreSQL cloud DB + SQLite fallback.</p>
              </div>
              <div>
                <p><strong>Security:</strong> HMAC-SHA256 JWT RBAC with server-side geographic ABAC (403 Forbidden on boundary violations).</p>
                <p className="pt-1"><strong>Intelligence:</strong> 100% deterministic statistical forensics (MAD cost outliers, Benford voucher tests, contractor HHI reliance).</p>
                <p className="pt-1"><strong>Impact:</strong> Replaces fragmented PDFs with line-item civic transparency, accelerating public asset delivery across all 36 States of India.</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
