'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  PlusCircle, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface HeroSectionProps {
  onOpenQR: () => void;
}

export default function HeroSection({ onOpenQR }: HeroSectionProps) {
  const { items } = useApp();

  const totalLost = items.filter((i) => i.type === 'lost' && i.status !== 'reunited').length;
  const totalFound = items.filter((i) => i.type === 'found' && i.status !== 'reunited').length;
  const totalReunited = items.filter((i) => i.status === 'reunited').length + 42; // Base school stat

  return (
    <section className="relative pt-8 sm:pt-14 pb-10 text-center space-y-6 max-w-4xl mx-auto">
      
      {/* Apple Subtle Pill Tag */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8E8ED] text-[#1D1D1F] text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
        <span>منصة المفقودات المدرسية الذكية</span>
      </div>

      {/* Main Title & Clean Tagline */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1D1D1F] leading-tight">
          لا تفقد أملك في العثور على{' '}
          <span className="text-[#0071E3]">
            ممتلكاتك المدرسية.
          </span>
        </h1>

        <p className="text-lg sm:text-xl font-medium text-[#6E6E73] tracking-wide">
          فُقِدَ. تَطابَقَ. عَادَ.
        </p>

        <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#86868B] leading-relaxed">
          نظام بسيط وموثوق يربط بلاغات الفقدان والعثور عبر مطابقة فورية وسؤال سري يحفظ الأمانة بين الطلاب.
        </p>
      </div>

      {/* Apple Style Dual CTA Pill Buttons */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
        
        {/* Lost Button - Apple Primary Blue */}
        <Link
          href="/report?type=lost"
          className="w-full sm:w-1/2 py-3 px-6 rounded-full apple-btn-primary font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          <Search className="w-4 h-4" />
          <span>أضعت شيئاً؟</span>
        </Link>

        {/* Found Button - Apple Secondary Gray */}
        <Link
          href="/report?type=found"
          className="w-full sm:w-1/2 py-3 px-6 rounded-full apple-btn-secondary font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#34C759]" />
          <span>عثرت على شيء؟</span>
        </Link>

      </div>

      {/* Quick QR Trigger link */}
      <div className="pt-1">
        <button
          onClick={onOpenQR}
          className="inline-flex items-center gap-1.5 text-xs text-[#0071E3] hover:underline font-medium"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>محاكاة مسح ملصقات الـ QR في المعامل والمكتبة &larr;</span>
        </button>
      </div>

      {/* Apple Clean Stat Cards */}
      <div className="pt-6 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
        
        <div className="apple-card rounded-2xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-[#1D1D1F]">
            {totalReunited}
          </div>
          <p className="text-[11px] sm:text-xs text-[#6E6E73] mt-0.5">غرضاً أُعيدت لأصحابها</p>
        </div>

        <div className="apple-card rounded-2xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-[#1D1D1F]">
            {totalLost}
          </div>
          <p className="text-[11px] sm:text-xs text-[#6E6E73] mt-0.5">مفقودات قيد البحث</p>
        </div>

        <div className="apple-card rounded-2xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-[#0071E3]">
            94%
          </div>
          <p className="text-[11px] sm:text-xs text-[#6E6E73] mt-0.5">دقة المطابقة الذكية</p>
        </div>

      </div>

    </section>
  );
}
