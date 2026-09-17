'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logging/logger';
import { useApp } from '@/context/AppContext';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language, t, dir } = useApp();

  useEffect(() => {
    logger.error('Unhandled UI error captured in error boundary', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12" dir={dir}>
      <div className="app-card p-6 sm:p-8 max-w-md w-full text-center space-y-5 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] transition-colors duration-300">
        <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] dark:bg-rose-950/40 border border-[#FEE2E2] dark:border-rose-900/60 text-[#E11D48] dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 text-start sm:text-center">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D] dark:text-white">
            {t('error.title')}
          </h2>
          <p className="text-xs text-[#66706B] dark:text-[#94A39D] leading-relaxed">
            {t('error.desc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 min-h-[40px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('error.retry')}</span>
          </button>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-transparent dark:border-[#2D3E3A]"
          >
            <Home className="w-4 h-4 text-[#66706B] dark:text-[#94A39D]" />
            <span>{t('nav.home')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
