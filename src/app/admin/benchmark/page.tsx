'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function BenchmarkPage() {
  const router = useRouter();
  const { dir, isRtl, language } = useApp();
  const isEn = language === 'en';

  useEffect(() => {
    // Automatically redirect back to Admin dashboard as Benchmark / Confusion Matrix has been retired from screens
    const timer = setTimeout(() => {
      router.replace('/admin');
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full max-w-lg mx-auto py-16 px-4 text-center space-y-4" dir={dir}>
      <div className="w-16 h-16 rounded-2xl bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] flex items-center justify-center mx-auto shadow-sm">
        <ShieldCheck className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-black text-slate-800 dark:text-white">
        {isEn ? 'Screen Retired' : 'تم أرشفة الشاشة'}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {isEn 
          ? 'The Confusion Matrix benchmark screen has been retired from the active interface. Redirecting to Admin dashboard...' 
          : 'تم إيقاف وحذف شاشة مصفوفة الارتباك المخصصة لآيسف من واجهات التطبيق الحالية. جارٍ تحويلك للوحة الإدارة...'}
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-all shadow-sm"
      >
        <span>{isEn ? 'Return to Admin Dashboard' : 'العودة للوحة الإدارة الآن'}</span>
        {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </Link>
    </div>
  );
}
