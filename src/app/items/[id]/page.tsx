'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SCHOOL_LOCATIONS, CATEGORIES } from '@/lib/constants';
import { formatAppDate, getPublicReporterLabel } from '@/lib/utils';
import { getLocalizedItem, getLocalizedLocation, getLocalizedColorName } from '@/lib/i18n/seedDataTranslations';
import ClaimModal from '@/components/ClaimModal';
import ItemVisual from '@/components/ItemVisual';
import UserAvatar from '@/components/UserAvatar';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  Share2
} from 'lucide-react';

export default function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getItemById, currentUser, dir, isRtl, language, t } = useApp();
  const [showClaimModal, setShowClaimModal] = useState(false);

  const rawItem = getItemById(resolvedParams.id);
  const item = rawItem ? getLocalizedItem(rawItem, language) : null;

  if (!item) {
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

  const categoryInfo = CATEGORIES.find((c) => c.id === item.category);
  const rawLoc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
  const locationInfo = rawLoc ? getLocalizedLocation(rawLoc, language) : undefined;

  const isLost = item.type === 'lost';
  const isReunited = item.status === 'reunited';
  const isMyReport = item.reportedBy?.id === currentUser.id;

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto space-y-6" dir={dir}>
      
      {/* Top Bar */}
      <div className="flex items-center justify-between text-start">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('item.backToExplore')}</span>
        </Link>

        <Link
          href={`/match/${item.id}`}
          className="py-1.5 px-3.5 rounded-xl bg-[#E6F1ED] dark:bg-[#176B5B]/20 hover:bg-[#D5EAE2] dark:hover:bg-[#176B5B]/30 text-[#176B5B] dark:text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-transparent dark:border-[#176B5B]/40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('item.smartMatch')}</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Item Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="app-card overflow-hidden bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] transition-colors duration-300">
            
            {/* Visual Header */}
            <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-[#E4E7E4] dark:border-[#23332F]">
              <ItemVisual
                category={item.category}
                title={item.title}
                imageUrl={item.imageUrl}
                className="w-full h-full"
              />

              {/* Badges */}
              <div className="absolute top-4 start-4 flex items-center gap-2 z-10">
                {isReunited ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E0E7FF] dark:bg-indigo-950/80 text-[#3730A3] dark:text-indigo-300 border border-[#C7D2FE] dark:border-indigo-800 flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('status.reunitedBadge')}
                  </span>
                ) : isLost ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] dark:bg-amber-950/80 text-[#92400E] dark:text-amber-200 border border-[#FDE68A] dark:border-amber-800 flex items-center gap-1 shadow-xs">
                    {t('status.lostBadge')}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#065F46] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800 flex items-center gap-1 shadow-xs">
                    {t('status.foundBadge')}
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-5 text-start">
              
              <div className="flex items-center justify-between text-xs text-[#66706B] dark:text-[#94A39D]">
                <span className="px-3 py-1 rounded-lg bg-[#F1F3F0] dark:bg-[#1C2B27] text-[#18201D] dark:text-white font-bold border border-transparent dark:border-[#2D3E3A]">
                  {t('cat.' + item.category) || categoryInfo?.label}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatAppDate(item.date || item.createdAt, language)}
                </span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-3xl font-extrabold text-[#18201D] dark:text-white">{item.title}</h1>
                <p className="text-xs sm:text-sm text-[#66706B] dark:text-[#94A39D] leading-relaxed">{item.description}</p>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] border border-transparent dark:border-[#2D3E3A]">
                  <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] block">{t('item.color')}</span>
                  <span className="text-xs font-bold text-[#18201D] dark:text-white">{getLocalizedColorName(item.color, language)}</span>
                </div>
                {item.brand && (
                  <div className="p-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] border border-transparent dark:border-[#2D3E3A]">
                    <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] block">{t('item.brand')}</span>
                    <span className="text-xs font-bold text-[#18201D] dark:text-white">{item.brand}</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] border border-transparent dark:border-[#2D3E3A]">
                  <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] block">{t('item.custody')}</span>
                  <span className="text-xs font-bold text-[#18201D] dark:text-white">
                    {item.custody === 'at_office' ? t('item.custodyOffice') : t('item.custodyFinder')}
                  </span>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-4 rounded-2xl bg-[#F1F3F0] dark:bg-[#1C2B27] space-y-1 text-xs text-[#18201D] dark:text-white border border-transparent dark:border-[#2D3E3A]">
                <div className="flex items-center gap-1.5 font-bold text-[#176B5B] dark:text-emerald-400">
                  <MapPin className="w-4 h-4" />
                  <span>{t('item.locationTitle')}</span>
                </div>
                <p className="font-bold text-[#18201D] dark:text-white">{locationInfo?.name}</p>
                <p className="text-[#66706B] dark:text-[#94A39D]">{locationInfo?.building} • {locationInfo?.floor}</p>
                {item.locationDetails && (
                  <p className="text-[#18201D] dark:text-slate-200 pt-1 font-medium">
                    {t('item.locationNote')} «{item.locationDetails}»
                  </p>
                )}
              </div>

              {/* Secret Question Indicator */}
              {!isLost && item.secretQuestion && !isReunited && (
                <div className="p-4 rounded-2xl bg-[#FEF3C7]/70 dark:bg-amber-950/40 border border-[#FDE68A] dark:border-amber-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#92400E] dark:text-amber-200">
                    <Lock className="w-4 h-4 text-[#D97706] dark:text-amber-400" />
                    <span>{t('item.secretQuestionReq')}</span>
                  </div>
                  <p className="text-[#18201D] dark:text-amber-100 font-medium leading-relaxed">
                    «{item.secretQuestion}»
                  </p>
                  <p className="text-[10px] text-[#66706B] dark:text-amber-200/80">
                    {t('item.secretQuestionHelp')}
                  </p>
                </div>
              )}

              {/* Primary Claim Action */}
              {!isLost && !isReunited && !isMyReport && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="w-full py-3.5 px-6 min-h-[44px] rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{t('item.claimBtn')}</span>
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Col: Reporter & Safety */}
        <div className="space-y-6">
          
          {/* Reporter Card */}
          <div className="app-card p-5 space-y-3.5 text-start bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] transition-colors duration-300">
            <span className="text-[10px] font-bold text-[#66706B] dark:text-[#94A39D] uppercase tracking-wider block">
              {t('item.reporterSection')}
            </span>

            <div className="flex items-center gap-3">
              <UserAvatar
                size="lg"
                name={isMyReport || currentUser.role === 'admin' ? item.reportedBy?.name : (item.reportedBy?.role === 'admin' ? 'إدارة المدرسة' : 'طالب')}
                role={item.reportedBy?.role}
                avatarUrl={item.reportedBy?.avatar}
                showBadge={item.reportedBy?.role === 'admin'}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-xs sm:text-sm text-[#18201D] dark:text-white truncate">
                    {isMyReport || currentUser.role === 'admin'
                      ? item.reportedBy?.name
                      : getPublicReporterLabel(item.reportedBy?.role, isLost, item.custody, language)}
                  </h4>
                  {item.reportedBy?.isTrusted && (
                    <span title="موثوق">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#66706B] dark:text-[#94A39D] truncate">
                  {isMyReport || currentUser.role === 'admin' 
                    ? item.reportedBy?.grade 
                    : (item.reportedBy?.role === 'admin' ? 'إدارة المدرسة والأمانات' : 'عضو في المدرسة')}
                </p>
                <span className="text-[10px] text-[#059669] dark:text-emerald-400 font-bold block mt-0.5">
                  ⭐ {item.reportedBy?.returnedCount || 0} {t('item.returnedItemsCount')}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E7E4] dark:border-[#23332F] text-[11px] text-[#66706B] dark:text-[#94A39D] leading-relaxed">
              {t('item.privacyNotice')}
            </div>
          </div>

          {/* Handover Guidelines */}
          <div className="app-card p-5 space-y-2.5 text-start bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#176B5B] dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('item.handoverGuideTitle')}</span>
            </div>
            <ul className="text-xs text-[#66706B] dark:text-[#94A39D] space-y-1.5 list-disc list-inside leading-relaxed">
              <li>{t('item.guide1')}</li>
              <li>{t('item.guide2')}</li>
              <li>{t('item.guide3')}</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          itemId={item.id}
          isOpen={true}
          onClose={() => setShowClaimModal(false)}
        />
      )}

    </div>
  );
}
