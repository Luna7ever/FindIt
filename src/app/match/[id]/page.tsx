'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { findMatchesForItem } from '@/lib/matching';
import { SCHOOL_LOCATIONS, CATEGORIES } from '@/lib/constants';
import { formatArabicDate } from '@/lib/utils';
import ClaimModal from '@/components/ClaimModal';
import ItemVisual from '@/components/ItemVisual';
import { 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Lock,
  ChevronLeft,
  RotateCcw,
  Search
} from 'lucide-react';

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getItemById, items } = useApp();

  const [isScanning, setIsScanning] = useState(true);
  const [selectedClaimItemId, setSelectedClaimItemId] = useState<string | null>(null);

  const targetItem = getItemById(resolvedParams.id);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  if (!targetItem) {
    return (
      <div className="px-4 py-16 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-[#E11D48] mx-auto" />
        <h2 className="text-xl font-bold text-[#18201D]">البلاغ غير موجود</h2>
        <p className="text-xs text-[#66706B]">قد يكون تم حذفه أو استرداده بالكامل.</p>
        <Link
          href="/"
          className="inline-block py-2.5 px-5 rounded-xl bg-[#18201D] text-white text-xs font-bold"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const matches = findMatchesForItem(targetItem, items);
  const targetLocation = SCHOOL_LOCATIONS.find((l) => l.id === targetItem.locationId);
  const targetCategory = CATEGORIES.find((c) => c.id === targetItem.category);

  const getConfidenceLabel = (score: number) => {
    if (score >= 85) return { label: 'تطابق ممتاز', color: 'text-[#059669] bg-[#D1FAE5]' };
    if (score >= 70) return { label: 'تطابق قوي جداً', color: 'text-[#176B5B] bg-[#E6F1ED]' };
    if (score >= 50) return { label: 'تطابق محتمل', color: 'text-[#D97706] bg-[#FEF3C7]' };
    return { label: 'توافق تقريبي', color: 'text-[#66706B] bg-[#F1F3F0]' };
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto space-y-6">
      
      {/* Back link & Title */}
      <div className="flex items-center justify-between text-right">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#66706B] hover:text-[#18201D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>العودة للرئيسية</span>
        </Link>
        <span className="text-xs font-bold text-[#176B5B] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>نظام المطابقة الفورية</span>
        </span>
      </div>

      {/* Target Item Reference Card */}
      <div className="app-card p-4 sm:p-5 bg-white flex items-center justify-between gap-4 text-right">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
            <ItemVisual
              category={targetItem.category}
              title={targetItem.title}
              imageUrl={targetItem.imageUrl}
              className="w-full h-full"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                targetItem.type === 'lost' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#D1FAE5] text-[#065F46]'
              }`}>
                {targetItem.type === 'lost' ? 'بلاغ الفقدان' : 'بلاغ الأمانة'}
              </span>
              <span className="text-[11px] text-[#66706B]">{targetCategory?.label}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#18201D] truncate">{targetItem.title}</h1>
            <div className="flex items-center gap-2 text-xs text-[#66706B] mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#176B5B]" />
                {targetLocation?.name}
              </span>
              <span>•</span>
              <span>اللون: {targetItem.color}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsScanning(true)}
          className="p-2 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] text-xs font-bold shrink-0"
          title="إعادة الفحص"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Results View */}
      {isScanning ? (
        <div className="app-card p-12 text-center space-y-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-[#E6F1ED] text-[#176B5B] flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#18201D]">جارِ فحص ومقارنة البلاغات...</h3>
          <p className="text-xs text-[#66706B] max-w-sm mx-auto">
            تتم مقارنة الفئة، الموقع المدرسي، التقارب الزمني، والمواصفات المسجلة.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in">
          
          <div className="flex items-center justify-between text-right">
            <h2 className="text-sm sm:text-base font-bold text-[#18201D] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>المطابقات المكتشفة ({matches.length})</span>
            </h2>
            <span className="text-xs text-[#66706B]">
              مرتبة حسب قوة التطابق
            </span>
          </div>

          {matches.length > 0 ? (
            <div className="space-y-3.5">
              {matches.map((match) => {
                const item = match.matchedItem;
                const breakdown = match.breakdown;
                const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
                const confidence = getConfidenceLabel(breakdown.totalScore);

                return (
                  <div
                    key={item.id}
                    className="app-card p-5 sm:p-6 bg-white space-y-4 text-right"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      {/* Left Item Info */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          <ItemVisual
                            category={item.category}
                            title={item.title}
                            imageUrl={item.imageUrl}
                            className="w-full h-full"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46]">
                              {item.type === 'found' ? 'غرض معثور عليه' : 'غرض مفقود'}
                            </span>
                            <span className="text-[10px] text-[#66706B]">
                              {formatArabicDate(item.date)}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-[#18201D] truncate">{item.title}</h3>
                          <p className="text-xs text-[#66706B] line-clamp-1">{item.description}</p>

                          <div className="flex items-center gap-2 text-xs text-[#66706B]">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#176B5B]" />
                              {loc?.name}
                            </span>
                            <span>•</span>
                            <span>اللون: {item.color}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Confidence Score */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-right sm:text-left">
                          <span className="text-2xl font-black text-[#176B5B] block leading-none">
                            {breakdown.totalScore}%
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${confidence.color}`}>
                            {confidence.label}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Match Reasons Chips */}
                    <div className="pt-2 border-t border-[#E4E7E4] flex flex-wrap gap-1.5">
                      {breakdown.matchReasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-[#F1F3F0] text-[#18201D] font-medium"
                        >
                          ✓ {reason}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="pt-1">
                      {targetItem.type === 'lost' && item.type === 'found' ? (
                        <button
                          onClick={() => setSelectedClaimItemId(item.id)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>هذا غراضي! (بدء التحقق وإثبات الملكية)</span>
                        </button>
                      ) : (
                        <Link
                          href={`/items/${item.id}`}
                          className="w-full py-2 px-4 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] font-bold text-xs transition-all flex items-center justify-center gap-1"
                        >
                          <span>معاينة تفاصيل الغرض</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Empathetic Empty State */
            <div className="app-card p-12 text-center space-y-3 bg-white max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#F1F3F0] flex items-center justify-center mx-auto text-[#66706B]">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-[#18201D]">
                  لسه ما لقيناش تطابق مناسب
                </h3>
                <p className="text-xs text-[#66706B] leading-relaxed">
                  تم حفظ بلاغك بأمان، وسنستمر في مقارنته تلقائياً مع أي أغراض جديدة تُسجل في المدرسة.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-block py-2.5 px-6 rounded-xl bg-[#18201D] text-white text-xs font-bold"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Claim Sheet Modal */}
      {selectedClaimItemId && (
        <ClaimModal
          itemId={selectedClaimItemId}
          isOpen={true}
          onClose={() => setSelectedClaimItemId(null)}
        />
      )}

    </div>
  );
}
