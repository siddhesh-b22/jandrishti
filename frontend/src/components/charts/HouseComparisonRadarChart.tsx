import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';
import { StatsResponse } from '../../api/types';

interface Props {
  stats: StatsResponse;
}

export const HouseComparisonRadarChart: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();
  const ls = stats.house_breakdown?.lok_sabha;
  const rs = stats.house_breakdown?.rajya_sabha;

  const data = [
    {
      subject: 'Utilization %',
      lokSabha: ls?.utilization_pct || 33.5,
      rajyaSabha: rs?.utilization_pct || 34.7,
      fullMark: 100,
      unit: '%',
    },
    {
      subject: 'Work Delivery %',
      lokSabha: ls?.completion_rate_pct || 48.9,
      rajyaSabha: rs?.completion_rate_pct || 49.3,
      fullMark: 100,
      unit: '%',
    },
    {
      subject: 'Works per MP',
      lokSabha: parseFloat(((ls?.recommended_works || 71200) / 543).toFixed(1)),
      rajyaSabha: parseFloat(((rs?.recommended_works || 31237) / 235).toFixed(1)),
      fullMark: 200,
      unit: 'Works',
    },
    {
      subject: 'Voucher Rate',
      lokSabha: parseFloat(((ls?.total_expenditure || 2.78e10) / (ls?.total_allocated || 8.3e10) * 100).toFixed(1)),
      rajyaSabha: parseFloat(((rs?.total_expenditure || 1.16e10) / (rs?.total_allocated || 3.36e10) * 100).toFixed(1)),
      fullMark: 100,
      unit: '%',
    },
    {
      subject: 'Signal Density',
      lokSabha: parseFloat(((ls?.anomalies_count || 1280) / 543).toFixed(2)),
      rajyaSabha: parseFloat(((rs?.anomalies_count || 551) / 235).toFixed(2)),
      fullMark: 5,
      unit: 'Flags/MP',
    },
  ];

  const handleHouseClick = (house: 'LOK_SABHA' | 'RAJYA_SABHA') => {
    navigate(`/mps?house=${house}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#08102B] text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-1.5 font-manrope min-w-[200px]">
          <div className="font-extrabold text-blue-400 border-b border-slate-700/80 pb-1">
            {payload[0]?.payload?.subject}
          </div>
          <div className="flex justify-between items-center text-blue-400 font-mono">
            <span className="text-slate-400 font-sans">Lok Sabha (543):</span>
            <strong>{payload[0]?.value} {payload[0]?.payload?.unit}</strong>
          </div>
          <div className="flex justify-between items-center text-emerald-400 font-mono">
            <span className="text-slate-400 font-sans">Rajya Sabha (235):</span>
            <strong>{payload[1]?.value} {payload[1]?.payload?.unit}</strong>
          </div>
          <div className="pt-1 text-[10px] text-blue-400 border-t border-slate-800 text-center font-bold">
            👆 Click to view Parliamentarians →
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3 font-manrope">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-700">Constitutional Chamber Multi-Axis Metrics</span>
        <div className="flex items-center gap-2 font-bold">
          <button
            type="button"
            onClick={() => handleHouseClick('LOK_SABHA')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 transition"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span>Explore 543 Lok Sabha MPs →</span>
          </button>
          <button
            type="button"
            onClick={() => handleHouseClick('RAJYA_SABHA')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>Explore 235 Rajya Sabha MPs →</span>
          </button>
        </div>
      </div>

      <div className="w-full h-56 sm:h-64 flex items-center justify-center cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data} onClick={() => handleHouseClick('LOK_SABHA')}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="subject" stroke="#64748B" fontSize={11} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#CBD5E1" fontSize={9} />
            <Radar name="Lok Sabha" dataKey="lokSabha" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} />
            <Radar name="Rajya Sabha" dataKey="rajyaSabha" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
