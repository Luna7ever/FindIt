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
import QRModal from '@/components/QRModal';
import CameraQRScannerModal from '@/components/CameraQRScannerModal';
import IntegrityCertificateModal from '@/components/IntegrityCertificateModal';
import NavigationDrawer from '@/components/NavigationDrawer';
import NotificationCenter from '@/components/NotificationCenter';
import ToastNotification from '@/components/ToastNotification';
import UserAvatar from '@/components/UserAvatar';
import TrustBadge from '@/components/TrustBadge';
import { env } from '@/config/env';

interface AppShellProps {
  children: React.ReactNode;
}

interface MobileTabItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
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
  const [showQRModal, setShowQRModal] = useState(false);

  const isAdminUser = canAccessAdmin(currentUser);

  const pendingClaimsCount = getClaimsForMyItems().filter(
    (c) => c.claim.status === 'pending'
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

  // The 5 Core Actions for Clean Mobile Bottom Navigation Dock
  const mobileTabs: MobileTabItem[] = [
    { 
      id: 'home', 
      label: t('nav.home'), 
      href: '/', 
      icon: Home, 
      isActive: isHome 
    },
    { 
      id: 'explore', 
      label: t('nav.explore'), 
      href: '/explore', 
      icon: Compass, 
      isActive: isExplore 
    },
    { 
      id: 'report', 
      label: t('nav.report'), 
      href: '/report', 
      icon: PlusCircle, 
      isActive: isReport 
    },
    { 
      id: 'integrity', 
      label: isAdminUser ? (language === 'en' ? 'Standards' : 'معايير النزاهة') : t('nav.integrity'), 
      href: '/integrity', 
      icon: isAdminUser ? ShieldCheck : Sparkles, 
      isActive: isIntegrity,
      hasPulse: !isAdminUser
    },
    { 
      id: 'my-items', 
      label: t('nav.myItems'), 
      href: '/my-items', 
      icon: Package, 
      isActive: isMyItems,
      badgeCount: pendingClaimsCount
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F4] dark:bg-[#0D1412] flex flex-col md:flex-row text-[#18201D] dark:text-[#F1F5F3] font-sans antialiased selection:bg-emerald-100 dark:selection:bg-emerald-950 selection:text-emerald-900 dark:selection:text-emerald-300 transition-colors duration-200" dir={dir}>
      
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


            {/* ISEF Benchmark Link */}
            <Link
              href="/admin/benchmark"
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                pathname === '/admin/benchmark'
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#122823] dark:to-[#173830] text-[#176B5B] dark:text-[#2DD4BF] font-black border border-emerald-200 dark:border-[#1E463D] shadow-2xs'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2724]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cpu className={`w-4 h-4 ${pathname === '/admin/benchmark' ? 'text-[#176B5B] dark:text-[#2DD4BF]' : 'text-purple-600 dark:text-purple-400'}`} />
                <span>{language === 'en' ? 'ISEF Benchmark' : 'تقييم أيسف العلمي'}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 text-[8px] font-black">
                ISEF
              </span>
            </Link>

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
                <Package className={`w-4 h-4 ${isMyItems ? 'text-[#176B5B] dark:text-[#2DD4BF]' : 'text-[#66706B] dark:text-[#94A39D]'}`} />
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
      <header className="md:hidden sticky top-0 z-30 w-full bg-white/95 dark:bg-[#141C1A]/95 backdrop-blur-md border-b border-[#E4E7E4] dark:border-[#23332F] px-3.5 h-14 flex items-center justify-between shadow-2xs">
        
        {/* Start side: Hamburger Button (☰) & Brand */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-[#F1F3F0] dark:bg-[#1C2724] hover:bg-[#E6F1ED] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white hover:text-[#176B5B] dark:hover:text-[#2DD4BF] flex items-center justify-center border border-[#E4E7E4] dark:border-[#2D3E3A] transition-colors cursor-pointer shadow-2xs shrink-0"
            title={t('drawer.title')}
            aria-label={t('drawer.title')}
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </motion.button>

          {/* Brand */}
          <Link href="/" className="flex items-center gap-1.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#176B5B] to-emerald-600 dark:from-[#2DD4BF] dark:to-emerald-600 flex items-center justify-center shadow-xs shrink-0">
              <Compass className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-black text-base sm:text-lg tracking-tight text-[#18201D] dark:text-white truncate">
                {t('app.name')}
              </span>
              {isAdminUser && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#18201D] dark:bg-white dark:text-[#18201D] text-white text-[8px] font-black shrink-0 hidden xs:inline-block">
                  Admin
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* End side: Quick Theme, Language, Notification & Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Quick Theme Toggle Button (Available on Mobile and Desktop) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
              setTheme(nextTheme);
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2724] hover:bg-[#E6F1ED] dark:hover:bg-[#23332F] text-[#66706B] dark:text-[#2DD4BF] border border-[#E4E7E4] dark:border-[#2D3E3A] flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0"
            title={resolvedTheme === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
            aria-label={resolvedTheme === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#18201D]" />
            )}
          </motion.button>

          {/* Quick Language Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const nextLang = language === 'ar' ? 'en' : 'ar';
              setLanguage(nextLang);
              addToast('Language', nextLang === 'ar' ? 'تم تفعيل اللغة العربية 🇪🇬' : 'Language set to English 🇬🇧', 'success');
            }}
            className="h-10 px-3 min-w-[44px] rounded-xl bg-[#F1F3F0] dark:bg-[#1C2724] hover:bg-[#E6F1ED] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white border border-[#E4E7E4] dark:border-[#2D3E3A] flex items-center justify-center text-[10px] font-black transition-colors cursor-pointer shadow-2xs shrink-0"
            title={language === 'ar' ? 'اللغة الحالية: العربية (انقر للتبديل للإنجليزية)' : 'Current: English (Click to switch to Arabic)'}
            aria-label={language === 'ar' ? 'اللغة الحالية: العربية' : 'Current: English'}
          >
            <span className="hidden sm:inline">{language === 'ar' ? '🇪🇬 عربي' : '🇬🇧 EN'}</span>
            <span className="sm:hidden">{language === 'ar' ? '🇪🇬 AR' : '🇬🇧 EN'}</span>
          </motion.button>

          {/* Notification Center */}
          <div className="shrink-0">
            <NotificationCenter />
          </div>

          {/* Account Profile / Drawer Switcher Icon */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center justify-center min-w-[40px] min-h-[40px] p-0.5 rounded-full bg-[#F1F3F0] dark:bg-[#1C2724] ring-1 ring-[#E4E7E4] dark:ring-[#2D3E3A] hover:ring-emerald-400 transition-all cursor-pointer shrink-0"
            title={t('drawer.title')}
          >
            <UserAvatar
              size="sm"
              name={currentUser.name}
              role={currentUser.role}
              avatarUrl={currentUser.avatar}
              showBadge={isAdminUser}
            />
          </button>
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
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ========================================================
          ULTRA-SMOOTH FLOATING MOBILE DOCK (md:hidden)
          - 5 Core Actions Only: Home, Explore, Report, Integrity, My Items
          - Sliding spring pill layoutId animation
          - Tactile haptic feedback on tap
          - Rich active indicator with spring physics
      ======================================================== */}
      <div className="md:hidden fixed bottom-3 left-0 right-0 z-40 mobile-bottom-dock-container px-3 max-w-lg mx-auto pointer-events-none">
        <nav className="pointer-events-auto bg-white/92 dark:bg-[#141C1A]/92 backdrop-blur-2xl border border-slate-200/90 dark:border-[#23332F] shadow-2xl shadow-slate-900/15 rounded-3xl p-1.5 flex items-center justify-between relative ring-1 ring-black/5 dark:ring-white/5">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.isActive;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all select-none group min-w-0"
              >
                {/* Sliding Spring Active Background Capsule */}
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTabPill"
                    className="absolute inset-0 bg-gradient-to-tr from-[#176B5B] to-emerald-600 dark:from-[#2DD4BF] dark:to-emerald-600 rounded-2xl shadow-md shadow-emerald-950/25"
                    transition={{
                      type: "spring",
                      stiffness: 480,
                      damping: 34,
                    }}
                  />
                )}

                {/* Animated Icon & Badge */}
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex flex-col items-center justify-center gap-0.5"
                >
                  <div className="relative">
                    <Icon
                      className={`w-4.5 h-4.5 transition-colors duration-200 ${
                        isActive
                          ? 'text-white dark:text-slate-950 stroke-[2.5]'
                          : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    />

                    {/* Pending Items Red Dot */}
                    {tab.badgeCount && tab.badgeCount > 0 ? (
                      <span className={`absolute -top-1 -right-1.5 px-1 min-w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center ring-2 animate-pulse ${
                        isActive
                          ? 'bg-rose-500 text-white ring-emerald-700'
                          : 'bg-rose-500 text-white ring-white dark:ring-slate-900'
                      }`}>
                        {tab.badgeCount}
                      </span>
                    ) : null}

                    {/* Integrity Sparkle Pulse */}
                    {tab.hasPulse && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse ${
                        isActive ? 'bg-amber-300' : 'bg-amber-400'
                      }`} />
                    )}
                  </div>

                  {/* Tab Label */}
                  <span
                    className={`text-[10px] leading-none transition-colors duration-200 tracking-tight ${
                      isActive
                        ? 'text-white dark:text-slate-950 font-black'
                        : 'text-slate-600 dark:text-slate-400 font-semibold group-hover:text-slate-900 dark:group-hover:text-white'
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
        onOpenQRScanner={openQRScanner}
        onOpenQRModal={() => setShowQRModal(true)}
        onOpenCertificateModal={() => openCertificateModal(currentUser)}
      />

      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      <CameraQRScannerModal isOpen={isQRScannerOpen} onClose={closeQRScanner} />
      <IntegrityCertificateModal 
        isOpen={isCertificateModalOpen} 
        onClose={closeCertificateModal} 
        user={certificateUser} 
      />
      <ToastNotification />

    </div>
  );
}
