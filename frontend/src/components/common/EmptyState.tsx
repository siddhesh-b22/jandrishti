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
    <div className="rounded-3xl border border-[#E4E2DC] bg-[#FAF8F5] p-8 sm:p-12 text-center space-y-4 shadow-sm font-sans max-w-lg mx-auto">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF0EB] text-[#C85A32] flex items-center justify-center border border-[#E8C5B6]">
        <SearchX className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-serif font-normal text-[#121316]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#71717A] font-light leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="cw-btn-primary text-xs py-2.5 px-5 shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}

        {actionText && actionTo && (
          <Link
            to={actionTo}
            className="cw-btn-secondary text-xs py-2.5 px-5 inline-flex items-center gap-1.5"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
