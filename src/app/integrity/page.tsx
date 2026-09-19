'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { INTEGRITY_SCENARIOS, SCHOOL_LOCATIONS } from '@/lib/constants';
import { getLocalizedScenario } from '@/lib/i18n/scenarios';
import { IntegrityOption, TrustTier } from '@/types';
import TrustBadge from '@/components/TrustBadge';
import AdminIntegritySupervisionView from '@/components/AdminIntegritySupervisionView';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { 
  Award, 
  Sparkles, 
  Clock, 
  Play, 
  Pause, 
  Volume2,
  VolumeX,
  ChevronLeft, 
  ChevronRight,
  Trophy, 
  Compass, 
  RefreshCw, 
  Check, 
  CheckCircle2, 
  Flame, 
  ArrowLeft, 
  ArrowRight,
  XCircle, 
  Lightbulb, 
  AlertCircle,
  Shield,
  ShieldCheck,
  Crown,
  BookOpen,
  Brain,
  GraduationCap,
  Target,
  Radio,
  FileCheck,
  TrendingUp,
  Zap,
  Info
} from 'lucide-react';

interface ScenarioAnswerState {
  optionId: string;
  isIdeal: boolean;
  score: number;
}

// Circular SVG Grade Indicator Component
function CircularScoreGauge({ score, size = 110, language = 'ar' }: { score: number; size?: number; language?: 'ar' | 'en' }) {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let strokeColor = '#10B981'; // emerald
  if (score < 60) strokeColor = '#EF4444'; // rose
  else if (score < 90) strokeColor = '#F59E0B'; // amber

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="text-slate-100 dark:text-[#23332F]"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
          {score}%
        </span>
        <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A39D] mt-1">
          {score >= 90 ? (language === 'en' ? 'Excellent 🌟' : 'ممتاز 🌟') : score >= 60 ? (language === 'en' ? 'Very Good ⭐' : 'جيد جداً ⭐') : (language === 'en' ? 'Needs Review ⚠️' : 'يحتاج مراجعة ⚠️')}
        </span>
      </div>
    </div>
  );
}

