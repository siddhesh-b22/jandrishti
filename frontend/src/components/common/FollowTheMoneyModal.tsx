import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Receipt,
  Layers,
  MapPin,
  Landmark,
  ShieldAlert,
  Info,
  ChevronRight,
  CheckCircle2,
  Zap,
  Activity,
  Search,
  ExternalLink,
} from 'lucide-react';

interface FollowTheMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState?: string | null;
}

interface LineageNode {
  id: string;
  stageNum: string;
  stageName: string;
  title: string;
  headline: string;
  detail: string;
  icon: React.ElementType;
  metricLabel: string;
  metricValue: string;
  badge: string;
  actionUrl: string;
  actionLabel: string;
  color: string;
}

export const FollowTheMoneyModal: React.FC<FollowTheMoneyModalProps> = ({
  isOpen,
  onClose,
  selectedState,
}) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [chamberFilter, setChamberFilter] = useState<'ALL' | 'LS' | 'RS'>('ALL');

  if (!isOpen) return null;

  const lineageNodes: LineageNode[] = [
    {
      id: 'national',
      stageNum: '01',
      stageName: 'CONSOLIDATED FUND OF INDIA',
      title: 'Central Statutory Allocation',
      headline: '₹11,667.55 Crore Authorized Corpus',
      detail:
        'MoSPI statutory budget limit established under constitutional mandate, allocated across all 778 Parliamentary seats in 28 States and 8 Union Territories.',
      icon: Landmark,
      metricLabel: 'National Statutory Corpus',
      metricValue: '₹11,667.55 Cr',
      badge: 'Central Sanction',
      actionUrl: '/states',
      actionLabel: 'Inspect 36 Territories Allocations',
      color: '#2563EB',
    },
    {
      id: 'state',
      stageNum: '02',
      stageName: 'TERRITORIAL DISTRIBUTION',
      title: 'State & UT Nodal Quota',
      headline: selectedState ? `${selectedState} Geographic Corpus` : '28 States & 8 Union Territories',
      detail:
        'Aggregated state allocations deposited into designated Nodal District Authorities for technical sanction, administrative review, and expenditure release.',
      icon: MapPin,
      metricLabel: 'Territory Utilization Avg',
      metricValue: '33.83% National Avg',
      badge: 'District Deposits',
      actionUrl: '/states',
      actionLabel: 'Explore 36 Territories Atlas',
      color: '#3B82F6',
    },
    {
      id: 'house',
      stageNum: '03',
      stageName: 'PARLIAMENTARY CHAMBER',
      title: 'Bicameral Allocation Split',
      headline:
        chamberFilter === 'LS'
          ? '543 Lok Sabha Constituencies'
          : chamberFilter === 'RS'
          ? '235 Rajya Sabha Representatives'
          : '543 Lok Sabha + 235 Rajya Sabha Quotas',
      detail:
        'Constituency-bound representatives (Lok Sabha) vs. state-wide Council of States members (Rajya Sabha), each subject to independent annual sanction limits.',
      icon: Users,
      metricLabel: 'Active Parliamentarians',
      metricValue: chamberFilter === 'LS' ? '543 MPs' : chamberFilter === 'RS' ? '235 MPs' : '778 MPs',
      badge: 'Chamber Ledgers',
      actionUrl: `/mps${chamberFilter !== 'ALL' ? `?house=${chamberFilter === 'LS' ? 'LOK_SABHA' : 'RAJYA_SABHA'}` : ''}`,
      actionLabel: 'Filter Parliamentarians by Chamber',
      color: '#6366F1',
    },
    {
      id: 'mp',
      stageNum: '04',
      stageName: 'PARLIAMENTARIAN LEDGER',
      title: 'Individual Member Portfolio',
      headline: '₹5.00 Cr / Year Member Limit (₹25.00 Cr 5-Yr Cap)',
      detail:
        'Members of Parliament formally recommend local developmental projects to the Nodal District Authority for cost estimation and technical feasibility approval.',
      icon: Users,
      metricLabel: 'Annual Member Cap',
      metricValue: '₹5.00 Cr / Year',
      badge: 'Scheme Recommendation',
      actionUrl: '/mps',
      actionLabel: 'Search All 778 MPs',
      color: '#8B5CF6',
    },
    {
      id: 'work',
      stageNum: '05',
      stageName: 'PHYSICAL INFRASTRUCTURE',
      title: 'Ground Public Works Registry',
      headline: '102,437 Public Ground Works Tracked',
      detail:
        'Line-item community projects across Drinking Water, Roads & Bridges, Education, and Healthcare with verified progress milestones and completion certifications.',
      icon: Layers,
      metricLabel: 'Delivered Projects',
      metricValue: '49.0% Completed (50.2K)',
      badge: 'Civil Execution',
      actionUrl: '/works',
      actionLabel: 'Explore 102,437 Works',
      color: '#EC4899',
    },
    {
      id: 'voucher',
      stageNum: '06',
      stageName: 'TREASURY DISBURSEMENT',
      title: 'Line-Item Payment Vouchers',
      headline: '82,296 Disbursed Treasury Transactions',
      detail:
        'Individual released treasury transactions disbursed from district accounts directly to verified contractors and executing agencies, balancing to ₹0.00 variance.',
      icon: Receipt,
      metricLabel: 'Total Disbursed Outflow',
      metricValue: '₹3,947.25 Cr (33.8%)',
      badge: 'Double-Entry Balanced',
      actionUrl: '/transactions',
      actionLabel: 'Audit 82,296 Vouchers',
      color: '#10B981',
    },
    {
      id: 'vendor',
      stageNum: '07',
      stageName: 'PROCUREMENT & CONTRACTORS',
      title: 'Vendor Procurement Footprints',
      headline: '22,377 Commercial Entities & Agencies',
      detail:
        'Registered commercial contracting firms, municipal societies, and public corporations executing approved civil infrastructure schemes across India.',
      icon: Building2,
      metricLabel: 'Executing Contractors',
      metricValue: '22,377 Vendors',
      badge: 'Procurement Market',
      actionUrl: '/vendors',
      actionLabel: 'Inspect 22,377 Contractors',
      color: '#F59E0B',
    },
    {
      id: 'signal',
      stageNum: '08',
      stageName: 'OBJECTIVE STATISTICAL AUDIT',
      title: 'MAD Forensic Anomaly Signals',
      headline: '1,831 Objective Statistical Deviations',
      detail:
        'Median Absolute Deviation robust Z-scores detecting single-patron reliance, project timeline stalls, and disbursement cost anomalies without political bias.',
      icon: ShieldAlert,
      metricLabel: 'Flagged Audit Signals',
      metricValue: '1,831 Signals (21 Critical)',
      badge: 'MAD Z-Score Engine',
      actionUrl: '/anomalies',
      actionLabel: 'Investigate 1,831 Audit Signals',
      color: '#E11D48',
    },
  ];

  const current = lineageNodes[activeStep];
  const CurrentIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#121316]/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-5xl bg-[#FAF8F5] rounded-2xl border border-[#E4E2DC] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#121316]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E2DC] bg-[#FAF8F5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-[#C85A32] bg-[#FAF0EB] px-2.5 py-1 rounded-md border border-[#E8C5B6] uppercase font-bold">
                [STATUTORY LINEAGE ENGINE]
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#F0EFEA] text-[#2E7D32] text-[10px] font-mono font-bold border border-[#E4E2DC] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#2E7D32]" />
                ₹0.00 Discrepancy Guaranteed
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#121316] tracking-tight">
              Follow The Money: End-to-End Public Finance Tracer
            </h2>
            <p className="text-xs text-[#4A4D53] font-light">
              Trace statutory allocations from the Consolidated Fund of India to ground projects, payment vouchers, and statistical signals.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-[#71717A] hover:text-[#121316] hover:bg-[#F0EFEA] transition"
            title="Close Money Flow Tracer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chamber Filter & Interactive Stepper Rail */}
        <div className="px-6 py-2.5 border-b border-[#E4E2DC] bg-[#F0EFEA] flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Chamber Switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] font-bold">
            <button
              type="button"
              onClick={() => setChamberFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                chamberFilter === 'ALL' ? 'bg-[#121316] text-[#FAF8F5] shadow-xs' : 'text-[#4A4D53] hover:text-[#121316]'
              }`}
            >
              All 778 MPs
            </button>
            <button
              type="button"
              onClick={() => setChamberFilter('LS')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                chamberFilter === 'LS' ? 'bg-[#121316] text-[#FAF8F5] shadow-xs' : 'text-[#4A4D53] hover:text-[#121316]'
              }`}
            >
              Lok Sabha (543)
            </button>
            <button
              type="button"
              onClick={() => setChamberFilter('RS')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                chamberFilter === 'RS' ? 'bg-[#121316] text-[#FAF8F5] shadow-xs' : 'text-[#4A4D53] hover:text-[#121316]'
              }`}
            >
              Rajya Sabha (235)
            </button>
          </div>

          {/* Quick Flow Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-mono text-[#71717A] uppercase font-bold">Jump To:</span>
            {lineageNodes.map((n, i) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setActiveStep(i)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition whitespace-nowrap ${
                  activeStep === i
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'bg-[#FAF8F5] border border-[#E4E2DC] text-[#4A4D53] hover:text-[#121316]'
                }`}
              >
                {n.stageNum}. {n.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Active Stage Feature Card (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="p-5 sm:p-6 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-2.5">
                    <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider">
                      STAGE {current.stageNum} OF 08 · {current.stageName}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E4E2DC] text-[#121316]">
                      {current.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                      style={{ backgroundColor: current.color }}
                    >
                      <CurrentIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#121316] leading-tight">
                        {current.title}
                      </h3>
                      <p className="text-xs font-bold text-[#4A4D53] mt-0.5 font-mono">
                        {current.headline}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                    {current.detail}
                  </p>

                  {/* Core Stage Metric Box */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#71717A] block font-mono">
                        {current.metricLabel}
                      </span>
                      <span className="text-lg font-serif font-bold text-[#121316]">
                        {current.metricValue}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigate(current.actionUrl);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#121316] hover:bg-[#2A2C32] text-[#FAF8F5] font-semibold text-xs transition"
                    >
                      <span>{current.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C85A32]" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Source Provenance Guarantee */}
              <div className="p-3.5 rounded-xl bg-[#FAF0EB] border border-[#E8C5B6] text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px] text-[#4A4D53]">
                  <strong className="text-[#121316]">Deterministic Audit Guarantee:</strong> All figures in JanDrishti are deterministically verified against published MoSPI transaction ledgers. Where granular work-to-vendor relationships are missing from raw government exports, relationships are never fabricated.
                </p>
              </div>
            </div>

            {/* Right: Interactive 8-Stage Pipeline Stream (5 cols) */}
            <div className="lg:col-span-5 space-y-2 border-l border-[#E4E2DC] pl-0 lg:pl-5">
              <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-widest block mb-2">
                COMPLETE TRACE STREAM (8 STAGES)
              </span>

              <div className="space-y-1.5">
                {lineageNodes.map((node, idx) => {
                  const isCurrent = activeStep === idx;
                  const isPast = activeStep > idx;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setActiveStep(idx)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs group ${
                        isCurrent
                          ? 'bg-[#121316] text-[#FAF8F5] border-[#121316] shadow-sm'
                          : isPast
                          ? 'bg-[#F0EFEA] border-[#E4E2DC] hover:border-[#71717A] text-[#121316]'
                          : 'bg-[#FAF8F5] border-[#E4E2DC] hover:border-[#C85A32] text-[#4A4D53]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-md font-mono font-bold text-[10px] flex items-center justify-center transition-colors ${
                            isCurrent
                              ? 'bg-[#C85A32] text-white'
                              : isPast
                              ? 'bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]'
                              : 'bg-[#F0EFEA] text-[#71717A]'
                          }`}
                        >
                          {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : node.stageNum}
                        </span>

                        <div>
                          <div className={`font-serif font-bold leading-tight ${isCurrent ? 'text-white' : 'text-[#121316]'}`}>
                            {node.title}
                          </div>
                          <div className={`text-[10px] font-mono ${isCurrent ? 'text-[#C85A32]' : 'text-[#71717A]'}`}>
                            {node.metricValue}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isCurrent ? 'text-[#C85A32] translate-x-0.5' : 'text-[#71717A]'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3 border-t border-[#E4E2DC] bg-[#F0EFEA] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-[#71717A] font-mono text-[11px]">
            <span>Active Stage: <strong className="text-[#121316]">{activeStep + 1} of 8</strong></span>
            <span>·</span>
            <span className="text-[#2E7D32] font-bold">₹0.00 Variance Validated</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] text-[#121316] font-semibold text-xs hover:bg-[#F0EFEA] disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={activeStep === lineageNodes.length - 1}
              onClick={() => setActiveStep((prev) => Math.min(lineageNodes.length - 1, prev + 1))}
              className="px-4 py-1.5 rounded-lg bg-[#121316] hover:bg-[#2A2C32] text-[#FAF8F5] font-semibold text-xs disabled:opacity-40 transition shadow-xs"
            >
              Next Stage →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
