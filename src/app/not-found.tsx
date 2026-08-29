'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="app-card p-6 sm:p-8 max-w-md w-full text-center space-y-5 bg-white border border-[#E4E7E4]">
        <div className="w-14 h-14 rounded-2xl bg-[#E6F1ED] border border-[#C2DDD5] text-[#176B5B] flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 text-right sm:text-center">
          <span className="text-[11px] font-bold text-[#176B5B] uppercase tracking-wider block">
            404 · الصفحة غير موجودة
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D]">
            لم نتمكن من العثور على هذا المسار
          </h2>
          <p className="text-xs text-[#66706B] leading-relaxed">
            ربما تم نقل الصفحة أو أن الرابط غير صحيح. يمكنك العودة واستكشاف مفقودات المدرسة.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <Link
            href="/explore"
            className="w-full py-2.5 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>استكشاف المعثورات</span>
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-[#66706B]" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
