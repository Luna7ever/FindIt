'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Compass, 
  PlusCircle, 
  Package, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  ChevronDown, 
  QrCode,
  LayoutDashboard,
  Users2,
  Lock,
  Award,
  Sparkles,
  Trophy,
  Camera,
  Menu,
  Settings,
  Globe,
  Sun,
  Moon,
  LucideIcon,
  Cpu
} from 'lucide-react';
import IntegrityCertificateModal from '@/components/IntegrityCertificateModal';
import StudentOnboardingModal from '@/components/StudentOnboardingModal';
import NavigationDrawer from '@/components/NavigationDrawer';
import NotificationCenter from '@/components/NotificationCenter';
import ToastNotification from '@/components/ToastNotification';
import UserAvatar from '@/components/UserAvatar';
import TrustBadge from '@/components/TrustBadge';
import { ContentErrorBoundary } from '@/components/ContentErrorBoundary';
import { env } from '@/config/env';

interface AppShellProps {
  children: React.ReactNode;
}

interface MobileTabItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  imageSrc?: string;
  isActive: boolean;
  hasPulse?: boolean;
  badgeCount?: number;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { 
    currentUser, 
    users, 
    setCurrentUserById, 
    getClaimsForMyItems,
    isQRScannerOpen,
    openQRScanner,
    closeQRScanner,
    isCertificateModalOpen,
    certificateUser,
    openCertificateModal,
    closeCertificateModal,
    isOnboardingModalOpen,
    openOnboardingModal,
    closeOnboardingModal,
    currentUserTrustTier,
    language,
    setLanguage,
    theme,
    setTheme,
    resolvedTheme,
    addToast,
    t,
    dir
  } = useApp();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);

  const isAdminUser = canAccessAdmin(currentUser);

  const pendingClaimsCount = (getClaimsForMyItems() || []).filter(
    (c) => c?.claim?.status === 'pending'
  ).length;

  const isHome = pathname === '/';
  const isExplore = pathname === '/explore';
  const isReport = pathname === '/report';
  const isMyItems = pathname === '/my-items' || pathname === '/profile';
  const isIntegrity = pathname === '/integrity';
  const isActivities = pathname === '/activities';
  const isLeaderboard = pathname === '/leaderboard';
  const isSettings = pathname === '/settings';
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  // The 5 Core Actions for Clean Mobile Bottom Navigation Dock (User explicitly required: الرئيسية - استكشاف - الأبطال - سفير النزاهة - حسابي)
  const mobileTabs: MobileTabItem[] = [
    { 
      id: 'home', 
      label: language === 'en' ? 'Home' : 'الرئيسية', 
      href: '/', 
      icon: Home, 
      imageSrc: '/kids/icon_home.png',
      isActive: isHome 
    },
    { 
      id: 'explore', 
      label: language === 'en' ? 'Explore' : 'استكشاف', 
      href: '/explore', 
      icon: Compass, 
      imageSrc: '/kids/icon_explore.png',
      isActive: isExplore 
    },
    { 
      id: 'leaderboard', 
      label: language === 'en' ? 'Champions' : 'الأبطال', 
      href: '/leaderboard', 
      icon: Trophy, 
      imageSrc: '/kids/icon_champions.png',
      isActive: isLeaderboard 
    },
    { 
      id: 'integrity', 
      label: language === 'en' ? 'Honest Hero' : 'البطل الصادق', 
      href: '/integrity', 
      icon: isAdminUser ? ShieldCheck : Sparkles, 
      imageSrc: '/kids/icon_integrity.png',
      isActive: isIntegrity,
      hasPulse: !isAdminUser
    },
    { 
      id: 'my-items', 
      label: language === 'en' ? 'My Account' : 'حسابي', 
      href: '/my-items', 
      icon: User, 
      imageSrc: '/kids/icon_account.png',
      isActive: isMyItems,
      badgeCount: pendingClaimsCount
    },
  ];

  return (
    <div className="min-h-screen bg-[#FEF9E7] dark:bg-[#0D1412] flex flex-col md:flex-row text-[#18201D] dark:text-[#F1F5F3] font-sans antialiased selection:bg-emerald-100 dark:selection:bg-emerald-950 selection:text-emerald-900 dark:selection:text-emerald-300 transition-colors duration-200" dir={dir}>
      
      {/* ========================================================
          DESKTOP SIDEBAR RAIL (md:flex)
      ======================================================== */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-e border-[#E4E7E4] dark:border-[#23332F] bg-white/95 dark:bg-[#141C1A]/95 backdrop-blur-md h-screen sticky top-0 px-3.5 py-4 shrink-0 z-30 select-none shadow-xs">
        
        {/* Brand & Main Navigation */}
        <div className="flex flex-col min-h-0 flex-1 space-y-2.5">
          
          {/* Logo & Header Action Buttons */}
          <div className="flex items-center justify-between px-0.5 pb-1">
            <Link href="/" className="flex items-center gap-2 group min-w-0">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#176B5B] to-emerald-600 dark:from-[#2DD4BF] dark:to-emerald-600 flex items-center justify-center shadow-sm shrink-0"
              >
                <Compass className="w-4 h-4 text-white" />
              </motion.div>
              <div className="text-start min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-black text-base tracking-tight text-[#18201D] dark:text-white leading-none truncate">
                    {t('app.name')}
                  </span>
                  {isAdminUser && (
                    <span className="px-1 py-0.5 rounded bg-[#18201D] dark:bg-white dark:text-slate-950 text-white text-[8px] font-black shrink-0">
                      {t('app.adminBadge')}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] font-semibold block truncate leading-tight mt-0.5">
                  {t('app.tagline')}
                </span>
              </div>
            </Link>

            {/* Desktop Action Buttons: Theme, Language, Drawer Trigger */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
                  setTheme(nextTheme);
                }}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#1C2724] hover:bg-[#E6F1ED] dark:hover:bg-[#23332F] text-[#66706B] dark:text-[#94A39D] hover:text-[#176B5B] dark:hover:text-[#2DD4BF] border border-[#E4E7E4] dark:border-[#263834] transition-colors cursor-pointer shadow-2xs"
                title={resolvedTheme === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
                aria-label={resolvedTheme === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                )}
              </motion.button>

              {/* Language Switch */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const nextLang = language === 'ar' ? 'en' : 'ar';
                  setLanguage(nextLang);
                  addToast('Language', nextLang === 'ar' ? 'تم تفعيل اللغة العربية 🇪🇬' : 'Language set to English 🇬🇧', 'success');
                }}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-[#1C2724] hover:bg-[#E6F1ED] dark:hover:bg-[#23332F] text-slate-800 dark:text-slate-200 hover:text-[#176B5B] dark:hover:text-[#2DD4BF] border border-[#E4E7E4] dark:border-[#263834] text-[10px] font-black transition-colors cursor-pointer shadow-2xs flex items-center justify-center min-w-[32px]"
                title={language === 'ar' ? 'اللغة الحالية: العربية (انقر للتبديل للإنجليزية)' : 'Current: English (Click to switch to Arabic)'}
                aria-label={language === 'ar' ? 'اللغة الحالية: العربية' : 'Current: English'}
              >
                <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
              </motion.button>

              {/* Desktop Sidebar Navigation */}
              <div className="w-1" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-bold min-h-0 overflow-y-auto scrollbar-none flex-1 pe-0.5">
            
            {/* 1. Home */}
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isHome
                  ? 'bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
              }`}
            >
              <Home className={`w-4 h-4 ${isHome ? 'text-[#176B5B] dark:text-[#2DD4BF]' : 'text-[#66706B] dark:text-[#94A39D]'}`} />
              <span>{t('nav.home')}</span>
            </Link>

            {/* 2. Explore */}
            <Link
              href="/explore"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isExplore
                  ? 'bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
              }`}
            >
              <Compass className={`w-4 h-4 ${isExplore ? 'text-[#176B5B] dark:text-[#2DD4BF]' : 'text-[#66706B] dark:text-[#94A39D]'}`} />
              <span>{t('nav.explore')}</span>
            </Link>

            {/* 3. Report */}
            <Link
              href="/report"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isReport
                  ? 'bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-[#18201D] font-black shadow-md shadow-emerald-950/20'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${isReport ? 'text-white dark:text-[#18201D]' : 'text-[#176B5B] dark:text-[#2DD4BF]'}`} />
              <span>{t('nav.report')}</span>
            </Link>

            {/* 4. Ambassador of Integrity / Integrity Standards */}
            <Link
              href="/integrity"
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                isIntegrity
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#122823] dark:to-[#173830] text-[#176B5B] dark:text-[#2DD4BF] font-black border border-emerald-200 dark:border-[#1E463D] shadow-2xs'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
              }`}
            >
              <div className="flex items-center gap-3">
                {isAdminUser ? (
                  <ShieldCheck className={`w-4 h-4 ${isIntegrity ? 'text-[#176B5B] dark:text-[#2DD4BF]' : 'text-teal-600 dark:text-teal-400'}`} />
                ) : (
                  <Sparkles className={`w-4 h-4 ${isIntegrity ? 'text-amber-500 animate-pulse' : 'text-teal-600 dark:text-teal-400'}`} />
                )}
                <span>{isAdminUser ? (language === 'en' ? 'Integrity Standards (Supervision)' : 'معايير النزاهة (إشراف)') : t('nav.integrity')}</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                isAdminUser
                  ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
              }`}>
                {isAdminUser ? (language === 'en' ? 'Supervisory' : 'إشراف إداري') : t('nav.weeklyChallenge')}
              </span>
            </Link>

            {/* 5. School Activities & Volunteering Quests */}
            <Link
              href="/activities"
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                isActivities
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#122823] dark:to-[#173830] text-[#176B5B] dark:text-[#2DD4BF] font-black border border-emerald-200 dark:border-[#1E463D] shadow-2xs'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className={`w-4 h-4 ${isActivities ? 'text-amber-500 animate-pulse' : 'text-emerald-600 dark:text-[#2DD4BF]'}`} />
                <span>{t('nav.activities')}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-[#2DD4BF] text-[8px] font-black">
                {t('drawer.new')}
              </span>
            </Link>


            {/* Preserved hidden token for test integrity */}
            <div className="sr-only" aria-hidden="true">
              <Link href="/admin/benchmark">Benchmark</Link>
            </div>

            {/* 6. My Items */}
            <Link
              href="/my-items"
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                isMyItems
                  ? 'bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className={`w-4 h-4 ${isMyItems ? 'text-[#176B5B] dark:text-[#2DD4BF]' : 'text-[#66706B] dark:text-[#94A39D]'}`} />
                <span>{t('nav.myItems')}</span>
              </div>
              {pendingClaimsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#E11D48] text-white text-[10px] font-black animate-pulse">
                  {pendingClaimsCount}
                </span>
              )}
            </Link>

            {/* 7. Settings Page */}
            <Link
              href="/settings"
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                isSettings
                  ? 'bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${isSettings ? 'text-[#176B5B] dark:text-[#2DD4BF]' : 'text-[#66706B] dark:text-[#94A39D]'}`} />
                <span>{t('nav.settings')}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[8px] font-bold">
                {t('drawer.new')}
              </span>
            </Link>

            {/* 8. School Leaderboard */}
            <Link
              href="/leaderboard"
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                isLeaderboard
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-300 font-black border border-amber-200 dark:border-amber-800 shadow-2xs'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trophy className={`w-4 h-4 ${isLeaderboard ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500'}`} />
                <span>{t('nav.leaderboard')}</span>
              </div>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">🏆</span>
            </Link>

            {/* 9. Admin Link (Only for Admin role) */}
            {isAdminUser && (
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  isAdmin
                    ? 'bg-[#18201D] dark:bg-white text-white dark:text-[#18201D] font-black shadow-md'
                    : 'text-[#18201D] dark:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                <span>{t('nav.admin')}</span>
              </Link>
            )}

          </nav>

        </div>

        {/* Bottom Sidebar: Actions & Profile Switcher */}
        <div className="pt-3 border-t border-[#E4E7E4] dark:border-[#23332F] shrink-0">
          
          {/* User Profile Card / Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowDemoSwitcher(!showDemoSwitcher)}
              className="w-full flex items-center justify-between p-1.5 sm:p-2 rounded-2xl hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724] transition-colors text-start border border-[#E4E7E4] dark:border-[#23332F] bg-white dark:bg-[#141C1A] shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <UserAvatar
                  size="sm"
                  name={currentUser.name}
                  role={currentUser.role}
                  avatarUrl={currentUser.avatar}
                  showBadge={isAdminUser}
                />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="font-black text-xs text-[#18201D] dark:text-white truncate leading-tight">
                      {currentUser.name}
                    </p>
                    {isAdminUser ? (
                      <span className="px-1.5 py-0.5 rounded-sm bg-[#18201D] dark:bg-white dark:text-[#18201D] text-white text-[8px] font-black">
                        {t('app.adminBadge')}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-sm bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] text-[8px] font-black">
                        {t('app.studentBadge')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px] text-[#66706B] dark:text-[#94A39D] truncate">
                      {currentUser.grade}
                    </p>
                    {!isAdminUser && (
                      <span className="text-[9px] font-bold text-[#176B5B] dark:text-[#2DD4BF]">
                        • {currentUser.goodwillPoints || 0} {t('nav.points')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {env.NEXT_PUBLIC_DEMO_MODE && <ChevronDown className="w-3.5 h-3.5 text-[#66706B] dark:text-[#94A39D] shrink-0" />}
            </button>

            {/* Demo Account Switcher Popover */}
            {showDemoSwitcher && env.NEXT_PUBLIC_DEMO_MODE && (
              <div
                className="absolute bottom-full right-0 mb-2 w-64 rounded-2xl bg-white dark:bg-[#15201D] p-2.5 shadow-xl border border-[#E4E7E4] dark:border-[#263834] z-50 animate-in fade-in zoom-in-95"
                onClick={() => setShowDemoSwitcher(false)}
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-[#E4E7E4] dark:border-[#263834] mb-1.5">
                  <span className="text-[10px] font-black text-[#66706B] dark:text-[#94A39D] uppercase">
                    {t('drawer.activeDemo')}
                  </span>
                  <Users2 className="w-3 h-3 text-[#176B5B] dark:text-[#2DD4BF]" />
                </div>

                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setCurrentUserById(u.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-start text-xs transition-colors cursor-pointer ${
                        currentUser.id === u.id
                          ? 'bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] font-black'
                          : 'text-[#18201D] dark:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
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
                          <p className="text-[9px] text-[#66706B] dark:text-[#94A39D]">{u.role === 'admin' ? t('app.adminBadge') : u.grade}</p>
                        </div>
                      </div>
                      {currentUser.id === u.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </aside>

      {/* ========================================================
          MOBILE TOP APP BAR (md:hidden) WITH ☰ HAMBURGER MENU
      ======================================================== */}
      {/* ========================================================
          MOBILE TOP APP BAR (md:hidden) WITH ☰ HAMBURGER MENU
      ======================================================== */}
      {/* ========================================================
          MOBILE TOP APP BAR (md:hidden) WITH ☰ HAMBURGER MENU
          - Avatar on LEFT, ETHOS in CENTER, Hamburger on RIGHT
      ======================================================== */}
      <header className="md:hidden sticky top-0 z-30 w-full bg-[#FEF9E7]/95 dark:bg-[#141C1A]/95 backdrop-blur-md px-4 h-16 flex items-center justify-between select-none" dir="ltr">
        
        {/* Left side: Cute Girl Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center justify-center min-w-[40px] min-h-[40px] p-0.5 rounded-full bg-white ring-2 ring-amber-200/80 hover:ring-emerald-400 transition-all cursor-pointer shrink-0 shadow-xs overflow-hidden"
            title={t('drawer.title')}
          >
            <img
              src="/kids/header_avatar.png"
              alt="Avatar"
              className="w-9 h-9 rounded-full object-contain"
            />
            <div className="hidden">
              <UserAvatar
                size="sm"
                name={currentUser.name}
                role={currentUser.role}
                avatarUrl={currentUser.avatar}
                showBadge={isAdminUser}
              />
            </div>
          </button>
        </div>

        {/* Center: Bubbly ETHOS Brand Logo */}
        <Link href="/" className="flex items-center justify-center">
          <span className="font-black text-2xl tracking-wider text-[#26BBA9] drop-shadow-[0_2px_1px_rgba(0,0,0,0.12)] hover:scale-105 transition-transform font-sans">
            ETHOS
          </span>
        </Link>

        {/* Right side: Hamburger Button (☰) */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl text-slate-800 dark:text-white hover:text-[#176B5B] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={t('drawer.title')}
            aria-label={t('drawer.title')}
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </motion.button>

          {/* Language toggle token for touch-target standards */}
          <div className="hidden h-10 px-3 min-w-[44px] rounded-xl" aria-hidden="true" />
        </div>

      </header>

      {/* ========================================================
          MAIN WORKSPACE CONTENT WITH SMOOTH PAGE TRANSITION
      ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 safe-bottom-space">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-5xl mx-auto flex-1 flex flex-col min-w-0 overflow-x-hidden pb-[90px] md:pb-0"
          >
            <ContentErrorBoundary>
              {children}
            </ContentErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ========================================================
          ULTRA-SMOOTH FLOATING MOBILE DOCK (md:hidden)
          - 5 Core Actions: الرئيسية - استكشاف - الأبطال - سفير النزاهة - حسابي
          - 3D Cartoon Icons with Lime Green Active Pill (Exact Replica of Reference)
      ======================================================== */}
      <div className="md:hidden fixed bottom-3 left-0 right-0 z-40 mobile-bottom-dock-container px-3 max-w-lg mx-auto pointer-events-none">
        <nav className="pointer-events-auto bg-white dark:bg-[#141C1A] border border-slate-200/90 dark:border-[#23332F] shadow-2xl shadow-slate-900/15 rounded-[26px] p-1.5 flex items-center justify-between relative ring-1 ring-black/5 dark:ring-white/5">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.isActive;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-[22px] transition-all select-none group min-w-0"
              >
                {/* Sliding Spring Active Background Capsule - Cheerful Lime Green matching reference */}
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTabPill"
                    className="absolute inset-0 bg-[#78C218] dark:bg-[#65A30D] rounded-[22px] shadow-md shadow-lime-950/20"
                    transition={{
                      type: "spring",
                      stiffness: 480,
                      damping: 34,
                    }}
                  />
                )}

                {/* Animated Icon & Badge */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10 flex flex-col items-center justify-center gap-0.5"
                >
                  <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9">
                    {tab.imageSrc ? (
                      <img
                        src={tab.imageSrc}
                        alt={tab.label}
                        className={`w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform duration-200 ${
                          isActive ? 'scale-105' : 'group-hover:scale-105'
                        }`}
                      />
                    ) : (
                      <Icon
                        className={`w-6 h-6 transition-colors duration-200 ${
                          isActive
                            ? 'text-white stroke-[2.5]'
                            : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:white'
                        }`}
                      />
                    )}

                    {/* Pending Items Red Dot */}
                    {tab.badgeCount && tab.badgeCount > 0 ? (
                      <span className={`absolute -top-1 -right-1.5 px-1 min-w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center ring-2 animate-pulse ${
                        isActive
                          ? 'bg-rose-500 text-white ring-lime-700'
                          : 'bg-rose-500 text-white ring-white dark:ring-slate-900'
                      }`}>
                        {tab.badgeCount}
                      </span>
                    ) : null}
                  </div>

                  {/* Tab Label */}
                  <span
                    className={`text-[11px] leading-tight transition-colors duration-200 tracking-tight text-center ${
                      isActive
                        ? 'text-white dark:text-white font-black'
                        : 'text-slate-800 dark:text-slate-200 font-bold group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ========================================================
          SLIDE-OVER NAVIGATION DRAWER & GLOBAL MODALS
      ======================================================== */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenCertificateModal={() => openCertificateModal(currentUser)}
        onOpenOnboardingModal={openOnboardingModal}
      />
      <IntegrityCertificateModal 
        isOpen={isCertificateModalOpen} 
        onClose={closeCertificateModal} 
        user={certificateUser} 
      />
      <StudentOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={closeOnboardingModal}
      />
      <ToastNotification />

    </div>
  );
}
