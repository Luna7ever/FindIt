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
  Printer
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import UserAvatar from '@/components/UserAvatar';
import { LeaderboardStudentEntry, LeaderboardClassEntry, TrustTier } from '@/types';
import { getLocalizedUser } from '@/lib/i18n/seedDataTranslations';

export default function LeaderboardPage() {
  const { users, currentUser, openCertificateModal, getUserEarnedBadges, dir, isRtl, language, t } = useApp();
  const [activeTab, setActiveTab] = useState<'students' | 'classes'>('students');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate Student Rankings
  const studentRankings: LeaderboardStudentEntry[] = useMemo(() => {
    return users
      .filter((u) => u.role === 'student')
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
  }, [users]);

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

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0D1412] safe-bottom-space transition-colors duration-300" dir={dir}>
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-900 dark:from-[#091512] dark:via-[#0E1E1A] dark:to-[#122923] text-white pt-10 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Subtle Patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="container mx-auto max-w-5xl relative z-10 space-y-6 text-center">
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 dark:bg-emerald-900/60 border border-emerald-600/50 text-xs font-bold text-emerald-200 shadow-md">
            <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{t('leaderboard.tag')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t('leaderboard.title')}
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {t('leaderboard.subtitle')}
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            {currentUser.role !== 'admin' ? (
              <button
                onClick={() => openCertificateModal(currentUser)}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t('leaderboard.myCertBtn')}</span>
              </button>
            ) : (
              <button
                onClick={() => typeof window !== 'undefined' && window.print()}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'en' ? 'Print School Honor Roll 🖨️' : 'طباعة لوحة الشرف المدرسية 🖨️'}</span>
              </button>
            )}
            <Link
              href="/activities"
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md hover:scale-105"
            >
              <Award className="w-4 h-4" />
              <span>{language === 'en' ? (currentUser.role === 'admin' ? '🏛️ School Activities' : '🌟 School Quests') : (currentUser.role === 'admin' ? '🏛️ دليل الأنشطة المدرسية' : '🌟 مهام وتطوع المدرسة')}</span>
            </Link>
            <Link
              href="/integrity"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur-md"
            >
              {currentUser.role === 'admin' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>{language === 'en' ? 'Integrity Standards (Supervision)' : 'معايير النزاهة (إشراف)'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>{t('leaderboard.challengeBtn')}</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 -mt-16 relative z-20 space-y-8">
        {/* Top 3 Podium Cards */}
        {studentRankings.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-3xl mx-auto">
            
            {/* Rank 2 (Silver) */}
            <div className="bg-white dark:bg-[#15201D] rounded-3xl p-2 sm:p-4 border border-slate-200 dark:border-[#263834] shadow-lg text-center flex flex-col items-center justify-between space-y-2 order-1 sm:order-1 relative group hover:border-slate-300 dark:hover:border-[#344C46] transition-all">
              <span className="absolute -top-3 px-2 sm:px-3 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] sm:text-xs font-extrabold border border-slate-300 dark:border-slate-600 shadow-sm whitespace-nowrap">
                {t('leaderboard.rank2')}
              </span>
              <div className="relative mt-2">
                <UserAvatar size="md" name={top2.user.name} role={top2.user.role} />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#15201D]">
                  2
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[85px] sm:max-w-[120px]">
                  {top2.user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-[#94A39D] truncate max-w-[85px] sm:max-w-[120px]">{top2.user.grade}</p>
              </div>
              <div className="w-full pt-1 border-t border-slate-100 dark:border-[#23332F] flex flex-col items-center">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{top2.points} {t('app.points')}</span>
                <span className="text-[10px] text-slate-500 dark:text-[#94A39D]">{top2.returnedCount} {t('leaderboard.returnedHome')}</span>
              </div>
            </div>

            {/* Rank 1 (Gold - Center & Elevated) */}
            <div className="bg-gradient-to-b from-amber-50 via-white to-amber-50/30 dark:from-amber-950/40 dark:via-[#15201D] dark:to-amber-950/20 rounded-3xl p-2.5 sm:p-5 border-2 border-amber-400 dark:border-amber-500 shadow-2xl text-center flex flex-col items-center justify-between space-y-3 order-2 sm:order-2 relative group -translate-y-4 hover:border-amber-500 transition-all">
              <div className="absolute -top-3.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] sm:text-xs font-black border border-amber-300 shadow-md flex items-center gap-1 whitespace-nowrap">
                <span>👑</span>
                <span>{t('leaderboard.rank1')}</span>
              </div>
              <div className="relative mt-3">
                <div className="ring-4 ring-amber-400/50 rounded-full p-0.5">
                  <UserAvatar size="lg" name={top1.user.name} role={top1.user.role} />
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center border-2 border-white dark:border-[#15201D] shadow-sm">
                  1
                </span>
              </div>
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-base truncate max-w-[95px] sm:max-w-none">
                  {top1.user.name}
                </p>
                <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 font-semibold">{top1.user.grade}</p>
              </div>
              <div className="w-full pt-2 border-t border-amber-200/60 dark:border-amber-900/60 flex flex-col items-center">
                <span className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-2 sm:px-3 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                  {top1.points} {t('app.goodwillPoints')}
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mt-1">
                  ⭐ {top1.returnedCount} {t('leaderboard.returnedHome')}
                </span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="bg-white dark:bg-[#15201D] rounded-3xl p-2 sm:p-4 border border-slate-200 dark:border-[#263834] shadow-lg text-center flex flex-col items-center justify-between space-y-2 order-3 sm:order-3 relative group hover:border-slate-300 dark:hover:border-[#344C46] transition-all">
              <span className="absolute -top-3 px-2 sm:px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] sm:text-xs font-extrabold border border-amber-200 dark:border-amber-800 shadow-sm whitespace-nowrap">
                {t('leaderboard.rank3')}
              </span>
              <div className="relative mt-2">
                <UserAvatar size="md" name={top3.user.name} role={top3.user.role} />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#15201D]">
                  3
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[85px] sm:max-w-[120px]">
                  {top3.user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-[#94A39D] truncate max-w-[85px] sm:max-w-[120px]">{top3.user.grade}</p>
              </div>
              <div className="w-full pt-1 border-t border-slate-100 dark:border-[#23332F] flex flex-col items-center">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{top3.points} {t('app.points')}</span>
                <span className="text-[10px] text-slate-500 dark:text-[#94A39D]">{top3.returnedCount} {t('leaderboard.returnedHome')}</span>
              </div>
            </div>

          </div>
        )}

        {/* Main Leaderboard Table Section */}
        <div className="bg-white dark:bg-[#15201D] rounded-3xl shadow-xl border border-slate-200 dark:border-[#263834] overflow-hidden transition-colors duration-300">
          {/* Tab Header & Search */}
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-[#23332F] flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#141C1A]">
            {/* Tab switchers */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-[#1C2B27] rounded-2xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-white dark:bg-[#15201D] text-emerald-950 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-[#94A39D] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{t('leaderboard.tabStudents')}</span>
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'classes'
                    ? 'bg-white dark:bg-[#15201D] text-emerald-950 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-[#94A39D] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>{t('leaderboard.tabClasses')}</span>
              </button>
            </div>

            {/* Search Input for Students */}
            {activeTab === 'students' && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 dark:text-[#94A39D] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('leaderboard.searchStudents')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-[#2D3E3A] bg-white dark:bg-[#182220] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Students Leaderboard Tab */}
          {activeTab === 'students' ? (
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 dark:bg-[#141C1A] text-slate-500 dark:text-[#94A39D] font-bold border-b border-slate-100 dark:border-[#23332F]">
                  <tr>
                    <th className="py-3 px-4 text-center w-14">{t('leaderboard.colRank')}</th>
                    <th className="py-3 px-4">{t('leaderboard.colStudent')}</th>
                    <th className="py-3 px-4 hidden sm:table-cell">{t('leaderboard.colClass')}</th>
                    <th className="py-3 px-4 text-center">{t('leaderboard.colReturned')}</th>
                    <th className="py-3 px-4 text-center">{t('leaderboard.colTier')}</th>
                    <th className="py-3 px-4 text-center">{t('leaderboard.colPoints')}</th>
                    <th className="py-3 px-4 text-center">{t('leaderboard.colCert')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#23332F]">
                  {filteredStudents.map((entry) => {
                    const isCurrent = entry.user.id === currentUser.id;
                    return (
                      <tr
                        key={entry.user.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-[#1C2B27]/60 transition-colors ${
                          isCurrent ? 'bg-emerald-50/40 dark:bg-[#176B5B]/20 font-bold' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 text-center font-extrabold text-slate-700 dark:text-slate-300">
                          {entry.rank === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 inline-flex items-center justify-center text-xs shadow-sm">
                              🥇
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 inline-flex items-center justify-center text-xs shadow-sm">
                              🥈
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700 text-white inline-flex items-center justify-center text-xs shadow-sm">
                              🥉
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-[#94A39D] font-semibold">{entry.rank}</span>
                          )}
                        </td>

                        {/* Student */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar size="xs" name={entry.user.name} role={entry.user.role} />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                <span>{entry.user.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-md">
                                    {t('app.you')}
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-[10px] text-slate-500 dark:text-[#94A39D]">{entry.user.grade}</p>
                                {(() => {
                                  const earnedBadges = getUserEarnedBadges ? getUserEarnedBadges(entry.user.id) : [];
                                  if (earnedBadges.length === 0) return null;
                                  return (
                                    <div className="flex items-center gap-0.5">
                                      {earnedBadges.slice(0, 3).map((b) => (
                                        <span
                                          key={b.id}
                                          className="text-xs"
                                          title={b.title}
                                        >
                                          {b.icon}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Grade */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-[#94A39D] hidden sm:table-cell">
                          {entry.user.grade}
                        </td>

                        {/* Returned items */}
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-800 dark:text-emerald-400">
                          {entry.returnedCount}
                        </td>

                        {/* Tier */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              entry.tier === 'gold'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                                : entry.tier === 'silver'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>
                              {t('tier.' + entry.tier)}
                            </span>
                          </span>
                        </td>

                        {/* Points */}
                        <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                          <span className="bg-slate-100 dark:bg-[#1C2B27] px-2.5 py-1 rounded-xl">
                            {entry.points}
                          </span>
                        </td>

                        {/* Certificate Button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => openCertificateModal(entry.user)}
                            className="p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center text-slate-500 dark:text-[#94A39D] hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#1C2B27] rounded-xl transition-colors cursor-pointer"
                            title="عرض شهادة الطالب"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Classes Leaderboard Tab */
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 dark:bg-[#141C1A] text-slate-500 dark:text-[#94A39D] font-bold border-b border-slate-100 dark:border-[#23332F]">
                  <tr>
                    <th className="py-3 px-4 text-center w-14">{t('leaderboard.colRank')}</th>
                    <th className="py-3 px-4">{t('leaderboard.colClassGroup')}</th>
                    <th className="py-3 px-4 text-center">{t('leaderboard.colParticipants')}</th>
                    <th className="py-3 px-4 text-center">{t('leaderboard.colTotalReturned')}</th>
                    <th className="py-3 px-4 text-center">{t('leaderboard.colTotalPoints')}</th>
                    <th className="py-3 px-4 text-center">{t('leaderboard.colBadge')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#23332F]">
                  {classRankings.map((entry) => (
                    <tr key={entry.grade} className="hover:bg-slate-50/80 dark:hover:bg-[#1C2B27]/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-700 dark:text-slate-300">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span>{entry.grade}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-[#94A39D] font-semibold">
                        {entry.studentsCount} {language === 'en' ? 'students' : 'طلاب'}
                      </td>
                      <td className="py-3.5 px-4 text-center text-emerald-800 dark:text-emerald-400 font-bold">
                        {entry.returnedCount} {language === 'en' ? 'items' : 'أمانة'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                        <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          {entry.totalPoints} {t('app.points')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {entry.rank === 1 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">{language === 'en' ? 'Golden Integrity Class 🏆' : 'فصل الأمانة الذهبي 🏆'}</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-slate-600 dark:text-slate-300 font-bold text-[11px]">{language === 'en' ? 'Distinguished Class 🌟' : 'فصل متميز 🌟'}</span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">{language === 'en' ? 'Active Participant ✓' : 'مشارك فعّال ✓'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* How to climb leaderboard card */}
        <div className="bg-gradient-to-l from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#15201D] rounded-3xl p-6 border border-emerald-200/70 dark:border-emerald-800/60 shadow-md">
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('leaderboard.howToClimb')}</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#182220] border border-emerald-100 dark:border-[#263834] shadow-sm space-y-1">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block">{t('leaderboard.rule1Title')}</span>
              <p className="text-[11px] text-slate-600 dark:text-[#94A39D] leading-relaxed">
                {t('leaderboard.rule1Desc')}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#182220] border border-emerald-100 dark:border-[#263834] shadow-sm space-y-1">
              <span className="font-extrabold text-teal-800 dark:text-teal-400 block">{t('leaderboard.rule2Title')}</span>
              <p className="text-[11px] text-slate-600 dark:text-[#94A39D] leading-relaxed">
                {t('leaderboard.rule2Desc')}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#182220] border border-emerald-100 dark:border-[#263834] shadow-sm space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-400 block">{t('leaderboard.rule3Title')}</span>
              <p className="text-[11px] text-slate-600 dark:text-[#94A39D] leading-relaxed">
                {t('leaderboard.rule3Desc')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
