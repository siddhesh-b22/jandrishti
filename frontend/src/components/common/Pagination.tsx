import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ total, limit, offset, onPageChange }) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) return null;

  const startRecord = offset + 1;
  const endRecord = Math.min(offset + limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
      <div className="text-canvas-textMuted font-mono">
        Showing <strong className="text-navy-950 font-bold">{startRecord}</strong> to{' '}
        <strong className="text-navy-950 font-bold">{endRecord}</strong> of{' '}
        <strong className="text-navy-950 font-bold">{total.toLocaleString()}</strong> records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={offset === 0}
          className="p-2 rounded-xl bg-white border border-canvas-border text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="p-2 rounded-xl bg-white border border-canvas-border text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1.5 font-mono font-bold text-navy-950 bg-white border border-canvas-border rounded-xl shadow-xs">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(offset + limit)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl bg-white border border-canvas-border text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange((totalPages - 1) * limit)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl bg-white border border-canvas-border text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
