import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  ShieldAlert,
  Layers,
  Sparkles,
  ArrowRight,
  Receipt,
  MapPin,
  Building2,
} from 'lucide-react';
import { StatsResponse, StateSummary, WorkCategory } from '../../api/types';
import { MacroFiscalFlowChart } from '../charts/MacroFiscalFlowChart';
import { StateRankingChart } from '../charts/StateRankingChart';
import { SectorDistributionChart } from '../charts/SectorDistributionChart';
import { AnomalyBreakdownChart } from '../charts/AnomalyBreakdownChart';

interface Props {
  stats: StatsResponse;
  states: StateSummary[];
  categories: WorkCategory[];
  onSelectState?: (stateName: string) => void;
}

type TabType = 'MACRO_FLOW' | 'STATE_RANKING' | 'SECTOR_DIST' | 'ANOMALIES';

export const AnalyticsSuite: React.FC<Props> = ({ stats, states, categories, onSelectState }) => {
  const [activeTab, setActiveTab] = useState<TabType>('MACRO_FLOW');

  const tabs: Array<{ id: TabType; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'MACRO_FLOW', label: 'Fiscal Flows', icon: TrendingUp, badge: '₹11.6k Cr' },
    { id: 'STATE_RANKING', label: 'State Rankings', icon: BarChart3, badge: '36 UTs/States' },
    { id: 'SECTOR_DIST', label: 'Sector Spread', icon: Layers, badge: '102K Works' },
    { id: 'ANOMALIES', label: 'MAD Signals', icon: ShieldAlert, badge: '1,831 Flags' },
  ];

  return (
    <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-3xl border border-slate-200/90 font-manrope space-y-6">
      {/* Header & Interactive Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-blue-50 text-[#2563EB]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#08102B] tracking-tight">
              Interactive Forensic Analytics Hub
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-light mt-1">
            Empirical statistical models, expenditure velocity, and macro reconciliation visualizers.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-bold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
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
        {activeTab === 'STATE_RANKING' && <StateRankingChart states={states} onSelectState={onSelectState} />}
        {activeTab === 'SECTOR_DIST' && <SectorDistributionChart categories={categories} />}
        {activeTab === 'ANOMALIES' && <AnomalyBreakdownChart stats={stats} />}
      </div>
    </div>
  );
};
