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
      bg: 'bg-[#FAF0EB]',
      text: 'text-[#C85A32]',
      border: 'border-[#E8C5B6]',
      label: 'Critical Anomaly',
      icon: AlertCircle,
    },
    HIGH: {
      bg: 'bg-[#FDF6E2]',
      text: 'text-[#946200]',
      border: 'border-[#EAD397]',
      label: 'High Variance',
      icon: AlertTriangle,
    },
    MEDIUM: {
      bg: 'bg-[#F0EFEA]',
      text: 'text-[#121316]',
      border: 'border-[#E4E2DC]',
      label: 'Review Required',
      icon: Clock,
    },
    LOW: {
      bg: 'bg-[#FAF8F5]',
      text: 'text-[#71717A]',
      border: 'border-[#E4E2DC]',
      label: 'Standard Baseline',
      icon: CheckCircle2,
    },
  };

  const current = config[norm] || config.LOW;
  const Icon = current.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs font-mono uppercase tracking-wider font-semibold';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono ${current.bg} ${current.text} ${current.border} ${padding}`}
      role="status"
      aria-label={`Severity: ${current.label}`}
    >
      <Icon className={`${iconSize} shrink-0`} />
      <span className="tracking-wider">{current.label}</span>
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
      style: 'bg-[#F0EFEA] text-[#121316] border-[#E4E2DC]',
      icon: CheckCircle2,
    },
    FULL_LIFECYCLE_MATCH: {
      label: 'Reconciled Audit Match',
      style: 'bg-[#F0EFEA] text-[#121316] border-[#E4E2DC]',
      icon: CheckCircle2,
    },
    IN_PROGRESS: {
      label: 'Active Execution',
      style: 'bg-[#FAF0EB] text-[#C85A32] border-[#E8C5B6]',
      icon: Clock,
    },
    SANCTIONED: {
      label: 'Approved & Sanctioned',
      style: 'bg-[#F0EFEA] text-[#4A4D53] border-[#E4E2DC]',
      icon: Clock,
    },
    RECOMMENDED: {
      label: 'MP Recommended',
      style: 'bg-[#FAF8F5] text-[#71717A] border-[#E4E2DC]',
      icon: Clock,
    },
    RECOMMENDED_IN_PROGRESS: {
      label: 'Recommended / In-Progress',
      style: 'bg-[#FAF0EB] text-[#C85A32] border-[#E8C5B6]',
      icon: Clock,
    },
    COMPLETED_ONLY: {
      label: 'Completed Milestone',
      style: 'bg-[#F0EFEA] text-[#71717A] border-[#E4E2DC]',
      icon: CheckCircle2,
    },
  };

  const item = map[status] || {
    label: status.replace(/_/g, ' '),
    style: 'bg-[#FAF8F5] text-[#71717A] border-[#E4E2DC]',
    icon: Clock,
  };
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-sans ${item.style}`}
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
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#FAF8F5] text-[#121316] border border-[#E4E2DC]">
      <Layers className="w-3 h-3 text-[#71717A] shrink-0" />
      <span>{category}</span>
    </span>
  );
};
