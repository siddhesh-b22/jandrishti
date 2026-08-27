import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ProvenanceBadge, ProvenanceType } from './ProvenanceBadge';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useCountUp } from '../../hooks/useCountUp';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  provenance: ProvenanceType;
  icon: LucideIcon;
  variant?: 'default' | 'accent' | 'warning' | 'danger';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  provenance,
  icon: Icon,
  variant = 'default',
}) => {
  const { ref, isVisible } = useScrollReveal();

  const variantStyles = {
    default: {
      card: 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-card-hover',
      iconBg: 'bg-slate-100 text-slate-700 group-hover:bg-slate-200',
      valueColor: 'text-navy-950',
    },
    accent: {
      card: 'border-indigo-200/80 hover:border-brand-400 bg-gradient-to-br from-white via-indigo-50/20 to-white hover:shadow-glow-brand',
      iconBg: 'bg-brand-50 text-brand-600 border border-brand-200/60 group-hover:bg-brand-100',
      valueColor: 'text-brand-950',
    },
    warning: {
      card: 'border-saffron-200/80 hover:border-saffron-400 bg-gradient-to-br from-white via-saffron-50/20 to-white hover:shadow-glow-saffron',
      iconBg: 'bg-saffron-50 text-saffron-600 border border-saffron-200/60 group-hover:bg-saffron-100',
      valueColor: 'text-saffron-950',
    },
    danger: {
      card: 'border-coral-200/80 hover:border-coral-400 bg-gradient-to-br from-white via-rose-50/20 to-white hover:shadow-md',
      iconBg: 'bg-rose-50 text-coral-600 border border-rose-200/60 group-hover:bg-rose-100',
      valueColor: 'text-coral-950',
    },
  };

  const style = variantStyles[variant];

  // Helper to parse numeric values for count-up animation
  const parseNumericValue = (val: string | number) => {
    if (typeof val === 'number') {
      return { num: val, prefix: '', suffix: '', decimals: 0 };
    }
    const str = String(val).trim();
    if (str.startsWith('₹') && str.endsWith(' Cr')) {
      const clean = str.replace('₹', '').replace(' Cr', '').replace(/,/g, '');
      const parsed = parseFloat(clean);
      if (!isNaN(parsed)) {
        return { num: parsed, prefix: '₹', suffix: ' Cr', decimals: clean.includes('.') ? 2 : 0 };
      }
    }
    if (str.endsWith('%')) {
      const clean = str.replace('%', '');
      const parsed = parseFloat(clean);
      if (!isNaN(parsed)) {
        return { num: parsed, prefix: '', suffix: '%', decimals: clean.includes('.') ? 2 : 0 };
      }
    }
    const cleanNum = str.replace(/,/g, '');
    const parsed = parseFloat(cleanNum);
    if (!isNaN(parsed) && /^\d+(\.\d+)?$/.test(cleanNum)) {
      return { num: parsed, prefix: '', suffix: '', decimals: cleanNum.includes('.') ? 2 : 0 };
    }
    return null;
  };

  const parsed = parseNumericValue(value);
  const animatedValue = parsed
    ? useCountUp({
        end: parsed.num,
        duration: 950,
        decimals: parsed.decimals,
        prefix: parsed.prefix,
        suffix: parsed.suffix,
        trigger: isVisible,
      })
    : String(value);

  return (
    <div
      ref={ref}
      className={`rounded-2xl border p-5 transition-all duration-200 ease-spring relative group overflow-hidden hover:-translate-y-0.5 ${style.card}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {title}
            </span>
            <ProvenanceBadge type={provenance} />
          </div>

          <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight transition-colors duration-150 ${style.valueColor}`}>
            {animatedValue}
          </div>

          {subtitle && (
            <p className="text-xs text-slate-500 font-medium leading-tight">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-xl transition-all duration-200 ease-spring group-hover:scale-105 group-hover:-translate-y-0.5 ${style.iconBg}`}>
          <Icon className="w-5 h-5 transition-transform duration-200" />
        </div>
      </div>
    </div>
  );
};
