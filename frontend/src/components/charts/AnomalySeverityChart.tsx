import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface Props {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export const AnomalySeverityChart: React.FC<Props> = ({ critical, high, medium, low }) => {
  const data = [
    { name: 'CRITICAL', value: critical, color: '#E11D48' },
    { name: 'HIGH', value: high, color: '#F59E0B' },
    { name: 'MEDIUM', value: medium, color: '#0284C7' },
    { name: 'LOW', value: low, color: '#64748B' },
  ];

  const total = critical + high + medium + low;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-elevated text-xs space-y-1 font-sans z-50 animate-slide-up">
          <div className="font-bold text-navy-950 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
            {item.name} Severity
          </div>
          <div className="text-slate-500 font-mono">
            {item.value.toLocaleString()} signals ({pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            isAnimationActive={true}
            animationDuration={950}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
