import React from 'react';
import { SearchX, RotateCcw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  actionText?: string;
  actionTo?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'No items matched your search query or filter parameters.',
  onReset,
  actionText,
  actionTo,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-4 shadow-xs font-manrope max-w-lg mx-auto">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
        <SearchX className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-extrabold text-[#08102B]">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full text-xs font-bold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}

        {actionText && actionTo && (
          <Link
            to={actionTo}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold transition min-h-[44px]"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
