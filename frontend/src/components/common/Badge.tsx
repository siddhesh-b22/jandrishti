import React from 'react';

interface SeverityBadgeProps {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const styles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: {
      bg: 'bg-coral-500/10',
      text: 'text-coral-600',
      border: 'border-coral-500/30',
      dot: 'bg-coral-600',
    },
    HIGH: {
      bg: 'bg-saffron-500/10',
      text: 'text-saffron-700',
      border: 'border-saffron-500/30',
      dot: 'bg-saffron-600',
    },
    MEDIUM: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      dot: 'bg-sky-500',
    },
    LOW: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const current = styles[severity.toUpperCase()] || styles.LOW;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${current.border} ${padding}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span className="font-mono uppercase tracking-wider">{severity}</span>
    </span>
  );
};

interface LifecycleBadgeProps {
  status: string;
}

export const LifecycleBadge: React.FC<LifecycleBadgeProps> = ({ status }) => {
  const map: Record<string, { label: string; style: string }> = {
    FULL_LIFECYCLE_MATCH: {
      label: 'Completed & Reconciled',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    RECOMMENDED_IN_PROGRESS: {
      label: 'Recommended / In-Progress',
      style: 'bg-brand-50 text-brand-700 border-brand-200',
    },
    COMPLETED_ONLY: {
      label: 'Completed Only',
      style: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const item = map[status] || { label: status, style: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.style}`}>
      {item.label}
    </span>
  );
};

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100/90 text-slate-700 border border-slate-200">
      {category}
    </span>
  );
};
