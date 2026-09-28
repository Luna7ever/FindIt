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

  const { timeGreeting, campusStatusText } = useMemo(() => {
    const isAr = language === 'ar';
    if (isAdmin) {
      return {
        timeGreeting: isAr ? 'أهلاً بك 🏛️' : 'Welcome 🏛️',
        campusStatusText: isAr ? 'منظومة إدارة المدرسة وحفظ الأمانات' : 'School Administration Portal',
      };
    }

    switch (campusPeriod) {
      case 'morning':
        return {
          timeGreeting: isAr ? 'صباح الخير ☀️' : 'Good morning ☀️',
          campusStatusText: isAr ? 'طاب يومك الدراسي بكل همة ونشاط 🎒' : 'Ready for an active day at school 🎒',
        };
      case 'recess':
        return {
          timeGreeting: isAr ? 'استراحة موفقة 🥪' : 'Recess time 🥪',
          campusStatusText: isAr ? 'فترة الفسحة المدرسية — تفقدي متعلقاتك وحقيبتك' : 'Recess break — keep track of your belongings',
        };
      case 'dismissal':
        return {
          timeGreeting: isAr ? 'دمتِ بخير 🏫' : 'Good afternoon 🏫',
          campusStatusText: isAr ? 'نهاية اليوم الدراسي — تأكدي من حقيبتك وكتبك 🎒' : 'Dismissal — check your bag and books 🎒',
        };
      case 'evening':
      default:
        return {
          timeGreeting: isAr ? 'مساء الخير 🌙' : 'Good evening 🌙',
          campusStatusText: isAr ? 'استراحة المساء والمراجعة الهادئة 🌙' : 'Evening review and quiet rest 🌙',
        };
    }
  }, [campusPeriod, language, isAdmin]);

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
    <div
      className="w-full max-w-full overflow-x-hidden px-4 sm:px-6 pt-1 pb-28 sm:pb-16 space-y-2.5 sm:space-y-3 max-w-5xl mx-auto text-[#18201D] dark:text-[#F1F5F3]"
      dir={dir}
    >
      {/* ========================================================
          1. BORDERLESS STATUS HEADER & GLOBAL GAMIFICATION BADGE
      ======================================================== */}
      <section className="w-full flex items-center justify-between gap-3 pt-0.5 select-none">
        {/* Start side: Borderless student greeting & atmospheric status */}
        <div className="min-w-0 text-start">
          <button
            onClick={openOnboardingModal}
            className="group flex items-center gap-1.5 text-sm sm:text-base font-black text-slate-900 dark:text-white hover:text-[#176B5B] dark:hover:text-[#2DD4BF] transition-colors cursor-pointer truncate"
            title={`${greetingText} - ${language === 'en' ? 'Edit student profile' : 'تعديل بيانات الطالب'}`}
          >
            <span className="sr-only">{greetingText}</span>
            <span className="truncate">
              {timeGreeting} {localizedUser.name ? `· ${localizedUser.name}` : ''}
            </span>
            <span className="text-xs opacity-75 group-hover:opacity-100 transition-opacity shrink-0">
              {currentUser.name ? '✏️' : '🎓'}
            </span>
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-tight mt-0.5 truncate">
            {campusStatusText}
          </p>
        </div>

        {/* End side: Global Frosted Gamification Badge (Duolingo / Apple Style) */}
        {!isAdmin && (
          <Link
            href="/integrity"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/40 shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-98 transition-all text-xs font-bold"
            title={tierBadgeInfo.title}
          >
            <span className="text-sm shrink-0">{tierBadgeInfo.emoji}</span>
            <span className="font-bold">{tierBadgeInfo.shortTitle}</span>
            <span className="text-amber-500/70 dark:text-amber-400/70 select-none">·</span>
            <span className="font-extrabold text-[#176B5B] dark:text-[#2DD4BF]">
              {currentUser.goodwillPoints || 0}{language === 'en' ? 'pts' : 'ن'}
            </span>
          </Link>
        )}

        {isAdmin && (
          <Link
            href="/admin"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 text-[#176B5B] dark:text-[#2DD4BF] border border-[#176B5B]/30 dark:border-[#263834] shadow-xs hover:shadow-sm transition-all text-xs font-bold"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Admin 🏛️' : 'الإدارة 🏛️'}</span>
          </Link>
        )}
      </section>

      {/* ========================================================
          2. BEHAVIORAL INTERVENTION: WEEKLY INTEGRITY CHALLENGE
      ======================================================== */}
      {!isAdmin && (
        <section>
          <div className={`relative overflow-hidden rounded-3xl p-3.5 sm:p-4 transition-all min-h-[52px] flex items-center justify-between gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ${
            isChallengeCompleted
              ? 'bg-emerald-50/80 dark:bg-[#112420]/80'
              : 'bg-gradient-to-l from-emerald-50/70 via-white to-white dark:from-emerald-950/30 dark:via-[#15201D] dark:to-[#15201D]'
          }`}>
            {!isChallengeCompleted ? (
              <>
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-2xl bg-white dark:bg-[#1C2B27] shadow-xs flex items-center justify-center text-lg shrink-0 select-none">
                    🎯
                  </div>
                  <div className="min-w-0 text-start">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:white leading-tight truncate">
                      {language === 'en' ? 'Weekly Integrity Challenge' : 'تحدي النزاهة الأسبوعي'}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 truncate">
                      {language === 'en' ? '5 quick dilemmas' : '5 مواقف سريعة'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/integrity"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 sm:px-5 py-2 rounded-2xl font-bold text-xs sm:text-sm bg-[#18201D] hover:bg-black text-white dark:bg-[#2DD4BF] dark:text-slate-950 dark:hover:bg-[#14B8A6] shadow-sm transition-all active:scale-95 group shrink-0"
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

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold shrink-0">
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
      <section className="space-y-2.5 sm:space-y-3">
        {/* Integrated Live Interactive Instant Search Bar */}
        <InstantSearchBar />

        {/* Two-Column Action Grid (Lost / Found side-by-side on mobile & desktop) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {/* Card 1: Lost Item (Right card in RTL) */}
          <Link
            href="/report?type=lost"
            className="app-card app-card-interactive p-4 sm:p-5 bg-white dark:bg-[#15201D] flex flex-col justify-between group text-start shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md rounded-3xl active:scale-98 transition-all min-h-[120px] sm:min-h-[135px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                <Search className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {language === 'en' ? 'Lost' : 'مفقود'}
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-sm sm:text-base font-extrabold text-[#18201D] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-tight truncate">
                {language === 'en' ? 'Lost something?' : 'فقدت شيئاً؟'}
              </h2>
              <div className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300 font-semibold mt-1">
                <span>{language === 'en' ? 'Report Lost' : 'تسجيل بلاغ'}</span>
                <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px]" />
              </div>
            </div>
          </Link>

          {/* Card 2: Found Item (Left card in RTL) */}
          <Link
            href="/report?type=found"
            className="app-card app-card-interactive p-4 sm:p-5 bg-white dark:bg-[#15201D] flex flex-col justify-between group text-start shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md rounded-3xl active:scale-98 transition-all min-h-[120px] sm:min-h-[135px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#2DD4BF] flex items-center justify-center shrink-0 shadow-2xs">
                <Handshake className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#2DD4BF]">
                {language === 'en' ? 'Found' : 'أمانة'}
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-sm sm:text-base font-extrabold text-[#18201D] dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-colors leading-tight truncate">
                {language === 'en' ? 'Found something?' : 'عثرت على أمانة؟'}
              </h2>
              <div className="flex items-center gap-1 text-xs text-[#176B5B] dark:text-[#2DD4BF] font-semibold mt-1">
                <span>{language === 'en' ? 'Record Found' : 'تسليم أمانة'}</span>
                <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px]" />
              </div>
            </div>
          </Link>
        </div>
      </section>

        {/* ========================================================
            AI MATCH SPOTLIGHT (When Match Exists)
        ======================================================== */}
        {malakLostCalc && matchingFoundCalc && currentUser.id === 'user_malak' && (
          <section className="bg-white dark:bg-[#15201D] p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
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
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 bg-slate-50 dark:bg-[#1C2B27] flex items-center justify-center p-1">
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
                className="w-full sm:w-auto min-h-[42px] px-5 py-2.5 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 text-xs font-bold transition-all shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
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
            className="w-full px-4 py-3.5 sm:p-5 rounded-3xl bg-white dark:bg-[#15201D] border border-[#176B5B]/30 dark:border-[#263834] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex items-center justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#176B5B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-start">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-colors truncate">
                    {language === 'en' ? 'School Citizenship & Volunteering' : 'الأنشطة المدرسية والتطوع'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2DD4BF] text-[10px] font-black shrink-0">
                    {language === 'en' ? '+50 pts' : '+50ن'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 tracking-tight leading-tight mt-0.5">
                  {language === 'en'
                    ? 'Field volunteering tasks and campus initiatives to foster school community'
                    : 'مهام ومبادرات ميدانية لتعزيز ثقافة الأمانة وخدمة الحرم المدرسي'}
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#1C2B27] flex items-center justify-center text-slate-400 group-hover:bg-[#176B5B] group-hover:text-white dark:group-hover:bg-[#2DD4BF] dark:group-hover:text-slate-950 transition-all shrink-0">
              <ArrowIcon className="w-4 h-4" />
            </div>
          </Link>
        </section>

      {/* ========================================================
          5. RECENT FOUND ITEMS FEED (Spacious & Comfortable)
      ======================================================== */}
      <section className="space-y-3 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/40">
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
            <ItemCard key={item.id} item={item} variant="row" />
          ))}
        </div>
      </section>

    </div>
  );
}
