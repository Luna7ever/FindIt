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
  SlidersHorizontal,
  Volume2,
  Trophy,
  Star,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
import AudioVoiceButton from '@/components/AudioVoiceButton';
import { speakKidsText } from '@/lib/kidsVoice';

const iconMap: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  FlaskConical: <FlaskConical className="w-5 h-5" />,
  Library: <Library className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  QrCode: <QrCode className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
};

const KIDS_ACTIVITY_CONFIG: Record<string, {
  shortTitleAr: string;
  shortTitleEn: string;
  audioPromptAr: string;
  audioPromptEn: string;
  emoji: string;
  gradient: string;
}> = {
  act_eco_clean: {
    shortTitleAr: 'نظافة فصلي ومدرستي 🌱',
    shortTitleEn: 'Class & School Clean 🌱',
    audioPromptAr: 'نظافة فصلي ومدرستي! نضع العلب والأوراق في السلة ونخلي فصلنا ومدرستنا جميلة ونظيفة',
    audioPromptEn: 'Class and school clean! Put wrappers in the bin and keep our classroom tidy.',
    emoji: '🌱',
    gradient: 'from-green-400 via-emerald-400 to-lime-500',
  },
  act_library_books: {
    shortTitleAr: 'ترتيب القصص المصورة 📚',
    shortTitleEn: 'Picture Books 📚',
    audioPromptAr: 'ترتيب القصص المصورة! نرجّع القصص والكتب الحلوة مكانها على الرفوف بعد القراءة',
    audioPromptEn: 'Picture books! Place colorful storybooks nicely on the library shelves.',
    emoji: '📚',
    gradient: 'from-emerald-400 via-teal-400 to-emerald-600',
  },
  act_break_custody: {
    shortTitleAr: 'أمانات الفسحة 🎒',
    shortTitleEn: 'Recess Lost & Found 🎒',
    audioPromptAr: 'أمانات الفسحة! نمر في الساحة ونتأكد إن ما فيش حاجة ضايعة ونساعد أصحابنا ترجع لهم أماناتهم',
    audioPromptEn: 'Recess check! Help friends find lost items in the playground.',
    emoji: '🎒',
    gradient: 'from-amber-400 via-orange-400 to-amber-500',
  },
  act_gym_organization: {
    shortTitleAr: 'ترتيب الألعاب والكرات ⚽',
    shortTitleEn: 'Sports & Games ⚽',
    audioPromptAr: 'ترتيب الألعاب! نجمع الكرات والأطواق بعد حصة الألعاب والرياضة ونرتّب الملعب',
    audioPromptEn: 'Sports and games! Collect balls and tidy up sports gear after play.',
    emoji: '⚽',
    gradient: 'from-rose-400 via-pink-400 to-red-500',
  },
  act_prayer_room_care: {
    shortTitleAr: 'العناية بالمصلى 🌙',
    shortTitleEn: 'Prayer Room Care 🌙',
    audioPromptAr: 'العناية بالمصلى! نرتّب المصاحف وسجاد الصلاة ونحافظ على هدوء ونظافة المصلى',
    audioPromptEn: 'Prayer room care! Keep the prayer space neat, peaceful, and clean.',
    emoji: '🌙',
    gradient: 'from-teal-400 via-emerald-400 to-cyan-500',
  },
  act_peer_tutoring: {
    shortTitleAr: 'نلعب ونتعلم مع أصحابنا 🤝',
    shortTitleEn: 'Play & Learn with Friends 🤝',
    audioPromptAr: 'نلعب ونتعلم مع أصحابنا! نتعاون سوا في اللعب والرسم ونساعد زمايلنا بحب ومشاركة',
    audioPromptEn: 'Play and learn together! Share, cooperate, and help classmates kindly.',
    emoji: '🤝',
    gradient: 'from-purple-400 via-violet-400 to-indigo-500',
  },
};

