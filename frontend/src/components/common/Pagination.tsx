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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
      <div className="text-[#71717A] font-mono text-[11px]">
        Showing <strong className="text-[#121316] font-semibold">{startRecord}</strong> to{' '}
        <strong className="text-[#121316] font-semibold">{endRecord}</strong> of{' '}
        <strong className="text-[#121316] font-semibold">{total.toLocaleString()}</strong> records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={offset === 0}
          className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] text-[#71717A] hover:bg-[#F0EFEA] hover:text-[#121316] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] text-[#71717A] hover:bg-[#F0EFEA] hover:text-[#121316] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3.5 py-1.5 font-mono text-[11px] font-semibold text-[#121316] bg-[#FAF8F5] border border-[#E4E2DC] rounded-xl shadow-2xs">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(offset + limit)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] text-[#71717A] hover:bg-[#F0EFEA] hover:text-[#121316] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange((totalPages - 1) * limit)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] text-[#71717A] hover:bg-[#F0EFEA] hover:text-[#121316] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
