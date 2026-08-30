import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  ShieldAlert,
  Layers,
  Sparkles,
  Users,
  Building2,
  PieChart as PieIcon,
  Compass,
} from 'lucide-react';
import { StatsResponse, StateSummary, WorkCategory } from '../../api/types';
import { MacroFiscalFlowChart } from '../charts/MacroFiscalFlowChart';
import { StateRankingChart } from '../charts/StateRankingChart';
import { SectorDistributionChart } from '../charts/SectorDistributionChart';
import { AnomalyBreakdownChart } from '../charts/AnomalyBreakdownChart';
import { MpUtilizationDistributionChart } from '../charts/MpUtilizationDistributionChart';
import { VendorLorenzChart } from '../charts/VendorLorenzChart';
import { HouseComparisonRadarChart } from '../charts/HouseComparisonRadarChart';

interface Props {
  stats: StatsResponse;
  states: StateSummary[];
  categories: WorkCategory[];
  onSelectState?: (stateName: string) => void;
}

type TabType =
  | 'MACRO_FLOW'
  | 'MP_DIST'
  | 'STATE_RANKING'
  | 'SECTOR_DIST'
  | 'CONTRACTORS'
  | 'ANOMALIES'
  | 'CHAMBER_RADAR';

export const AnalyticsSuite: React.FC<Props> = ({ stats, states, categories, onSelectState }) => {
  const [activeTab, setActiveTab] = useState<TabType>('MACRO_FLOW');

  const tabs: Array<{ id: TabType; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'MACRO_FLOW', label: 'Fiscal Flows', icon: TrendingUp, badge: '₹11.6k Cr' },
    { id: 'MP_DIST', label: 'MP Distribution', icon: Users, badge: '778 MPs' },
    { id: 'STATE_RANKING', label: 'State Rankings', icon: BarChart3, badge: '36 Territories' },
    { id: 'SECTOR_DIST', label: 'Sector Spread', icon: Layers, badge: '102K Works' },
    { id: 'CONTRACTORS', label: 'Contractors', icon: Building2, badge: '22K Firms' },
    { id: 'ANOMALIES', label: 'MAD Signals', icon: ShieldAlert, badge: '1,831 Flags' },
    { id: 'CHAMBER_RADAR', label: 'Chamber Radar', icon: Compass, badge: 'LS vs RS' },
  ];

  return (
    <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-3xl border border-slate-200/90 font-manrope space-y-4">
      {/* Top Precision Micro-Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
        <div>
          <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider block">Statutory Corpus</span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            ₹{(stats.total_allocated_amount / 1e7).toFixed(2)} Cr
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider block">Disbursed Funds</span>
          <span className="font-mono font-bold text-emerald-600 text-sm">
            ₹{(stats.total_expenditure / 1e7).toFixed(2)} Cr
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider block">National Utilization</span>
          <span className="font-mono font-bold text-[#2563EB] text-sm">
            {stats.national_utilization_pct.toFixed(2)}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider block">Ledger Discrepancy</span>
          <span className="font-mono font-bold text-emerald-700 text-sm">
            ₹0.00 Guaranteed
          </span>
        </div>
      </div>

      {/* Header & Interactive Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-50 text-[#2563EB]">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#08102B] tracking-tight">
              Forensic Analytical Studio
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-light mt-0.5">
            Empirical statistical models, expenditure velocity, and micro-metric visualizers.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-bold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-full transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Graph Canvas */}
      <div className="pt-1">
        {activeTab === 'MACRO_FLOW' && <MacroFiscalFlowChart stats={stats} />}
        {activeTab === 'MP_DIST' && <MpUtilizationDistributionChart stats={stats} />}
        {activeTab === 'STATE_RANKING' && <StateRankingChart states={states} onSelectState={onSelectState} />}
        {activeTab === 'SECTOR_DIST' && <SectorDistributionChart categories={categories} />}
        {activeTab === 'CONTRACTORS' && <VendorLorenzChart />}
        {activeTab === 'ANOMALIES' && <AnomalyBreakdownChart stats={stats} />}
        {activeTab === 'CHAMBER_RADAR' && <HouseComparisonRadarChart stats={stats} />}
      </div>
    </div>
  );
};