export default function SchoolActivitiesPage() {
  const { 
    currentUser, 
    activitySubmissions, 
    getUserEarnedBadges, 
    submitSchoolActivity,
    addToast,
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

  const handleQuickComplete = (act: SchoolActivity) => {
    if (act.verificationType === 'instant') {
      const res = submitSchoolActivity(act.id, 'مهمة منجزة بنجاح للأطفال', act.targetLocationId);
      if (res.success) {
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'],
          });
        } catch {
          // fallback
        }
        speakKidsText(language === 'en' ? 'Great job hero! Mission completed successfully!' : 'شاطر يا بطل! تم الإنجاز بنجاح ونوّرنا نجمة جديدة!');
        addToast(
          language === 'en' ? 'Quest Completed! 🌟' : 'تم إنجاز المهمة بنجاح! 🌟',
          language === 'en' ? 'You earned golden points!' : 'حصلت على نقاط ذهبية ونوّرت نجمة!',
          'success'
        );
      }
    } else {
      handleOpenActivity(act);
    }
  };

  return (
    <div className="px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 max-w-4xl mx-auto w-full text-start text-[#18201D] dark:text-[#F1F5F3]" dir={dir}>
      
      {/* ========================================================
          1. HERO & MOTIVATIONAL HEADER (CHILD-FRIENDLY)
      ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>
              {isAdmin 
                ? (language === 'en' ? 'Administrative Oversight Mode 🏛️' : 'وضع الإشراف والمتابعة الإدارية 🏛️')
                : (language === 'en' ? 'Fun School Activities 🌟' : 'الأنشطة المدرسية 🌟')}
            </span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">
            • {isAdmin 
                ? (language === 'en' ? 'Principal & Custody Committee' : 'مديرة المدرسة ورئيسة لجنة الأمانات')
                : (language === 'en' ? 'Active Missions for Heroes' : 'أعمال الخير ومساعدة الأصدقاء 🤝')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-[#18201D] dark:text-white tracking-tight">
                {isAdmin 
                  ? (language === 'en' ? 'School Activities & Civic Engagement' : 'دليل الأنشطة المدرسية والمشاركة المجتمعية')
                  : (language === 'en' ? 'School Activities & Helping Friends 🌟' : 'الأنشطة المدرسية وأعمال الخير 🌟')}
              </h1>
              <AudioVoiceButton 
                text={isAdmin 
                  ? (language === 'en' ? 'School Activities' : 'دليل الأنشطة المدرسية') 
                  : (language === 'en' ? 'School activities! Complete fun missions and help your friends' : 'الأنشطة المدرسية! هنا هنلعب ونساعد أصحابنا وننوّر نجوم طريق الأمانة!')} 
                size="md" 
              />
            </div>
            <p className="text-xs sm:text-sm text-[#66706B] dark:text-[#94A39D] mt-1 max-w-2xl leading-relaxed font-bold">
              {isAdmin
                ? (language === 'en'
                    ? 'Official catalog of approved school activities. Review, supervise, and certify student volunteer submissions directly in the Admin Panel.'
                    : 'دليل الأنشطة المدرسية المعيارية لتعزيز الأمانة. بصفتكِ مديرة المدرسة، يمكنكِ متابعة واعتماد توثيقات ومشاركات الطلاب من لوحة الإدارة.')
                : (language === 'en'
                    ? 'Choose a fun mission, listen to the instructions, and light up the golden star pathway!'
                    : 'اختار مهمة حلوة، استمع للصوت المرح، ونوّر نجوم طريق الأبطال!')}
            </p>
          </div>

          {isAdmin ? (
            <Link
              href="/admin?tab=activities"
              className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{language === 'en' ? 'Review Student Submissions 📋' : 'مراجعة واعتماد مشاركات الطلاب 📋'}</span>
            </Link>
          ) : (
            <Link
              href="/leaderboard"
              className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md hover:scale-105 shrink-0"
            >
              <Trophy className="w-4 h-4 text-amber-950" />
              <span>{language === 'en' ? 'Champions Board 🏆' : 'لوحة الأبطال 🏆'}</span>
            </Link>
          )}
        </div>
      </section>

      {/* ========================================================
          2. GAMIFIED PROGRESS: "طريق النجوم 🌟" (STAR PATHWAY)
      ======================================================== */}
      {isAdmin ? (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Admin Metric 1 */}
          <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Standard Activities' : 'الأنشطة المعتمدة'}
              </span>
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-[#2DD4BF]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#18201D] dark:text-white">
                {SCHOOL_ACTIVITIES.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {language === 'en' ? 'Quests' : 'مهام'}
              </span>
            </div>
          </div>

          {/* Admin Metric 2 */}
          <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Total Submissions' : 'مشاركات الطلاب'}
              </span>
              <Users className="w-4.5 h-4.5 text-teal-600 dark:text-teal-300" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#176B5B] dark:text-[#2DD4BF]">
                +{totalSchoolSubmissions}
              </span>
            </div>
          </div>

          {/* Admin Metric 3 */}
          <div className="app-card p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Pending Review' : 'بانتظار الاعتماد'}
              </span>
              <Clock className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {pendingSchoolSubmissions}
              </span>
            </div>
          </div>
        </section>
      ) : (
        /* Gamified Visual Progress Bar: طريق النجوم 🌟 */
        <section className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50/70 to-emerald-50 dark:from-[#172521] dark:via-[#16221E] dark:to-[#122822] border-3 border-amber-300/80 dark:border-amber-700/60 shadow-md relative overflow-hidden space-y-4">
          
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-2xl shadow-sm animate-pulse">
                🌟
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-amber-950 dark:text-amber-200">
                    {language === 'en' ? 'Star Adventure Pathway 🌟' : 'طريق النجوم ومسار الأبطال 🌟'}
                  </h2>
                  <AudioVoiceButton
                    text={language === 'en' ? 'Star adventure pathway! Complete missions to light up all golden stars!' : 'طريق النجوم ومسار الأبطال! أكمِل المهام ونوّر كل النجوم الذهبية!'}
                    size="sm"
                  />
                </div>
                <p className="text-xs sm:text-sm font-black text-amber-800 dark:text-amber-300">
                  {language === 'en' 
                    ? `Lit ${approvedSubmissions.length} of ${SCHOOL_ACTIVITIES.length} Stars! Keep shining!` 
                    : `نوّرنا ${approvedSubmissions.length} من ${SCHOOL_ACTIVITIES.length} نجوم ذهبية! استمر يا بطل!`}
                </p>
              </div>
            </div>

            {/* Mascot Character Avatar */}
            <div className="flex items-center gap-2 shrink-0">
              <img
                src="/kids/girl_avatar.png"
                alt="Ethos Hero"
                className="w-12 h-12 object-contain drop-shadow"
              />
            </div>
          </div>

          {/* Winding Star Path Steps */}
          <div className="relative py-2 px-1">
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-2">
              {SCHOOL_ACTIVITIES.map((act, idx) => {
                const isDone = userSubmissions.some((s) => s.activityId === act.id && s.status === 'approved');
                const isCurrent = !isDone && (idx === approvedSubmissions.length);

                return (
                  <div key={act.id} className="flex items-center gap-1.5 shrink-0">
                    <div className={`flex flex-col items-center gap-1 transition-all ${
                      isDone ? 'scale-110' : isCurrent ? 'scale-105 animate-bounce' : 'opacity-50'
                    }`}>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-md border-2 transition-transform ${
                        isDone 
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 border-amber-400 ring-2 ring-amber-300 shadow-amber-300/50' 
                          : isCurrent 
                          ? 'bg-white dark:bg-[#1C2B27] border-amber-400 text-amber-500 ring-2 ring-amber-400/50' 
                          : 'bg-slate-100 dark:bg-[#1C2B27] border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}>
                        {isDone ? '⭐' : isCurrent ? '🐾' : '⚪'}
                      </div>
                      <span className="text-[10px] font-black text-amber-900 dark:text-amber-200">
                        {idx + 1}
                      </span>
                    </div>

                    {idx < SCHOOL_ACTIVITIES.length - 1 && (
                      <span className={`text-xs font-black tracking-widest ${
                        isDone ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}>
                        •••
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </section>
      )}

      {/* ========================================================
          3. CATEGORY FILTER PILLS (CHILD-FRIENDLY TERMS)
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-[#141C1A] rounded-2xl overflow-x-auto whitespace-nowrap scrollbar-none border border-slate-200 dark:border-[#23332F]">
          {[
            { id: 'all', label: language === 'en' ? 'All Missions 🌟' : 'كل الألعاب 🌟' },
            { id: 'volunteer', label: language === 'en' ? 'Helping Friends 🤝' : 'مساعدة الأصدقاء 🤝' },
            { id: 'integrity', label: language === 'en' ? 'Honest Hero ⭐' : 'البطل الصادق ⭐' },
            { id: 'environment', label: language === 'en' ? 'School Clean 🌱' : 'نظافة المدرسة 🌱' },
            { id: 'academic_support', label: language === 'en' ? 'Science & Books 🔬' : 'مساعد العلوم والكتب 🔬' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 min-h-[42px] rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/60 dark:bg-[#1C2B27]/60'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            4. CHILD-FRIENDLY VISUAL TASK CARDS GRID (NO LONG TEXT)
        ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {filteredActivities.map((rawActivity) => {
            const config = KIDS_ACTIVITY_CONFIG[rawActivity.id] || {
              shortTitleAr: rawActivity.title.slice(0, 15),
              shortTitleEn: rawActivity.title.slice(0, 15),
              audioPromptAr: rawActivity.title,
              audioPromptEn: rawActivity.title,
              emoji: '🌟',
              gradient: 'from-emerald-400 to-teal-500',
            };

            const submission = userSubmissions.find((s) => s.activityId === rawActivity.id);
            const isApproved = submission?.status === 'approved';
            const isPending = submission?.status === 'pending';

            return (
              <div
                key={rawActivity.id}
                className={`p-5 rounded-3xl border-3 text-start flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-xl ${
                  isApproved
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700'
                    : isPending
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                    : 'bg-white dark:bg-[#15201D] border-slate-200 dark:border-[#263834] hover:border-emerald-400'
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Top Bar: 3D Visual Box & Points Reward */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} text-white flex items-center justify-center text-3xl shadow-md`}>
                        {config.emoji}
                      </div>
                      <div>
                        {/* 2-Word Short Title */}
                        <h3 className="font-black text-lg sm:text-xl text-[#18201D] dark:text-white leading-tight">
                          {language === 'en' ? config.shortTitleEn : config.shortTitleAr}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mt-0.5">
                          {rawActivity.frequency === 'daily' ? (language === 'en' ? 'Daily Mission ☀️' : 'مهمة يومية ☀️') : (language === 'en' ? 'Weekly Mission 🌟' : 'مهمة أسبوعية 🌟')}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Large Audio Button (44px) */}
                    <AudioVoiceButton
                      text={language === 'en' ? config.audioPromptEn : config.audioPromptAr}
                      size="lg"
                      className="shadow-md bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                    />
                  </div>

                  {/* Reward Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-black flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>+{rawActivity.points} {language === 'en' ? 'Gold Points' : 'نقطة ذهبية ⭐'}</span>
                    </span>
                  </div>

                </div>

                {/* Big Chunky Action Button (Tailored for Children's Fingers) */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-[#23332F]">
                  {isAdmin ? (
                    <Link
                      href="/admin?tab=activities"
                      className="w-full py-3.5 min-h-[48px] px-5 rounded-2xl bg-[#E6F1ED] dark:bg-[#122823] hover:bg-[#d8e9e3] text-[#176B5B] dark:text-[#2DD4BF] border border-[#176B5B]/30 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'en' ? 'Admin Review' : 'مراجعة الإدارة'}</span>
                    </Link>
                  ) : isApproved ? (
                    <div className="w-full py-4 min-h-[48px] px-5 rounded-3xl bg-emerald-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25">
                      <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                      <span>{language === 'en' ? 'Completed! 🌟' : 'تم الإنجاز بنجاح! 🌟'}</span>
                    </div>
                  ) : isPending ? (
                    <div className="w-full py-4 min-h-[48px] px-5 rounded-3xl bg-amber-400 text-amber-950 font-black text-base flex items-center justify-center gap-2 shadow-md">
                      <Clock className="w-5 h-5 animate-pulse" />
                      <span>{language === 'en' ? 'Under Review ⏳' : 'بانتظار التأكيد ⏳'}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleQuickComplete(rawActivity)}
                      className="w-full py-4 min-h-[48px] px-5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border-2 border-emerald-300/40"
                    >
                      <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                      <span>{language === 'en' ? 'Complete Now! ✨' : 'إنجاز وتأكيد فوري ✨'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          5. HONOR BADGES SECTION (CARTOON BADGES)
      ======================================================== */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-[#18201D] dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{language === 'en' ? 'Honest Hero Badges ⭐' : 'أوسمة البطل الصادق ⭐'}</span>
            </h2>
            <AudioVoiceButton
              text={language === 'en' ? 'Honest hero badges! Earn shiny medals as you complete missions!' : 'أوسمة البطل الصادق! اكسب ميداليات وأوسمة بتنور مع كل مهمة!'}
              size="sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACTIVITY_BADGES.map((rawBadge) => {
            const badge = getLocalizedBadge(rawBadge, language);
            const isEarned = !isAdmin && earnedBadges.some((b) => b.id === badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-3xl border-2 transition-all text-center space-y-2 relative overflow-hidden ${
                  isEarned
                    ? 'bg-gradient-to-tr from-amber-50 to-teal-50/50 dark:from-[#172622] dark:to-[#1C332C] border-amber-400 dark:border-[#2DD4BF]/50 shadow-md scale-102'
                    : 'bg-white dark:bg-[#15201D] border-slate-200 dark:border-[#263834] opacity-75'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-3xl shadow-sm">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-[#18201D] dark:text-white leading-tight">
                    {badge.title}
                  </h4>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    {isEarned ? (language === 'en' ? 'Earned! 🌟' : 'مكتسبة! 🌟') : `${badge.requiredPoints} ${language === 'en' ? 'pts' : 'نقطة'}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supervised Activity Submission Modal */}
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
