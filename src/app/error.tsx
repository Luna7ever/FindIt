'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logging/logger';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Unhandled UI error captured in error boundary', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="app-card p-6 sm:p-8 max-w-md w-full text-center space-y-5 bg-white border border-[#E4E7E4]">
        <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#E11D48] flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 text-right sm:text-center">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D]">
            حدث خطأ غير متوقع
          </h2>
          <p className="text-xs text-[#66706B] leading-relaxed">
            نعتذر، واجه النظام مشكلة أثناء معالجة طلبك. تم تسجيل الخطأ للعمل على حله.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-[#66706B]" />
            <span>الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
