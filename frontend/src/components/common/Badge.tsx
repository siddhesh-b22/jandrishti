import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  ShieldAlert,
} from 'lucide-react';

interface SeverityBadgeProps {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const norm = (severity || 'LOW').toUpperCase();

  const config: Record<string, { bg: string; text: string; border: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
    CRITICAL: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      label: 'Critical Risk',
      icon: AlertCircle,
    },
    HIGH: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      label: 'High Risk',
      icon: AlertTriangle,
    },
    MEDIUM: {
      bg: 'bg-blue-50',
      text: 'text-[#2563EB]',
      border: 'border-blue-200',
      label: 'Medium Risk',
      icon: Clock,
    },
    LOW: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: 'Low / Normal',
      icon: CheckCircle2,
    },
  };

  const current = config[norm] || config.LOW;
  const Icon = current.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs font-bold';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-manrope ${current.bg} ${current.text} ${current.border} ${padding}`}
      role="status"
      aria-label={`Severity: ${current.label}`}
    >
      <Icon className={`${iconSize} shrink-0`} />
      <span className="font-semibold tracking-wide">{current.label}</span>
    </span>
  );
};

interface LifecycleBadgeProps {
  status: string;
}

export const LifecycleBadge: React.FC<LifecycleBadgeProps> = ({ status }) => {
  const map: Record<string, { label: string; style: string; icon: React.ComponentType<{ className?: string }> }> = {
    COMPLETED: {
      label: 'Completed & Delivered',
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
    },
    FULL_LIFECYCLE_MATCH: {
      label: 'Completed & Reconciled',
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
    },
    IN_PROGRESS: {
      label: 'Active Execution',
      style: 'bg-blue-50 text-[#2563EB] border-blue-200',
      icon: Clock,
    },
    SANCTIONED: {
      label: 'Approved & Sanctioned',
      style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Clock,
    },
    RECOMMENDED: {
      label: 'MP Recommended',
      style: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
    },
    RECOMMENDED_IN_PROGRESS: {
      label: 'Recommended / In-Progress',
      style: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    },
    COMPLETED_ONLY: {
      label: 'Completed Milestone',
      style: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: CheckCircle2,
    },
  };

  const item = map[status] || {
    label: status.replace(/_/g, ' '),
    style: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  };
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.style}`}
      role="status"
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{item.label}</span>
    </span>
  );
};

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
      <Layers className="w-3 h-3 text-slate-400 shrink-0" />
      <span>{category}</span>
    </span>
  );
};
