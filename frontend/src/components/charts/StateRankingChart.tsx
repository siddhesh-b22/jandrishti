import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { StateSummary } from '../../api/types';

interface Props {
  states: StateSummary[];
  onSelectState?: (stateName: string) => void;
}

export const StateRankingChart: React.FC<Props> = ({ states, onSelectState }) => {
  const [rankingMode, setRankingMode] = useState<'UTILIZATION' | 'EXPENDITURE' | 'WORKS'>('UTILIZATION');

  const sortedStates = [...states]
    .sort((a, b) => {
      if (rankingMode === 'UTILIZATION') return b.state_utilization_pct - a.state_utilization_pct;
      if (rankingMode === 'EXPENDITURE') return b.total_expenditure - a.total_expenditure;
      return b.total_recommended_works - a.total_recommended_works;
    })
    .slice(0, 10)
    .map((s) => ({
      name: s.state.length > 14 ? s.state.slice(0, 12) + '...' : s.state,
      fullName: s.state,
      utilization: parseFloat(s.state_utilization_pct.toFixed(1)),
      expenditureCr: parseFloat((s.total_expenditure / 1e7).toFixed(2)),
      allocatedCr: parseFloat((s.total_allocated_amount / 1e7).toFixed(2)),
      works: s.total_recommended_works,
      mps: s.total_mps,
      value:
        rankingMode === 'UTILIZATION'
          ? parseFloat(s.state_utilization_pct.toFixed(1))
          : rankingMode === 'EXPENDITURE'
          ? parseFloat((s.total_expenditure / 1e7).toFixed(2))
          : s.total_recommended_works,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#08102B] text-white p-4 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-1.5 font-manrope min-w-[210px]">
          <div className="font-extrabold text-blue-400 border-b border-slate-700/80 pb-1 flex justify-between">
            <span>{data.fullName}</span>
            <span className="text-slate-400 font-mono text-[11px]">{data.mps} MPs</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400 font-mono">
            <span className="text-slate-400 font-sans">Fund Utilization:</span>
            <strong>{data.utilization}%</strong>
          </div>
          <div className="flex justify-between items-center text-slate-300 font-mono">
            <span className="text-slate-400 font-sans">Disbursed Spend:</span>
            <strong>₹{data.expenditureCr.toLocaleString()} Cr</strong>
          </div>
          <div className="flex justify-between items-center text-slate-300 font-mono">
            <span className="text-slate-400 font-sans">Total Works:</span>
            <strong>{data.works.toLocaleString()}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (index: number) => {
    if (rankingMode === 'UTILIZATION') {
      return index < 3 ? '#10B981' : index < 7 ? '#2563EB' : '#60A5FA';
    }
    if (rankingMode === 'EXPENDITURE') {
      return index < 3 ? '#2563EB' : index < 7 ? '#3B82F6' : '#93C5FD';
    }
    return '#8B5CF6';
  };

  return (
    <div className="space-y-4">
      {/* Metric Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold font-manrope">
          <button
            type="button"
            onClick={() => setRankingMode('UTILIZATION')}
            className={`px-3 py-1 rounded-full transition ${
              rankingMode === 'UTILIZATION' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Utilization Rate (%)
          </button>
          <button
            type="button"
            onClick={() => setRankingMode('EXPENDITURE')}
            className={`px-3 py-1 rounded-full transition ${
              rankingMode === 'EXPENDITURE' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disbursed Funds (₹ Cr)
          </button>
          <button
            type="button"
            onClick={() => setRankingMode('WORKS')}
            className={`px-3 py-1 rounded-full transition ${
              rankingMode === 'WORKS' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delivered Works
          </button>
        </div>

        <span className="text-xs font-bold text-slate-500 font-manrope">
          Top 10 Performing State Jurisdictions
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedStates}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload.length && onSelectState) {
                onSelectState(data.activePayload[0].payload.fullName);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis
              type="number"
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (rankingMode === 'UTILIZATION' ? `${v}%` : rankingMode === 'EXPENDITURE' ? `₹${v}Cr` : v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              width={85}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
              {sortedStates.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
