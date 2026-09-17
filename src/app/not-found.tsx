'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function NotFound() {
  const { language, t, dir } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12" dir={dir}>
      <div className="app-card p-6 sm:p-8 max-w-md w-full text-center space-y-5 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] transition-colors duration-300">
        <div className="w-14 h-14 rounded-2xl bg-[#E6F1ED] dark:bg-[#176B5B]/20 border border-[#C2DDD5] dark:border-[#176B5B]/40 text-[#176B5B] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 text-start sm:text-center">
          <span className="text-[11px] font-bold text-[#176B5B] dark:text-emerald-400 uppercase tracking-wider block">
            {t('notFound.tag')}
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D] dark:text-white">
            {t('notFound.title')}
          </h2>
          <p className="text-xs text-[#66706B] dark:text-[#94A39D] leading-relaxed">
            {t('notFound.desc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <Link
            href="/explore"
            className="w-full py-2.5 px-4 min-h-[40px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t('notFound.exploreBtn')}</span>
          </Link>

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
