'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  PlusCircle, 
  Sparkles, 
  QrCode
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface HeroSectionProps {
  onOpenQR: () => void;
}

export default function HeroSection({ onOpenQR }: HeroSectionProps) {
  const { items, dir, language } = useApp();

  const totalLost = items.filter((i) => i.type === 'lost' && i.status !== 'reunited').length;
  const totalFound = items.filter((i) => i.type === 'found' && i.status !== 'reunited').length;
  const totalReunited = items.filter((i) => i.status === 'reunited').length + 42;

  return (
    <section className="relative pt-6 sm:pt-10 pb-8 text-center space-y-6 max-w-4xl mx-auto" dir={dir}>
      
      {/* Subtle Tag Pill */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] text-xs font-bold border border-emerald-200/60 dark:border-[#1E463D]">
        <Sparkles className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#2DD4BF]" />
        <span>{language === 'en' ? 'Smart School Lost & Found Platform' : 'منصة المفقودات والأمانات المدرسية الذكية'}</span>
      </div>

      {/* Main Title & Clean Tagline */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#18201D] dark:text-white leading-tight">
          {language === 'en' ? 'Never lose hope in finding ' : 'لا تفقد أملك في العثور على '}
          <span className="text-[#176B5B] dark:text-[#2DD4BF]">
            {language === 'en' ? 'your school belongings.' : 'ممتلكاتك المدرسية.'}
          </span>
        </h1>

        <p className="text-lg sm:text-xl font-bold text-[#66706B] dark:text-[#94A39D] tracking-wide">
          {language === 'en' ? 'Lost. Matched. Reunited.' : 'فُقِدَ. تَطابَقَ. عَادَ.'}
        </p>

        <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#66706B] dark:text-[#94A39D] leading-relaxed">
          {language === 'en' 
            ? 'A reliable school system matching lost & found reports instantly with secret ownership verification.' 
            : 'نظام بسيط وموثوق يربط بلاغات الفقدان والعثور عبر مطابقة فورية وسؤال سري يحفظ الأمانة بين الطلاب.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
        <Link
          href="/report?type=lost"
          className="w-full sm:w-1/2 py-3 px-6 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#125648] dark:hover:bg-[#14B8A6] transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>{language === 'en' ? 'Lost Something?' : 'أضعت شيئاً؟'}</span>
        </Link>

        <Link
          href="/report?type=found"
          className="w-full sm:w-1/2 py-3 px-6 rounded-2xl bg-white dark:bg-[#1C2B27] border border-[#E4E7E4] dark:border-[#2D3E3A] text-[#18201D] dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-[#253934] transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
          <span>{language === 'en' ? 'Found Something?' : 'عثرت على شيء؟'}</span>
        </Link>
      </div>

      {/* Quick QR Trigger */}
      <div className="pt-1">
        <button
          onClick={onOpenQR}
          className="inline-flex items-center gap-1.5 text-xs text-[#176B5B] dark:text-[#2DD4BF] hover:underline font-bold cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Scan room QR posters in labs and library →' : 'محاكاة مسح ملصقات الـ QR في المعامل والمكتبة ←'}</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="pt-4 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl p-3 sm:p-4 text-center shadow-xs">
          <div className="text-xl sm:text-2xl font-black text-[#176B5B] dark:text-[#2DD4BF]">
            {totalReunited}
          </div>
          <p className="text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5">
            {language === 'en' ? 'Items Reunited' : 'غرضاً أُعيدت لأصحابها'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl p-3 sm:p-4 text-center shadow-xs">
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {totalLost}
          </div>
          <p className="text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5">
            {language === 'en' ? 'Active Lost Reports' : 'بلاغ مفقود جاري البحث عنه'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl p-3 sm:p-4 text-center shadow-xs">
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {totalFound}
          </div>
          <p className="text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5">
            {language === 'en' ? 'Found Items Waiting' : 'معثورات بانتظار أصحابها'}
          </p>
        </div>
      </div>

    </section>
  );
}
