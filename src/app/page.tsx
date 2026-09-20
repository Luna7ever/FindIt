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
import { getCampusPeriod, getCampusGreeting, getCampusAtmosphere, CampusPeriod } from '@/lib/campusSchedule';
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
  Camera,
  Award,
  Cpu,
  ShoppingBag
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
    openQRScanner, 
    openCertificateModal, 
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

  const campusAtmosphere = useMemo(() => {
    return getCampusAtmosphere(campusPeriod, language, isAdmin);
  }, [campusPeriod, language, isAdmin]);

  const greetingText = useMemo(() => {
    return getCampusGreeting(
      { name: localizedUser.name, role: currentUser.role },
      campusPeriod,
      language,
      isAdmin
    );
  }, [localizedUser.name, currentUser.role, campusPeriod, language, isAdmin]);

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
    <div className="w-full max-w-full overflow-x-hidden px-4 sm:px-6 py-6 sm:py-8 space-y-7 sm:space-y-8 max-w-5xl mx-auto text-[#18201D] dark:text-[#F1F5F3]" dir={dir}>
      

      {/* ========================================================
          1. PERSONALIZED HERO GREETING & SEARCH BAR
      ======================================================== */}
      <section className="space-y-4 text-start pt-1 w-full max-w-full min-w-0 overflow-hidden">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] text-xs font-bold border border-[#176B5B]/30 dark:border-[#263834] max-w-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] animate-pulse shrink-0" />
              <span className="truncate">{greetingText}</span>
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-all shadow-2xs shrink-0"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Admin Portal 🏛️' : 'لوحة الإدارة 🏛️'}</span>
              </Link>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#18201D] dark:text-white ltr:tracking-tight">
              {language === 'en' ? 'Lost something? ' : 'ضاع منك شيء؟ '}
              <span className="text-[#176B5B] dark:text-[#2DD4BF]">
                {language === 'en' ? 'We are here to help.' : 'خلّينا نساعدك تلاقيه.'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#66706B] dark:text-[#94A39D] mt-1 max-w-2xl leading-relaxed">
              {language === 'en'
                ? 'Behavioral platform promoting student integrity, civic responsibility, and ethical custody within the school community.'
                : 'المنظومة السلوكية الذكية لترسيخ قيم النزاهة والمواطنة الإيجابية وحفظ الأمانات والمقتنيات داخل المدرسة.'}
            </p>
          </div>
        </div>

        {/* Integrated Live Interactive Instant Search Bar */}
        <InstantSearchBar />
      </section>

      {/* ========================================================
          2. DUAL ACTION HERO CARDS (فقدت شيئاً؟ / عثرت على شيء؟)
      ======================================================== */}
      <section className="space-y-3">
        {/* Subtle Campus Atmosphere Context Ribbon with Two Distinct Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#66706B] dark:text-[#94A39D]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm select-none shrink-0" aria-hidden="true">
              {campusAtmosphere.icon}
            </span>
            <span className="font-medium text-[#18201D] dark:text-[#E2E8F0] truncate">
              {t(campusAtmosphere.awarenessKey)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {/* Badge 1: Online Reporting & Tracking 24/7 */}
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#059669] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B]/40 px-2 py-0.5 rounded-md border border-[#059669]/20 dark:border-[#064E3B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34D399] animate-pulse shrink-0" />
              <span>{language === 'en' ? 'Online: 24/7' : 'البلاغات أونلاين: 24/7'}</span>
            </span>

            {/* Badge 2: Physical Office Retrieval Hours */}
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#176B5B] dark:text-[#2DD4BF] bg-[#E6F1ED]/80 dark:bg-[#122823]/80 px-2 py-0.5 rounded-md border border-[#176B5B]/20 dark:border-[#263834] shrink-0">
              <span className="sr-only">{campusAtmosphere.timeBracket} · {t(campusAtmosphere.periodNameKey || 'campus_morning_period')}</span>
              <span>{language === 'en' ? 'Office: 08:00 – 16:00 (Morning Period)' : 'مكتب استلام الأمانات: 08:00 – 16:00 (الفترة الصباحية)'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <Link
            href="/report?type=lost"
            className="app-card app-card-interactive p-4 sm:p-6 border-l-4 border-l-[#D97706] bg-white dark:bg-[#15201D] flex flex-col justify-between space-y-3 sm:space-y-4 group text-start shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] dark:bg-amber-950/60 text-[#92400E] dark:text-amber-300">
                {language === 'en' ? 'Quick Search' : 'بحث فوري'}
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#18201D] dark:text-white group-hover:text-[#D97706] transition-colors">
                {language === 'en' ? 'Lost something?' : 'فقدت شيئاً؟'}
              </h2>
              <p className="text-xs text-[#66706B] dark:text-[#94A39D] mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {language === 'en' 
                  ? 'Register your item specs and the system will match it immediately with school findings.' 
                  : 'سجّلي مواصفات غرضك وسيقوم النظام بمطابقته فوراً مع معثورات المدرسة.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] dark:text-amber-400 pt-1">
              <span>{language === 'en' ? 'Report Lost Item' : 'ابدئي تسجيل المفقود'}</span>
              <ArrowIcon className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </div>
          </Link>

          <Link
            href="/report?type=found"
            className="app-card app-card-interactive p-4 sm:p-6 border-l-4 border-l-[#059669] bg-white dark:bg-[#15201D] flex flex-col justify-between space-y-3 sm:space-y-4 group text-start shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#D1FAE5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400">
                <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] dark:bg-emerald-950/60 text-[#065F46] dark:text-emerald-300">
                {language === 'en' ? 'Honesty' : 'أمانة'}
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#18201D] dark:text-white group-hover:text-[#059669] transition-colors">
                {language === 'en' ? 'Found something?' : 'عثرت على شيء؟'}
              </h2>
              <p className="text-xs text-[#66706B] dark:text-[#94A39D] mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {language === 'en'
                  ? 'Thank you for your honesty! Record the item with a secret question to reach the owner safely.'
                  : 'شكراً لأمانتك! وثّقي الغرض مع سؤال سري لنصل إلى صاحبه الحقيقي بأمان.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669] dark:text-emerald-400 pt-1">
              <span>{language === 'en' ? 'Record Found Item' : 'تسجيل الأمانة الآن'}</span>
              <ArrowIcon className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
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
          4. QUICK SHORTCUTS STRIP (Activities, QR Scanner, Leaderboard, Certificate)
      ======================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <Link
          href="/activities"
          className="p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] hover:border-[#176B5B] dark:hover:border-[#2DD4BF] hover:bg-[#E6F1ED]/40 dark:hover:bg-[#1C2B27] text-start transition-all flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-2 sm:gap-2.5 shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#176B5B] to-emerald-600 dark:from-[#2DD4BF] dark:to-emerald-600 text-white dark:text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] truncate">
                {language === 'en' ? 'Activities' : 'الأنشطة المدرسية'}
              </p>
              <span className="px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2DD4BF] text-[8px] font-black">
                {language === 'en' ? '+50 pts' : '+50ن'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
              {language === 'en' ? 'Quests & Badges' : 'مهام وتحديات وأوسمة'}
            </p>
          </div>
        </Link>

        <button
          onClick={openQRScanner}
          className="p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] hover:border-[#176B5B] dark:hover:border-[#2DD4BF] hover:bg-[#E6F1ED]/40 dark:hover:bg-[#1C2B27] text-start transition-all flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-2 sm:gap-2.5 shadow-2xs group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2DD4BF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] truncate">
              {language === 'en' ? 'QR Scanner' : 'مسح الباركود'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
              {language === 'en' ? 'Instant room matching' : 'تحديد موقع المعمل فورياً'}
            </p>
          </div>
        </button>

        <Link
          href="/leaderboard"
          className="p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-[#1C2B27] text-start transition-all flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-2 sm:gap-2.5 shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-950 dark:group-hover:text-amber-300 truncate">
              {language === 'en' ? 'Leaderboard' : 'لوحة الشرف'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
              {language === 'en' ? 'Integrity Honor Roll' : 'تصنيف أبطال الأمانة'}
            </p>
          </div>
        </Link>

        <button
          onClick={() => openCertificateModal(currentUser)}
          className="p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-[#1C2B27] text-start transition-all flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-2 sm:gap-2.5 shadow-2xs group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-950 dark:group-hover:text-teal-300 truncate">
              {isAdmin 
                ? (language === 'en' ? 'Certificate' : 'معاينة الشهادة') 
                : (language === 'en' ? 'My Certificate' : 'شهادتي الرسمية')}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
              {isAdmin 
                ? (language === 'en' ? 'Official student template' : 'نموذج التكريم المعتمد') 
                : (language === 'en' ? 'Verified honor doc' : 'توثيق سفير النزاهة')}
            </p>
          </div>
        </button>
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
                className="p-2.5 rounded-2xl bg-[#F7F7F4]/80 dark:bg-[#1C2B27]/50 hover:bg-[#E6F1ED] dark:hover:bg-[#1C2B27] transition-all flex items-center gap-2.5 group text-start"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-[#15201D] text-[#176B5B] dark:text-[#2DD4BF] group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                  {categoryIconMap[cat.id] || <FolderOpen className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-[#18201D] dark:text-white group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-colors truncate">
                    {t('cat.' + cat.id) || cat.label}
                  </p>
                  <p className="text-[10px] text-[#66706B] dark:text-[#94A39D] truncate block">
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
