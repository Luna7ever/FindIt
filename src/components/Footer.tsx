'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const { t, dir, language } = useApp();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-[#23332F] bg-white dark:bg-[#0D1412] text-slate-500 dark:text-[#94A39D] text-xs py-10 mt-auto transition-colors duration-300" dir={dir}>
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="space-y-2 md:col-span-2 text-start">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#176B5B] to-emerald-500 flex items-center justify-center shadow-sm">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-sm text-[#18201D] dark:text-white">{t('app.name')}</span>
            </div>
            <p className="text-xs text-[#66706B] dark:text-[#94A39D] leading-relaxed max-w-md">
              {language === 'en' 
                ? 'Unified school lost & found platform. Motto: ' 
                : 'المنظومة المدرسية الموحدة للمفقودات والأمانات. شعارنا: '}
              <span className="text-[#18201D] dark:text-emerald-400 font-bold mx-1">{t('app.motto')}</span>
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-start">
            <h4 className="text-[11px] font-bold text-[#18201D] dark:text-white uppercase tracking-wider">
              {language === 'en' ? 'Quick Links' : 'روابط سريعة'}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/report?type=lost" className="hover:text-[#176B5B] dark:hover:text-emerald-400 transition-colors">
                  {language === 'en' ? 'Report Lost Item' : 'الإبلاغ عن مفقود'}
                </Link>
              </li>
              <li>
                <Link href="/report?type=found" className="hover:text-[#176B5B] dark:hover:text-emerald-400 transition-colors">
                  {language === 'en' ? 'Report Found Item' : 'تسجيل معثور عليه'}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#176B5B] dark:hover:text-emerald-400 transition-colors">
                  {t('nav.admin')}
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-[#176B5B] dark:hover:text-emerald-400 transition-colors">
                  {t('nav.settings')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety */}
          <div className="space-y-2 text-start">
            <h4 className="text-[11px] font-bold text-[#18201D] dark:text-white uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#176B5B] dark:text-emerald-400" />
              {language === 'en' ? 'School Safety' : 'الأمان المدرسي'}
            </h4>
            <p className="text-xs text-[#66706B] dark:text-[#94A39D] leading-relaxed">
              {language === 'en'
                ? 'All item handovers are verified in designated campus points via 4-digit secure PIN codes.'
                : 'تتم كافة عمليات التسليم في نقاط معلنة داخل المدرسة وبموجب رمز PIN المكون من 4 أرقام.'}
            </p>
          </div>

        </div>

        <div className="border-t border-slate-100 dark:border-[#23332F] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-[#94A39D]/70">
          <p>{language === 'en' ? '© 2026 FindIt - Official School Lost & Found System.' : '© 2026 FindIt - منظومة المفقودات المدرسية المعتمدة.'}</p>
          <div className="flex items-center gap-1">
            <span>{language === 'en' ? 'Designed to foster honesty & cooperation' : 'صُممت لتعزيز الأمانة والتعاون'}</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
