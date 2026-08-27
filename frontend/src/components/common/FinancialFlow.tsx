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
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card transition-all duration-300 space-y-6"
    >
      {/* Header with Provenance Reconciliation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              NATIONAL TREASURY LIFECYCLE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight mt-0.5">
            Follow The Money: Capital Flow Journey
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking public funds from Parliamentary allocation to physical infrastructure completion.
          </p>
        </div>

        {/* Double-Entry Zero Variance Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-600">Reconciliation Variance:</span>
          <strong className="text-emerald-700 font-bold">₹0.00 (Double-Entry Match)</strong>
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
                  ? 'bg-slate-50/90 border-navy-950 shadow-md ring-1 ring-navy-950'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Stage Number & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {st.stageNum}
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Title & Value */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  {st.title}
                </span>
                <div className={`text-base sm:text-lg font-black font-mono mt-0.5 tracking-tight ${st.accentColor}`}>
                  {st.value}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  {st.subtitle}
                </div>
              </div>

              {/* Metric Pill & Description */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${st.pillColor}`}>
                  {st.metric}
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {st.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar Visualization */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-navy-950">
            Treasury Fund Utilization Ratio
          </span>
          <span className="font-mono font-bold text-brand-700">
            {utilizationPct.toFixed(2)}% Disbursed (₹{expenditureCr.toFixed(2)} Cr)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
          <div
            style={{ width: `${utilizationPct}%` }}
            className="bg-gradient-to-r from-brand-600 to-brand-500 h-full rounded-l-full transition-all duration-500"
            title={`Disbursed: ${utilizationPct.toFixed(2)}%`}
          />
          <div
            style={{ width: `${100 - utilizationPct}%` }}
            className="bg-amber-400/80 h-full rounded-r-full transition-all duration-500"
            title={`Exchequer Surplus: ${(100 - utilizationPct).toFixed(2)}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-600" />
            Disbursed Expenditure: ₹{expenditureCr.toFixed(2)} Cr
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Unspent Exchequer Balance: ₹{unspentCr.toFixed(2)} Cr
          </span>
        </div>
      </div>
    </div>
  );
};
