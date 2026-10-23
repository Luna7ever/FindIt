'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Search, 
  Medal, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronLeft,
  Flame,
  Clock,
  Printer,
  EyeOff,
  Volume2,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import UserAvatar from '@/components/UserAvatar';
import { LeaderboardStudentEntry, LeaderboardClassEntry, TrustTier } from '@/types';
import { getLocalizedUser } from '@/lib/i18n/seedDataTranslations';
import AudioVoiceButton from '@/components/AudioVoiceButton';
import { speakKidsText } from '@/lib/kidsVoice';

export default function LeaderboardPage() {
  const { users, currentUser, updateUserProfile, openCertificateModal, getUserEarnedBadges, dir, isRtl, language, t } = useApp();
  const [activeTab, setActiveTab] = useState<'students' | 'classes'>('students');
  const [searchTerm, setSearchTerm] = useState('');

  // Check if current user explicitly chose to hide their profile from the public leaderboard
  const isCurrentUserHidden = currentUser.role === 'student' && currentUser.isLeaderboardVisible === false;

  // Calculate Student Rankings
  const studentRankings: LeaderboardStudentEntry[] = useMemo(() => {
    return users
      .filter((u) => {
        if (u.role !== 'student') return false;
        if (u.id === currentUser.id) {
          return currentUser.isLeaderboardVisible !== false;
        }
        return u.isLeaderboardVisible !== false;
      })
      .sort((a, b) => {
        if ((b.goodwillPoints || 0) !== (a.goodwillPoints || 0)) {
          return (b.goodwillPoints || 0) - (a.goodwillPoints || 0);
        }
        return (b.returnedCount || 0) - (a.returnedCount || 0);
      })
      .map((rawUser, index) => {
        const user = getLocalizedUser(rawUser, language);
        const points = user.goodwillPoints || 0;
        const tier: TrustTier = points >= 300 ? 'gold' : points >= 60 ? 'silver' : 'bronze';
        return {
          rank: index + 1,
          user,
          points,
          returnedCount: user.returnedCount || 0,
          tier,
          scenariosCompletedCount: user.integrityScenariosCompleted?.length || (index === 0 ? 5 : 2),
        };
      });
  }, [users, currentUser.id, currentUser.isLeaderboardVisible, language]);

  // Calculate Class Rankings
  const classRankings: LeaderboardClassEntry[] = useMemo(() => {
    const classMap: Record<string, { totalPoints: number; returnedCount: number; studentsCount: number }> = {};

    users
      .filter((u) => u.role === 'student')
      .forEach((u) => {
        const grade = u.grade || 'الصف العام';
        if (!classMap[grade]) {
          classMap[grade] = { totalPoints: 0, returnedCount: 0, studentsCount: 0 };
        }
        classMap[grade].totalPoints += u.goodwillPoints || 0;
        classMap[grade].returnedCount += u.returnedCount || 0;
        classMap[grade].studentsCount += 1;
      });

    return Object.entries(classMap)
      .map(([grade, stats]) => ({
        rank: 0,
        grade,
        totalPoints: stats.totalPoints,
        returnedCount: stats.returnedCount,
        studentsCount: stats.studentsCount,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [users]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return studentRankings;
    const term = searchTerm.toLowerCase();
    return studentRankings.filter(
      (s) => s.user.name.toLowerCase().includes(term) || s.user.grade.toLowerCase().includes(term)
    );
  }, [studentRankings, searchTerm]);

  const top1 = studentRankings[0];
  const top2 = studentRankings[1];
  const top3 = studentRankings[2];

  const handleCheerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } catch {
      // fallback
    }
    speakKidsText(language === 'en' ? 'Cheers for our honest heroes! 🌟' : 'تحية كبيرة لأبطال الأمانة الصادقين! 🌟');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0D1412] safe-bottom-space transition-colors duration-300" dir={dir}>
      
      {/* ========================================================
          1. TOP HERO BANNER (CHILD-FRIENDLY & SUNNY)
      ======================================================== */}
      <div className="bg-gradient-to-b from-amber-500 via-amber-400 to-yellow-300 dark:from-[#0E1E1A] dark:via-[#122923] dark:to-[#0D1412] text-amber-950 dark:text-white pt-10 pb-28 px-4 sm:px-6 relative overflow-hidden shadow-md">
        
        {/* Playful Background Sparkles */}
        <div className="absolute top-4 left-6 text-2xl animate-bounce">⭐</div>
        <div className="absolute top-8 right-8 text-2xl animate-pulse">✨</div>
        <div className="absolute bottom-6 left-12 text-3xl opacity-75">🎉</div>

        <div className="container mx-auto max-w-4xl relative z-10 space-y-4 text-center">
          
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-emerald-950/80 border-2 border-amber-300 dark:border-emerald-800 text-xs sm:text-sm font-black text-amber-950 dark:text-emerald-300 shadow-md">
            <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{language === 'en' ? 'Champions of Honesty 🏆' : 'لوحة أبطال الأمانة 🏆'}</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-amber-950 dark:text-white">
              {language === 'en' ? 'Honest Heroes Board 🌟' : 'لوحة الأبطال الصادقين 🌟'}
            </h1>
            <AudioVoiceButton 
              text={language === 'en' ? 'Honest heroes board! Honoring our top truthful students' : 'لوحة الأبطال الصادقين! نكرم شطار الأمانة ونفرح بتميزهم!'} 
              size="md" 
            />
          </div>

          <p className="text-amber-900/90 dark:text-emerald-200/80 text-xs sm:text-sm max-w-lg mx-auto font-bold leading-relaxed">
            {language === 'en' 
              ? 'Our truthful heroes who preserve honesty and help their school friends every day!' 
              : 'أبطالنا الصادقين اللي بيحافظوا على الأمانة وبيساعدوا أصحابهم كل يوم!'}
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              onClick={handleCheerConfetti}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 cursor-pointer border-2 border-emerald-300/40"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>{language === 'en' ? 'Cheer for Heroes! 🎉' : 'حيّوا الأبطال! 🎉'}</span>
            </button>

            {currentUser.role !== 'admin' && (
              <button
                onClick={() => openCertificateModal(currentUser)}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all hover:scale-105 cursor-pointer border-2 border-amber-300"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>{language === 'en' ? 'My Hero Certificate 📜' : 'شهادتي كبطل صادق 📜'}</span>
              </button>
            )}

            <Link
              href="/activities"
              className="px-5 py-3 rounded-2xl bg-white/80 dark:bg-white/10 hover:bg-white text-amber-950 dark:text-white text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>{language === 'en' ? 'Fun Activities 🌟' : 'الأنشطة والألعاب 🌟'}</span>
            </Link>
          </div>

        </div>
      </div>

      {/* ========================================================
          2. 3D CARTOON PODIUM SECTION (TOP 3 CHAMPIONS)
      ======================================================== */}
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 -mt-20 relative z-20 space-y-8">
        
        {isCurrentUserHidden && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#15201D] border border-amber-300 dark:border-amber-800/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs max-w-2xl mx-auto">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-300 text-start">
              <EyeOff className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-bold">
                  {language === 'en' ? 'Your account is currently hidden from the public leaderboard' : 'حسابك مخفي حالياً من لوحة الشرف العامة'}
                </p>
              </div>
            </div>
            <button
              onClick={() => updateUserProfile({ isLeaderboardVisible: true })}
              className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              {language === 'en' ? 'Show on Leaderboard' : 'إعادة إظهار حسابي'}
            </button>
          </div>
        )}

        {/* 3D Visual Podium */}
        {studentRankings.length >= 3 && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end max-w-2xl mx-auto pt-4">
            
            {/* Rank 2 (Silver Podium) */}
            <div className="bg-white dark:bg-[#15201D] rounded-3xl p-3 sm:p-5 border-3 border-slate-300 dark:border-slate-700 shadow-xl text-center flex flex-col items-center justify-between space-y-2.5 order-1 relative group hover:scale-102 transition-all">
              <span className="absolute -top-3.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-[10px] sm:text-xs font-black border border-slate-300 shadow-sm">
                🥈 {language === 'en' ? 'Rank 2' : 'المركز الثاني'}
              </span>
              <div className="relative mt-2">
                <UserAvatar size="lg" name={top2.user.name} role={top2.user.role} />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center border-2 border-white shadow">
                  2
                </span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <p className="font-black text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[120px]">
                    {top2.user.name}
                  </p>
                  <AudioVoiceButton text={top2.user.name + ' - البطل الصادق في المركز الثاني'} size="sm" />
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {language === 'en' ? 'Honest Hero ⭐' : 'البطل الصادق ⭐'}
                </span>
              </div>
              <div className="w-full pt-2 border-t border-slate-100 dark:border-[#23332F] flex flex-col items-center">
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">{top2.points} {language === 'en' ? 'pts' : 'نقطة'}</span>
              </div>
            </div>

            {/* Rank 1 (Gold - Elevated Center Podium) */}
            <div className="bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-100/60 dark:from-amber-950/60 dark:via-[#15201D] dark:to-amber-950/30 rounded-3xl p-3 sm:p-6 border-3 border-amber-400 dark:border-amber-500 shadow-2xl text-center flex flex-col items-center justify-between space-y-3 order-2 relative -translate-y-5 hover:scale-105 transition-all">
              <div className="absolute -top-4 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 text-[11px] sm:text-xs font-black border-2 border-amber-200 shadow-md flex items-center gap-1 animate-pulse">
                <span>👑</span>
                <span>{language === 'en' ? 'Champion 1' : 'بطل المركز الأول 🥇'}</span>
              </div>
              <div className="relative mt-3">
                <div className="ring-4 ring-amber-400 rounded-full p-1 shadow-lg bg-amber-100">
                  <UserAvatar size="lg" name={top1.user.name} role={top1.user.role} />
                </div>
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-amber-950 text-sm font-black flex items-center justify-center border-2 border-white shadow-md">
                  1
                </span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <p className="font-black text-amber-950 dark:text-white text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                    {top1.user.name}
                  </p>
                  <AudioVoiceButton text={top1.user.name + ' - بطل الأمانة الأول في المدرسة'} size="sm" />
                </div>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 shadow-2xs">
                  {language === 'en' ? 'Top Honest Hero 🌟' : 'البطل الصادق الأول 🌟'}
                </span>
              </div>
              <div className="w-full pt-2 border-t border-amber-200 dark:border-amber-800 flex flex-col items-center">
                <span className="text-sm font-black text-amber-900 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-950 px-3 py-1 rounded-full">
                  +{top1.points} {language === 'en' ? 'pts' : 'نقطة ذهبية ⭐'}
                </span>
              </div>
            </div>

            {/* Rank 3 (Bronze Podium) */}
            <div className="bg-white dark:bg-[#15201D] rounded-3xl p-3 sm:p-5 border-3 border-amber-600/40 dark:border-amber-800 shadow-xl text-center flex flex-col items-center justify-between space-y-2.5 order-3 relative group hover:scale-102 transition-all">
              <span className="absolute -top-3.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-[10px] sm:text-xs font-black border border-amber-300 shadow-sm">
                🥉 {language === 'en' ? 'Rank 3' : 'المركز الثالث'}
              </span>
              <div className="relative mt-2">
                <UserAvatar size="lg" name={top3.user.name} role={top3.user.role} />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center border-2 border-white shadow">
                  3
                </span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <p className="font-black text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[120px]">
                    {top3.user.name}
                  </p>
                  <AudioVoiceButton text={top3.user.name + ' - البطل الصادق في المركز الثالث'} size="sm" />
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {language === 'en' ? 'Honest Hero ⭐' : 'البطل الصادق ⭐'}
                </span>
              </div>
              <div className="w-full pt-2 border-t border-slate-100 dark:border-[#23332F] flex flex-col items-center">
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">{top3.points} {language === 'en' ? 'pts' : 'نقطة'}</span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            3. HEROES LIST & CARDS (CHILD-FRIENDLY & VOICED)
        ======================================================== */}
        <div className="bg-white dark:bg-[#15201D] rounded-3xl shadow-xl border-2 border-slate-200 dark:border-[#263834] overflow-hidden">
          
          {/* Tab Switcher & Search Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#23332F] flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 dark:bg-[#141C1A]">
            <div className="flex items-center gap-2 p-1 bg-slate-200/80 dark:bg-[#1C2B27] rounded-2xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-[#94A39D] hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{language === 'en' ? 'All Heroes 🌟' : 'جميع الأبطال 🌟'}</span>
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'classes'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-[#94A39D] hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{language === 'en' ? 'School Classes 🏫' : 'فصول المدرسة 🏫'}</span>
              </button>
            </div>

            {/* Quick Search */}
            {activeTab === 'students' && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search for a hero...' : 'ابحث عن اسم بطل...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-[#2D3E3A] bg-white dark:bg-[#182220] text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Students Hero List */}
          {activeTab === 'students' ? (
            <div className="p-3 sm:p-5 space-y-2.5">
              {filteredStudents.map((entry) => {
                const isCurrent = entry.user.id === currentUser.id;
                return (
                  <div
                    key={entry.user.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-md scale-[1.01]'
                        : 'bg-white dark:bg-[#182220] border-slate-100 dark:border-[#23332F] hover:border-emerald-300'
                    }`}
                  >
                    {/* Rank & Avatar */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-amber-950 text-base'
                          : entry.rank === 2
                          ? 'bg-slate-200 text-slate-800 text-base'
                          : entry.rank === 3
                          ? 'bg-amber-600 text-white text-base'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                      </span>

                      <UserAvatar size="sm" name={entry.user.name} role={entry.user.role} />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                            {entry.user.name}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full">
                              {language === 'en' ? 'You ⭐' : 'أنت ⭐'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-[#176B5B] dark:text-emerald-400 block">
                          {language === 'en' ? 'Honest Hero ⭐' : 'البطل الصادق ⭐'}
                        </span>
                      </div>
                    </div>

                    {/* Audio Voice & Points */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <AudioVoiceButton
                        text={`${entry.user.name} - ${language === 'en' ? 'Honest Hero with' : 'البطل الصادق ومعه'} ${entry.points} ${language === 'en' ? 'points' : 'نقطة'}`}
                        size="sm"
                      />

                      <div className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 text-amber-950 dark:text-amber-200 font-black text-xs sm:text-sm shadow-2xs">
                        +{entry.points} ⭐
                      </div>

                      <button
                        onClick={() => openCertificateModal(entry.user)}
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title={language === 'en' ? 'View Certificate' : 'عرض شهادة البطل'}
                      >
                        <Award className="w-5 h-5 text-amber-500" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Classes Tab */
            <div className="p-4 space-y-2.5">
              {classRankings.map((entry) => (
                <div
                  key={entry.grade}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-[#263834] flex items-center justify-between gap-3 bg-white dark:bg-[#182220]"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black flex items-center justify-center">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{entry.grade}</h4>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        {language === 'en' ? 'Honest Class 🏆' : 'فصل الأبطال الصادقين 🏆'}
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-black text-sm">
                    {entry.totalPoints} ⭐
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
