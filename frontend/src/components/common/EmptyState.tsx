import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'No items matched your search query or filter parameters.',
  onReset,
}) => {
  return (
    <div className="rounded-3xl border border-canvas-border bg-white p-12 text-center space-y-4 shadow-card">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
        <SearchX className="w-6 h-6 text-slate-400" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-base font-bold text-navy-950">{title}</h3>
        <p className="text-xs text-canvas-textMuted leading-relaxed">{description}</p>
      </div>

      {onReset && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
