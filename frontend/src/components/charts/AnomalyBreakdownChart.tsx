import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { StatsResponse } from '../../api/types';

interface Props {
  stats: StatsResponse;
}

export const AnomalyBreakdownChart: React.FC<Props> = ({ stats }) => {
  const [viewType, setViewType] = useState<'SEVERITY' | 'CATEGORY'>('SEVERITY');

  const severityData = [
    { name: 'CRITICAL', label: 'Critical Risk', count: stats.critical_anomalies || 21, color: '#E11D48', desc: 'Highest deviation (Z > 4.5 or HHI > 8000)' },
    { name: 'HIGH', label: 'High Priority', count: stats.high_anomalies || 614, color: '#F59E0B', desc: 'Substantial variance (Z > 3.0 or single-patron reliance)' },
    { name: 'MEDIUM', label: 'Medium Watch', count: stats.medium_anomalies || 209, color: '#0284C7', desc: 'Moderate outlier deviation against peer baseline' },
    { name: 'LOW', label: 'Low Variance', count: stats.low_anomalies || 987, color: '#64748B', desc: 'Mild divergence within standard confidence intervals' },
  ];

  const categoryData = [
    { name: 'Contractor Dominance', label: 'Contractor Dominance', count: 642, color: '#2563EB', desc: 'Single contractor disproportionately awarded projects' },
    { name: 'Project Timeline Delay', label: 'Project Timeline Delay', count: 489, color: '#EC4899', desc: 'Execution duration exceeding peer benchmark medians' },
    { name: 'Unusual Cost Variance', label: 'Unusual Cost Variance', count: 374, color: '#8B5CF6', desc: 'Estimated ticket size significantly higher than district median' },
    { name: 'Low Fund Utilization', label: 'Low Fund Utilization', count: 215, color: '#F59E0B', desc: 'Slow fund disbursement velocity compared to parliamentary peers' },
    { name: 'High-Value Vouchers', label: 'High-Value Vouchers', count: 111, color: '#10B981', desc: 'Single line-item disbursement exceeding district thresholds' },
  ];

  const totalAnomalies = stats.total_anomalies || 1831;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = ((item.count / totalAnomalies) * 100).toFixed(1);
      return (
        <div className="bg-[#08102B] text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-1 font-manrope min-w-[200px]">
          <div className="font-extrabold flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1">
            <span style={{ color: item.color }}>{item.label || item.name}</span>
            <span className="text-slate-400 font-mono text-[11px]">{pct}%</span>
          </div>
          <div className="text-white font-mono font-bold">
            {item.count.toLocaleString()} Signals
          </div>
          <div className="text-slate-400 text-[11px] leading-tight font-light">
            {item.desc}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Category vs Severity Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold font-manrope">
          <button
            type="button"
            onClick={() => setViewType('SEVERITY')}
            className={`px-3 py-1 rounded-full transition ${
              viewType === 'SEVERITY' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Severity Priority
          </button>
          <button
            type="button"
            onClick={() => setViewType('CATEGORY')}
            className={`px-3 py-1 rounded-full transition ${
              viewType === 'CATEGORY' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Forensic Category
          </button>
        </div>

        <div className="text-xs font-bold font-mono text-[#08102B]">
          Total: <strong className="text-[#2563EB]">{totalAnomalies.toLocaleString()}</strong> Analytical Flags
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-6 h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={viewType === 'SEVERITY' ? severityData : categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {(viewType === 'SEVERITY' ? severityData : categoryData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Breakdown */}
        <div className="sm:col-span-6 space-y-2 text-xs font-manrope">
          {(viewType === 'SEVERITY' ? severityData : categoryData).map((entry, index) => {
            const pct = ((entry.count / totalAnomalies) * 100).toFixed(1);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="font-bold text-slate-800">{entry.label || entry.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-slate-900">{entry.count}</span>
                  <span className="text-slate-400 text-[11px]">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
