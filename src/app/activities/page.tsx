'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Award, 
  ShieldCheck, 
  Leaf, 
  FlaskConical, 
  Library, 
  Dumbbell, 
  Users, 
  QrCode,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Filter,
  Check,
  Send,
  Lock,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SCHOOL_ACTIVITIES, ACTIVITY_BADGES, SCHOOL_LOCATIONS } from '@/lib/constants';
import { SchoolActivity, ActivityCategory } from '@/types';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { 
  getLocalizedActivity, 
  getLocalizedBadge, 
  getLocalizedLocation 
} from '@/lib/i18n/seedDataTranslations';
import ActivitySubmissionModal from '@/components/ActivitySubmissionModal';

const iconMap: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  FlaskConical: <FlaskConical className="w-5 h-5" />,
  Library: <Library className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  QrCode: <QrCode className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
};

const categoryGradients: Record<ActivityCategory, { light: string; dark: string; border: string; text: string }> = {
  volunteer: {
    light: 'bg-emerald-50 text-emerald-800',
    dark: 'dark:bg-emerald-950/60 dark:text-[#2DD4BF]',
    border: 'border-emerald-200 dark:border-emerald-900/60',
    text: 'text-[#176B5B] dark:text-[#2DD4BF]',
  },
  integrity: {
    light: 'bg-teal-50 text-teal-800',
    dark: 'dark:bg-teal-950/60 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-900/60',
    text: 'text-teal-700 dark:text-teal-300',
  },
  environment: {
    light: 'bg-green-50 text-green-800',
    dark: 'dark:bg-green-950/60 dark:text-green-300',
    border: 'border-green-200 dark:border-green-900/60',
    text: 'text-green-700 dark:text-green-300',
  },
  academic_support: {
    light: 'bg-blue-50 text-blue-800',
    dark: 'dark:bg-blue-950/60 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-900/60',
    text: 'text-blue-700 dark:text-blue-300',
  },
};

