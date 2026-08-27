import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { WorkCategory } from '../../api/types';

interface Props {
  categories: WorkCategory[];
}

export const WorkCategoryChart: React.FC<Props> = ({ categories }) => {
  const data = [...categories]
    .sort((a, b) => b.total_works - a.total_works)
    .slice(0, 8)
    .map((c) => ({
      name: c.category.length > 18 ? c.category.slice(0, 16) + '...' : c.category,
      fullName: c.category,
      works: c.total_works,
      costCr: parseFloat((c.total_final_amount / 1e7).toFixed(2)),
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-elevated text-xs space-y-1.5 font-sans z-50 animate-slide-up">
          <div className="font-bold text-navy-950">{item.fullName}</div>
          <div className="flex items-center justify-between gap-4 text-brand-700 font-mono">
            <span className="font-sans text-slate-500">Projects:</span>
            <strong>{item.works.toLocaleString()}</strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-700 font-mono">
            <span className="font-sans text-slate-500">Final Spend:</span>
            <strong>₹{item.costCr.toLocaleString()} Cr</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis type="number" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="works"
            name="Total Projects"
            fill="#4F46E5"
            radius={[0, 4, 4, 0]}
            isAnimationActive={true}
            animationDuration={850}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
