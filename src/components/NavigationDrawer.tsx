'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Trophy, 
  Award, 
  Camera, 
  QrCode, 
  LayoutDashboard, 
  Users2, 
  ShieldCheck, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2, 
  RefreshCw,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  Laptop,
  Cpu
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { canAccessAdmin } from '@/lib/auth/permissions';
import UserAvatar from '@/components/UserAvatar';
import TrustBadge from '@/components/TrustBadge';
import { env } from '@/config/env';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQRScanner: () => void;
  onOpenQRModal: () => void;
  onOpenCertificateModal: () => void;
}

export default function NavigationDrawer({
  isOpen,
  onClose,
  onOpenQRScanner,
  onOpenQRModal,
  onOpenCertificateModal
}: NavigationDrawerProps) {
  const pathname = usePathname();
  const { 
    currentUser, 
    users, 
    setCurrentUserById, 
    currentUserTrustTier,
    getClaimsForMyItems,
    resetDemoData,
    addToast,
    language,
    setLanguage,
    theme,
    setTheme,
    resolvedTheme,
    t,
    dir
  } = useApp();

  const [showDemoList, setShowDemoList] = useState(false);
  const [showPledge, setShowPledge] = useState(false);
  const isAdminUser = canAccessAdmin(currentUser);

  const pendingClaimsCount = getClaimsForMyItems().filter(
    (c) => c.claim.status === 'pending'
  ).length;

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAction = (callback: () => void) => {
    onClose();
    setTimeout(callback, 200);
  };

  const handleResetData = () => {
    if (typeof window !== 'undefined' && window.confirm(t('settings.resetConfirmDesc'))) {
      resetDemoData();
      addToast(t('settings.resetBtn'), t('settings.resetSuccess'), 'success');
      onClose();
    }
  };

  const isRtl = dir === 'rtl';
  const initialX = isRtl ? '100%' : '-100%';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" dir={dir}>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs cursor-pointer z-40"
          />

          {/* Slide-over Drawer Panel */}
          <motion.aside
            initial={{ x: initialX }}
            animate={{ x: 0 }}
            exit={{ x: initialX }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className={`fixed top-0 bottom-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} w-full max-w-[320px] sm:max-w-md bg-white dark:bg-[#141C1A] h-full shadow-2xl flex flex-col z-50 border-[#E4E7E4] dark:border-[#23332F] overflow-hidden text-[#18201D] dark:text-[#F1F5F3]`}
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-[#E4E7E4] dark:border-[#23332F] bg-slate-50/80 dark:bg-[#182220] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#176B5B] to-emerald-600 dark:from-[#2DD4BF] dark:to-emerald-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-sm text-[#18201D] dark:text-white leading-tight">
                    {t('drawer.title')}
                  </h2>
                  <p className="text-[10px] text-[#66706B] dark:text-[#94A39D] font-medium">
                    {t('drawer.subtitle')}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white dark:bg-[#1C2724] border border-[#E4E7E4] dark:border-[#2D3E3A] text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#23332F] flex items-center justify-center transition-colors cursor-pointer"
                title={t('drawer.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              
              {/* User Profile Summary Card */}
              <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-[#122823] dark:via-[#182220] dark:to-[#141C1A] p-3.5 rounded-2xl border border-emerald-100/90 dark:border-[#1E463D] shadow-2xs">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    size="lg"
                    name={currentUser.name}
                    role={currentUser.role}
                    avatarUrl={currentUser.avatar}
                    showBadge={isAdminUser}
                  />
                  <div className="flex-1 min-w-0 text-start">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-black text-xs sm:text-sm text-[#18201D] dark:text-white truncate">
                        {currentUser.name}
                      </h3>
                      {isAdminUser ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#18201D] dark:bg-white dark:text-[#18201D] text-white text-[8px] font-black shrink-0">
                          {t('app.adminBadge')}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] text-[8px] font-black shrink-0">
                          {t('app.studentBadge')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#66706B] dark:text-[#94A39D] truncate">
                      {currentUser.grade}
                    </p>
                    {isAdminUser ? (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-[#176B5B] dark:text-[#2DD4BF] bg-emerald-100/70 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        <span>🏛️</span>
                        <span>{language === 'en' ? 'School Leadership & Certified Authority' : 'القيادة المدرسية والجهة المعتمدة للتكريم'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <TrustBadge tier={currentUserTrustTier} size="sm" />
                        <span className="text-[10px] font-bold text-[#176B5B] dark:text-[#2DD4BF] bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                          ✨ {currentUser.goodwillPoints || 0} {t('nav.goodwillPoints')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Language & Theme Controls */}
              <div className="space-y-2">
                {/* Language Switcher Segment */}
                <div className="p-1.5 bg-[#F1F3F0] dark:bg-[#1C2724] rounded-2xl border border-[#E4E7E4] dark:border-[#23332F] flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setLanguage('ar');
                      addToast('اللغة', 'تم تفعيل اللغة العربية 🇪🇬', 'success');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      language === 'ar'
                        ? 'bg-[#176B5B] text-white shadow-xs font-black'
                        : 'bg-white/80 dark:bg-[#141C1A]/80 text-[#66706B] dark:text-[#94A39D] hover:bg-white dark:hover:bg-[#141C1A]'
                    }`}
                  >
                    <span>🇪🇬 العربية</span>
                    {language === 'ar' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>

                  <button
                    onClick={() => {
                      setLanguage('en');
                      addToast('Language', 'Switched to English 🇬🇧', 'success');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      language === 'en'
                        ? 'bg-[#176B5B] text-white shadow-xs font-black'
                        : 'bg-white/80 dark:bg-[#141C1A]/80 text-[#66706B] dark:text-[#94A39D] hover:bg-white dark:hover:bg-[#141C1A]'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>

                {/* Theme Switcher Segment */}
                <div className="p-1.5 bg-[#F1F3F0] dark:bg-[#1C2724] rounded-2xl border border-[#E4E7E4] dark:border-[#23332F] flex items-center gap-1.5">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      resolvedTheme === 'light'
                        ? 'bg-amber-500 text-white shadow-xs font-black'
                        : 'bg-white/80 dark:bg-[#141C1A]/80 text-[#66706B] dark:text-[#94A39D] hover:bg-white dark:hover:bg-[#141C1A]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>{t('settings.themeLight')}</span>
                    {resolvedTheme === 'light' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      resolvedTheme === 'dark'
                        ? 'bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-[#18201D] shadow-xs font-black'
                        : 'bg-white/80 dark:bg-[#141C1A]/80 text-[#66706B] dark:text-[#94A39D] hover:bg-white dark:hover:bg-[#141C1A]'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{t('settings.themeDark')}</span>
                    {resolvedTheme === 'dark' && <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-slate-950" />}
                  </button>
                </div>
              </div>

              {/* SECTION 1: Main Secondary Navigation */}
              <div>
                <span className="text-[10px] font-black text-[#66706B] dark:text-[#94A39D] uppercase tracking-wider px-2 block mb-2">
                  {t('drawer.pagesSection')}
                </span>
                <div className="space-y-1.5">
                  
                  {/* ISEF Benchmark Suite Link (Available on Mobile to Judges & Students) */}
                  <Link
                    href="/admin/benchmark"
                    onClick={onClose}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all border ${
                      pathname === '/admin/benchmark'
                        ? 'bg-[#E6F1ED] dark:bg-[#122823] border-[#176B5B] dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-xs'
                        : 'bg-gradient-to-r from-emerald-50/70 to-teal-50/70 dark:from-[#13201D] dark:to-[#162723] border-[#176B5B]/30 dark:border-[#2DD4BF]/30 text-[#18201D] dark:text-white hover:bg-[#E6F1ED] dark:hover:bg-[#1C2724]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#176B5B] text-white dark:bg-[#2DD4BF] dark:text-[#18201D] flex items-center justify-center shrink-0 shadow-2xs">
                        <Cpu className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-tight">
                            {language === 'en' ? 'ISEF Scientific Benchmark' : 'لوحة تقييم أيسف العلمي'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#176B5B] text-white dark:bg-[#2DD4BF] dark:text-[#18201D] text-[8px] font-black">
                            ISEF
                          </span>
                        </div>
                        <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                          {language === 'en' ? 'Live Confusion Matrix & F1-Score' : 'مصفوفة الارتباك والدقة العلمية'}
                        </p>
                      </div>
                    </div>
                    <ArrowIcon className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                  </Link>

                  {/* School Activities & Volunteering Quests */}
                  <Link
                    href="/activities"
                    onClick={onClose}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all border ${
                      pathname === '/activities'
                        ? 'bg-[#E6F1ED] dark:bg-[#122823] border-emerald-300 dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                        : 'bg-white dark:bg-[#15201D] border-[#E4E7E4] dark:border-[#263834] text-[#18201D] dark:text-white hover:bg-[#F8FAF9] dark:hover:bg-[#1C2724]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        pathname === '/activities' ? 'bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-[#18201D]' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#2DD4BF]'
                      }`}>
                        <Award className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-tight">{t('nav.activities')}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-[#2DD4BF] text-[8px] font-black">
                            {t('drawer.new')}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                          {isAdminUser 
                            ? (language === 'en' ? 'Supervise & Approve Initiatives' : 'متابعة واعتماد مبادرات الطالبات')
                            : (language === 'en' ? 'Quests & Volunteer Badges' : 'مهام وتحديات الأمانة والتطوع')}
                        </p>
                      </div>
                    </div>
                    <ArrowIcon className="w-4 h-4 text-[#66706B] dark:text-[#94A39D]" />
                  </Link>

                  {/* Settings Page */}
                  <Link
                    href="/settings"
                    onClick={onClose}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all border ${
                      pathname === '/settings'
                        ? 'bg-[#E6F1ED] dark:bg-[#122823] border-emerald-300 dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                        : 'bg-white dark:bg-[#15201D] border-[#E4E7E4] dark:border-[#263834] text-[#18201D] dark:text-white hover:bg-[#F8FAF9] dark:hover:bg-[#1C2724]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        pathname === '/settings' ? 'bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-[#18201D]' : 'bg-[#F1F3F0] dark:bg-[#1C2724] text-[#66706B] dark:text-[#94A39D]'
                      }`}>
                        <Settings className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-tight">{t('nav.settings')}</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[8px] font-black">
                            {t('drawer.new')}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                          {t('settings.subtitle')}
                        </p>
                      </div>
                    </div>
                    <ArrowIcon className="w-4 h-4 text-[#66706B] dark:text-[#94A39D]" />
                  </Link>

                  {/* Leaderboard Page */}
                  <Link
                    href="/leaderboard"
                    onClick={onClose}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all border ${
                      pathname === '/leaderboard'
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-300 font-black shadow-2xs'
                        : 'bg-white dark:bg-[#15201D] border-[#E4E7E4] dark:border-[#263834] text-[#18201D] dark:text-white hover:bg-[#F8FAF9] dark:hover:bg-[#1C2724]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        pathname === '/leaderboard' ? 'bg-amber-500 text-white' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        <Trophy className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-start">
                        <span className="text-xs font-bold leading-tight block">{t('nav.leaderboard')}</span>
                        <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                          {isAdminUser
                            ? (language === 'en' ? 'School Honor Roll & Student Rankings' : 'لوحة شرف المدرسة وتكريم الطالبات')
                            : t('settings.publicLeaderboardDesc')}
                        </p>
                      </div>
                    </div>
                    <ArrowIcon className="w-4 h-4 text-[#66706B] dark:text-[#94A39D]" />
                  </Link>

                  {/* Official Certificate Action (Available for Students Only) */}
                  {!isAdminUser && (
                    <button
                      onClick={() => handleAction(onOpenCertificateModal)}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] hover:bg-[#F8FAF9] dark:hover:bg-[#1C2724] transition-all text-start cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                          <Award className="w-4.5 h-4.5" />
                        </div>
                        <div className="text-start">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold leading-tight text-[#18201D] dark:text-white">{t('drawer.certificate')}</span>
                            <span className="px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300 text-[8px] font-black">
                              {t('drawer.verified')}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                            {t('drawer.certificateDesc')}
                          </p>
                        </div>
                      </div>
                      <ArrowIcon className="w-4 h-4 text-[#66706B] dark:text-[#94A39D]" />
                    </button>
                  )}

                </div>
              </div>

              {/* SECTION 2: School Field & Operations Tools */}
              <div>
                <span className="text-[10px] font-black text-[#66706B] dark:text-[#94A39D] uppercase tracking-wider px-2 block mb-2">
                  {t('drawer.toolsSection')}
                </span>
                <div className="space-y-1.5">
                  
                  {/* Live Camera Scanner */}
                  <button
                    onClick={() => handleAction(onOpenQRScanner)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] hover:bg-[#F8FAF9] dark:hover:bg-[#1C2724] transition-all text-start cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                        <Camera className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-tight text-[#18201D] dark:text-white">{t('drawer.cameraScanner')}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-[8px] font-bold font-mono">
                            {t('drawer.live')}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                          {t('drawer.cameraScannerDesc')}
                        </p>
                      </div>
                    </div>
                    <ArrowIcon className="w-4 h-4 text-[#66706B] dark:text-[#94A39D]" />
                  </button>

                  {/* Printable QR Posters */}
                  <button
                    onClick={() => handleAction(onOpenQRModal)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] hover:bg-[#F8FAF9] dark:hover:bg-[#1C2724] transition-all text-start cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2724] text-[#66706B] dark:text-[#94A39D] flex items-center justify-center">
                        <QrCode className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-start">
                        <span className="text-xs font-bold leading-tight text-[#18201D] dark:text-white block">{t('drawer.qrPosters')}</span>
                        <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                          {t('drawer.qrPostersDesc')}
                        </p>
                      </div>
                    </div>
                    <ArrowIcon className="w-4 h-4 text-[#66706B] dark:text-[#94A39D]" />
                  </button>

                </div>
              </div>

              {/* SECTION 3: Admin Dashboard (For Admin or Fast Navigation) */}
              {isAdminUser && (
                <div>
                  <span className="text-[10px] font-black text-[#66706B] dark:text-[#94A39D] uppercase tracking-wider px-2 block mb-2">
                    {t('drawer.adminSection')}
                  </span>
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all border ${
                      pathname.startsWith('/admin')
                        ? 'bg-[#18201D] dark:bg-white border-[#18201D] dark:border-white text-white dark:text-[#18201D] font-black shadow-md'
                        : 'bg-white dark:bg-[#15201D] border-[#E4E7E4] dark:border-[#263834] text-[#18201D] dark:text-white hover:bg-[#F8FAF9] dark:hover:bg-[#1C2724]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        pathname.startsWith('/admin') ? 'bg-[#176B5B] text-white' : 'bg-[#18201D] dark:bg-[#263834] text-white'
                      }`}>
                        <LayoutDashboard className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-tight">{t('drawer.adminTitle')}</span>
                          {pendingClaimsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                              {pendingClaimsCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] ${pathname.startsWith('/admin') ? 'text-emerald-100 dark:text-[#66706B]' : 'text-[#66706B] dark:text-[#94A39D]'}`}>
                          {t('drawer.adminDesc')}
                        </p>
                      </div>
                    </div>
                    <ArrowIcon className={`w-4 h-4 ${pathname.startsWith('/admin') ? 'text-white dark:text-[#18201D]' : 'text-[#66706B] dark:text-[#94A39D]'}`} />
                  </Link>
                </div>
              )}

              {/* SECTION 4: Demo Account Fast Switcher */}
              {env.NEXT_PUBLIC_DEMO_MODE && (
                <div className="bg-slate-50 dark:bg-[#182220] p-3 rounded-2xl border border-slate-200/80 dark:border-[#23332F]">
                  <button
                    onClick={() => setShowDemoList(!showDemoList)}
                    className="w-full flex items-center justify-between text-start cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                      <span className="text-xs font-black text-[#18201D] dark:text-white">
                        {t('drawer.demoSection')}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#66706B] dark:text-[#94A39D] transition-transform ${showDemoList ? 'rotate-180' : ''}`} />
                  </button>

                  {showDemoList && (
                    <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-200 dark:border-[#263834]">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUserById(u.id);
                            addToast(t('settings.accountSwitched'), `${t('settings.nowBrowsingAs')} ${u.name}`, 'info');
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-start text-xs transition-all cursor-pointer ${
                            currentUser.id === u.id
                              ? 'bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] font-black border border-emerald-300 dark:border-[#2DD4BF]'
                              : 'bg-white dark:bg-[#141C1A] border border-[#E4E7E4] dark:border-[#23332F] text-[#18201D] dark:text-white hover:bg-slate-100 dark:hover:bg-[#1C2724]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              size="sm"
                              name={u.name}
                              role={u.role}
                              avatarUrl={u.avatar}
                            />
                            <div>
                              <p className="font-bold text-xs">{u.name}</p>
                              <p className="text-[9px] text-[#66706B] dark:text-[#94A39D]">
                                {u.role === 'admin' ? t('app.adminBadge') : u.grade}
                              </p>
                            </div>
                          </div>
                          {currentUser.id === u.id && (
                            <CheckCircle2 className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5: School Integrity Pledge & Rules Accordion */}
              <div className="bg-emerald-50/50 dark:bg-[#122823]/60 p-3 rounded-2xl border border-emerald-200/60 dark:border-[#1E463D]">
                <button
                  onClick={() => setShowPledge(!showPledge)}
                  className="w-full flex items-center justify-between text-start cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-[#2DD4BF]" />
                    <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                      {t('drawer.pledge')}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-emerald-700 dark:text-[#2DD4BF] transition-transform ${showPledge ? 'rotate-180' : ''}`} />
                </button>

                {showPledge && (
                  <div className="mt-2.5 text-[11px] text-emerald-950 dark:text-emerald-200 space-y-1.5 pt-2 border-t border-emerald-200/60 dark:border-[#1E463D] font-medium leading-relaxed">
                    <p>✨ <strong>1. {isRtl ? 'الإبلاغ الفوري:' : 'Instant Report:'}</strong> {isRtl ? 'المبادرة بتسجيل أي مفقود لضمان عودته لصاحبه بأسرع وقت.' : 'Initiate report immediately to ensure fast return.'}</p>
                    <p>🛡️ <strong>2. {isRtl ? 'تسليم الأمانات:' : 'Safe Custody:'}</strong> {isRtl ? 'إيداع المقتنيات الثمينة فوراً لدى مكتب الأمانات والإدارة.' : 'Deposit valuable items at the school office immediately.'}</p>
                    <p>🔒 <strong>3. {isRtl ? 'التحقق الدقيق:' : 'Verification:'}</strong> {isRtl ? 'عدم تسليم أي غرض إلا بعد التحقق من الإجابة السرية ورمز PIN.' : 'Verify rightful ownership via secret answer & PIN.'}</p>
                    <p>🏆 <strong>4. {isRtl ? 'القدوة الحسنة:' : 'Role Model:'}</strong> {isRtl ? 'تعزيز روح النزاهة ومساعدة الزملاء لكسب نقاط الأمانة وشارات الشرف.' : 'Promote honesty and earn goodwill honor badges.'}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-3 border-t border-[#E4E7E4] dark:border-[#23332F] bg-slate-50 dark:bg-[#182220] flex items-center justify-between shrink-0 text-[11px] text-[#66706B] dark:text-[#94A39D]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono font-semibold">ETHOS v4.3</span>
              </div>
              <button
                onClick={handleResetData}
                className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 py-1.5 px-2.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title={t('drawer.resetDemo')}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t('drawer.resetDemo')}</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
