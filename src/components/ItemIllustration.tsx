'use client';

import React from 'react';
import { ItemCategory } from '@/types';

interface ItemIllustrationProps {
  category: ItemCategory;
  title?: string;
  className?: string;
}

export default function ItemIllustration({
  category,
  title = '',
  className = '',
}: ItemIllustrationProps) {
  const t = title.toLowerCase();

  // 1. CALCULATOR (حاسبة)
  if (t.includes('حاسبة') || t.includes('كاسيو') || t.includes('calculator') || t.includes('fx-')) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#EBF4F1] p-4 ${className}`}>
        <div className="w-20 h-28 bg-[#18201D] rounded-2xl p-2.5 shadow-md flex flex-col justify-between border border-[#2E3B36] relative">
          {/* Solar Panel & Logo */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[7px] font-bold tracking-widest text-[#66706B] font-mono">CASIO</span>
            <div className="w-5 h-1.5 bg-[#4A3B2C] rounded-xs border border-[#6B5540]/50" />
          </div>

          {/* LCD Screen */}
          <div className="w-full h-6 bg-[#A8BFA8] rounded-lg px-1.5 flex items-center justify-end font-mono text-[9px] font-bold text-[#18201D] shadow-inner">
            <span>0.00</span>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-1 pt-1">
            <div className="h-2 rounded-xs bg-[#40534C]" />
            <div className="h-2 rounded-xs bg-[#40534C]" />
            <div className="h-2 rounded-xs bg-[#40534C]" />
            <div className="h-2 rounded-xs bg-[#D97706]" />
            
            <div className="h-2 rounded-xs bg-[#2B3833]" />
            <div className="h-2 rounded-xs bg-[#2B3833]" />
            <div className="h-2 rounded-xs bg-[#2B3833]" />
            <div className="h-2 rounded-xs bg-[#40534C]" />

            <div className="h-2 rounded-xs bg-[#2B3833]" />
            <div className="h-2 rounded-xs bg-[#2B3833]" />
            <div className="h-2 rounded-xs bg-[#2B3833]" />
            <div className="h-2 rounded-xs bg-[#176B5B]" />
          </div>
        </div>
      </div>
    );
  }

  // 2. HEADPHONES / AIRPODS (سماعات)
  if (t.includes('سماع') || t.includes('airpods') || t.includes('earbuds') || t.includes('headphone')) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#EEF2FF] p-4 ${className}`}>
        <div className="relative flex flex-col items-center">
          {/* Charging Case */}
          <div className="w-20 h-24 bg-white rounded-3xl p-3 shadow-md border border-[#E0E7FF] flex flex-col items-center justify-between relative">
            {/* Case Lid Seam */}
            <div className="w-full h-0.5 bg-[#E0E7FF] mt-4" />
            
            {/* Status LED */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#059669] shadow-xs" />

            {/* Subtle Metallic Hinge back / bottom port */}
            <div className="w-3 h-1 bg-[#CBD5E1] rounded-full" />
          </div>

          {/* Stem silhouette floating hint */}
          <div className="absolute -top-3 -right-2 w-3.5 h-8 bg-white rounded-full border border-[#E0E7FF] shadow-xs rotate-12" />
        </div>
      </div>
    );
  }

  // 3. WATER BOTTLE (قارورة ماء)
  if (t.includes('قارورة') || t.includes('ماء') || t.includes('bottle') || t.includes('حافظة') || category === 'bottles') {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#F0F9FF] p-4 ${className}`}>
        <div className="flex flex-col items-center">
          {/* Cap & Loop */}
          <div className="w-5 h-4 bg-[#0369A1] rounded-t-lg relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-2.5 border-2 border-[#0369A1] rounded-t-full" />
          </div>
          {/* Bottle Neck */}
          <div className="w-7 h-2 bg-[#E0F2FE]" />
          {/* Main Body */}
          <div className="w-14 h-26 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-2xl shadow-md relative overflow-hidden flex items-center justify-center">
            {/* Matte Reflection Stripe */}
            <div className="absolute left-2 top-0 bottom-0 w-1.5 bg-white/25 rounded-full" />
            <span className="text-[7px] font-bold text-white/50 tracking-widest rotate-90 uppercase">HYDRO</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. NOTEBOOK / BOOK (دفتر أو كتاب)
  if (t.includes('دفتر') || t.includes('كتاب') || t.includes('ملاحظات') || category === 'books') {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#FFFBEB] p-4 ${className}`}>
        <div className="w-22 h-28 bg-[#B45309] rounded-r-2xl rounded-l-md p-3 shadow-md border-l-4 border-l-[#78350F] flex flex-col justify-between relative overflow-hidden">
          {/* Elastic Band */}
          <div className="absolute right-3 top-0 bottom-0 w-1.5 bg-[#78350F]" />
          
          {/* Label Card */}
          <div className="w-12 h-6 bg-[#FEF3C7] rounded-md p-1 border border-[#FDE68A] shadow-2xs space-y-1">
            <div className="w-full h-0.5 bg-[#B45309]/40 rounded-full" />
            <div className="w-2/3 h-0.5 bg-[#B45309]/30 rounded-full" />
          </div>

          {/* Bookmark Ribbon */}
          <div className="absolute -top-1 left-5 w-2 h-8 bg-[#DC2626] rounded-b-xs shadow-xs" />

          {/* Bottom subtle text */}
          <span className="text-[7px] font-bold text-[#FEF3C7]/70 font-mono">MATH 2026</span>
        </div>
      </div>
    );
  }

  // 5. KEYS (مفاتيح)
  if (t.includes('مفتاح') || t.includes('مفاتيح') || t.includes('keys') || category === 'keys') {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#FEF3C7] p-4 ${className}`}>
        <div className="relative flex items-center justify-center">
          {/* Key Ring */}
          <div className="w-12 h-12 rounded-full border-4 border-[#94A3B8] shadow-xs relative flex items-center justify-center">
            {/* Leather Fob */}
            <div className="absolute -top-3 w-5 h-7 bg-[#B45309] rounded-md border border-[#78350F] shadow-2xs" />
          </div>

          {/* Key 1 (Brass) */}
          <div className="absolute top-6 left-1 w-4 h-16 bg-[#D97706] rounded-t-full rounded-b-sm border border-[#B45309] shadow-xs flex flex-col items-center rotate-12">
            <div className="w-2 h-2 rounded-full bg-[#FEF3C7] mt-1" />
            <div className="w-1.5 h-1 bg-[#B45309] mt-6 ml-1.5" />
            <div className="w-1.5 h-1 bg-[#B45309] mt-1 ml-1.5" />
          </div>

          {/* Key 2 (Silver) */}
          <div className="absolute top-6 right-1 w-4 h-14 bg-[#CBD5E1] rounded-t-full rounded-b-sm border border-[#94A3B8] shadow-xs flex flex-col items-center -rotate-12">
            <div className="w-2 h-2 rounded-full bg-[#FEF3C7] mt-1" />
            <div className="w-1.5 h-1 bg-[#64748B] mt-5 mr-1.5" />
          </div>
        </div>
      </div>
    );
  }

  // 6. WATCH (ساعة يد)
  if (t.includes('ساعة') || t.includes('watch')) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#F8FAFC] p-4 ${className}`}>
        <div className="flex flex-col items-center">
          {/* Top Strap */}
          <div className="w-7 h-6 bg-[#334155] rounded-t-lg border-x border-[#1E293B]" />
          
          {/* Watch Case */}
          <div className="w-18 h-18 rounded-full bg-[#E2E8F0] border-3 border-[#94A3B8] shadow-md flex items-center justify-center relative p-1.5">
            {/* Watch Dial */}
            <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center relative shadow-inner">
              {/* Hour & Minute Hands */}
              <div className="absolute w-0.5 h-4 bg-[#38BDF8] -top-1 rounded-full origin-bottom rotate-45" />
              <div className="absolute w-0.5 h-5 bg-white -top-2 rounded-full origin-bottom -rotate-45" />
              {/* Center Dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] z-10" />
            </div>

            {/* Crown button */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-[#64748B] rounded-r-xs" />
          </div>

          {/* Bottom Strap */}
          <div className="w-7 h-6 bg-[#334155] rounded-b-lg border-x border-[#1E293B]" />
        </div>
      </div>
    );
  }

  // 7. PENCIL CASE (مقلمة)
  if (t.includes('مقلمة') || t.includes('أقلام') || category === 'stationery') {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#ECFEFF] p-4 ${className}`}>
        <div className="w-26 h-16 bg-[#0891B2] rounded-3xl p-2 shadow-md border-2 border-[#0E7490] flex flex-col justify-between relative">
          {/* Zipper Line */}
          <div className="w-full h-1 bg-[#155E75] rounded-full flex items-center justify-start px-2">
            {/* Zipper Pull */}
            <div className="w-2.5 h-4 bg-[#F59E0B] rounded-b-sm border border-[#B45309] -mt-1 shadow-xs" />
          </div>

          {/* Fabric Pattern Patch */}
          <div className="px-3 py-1 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-[8px] font-bold text-white tracking-wider">FINDIT POUCH</span>
          </div>

          {/* Bottom Stitching */}
          <div className="w-full border-b border-dashed border-white/40" />
        </div>
      </div>
    );
  }

  // 8. BACKPACK (حقيبة ظهر)
  if (t.includes('حقيبة') || t.includes('شنطة') || t.includes('backpack') || category === 'bags') {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#F1F5F9] p-4 ${className}`}>
        <div className="flex flex-col items-center">
          {/* Handle */}
          <div className="w-8 h-3 border-2 border-[#334155] rounded-t-full" />
          
          {/* Main Body */}
          <div className="w-22 h-26 bg-[#1E293B] rounded-t-3xl rounded-b-xl p-3 shadow-md border border-[#0F172A] flex flex-col justify-between relative">
            {/* Top Zipper */}
            <div className="w-full h-1 bg-[#475569] rounded-full" />

            {/* Front Pocket */}
            <div className="w-full h-10 bg-[#334155] rounded-xl p-1.5 border border-[#475569] flex flex-col justify-between">
              <div className="w-full h-0.5 bg-[#64748B] rounded-full" />
              <div className="w-4 h-2 bg-[#F59E0B] rounded-xs mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 9. USB FLASH DRIVE (ذاكرة فلاش)
  if (t.includes('فلاش') || t.includes('usb') || t.includes('ذاكرة')) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#F3F4F6] p-4 ${className}`}>
        <div className="flex items-center">
          {/* Metal USB Connector */}
          <div className="w-7 h-5 bg-[#CBD5E1] border border-[#94A3B8] rounded-l-xs flex items-center justify-center gap-1 shadow-inner">
            <div className="w-1.5 h-1.5 bg-[#475569] rounded-xs" />
            <div className="w-1.5 h-1.5 bg-[#475569] rounded-xs" />
          </div>
          {/* Drive Body */}
          <div className="w-16 h-8 bg-gradient-to-r from-[#176B5B] to-[#125648] rounded-r-xl border border-[#0F3E34] shadow-md flex items-center justify-between px-2.5">
            <span className="text-[7px] font-bold text-white/80 font-mono">64GB</span>
            {/* LED */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] shadow-xs" />
          </div>
        </div>
      </div>
    );
  }

  // 10. SCHOOL ID CARD (بطاقة مدرسية)
  if (t.includes('بطاقة') || t.includes('هوية') || t.includes('id') || category === 'wallets_cards') {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#ECFDF5] p-4 ${className}`}>
        <div className="w-26 h-18 bg-white rounded-xl p-2.5 shadow-md border border-[#A7F3D0] flex flex-col justify-between relative overflow-hidden">
          {/* Top Green Stripe */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#059669]" />
          
          <div className="flex items-center gap-2 pt-1">
            {/* Photo Silhouette */}
            <div className="w-6 h-7 bg-[#CBD5E1] rounded-md flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#94A3B8] mb-1" />
            </div>
            {/* Text lines */}
            <div className="space-y-1 flex-1">
              <div className="w-full h-1.5 bg-[#18201D] rounded-xs" />
              <div className="w-3/4 h-1 bg-[#66706B] rounded-xs" />
              <div className="w-1/2 h-1 bg-[#059669] rounded-xs" />
            </div>
          </div>

          {/* Smart Chip & Barcode */}
          <div className="flex items-center justify-between pt-1 border-t border-[#E4E7E4]">
            <div className="w-3 h-2.5 bg-[#F59E0B] rounded-xs border border-[#D97706]" />
            <span className="text-[6px] font-mono font-bold text-[#66706B]">ID #4826</span>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT / CLOTHING / PERSONAL
  return (
    <div className={`w-full h-full flex items-center justify-center bg-[#F5F3FF] p-4 ${className}`}>
      <div className="w-20 h-24 bg-[#7C3AED] rounded-2xl shadow-md border border-[#6D28D9] flex flex-col items-center justify-between p-3 relative overflow-hidden">
        <div className="w-8 h-4 bg-white/20 rounded-full" />
        <span className="text-[8px] font-bold text-white uppercase tracking-wider">{category}</span>
        <div className="w-full h-0.5 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}
