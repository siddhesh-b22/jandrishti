import React, { useState } from 'react';
import { AlertCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "We couldn't load this information right now.",
  message = 'A temporary connection issue occurred while retrieving the requested data.',
  onRetry,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      role="alert"
      className="rounded-3xl border border-rose-200 bg-gradient-to-b from-rose-50/60 to-white p-6 sm:p-8 text-center space-y-4 shadow-xs font-manrope max-w-xl mx-auto"
    >
      <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-extrabold text-[#08102B]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
          Please check your connection and try refreshing. If the issue persists, our systems will automatically recover.
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full text-xs font-bold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Expandable Technical Details (Progressive Disclosure) */}
      {message && (
        <div className="pt-3 border-t border-rose-100">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <span>{showDetails ? 'Hide' : 'Show'} Technical Details</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <div className="mt-2 text-left p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto">
              <code>{message}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
