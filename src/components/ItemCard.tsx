'use client';

import React from 'react';
import Link from 'next/link';
import { Item } from '@/types';
import { CATEGORIES, SCHOOL_LOCATIONS } from '@/lib/constants';
import { formatAppDate, getPublicReporterLabel } from '@/lib/utils';
import { getLocalizedItem, getLocalizedLocation } from '@/lib/i18n/seedDataTranslations';
import ItemVisual from '@/components/ItemVisual';
import UserAvatar from '@/components/UserAvatar';
import TrustBadge from '@/components/TrustBadge';
import { IntegrityService } from '@/services/integrityService';
import { useApp } from '@/context/AppContext';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  Lock, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ItemCardProps {
  item: Item;
  matchScore?: number;
  showMatchButton?: boolean;
  variant?: 'card' | 'row';
}

export default function ItemCard({ item: rawItem, matchScore, showMatchButton = false, variant = 'card' }: ItemCardProps) {
  const { dir, language, t } = useApp();
  const item = getLocalizedItem(rawItem, language);
  const categoryInfo = CATEGORIES.find((c) => c.id === item.category);
  const rawLoc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
  const locationInfo = rawLoc ? getLocalizedLocation(rawLoc, language) : undefined;

  const isLost = item.type === 'lost';
  const isReunited = item.status === 'reunited';
  const isRtl = dir === 'rtl';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  const rawCategoryLabel = language === 'en' ? (t('cat.' + item.category) || categoryInfo?.label) : categoryInfo?.label;
  const categoryLabel = rawCategoryLabel === 'إلكترونيات وأجهزة' ? 'إلكترونيات' : rawCategoryLabel;
  const locationName = language === 'en' ? (t('loc.' + item.locationId) || locationInfo?.name) : locationInfo?.name;

  // Status Pill Badge Component (shared between card and row)
  const statusBadge = (
    <div className="absolute top-2.5 end-2.5 flex items-center gap-1.5 z-10">
      {isReunited ? (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E0E7FF] dark:bg-indigo-950/80 text-[#3730A3] dark:text-indigo-300 border border-[#C7D2FE] dark:border-indigo-800 flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] dark:bg-indigo-400" />
          {t('status.reunited')}
        </span>
      ) : isLost ? (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] dark:bg-amber-950/80 text-[#92400E] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] dark:bg-amber-400 animate-pulse" />
          {t('status.lost')}
        </span>
      ) : (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#065F46] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-emerald-400" />
          {t('status.found')}
        </span>
      )}

      {!isLost && item.custody === 'at_office' && !isReunited && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#18201D]/80 dark:bg-[#263834]/90 text-white backdrop-blur-xs">
          {language === 'en' ? 'In Office' : 'في الأمانات'}
        </span>
      )}
    </div>
  );

  // Match Badge Component (shared)
  const matchBadge = matchScore !== undefined && (
    <div className="absolute top-2.5 start-2.5 z-10">
      <span className="px-2.5 py-1 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-[#18201D] text-[11px] font-bold flex items-center gap-1 shadow-sm">
        <Sparkles className="w-3 h-3 text-[#FDE68A] dark:text-[#18201D]" />
        <span>{matchScore}% {language === 'en' ? 'Match' : 'تطابق'}</span>
      </span>
    </div>
  );

  // Modern Fluid Row Layout (Apple-inspired horizontal row)
  if (variant === 'row') {
    return (
      <Link
        href={`/items/${item.id}`}
        className="app-card app-card-interactive w-full max-w-full min-w-0 overflow-hidden flex items-center justify-between gap-3.5 sm:gap-4 group block text-start bg-white dark:bg-[#15201D] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all rounded-3xl p-3 sm:p-3.5 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          {/* Visual Container - Clean & unblocked image */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 dark:bg-[#182421] flex items-center justify-center p-2 shrink-0 overflow-hidden">
            <ItemVisual
              category={item.category}
              title={item.title}
              imageUrl={item.imageUrl}
              className="w-full h-full object-contain max-h-14"
            />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[#66706B] dark:text-[#94A39D] mb-1 min-w-0 overflow-hidden">
              {/* 1. Status Badge First */}
              {isReunited ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0E7FF] dark:bg-indigo-950/80 text-[#3730A3] dark:text-indigo-300 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] dark:bg-indigo-400" />
                  {t('status.reunited')}
                </span>
              ) : isLost ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] dark:bg-amber-950/80 text-[#92400E] dark:text-amber-300 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] dark:bg-amber-400" />
                  {t('status.lost')}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#065F46] dark:text-emerald-300 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-emerald-400" />
                  {t('status.found')}
                </span>
              )}

              {/* 2. Category Label */}
              <span className="font-semibold text-[#176B5B] dark:text-[#2DD4BF] truncate shrink-0">{categoryLabel}</span>

              {/* 3. Separator */}
              <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>

              {/* 4. Date */}
              <span className="truncate">{formatAppDate(item.date || item.createdAt, language)}</span>
            </div>

            <h3 className="font-bold text-sm sm:text-base text-[#18201D] dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-colors line-clamp-1 truncate">
              {item.title}
            </h3>

            {/* Bottom line: location pin only */}
            <div className="flex items-center gap-1 text-xs text-[#66706B] dark:text-[#94A39D] mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#2DD4BF] shrink-0" />
              <span className="truncate">{locationName}</span>
            </div>
          </div>
        </div>

        {/* Action Icon */}
        <div className={`w-8 h-8 rounded-full bg-slate-50 dark:bg-[#1C2B27] flex items-center justify-center text-slate-400 group-hover:bg-[#176B5B] group-hover:text-white dark:group-hover:bg-[#2DD4BF] dark:group-hover:text-slate-950 transition-all shrink-0 ${
          isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
        }`}>
          <ArrowIcon className="w-4 h-4" />
        </div>
      </Link>
    );
  }

  // Modern Fluid Card Layout (Default)
  return (
    <Link
      href={`/items/${item.id}`}
      className="app-card app-card-interactive w-full max-w-full min-w-0 overflow-hidden flex flex-col justify-between group block text-start bg-white dark:bg-[#15201D] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all rounded-3xl p-4"
    >
      {/* Visual Area */}
      <div className="relative w-full overflow-hidden flex flex-col items-center justify-center mb-2 bg-slate-50/50 dark:bg-[#1A2623]/40 rounded-2xl py-2">
        <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-[#182421] rounded-2xl flex items-center justify-center p-2 shadow-2xs">
          <ItemVisual
            category={item.category}
            title={item.title}
            imageUrl={item.imageUrl}
            className="w-full h-full object-contain max-h-16"
          />
        </div>

        {statusBadge}
        {matchBadge}

        {/* Secret Question Indicator Pill on Image */}
        {!isLost && item.secretQuestion && !isReunited && (
          <div className="absolute bottom-2.5 start-2.5 z-10">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18201D]/85 dark:bg-[#141C1A]/90 text-amber-300 backdrop-blur-xs border border-amber-500/40 flex items-center gap-1 shadow-xs">
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span>{language === 'en' ? 'Secret Question' : 'سؤال سري'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
        <div>
          {/* Metadata: Category & Relative Date (h-4) */}
          <div className="h-4 flex items-center justify-between text-[11px] text-[#66706B] dark:text-[#94A39D] mb-1">
            <span className="font-semibold text-[#176B5B] dark:text-[#2DD4BF] truncate">
              {categoryLabel}
            </span>
            <span className="flex items-center gap-1 shrink-0 ms-2">
              <Clock className="w-3 h-3 text-[#66706B]/70 dark:text-[#94A39D]/70" />
              {formatAppDate(item.date || item.createdAt, language)}
            </span>
          </div>

          {/* Title (Strict h-5 sm:h-6 with line-clamp-1) */}
          <h3 className="h-5 sm:h-6 font-bold text-sm sm:text-base text-[#18201D] dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-colors line-clamp-1 truncate">
            {item.title}
          </h3>

          {/* Description (Strict h-8 sm:h-9 line-clamp-2) */}
          <p className="h-8 sm:h-9 text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5 line-clamp-2 leading-snug overflow-hidden">
            {item.description}
          </p>
        </div>

        {/* Location & Verification Indicator */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#263834] space-y-1.5">
          {/* Location row (h-5) */}
          <div className="h-5 flex items-center justify-between text-xs text-[#18201D] dark:text-[#F1F3F0]">
            <div className="flex items-center gap-1.5 font-medium truncate min-w-0 flex-1">
              <MapPin className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#2DD4BF] shrink-0" />
              <span className="truncate">{locationName}</span>
            </div>
            <span className="text-[11px] text-[#66706B] dark:text-[#94A39D] shrink-0 ms-2">{locationInfo?.floor}</span>
          </div>

          {/* Reporter & Action trigger (h-6) */}
          <div className="h-6 flex items-center justify-between pt-0.5 text-[11px] text-[#66706B] dark:text-[#94A39D] gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <UserAvatar
                size="xs"
                name={item.reportedBy?.name || (item.reportedBy?.role === 'admin' ? (language === 'en' ? 'Admin' : 'إدارة') : (language === 'en' ? 'Student' : 'طالب'))}
                role={item.reportedBy?.role}
                avatarUrl={item.reportedBy?.avatar}
              />
              <span className="truncate flex items-center gap-1 min-w-0">
                <span className="truncate">{getPublicReporterLabel(item.reportedBy?.role, isLost, item.custody, language)}</span>
                {item.reportedBy?.isTrusted && item.reportedBy?.role !== 'admin' && (
                  <TrustBadge
                    tier={IntegrityService.calculateTrustTier(item.reportedBy.goodwillPoints || 0)}
                    size="xs"
                    showLabel={false}
                  />
                )}
              </span>
            </div>
            <div className={`flex items-center gap-0.5 text-[#176B5B] dark:text-[#2DD4BF] font-semibold text-xs shrink-0 transition-transform ${
              isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
            }`}>
              <span>{language === 'en' ? 'Details' : 'التفاصيل'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
