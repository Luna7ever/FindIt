'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-500 text-xs py-10 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="space-y-2 md:col-span-2 text-right">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <Compass className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-slate-900">FindIt</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              المنظومة المدرسية الموحدة للمفقودات والأمانات. شعارنا: 
              <span className="text-slate-900 font-semibold mx-1">فُقِدَ. تَطابَقَ. عَادَ.</span>
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-right">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">روابط سريعة</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/report?type=lost" className="hover:text-blue-600 transition-colors">
                  الإبلاغ عن مفقود
                </Link>
              </li>
              <li>
                <Link href="/report?type=found" className="hover:text-emerald-600 transition-colors">
                  تسجيل معثور عليه
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-600 transition-colors">
                  لوحة المشرف المدرسي
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety */}
          <div className="space-y-2 text-right">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              الأمان المدرسي
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              تتم كافة عمليات التسليم في نقاط معلنة داخل المدرسة وبموجب رمز PIN المكون من 4 أرقام.
            </p>
          </div>

        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 FindIt - منظومة المفقودات المدرسية المعتمدة.</p>
          <div className="flex items-center gap-1">
            <span>صُممت لتعزيز الأمانة والتعاون</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