export default function SchoolActivitiesPage() {
  const { 
    currentUser, 
    activitySubmissions, 
    getUserEarnedBadges, 
    language, 
    dir, 
    t 
  } = useApp();

  const isAdmin = canAccessAdmin(currentUser);

  const [activeTab, setActiveTab] = useState<ActivityCategory | 'all'>('all');
  const [selectedActivity, setSelectedActivity] = useState<SchoolActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Student specific stats
  const userSubmissions = useMemo(() => {
    return activitySubmissions.filter((s) => s.userId === currentUser.id);
  }, [activitySubmissions, currentUser.id]);

  const approvedSubmissions = useMemo(() => {
    return userSubmissions.filter((s) => s.status === 'approved');
  }, [userSubmissions]);

  const totalPointsFromActivities = useMemo(() => {
    return approvedSubmissions.reduce((sum, s) => sum + s.awardedPoints, 0);
  }, [approvedSubmissions]);

  const earnedBadges = useMemo(() => {
    return getUserEarnedBadges(currentUser.id);
  }, [getUserEarnedBadges, currentUser.id]);

  // Admin specific stats
  const totalSchoolSubmissions = activitySubmissions.length;
  const pendingSchoolSubmissions = useMemo(() => {
    return activitySubmissions.filter((s) => s.status === 'pending').length;
  }, [activitySubmissions]);

  const approvedSchoolSubmissions = useMemo(() => {
    return activitySubmissions.filter((s) => s.status === 'approved').length;
  }, [activitySubmissions]);

  const filteredActivities = useMemo(() => {
    if (activeTab === 'all') return SCHOOL_ACTIVITIES;
    return SCHOOL_ACTIVITIES.filter((a) => a.category === activeTab);
  }, [activeTab]);

  const handleOpenActivity = (act: SchoolActivity) => {
    if (isAdmin) return;
    setSelectedActivity(act);
    setIsModalOpen(true);
  };

  const isRtl = dir === 'rtl';

  return (
    <div className="px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full text-start text-[#18201D] dark:text-[#F1F5F3]" dir={dir}>
      
      {/* ========================================================
          1. HERO & MOTIVATIONAL HEADER
      ======================================================== */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] text-xs font-bold border border-emerald-200/50 dark:border-[#1E463D]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {isAdmin 
                ? (language === 'en' ? 'Administrative Oversight Mode 🏛️' : 'وضع الإشراف والمتابعة الإدارية 🏛️')
                : t('activities.weeklyQuest')}
            </span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            • {isAdmin 
                ? (language === 'en' ? 'Principal & Custody Committee' : 'مديرة المدرسة ورئيسة لجنة الأمانات')
                : t('activities.activeNow')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#18201D] dark:text-white tracking-tight">
              {isAdmin 
                ? (language === 'en' ? 'School Activities & Civic Engagement' : 'دليل الأنشطة المدرسية والمشاركة المجتمعية')
                : t('activities.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#66706B] dark:text-[#94A39D] mt-1 max-w-2xl leading-relaxed">
              {isAdmin
                ? (language === 'en'
                    ? 'Official catalog of approved school activities. Review, supervise, and certify student volunteer submissions directly in the Admin Panel.'
                    : 'دليل الأنشطة المدرسية المعيارية لتعزيز الأمانة. بصفتكِ مديرة المدرسة، يمكنكِ متابعة واعتماد توثيقات ومشاركات الطلاب من لوحة الإدارة.')
                : t('activities.subtitle')}
            </p>
          </div>

          {isAdmin ? (
            <Link
              href="/admin?tab=activities"
              className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{language === 'en' ? 'Review Student Submissions 📋' : 'مراجعة واعتماد مشاركات الطلاب 📋'}</span>
            </Link>
          ) : (
            <Link
              href="/leaderboard"
              className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-amber-950 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>{t('nav.leaderboard')} 🏆</span>
            </Link>
          )}
        </div>
      </section>

      {/* ========================================================
          2. PROGRESS METRICS BANNER (ROLE-AWARE)
      ======================================================== */}
      {isAdmin ? (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Admin Metric 1: Standard Activities */}
          <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Standard Activities' : 'الأنشطة المعيارية المعتمدة'}
              </span>
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-[#2DD4BF]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#18201D] dark:text-white">
                {SCHOOL_ACTIVITIES.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {language === 'en' ? 'Official Quests' : 'نشاطاً رسمياً'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1C2B27] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 dark:bg-[#2DD4BF] rounded-full w-full" />
            </div>
          </div>

          {/* Admin Metric 2: Total Student Submissions */}
          <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Total Student Submissions' : 'إجمالي مشاركات الطلاب'}
              </span>
              <Users className="w-4.5 h-4.5 text-teal-600 dark:text-teal-300" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#176B5B] dark:text-[#2DD4BF]">
                +{totalSchoolSubmissions}
              </span>
              <span className="text-xs text-[#176B5B] dark:text-[#2DD4BF] font-bold">
                {language === 'en' ? 'Submissions' : 'مشاركة موثقة'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === 'en' ? 'Across all secondary school grades' : 'من كافة صفوف وفصول المدرسة'}
            </p>
          </div>

          {/* Admin Metric 3: Pending Review */}
          <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Pending Admin Review' : 'بانتظار الاعتماد الإداري'}
              </span>
              <Clock className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {pendingSchoolSubmissions}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {language === 'en' ? 'Pending' : 'طلب معلق'}
              </span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              {language === 'en' ? 'Available in Admin activities tab' : 'جاهزة للمراجعة في لوحة الإدارة'}
            </p>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Student Metric 1: Completed Quests */}
          <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('activities.completedCount')}</span>
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-[#2DD4BF]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#18201D] dark:text-white">
                {approvedSubmissions.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                / {SCHOOL_ACTIVITIES.length} {language === 'en' ? 'Quests' : 'مهام'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1C2B27] rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 dark:bg-[#2DD4BF] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (approvedSubmissions.length / SCHOOL_ACTIVITIES.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* Student Metric 2: Earned Activity Points */}
          <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('activities.totalEarnedPoints')}</span>
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#176B5B] dark:text-[#2DD4BF]">
                +{totalPointsFromActivities}
              </span>
              <span className="text-xs text-[#176B5B] dark:text-[#2DD4BF] font-bold">
                {t('app.points')}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === 'en' ? 'Contributes to Integrity Trust Tier' : 'تزيد مباشرة من رتبة أمانتك وشهادتك'}
            </p>
          </div>

          {/* Student Metric 3: Active Badges */}
          <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('activities.badgesTitle')}</span>
              <Award className="w-4.5 h-4.5 text-teal-600 dark:text-teal-300" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-300">
                {earnedBadges.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                / {ACTIVITY_BADGES.length} {language === 'en' ? 'Badges' : 'شارات'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-base">
              {earnedBadges.map((b) => (
                <span key={b.id} title={b.title}>{b.icon}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          3. ACTIVITY HONOR BADGES RIBBON
      ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#18201D] dark:text-white">
              {isAdmin
                ? (language === 'en' ? 'Official Schoolwide Badges' : 'شارات التكريم المعتمدة للطلاب')
                : t('activities.badgesTitle')}
            </h2>
            <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
              {isAdmin
                ? (language === 'en' ? 'Badges awarded to students reaching integrity milestones' : 'أوسمة الشرف المعتمدة الممنوحة للطلاب عند تحقيق مستويات الأمانة والأنشطة')
                : t('activities.badgesDesc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {ACTIVITY_BADGES.map((rawBadge) => {
            const badge = getLocalizedBadge(rawBadge, language);
            const isEarned = !isAdmin && earnedBadges.some((b) => b.id === badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-start space-y-2 relative overflow-hidden ${
                  isEarned
                    ? 'bg-gradient-to-tr from-amber-50 to-teal-50/50 dark:from-[#172622] dark:to-[#1C332C] border-amber-300 dark:border-[#2DD4BF]/40 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-[#15201D]/60 border-slate-200 dark:border-[#263834] opacity-85'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{badge.icon}</span>
                  {isAdmin ? (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C2B27] text-slate-600 dark:text-slate-300 text-[9px] font-bold flex items-center gap-0.5">
                      <Award className="w-2.5 h-2.5 text-amber-500" />
                      {badge.requiredPoints} {t('app.pts')}
                    </span>
                  ) : isEarned ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2DD4BF] text-[9px] font-black flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      {language === 'en' ? 'Earned' : 'مكتسبة'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C2B27] text-slate-500 dark:text-slate-400 text-[9px] font-bold flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      {badge.requiredPoints} {t('app.pts')}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#18201D] dark:text-white leading-tight">{badge.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          4. CATEGORY FILTER TABS
      ======================================================== */}
      <section className="space-y-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#141C1A] rounded-2xl overflow-x-auto whitespace-nowrap scrollbar-none border border-slate-200/80 dark:border-[#23332F]">
          {[
            { id: 'all', label: t('activities.tabAll'), icon: Sparkles },
            { id: 'volunteer', label: t('activities.tabVolunteer'), icon: Users },
            { id: 'integrity', label: t('activities.tabIntegrity'), icon: ShieldCheck },
            { id: 'environment', label: t('activities.tabEnvironment'), icon: Leaf },
            { id: 'academic_support', label: t('activities.tabAcademic'), icon: FlaskConical },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-[#1C2B27] text-[#176B5B] dark:text-[#2DD4BF] shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            5. ACTIVITY QUEST CARDS GRID
        ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredActivities.map((rawActivity) => {
            const activity = getLocalizedActivity(rawActivity, language);
            const targetLoc = SCHOOL_LOCATIONS.find((l) => l.id === activity.targetLocationId);
            const localizedLoc = targetLoc ? getLocalizedLocation(targetLoc, language) : null;
            const styling = categoryGradients[activity.category];

            // Check if user submitted this activity
            const submission = userSubmissions.find((s) => s.activityId === activity.id);
            const isApproved = submission?.status === 'approved';
            const isPending = submission?.status === 'pending';

            return (
              <div
                key={activity.id}
                className="app-card p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] rounded-3xl space-y-3.5 text-start flex flex-col justify-between transition-all duration-200 hover:shadow-md"
              >
                <div className="space-y-2.5">
                  
                  {/* Top metadata badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${styling.light} ${styling.dark}`}>
                        {iconMap[activity.iconName] || <Sparkles className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                          {activity.frequency === 'daily' ? t('activities.frequencyDaily') : t('activities.frequencyWeekly')}
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black flex items-center gap-1 shadow-2xs shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>+{activity.points} {t('app.points')}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#18201D] dark:text-white leading-tight">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>

                  {/* Badges & Location chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                    {localizedLoc && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#176B5B] dark:text-[#2DD4BF]" />
                        <span className="truncate max-w-[140px]">{localizedLoc.name}</span>
                      </span>
                    )}

                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>~{activity.estimatedMinutes} {t('activities.minutes')}</span>
                    </span>
                  </div>

                </div>

                {/* Card Action / Status Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#23332F]">
                  {isAdmin ? (
                    <Link
                      href="/admin?tab=activities"
                      className="w-full py-2.5 sm:py-3 min-h-[42px] px-4 rounded-xl bg-[#E6F1ED] dark:bg-[#122823] hover:bg-[#d8e9e3] dark:hover:bg-[#1a3831] text-[#176B5B] dark:text-[#2DD4BF] border border-[#176B5B]/30 dark:border-[#1E463D] font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'en' ? 'Manage Submissions in Admin Panel' : 'مراجعة واعتماد المشاركات في الإدارة'}</span>
                    </Link>
                  ) : isApproved ? (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-[#122823] text-emerald-800 dark:text-[#2DD4BF] border border-emerald-200 dark:border-[#1E463D] font-bold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#2DD4BF]" />
                      <span>{t('activities.statusCompleted')} (+{activity.points} {t('app.pts')})</span>
                    </div>
                  ) : isPending ? (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>{t('activities.statusPending')}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenActivity(rawActivity)}
                      className="w-full py-2.5 sm:py-3 min-h-[42px] px-4 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {activity.verificationType === 'instant' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('activities.completeInstant')}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{t('activities.submitSupervised')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================
          6. ACTIVITY SUBMISSION MODAL (STUDENTS ONLY)
      ======================================================== */}
      {!isAdmin && (
        <ActivitySubmissionModal
          activity={selectedActivity}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedActivity(null);
          }}
        />
      )}

    </div>
  );
}
