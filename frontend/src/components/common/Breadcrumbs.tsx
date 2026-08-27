import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Landmark, Users, Layers, Receipt, Building2, MapPin, ShieldAlert, FileText } from 'lucide-react';
import { useHouse } from '../../context/HouseContext';

interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  customCurrent?: string;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, customCurrent, className = '' }) => {
  const location = useLocation();
  const { houseLabel } = useHouse();

  // If items not explicitly passed, deduce default hierarchy from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getSegmentMeta = (seg: string, idx: number, all: string[]): BreadcrumbItem => {
    switch (seg) {
      case 'mps':
        return { label: 'Members of Parliament', to: '/mps', icon: Users };
      case 'works':
        return { label: 'Physical Works', to: '/works', icon: Layers };
      case 'transactions':
        return { label: 'Disbursements', to: '/transactions', icon: Receipt };
      case 'vendors':
        return { label: 'Contractors', to: '/vendors', icon: Building2 };
      case 'states':
        return { label: 'State Leaderboard', to: '/states', icon: MapPin };
      case 'anomalies':
        return { label: 'Signal Center', to: '/anomalies', icon: ShieldAlert, badge: '1,831' };
      case 'methodology':
        return { label: 'Methodology & Standards', to: '/methodology', icon: FileText };
      default:
        // Entity ID or slug
        return { label: customCurrent || seg };
    }
  };

  const computedItems: BreadcrumbItem[] = items || pathSegments.map((seg, idx, all) => {
    const isLast = idx === all.length - 1;
    const meta = getSegmentMeta(seg, idx, all);
    if (isLast && !meta.to) {
      return { ...meta, label: customCurrent || meta.label };
    }
    return meta;
  });

  if (computedItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center justify-between gap-3 text-xs py-2 px-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-xs mb-6 overflow-x-auto ${className}`}
    >
      <ol className="flex items-center gap-1.5 shrink-0">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-slate-500 hover:text-navy-950 font-medium transition active:scale-[0.98]"
            title="Overview Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">India Overview</span>
          </Link>
        </li>

        {computedItems.map((item, index) => {
          const isLast = index === computedItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              {isLast || !item.to ? (
                <span className="flex items-center gap-1 font-bold text-navy-950 truncate max-w-[200px] sm:max-w-xs">
                  {Icon && <Icon className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-coral-500 text-white shadow-xs ml-1">
                      {item.badge}
                    </span>
                  )}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="flex items-center gap-1 text-slate-500 hover:text-navy-950 font-medium transition active:scale-[0.98]"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Viewing Scope Context Pill */}
      <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 shrink-0">
        <span>Active Scope:</span>
        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-navy-950 font-bold shadow-xs">
          {houseLabel}
        </span>
      </div>
    </nav>
  );
};
