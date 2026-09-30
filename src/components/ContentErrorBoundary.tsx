'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ContentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ContentErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[50vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-[#15201D] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-[#263834] space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              تعذر تحميل محتوى هذه الصفحة مؤقتاً
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              حدث تعارض بسيط في معالجة عناصر الواجهة. تم الحفاظ على بياناتك وجلستك بأمان.
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة ↻</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
