'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { canAccessAdmin } from '@/lib/auth/permissions';
import ItemCard from '@/components/ItemCard';
import ItemVisual from '@/components/ItemVisual';
import InstantSearchBar from '@/components/InstantSearchBar';
import { getLocalizedItem, getLocalizedUser } from '@/lib/i18n/seedDataTranslations';
import { getCampusPeriod, getCampusGreeting, CampusPeriod } from '@/lib/campusSchedule';
import { 
  Search, 
  PlusCircle, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Lock, 
  Handshake 
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { 
    items, 
    claims, 
    currentUser, 
    currentUserTrustTier,
    activeWeeklyChallenge,
    isWeekChallengeCompleted,
    openOnboardingModal,
    dir, 
    language, 
    t 
  } = useApp();

  const isAdmin = canAccessAdmin(currentUser);
  const isRtl = dir === 'rtl';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Hydration-safe campus atmosphere schedule state (deterministic morning SSR fallback)
  const [campusPeriod, setCampusPeriod] = useState<CampusPeriod>('morning');
  const [, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCampusPeriod(getCampusPeriod(new Date()));
    const timer = setInterval(() => {
      setCampusPeriod(getCampusPeriod(new Date()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const localizedUser = useMemo(() => {
    return getLocalizedUser(currentUser, language);
  }, [currentUser, language]);

  const greetingText = useMemo(() => {
    return getCampusGreeting(
      { name: localizedUser.name, role: currentUser.role },
      campusPeriod,
      language,
      isAdmin
    );
  }, [localizedUser.name, currentUser.role, campusPeriod, language, isAdmin]);

  const tierBadgeInfo = useMemo(() => {
    switch (currentUserTrustTier) {
      case 'gold':
        return {
          emoji: '🥇',
          title: language === 'en' ? 'Gold Integrity Ambassador' : 'سفير نزاهة ذهبي',
          shortTitle: language === 'en' ? 'Gold Ambassador' : 'سفير ذهبي',
        };
      case 'silver':
        return {
          emoji: '🥈',
          title: language === 'en' ? 'Silver Integrity Ambassador' : 'سفير نزاهة فضي',
          shortTitle: language === 'en' ? 'Silver Ambassador' : 'سفير فضي',
        };
      case 'bronze':
      default:
        return {
          emoji: '🥉',
          title: language === 'en' ? 'Bronze Integrity Ambassador' : 'سفير نزاهة برونزي',
          shortTitle: language === 'en' ? 'Bronze Ambassador' : 'سفير برونزي',
        };
    }
  }, [currentUserTrustTier, language]);

  const activeChallengeId = activeWeeklyChallenge?.week_id || 'week_1';
  const isChallengeCompleted = isWeekChallengeCompleted(activeChallengeId);

  // Recent Found Items (Top 4 latest items)
  const recentFoundItems = useMemo(() => {
    return items
      .filter((i) => i.type === 'found' && i.status !== 'reunited')
      .slice(0, 4);
  }, [items]);

  // Malak's Calculator for High-Match Spotlight
  const malakLostCalc = useMemo(() => {
    return items.find((i) => i.id === 'item_malak_lost_calc');
  }, [items]);

  const matchingFoundCalc = useMemo(() => {
    return items.find((i) => i.id === 'item_found_calc_lab');
  }, [items]);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 sm:px-6 pt-3 pb-32 sm:pb-16 space-y-4 sm:space-y-6 max-w-5xl mx-auto text-[#18201D] dark:text-[#F1F5F3]" dir={dir}>
      

      {/* ========================================================
          1. COMPACT WELCOME CAPSULE HEADER
      ======================================================== */}
      <section className="text-start pt-0 w-full max-w-full min-w-0 overflow-hidden">
        {/* Merged Single Compact Welcome & Student Badge */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#E6F1ED] dark:bg-[#122823] text-xs font-bold border border-[#176B5B]/30 dark:border-[#263834] shadow-2xs">
          <button
            onClick={openOnboardingModal}
            className="inline-flex items-center gap-1.5 text-[#176B5B] dark:text-[#2DD4BF] hover:underline cursor-pointer truncate min-w-0"
            title={language === 'en' ? 'Edit student profile' : 'تعديل بيانات الطالب'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] animate-pulse shrink-0" />
            <span className="truncate">{greetingText}</span>
            <span className="text-[11px] opacity-75 shrink-0">{currentUser.name ? '✏️' : '🎓'}</span>
          </button>

          {!isAdmin && (
            <div className="inline-flex items-center gap-1.5 shrink-0">
              <span className="text-slate-300 dark:text-slate-600 select-none">|</span>
              <Link
                href="/integrity"
                className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-[#176B5B] dark:hover:text-[#2DD4BF] transition-colors truncate"
                title={tierBadgeInfo.title}
              >
                <span>{tierBadgeInfo.emoji}</span>
                <span className="font-semibold">{tierBadgeInfo.shortTitle}</span>
                <span className="text-[#176B5B] dark:text-[#2DD4BF] font-extrabold text-[11px]">
                  ({currentUser.goodwillPoints || 0}{language === 'en' ? 'pts' : 'ن'})
                </span>
              </Link>
            </div>
          )}

          {isAdmin && (
            <div className="inline-flex items-center gap-1.5 shrink-0">
              <span className="text-slate-300 dark:text-slate-600 select-none">|</span>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 text-[#176B5B] dark:text-[#2DD4BF] hover:underline"
              >
                <Building2 className="w-3 h-3" />
                <span>{language === 'en' ? 'Admin 🏛️' : 'الإدارة 🏛️'}</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          2. BEHAVIORAL INTERVENTION: WEEKLY INTEGRITY CHALLENGE
      ======================================================== */}
      {!isAdmin && (
        <section>
          <div className={`relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3 sm:p-3.5 transition-all min-h-[50px] flex items-center justify-between gap-2.5 ${
            isChallengeCompleted
              ? 'bg-emerald-50/80 dark:bg-[#112420]/80 border-emerald-200/80 dark:border-emerald-800/60 shadow-sm'
              : 'bg-white dark:bg-[#15201D] shadow-sm'
          }`}>
            {!isChallengeCompleted ? (
              <>
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-base shrink-0 select-none">
                    🎯
                  </div>
                  <div className="min-w-0 text-start">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                      {language === 'en' ? 'Weekly Integrity Challenge' : 'تحدي النزاهة الأسبوعي'}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5 truncate">
                      {language === 'en' ? '5 quick dilemmas' : '5 مواقف سريعة'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/integrity"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-[#176B5B] hover:bg-[#125648] text-white shadow-2xs transition-all active:scale-95 group shrink-0"
                >
                  <span>{language === 'en' ? 'Start Challenge' : 'ابدأ التحدي'}</span>
                  <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px]" />
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">✅</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 truncate">
                    {language === 'en' ? 'You completed this week\'s challenge successfully' : 'أتممت مشاركة الأسبوع بنجاح'}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold shrink-0">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'en' ? 'Sunday' : 'الأحد القادم'}</span>
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          3. LOST & FOUND HUB (Search Bar + Dual Action Cards)
      ======================================================== */}
      <section className="space-y-3 sm:space-y-4">
        {/* Integrated Live Interactive Instant Search Bar */}
        <InstantSearchBar />

        {/* Two-Column Action Grid (Lost / Found side-by-side on mobile & desktop) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {/* Card 1: Lost Item (Right card in RTL) */}
          <Link
            href="/report?type=lost"
            className="app-card app-card-interactive p-4 sm:p-5 border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15201D] flex flex-col justify-between space-y-3 group text-start shadow-xs rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center shrink-0">
                <Search className="w-4 h-4" />
              </div>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                {language === 'en' ? 'Lost' : 'مفقود'}
              </span>
            </div>

            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-tight truncate">
                {language === 'en' ? 'Lost something?' : 'فقدت شيئاً؟'}
              </h2>
            </div>

            <div className="inline-flex items-center justify-center gap-1.5 w-full min-h-[44px] py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60 text-xs sm:text-sm font-bold transition-all shadow-2xs active:scale-98">
              <span>{language === 'en' ? 'Report Lost' : 'تسجيل مفقود'}</span>
              <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px]" />
            </div>
          </Link>

          {/* Card 2: Found Item (Left card in RTL) */}
          <Link
            href="/report?type=found"
            className="app-card app-card-interactive p-4 sm:p-5 border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15201D] flex flex-col justify-between space-y-3 group text-start shadow-xs rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                <Handshake className="w-4 h-4" />
              </div>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                {language === 'en' ? 'Custody' : 'أمانة'}
              </span>
            </div>

            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight truncate">
                {language === 'en' ? 'Found custody?' : 'عثرت على أمانة؟'}
              </h2>
            </div>

            <div className="inline-flex items-center justify-center gap-1.5 w-full min-h-[44px] py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60 text-xs sm:text-sm font-bold transition-all shadow-2xs active:scale-98">
              <span>{language === 'en' ? 'Handover' : 'تسليم أمانة'}</span>
              <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px]" />
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================
          AI MATCH SPOTLIGHT (When Match Exists)
      ======================================================== */}
      {malakLostCalc && matchingFoundCalc && currentUser.id === 'user_malak' && (
        <section className="bg-white dark:bg-[#15201D] p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] animate-ping" />
              <span className="text-xs font-black text-[#176B5B] dark:text-[#2DD4BF] uppercase tracking-wider">
                {language === 'en' ? '✨ Instant AI Match Found!' : '✨ تطابق ذكي مكتشف لبلاغك!'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 text-xs font-bold">
              88% {language === 'en' ? 'Match' : 'تطابق'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-slate-50 dark:bg-[#1C2B27] border border-slate-100 dark:border-slate-800/80 flex items-center justify-center p-1">
                <ItemVisual
                  category={matchingFoundCalc.category}
                  title={matchingFoundCalc.title}
                  imageUrl={matchingFoundCalc.imageUrl}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-start min-w-0">
                <h3 className="font-extrabold text-xs sm:text-base text-[#18201D] dark:text-white truncate">
                  {getLocalizedItem(matchingFoundCalc, language).title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5 truncate">
                  {language === 'en' ? 'Found in Science Lab - matches your lost calculator specs' : 'عُثر عليها في معمل العلوم - تطابق مواصفات حاسبتك المفقودة'}
                </p>
              </div>
            </div>

            <Link
              href={`/match/${malakLostCalc.id}`}
              className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 text-xs font-bold transition-colors shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
            >
              {language === 'en' ? 'Review Match & Claim' : 'معاينة المطابقة واسترداد الغرض'}
            </Link>
          </div>
        </section>
      )}

      {/* ========================================================
          4. SCHOOL CITIZENSHIP & VOLUNTEERING (Full-width sleek card)
      ======================================================== */}
      <section>
        <Link
          href="/activities"
          className="w-full p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#15201D] border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-[#2DD4BF]/40 transition-all flex items-center justify-between gap-3 shadow-xs group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#176B5B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-start">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-colors truncate">
                  {language === 'en' ? 'School Citizenship & Volunteering' : 'الأنشطة المدرسية والتطوع'}
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2DD4BF] text-[9px] font-black shrink-0 border border-emerald-200/50 dark:border-emerald-800/40">
                  {language === 'en' ? '+50 pts' : '+50ن'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {language === 'en'
                  ? 'Field volunteering tasks and campus initiatives to foster school community'
                  : 'مهام ومبادرات ميدانية لتعزيز ثقافة الأمانة وخدمة الحرم المدرسي'}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#176B5B] dark:text-[#2DD4BF] group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px] transition-transform shrink-0">
            <span className="hidden sm:inline">{language === 'en' ? 'Explore Tasks' : 'استعراض المهام'}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </div>
        </Link>
      </section>

      {/* ========================================================
          5. RECENT FOUND ITEMS FEED (Spacious & Comfortable)
      ======================================================== */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#18201D] dark:text-white">
              {language === 'en' ? 'Recently Found Belongings' : 'أحدث المعثورات المدرسية'}
            </h2>
            <p className="text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5">
              {language === 'en' ? 'Items found across school premises waiting for owners' : 'أغراض تم تسليمها وتوثيقها بانتظار أصحابها'}
            </p>
          </div>
          <Link href="/explore" className="text-xs font-bold text-[#176B5B] dark:text-[#2DD4BF] hover:underline flex items-center gap-1 group">
            <span>{language === 'en' ? 'View All' : 'استعراض الكل'}</span>
            <ArrowIcon className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentFoundItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

    </div>
  );
}
