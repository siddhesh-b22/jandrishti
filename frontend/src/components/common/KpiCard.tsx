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
      card: 'border-slate-200/90 bg-white shadow-3xl hover:shadow-4xl',
      iconBg: 'bg-slate-100 text-slate-700 group-hover:bg-[#2563EB] group-hover:text-white',
      valueColor: 'text-[#08102B]',
    },
    accent: {
      card: 'border-blue-200/90 bg-white shadow-3xl hover:shadow-4xl',
      iconBg: 'bg-blue-50 text-[#2563EB] border border-blue-200/60 group-hover:bg-[#2563EB] group-hover:text-white',
      valueColor: 'text-[#08102B]',
    },
    warning: {
      card: 'border-amber-200/90 bg-white shadow-3xl hover:shadow-4xl',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60 group-hover:bg-amber-500 group-hover:text-white',
      valueColor: 'text-[#08102B]',
    },
    danger: {
      card: 'border-rose-200/90 bg-white shadow-3xl hover:shadow-4xl',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60 group-hover:bg-rose-600 group-hover:text-white',
      valueColor: 'text-[#08102B]',
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
      className={`rounded-3xl border p-6 transition-all duration-300 relative group overflow-hidden hover:-translate-y-1 ${style.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-manrope">
              {title}
            </span>
            <ProvenanceBadge type={provenance} />
          </div>

          <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight transition-colors duration-200 ${style.valueColor}`}>
            {animatedValue}
          </div>

          {subtitle && (
            <p className="text-xs text-slate-500 font-light leading-tight font-manrope">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3.5 rounded-2xl transition-all duration-300 group-hover:scale-105 ${style.iconBg}`}>
          <Icon className="w-5 h-5 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
};
