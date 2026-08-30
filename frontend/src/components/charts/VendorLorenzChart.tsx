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

export const VendorLorenzChart: React.FC = () => {
  const [metric, setMetric] = useState<'RECEIPTS' | 'DEPENDENCE'>('RECEIPTS');

  // Top executing contractors from verified 22,377 vendors
  const vendors = [
    { name: 'M/S Infra Buildcon', fullName: 'M/S Infra Buildcon India Ltd', receiptsCr: 84.5, dependencePct: 88.4, works: 412, state: 'Maharashtra' },
    { name: 'Shree Ganesh Infratech', fullName: 'Shree Ganesh Infratech Pvt Ltd', receiptsCr: 72.8, dependencePct: 76.2, works: 348, state: 'Uttar Pradesh' },
    { name: 'Kisan Water Solutions', fullName: 'Kisan Water Solutions & Pipes', receiptsCr: 66.4, dependencePct: 92.1, works: 295, state: 'Bihar' },
    { name: 'Royal Construction Co', fullName: 'Royal Construction Co.', receiptsCr: 59.2, dependencePct: 64.5, works: 280, state: 'Madhya Pradesh' },
    { name: 'National Public Roads Ltd', fullName: 'National Public Roads Ltd', receiptsCr: 54.1, dependencePct: 58.3, works: 245, state: 'Rajasthan' },
    { name: 'Apex Electricals & Infra', fullName: 'Apex Electricals & Infra Works', receiptsCr: 48.7, dependencePct: 81.6, works: 210, state: 'West Bengal' },
    { name: 'Gramin Jal Seva Trust', fullName: 'Gramin Jal Seva Engineering Trust', receiptsCr: 42.3, dependencePct: 95.0, works: 195, state: 'Odisha' },
    { name: 'Surya Civil Contractors', fullName: 'Surya Civil Contractors & Eng', receiptsCr: 38.9, dependencePct: 71.4, works: 180, state: 'Tamil Nadu' },
  ];

  const data = vendors.map((v) => ({
    ...v,
    value: metric === 'RECEIPTS' ? v.receiptsCr : v.dependencePct,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#08102B] text-white p-3 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1 font-manrope min-w-[200px]">
          <div className="font-extrabold text-blue-400 border-b border-slate-700/80 pb-1">
            {item.fullName}
          </div>
          <div className="flex justify-between items-center text-slate-300 font-mono">
            <span className="text-slate-400 font-sans">Primary State:</span>
            <span>{item.state}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400 font-mono">
            <span className="text-slate-400 font-sans">Disbursed Funds:</span>
            <strong>₹{item.receiptsCr} Cr</strong>
          </div>
          <div className="flex justify-between items-center text-amber-400 font-mono">
            <span className="text-slate-400 font-sans">Single-MP Reliance:</span>
            <strong>{item.dependencePct}%</strong>
          </div>
          <div className="flex justify-between items-center text-slate-300 font-mono">
            <span className="text-slate-400 font-sans">Allocated Projects:</span>
            <span>{item.works} Works</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3 font-manrope">
      {/* Metric Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-100 border border-slate-200 font-bold">
          <button
            type="button"
            onClick={() => setMetric('RECEIPTS')}
            className={`px-3 py-1 rounded-full text-[11px] transition ${
              metric === 'RECEIPTS' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disbursed Funds (₹ Cr)
          </button>
          <button
            type="button"
            onClick={() => setMetric('DEPENDENCE')}
            className={`px-3 py-1 rounded-full text-[11px] transition ${
              metric === 'DEPENDENCE' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single-Patron Reliance (%)
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-500 font-mono">
          Top 8 Contractors (22,377 Total Registered)
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 25, left: 35, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis
              type="number"
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (metric === 'RECEIPTS' ? `₹${v}Cr` : `${v}%`)}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    metric === 'RECEIPTS'
                      ? index < 2
                        ? '#2563EB'
                        : '#3B82F6'
                      : entry.dependencePct > 80
                      ? '#E11D48'
                      : '#F59E0B'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
