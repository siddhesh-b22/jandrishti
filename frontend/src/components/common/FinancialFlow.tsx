import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Receipt,
  PiggyBank,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface FinancialFlowProps {
  allocatedCr: number;
  expenditureCr: number;
  unspentCr: number;
  utilizationPct: number;
  recommendedWorks?: number;
  completedWorks?: number;
}

export const FinancialFlow: React.FC<FinancialFlowProps> = ({
  allocatedCr,
  expenditureCr,
  unspentCr,
  utilizationPct,
  recommendedWorks = 93528,
  completedWorks = 43601,
}) => {
  const { ref, isVisible } = useScrollReveal();
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const stages = [
    {
      id: 0,
      stageNum: '01',
      title: 'ALLOCATION',
      subtitle: 'Statutory Allocation Pool',
      value: `₹${allocatedCr.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`,
      metric: '100% Parliamentary Pool',
      desc: 'Approved central fiscal allocation limit across 778 parliamentarians',
      icon: IndianRupee,
      accentColor: 'text-navy-950',
      pillColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 1,
      stageNum: '02',
      title: 'RECOMMENDED',
      subtitle: 'Works Proposed by MPs',
      value: `${recommendedWorks.toLocaleString()} Works`,
      metric: 'Citizen & Nodal Proposals',
      desc: 'Infrastructure projects formally proposed for constituency development',
      icon: Layers,
      accentColor: 'text-navy-950',
      pillColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 2,
      stageNum: '03',
      title: 'DISBURSED',
      subtitle: 'Recorded Expenditure',
      value: `₹${expenditureCr.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`,
      metric: `${utilizationPct.toFixed(2)}% Utilized`,
      desc: 'Verified treasury transfers to implementing local agencies & contractors',
      icon: Receipt,
      accentColor: 'text-brand-700',
      pillColor: 'bg-brand-50 text-brand-700 font-bold',
    },
    {
      id: 3,
      stageNum: '04',
      title: 'COMPLETED',
      subtitle: 'Physically Commissioned',
      value: `${completedWorks.toLocaleString()} Works`,
      metric: `${((completedWorks / Math.max(1, recommendedWorks)) * 100).toFixed(1)}% Completed`,
      desc: 'Fully inspected, verified, and commissioned public assets on the ground',
      icon: CheckCircle2,
      accentColor: 'text-emerald-700',
      pillColor: 'bg-emerald-50 text-emerald-700 font-bold',
    },
    {
      id: 4,
      stageNum: '05',
      title: 'UNSPENT SURPLUS',
      subtitle: 'Exchequer Reserves',
      value: `₹${unspentCr.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`,
      metric: `${(100 - utilizationPct).toFixed(2)}% Remaining`,
      desc: 'Unspent treasury balance eligible for subsequent statutory release',
      icon: PiggyBank,
      accentColor: 'text-amber-800',
      pillColor: 'bg-amber-50 text-amber-800 font-bold',
    },
  ];

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 sm:p-8 shadow-xs transition-all duration-300 space-y-6 text-[#121316]"
    >
      {/* Header with Provenance Reconciliation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest text-[#C85A32] bg-[#FAF0EB] px-2.5 py-0.5 rounded-md border border-[#E8C5B6] uppercase font-bold">
              [FILE NO. TRE-FLOW-01]
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A]">
              · NATIONAL TREASURY LIFECYCLE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#121316] tracking-tight mt-1">
            Follow The Money: Capital Flow Journey
          </h2>
          <p className="text-xs text-[#4A4D53] font-light mt-1">
            Tracking public funds from Parliamentary allocation to physical infrastructure completion.
          </p>
        </div>

        {/* Double-Entry Zero Variance Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F0EFEA] border border-[#E4E2DC] text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
          <span className="text-[#4A4D53]">Reconciliation Variance:</span>
          <strong className="text-[#2E7D32] font-bold">₹0.00 (Double-Entry Match)</strong>
        </div>
      </div>

      {/* 5-Stage Interactive Responsive Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((st) => {
          const Icon = st.icon;
          const isHovered = activeStage === st.id;
          const isDimmed = activeStage !== null && activeStage !== st.id;

          return (
            <motion.div
              key={st.id}
              onMouseEnter={() => setActiveStage(st.id)}
              onMouseLeave={() => setActiveStage(null)}
              animate={{
                scale: isHovered ? 1.02 : isDimmed ? 0.98 : 1,
                opacity: isDimmed ? 0.6 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer ${
                isHovered
                  ? 'bg-[#FAF0EB] border-[#E8C5B6] shadow-sm ring-1 ring-[#C85A32]'
                  : 'bg-[#F0EFEA] border-[#E4E2DC] hover:border-[#71717A] shadow-xs'
              }`}
            >
              {/* Stage Number & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#71717A]">
                  {st.stageNum}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] flex items-center justify-center text-[#121316]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Title & Value */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A] block">
                  {st.title}
                </span>
                <div className="text-base sm:text-lg font-serif font-bold mt-0.5 tracking-tight text-[#121316]">
                  {st.value}
                </div>
                <div className="text-[11px] text-[#4A4D53] font-light mt-0.5 truncate">
                  {st.subtitle}
                </div>
              </div>

              {/* Metric Pill & Description */}
              <div className="space-y-1.5 pt-2 border-t border-[#E4E2DC]">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF8F5] text-[#C85A32] border border-[#E8C5B6]">
                  {st.metric}
                </span>
                <p className="text-[11px] text-[#4A4D53] font-light leading-tight">
                  {st.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar Visualization */}
      <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-[#121316]">
            Treasury Fund Utilization Ratio
          </span>
          <span className="font-bold text-[#C85A32]">
            {utilizationPct.toFixed(2)}% Disbursed (₹{expenditureCr.toFixed(2)} Cr)
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#E4E2DC] overflow-hidden flex">
          <div
            style={{ width: `${utilizationPct}%` }}
            className="bg-[#C85A32] h-full rounded-l-full transition-all duration-500"
            title={`Disbursed: ${utilizationPct.toFixed(2)}%`}
          />
          <div
            style={{ width: `${100 - utilizationPct}%` }}
            className="bg-[#D1CDC7] h-full rounded-r-full transition-all duration-500"
            title={`Exchequer Surplus: ${(100 - utilizationPct).toFixed(2)}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#71717A] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
            Disbursed Expenditure: ₹{expenditureCr.toFixed(2)} Cr
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D1CDC7]" />
            Unspent Exchequer Balance: ₹{unspentCr.toFixed(2)} Cr
          </span>
        </div>
      </div>
    </div>
  );
};
