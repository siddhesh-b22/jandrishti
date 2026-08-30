import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { StatsResponse } from '../../api/types';

interface Props {
  stats: StatsResponse;
}

export const MacroFiscalFlowChart: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();
  const [activeMetric, setActiveMetric] = useState<'ALL' | 'LOK_SABHA' | 'RAJYA_SABHA'>('ALL');

  const ls = stats.house_breakdown?.lok_sabha;
  const rs = stats.house_breakdown?.rajya_sabha;

  const data = [
    {
      category: 'Lok Sabha (543 MPs)',
      houseKey: 'LOK_SABHA',
      targetUrl: '/mps?house=LOK_SABHA',
      allocated: parseFloat(((ls?.total_allocated || 83062104294.53) / 1e7).toFixed(2)),
      disbursed: parseFloat(((ls?.total_expenditure || 27814234055.08) / 1e7).toFixed(2)),
      unspent: parseFloat(((ls?.total_unspent || 55247870239.45) / 1e7).toFixed(2)),
      utilization: ls?.utilization_pct || 33.5,
    },
    {
      category: 'Rajya Sabha (235 MPs)',
      houseKey: 'RAJYA_SABHA',
      targetUrl: '/mps?house=RAJYA_SABHA',
      allocated: parseFloat(((rs?.total_allocated || 33613347899.82) / 1e7).toFixed(2)),
      disbursed: parseFloat(((rs?.total_expenditure || 11658252277.58) / 1e7).toFixed(2)),
      unspent: parseFloat(((rs?.total_unspent || 21955095622.24) / 1e7).toFixed(2)),
      utilization: rs?.utilization_pct || 34.7,
    },
    {
      category: 'Combined National Corpus',
      houseKey: 'ALL',
      targetUrl: '/transactions',
      allocated: parseFloat((stats.total_allocated_amount / 1e7).toFixed(2)),
      disbursed: parseFloat((stats.total_expenditure / 1e7).toFixed(2)),
      unspent: parseFloat((stats.total_unspent_amount / 1e7).toFixed(2)),
      utilization: stats.national_utilization_pct,
    },
  ];

  const filteredData =
    activeMetric === 'ALL'
      ? data
      : activeMetric === 'LOK_SABHA'
      ? [data[0]]
      : [data[1]];

  const handleBarClick = (entry: any) => {
    if (entry && entry.targetUrl) {
      navigate(entry.targetUrl);
    } else if (entry && entry.activePayload && entry.activePayload.length) {
      const payload = entry.activePayload[0].payload;
      if (payload && payload.targetUrl) {
        navigate(payload.targetUrl);
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      return (
        <div className="bg-[#08102B] text-white p-4 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-2 font-manrope min-w-[230px]">
          <div className="font-extrabold text-blue-400 border-b border-slate-700/80 pb-1.5 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-slate-400 text-[10px] font-mono">{item?.utilization?.toFixed(1)}% Utilized</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Statutory Allocation:</span>
            <strong className="text-white font-mono">₹{payload[0]?.value?.toLocaleString()} Cr</strong>
          </div>
          <div className="flex justify-between items-center text-emerald-400">
            <span>Disbursed Spend:</span>
            <strong className="font-mono">₹{payload[1]?.value?.toLocaleString()} Cr</strong>
          </div>
          <div className="flex justify-between items-center text-amber-400">
            <span>Unspent Balance:</span>
            <strong className="font-mono">₹{payload[2]?.value?.toLocaleString()} Cr</strong>
          </div>
          <div className="pt-1 text-[10px] text-blue-400 border-t border-slate-800 text-center font-bold">
            👆 Click bar to inspect underlying records →
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Metric Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold font-manrope">
          <button
            type="button"
            onClick={() => setActiveMetric('ALL')}
            className={`px-3 py-1 rounded-full transition ${
              activeMetric === 'ALL' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Chambers
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('LOK_SABHA')}
            className={`px-3 py-1 rounded-full transition ${
              activeMetric === 'LOK_SABHA' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lok Sabha (543)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('RAJYA_SABHA')}
            className={`px-3 py-1 rounded-full transition ${
              activeMetric === 'RAJYA_SABHA' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rajya Sabha (235)
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
            Allocated: <strong className="text-slate-900">₹{(stats.total_allocated_amount / 1e7).toFixed(1)} Cr</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
            Disbursed: <strong className="text-emerald-700">₹{(stats.total_expenditure / 1e7).toFixed(1)} Cr</strong>
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80 cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="category"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k Cr`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="font-manrope text-slate-700 font-bold">{value}</span>}
            />
            <Bar dataKey="allocated" name="Statutory Allocation (₹ Cr)" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={26} />
            <Bar dataKey="disbursed" name="Disbursed Funds (₹ Cr)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={26} />
            <Bar dataKey="unspent" name="Unspent Balance (₹ Cr)" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={26} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
