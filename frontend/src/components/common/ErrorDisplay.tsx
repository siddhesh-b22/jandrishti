import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message = 'An unexpected error occurred while processing data.',
  onRetry,
}) => {
  return (
    <div className="rounded-3xl border border-coral-200 bg-gradient-to-r from-coral-50/40 via-white to-coral-50/20 p-8 text-center space-y-4 shadow-sm">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-coral-100 text-coral-600 flex items-center justify-center border border-coral-200">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-sm font-bold text-coral-950">Data Retrieval Notice</h3>
        <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-3 rounded-xl border border-coral-200/80">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-coral-600 hover:bg-coral-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Request
          </button>
        </div>
      )}
    </div>
  );
};