function StudentIntegrityFlow() {
  const { 
    currentUser, 
    currentUserTrustTier, 
    submitIntegrityAttempt, 
    resetScenarioCooldown,
    openCertificateModal,
    t,
    dir,
    isRtl,
    language
  } = useApp();

  // Active scenario index in the continuous 5-scenario flow (0 to 4)
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, ScenarioAnswerState>>({});
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isTestCompleted, setIsTestCompleted] = useState(false);

  // Cinema Player animated playback state & audio simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);

  // Live ticking clock for countdown display with hydration safety
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const rawActiveScenario = INTEGRITY_SCENARIOS[activeScenarioIndex] || INTEGRITY_SCENARIOS[0];
  const activeScenario = useMemo(() => getLocalizedScenario(rawActiveScenario, language), [rawActiveScenario, language]);
  const primaryQuestion = activeScenario.questions[0];

  // Robust Audio Engine: Synthesized Chime + Real Speech Synthesis on User Action
  const playScenarioAudio = () => {
    if (typeof window === 'undefined') return;

    // 1. Web Audio API Chime (Immediately audible from device speakers, bypasses browser voice delays)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99]; // C5 - E5 - G5 major cinematic chord
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.06, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.5);
        });
      }
    } catch (e) {
      console.warn('AudioContext error', e);
    }

    // 2. Web Speech Synthesis for Dialogue Narration
    if (!isAudioMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const textToSpeak = activeScenario?.dilemmaQuote ? activeScenario.dilemmaQuote.replace(/[«»"]/g, '') : '';
      if (textToSpeak) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language === 'en' ? 'en-US' : 'ar-SA';
        utterance.rate = 0.92;
        utterance.pitch = 1.05;

        // Pick best matching voice
        const voices = window.speechSynthesis.getVoices();
        const suitedVoice = voices.find((v) => language === 'en' ? v.lang.startsWith('en') : (v.lang.startsWith('ar') || v.name.includes('Arabic')));
        if (suitedVoice) {
          utterance.voice = suitedVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      playScenarioAudio();
    } else {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleToggleMute = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      if (isPlaying) {
        playScenarioAudio();
      }
    } else {
      setIsAudioMuted(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Live video progress & seconds timeline loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayedSeconds((sec) => sec + 1);
        setVideoProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 2;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync state when active scenario changes
  useEffect(() => {
    const existing = answersMap[activeScenario.id];
    if (existing) {
      setSelectedOptionId(existing.optionId);
    } else {
      setSelectedOptionId(null);
    }
    setVideoProgress(15);
  }, [activeScenarioIndex, activeScenario.id, answersMap]);

  // Selected Option Details
  const selectedOption = useMemo(() => {
    if (!selectedOptionId) return null;
    return primaryQuestion?.options.find((o) => o.id === selectedOptionId) || null;
  }, [selectedOptionId, primaryQuestion]);

  // Handle Option Click (Instant Feedback & Evaluation)
  const handleSelectOption = (option: IntegrityOption) => {
    if (selectedOptionId) return; // Prevent double clicking on same step

    setSelectedOptionId(option.id);
    const isIdeal = option.score === 100;

    // Save answer state for continuous flow
    setAnswersMap((prev) => ({
      ...prev,
      [activeScenario.id]: {
        optionId: option.id,
        isIdeal,
        score: option.score,
      },
    }));

    // Submit attempt to AppContext for score & points
    try {
      submitIntegrityAttempt(activeScenario.id, option.id);
    } catch {
      // Handled gracefully
    }

    // Trigger celebratory confetti on ideal answer
    if (isIdeal) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#176B5B', '#10B981', '#F59E0B', '#3B82F6'],
      });
    }
  };

  // Advance to next scenario or complete test
  const handleNextStep = () => {
    if (activeScenarioIndex < INTEGRITY_SCENARIOS.length - 1) {
      setActiveScenarioIndex((prev) => prev + 1);
    } else {
      setIsTestCompleted(true);
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#176B5B', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'],
      });
    }
  };

  // Reset entire challenge for Demo Mode
  const handleDemoReset = () => {
    setAnswersMap({});
    setSelectedOptionId(null);
    setActiveScenarioIndex(0);
    setIsTestCompleted(false);
    INTEGRITY_SCENARIOS.forEach((s) => {
      resetScenarioCooldown(s.id);
    });
  };

  // Weekly Countdown
  const weeklyCountdown = useMemo(() => {
    const now = new Date(currentTime);
    const daysLeft = 6 - (now.getDay() % 7);
    const hoursLeft = 23 - now.getHours();
    const minutesLeft = 59 - now.getMinutes();
    const secondsLeft = 59 - now.getSeconds();
    return {
      days: daysLeft,
      hours: String(hoursLeft).padStart(2, '0'),
      minutes: String(minutesLeft).padStart(2, '0'),
      seconds: String(secondsLeft).padStart(2, '0'),
    };
  }, [currentTime]);

  const idealAnswersCount = useMemo(() => {
    return Object.values(answersMap).filter((a) => a.isIdeal).length;
  }, [answersMap]);

  // Overall Score Calculation (out of 100%)
  const overallScorePercentage = useMemo(() => {
    const totalScenarios = INTEGRITY_SCENARIOS.length;
    if (totalScenarios === 0) return 0;
    const totalScore = Object.values(answersMap).reduce((acc, a) => acc + a.score, 0);
    return Math.round(totalScore / totalScenarios);
  }, [answersMap]);

  const totalPointsEarned = useMemo(() => {
    return idealAnswersCount * 10;
  }, [idealAnswersCount]);

  // Trust Tier Advancement Calculation
  const userPoints = currentUser.goodwillPoints || 0;
  const tierAdvancement = useMemo(() => {
    if (userPoints >= 200) {
      return { current: 'gold' as TrustTier, next: null, target: 200, percent: 100, remaining: 0 };
    }
    if (userPoints >= 100) {
      const needed = 200 - userPoints;
      const progress = Math.min(100, Math.round(((userPoints - 100) / 100) * 100));
      return { current: 'silver' as TrustTier, next: language === 'en' ? 'Gold Ambassador 🏆' : 'سفير ذهبي 🏆', target: 200, percent: progress, remaining: needed };
    }
    const needed = 100 - userPoints;
    const progress = Math.min(100, Math.round((userPoints / 100) * 100));
    return { current: 'bronze' as TrustTier, next: language === 'en' ? 'Silver Ambassador 🌟' : 'سفير فضي 🌟', target: 100, percent: progress, remaining: needed };
  }, [userPoints]);

  return (
    <div className="px-3 sm:px-6 py-4 max-w-6xl mx-auto space-y-4 text-start font-sans" dir={dir}>
      
      {/* ========================================================
          1. RICH TOP BAR: IDENTITY, 5-SEGMENTS, COUNTDOWN, CONTROLS
      ======================================================== */}
      <div className="p-3.5 sm:p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] shadow-xs rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 transition-colors duration-300">
        
        {/* Topic Title Badge & Student Mini Profile */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#176B5B] to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-[#176B5B] dark:text-emerald-400 bg-[#176B5B]/10 dark:bg-[#176B5B]/20 px-2 py-0.5 rounded-md">
                {language === 'en' ? 'Weekly Integrity Challenge' : 'التحدي الأسبوعي للأمانة'}
              </span>
              <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] font-semibold hidden sm:inline">
                {language === 'en' 
                  ? (currentUser.role === 'admin' ? `Principal / Oversight: ${currentUser.name}` : `Student: ${currentUser.name}`)
                  : (currentUser.role === 'admin' ? `الإشراف الإداري: ${currentUser.name}` : `الطالبة: ${currentUser.name}`)}
              </span>
              {currentUser.role !== 'admin' && <TrustBadge tier={currentUserTrustTier} size="xs" />}
            </div>
            <h1 className="text-sm sm:text-base font-black text-[#18201D] dark:text-white truncate">
              {isTestCompleted ? (language === 'en' ? 'Evaluation Record & Comprehensive Results' : 'سجل التقييم والنتائج الشاملة') : activeScenario.topicTitle}
            </h1>
          </div>
        </div>

        {/* 5-Segment Progress Bar */}
        <div className="w-full md:w-auto flex-1 max-w-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-[#176B5B] dark:text-emerald-400 font-black flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{language === 'en' ? `Scenario ${activeScenarioIndex + 1} of ${INTEGRITY_SCENARIOS.length}` : `الموقف ${activeScenarioIndex + 1} من ${INTEGRITY_SCENARIOS.length}`}</span>
            </span>
            <span className="text-[#66706B] dark:text-[#94A39D] text-[10px] font-mono">
              {Math.round(((activeScenarioIndex + (selectedOptionId ? 1 : 0)) / INTEGRITY_SCENARIOS.length) * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 h-2 items-center">
            {INTEGRITY_SCENARIOS.map((s, idx) => {
              const isAnswered = !!answersMap[s.id];
              const isCurrent = idx === activeScenarioIndex && !isTestCompleted;

              let segmentClass = 'bg-slate-100 dark:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A]';
              if (isAnswered) {
                segmentClass = answersMap[s.id].isIdeal
                  ? 'bg-emerald-500 shadow-2xs'
                  : 'bg-amber-500 shadow-2xs';
              } else if (isCurrent) {
                segmentClass = 'bg-[#176B5B] ring-2 ring-emerald-400 ring-offset-1 animate-pulse';
              }

              return (
                <button 
                  key={s.id}
                  onClick={() => {
                    if (!isTestCompleted) {
                      setActiveScenarioIndex(idx);
                    }
                  }}
                  className="min-h-[42px] -my-4 py-4 flex items-center cursor-pointer group" 
                  title={`الموقف ${idx + 1}: ${s.topicTitle}`}
                >
                  <span className={`w-full h-2 rounded-full transition-all duration-300 block ${segmentClass} group-hover:opacity-80`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Countdown & Demo Reset */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <div className="px-2.5 py-1.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span className="text-[10px] text-amber-900 dark:text-amber-300 font-medium hidden sm:inline">{language === 'en' ? 'Renews in:' : 'تجدد التحدي:'}</span>
            <span className="font-mono text-amber-900 dark:text-amber-200 font-black">
              {mounted ? `${weeklyCountdown.days}ي ${weeklyCountdown.hours}:${weeklyCountdown.minutes}:${weeklyCountdown.seconds}` : '6ي 14:32:00'}
            </span>
          </div>

          <button
            onClick={handleDemoReset}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-[#1C2B27] hover:bg-slate-200 dark:hover:bg-[#23332F] text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors flex items-center gap-1 border border-slate-200 dark:border-[#2D3E3A] cursor-pointer"
            title="تصفير التحدي الأسبوعي لوضع التجربة"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#176B5B] dark:text-emerald-400" />
            <span className="hidden sm:inline">{language === 'en' ? 'Reset Demo' : 'تصفير تجريبي'}</span>
          </button>
        </div>

      </div>

      {/* ========================================================
          2. COMPREHENSIVE END-OF-TEST RESULTS & SCORE REPORT SCREEN
      ======================================================== */}
      {isTestCompleted ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Main Hero Summary Card */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-[#176B5B]/10 via-white to-amber-50/70 dark:from-[#176B5B]/20 dark:via-[#15201D] dark:to-amber-950/30 border border-[#176B5B]/30 dark:border-[#263834] rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-48 bg-radial from-[#176B5B]/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              
              {/* Right: Circular Gauge & Visual Grade */}
              <div className="flex flex-col items-center text-center shrink-0">
                <CircularScoreGauge score={overallScorePercentage} size={120} language={language} />
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#176B5B]/10 dark:bg-[#176B5B]/30 border border-[#176B5B]/20 dark:border-[#176B5B]/40 text-[#176B5B] dark:text-emerald-300 text-xs font-black">
                  <Award className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Final Integrity Grade' : 'الدرجة الأخلاقية النهائية'}</span>
                </div>
              </div>

              {/* Center: Title & Qualitative Evaluation */}
              <div className="space-y-2 flex-1 text-center md:text-start">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Weekly Challenge Completed Successfully!' : 'اكتمل التحدي الأسبوعي للأمانة والمواطنة بنجاح!'}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#18201D] dark:text-white">
                  {language === 'en' ? 'Ethical Evaluation & Performance Report' : 'سجل التقييم الأخلاقي والأداء الميداني'}
                </h2>

                <p className="text-xs sm:text-sm text-[#66706B] dark:text-[#94A39D] leading-relaxed max-w-2xl">
                  {currentUser.role === 'admin' ? (
                    language === 'en' ? (
                      <>Oversight review completed successfully! You have evaluated all <span className="font-bold text-[#18201D] dark:text-white">({INTEGRITY_SCENARIOS.length} scenarios)</span> and verified the official pedagogical decision matrix for school students.</>
                    ) : (
                      <>تمت المراجعة والاعتماد الإداري بنجاح! تم فحص كافة <span className="font-bold text-[#18201D] dark:text-white">({INTEGRITY_SCENARIOS.length} مواقف تربوية)</span> واعتماد بنك القرارات النموذجية المعتمدة لطلاب المدرسة.</>
                    )
                  ) : (
                    language === 'en' ? (
                      <>Well done! Your ethical decisions were recorded successfully, completing <span className="font-bold text-[#18201D] dark:text-white">({idealAnswersCount} of {INTEGRITY_SCENARIOS.length} scenarios)</span> with ideal scores, adding <span className="font-bold text-[#176B5B] dark:text-emerald-400">+{totalPointsEarned} integrity points</span> directly to student ({currentUser.name}) profile.</>
                    ) : (
                      <>أحسنتِ صنعاً! تم توثيق قراراتك الأخلاقية بنجاح واجتياز <span className="font-bold text-[#18201D] dark:text-white">({idealAnswersCount} من {INTEGRITY_SCENARIOS.length} مواقف)</span> بنتيجة نموذجية، وإضافة <span className="font-bold text-[#176B5B] dark:text-emerald-400">+{totalPointsEarned} نقطة أمانة</span> مباشرة إلى ملف الطالبة ({currentUser.name}).</>
                    )
                  )}
                </p>

                {/* Qualitative Badge Tag */}
                <div className="pt-1 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs font-black flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    {overallScorePercentage === 100 
                      ? (language === 'en' ? '🌟 Medal of Excellence & Complete Ethical Honor' : '🌟 وسام الامتياز والشرف الأخلاقي الكامل (سفير نموذجي)')
                      : overallScorePercentage >= 80
                      ? (language === 'en' ? '⭐ Very Distinguished - Challenge Passed with High Competence' : '⭐ مستوى متميز جداً - اجتياز التحدي بكفاءة عالية')
                      : overallScorePercentage >= 60
                      ? (language === 'en' ? '🛡️ Good Level - Demonstrated Responsibility & Citizenship' : '🛡️ مستوى جيد - تم إظهار وعي بالمسؤولية والمواطنة')
                      : (language === 'en' ? '🌱 Learning Stage - Review Guidelines Recommended' : '🌱 مرحلة اكتساب الخبرات - يوصى بمراجعة التوجيهات')}
                  </span>
                  {currentUser.role === 'admin' ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs font-black flex items-center gap-1.5">
                      <span>🏛️</span>
                      <span>{language === 'en' ? 'School Principal & Certified Authority' : 'إدارة المدرسة والجهة المعتمدة'}</span>
                    </span>
                  ) : (
                    <TrustBadge tier={currentUserTrustTier} size="sm" />
                  )}
                </div>
              </div>

            </div>

            {/* Quick Certificate & Leaderboard Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-slate-100 dark:border-[#23332F] mt-6 relative z-10">
              
              <button
                onClick={() => openCertificateModal(currentUser)}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>
                  {language === 'en' 
                    ? (currentUser.role === 'admin' ? 'Preview Student Certificate 📜' : 'Issue Official Certificate 📜')
                    : (currentUser.role === 'admin' ? 'معاينة شهادة الطلاب المعتمدة 📜' : 'استخراج شهادة النزاهة الرسمية 📜')}
                </span>
              </button>

              <Link
                href="/leaderboard"
                className="py-3 px-4 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>{language === 'en' ? 'Honor Board & School Leaders 🏆' : 'لوحة الشرف وأوائل المدرسة 🏆'}</span>
              </Link>

              <button
                onClick={handleDemoReset}
                className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-[#1C2B27] hover:bg-slate-200 dark:hover:bg-[#23332F] text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-[#2D3E3A] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#176B5B] dark:text-emerald-400" />
                <span>{language === 'en' ? 'Retake Challenge (Demo)' : 'إعادة خوض التحدي (Demo)'}</span>
              </button>

              <Link
                href="/"
                className="py-3 px-4 rounded-2xl bg-white dark:bg-[#182220] hover:bg-slate-50 dark:hover:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A] text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>{language === 'en' ? 'Back to Home' : 'العودة للرئيسية'}</span>
                {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </Link>

            </div>

          </div>

          {/* 4 Stat Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            <div className="p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">{language === 'en' ? 'Integrity Accuracy Rate' : 'نسبة الدقة والنزاهة'}</span>
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#18201D] dark:text-white">{overallScorePercentage}%</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">{language === 'en' ? 'Alignment with ethical standards' : 'معدل التوافق مع المعايير'}</p>
            </div>

            <div className="p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">{language === 'en' ? 'Ideal Scenarios' : 'المواقف النموذجية'}</span>
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#18201D] dark:text-white">{idealAnswersCount} / {INTEGRITY_SCENARIOS.length}</p>
              <p className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">{language === 'en' ? 'Approved ideal decisions' : 'قرارات مثالية معتمدة'}</p>
            </div>

            <div className="p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">{language === 'en' ? 'Points Earned' : 'النقاط المكتسبة'}</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#18201D] dark:text-white">+{totalPointsEarned}</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">{language === 'en' ? 'Integrity points added' : 'نقاط أمانة مضافة لرصيدك'}</p>
            </div>

            <div className="p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">{language === 'en' ? 'Trust Rank' : 'رتبة الثقة المدرسية'}</span>
                <ShieldCheck className="w-4 h-4 text-[#176B5B] dark:text-emerald-400" />
              </div>
              <div className="pt-0.5">
                <TrustBadge tier={currentUserTrustTier} size="md" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-[#94A39D] font-medium">{language === 'en' ? 'Current reliability tier' : 'مستوى الموثوقية الحالي'}</p>
            </div>

          </div>

          {/* Trust Tier Progression Bar Card */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#18201D] dark:text-white">
                    {language === 'en' ? 'Integrity Ambassador Rank Progression' : 'مسار التقدم في رتب سفراء النزاهة المدرسية'}
                  </h3>
                  <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
                    {language === 'en' ? (
                      <>Current balance: <span className="font-bold text-[#176B5B] dark:text-emerald-400">{userPoints} pts</span>{tierAdvancement.next && <span> — {tierAdvancement.remaining} pts remaining to ({tierAdvancement.next})</span>}</>
                    ) : (
                      <>رصيدك الحالي: <span className="font-bold text-[#176B5B] dark:text-emerald-400">{userPoints} نقطة أمانة</span>{tierAdvancement.next && <span> — متبقي {tierAdvancement.remaining} نقطة للوصول إلى ({tierAdvancement.next})</span>}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C2B27] text-slate-700 dark:text-slate-300">{language === 'en' ? 'Bronze (0)' : 'برونزي (0)'}</span>
                <span>←</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">{language === 'en' ? 'Silver (100)' : 'فضي (100)'}</span>
                <span>←</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300">{language === 'en' ? 'Gold (200+)' : 'ذهبي (200+)'}</span>
              </div>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-[#1C2B27] rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-[#2D3E3A]">
              <div 
                className="h-full bg-gradient-to-r from-[#176B5B] via-emerald-500 to-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${tierAdvancement.percent}%` }}
              />
            </div>
          </div>

          {/* All 5 Scenarios Comprehensive Review Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm sm:text-base font-black text-[#18201D] dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#176B5B] dark:text-emerald-400" />
                <span>{language === 'en' ? 'Review Decisions & Guidance for All 5 Scenarios:' : 'مراجعة القرارات والتوجيهات التربوية للمواقف الخمسة:'}</span>
              </h3>
              <span className="text-xs text-[#66706B] dark:text-[#94A39D] font-semibold">
                {language === 'en' ? `${INTEGRITY_SCENARIOS.length} Evaluated Scenarios` : `${INTEGRITY_SCENARIOS.length} مواقف مدروسة`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {INTEGRITY_SCENARIOS.map((rawS, index) => {
                const scenario = getLocalizedScenario(rawS, language);
                const answer = answersMap[scenario.id];
                const isAnswered = !!answer;
                const isIdeal = answer?.isIdeal;
                const chosenOption = scenario.questions[0].options.find((o) => o.id === answer?.optionId);

                return (
                  <div 
                    key={scenario.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      isIdeal 
                        ? 'bg-white dark:bg-[#15201D] border-emerald-300 dark:border-emerald-800/80 shadow-2xs hover:shadow-xs' 
                        : isAnswered 
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-2xs' 
                        : 'bg-white dark:bg-[#15201D] border-slate-200 dark:border-[#263834] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-black flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white">
                            {scenario.topicTitle}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-[#94A39D] flex items-center gap-1">
                            <Compass className="w-3 h-3" />
                            {scenario.visualDetails.locationBadge}
                          </span>
                        </div>
                      </div>

                      {isAnswered ? (
                        isIdeal ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>{language === 'en' ? 'Ideal Decision (100%)' : 'قرار نموذجي (100%)'}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-black flex items-center gap-1 shrink-0">
                            <AlertCircle className="w-3 h-3" />
                            <span>{language === 'en' ? `Partial (${answer.score}%)` : `قرار جزئي (${answer.score}%)`}</span>
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C2B27] text-slate-500 dark:text-[#94A39D] text-[10px] font-medium">
                          {language === 'en' ? 'Not Answered' : 'لم يُجب'}
                        </span>
                      )}
                    </div>

                    {/* Dilemma Quote */}
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#1C2B27] border border-slate-100 dark:border-[#2D3E3A] text-[11px] text-slate-700 dark:text-slate-300 italic">
                      «{scenario.dilemmaQuote}»
                    </div>

                    {/* Chosen Decision & Feedback */}
                    {chosenOption && (
                      <div className="space-y-1.5 text-[11px] pt-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          <span className="text-slate-500 dark:text-[#94A39D] font-normal">{language === 'en' ? 'Your decision: ' : 'قرارك: '}</span>
                          {chosenOption.text}
                        </p>

                        {chosenOption.score < 100 && chosenOption.whyWrong && (
                          <div className="p-2 rounded-lg bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200">
                            <span className="font-bold text-rose-800 dark:text-rose-400">{language === 'en' ? '❌ Educational Analysis: ' : '❌ التحليل التربوي: '}</span>
                            <span>{chosenOption.whyWrong}</span>
                          </div>
                        )}

                        <div className="p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200">
                          <span className="font-bold text-emerald-800 dark:text-emerald-400">{language === 'en' ? '✅ Approved Action: ' : '✅ التوجيه المعتمد: '}</span>
                          <span>{chosenOption.correctActionText || chosenOption.feedback}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* ========================================================
            3. ZERO-SCROLL SINGLE-SCREEN CINEMA DASHBOARD (SPLIT GRID)
        ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* ========================================================
              RIGHT COLUMN: IMMERSIVE CINEMA PLAYER + SCENARIO STORY + COGNITIVE BASIS (5 COLS)
          ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            
            {/* Cinema Video Container */}
            <div className="rounded-2xl bg-[#0F172A] text-white border border-slate-800 overflow-hidden shadow-lg flex-1 flex flex-col justify-between">
              
              {/* Scene Info Bar */}
              <div className="px-3 py-2 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#176B5B] text-white flex items-center gap-1 shadow-2xs">
                    <Compass className="w-3 h-3" />
                    {activeScenario.visualDetails.locationBadge}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {activeScenario.visualDetails.roomLabel}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isAudioMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                  >
                    {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="px-2.5 py-1 rounded-full bg-[#176B5B] hover:bg-[#125648] text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{isPlaying ? (language === 'en' ? 'Pause ⏸️' : 'إيقاف ⏸️') : (language === 'en' ? 'Play Video ▶️' : 'تشغيل المشهد ▶️')}</span>
                  </button>
                </div>
              </div>

              {/* Visual Scene Screen */}
              <div className="relative aspect-[16/10] w-full bg-slate-950 flex flex-col justify-between p-3.5 overflow-hidden">
                {/* Photorealistic AI Scene Background with Continuous Ken Burns Camera Movement */}
                {activeScenario.visualDetails.sceneImageUrl ? (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={activeScenario.visualDetails.sceneImageUrl}
                      alt={activeScenario.title}
                      className={`w-full h-full object-cover animate-ken-burns ${
                        isPlaying ? '' : 'animate-ken-burns-paused'
                      }`}
                    />
                    {/* Cinematic Dark Gradient Vignette Overlay for UI Clarity */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/70" />
                  </div>
                ) : (
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#176B5B_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                )}
                
                {/* Viewfinder Camera Brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500/40 pointer-events-none" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500/40 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500/40 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500/40 pointer-events-none" />

                {/* Live Stream / Scenario Note Badge */}
                <div className="relative z-10 flex items-center justify-between text-[10px]">
                  <span className="px-2.5 py-1 rounded-lg bg-black/85 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>{activeScenario.visualDetails.promptNote}</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>{language === 'en' ? 'AI Human Simulation' : 'محاكاة واقعية بالذكاء الاصطناعي'}</span>
                    </span>
                    <div className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Radio className="w-2.5 h-2.5 animate-pulse text-rose-400" />
                      <span>REC 1080p</span>
                    </div>
                  </div>
                </div>

                {/* Center Play/Pause Interactive Ripple Button & Audio Prompt */}
                <div className="relative z-10 my-auto text-center flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="py-2.5 px-5 rounded-full bg-gradient-to-r from-[#176B5B] to-emerald-500 hover:from-[#125648] hover:to-emerald-400 text-white flex items-center gap-2 shadow-2xl shadow-emerald-950/90 hover:scale-105 active:scale-95 transition-all ring-4 ring-white/20 group cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 text-white fill-current" />
                        <span className="text-xs font-black">{language === 'en' ? 'Pause Video' : 'إيقاف المشهد'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 text-white fill-current" />
                        <span className="text-xs font-black">{language === 'en' ? '▶️ Play Video & Audio' : '▶️ تشغيل الفيديو والمحاكاة الصوتية'}</span>
                      </>
                    )}
                  </button>
                  
                  {/* Simulated Voice Waveform */}
                  {!isAudioMuted && isPlaying && (
                    <div className="flex items-center justify-center gap-1.5 mt-1 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-300 font-bold ml-1">{language === 'en' ? 'Playing Audio' : 'جاري تشغيل الصوت'}</span>
                      <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1 h-4.5 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1 h-6 bg-amber-300 rounded-full animate-bounce [animation-delay:300ms]" />
                      <span className="w-1 h-4 bg-teal-400 rounded-full animate-bounce [animation-delay:450ms]" />
                      <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:200ms]" />
                    </div>
                  )}
                </div>

                {/* Dilemma Quote Box inside Cinema Screen */}
                <div className="relative z-10 space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/20 text-center shadow-md">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[9px] font-bold text-slate-400">
                        {language === 'en' ? '💬 Simulated Dialogue:' : '💬 الحوار المحاكي للموقف:'}
                      </span>
                      <button
                        type="button"
                        onClick={playScenarioAudio}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-black flex items-center gap-1 cursor-pointer bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{language === 'en' ? 'Replay Voice 🔊' : 'إعادة نطق الحوار 🔊'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] sm:text-xs font-black text-amber-200 leading-snug">
                      «{activeScenario.dilemmaQuote}»
                    </p>
                  </div>

                  {/* Progress Timeline */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-300 font-bold">
                      00:{String(playedSeconds % 60).padStart(2, '0')}
                    </span>
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#176B5B] via-emerald-400 to-amber-300 transition-all duration-300 rounded-full"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-300 font-bold">{activeScenario.duration}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* School Dilemma Story Box */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] shadow-2xs space-y-1 text-start">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#176B5B] dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Real-world Context:' : 'سياق الموقف الواقعي:'}</span>
                </span>
                <span className="text-slate-500 dark:text-[#94A39D] font-semibold">{activeScenario.badgeName}</span>
              </div>
              <p className="text-xs text-[#18201D] dark:text-white leading-relaxed font-medium">
                {activeScenario.detailedDilemma}
              </p>
            </div>

            {/* Cognitive Basis Card */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-2.5 shadow-2xs">
              <div className="p-1.5 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-black text-amber-900 dark:text-amber-300 block text-[11px]">
                  {language === 'en' ? '💡 Cognitive Basis & Rationale (CBT):' : '💡 الأساس المعرفي والتربوي (CBT):'}
                </span>
                <p className="font-semibold text-[11px] leading-snug text-amber-950 dark:text-amber-200">
                  {activeScenario.cognitiveBasis}
                </p>
              </div>
            </div>

          </div>

          {/* ========================================================
              LEFT COLUMN: 4 NUMBERED PILL OPTIONS + INLINE FEEDBACK (7 COLS)
          ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3 bg-white dark:bg-[#15201D] p-4 sm:p-5 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs">
            
            <div className="space-y-1 border-b border-slate-100 dark:border-[#23332F] pb-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-black text-[#18201D] dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#176B5B] dark:text-emerald-400" />
                  <span>{language === 'en' ? 'What is your decision and action in this scenario?' : 'ما هو قرارك وتصرفك في هذا الموقف؟'}</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                  {language === 'en' ? '+10 Integrity Points' : '+10 نقاط للأمانة'}
                </span>
              </div>
              <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
                {language === 'en' ? 'Select the ethical course of action to evaluate the dilemma and receive instant pedagogical feedback:' : 'اختر التصرف الأخلاقي السليم لتحليل الموقف والحصول على التوجيه التربوي الفوري:'}
              </p>
            </div>

            {/* 4 Numbered Pill Options */}
            <div className="grid grid-cols-1 gap-2.5 my-auto">
              {primaryQuestion?.options.map((option, optIdx) => {
                const isSelected = selectedOptionId === option.id;
                const isIdeal = option.score === 100;
                const hasAnswered = !!selectedOptionId;

                let buttonStyles = 'bg-slate-50/70 dark:bg-[#1C2B27]/80 border-slate-200 dark:border-[#2D3E3A] hover:border-[#176B5B] hover:bg-[#176B5B]/5 dark:hover:bg-[#176B5B]/20 shadow-2xs text-slate-800 dark:text-slate-200';
                let badgeStyles = 'bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 group-hover:bg-[#176B5B] group-hover:text-white group-hover:border-[#176B5B]';

                if (hasAnswered) {
                  if (isSelected) {
                    if (isIdeal) {
                      buttonStyles = 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-400/50 font-bold';
                      badgeStyles = 'bg-emerald-600 text-white border-emerald-600';
                    } else {
                      buttonStyles = 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-400 dark:border-rose-500 text-rose-950 dark:text-rose-200 ring-2 ring-rose-400/50 font-bold';
                      badgeStyles = 'bg-rose-600 text-white border-rose-600';
                    }
                  } else {
                    buttonStyles = 'bg-slate-50/40 dark:bg-[#1C2B27]/40 border-slate-100 dark:border-[#23332F] text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed';
                    badgeStyles = 'bg-slate-100 dark:bg-[#1C2B27] text-slate-400 dark:text-slate-600 border-slate-100 dark:border-[#23332F]';
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option)}
                    disabled={hasAnswered}
                    className={`w-full p-3 sm:p-3.5 rounded-xl border text-start transition-all flex items-center justify-between gap-3 group cursor-pointer ${buttonStyles}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      
                      {/* Circular Number Badge (1, 2, 3, 4) */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-colors shadow-2xs ${badgeStyles}`}>
                        {hasAnswered && isSelected ? (
                          isIdeal ? <Check className="w-4 h-4 stroke-[3]" /> : <XCircle className="w-4 h-4" />
                        ) : (
                          <span>{optIdx + 1}</span>
                        )}
                      </div>

                      {/* Option Text */}
                      <p className="text-xs sm:text-sm font-semibold leading-snug">
                        {option.text}
                      </p>
                    </div>

                    <div className="shrink-0 text-slate-400 group-hover:text-[#176B5B] group-hover:translate-x-[-2px] transition-transform">
                      {hasAnswered && isSelected ? (
                        isIdeal ? (
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            {language === 'en' ? 'Ideal Decision 🌟' : 'قرار نموذجي 🌟'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                            {language === 'en' ? 'Needs Review ⚠️' : 'يحتاج مراجعة ⚠️'}
                          </span>
                        )
                      ) : (
                        isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Card with Next Scenario Button in the SAME VIEW */}
            {selectedOption ? (
              <div className={`p-4 rounded-2xl border shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                selectedOption.score === 100
                  ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 dark:from-emerald-950/40 dark:via-[#15201D] dark:to-teal-950/30 border-emerald-300 dark:border-emerald-800'
                  : 'bg-gradient-to-br from-rose-50 via-white to-amber-50/40 dark:from-rose-950/40 dark:via-[#15201D] dark:to-amber-950/30 border-rose-300 dark:border-rose-800'
              }`}>
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      selectedOption.score === 100 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {selectedOption.score === 100 ? (
                        <Trophy className="w-4 h-4 text-amber-200" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[#18201D] dark:text-white">
                        {selectedOption.score === 100 ? (language === 'en' ? '🌟 Ideal Decision (100%)' : '🌟 قرار مثالي نموذجي (100%)') : (language === 'en' ? `⚠️ Suboptimal Decision (${selectedOption.score}%)` : `⚠️ قرار غير سليم (${selectedOption.score}%)`)}
                      </h4>
                      <p className="text-[10px] text-[#66706B] dark:text-[#94A39D] font-semibold">
                        {selectedOption.score === 100 ? (language === 'en' ? '+10 integrity points awarded' : 'تم احتساب +10 نقاط أمانة') : (language === 'en' ? '0 pts - Ethical awareness reinforcement' : '0 نقطة - تعزيز الوعي الأخلاقي')}
                      </p>
                    </div>
                  </div>

                  {/* Next Step Action Button */}
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2.5 min-h-[42px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 text-xs font-black shadow-md shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>
                      {activeScenarioIndex === INTEGRITY_SCENARIOS.length - 1
                        ? (language === 'en' ? 'Final Results & Certificate 🏆' : 'النتيجة النهائية والشهادة 🏆')
                        : (language === 'en' ? 'Next Scenario' : 'الموقف التالي')}
                    </span>
                    {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>

                {/* Pedagogical Explanation Breakdown */}
                <div className="space-y-2 text-[11px] pt-1">
                  {selectedOption.score < 100 && selectedOption.whyWrong && (
                    <div className="p-2.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200">
                      <span className="font-black text-rose-800 dark:text-rose-400">{language === 'en' ? '❌ Educational Analysis & Error Reason: ' : '❌ التحليل التربوي وسبب الخطأ: '}</span>
                      <span>{selectedOption.whyWrong}</span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200">
                    <span className="font-black text-emerald-800 dark:text-emerald-400">{language === 'en' ? '✅ Approved Correct Action: ' : '✅ التصرف الصحيح المعتمد: '}</span>
                    <span>{selectedOption.correctActionText || selectedOption.feedback}</span>
                  </div>
                </div>

              </div>
            ) : (
              /* Helpful Pedagogical Tip when idle */
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-[#176B5B] dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-900 dark:text-white">{language === 'en' ? 'Integrity Ambassador Tip: ' : 'نصيحة سفير النزاهة: '}</span>
                  {language === 'en' ? 'Consistent ethical decisions strengthen administration trust in your reports and advance your school rank. Review carefully before choosing.' : 'القرارات الأخلاقية الراسخة تعزز ثقة الإدارة ببلاغاتك وترفع رتبتك المدرسية. اقرأ الموقف بعناية قبل الاختيار.'}
                </p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default function IntegrityPage() {
  const { currentUser } = useApp();

  if (currentUser.role === 'admin') {
    return <AdminIntegritySupervisionView />;
  }

  return <StudentIntegrityFlow />;
}
