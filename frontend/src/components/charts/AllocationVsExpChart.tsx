import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { StateSummary } from '../../api/types';

interface Props {
  states: StateSummary[];
}

export const AllocationVsExpChart: React.FC<Props> = ({ states }) => {
  const topStates = [...states]
    .sort((a, b) => b.total_allocated_amount - a.total_allocated_amount)
    .slice(0, 10)
    .map((s) => ({
      name: s.state.length > 12 ? s.state.slice(0, 10) + '...' : s.state,
      fullName: s.state,
      allocated: parseFloat((s.total_allocated_amount / 1e7).toFixed(2)),
      expenditure: parseFloat((s.total_expenditure / 1e7).toFixed(2)),
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-elevated text-xs space-y-1.5 font-sans z-50 animate-slide-up">
          <div className="font-bold text-navy-950">{data.fullName}</div>
          <div className="flex items-center justify-between gap-4 text-brand-700 font-mono">
            <span className="font-sans text-slate-500">Allocated:</span>
            <strong>₹{data.allocated.toLocaleString()} Cr</strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-700 font-mono">
            <span className="font-sans text-slate-500">Expenditure:</span>
            <strong>₹{data.expenditure.toLocaleString()} Cr</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topStates} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            fontSize={10}
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
          />
          <Bar
            dataKey="allocated"
            name="Allocated (₹ Cr)"
            fill="#6366F1"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={850}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="expenditure"
            name="Expenditure (₹ Cr)"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
