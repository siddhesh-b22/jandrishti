import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('JanDrishti Uncaught Render Error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-[#E4E2DC] shadow-sm p-6 sm:p-8 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF0EB] text-[#C85A32] flex items-center justify-center mx-auto border border-[#E8C5B6]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif text-[#121316]">
                Something Went Wrong
              </h2>
              <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed font-light">
                An unexpected interface render issue occurred. The statutory audit ledgers remain secure and immutable.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] text-left text-[11px] font-mono text-[#4A4D53] overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#121316] text-[#FAF8F5] text-xs font-semibold hover:bg-black transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#E4E2DC] text-[#121316] text-xs font-semibold hover:bg-[#F0EFEA] transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Return to Overview
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
