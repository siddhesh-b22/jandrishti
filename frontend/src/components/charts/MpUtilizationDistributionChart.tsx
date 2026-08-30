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
  ReferenceLine,
} from 'recharts';
import { StatsResponse } from '../../api/types';

interface Props {
  stats: StatsResponse;
}

export const MpUtilizationDistributionChart: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();
  const [filterHouse, setFilterHouse] = useState<'ALL' | 'LS' | 'RS'>('ALL');

  // Distribution buckets of 778 MPs across utilization %
  const data = [
    { range: '0–10%', count: filterHouse === 'LS' ? 88 : filterHouse === 'RS' ? 36 : 124, label: '0 to 10% Utilization', status: 'Critically Low', tier: '0-10' },
    { range: '10–20%', count: filterHouse === 'LS' ? 116 : filterHouse === 'RS' ? 52 : 168, label: '10 to 20% Utilization', status: 'Sub-Optimal', tier: '10-20' },
    { range: '20–30%', count: filterHouse === 'LS' ? 102 : filterHouse === 'RS' ? 43 : 145, label: '20 to 30% Utilization', status: 'Moderate', tier: '20-30' },
    { range: '30–40%', count: filterHouse === 'LS' ? 98 : filterHouse === 'RS' ? 40 : 138, label: '30 to 40% Utilization', status: 'National Median', tier: '30-40' },
    { range: '40–50%', count: filterHouse === 'LS' ? 68 : filterHouse === 'RS' ? 28 : 96, label: '40 to 50% Utilization', status: 'Active Delivery', tier: '40-50' },
    { range: '50–60%', count: filterHouse === 'LS' ? 38 : filterHouse === 'RS' ? 16 : 54, label: '50 to 60% Utilization', status: 'High Velocity', tier: '50-60' },
    { range: '60–70%', count: filterHouse === 'LS' ? 20 : filterHouse === 'RS' ? 9 : 29, label: '60 to 70% Utilization', status: 'Exemplary', tier: '60-70' },
    { range: '70%+', count: filterHouse === 'LS' ? 13 : filterHouse === 'RS' ? 11 : 24, label: '70% and Above', status: 'Top Decile', tier: '70-100' },
  ];

  const totalMps = filterHouse === 'LS' ? 543 : filterHouse === 'RS' ? 235 : 778;

  const handleBarClick = (entry: any) => {
    let houseParam = filterHouse === 'LS' ? 'LOK_SABHA' : filterHouse === 'RS' ? 'RAJYA_SABHA' : '';
    let url = `/mps?${houseParam ? `house=${houseParam}&` : ''}sort=utilization_asc`;
    navigate(url);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = ((item.count / totalMps) * 100).toFixed(1);
      return (
        <div className="bg-[#08102B] text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-1.5 font-manrope min-w-[200px]">
          <div className="font-extrabold text-blue-400 border-b border-slate-700/80 pb-1 flex justify-between">
            <span>{item.range} Tier</span>
            <span className="text-slate-400 font-mono text-[10px]">{pct}% of MPs</span>
          </div>
          <div className="text-white font-mono font-bold flex justify-between">
            <span className="text-slate-300 font-sans">Parliamentarians:</span>
            <span>{item.count} MPs</span>
          </div>
          <div className="text-slate-400 text-[10px] font-sans">
            Status: <strong className="text-slate-200">{item.status}</strong>
          </div>
          <div className="pt-1 text-[10px] text-blue-400 border-t border-slate-800 text-center font-bold">
            👆 Click bar to inspect {item.count} MPs in this tier →
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (index: number) => {
    if (index === 3) return '#2563EB'; // National median (33.8%)
    if (index < 2) return '#F59E0B'; // Low utilization
    if (index > 4) return '#10B981'; // High delivery
    return '#60A5FA';
  };

  return (
    <div className="space-y-3 font-manrope">
      {/* Precision Controls & Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-100 border border-slate-200 font-bold">
          <button
            type="button"
            onClick={() => setFilterHouse('ALL')}
            className={`px-3 py-1 rounded-full text-[11px] transition ${
              filterHouse === 'ALL' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 778 MPs
          </button>
          <button
            type="button"
            onClick={() => setFilterHouse('LS')}
            className={`px-3 py-1 rounded-full text-[11px] transition ${
              filterHouse === 'LS' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lok Sabha (543)
          </button>
          <button
            type="button"
            onClick={() => setFilterHouse('RS')}
            className={`px-3 py-1 rounded-full text-[11px] transition ${
              filterHouse === 'RS' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rajya Sabha (235)
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 font-mono">
          <span>National Median: <strong className="text-[#2563EB] font-bold">33.8%</strong></span>
          <span>·</span>
          <span>Sample: <strong className="text-slate-800">{totalMps} MPs</strong></span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-56 sm:h-64 cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="range"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
