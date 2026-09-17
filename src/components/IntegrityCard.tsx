'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { INTEGRITY_SCENARIOS } from '@/lib/constants';
import TrustBadge from '@/components/TrustBadge';
import { Award, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function IntegrityCard({ className = '' }: { className?: string }) {
  const { currentUser, currentUserTrustTier, integrityAttempts, isRtl, language, t } = useApp();

  const passedScenarioIds = new Set(
    integrityAttempts
      .filter((a) => a.studentId === currentUser.id && a.isPassed)
      .map((a) => a.scenarioId)
  );

  const passedCount = passedScenarioIds.size;
  const totalCount = INTEGRITY_SCENARIOS.length;
  const progressPercent = Math.round((passedCount / totalCount) * 100);

  return (
    <div
      className={`app-card relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-[#176B5B]/8 via-white to-amber-50/50 dark:from-[#176B5B]/20 dark:via-[#15201D] dark:to-amber-950/20 border border-[#176B5B]/20 dark:border-[#263834] ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left/Right Text Content */}
        <div className="space-y-2 max-w-xl text-start">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 flex items-center gap-1 shadow-2xs">
              <Award className="w-3 h-3" />
              {t('nav.integrity')}
            </span>
            <TrustBadge tier={currentUserTrustTier} size="sm" />
            <span className="text-xs font-semibold text-[#176B5B] dark:text-emerald-400">
              +{currentUser.goodwillPoints || 0} {t('app.goodwillPoints')}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#18201D] dark:text-white">
            {language === 'en' 
              ? 'Elevate your school rank with digital citizenship & integrity' 
              : 'عزز رتبتك المدرسية بالمواطنة الرقمية والأمانة'}
          </h3>

          <p className="text-xs text-[#66706B] dark:text-[#94A39D] leading-relaxed">
            {language === 'en'
              ? 'Complete interactive scenario challenges, earn official trust badges, and give your reports priority with school administration.'
              : 'شاهد سيناريوهات تفاعلية لمعضلات مدرسية واقعية، أجب على التحديات بوعي، واحصل على شارة موثوقية رسمية تعطي بلاغاتك أولوية لدى الإدارة.'}
          </p>

          {/* Progress Mini Bar */}
          <div className="pt-2 flex items-center gap-3">
            <div className="flex-1 max-w-[200px] h-2 bg-slate-100 dark:bg-[#1C2B27] rounded-full overflow-hidden border border-slate-200 dark:border-[#2D3E3A]">
              <div
                className="h-full bg-gradient-to-r from-[#176B5B] to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-[#176B5B] dark:text-emerald-400">
              {language === 'en' 
                ? `${passedCount} of ${totalCount} scenarios completed`
                : `${passedCount} من ${totalCount} سيناريوهات مكتملة`}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <Link
            href="/integrity"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs shadow-sm transition-transform active:scale-95 group cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 dark:text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>{language === 'en' ? 'Take Integrity Challenge' : 'خوض اختبارات النزاهة'}</span>
            {isRtl ? (
              <ChevronLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 group-hover:translate-x-[2px] transition-transform" />
            )}
          </Link>
        </div>

      </div>
    </div>
  );
}
