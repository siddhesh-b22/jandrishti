import React from 'react';
import { Database, Cpu, ShieldAlert, Calculator, HelpCircle } from 'lucide-react';

export type ProvenanceType = 'SOURCE-DERIVED' | 'CALCULATED' | 'ANALYTICAL' | 'AUDIT RISK' | 'NOT AVAILABLE' | 'NOT IN SOURCE';

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  showIcon?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ type, showIcon = true }) => {
  const styles: Record<ProvenanceType, { label: string; style: string; icon: React.FC<any> }> = {
    'SOURCE-DERIVED': {
      label: 'Official Source',
      style: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: Database,
    },
    'CALCULATED': {
      label: 'Calculated',
      style: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Calculator,
    },
    'ANALYTICAL': {
      label: 'Feature Metric',
      style: 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: Cpu,
    },
    'AUDIT RISK': {
      label: 'Risk Signal',
      style: 'bg-coral-500/10 text-coral-600 border-coral-500/30',
      icon: ShieldAlert,
    },
    'NOT AVAILABLE': {
      label: 'Not in Source Export',
      style: 'bg-slate-100 text-slate-400 border-slate-200',
      icon: HelpCircle,
    },
    'NOT IN SOURCE': {
      label: 'Not in Source Export',
      style: 'bg-slate-100 text-slate-400 border-slate-200',
      icon: HelpCircle,
    },
  };

  const item = styles[type] || styles['SOURCE-DERIVED'];
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${item.style}`}>
      {showIcon && <Icon className="w-3 h-3 shrink-0 opacity-80" />}
      <span>{item.label}</span>
    </span>
  );
};
