'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { findMatchesForItem } from '@/lib/matching';
import { SCHOOL_LOCATIONS, CATEGORIES } from '@/lib/constants';
import { formatAppDate } from '@/lib/utils';
import { getLocalizedItem, getLocalizedLocation, getLocalizedColorName } from '@/lib/i18n/seedDataTranslations';
import ClaimModal from '@/components/ClaimModal';
import ItemVisual from '@/components/ItemVisual';
import ExplainableAiBreakdown from '@/components/ExplainableAiBreakdown';
import { 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  Lock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search
} from 'lucide-react';

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getItemById, items, dir, isRtl, language, t } = useApp();

  const [isScanning, setIsScanning] = useState(true);
  const [selectedClaimItemId, setSelectedClaimItemId] = useState<string | null>(null);

  const rawTargetItem = getItemById(resolvedParams.id);
  const targetItem = rawTargetItem ? getLocalizedItem(rawTargetItem, language) : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  if (!targetItem) {
    return (
      <div className="px-4 py-16 text-center max-w-md mx-auto space-y-4" dir={dir}>
        <AlertCircle className="w-12 h-12 text-[#E11D48] mx-auto" />
        <h2 className="text-xl font-bold text-[#18201D] dark:text-white">{t('item.notFound')}</h2>
        <p className="text-xs text-[#66706B] dark:text-[#94A39D]">{t('item.notFoundDesc')}</p>
        <Link
          href="/"
          className="inline-block py-2.5 px-5 rounded-xl bg-[#18201D] dark:bg-[#1C2B27] text-white text-xs font-bold"
        >
          {t('app.backHome')}
        </Link>
      </div>
    );
  }

  const matches = rawTargetItem ? findMatchesForItem(rawTargetItem, items, 10, language) : [];
  const rawTargetLocation = SCHOOL_LOCATIONS.find((l) => l.id === targetItem?.locationId);
  const targetLocation = rawTargetLocation ? getLocalizedLocation(rawTargetLocation, language) : undefined;
  const targetCategory = CATEGORIES.find((c) => c.id === targetItem?.category);

  const getConfidenceLabel = (score: number) => {
    if (score >= 85) return { label: t('match.excellent'), color: 'text-[#059669] dark:text-emerald-300 bg-[#D1FAE5] dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800' };
    if (score >= 70) return { label: t('match.strong'), color: 'text-[#176B5B] dark:text-emerald-300 bg-[#E6F1ED] dark:bg-[#176B5B]/30 border border-[#176B5B]/30' };
    if (score >= 50) return { label: t('match.probable'), color: 'text-[#D97706] dark:text-amber-300 bg-[#FEF3C7] dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800' };
    return { label: t('match.approx'), color: 'text-[#66706B] dark:text-[#94A39D] bg-[#F1F3F0] dark:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A]' };
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto space-y-6" dir={dir}>
      
      {/* Back link & Title */}
      <div className="flex items-center justify-between text-start">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('app.backHome')}</span>
        </Link>
        <span className="text-xs font-bold text-[#176B5B] dark:text-emerald-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('match.title')}</span>
        </span>
      </div>

      {/* Target Item Reference Card */}
      <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] flex items-center justify-between gap-4 text-start transition-colors duration-300">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-[#2D3E3A]">
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
                targetItem.type === 'lost' 
                  ? 'bg-[#FEF3C7] dark:bg-amber-950/80 text-[#92400E] dark:text-amber-200 border border-amber-300 dark:border-amber-800' 
                  : 'bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              }`}>
                {targetItem.type === 'lost' ? (language === 'en' ? 'Lost Item Report' : 'بلاغ الفقدان') : (language === 'en' ? 'Found Item Report' : 'بلاغ الأمانة')}
              </span>
              <span className="text-[11px] text-[#66706B] dark:text-[#94A39D]">{t('cat.' + targetItem.category) || targetCategory?.label}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#18201D] dark:text-white truncate">{targetItem.title}</h1>
            <div className="flex items-center gap-2 text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#176B5B] dark:text-emerald-400" />
                {targetLocation?.name}
              </span>
              <span>•</span>
              <span>{t('item.color')}: {getLocalizedColorName(targetItem.color, language)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsScanning(true)}
          className="p-2 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white text-xs font-bold shrink-0 border border-transparent dark:border-[#2D3E3A] cursor-pointer"
          title="إعادة الفحص"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Results View */}
      {isScanning ? (
        <div className="app-card p-12 text-center space-y-3 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834]">
          <div className="w-10 h-10 rounded-full bg-[#E6F1ED] dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#18201D] dark:text-white">{t('match.scanning')}</h3>
          <p className="text-xs text-[#66706B] dark:text-[#94A39D] max-w-sm mx-auto">
            {t('match.scanningDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in">
          
          <div className="flex items-center justify-between text-start">
            <h2 className="text-sm sm:text-base font-bold text-[#18201D] dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-emerald-400" />
              <span>{t('match.resultsTitle')} ({matches.length})</span>
            </h2>
            <span className="text-xs text-[#66706B] dark:text-[#94A39D]">
              {t('match.sortedByScore')}
            </span>
          </div>

          {matches.length > 0 ? (
            <div className="space-y-3.5">
              {matches.map((match) => {
                const item = getLocalizedItem(match.matchedItem, language);
                const breakdown = match.breakdown;
                const rawLoc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
                const loc = rawLoc ? getLocalizedLocation(rawLoc, language) : undefined;
                const confidence = getConfidenceLabel(breakdown.totalScore);

                return (
                  <div
                    key={item.id}
                    className="app-card p-5 sm:p-6 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-4 text-start transition-colors duration-300"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      {/* Left Item Info */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-[#2D3E3A]">
                          <ItemVisual
                            category={item.category}
                            title={item.title}
                            imageUrl={item.imageUrl}
                            className="w-full h-full"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              {item.type === 'found' ? t('status.found') : t('status.lost')}
                            </span>
                            <span className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                              {formatAppDate(item.date, language)}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-[#18201D] dark:text-white truncate">{item.title}</h3>
                          <p className="text-xs text-[#66706B] dark:text-[#94A39D] line-clamp-1">{item.description}</p>

                          <div className="flex items-center gap-2 text-xs text-[#66706B] dark:text-[#94A39D]">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#176B5B] dark:text-emerald-400" />
                              {loc?.name}
                            </span>
                            <span>•</span>
                            <span>{t('item.color')}: {getLocalizedColorName(item.color, language)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Confidence Score */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-[#E4E7E4] dark:border-[#23332F] pt-3 sm:pt-0">
                        <div className="text-start sm:text-end">
                          <span className="text-2xl font-black text-[#176B5B] dark:text-emerald-400 block leading-none">
                            {breakdown.totalScore}%
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${confidence.color}`}>
                            {confidence.label}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Match Reasons Chips */}
                    <div className="pt-2 border-t border-[#E4E7E4] dark:border-[#23332F] flex flex-wrap gap-1.5">
                      {breakdown.matchReasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-[#F1F3F0] dark:bg-[#1C2B27] text-[#18201D] dark:text-white font-medium border border-transparent dark:border-[#2D3E3A]"
                        >
                          ✓ {reason}
                        </span>
                      ))}
                    </div>

                    {/* Explainable AI Breakdown */}
                    <ExplainableAiBreakdown breakdown={breakdown} language={language} />

                    {/* Action Button */}
                    <div className="pt-1">
                      {targetItem.type === 'lost' && item.type === 'found' ? (
                        <button
                          onClick={() => setSelectedClaimItemId(item.id)}
                          className="w-full py-2.5 px-4 min-h-[40px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{t('match.claimThis')}</span>
                        </button>
                      ) : (
                        <Link
                          href={`/items/${item.id}`}
                          className="w-full py-2 px-4 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white font-bold text-xs transition-all flex items-center justify-center gap-1 border border-transparent dark:border-[#2D3E3A]"
                        >
                          <span>{t('match.viewDetails')}</span>
                          {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </Link>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Empathetic Empty State */
            <div className="app-card p-12 text-center space-y-3 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#F1F3F0] dark:bg-[#1C2B27] flex items-center justify-center mx-auto text-[#66706B] dark:text-[#94A39D]">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-[#18201D] dark:text-white">
                  {t('match.emptyTitle')}
                </h3>
                <p className="text-xs text-[#66706B] dark:text-[#94A39D] leading-relaxed">
                  {t('match.emptyDesc')}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-block py-2.5 px-6 rounded-xl bg-[#18201D] dark:bg-[#1C2B27] text-white text-xs font-bold"
                >
                  {t('app.backHome')}
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
