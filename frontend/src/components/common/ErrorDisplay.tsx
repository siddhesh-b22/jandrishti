import React, { useState } from 'react';
import { AlertCircle, RotateCcw, ChevronDown, ChevronUp, WifiOff, ShieldAlert, FileQuestion, ServerCrash } from 'lucide-react';

export type ErrorContextType = 'network' | 'unauthorized' | 'not_found' | 'server' | 'generic';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  type?: ErrorContextType;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message = 'A temporary connection or query issue occurred while retrieving the requested public records.',
  onRetry,
  isRetrying: externalRetrying,
  type = 'generic',
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [internalRetrying, setInternalRetrying] = useState(false);

  const isBusy = externalRetrying ?? internalRetrying;

  const handleRetry = async () => {
    if (!onRetry || isBusy) return;
    try {
      setInternalRetrying(true);
      const res = onRetry();
      if (res && typeof (res as Promise<void>).then === 'function') {
        await res;
      }
    } finally {
      setInternalRetrying(false);
    }
  };

  const getIconAndTitle = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="w-6 h-6 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-200',
          defaultTitle: 'Network Connectivity Notice',
          tip: 'Unable to reach the JanDrishti data node. Please verify your internet connection.',
        };
      case 'unauthorized':
        return {
          icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
          bgColor: 'bg-rose-50 border-rose-200',
          defaultTitle: 'Jurisdiction Access Required',
          tip: 'This action is restricted to statutory administrative authorities with jurisdiction credentials.',
        };
      case 'not_found':
        return {
          icon: <FileQuestion className="w-6 h-6 text-slate-600" />,
          bgColor: 'bg-slate-100 border-slate-200',
          defaultTitle: 'Record Not Found in Public Registry',
          tip: 'The requested record or identifier could not be located in the current gazette dataset.',
        };
      case 'server':
        return {
          icon: <ServerCrash className="w-6 h-6 text-rose-600" />,
          bgColor: 'bg-rose-50 border-rose-200',
          defaultTitle: 'Data Service Temporary Timeout',
          tip: 'The public database query timed out. Performing an in-place retry usually resolves this immediately.',
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-[#C85A32]" />,
          bgColor: 'bg-[#FAF0EB] border-[#E8C5B6]',
          defaultTitle: 'Unable to Retrieve Requested Records',
          tip: 'The requested data could not be retrieved at this moment. You can retry in place without losing your active filters.',
        };
    }
  };

  const config = getIconAndTitle();
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      role="alert"
      className={`rounded-3xl border border-[#E8C5B6] bg-[#FAF8F5] p-6 sm:p-8 text-center space-y-4 shadow-sm font-sans max-w-xl mx-auto ${className}`}
    >
      <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center border ${config.bgColor}`}>
        {config.icon}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-serif font-medium text-[#121316]">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-[#71717A] font-normal leading-relaxed">
          {config.tip}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isBusy}
            className="cw-btn-primary text-xs py-2.5 px-6 shadow-xs cursor-pointer inline-flex items-center gap-2 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isBusy ? 'animate-spin' : ''}`} />
            <span>{isBusy ? 'Retrying in place...' : 'Retry Query'}</span>
          </button>
        </div>
      )}

      {/* Expandable Technical Details (Progressive Disclosure) */}
      {message && (
        <div className="pt-3 border-t border-slate-200/60">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <span>{showDetails ? 'Hide' : 'Show'} Diagnostic Details</span>
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

