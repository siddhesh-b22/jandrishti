import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { WorkCategory } from '../../api/types';

interface Props {
  categories: WorkCategory[];
}

export const SectorDistributionChart: React.FC<Props> = ({ categories }) => {
  const navigate = useNavigate();
  const [metricMode, setMetricMode] = useState<'WORKS' | 'AMOUNT'>('WORKS');

  const defaultCategories: WorkCategory[] = categories.length
    ? categories
    : [
        { category: 'Drinking Water & Sanitation', total_works: 42150, total_recommended_amount: 45000000000, total_final_amount: 38200000000, completed_works_count: 24100 },
        { category: 'Roads, Bridges & Connectivity', total_works: 28400, total_recommended_amount: 32000000000, total_final_amount: 27500000000, completed_works_count: 15200 },
        { category: 'Education & Community Facilities', total_works: 19800, total_recommended_amount: 21000000000, total_final_amount: 18400000000, completed_works_count: 12100 },
        { category: 'Healthcare & Public Welfare', total_works: 12087, total_recommended_amount: 14000000000, total_final_amount: 12572500000, completed_works_count: 10442 },
      ];

  const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0284C7'];

  const data = defaultCategories.map((c, i) => ({
    name: c.category.length > 18 ? c.category.slice(0, 16) + '...' : c.category,
    fullName: c.category,
    works: c.total_works,
    completed: c.completed_works_count,
    amountCr: parseFloat((c.total_final_amount / 1e7).toFixed(2)),
    value: metricMode === 'WORKS' ? c.total_works : parseFloat((c.total_final_amount / 1e7).toFixed(2)),
    color: colors[i % colors.length],
  }));

  const handleBarClick = (entry: any) => {
    const item = entry?.activePayload?.[0]?.payload || entry;
    if (item && item.fullName) {
      navigate(`/works?category=${encodeURIComponent(item.fullName)}`);
    } else {
      navigate('/works');
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#08102B] text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-1.5 font-manrope min-w-[220px]">
          <div className="font-extrabold text-blue-400 border-b border-slate-700/80 pb-1">
            {item.fullName}
          </div>
          <div className="flex justify-between items-center text-slate-300 font-mono">
            <span className="text-slate-400 font-sans">Total Works:</span>
            <strong>{item.works.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between items-center text-emerald-400 font-mono">
            <span className="text-slate-400 font-sans">Delivered Works:</span>
            <strong>{item.completed.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between items-center text-amber-400 font-mono">
            <span className="text-slate-400 font-sans">Total Spend:</span>
            <strong>₹{item.amountCr.toLocaleString()} Cr</strong>
          </div>
          <div className="pt-1 text-[10px] text-blue-400 border-t border-slate-800 text-center font-bold">
            👆 Click bar to inspect {item.works.toLocaleString()} works in this sector →
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 font-manrope">
      {/* Metric Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMetricMode('WORKS')}
            className={`px-3 py-1 rounded-full transition ${
              metricMode === 'WORKS' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Projects Count
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('AMOUNT')}
            className={`px-3 py-1 rounded-full transition ${
              metricMode === 'AMOUNT' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Capital Spend (₹ Cr)
          </button>
        </div>

        <span className="text-xs font-bold text-slate-500">
          102,437 Public Works Distributed
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72 cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              interval={0}
              angle={-10}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (metricMode === 'WORKS' ? `${(v / 1000).toFixed(0)}k` : `₹${v}Cr`)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={34}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
