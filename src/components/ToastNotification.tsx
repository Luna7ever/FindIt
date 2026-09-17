'use client';

import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ToastMessage } from '@/types';

export default function ToastNotification() {
  const { toasts, removeToast, dir } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type?: 'success' | 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getBorderColor = (type?: 'success' | 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/95 dark:bg-[#15201D] text-emerald-950 dark:text-emerald-200';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/60 bg-amber-50/95 dark:bg-[#1C241B] text-amber-950 dark:text-amber-200';
      case 'error':
        return 'border-rose-200 dark:border-rose-800/60 bg-rose-50/95 dark:bg-[#25181C] text-rose-950 dark:text-rose-200';
      default:
        return 'border-blue-200 dark:border-blue-800/60 bg-blue-50/95 dark:bg-[#152028] text-blue-950 dark:text-blue-200';
    }
  };

  return (
    <div 
      className="fixed bottom-24 sm:bottom-4 start-3 end-3 sm:start-4 sm:end-auto z-50 flex flex-col gap-2 max-w-sm pointer-events-none p-2"
      dir={dir}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 fade-in ${getBorderColor(
            t.type
          )}`}
        >
          <div className="shrink-0 mt-0.5">{getToastIcon(t.type)}</div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold leading-tight">{t.title}</h5>
            <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
