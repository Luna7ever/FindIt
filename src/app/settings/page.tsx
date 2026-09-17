'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  RefreshCw, 
  Check, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Save, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Info, 
  ArrowRight,
  Database,
  Award,
  Layers,
  CheckCircle2,
  Trash2,
  KeyRound,
  Globe,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { AppLanguage, AppTheme } from '@/types';
import UserAvatar from '@/components/UserAvatar';
import TrustBadge from '@/components/TrustBadge';

interface UserSettingsState {
  publicLeaderboard: boolean;
  maskContactInfo: boolean;
  matchAlerts: boolean;
  integrityReminders: boolean;
  handoverUpdates: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  smoothAnimations: boolean;
  requireDualConfirmation: boolean;
  defaultPin: string;
}

const DEFAULT_SETTINGS: UserSettingsState = {
  publicLeaderboard: true,
  maskContactInfo: true,
  matchAlerts: true,
  integrityReminders: true,
  handoverUpdates: true,
  soundEffects: true,
  hapticFeedback: true,
  smoothAnimations: true,
  requireDualConfirmation: true,
  defaultPin: '1234',
};

const SETTINGS_STORAGE_KEY = 'findit_user_settings_v4';

export default function SettingsPage() {
  const { 
    currentUser, 
    users, 
    setCurrentUserById, 
    currentUserTrustTier, 
    items, 
    claims, 
    integrityAttempts, 
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

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'display' | 'demo'>('display');
  const [settings, setSettings] = useState<UserSettingsState>(DEFAULT_SETTINGS);
  const [showPin, setShowPin] = useState(false);
  const [editingPin, setEditingPin] = useState(false);
  const [pinInput, setPinInput] = useState('1234');
  const [isSaved, setIsSaved] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const isAdminUser = canAccessAdmin(currentUser);

  // Load settings on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
        setPinInput(JSON.parse(saved).defaultPin || '1234');
      }
    } catch {
      // Use defaults
    }
  }, []);

  const updateSetting = <K extends keyof UserSettingsState>(key: K, value: UserSettingsState[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSavePin = () => {
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      addToast(t('settings.securityTitle'), t('settings.pinError'), 'error');
      return;
    }
    updateSetting('defaultPin', pinInput);
    setEditingPin(false);
    addToast(t('settings.securityTitle'), t('settings.pinSuccess'), 'success');
  };

  const handleResetAllData = () => {
    resetDemoData();
    setSettings(DEFAULT_SETTINGS);
    setPinInput('1234');
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {}
    setIsResetConfirmOpen(false);
    addToast(t('settings.resetBtn'), t('settings.resetSuccess'), 'success');
  };

  return (
    <div className="w-full px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 text-[#18201D] dark:text-[#F0F4F2]" dir={dir}>
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7E4] dark:border-[#263834] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#66706B] dark:text-[#94A39E] mb-1.5">
            <Link href="/" className="hover:text-[#176B5B] dark:hover:text-[#2DD4BF] transition-colors">
              {t('settings.breadcrumbHome')}
            </Link>
            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            <span className="text-[#18201D] dark:text-[#F0F4F2]">{t('settings.breadcrumbCurrent')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#18201D] dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#176B5B] to-emerald-600 dark:from-[#2DD4BF] dark:to-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </span>
            {t('settings.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#66706B] dark:text-[#94A39E] font-medium mt-1">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Live Saved Status Indicator */}
        <div className="flex items-center gap-2">
          {isSaved && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('settings.autoSaved')}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#E4E7E4] dark:border-[#263834]">
        {[
          { id: 'display', label: t('settings.tabDisplay'), icon: Globe },
          { id: 'profile', label: t('settings.tabProfile'), icon: User },
          { id: 'notifications', label: t('settings.tabNotifications'), icon: Bell },
          { id: 'security', label: t('settings.tabSecurity'), icon: Lock },
          { id: 'demo', label: t('settings.tabDemo'), icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
                isActive
                  ? 'text-[#176B5B] dark:text-[#2DD4BF] bg-[#E6F1ED] dark:bg-[#122B25] shadow-2xs font-black'
                  : 'text-[#66706B] dark:text-[#94A39E] hover:text-[#18201D] dark:hover:text-white hover:bg-[#F1F3F0] dark:hover:bg-[#1C2B27]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#176B5B] dark:text-[#2DD4BF]' : 'text-[#66706B] dark:text-[#94A39E]'}`} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#176B5B] dark:bg-[#2DD4BF] rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">

          {/* TAB: Appearance, Language & Theme (Display) */}
          {activeTab === 'display' && (
            <motion.div 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-5"
            >
              {/* 1. Language Switcher Card */}
              <div className="bg-white dark:bg-[#15201D] p-5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E7E4] dark:border-[#263834] pb-3">
                  <h3 className="font-black text-sm text-[#18201D] dark:text-white flex items-center gap-2">
                    <Globe className="w-4.5 h-4.5 text-[#176B5B] dark:text-[#2DD4BF]" />
                    {t('settings.languageTitle')}
                  </h3>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {language === 'ar' ? 'العربية (RTL)' : 'English (LTR)'}
                  </span>
                </div>
                <p className="text-xs text-[#66706B] dark:text-[#94A39E]">
                  {t('settings.languageDesc')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Arabic Button */}
                  <button
                    onClick={() => {
                      setLanguage('ar');
                      addToast('اللغة', 'تم تغيير لغة الواجهة إلى العربية', 'success');
                    }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      language === 'ar'
                        ? 'bg-[#E6F1ED] dark:bg-[#122B25] border-[#176B5B] dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                        : 'bg-slate-50 dark:bg-[#1C2B27] border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233530]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇪🇬</span>
                      <div className="text-start">
                        <p className="font-black text-xs">العربية (مصر)</p>
                        <p className="text-[10px] text-[#66706B] dark:text-[#94A39E]">Arabic (Egypt - RTL)</p>
                      </div>
                    </div>
                    {language === 'ar' && <CheckCircle2 className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />}
                  </button>

                  {/* English Button */}
                  <button
                    onClick={() => {
                      setLanguage('en');
                      addToast('Language', 'Interface language switched to English', 'success');
                    }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      language === 'en'
                        ? 'bg-[#E6F1ED] dark:bg-[#122B25] border-[#176B5B] dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                        : 'bg-slate-50 dark:bg-[#1C2B27] border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233530]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇬🇧</span>
                      <div className="text-start">
                        <p className="font-black text-xs">English</p>
                        <p className="text-[10px] text-[#66706B] dark:text-[#94A39E]">English (LTR)</p>
                      </div>
                    </div>
                    {language === 'en' && <CheckCircle2 className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />}
                  </button>
                </div>
              </div>

              {/* 2. Theme / Dark Mode Switcher Card */}
              <div className="bg-white dark:bg-[#15201D] p-5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E7E4] dark:border-[#263834] pb-3">
                  <h3 className="font-black text-sm text-[#18201D] dark:text-white flex items-center gap-2">
                    {resolvedTheme === 'dark' ? (
                      <Moon className="w-4.5 h-4.5 text-[#2DD4BF]" />
                    ) : (
                      <Sun className="w-4.5 h-4.5 text-amber-500" />
                    )}
                    {t('settings.themeTitle')}
                  </h3>
                  <span className="text-[10px] bg-slate-100 dark:bg-[#1C2B27] text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#263834]">
                    {theme === 'system' ? t('settings.themeSystem') : theme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}
                  </span>
                </div>
                <p className="text-xs text-[#66706B] dark:text-[#94A39E]">
                  {t('settings.themeDesc')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* System Auto Button */}
                  <button
                    onClick={() => {
                      setTheme('system');
                      addToast(t('settings.themeTitle'), t('settings.themeSystem'), 'info');
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center ${
                      theme === 'system'
                        ? 'bg-[#E6F1ED] dark:bg-[#122B25] border-[#176B5B] dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                        : 'bg-slate-50 dark:bg-[#1C2B27] border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233530]'
                    }`}
                  >
                    <Laptop className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-xs">{t('settings.themeSystem')}</p>
                      <p className="text-[9px] text-[#66706B] dark:text-[#94A39E]">Auto Sync</p>
                    </div>
                  </button>

                  {/* Light Mode Button */}
                  <button
                    onClick={() => {
                      setTheme('light');
                      addToast(t('settings.themeTitle'), t('settings.themeLight'), 'info');
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center ${
                      theme === 'light'
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-900 dark:text-amber-300 font-black shadow-2xs'
                        : 'bg-slate-50 dark:bg-[#1C2B27] border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233530]'
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-bold text-xs">{t('settings.themeLight')}</p>
                      <p className="text-[9px] text-[#66706B] dark:text-[#94A39E]">Bright View</p>
                    </div>
                  </button>

                  {/* Dark Mode Button */}
                  <button
                    onClick={() => {
                      setTheme('dark');
                      addToast(t('settings.themeTitle'), t('settings.themeDark'), 'info');
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center ${
                      theme === 'dark'
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-black shadow-2xs'
                        : 'bg-slate-50 dark:bg-[#1C2B27] border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233530]'
                    }`}
                  >
                    <Moon className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="font-bold text-xs">{t('settings.themeDark')}</p>
                      <p className="text-[9px] text-[#66706B] dark:text-[#94A39E]">Obsidian Emerald</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Micro-interactions & Animations */}
              <div className="bg-white dark:bg-[#15201D] p-5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-4">
                <h3 className="font-black text-sm text-[#18201D] dark:text-white flex items-center gap-2 border-b border-[#E4E7E4] dark:border-[#263834] pb-3">
                  <Smartphone className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                  {t('settings.displayTitle')}
                </h3>

                <div className="divide-y divide-[#E4E7E4] dark:divide-[#263834] text-xs">
                  {/* Smooth Animations */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#18201D] dark:text-white">
                        {t('settings.animations')}
                      </p>
                      <p className="text-[#66706B] dark:text-[#94A39E] text-[11px]">
                        {t('settings.animationsDesc')}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSetting('smoothAnimations', !settings.smoothAnimations)}
                      className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settings.smoothAnimations ? 'bg-[#176B5B] dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                        settings.smoothAnimations ? (dir === 'rtl' ? 'translate-x-[-1.35rem]' : 'translate-x-[1.35rem]') : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Haptic Feedback */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#18201D] dark:text-white">
                        {t('settings.haptics')}
                      </p>
                      <p className="text-[#66706B] dark:text-[#94A39E] text-[11px]">
                        {t('settings.hapticsDesc')}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSetting('hapticFeedback', !settings.hapticFeedback)}
                      className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settings.hapticFeedback ? 'bg-[#176B5B] dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                        settings.hapticFeedback ? (dir === 'rtl' ? 'translate-x-[-1.35rem]' : 'translate-x-[1.35rem]') : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: Profile & Privacy */}
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-5"
            >
              {/* Profile Card */}
              <div className="bg-white dark:bg-[#15201D] p-5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E7E4] dark:border-[#263834] pb-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      size="lg"
                      name={currentUser.name}
                      role={currentUser.role}
                      avatarUrl={currentUser.avatar}
                      showBadge={isAdminUser}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-base text-[#18201D] dark:text-white">
                          {currentUser.name}
                        </h2>
                        {isAdminUser ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#18201D] text-white text-[9px] font-black">
                            {t('app.adminBadge')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-[#E6F1ED] dark:bg-[#122B25] text-[#176B5B] dark:text-[#2DD4BF] text-[9px] font-black">
                            {t('app.studentBadge')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#66706B] dark:text-[#94A39E] mt-0.5">{currentUser.email}</p>
                    </div>
                  </div>
                  {isAdminUser ? (
                    <span className="text-xs font-black text-[#176B5B] dark:text-[#2DD4BF] bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                      🏛️ {language === 'en' ? 'School Principal' : 'إدارة المدرسة والاعتماد'}
                    </span>
                  ) : (
                    <TrustBadge tier={currentUserTrustTier} size="md" />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] border border-[#E4E7E4] dark:border-[#2D3E3A]">
                    <span className="text-[#66706B] dark:text-[#94A39D] block text-[11px] mb-1">{t('settings.gradeLabel')}</span>
                    <span className="font-bold text-[#18201D] dark:text-white">{currentUser.grade}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] border border-[#E4E7E4] dark:border-[#2D3E3A]">
                    <span className="text-[#66706B] dark:text-[#94A39D] block text-[11px] mb-1">
                      {isAdminUser ? (language === 'en' ? 'Administrative Role' : 'الصفة الإدارية') : t('settings.pointsLabel')}
                    </span>
                    <span className="font-black text-[#176B5B] dark:text-[#2DD4BF]">
                      {isAdminUser ? (language === 'en' ? 'Certified Authority 🏛️' : 'جهة الاعتماد والتوثيق 🏛️') : `✨ ${currentUser.goodwillPoints || 0} ${t('nav.points')}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy Toggles */}
              <div className="bg-white dark:bg-[#15201D] p-5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-4">
                <h3 className="font-black text-sm text-[#18201D] dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                  {t('settings.privacyTitle')}
                </h3>

                <div className="divide-y divide-[#E4E7E4] dark:divide-[#263834] text-xs">
                  {/* Toggle 1: Public Leaderboard */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#18201D] dark:text-white">
                        {t('settings.publicLeaderboard')}
                      </p>
                      <p className="text-[#66706B] dark:text-[#94A39E] text-[11px]">
                        {t('settings.publicLeaderboardDesc')}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSetting('publicLeaderboard', !settings.publicLeaderboard)}
                      className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settings.publicLeaderboard ? 'bg-[#176B5B] dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                        settings.publicLeaderboard ? (dir === 'rtl' ? 'translate-x-[-1.35rem]' : 'translate-x-[1.35rem]') : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 2: Mask Contact Info */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#18201D] dark:text-white">
                        {t('settings.maskContact')}
                      </p>
                      <p className="text-[#66706B] dark:text-[#94A39E] text-[11px]">
                        {t('settings.maskContactDesc')}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSetting('maskContactInfo', !settings.maskContactInfo)}
                      className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        settings.maskContactInfo ? 'bg-[#176B5B] dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                        settings.maskContactInfo ? (dir === 'rtl' ? 'translate-x-[-1.35rem]' : 'translate-x-[1.35rem]') : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: Smart Notifications */}
          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white dark:bg-[#15201D] p-5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E4E7E4] dark:border-[#263834] pb-3">
                <h3 className="font-black text-sm text-[#18201D] dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                  {t('settings.notificationsTitle')}
                </h3>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  {t('settings.liveUpdate')}
                </span>
              </div>

              <div className="divide-y divide-[#E4E7E4] dark:divide-[#263834] text-xs">
                {/* Match Alerts */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#18201D] dark:text-white">
                      {t('settings.matchAlerts')}
                    </p>
                    <p className="text-[#66706B] dark:text-[#94A39E] text-[11px]">
                      {t('settings.matchAlertsDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('matchAlerts', !settings.matchAlerts)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      settings.matchAlerts ? 'bg-[#176B5B] dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                      settings.matchAlerts ? (dir === 'rtl' ? 'translate-x-[-1.35rem]' : 'translate-x-[1.35rem]') : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Integrity Weekly Challenge */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#18201D] dark:text-white">
                      {t('settings.integrityReminders')}
                    </p>
                    <p className="text-[#66706B] dark:text-[#94A39E] text-[11px]">
                      {t('settings.integrityRemindersDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('integrityReminders', !settings.integrityReminders)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      settings.integrityReminders ? 'bg-[#176B5B] dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                      settings.integrityReminders ? (dir === 'rtl' ? 'translate-x-[-1.35rem]' : 'translate-x-[1.35rem]') : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Handover Updates */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#18201D] dark:text-white">
                      {t('settings.handoverUpdates')}
                    </p>
                    <p className="text-[#66706B] dark:text-[#94A39E] text-[11px]">
                      {t('settings.handoverUpdatesDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('handoverUpdates', !settings.handoverUpdates)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      settings.handoverUpdates ? 'bg-[#176B5B] dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                      settings.handoverUpdates ? (dir === 'rtl' ? 'translate-x-[-1.35rem]' : 'translate-x-[1.35rem]') : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Sound Effects */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#18201D] dark:text-white">
                      {t('settings.soundFx')}
                    </p>
                    <p className="text-[#66706B] dark:text-[#94A39E] text-[11px]">
                      {t('settings.soundFxDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      settings.soundEffects ? 'bg-[#176B5B] dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                      settings.soundEffects ? (dir === 'rtl' ? 'translate-x-[-1.35rem]' : 'translate-x-[1.35rem]') : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: Security & PIN */}
          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-5"
            >
              {/* Handover PIN Management */}
              <div className="bg-white dark:bg-[#15201D] p-5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E7E4] dark:border-[#263834] pb-3">
                  <div>
                    <h3 className="font-black text-sm text-[#18201D] dark:text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                      {t('settings.securityTitle')}
                    </h3>
                    <p className="text-[11px] text-[#66706B] dark:text-[#94A39E] mt-0.5">
                      {t('settings.securityDesc')}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[10px] font-bold">
                    {t('settings.antiFraud')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/50 dark:from-[#122B25] dark:to-[#173830] border border-emerald-200/80 dark:border-[#1E463D] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1C2B27] border border-emerald-300 dark:border-emerald-700 flex items-center justify-center font-mono font-black text-xl text-[#176B5B] dark:text-[#2DD4BF] shadow-2xs">
                      {showPin ? settings.defaultPin : '••••'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#18201D] dark:text-white block">
                        {t('settings.pinDefaultLabel')}
                      </span>
                      <span className="text-[10px] text-[#66706B] dark:text-[#94A39E]">
                        {t('settings.pinDefaultDesc')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setShowPin(!showPin)}
                      className="p-2 rounded-xl bg-white dark:bg-[#1C2B27] border border-[#E4E7E4] dark:border-[#2D3E3A] text-[#66706B] dark:text-[#94A39E] hover:text-[#18201D] dark:hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      title={showPin ? 'إخفاء الرمز' : 'إظهار الرمز'}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingPin(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 text-xs font-bold hover:bg-[#125648] dark:hover:bg-[#14B8A6] transition-colors cursor-pointer shadow-xs"
                    >
                      {t('settings.editPin')}
                    </button>
                  </div>
                </div>

                {/* Edit PIN Modal / Inline Form */}
                {editingPin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#18201D] dark:text-white">{t('settings.enterNewPin')}</span>
                      <button onClick={() => setEditingPin(false)} className="text-xs text-[#66706B] dark:text-[#94A39E] hover:underline">
                        {t('settings.cancel')}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={4}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-32 px-3 py-2 text-center text-lg font-mono font-black tracking-widest bg-white dark:bg-[#15201D] border border-slate-300 dark:border-[#2D3E3A] text-[#18201D] dark:text-white rounded-xl focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:outline-none"
                        placeholder="1234"
                      />
                      <button
                        onClick={handleSavePin}
                        className="px-4 py-2 bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 text-xs font-bold rounded-xl hover:bg-[#125648] dark:hover:bg-[#14B8A6] transition-colors cursor-pointer"
                      >
                        {t('settings.savePin')}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Dual Confirmation Toggle */}
                <div className="py-3 flex items-center justify-between gap-4 border-t border-[#E4E7E4] dark:border-[#263834] text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#18201D] dark:text-white">
                      {t('settings.dualConfirm')}
                    </p>
                    <p className="text-[#66706B] dark:text-[#94A39E] text-[11px]">
                      {t('settings.dualConfirmDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('requireDualConfirmation', !settings.requireDualConfirmation)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      settings.requireDualConfirmation ? 'bg-[#176B5B] dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                      settings.requireDualConfirmation ? (dir === 'rtl' ? 'translate-x-[-1.35rem]' : 'translate-x-[1.35rem]') : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: Demo Controls */}
          {activeTab === 'demo' && (
            <motion.div 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-5"
            >
              {/* Account Switcher */}
              <div className="bg-white dark:bg-[#15201D] p-5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-4">
                <h3 className="font-black text-sm text-[#18201D] dark:text-white flex items-center gap-2 border-b border-[#E4E7E4] dark:border-[#263834] pb-3">
                  <User className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                  {t('settings.activeAccount')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserById(u.id);
                        addToast(t('settings.accountSwitched'), `${t('settings.nowBrowsingAs')} ${u.name}`, 'info');
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-start transition-all cursor-pointer ${
                        currentUser.id === u.id
                          ? 'bg-[#E6F1ED] dark:bg-[#122B25] border-emerald-300 dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF] shadow-2xs'
                          : 'bg-slate-50 dark:bg-[#1C2B27] border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233530]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          size="sm"
                          name={u.name}
                          role={u.role}
                          avatarUrl={u.avatar}
                        />
                        <div>
                          <p className="font-bold text-xs">{u.name}</p>
                          <p className="text-[10px] text-[#66706B] dark:text-[#94A39E]">{u.role === 'admin' ? t('app.adminBadge') : u.grade}</p>
                        </div>
                      </div>
                      {currentUser.id === u.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Reset Section */}
              <div className="bg-white dark:bg-[#15201D] p-5 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
                  <Trash2 className="w-5 h-5" />
                  <h3 className="font-black text-sm">
                    {t('settings.resetSystem')}
                  </h3>
                </div>
                <p className="text-xs text-[#66706B] dark:text-[#94A39E] leading-relaxed">
                  {t('settings.resetSystemDesc')}
                </p>

                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('settings.resetBtn')}</span>
                </button>
              </div>
            </motion.div>
          )}

        </div>

        {/* Sidebar Info & Stats Widget (1 Column) */}
        <div className="space-y-5">
          
          {/* System Storage Stats */}
          <div className="bg-white dark:bg-[#15201D] p-4.5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-3">
            <h4 className="font-black text-xs text-[#18201D] dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
              {t('settings.statsTitle')}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#1C2B27]">
                <span className="text-[#66706B] dark:text-[#94A39E]">{t('settings.totalItems')}</span>
                <span className="font-bold text-[#18201D] dark:text-white">{items.length}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#1C2B27]">
                <span className="text-[#66706B] dark:text-[#94A39E]">{t('settings.totalClaims')}</span>
                <span className="font-bold text-[#18201D] dark:text-white">{claims.length}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#1C2B27]">
                <span className="text-[#66706B] dark:text-[#94A39E]">{t('settings.totalScenarios')}</span>
                <span className="font-bold text-[#176B5B] dark:text-[#2DD4BF]">{integrityAttempts.length}</span>
              </div>
            </div>
          </div>

          {/* School Integrity Trust Info */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white dark:from-[#122B25] dark:via-[#16352E] dark:to-[#15201D] p-4.5 rounded-2xl border border-emerald-200/80 dark:border-[#1E463D] shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-300">
              <Award className="w-4.5 h-4.5 text-emerald-700 dark:text-[#2DD4BF]" />
              <h4 className="font-black text-xs">{t('settings.standardTitle')}</h4>
            </div>
            <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed">
              {t('settings.standardDesc')}
            </p>
          </div>

        </div>

      </div>

      {/* Confirmation Modal for Full Reset */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetConfirmOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-[#15201D] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-200 dark:border-rose-900/60 z-10 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-[#18201D] dark:text-white">
                  {t('settings.resetConfirmTitle')}
                </h3>
                <p className="text-xs text-[#66706B] dark:text-[#94A39E] mt-1.5 leading-relaxed">
                  {t('settings.resetConfirmDesc')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <button
                  onClick={handleResetAllData}
                  className="w-full sm:flex-1 py-2.5 min-h-[40px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center"
                >
                  {t('settings.resetConfirmBtn')}
                </button>
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="w-full sm:flex-1 py-2.5 min-h-[40px] rounded-xl bg-slate-100 dark:bg-[#1C2B27] hover:bg-slate-200 dark:hover:bg-[#253934] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                >
                  {t('settings.resetCancelBtn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
