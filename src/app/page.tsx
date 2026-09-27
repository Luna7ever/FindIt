'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { CATEGORIES } from '@/lib/constants';
import ItemCard from '@/components/ItemCard';
import ItemVisual from '@/components/ItemVisual';
import InstantSearchBar from '@/components/InstantSearchBar';
import { getLocalizedItem, getLocalizedUser, CATEGORY_DESCRIPTIONS_EN } from '@/lib/i18n/seedDataTranslations';
import { getCampusPeriod, getCampusGreeting, CampusPeriod } from '@/lib/campusSchedule';
import { 
  Search, 
  PlusCircle, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Laptop,
  PenTool,
  BookOpen,
  Shirt,
  CreditCard,
  Trophy,
  FolderOpen,
  KeyRound,
  ShieldCheck,
  Building2,
  FileCheck,
  CupSoda,
  Cpu,
  ShoppingBag,
  GraduationCap,
  Lock,
  Handshake
} from 'lucide-react';

const categoryIconMap: Record<string, React.ReactNode> = {
  electronics: <Laptop className="w-4 h-4" />,
  stationery: <PenTool className="w-4 h-4" />,
  books: <BookOpen className="w-4 h-4" />,
  clothing: <Shirt className="w-4 h-4" />,
  wallets_cards: <CreditCard className="w-4 h-4" />,
  sports: <Trophy className="w-4 h-4" />,
  bottles: <CupSoda className="w-4 h-4" />,
  keys: <KeyRound className="w-4 h-4" />,
  bags: <ShoppingBag className="w-4 h-4" />,
  personal: <FolderOpen className="w-4 h-4" />,
};

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

  // Recent Items
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
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-6 py-2 sm:py-5 space-y-2 sm:space-y-4 max-w-5xl mx-auto text-[#18201D] dark:text-[#F1F5F3]" dir={dir}>
      

      {/* ========================================================
          1. PERSONALIZED HERO GREETING & SEARCH BAR
      ======================================================== */}
      <section className="space-y-1.5 sm:space-y-2.5 text-start pt-0 w-full max-w-full min-w-0 overflow-hidden">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
            {/* Merged Single Compact Welcome & Student Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#E6F1ED] dark:bg-[#122823] text-xs font-bold border border-[#176B5B]/30 dark:border-[#263834] shadow-2xs max-w-full">
              <button
                onClick={openOnboardingModal}
                className="inline-flex items-center gap-1 text-[#176B5B] dark:text-[#2DD4BF] hover:underline cursor-pointer truncate"
                title={language === 'en' ? 'Edit student profile' : 'تعديل بيانات الطالب'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] animate-pulse shrink-0" />
                <span className="truncate">{greetingText}</span>
                <span className="text-[11px] opacity-75">{currentUser.name ? '✏️' : '🎓'}</span>
              </button>

              {!isAdmin && (
                <>
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
                </>
              )}

              {isAdmin && (
                <>
                  <span className="text-slate-300 dark:text-slate-600 select-none">|</span>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 text-[#176B5B] dark:text-[#2DD4BF] hover:underline"
                  >
                    <Building2 className="w-3 h-3" />
                    <span>{language === 'en' ? 'Admin 🏛️' : 'الإدارة 🏛️'}</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quiet System Status Indicator */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#66706B] dark:text-[#94A39D] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'en' ? 'Custody System Active' : 'منظومة الأمانات متاحة'}</span>
            </div>
          </div>
          
          <div>
            <h1 className="text-sm sm:text-lg lg:text-xl font-bold sm:font-extrabold text-[#18201D] dark:text-white ltr:tracking-tight leading-tight">
              {language === 'en' ? 'Lost something? ' : 'ضاع منك شيء؟ '}
              <span className="text-[#176B5B] dark:text-[#2DD4BF]">
                {language === 'en' ? 'We are here to help.' : 'خلّينا نساعدك تلاقيه.'}
              </span>
            </h1>
          </div>
        </div>

        {/* Integrated Live Interactive Instant Search Bar */}
        <InstantSearchBar />
      </section>

      {/* ========================================================
          2. DUAL ACTION HERO CARDS (فقدت شيئاً؟ / عثرت على أمانة؟)
      ======================================================== */}
      <section className="space-y-2 sm:space-y-2.5">

        {/* Weekly Integrity Behavioral Challenge - Compact Mobile Banner (ISEF BEHA) */}
        {!isAdmin && (
          <div className={`relative overflow-hidden rounded-xl border px-3 sm:px-4 py-1.5 sm:py-2 transition-all min-h-[52px] sm:min-h-[58px] max-h-[65px] flex items-center justify-between gap-2.5 ${
            isChallengeCompleted
              ? 'bg-emerald-50/80 dark:bg-[#112420]/80 border-emerald-200/80 dark:border-emerald-800/60'
              : 'bg-gradient-to-r from-[#E6F4F1] via-white to-[#EEFAF6] dark:from-[#122723] dark:via-[#162B26] dark:to-[#0F1E1B] border-emerald-500/30 dark:border-emerald-600/40 shadow-2xs'
          }`}>
            {!isChallengeCompleted ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-sm sm:text-base shrink-0 select-none">
                    🎯
                  </div>
                  <div className="min-w-0 text-start">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                      {language === 'en' ? 'Weekly Integrity Challenge' : 'تحدي النزاهة الأسبوعي'}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5 truncate">
                      {language === 'en' ? '5 quick dilemmas' : '5 مواقف سريعة'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/integrity"
                  className="inline-flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 rounded-lg font-bold text-xs bg-[#176B5B] hover:bg-[#125648] text-white shadow-2xs transition-all active:scale-95 group shrink-0"
                >
                  <span>{language === 'en' ? 'Start' : 'ابدأ'}</span>
                  <ArrowIcon className="w-3 h-3 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px]" />
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

                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold shrink-0">
                  <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'en' ? 'Sunday' : 'الأحد القادم'}</span>
                </span>
              </>
            )}
          </div>
        )}

        {/* Two-Column Action Grid (Lost / Found side-by-side on mobile & desktop) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {/* Card 1: Lost Item (Right card in RTL) */}
          <Link
            href="/report?type=lost"
            className="app-card app-card-interactive p-2.5 sm:p-3.5 border-r-4 rtl:border-r-4 ltr:border-l-4 border-r-[#D97706] ltr:border-l-[#D97706] bg-white dark:bg-[#15201D] flex flex-col justify-between space-y-2 group text-start shadow-xs rounded-xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400">
                <Search className="w-4 h-4" />
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FEF3C7] dark:bg-amber-950/60 text-[#92400E] dark:text-amber-300">
                {language === 'en' ? 'Lost' : 'مفقود'}
              </span>
            </div>

            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white group-hover:text-[#D97706] transition-colors leading-tight truncate">
                {language === 'en' ? 'Lost something?' : 'فقدت شيئاً؟'}
              </h2>
            </div>

            <div className="inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded-lg bg-[#D97706] hover:bg-[#b45309] text-white text-[10px] sm:text-xs font-bold transition-all shadow-2xs active:scale-98">
              <span>{language === 'en' ? 'Report Lost' : 'تسجيل مفقود'}</span>
              <ArrowIcon className="w-3 h-3 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px]" />
            </div>
          </Link>

          {/* Card 2: Found Item (Left card in RTL) */}
          <Link
            href="/report?type=found"
            className="app-card app-card-interactive p-2.5 sm:p-3.5 border-r-4 rtl:border-r-4 ltr:border-l-4 border-r-[#059669] ltr:border-l-[#059669] bg-white dark:bg-[#15201D] flex flex-col justify-between space-y-2 group text-start shadow-xs rounded-xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#D1FAE5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400">
                <Handshake className="w-4 h-4" />
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D1FAE5] dark:bg-emerald-950/60 text-[#065F46] dark:text-emerald-300">
                {language === 'en' ? 'Custody' : 'أمانة'}
              </span>
            </div>

            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white group-hover:text-[#059669] transition-colors leading-tight truncate">
                {language === 'en' ? 'Found custody?' : 'عثرت على أمانة؟'}
              </h2>
            </div>

            <div className="inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-[10px] sm:text-xs font-bold transition-all shadow-2xs active:scale-98">
              <span>{language === 'en' ? 'Handover' : 'تسليم أمانة'}</span>
              <ArrowIcon className="w-3 h-3 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px]" />
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================
          3. HIGH-MATCH SPOTLIGHT CARD (When Match Exists)
      ======================================================== */}
      {malakLostCalc && matchingFoundCalc && currentUser.id === 'user_malak' && (
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white dark:from-[#122823] dark:via-[#16352E] dark:to-[#15201D] p-4 sm:p-6 rounded-3xl border border-emerald-300/50 dark:border-[#263834] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] animate-ping" />
              <span className="text-xs font-black text-[#176B5B] dark:text-[#2DD4BF] uppercase tracking-wider">
                {language === 'en' ? '✨ Instant AI Match Found!' : '✨ تطابق ذكي مكتشف لبلاغك!'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 text-xs font-bold">
              88% {language === 'en' ? 'Match' : 'تطابق'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-white dark:bg-[#1C2B27] border border-[#E4E7E4] dark:border-[#263834]">
                <ItemVisual
                  category={matchingFoundCalc.category}
                  title={matchingFoundCalc.title}
                  imageUrl={matchingFoundCalc.imageUrl}
                  className="w-full h-full"
                />
              </div>
              <div className="text-start min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base text-[#18201D] dark:text-white truncate">
                  {getLocalizedItem(matchingFoundCalc, language).title}
                </h3>
                <p className="text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5 truncate">
                  {language === 'en' ? 'Found in Science Lab - matches your lost calculator specs' : 'عُثر عليها في معمل العلوم - تطابق مواصفات حاسبتك المفقودة'}
                </p>
              </div>
            </div>

            <Link
              href={`/match/${malakLostCalc.id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 text-xs font-bold transition-colors shadow-sm text-center cursor-pointer"
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
          className="w-full p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/60 dark:from-[#112420] dark:via-[#142320] dark:to-[#0F1E1B] border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-500/60 dark:hover:border-[#2DD4BF]/60 transition-all flex items-center justify-between gap-3 shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#176B5B] to-emerald-600 dark:from-[#2DD4BF] dark:to-emerald-500 text-white dark:text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="min-w-0 text-start">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-colors truncate">
                  {language === 'en' ? 'School Citizenship & Volunteering' : 'الأنشطة المدرسية والتطوع'}
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2DD4BF] text-[9px] font-black shrink-0">
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
          5. CATEGORIES BROWSER (Decluttered Unified Surface)
      ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-[#18201D] dark:text-white">
            {language === 'en' ? 'Explore by Category' : 'تصفح حسب التصنيف'}
          </h2>
          <Link href="/explore" className="text-xs font-bold text-[#176B5B] dark:text-[#2DD4BF] hover:underline flex items-center gap-1 group">
            <span>{language === 'en' ? 'View All' : 'عرض الكل'}</span>
            <ArrowIcon className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
          </Link>
        </div>

        <div className="p-2.5 sm:p-3.5 rounded-3xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2.5 sm:gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/explore?category=${cat.id}`}
                className="p-2 sm:p-2.5 rounded-2xl bg-[#F7F7F4]/80 dark:bg-[#1C2B27]/50 hover:bg-[#E6F1ED] dark:hover:bg-[#1C2B27] transition-all flex items-center gap-2 group text-start min-w-0"
              >
                <div className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-[#15201D] text-[#176B5B] dark:text-[#2DD4BF] group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                  {categoryIconMap[cat.id] || <FolderOpen className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[11px] sm:text-xs text-[#18201D] dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-colors truncate leading-snug">
                    {t('cat.' + cat.id) || cat.label}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[#66706B] dark:text-[#94A39D] truncate block mt-0.5 leading-tight">
                    {language === 'en' ? (CATEGORY_DESCRIPTIONS_EN[cat.id] || cat.description) : cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. RECENT FOUND ITEMS FEED
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#18201D] dark:text-white">
              {language === 'en' ? 'Recently Found Belongings' : 'أحدث المعثورات المدرسية'}
            </h2>
            <p className="text-xs text-[#66706B] dark:text-[#94A39D]">
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
