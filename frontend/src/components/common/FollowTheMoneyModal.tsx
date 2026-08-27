import React, { useState } from 'react';
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
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface FollowTheMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState?: string | null;
}

export const FollowTheMoneyModal: React.FC<FollowTheMoneyModalProps> = ({
  isOpen,
  onClose,
  selectedState,
}) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const lineageNodes = [
    {
      id: 'national',
      stage: '01. CONSOLIDATED FUND OF INDIA',
      title: 'National Exchequer Allocation',
      headline: '₹11,667.55 Crore Total Sanctioned Limit',
      detail: 'MoSPI statutory budget limit allocated across 778 Parliamentary constituencies and State Council quotas.',
      icon: Landmark,
      metricLabel: 'National Corpus',
      metricValue: '₹11,667.55 Cr',
      actionUrl: '/states',
      actionLabel: 'View 28 States & 8 UT Allocations',
    },
    {
      id: 'state',
      stage: '02. GEOGRAPHIC DISTRIBUTION',
      title: 'State & Union Territory Quota',
      headline: selectedState ? `${selectedState} Geographic Corpus` : '28 States & 8 Union Territories',
      detail: 'Aggregated state allocations deposited into nodal district authorities for parliamentary implementation.',
      icon: MapPin,
      metricLabel: 'State Velocity',
      metricValue: '33.83% Nat. Avg',
      actionUrl: `/states`,
      actionLabel: 'Explore State Leaderboard',
    },
    {
      id: 'house',
      stage: '03. PARLIAMENTARY CHAMBER',
      title: 'Bicameral Allocation Split',
      headline: '543 Lok Sabha + 235 Rajya Sabha Quotas',
      detail: 'Constituency-bound representatives vs. state-wide Council of States members with separate financial ledgers.',
      icon: Users,
      metricLabel: 'Active Members',
      metricValue: '778 MPs',
      actionUrl: '/mps',
      actionLabel: 'Filter by Chamber',
    },
    {
      id: 'mp',
      stage: '04. MEMBER OF PARLIAMENT',
      title: 'Individual Recommendation Ledger',
      headline: 'Statutory ₹5.00 Cr / Year Member Limit',
      detail: 'MPs recommend community development schemes to the Nodal District Authority for technical approval.',
      icon: Users,
      metricLabel: 'Sanction Cap',
      metricValue: '₹5.00 Cr / yr',
      actionUrl: '/mps',
      actionLabel: 'Search All Representatives',
    },
    {
      id: 'work',
      stage: '05. PHYSICAL WORKS REGISTRY',
      title: 'Infrastructure & Community Projects',
      headline: '102,437 Works (Sanctioned & Completed)',
      detail: 'Drinking water, road connectivity, education, public health, and sanitation works with execution milestones.',
      icon: Layers,
      metricLabel: 'Completed Projects',
      metricValue: '61,842 Works',
      actionUrl: '/works',
      actionLabel: 'Inspect Works Registry',
    },
    {
      id: 'voucher',
      stage: '06. TREASURY DISBURSEMENT',
      title: 'Line-Item Payment Vouchers',
      headline: '82,296 Disbursed Treasury Transactions',
      detail: 'Direct benefit and contractor payment vouchers released from district treasury accounts to executing agencies.',
      icon: Receipt,
      metricLabel: 'Recorded Outflow',
      metricValue: '₹3,947.46 Cr',
      actionUrl: '/transactions',
      actionLabel: 'Audit Transaction Ledger',
    },
    {
      id: 'vendor',
      stage: '07. EXECUTING CONTRACTORS',
      title: 'Vendor Procurement Footprints',
      headline: '22,377 Commercial Entities & Agencies',
      detail: 'Private contractors, state corporations, and district societies executing approved civil and physical works.',
      icon: Building2,
      metricLabel: 'Procurement Entities',
      metricValue: '22,377 Contractors',
      actionUrl: '/vendors',
      actionLabel: 'Analyze Contractor Reliance',
    },
    {
      id: 'signal',
      stage: '08. STATISTICAL SIGNALS',
      title: 'Explainable Analytical Audit',
      headline: '1,831 Statistical Variance Signals',
      detail: 'Rapid zero-day disbursements, repeated exact round-amount values, and single-contractor concentration percentiles.',
      icon: ShieldAlert,
      metricLabel: 'Audited Indicators',
      metricValue: '1,831 Signals',
      actionUrl: '/anomalies',
      actionLabel: 'Investigate Analytical Signals',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/75">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-800 text-[10px] font-mono font-bold uppercase border border-brand-200">
                <Sparkles className="w-3 h-3 text-brand-600" />
                SIGNATURE INTELLIGENCE ENGINE
              </span>
              <ProvenanceBadge type="CALCULATED" />
            </div>
            <h2 className="text-xl font-black text-navy-950 mt-1">
              FOLLOW THE MONEY: END-TO-END PUBLIC FINANCE LINEAGE
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Trace statutory funds from the Consolidated Fund of India down to physical works, transaction vouchers, and statistical signals.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Stepper Navigation Bar */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-100 overflow-x-auto bg-white shrink-0 scrollbar-none">
          {lineageNodes.map((node, idx) => {
            const isActive = activeStep === idx;
            const Icon = node.icon;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-navy-950 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-navy-950'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-300' : 'text-slate-400'}`} />
                <span>{node.title.split(' ')[0]}</span>
                {idx < lineageNodes.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-300 ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Active Stage Feature Card */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-brand-700 uppercase tracking-wider">
                    {lineageNodes[activeStep].stage}
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-navy-950">
                    Step {activeStep + 1} of 8
                  </span>
                </div>

                <h3 className="text-2xl font-black text-navy-950">
                  {lineageNodes[activeStep].title}
                </h3>
                <p className="text-base font-bold text-slate-700">
                  {lineageNodes[activeStep].headline}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lineageNodes[activeStep].detail}
                </p>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {lineageNodes[activeStep].metricLabel}
                    </span>
                    <span className="text-xl font-black font-mono text-navy-950">
                      {lineageNodes[activeStep].metricValue}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(lineageNodes[activeStep].actionUrl);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-950 hover:bg-brand-900 text-white font-bold text-xs shadow-xs transition active:scale-95"
                  >
                    <span>{lineageNodes[activeStep].actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Truthful Provenance Notice */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Strict Source Provenance:</strong> Line-item lineage is derived exclusively from published MoSPI transaction ledgers. Where granular work-to-vendor relationships are not present in source exports, synthetic links are never fabricated.
                </p>
              </div>
            </div>

            {/* Right: Full Interactive Pipeline Trace */}
            <div className="lg:col-span-5 space-y-2 border-l border-slate-100 pl-0 lg:pl-6">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                COMPLETE FINANCIAL LINEAGE PIPELINE
              </span>
              <div className="space-y-1.5">
                {lineageNodes.map((node, idx) => {
                  const isCurrent = activeStep === idx;
                  const isPast = activeStep > idx;
                  const Icon = node.icon;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setActiveStep(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-brand-50 border-brand-300 text-brand-950 font-bold shadow-xs'
                          : isPast
                          ? 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-navy-950 text-white'
                              : isPast
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-[11px]">{node.title}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        {node.metricValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <button
            type="button"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Previous Stage
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            Stage {activeStep + 1} / {lineageNodes.length}
          </span>

          <button
            type="button"
            disabled={activeStep === lineageNodes.length - 1}
            onClick={() => setActiveStep((prev) => Math.min(lineageNodes.length - 1, prev + 1))}
            className="px-4 py-2 rounded-lg bg-navy-950 hover:bg-brand-900 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next Stage →
          </button>
        </div>
      </div>
    </div>
  );
};
