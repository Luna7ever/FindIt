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
}

export default function ItemCard({ item: rawItem, matchScore, showMatchButton = false }: ItemCardProps) {
  const { dir, language, t } = useApp();
  const item = getLocalizedItem(rawItem, language);
  const categoryInfo = CATEGORIES.find((c) => c.id === item.category);
  const rawLoc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
  const locationInfo = rawLoc ? getLocalizedLocation(rawLoc, language) : undefined;

  const isLost = item.type === 'lost';
  const isReunited = item.status === 'reunited';
  const isRtl = dir === 'rtl';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  const categoryLabel = language === 'en' ? (t('cat.' + item.category) || categoryInfo?.label) : categoryInfo?.label;
  const locationName = language === 'en' ? (t('loc.' + item.locationId) || locationInfo?.name) : locationInfo?.name;

  return (
    <Link
      href={`/items/${item.id}`}
      className="app-card app-card-interactive w-full max-w-full min-w-0 overflow-hidden flex flex-col justify-between group block text-start bg-white dark:bg-[#15201D] border-[#E4E7E4] dark:border-[#263834] transition-all"
    >
      {/* Visual Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F1F3F0] dark:bg-[#1C2B27]">
        <ItemVisual
          category={item.category}
          title={item.title}
          imageUrl={item.imageUrl}
          className="w-full h-full"
        />

        {/* Status Pill Badge */}
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

        {/* Match Percentage Badge if available */}
        {matchScore !== undefined && (
          <div className="absolute top-2.5 start-2.5 z-10">
            <span className="px-2.5 py-1 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-[#18201D] text-[11px] font-bold flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-[#FDE68A] dark:text-[#18201D]" />
              <span>{matchScore}% {language === 'en' ? 'Match' : 'تطابق'}</span>
            </span>
          </div>
        )}

        {/* Secret Question Indicator Pill on Image (Level across all cards) */}
        {!isLost && item.secretQuestion && !isReunited && (
          <div className="absolute bottom-2.5 start-2.5 z-10">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18201D]/85 dark:bg-[#141C1A]/90 text-amber-300 backdrop-blur-xs border border-amber-500/40 flex items-center gap-1 shadow-xs">
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span>{language === 'en' ? 'Secret Question' : 'سؤال سري'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Section - Strict Uniform Geometry */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        
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

          {/* Description (Strict h-9 line-clamp-2) */}
          <p className="h-9 text-xs text-[#66706B] dark:text-[#94A39D] mt-1 line-clamp-2 leading-relaxed overflow-hidden">
            {item.description}
          </p>
        </div>

        {/* Location & Verification Indicator (Strict Uniform Lower Shelf) */}
        <div className="pt-2.5 border-t border-[#E4E7E4] dark:border-[#263834] space-y-2">
          
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
