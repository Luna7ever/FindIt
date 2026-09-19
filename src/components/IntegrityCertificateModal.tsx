'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  QrCode, 
  CheckCircle2, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Lock, 
  BadgeCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, TrustTier } from '@/types';
import { useApp } from '@/context/AppContext';
import { DEMO_USERS } from '@/lib/constants';

interface IntegrityCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
}

export default function IntegrityCertificateModal({
  isOpen,
  onClose,
  user,
}: IntegrityCertificateModalProps) {
  const { currentUser, addToast, dir, language, getUserEarnedBadges } = useApp();
  const certRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Trigger celebration confetti upon opening
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#10B981', '#2DD4BF', '#F59E0B', '#0F4C3A'],
          disableForReducedMotion: true,
        });
      } catch {
        // Fallback gracefully
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPrincipalViewing = currentUser.role === 'admin' && (!user || user.role === 'admin');
  const targetUser = (user && user.role !== 'admin') 
    ? user 
    : (isPrincipalViewing ? (DEMO_USERS.find((u) => u.role === 'student') || DEMO_USERS[0]) : currentUser);
  const points = targetUser.goodwillPoints || 100;
  const tier: TrustTier = points >= 300 ? 'gold' : points >= 60 ? 'silver' : 'bronze';
  
  const tierTitleAr = tier === 'gold' 
    ? 'سفير الشرف الذهبي للأمانة 🥇' 
    : tier === 'silver' 
    ? 'سفير الشرف الفضي للأمانة 🌟' 
    : 'سفير الأمانة المدرسية 🥉';
    
  const tierTitleEn = tier === 'gold' 
    ? 'Gold Ambassador of Integrity 🥇' 
    : tier === 'silver' 
    ? 'Silver Ambassador of Integrity 🌟' 
    : 'Ambassador of School Integrity 🥉';

  const tierLabel = language === 'en' ? tierTitleEn : tierTitleAr;

  const serialNo = `EG-MOE-FINDIT-2026-${targetUser.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || '78421'}`;
  
  const currentDateAr = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Cairo'
  });

  const currentDateEn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const academicYearAr = 'العام الدراسي ٢٠٢٥ / ٢٠٢٦م';
  const academicYearEn = 'Academic Year 2025 / 2026';

  const earnedBadges = getUserEarnedBadges ? getUserEarnedBadges(targetUser.id) : [];

  const handlePrint = () => {
    window.print();
    addToast(
      language === 'en' ? 'Preparing Certificate' : 'جاري تحضير الشهادة للطباعة', 
      language === 'en' ? 'Choose Landscape format and enable background graphics.' : 'اختر الاتجاه الأفقي (Landscape) مع تفعيل طباعة الخلفيات لحفظها بدقة عالية.', 
      'info'
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(serialNo);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    addToast(
      language === 'en' ? 'Code Copied!' : 'تم نسخ الكود!', 
      language === 'en' ? 'Verification code copied to clipboard.' : 'تم نسخ الرقم التأكيدي للشهادة.', 
      'success'
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'en' ? `School Integrity Certificate for ${targetUser.name}` : `شهادة شكر وتقدير معتمدة للطالب/ة ${targetUser.name}`,
          text: language === 'en' ? `Proud to earn the School Integrity Certificate with ${points} points on FindIt!` : `فخورة بحصولي على شهادة سفير الأمانة المدرسية برصيد ${points} نقطة عبر منظومة FindIt!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      addToast(
        language === 'en' ? 'Certificate Link Copied!' : 'تم نسخ رابط الشهادة!', 
        language === 'en' ? 'You can share this document with your school and parents.' : 'يمكنك مشاركة الوثيقة المعتمدة مع أسرتك ومعلميك وإدارة المدرسة.', 
        'success'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in" dir={dir}>
      <div 
        className={`w-full bg-white dark:bg-[#101715] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#263834] overflow-hidden my-auto animate-in zoom-in-95 flex flex-col text-[#18201D] dark:text-[#F1F5F3] transition-all duration-300 ${
          isFullscreen ? 'max-w-5xl' : 'max-w-3xl lg:max-w-4xl'
        }`}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-slate-100 dark:border-[#263834] bg-slate-50/90 dark:bg-[#14201D]/90 backdrop-blur-md print:hidden gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                  {language === 'en' ? 'School Certificate of Merit' : 'شهادة شكر وتقدير مدرسية رسمية'}
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2DD4BF] text-[9px] font-black border border-emerald-300 dark:border-emerald-800/80">
                  <BadgeCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'en' ? 'Accredited' : 'معتمدة بختم النسر'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ms-auto">
            {/* Copy Verification Code */}
            <button
              onClick={handleCopyCode}
              title={language === 'en' ? 'Copy Code' : 'نسخ كود التحقق'}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A2724] border border-slate-200 dark:border-[#2D3E3A] hover:bg-slate-50 dark:hover:bg-[#233530] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer min-h-[34px]"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">{language === 'en' ? 'Copied' : 'تم'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline text-[11px]">{language === 'en' ? 'Copy Code' : 'نسخ الكود'}</span>
                </>
              )}
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#0F4C3A] to-emerald-600 hover:from-[#0B3A2C] hover:to-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[34px] active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Print / PDF' : 'طباعة / حفظ'}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A2724] border border-slate-200 dark:border-[#2D3E3A] hover:bg-slate-50 dark:hover:bg-[#233530] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer min-h-[34px]"
            >
              <Share2 className="w-3 h-3" />
              <span className="hidden sm:inline text-[11px]">{language === 'en' ? 'Share' : 'مشاركة'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex p-1.5 rounded-lg bg-slate-100 dark:bg-[#1A2724] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#233530] transition-colors cursor-pointer min-w-[34px] min-h-[34px] items-center justify-center"
              title={isFullscreen ? 'تصغير' : 'تكبير'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1A2724] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#233530] transition-colors cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas Container (Compact, Modern Landscape Layout) */}
        <div 
          ref={certRef}
          className="p-3 sm:p-5 md:p-6 bg-[#F3F2EC] dark:bg-[#080E0C] text-[#18201D] dark:text-[#F1F5F3] relative overflow-hidden print:p-0 print:bg-white"
        >
          {isPrincipalViewing && (
            <div className="mb-3 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-[#15231F] border border-amber-300/80 dark:border-[#2DD4BF]/40 text-amber-950 dark:text-[#2DD4BF] text-xs font-bold flex items-center justify-between shadow-xs print:hidden">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {language === 'en'
                    ? 'Official Principal Preview: Standard Certificate of Merit issued to exemplary students'
                    : 'معاينة الإدارة: النموذج الرسمي لشهادة التقدير والأمانة المعتمدة والممنوحة للطلاب'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#0E1715] text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#263834] font-mono">
                {language === 'en' ? 'Model Exemplar' : 'نموذج الطالب المعتمد'}
              </span>
            </div>
          )}
          {/* ========================================================
              MODERN SLEEK GEOMETRIC CERTIFICATE CANVAS
          ======================================================== */}
          <div className="relative p-4 sm:p-6 md:p-7 rounded-2xl bg-gradient-to-b from-[#FCFBF8] via-[#FAF8F3] to-[#F5F2EA] dark:from-[#111A17] dark:via-[#131F1C] dark:to-[#0F1715] border-2 border-[#0F4C3A] dark:border-[#2DD4BF] shadow-xl overflow-hidden print:border-2 print:shadow-none print:bg-white print:rounded-none">
            
            {/* Sleek Dual-Tone Gold & Emerald Geometric Inner Frame */}
            <div className="absolute inset-1.5 sm:inset-2.5 border border-amber-500/70 dark:border-amber-400/50 rounded-xl pointer-events-none" />
            <div className="absolute inset-2.5 sm:inset-4 border border-dashed border-[#0F4C3A]/20 dark:border-[#2DD4BF]/20 rounded-lg pointer-events-none" />

            {/* Contemporary Minimalist Corner Angles (Modern Geometry) */}
            <div className="absolute top-2 start-2 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-s-2 border-amber-500 dark:border-amber-400 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-2 end-2 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-e-2 border-amber-500 dark:border-amber-400 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-2 start-2 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-s-2 border-amber-500 dark:border-amber-400 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-2 end-2 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-e-2 border-amber-500 dark:border-amber-400 rounded-br-lg pointer-events-none" />

            {/* Subtle Minimalist Eagle Watermark in Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.04]">
              <svg viewBox="0 0 100 100" className="w-64 h-64 text-[#0F4C3A] dark:text-white" fill="currentColor">
                <path d="M50 5 L55 20 L70 22 L58 32 L62 48 L50 40 L38 48 L42 32 L30 22 L45 20 Z" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" />
              </svg>
            </div>

            <div className="relative z-10 space-y-3 sm:space-y-4">
              
              {/* ========================================================
                  1. COMPACT INSTITUTIONAL HEADER (EGYPTIAN MINISTRY)
              ======================================================== */}
              <div className="flex items-center justify-between border-b border-[#D4AF37]/40 dark:border-[#2DD4BF]/30 pb-2.5 gap-2 text-start">
                
                {/* Right: Egyptian Ministry & School Branding */}
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🇪🇬</span>
                    <p className="font-extrabold text-[11px] sm:text-xs text-[#0F4C3A] dark:text-[#2DD4BF]">
                      {language === 'en' ? 'Arab Republic of Egypt' : 'جمهورية مصر العربية'}
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {language === 'en' ? 'Ministry of Education & Technical Education' : 'وزارة التربية والتعليم والتعليم الفني'}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-400 truncate">
                    {language === 'en' ? 'Al-Mostaqbal Language School · Cairo' : 'مديرية القاهرة · مدرسة المستقبل للغات'}
                  </p>
                </div>

                {/* Center: Golden Eagle Emblem */}
                <div className="flex flex-col items-center justify-center shrink-0 px-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-xs flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#FAF8F2] dark:bg-[#121B18] flex items-center justify-center p-1">
                      <svg viewBox="0 0 64 64" className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-current" aria-label="Eagle of Egypt">
                        <path d="M32 2 L35 10 L44 11 L37 17 L39 26 L32 22 L25 26 L27 17 L20 11 L29 10 Z" />
                        <path d="M12 24 C15 32 19 40 25 45 L25 56 L32 60 L39 56 L39 45 C45 40 49 32 52 24 C44 28 32 26 32 26 C32 26 20 28 12 24 Z" opacity="0.85" />
                        <circle cx="32" cy="16" r="3" fill="#92400E" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Left: Document Verification & Academic Year */}
                <div className="text-end space-y-0.5 shrink-0">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-[#172622] border border-emerald-200 dark:border-emerald-800 text-[9px] font-black text-[#0F4C3A] dark:text-[#2DD4BF]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'en' ? 'Certified' : 'وثيقة معتمدة'}</span>
                  </div>
                  <p className="font-mono text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-tight">
                    {serialNo}
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'en' ? academicYearEn : academicYearAr}
                  </p>
                </div>

              </div>

              {/* ========================================================
                  2. MODERN CERTIFICATE TITLE (CLEAN & PRESTIGIOUS)
              ======================================================== */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-400/40">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] sm:text-xs font-black text-amber-900 dark:text-amber-300 tracking-widest uppercase">
                    {language === 'en' ? 'CERTIFICATE OF MERIT & HONORS' : 'شَهَادَةُ شُكْرٍ وَتَقْدِيرٍ مَدْرَسِيَّة'}
                  </span>
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                </div>

                <h1 className="text-lg sm:text-2xl font-black text-[#0F4C3A] dark:text-[#2DD4BF] tracking-tight">
                  {language === 'en' ? 'SCHOOL INTEGRITY AMBASSADOR' : 'سَفِيرُ النَّزَاهَةِ وَالأَمَانَةِ المَدْرَسِيَّة'}
                </h1>

                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {language === 'en'
                    ? 'The School Administration proudly honors student:'
                    : 'تَتَشَرَّفُ إِدَارَةُ المَدْرَسَةِ بِمَنْحِ هَذِهِ الشَّهَادَةِ لِلطَّالِبِ / الطَّالِبَةِ:'}
                </p>
              </div>

              {/* ========================================================
                  3. STUDENT NAME SHOWCASE (SLEEK CONTEMPORARY HERO)
              ======================================================== */}
              <div className="text-center max-w-lg mx-auto py-0.5">
                <div className="px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-amber-400/15 to-emerald-500/10 dark:from-[#172B26] dark:via-[#1B332C] dark:to-[#172B26] border border-amber-400/60 shadow-2xs">
                  <h2 className="text-xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-normal font-sans">
                    {targetUser.name}
                  </h2>
                  <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#121A18] text-slate-800 dark:text-slate-200 font-bold text-[10px] border border-slate-200 dark:border-[#2D3E3A]">
                      {targetUser.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-black text-[10px] border border-amber-300 dark:border-amber-700">
                      {tierLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold text-[10px]">
                      +{points} {language === 'en' ? 'Points' : 'نقطة أمانة'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  4. SHORT, PUNCHY SCHOOL CITATION (COMPACT)
              ======================================================== */}
              <p className="text-[11px] sm:text-xs text-slate-800 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed text-center font-medium px-2">
                {language === 'en'
                  ? `Conferred in high appreciation of exemplary moral integrity, voluntary dedication, and noble conduct in returning lost school belongings on FindIt.`
                  : `تَقْدِيرًا لِسُلُوكِهِ / سُلُوكِهَا الخُلُقِيِّ الرَّفِيعِ، وَالأَمَانَةِ المِثَالِيَّةِ فِي حِفْظِ وَرَدِّ الأَمَانَاتِ المَدْرَسِيَّةِ، وَالمُشَارَكَةِ الإِيجَابِيَّةِ الفَاعِلَةِ فِي بِيئَتِنَا التَّعْلِيمِيَّةِ.`}
              </p>

              {/* ========================================================
                  5. COMPACT BADGES & ACHIEVEMENTS STRIP
              ======================================================== */}
              {earnedBadges.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'en' ? 'Badges:' : 'الأوسمة:'}
                  </span>
                  {earnedBadges.map((badge) => (
                    <span
                      key={badge.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#14221F] border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-[#0F4C3A] dark:text-[#2DD4BF] shadow-2xs"
                      title={badge.description}
                    >
                      <span className="text-xs">{badge.icon}</span>
                      <span>{badge.title}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* ========================================================
                  6. OFFICIAL SIGNATURES: MS. MOSHIRA AS PRINCIPAL & EAGLE STAMP
              ======================================================== */}
              <div className="pt-2 sm:pt-3 border-t border-[#D4AF37]/40 dark:border-[#2DD4BF]/30 grid grid-cols-3 items-center gap-2 text-center">
                
                {/* 1. Activities & Custody Supervisor (Left) */}
                <div className="space-y-0.5">
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
                    {language === 'en' ? 'Activities & Custody Coordinator' : 'منسق الأنشطة ورعاية الأمانات'}
                  </p>
                  <p className="font-bold text-[11px] text-[#0F4C3A] dark:text-[#2DD4BF]">
                    لجنة رعاية الأمانات المدرسية
                  </p>
                  <div className="font-serif italic text-xs text-blue-900 dark:text-blue-300 font-semibold py-0.5 select-none opacity-80">
                    FindIt Committee
                  </div>
                  <p className="text-[8px] text-slate-400 font-mono">{currentDateAr}</p>
                </div>

                {/* 2. Official Egyptian Eagle Stamp (Center) */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0 duration-200">
                    {/* Outer Circular Seal Border with Scalloped Rim */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#0F4C3A] dark:border-[#2DD4BF] opacity-75" />
                    <div className="absolute inset-1 rounded-full border border-[#0F4C3A] dark:border-[#2DD4BF] opacity-90" />
                    
                    {/* Official Circular Seal Content */}
                    <div className="relative z-10 text-center text-[#0F4C3A] dark:text-[#2DD4BF] font-serif leading-none px-0.5 select-none">
                      <p className="text-[5.5px] font-bold uppercase tracking-tight">جمهورية مصر العربية</p>
                      <p className="text-[5px] font-bold my-0.2">وزارة التربية والتعليم</p>
                      {/* Eagle inside stamp */}
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mx-auto my-0.2 fill-current text-amber-700 dark:text-amber-300">
                        <path d="M12 2L14 6L18 7L15 10L16 14L12 12L8 14L9 10L6 7L10 6Z" />
                        <path d="M6 13C7 17 9 19 12 21C15 19 17 17 18 13C15 14 12 14 12 14C12 14 9 14 6 13Z" opacity="0.8" />
                      </svg>
                      <p className="text-[6px] font-black">ختم النسر المعتمد</p>
                      <p className="text-[5px] font-mono">كود ١٠٤٨٢</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-emerald-800 dark:text-[#2DD4BF] mt-0.5 flex items-center gap-0.5">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>{language === 'en' ? 'OFFICIALLY SEALED' : 'مُعتمد بختم النسر'}</span>
                  </span>
                </div>

                {/* 3. School Principal: MS. MOSHIRA (Right) */}
                <div className="space-y-0.5">
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
                    {language === 'en' ? 'School Principal' : 'مديرة المدرسة'}
                  </p>
                  <p className="font-extrabold text-[11px] sm:text-xs text-slate-950 dark:text-white">
                    أ/ مشيرة محمد
                  </p>
                  <div className="font-serif italic text-sm text-blue-900 dark:text-blue-300 font-semibold py-0.5 select-none opacity-90">
                    Moshira M.
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#182622] text-emerald-800 dark:text-emerald-300 text-[8px] font-bold border border-emerald-200 dark:border-emerald-800">
                    {language === 'en' ? 'Approved' : 'اعتُمد نظامياً'}
                  </span>
                </div>

              </div>

              {/* ========================================================
                  7. FOOTER SECURITY MICROPRINT & QR CODE (COMPACT)
              ======================================================== */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#23332F] flex items-center justify-between gap-2 text-[8px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-slate-100 dark:bg-[#1A2623] p-0.5 border border-slate-200 dark:border-[#2D3E3A] flex items-center justify-center shrink-0">
                    <QrCode className="w-3.5 h-3.5 text-slate-800 dark:text-white" />
                  </div>
                  <p className="text-start leading-tight">
                    {language === 'en'
                      ? 'Scan QR to verify on FindIt School Platform'
                      : 'امسح الرمز للتحقق من صحة الوثيقة عبر منظومة FindIt المدرسية'}
                  </p>
                </div>

                <div className="font-mono text-end text-[7.5px] tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Lock className="w-2 h-2 text-emerald-600 dark:text-emerald-400" />
                  <span>EG-MOE-VERIFIED</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
