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
      className={`flex items-center justify-between gap-3 text-xs py-2 px-4 bg-[#FAF8F5] rounded-full border border-[#E4E2DC] shadow-2xs mb-6 overflow-x-auto font-sans ${className}`}
    >
      <ol className="flex items-center gap-2 shrink-0">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[#71717A] hover:text-[#121316] font-medium transition active:scale-[0.98]"
            title="Overview Home"
          >
            <Home className="w-3.5 h-3.5 text-[#71717A]" />
            <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider">India Overview</span>
          </Link>
        </li>

        {computedItems.map((item, index) => {
          const isLast = index === computedItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-[#A1A1AA] shrink-0" />
              {isLast || !item.to ? (
                <span className="flex items-center gap-1.5 font-semibold text-[#121316] truncate max-w-[220px] sm:max-w-xs">
                  {Icon && <Icon className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />}
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6] ml-1">
                      {item.badge}
                    </span>
                  )}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="flex items-center gap-1.5 text-[#71717A] hover:text-[#121316] font-medium transition active:scale-[0.98]"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Viewing Scope Context Pill */}
      <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-[#71717A] shrink-0">
        <span>Active Scope:</span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#F0EFEA] border border-[#E4E2DC] text-[#121316] font-semibold">
          {houseLabel}
        </span>
      </div>
    </nav>
  );
};
