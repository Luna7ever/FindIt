'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MORAL_DILEMMAS, calculateIntegrityReport } from '@/data/moralBankData';
import { MoralUserChoice, IntegrityReport } from '@/types/moral';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Shield, 
  Lightbulb, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  BookOpen,
  HelpCircle,
  BrainCircuit,
  Clock,
  ChevronLeft
} from 'lucide-react';

export default function MoralBankPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [userChoices, setUserChoices] = useState<MoralUserChoice[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalReport, setFinalReport] = useState<IntegrityReport | null>(null);

  const currentDilemma = MORAL_DILEMMAS[currentIndex];

  const handleSelectOption = (idx: number) => {
    setSelectedOptionIndex(idx);
    setShowAnalysisModal(true);
  };

  const handleNextSituation = () => {
    if (selectedOptionIndex === null) return;

    const newChoice: MoralUserChoice = {
      dilemmaId: currentDilemma.id,
      optionIndex: selectedOptionIndex,
      selectedOption: currentDilemma.options[selectedOptionIndex],
    };

    const updatedChoices = [...userChoices, newChoice];
    setUserChoices(updatedChoices);
    setShowAnalysisModal(false);
    setSelectedOptionIndex(null);
    setIsPlaying(false);

    if (currentIndex + 1 < MORAL_DILEMMAS.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate final integrity report
      const report = calculateIntegrityReport(updatedChoices);
      setFinalReport(report);
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserChoices([]);
    setSelectedOptionIndex(null);
    setShowAnalysisModal(false);
    setIsCompleted(false);
    setFinalReport(null);
    setIsPlaying(false);
  };

  // Visual Scene Illustrations for each scenario
  const renderScenarioVisual = (id: number) => {
    switch (id) {
      case 1:
        // Academic Cheating / Exam Scene
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0F2D4A] to-[#0A192F] relative p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="w-48 h-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-2xl flex flex-col justify-between relative z-10 animate-pulse">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[9px] font-bold text-[#FFD700]">ورقة اختبار أكاديمي</span>
                <span className="text-[8px] text-white/60">قاعة 302</span>
              </div>
              <div className="space-y-1.5 py-1">
                <div className="h-1.5 bg-white/30 rounded-full w-3/4" />
                <div className="h-1.5 bg-white/20 rounded-full w-5/6" />
                <div className="h-1.5 bg-[#FFD700]/50 rounded-full w-1/2" />
              </div>
              <div className="flex items-center justify-between pt-1 text-[8px] text-amber-300">
                <span>⚠️ صاحبك: &quot;ساعدني بسرعة&quot;</span>
              </div>
            </div>
          </div>
        );
      case 2:
        // Job Connections / Wasta Scene
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#122A45] to-[#08182B] relative p-6 overflow-hidden">
            <div className="w-52 h-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-2xl flex flex-col justify-between relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[9px] font-bold text-[#FFD700]">طلب توظيف بالشركة</span>
                <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">فرصة عمل</span>
              </div>
              <div className="flex items-center gap-3 my-auto">
                <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#FFD700]" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white">اتصال بالمسؤول</p>
                  <p className="text-[8px] text-white/60">واسطة أم استحقاق شخصي؟</p>
                </div>
              </div>
              <div className="text-[8px] text-sky-300 text-right">
                💼 &quot;بابا بيكلم حد في الإدارة...&quot;
              </div>
            </div>
          </div>
        );
      case 3:
        // Extra Money / Cashier Scene
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0B3340] to-[#061C24] relative p-6 overflow-hidden">
            <div className="w-48 h-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-2xl flex flex-col justify-between relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[9px] font-bold text-[#FFD700]">إيصال كاشير</span>
                <span className="text-[8px] text-white/60">خطأ في الحساب</span>
              </div>
              <div className="my-auto text-center py-1">
                <span className="text-xl font-black text-[#FFD700] tracking-wider block">+ 200 ج.م</span>
                <span className="text-[9px] text-white/70">مبلغ زائد عن المستحق</span>
              </div>
              <div className="text-[8px] text-emerald-300 text-right">
                💵 هل تحتفظ بها أم تعيدها فوراً؟
              </div>
            </div>
          </div>
        );
      case 4:
        // Stolen Idea / Presentation Scene
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E2342] to-[#0A1026] relative p-6 overflow-hidden">
            <div className="w-52 h-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-2xl flex flex-col justify-between relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[9px] font-bold text-[#FFD700]">عرض مشروع التخرج</span>
                <span className="text-[8px] text-rose-300">حق الملكية الفكرية</span>
              </div>
              <div className="my-auto flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white">فكرتك مقدمة باسم زميلك</p>
                  <p className="text-[8px] text-white/60">أمام الدكتور واللجنة</p>
                </div>
              </div>
              <div className="text-[8px] text-amber-300 text-right">
                ⚖️ كيف تسترد حقك بالنزاهة والعدالة؟
              </div>
            </div>
          </div>
        );
      case 5:
      default:
        // Silent Bullying / Peer Pressure Scene
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2D1B4E] to-[#120B24] relative p-6 overflow-hidden">
            <div className="w-52 h-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-2xl flex flex-col justify-between relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[9px] font-bold text-[#FFD700]">موقف بين الأقران</span>
                <span className="text-[8px] text-purple-300">شجاعة أدبية</span>
              </div>
              <div className="my-auto text-right py-1">
                <p className="text-[10px] font-bold text-white leading-tight">سخرية وضغط جماعي على طالبة جديدة</p>
                <p className="text-[8px] text-white/60 mt-0.5">&quot;تعالي اضحكي معانا...&quot;</p>
              </div>
              <div className="text-[8px] text-[#FFD700] text-right">
                🛡️ هل تصمت أم تتخذ موقف الشجاعة؟
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#07192C] text-white selection:bg-[#FFD700] selection:text-[#0A2540] py-6 sm:py-10 px-4 sm:px-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-md mx-auto space-y-6">

        {/* ========================================================
            VIEW 1: ACTIVE SITUATION FLOW (1 of 5)
        ======================================================== */}
        {!isCompleted && (
          <div className="space-y-5 animate-in fade-in duration-300">
            
            {/* Top Bar Navigation & Brand */}
            <div className="flex items-center justify-between text-right">
              <Link
                href="/"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white transition-colors"
                title="العودة للرئيسية"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-[#FFD700]">
                  <Shield className="w-4 h-4" />
                  <h1 className="text-sm sm:text-base font-black tracking-wide">بنك المواقف الأخلاقية</h1>
                </div>
                <p className="text-[11px] text-white/60 font-medium">محاكاة تفاعلية لاتخاذ القرار الأخلاقي</p>
              </div>
              <div className="w-8" />
            </div>

            {/* Segmented Progress Bar (1 of 5) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-[#FFD700]">الموقف {currentIndex + 1} من {MORAL_DILEMMAS.length}</span>
                <span className="text-[11px] text-white/60">{currentDilemma.title}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {MORAL_DILEMMAS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'bg-[#FFD700] shadow-[0_0_12px_#FFD700]'
                        : i < currentIndex
                        ? 'bg-[#FFD700]/60'
                        : 'bg-white/15'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 16:9 Video Card / Visual Simulation */}
            <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/20 shadow-2xl bg-[#0A2540] group">
              {renderScenarioVisual(currentDilemma.id)}

              {/* Frosted Play Overlay */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center transition-all">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-transform active:scale-95 group-hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-[-1px]" />
                  )}
                </button>
              </div>

              {/* Status and Theory Tag on Video */}
              <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/90">
                  {currentDilemma.title}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#FFD700]/20 backdrop-blur-md border border-[#FFD700]/40 text-[9px] font-bold text-[#FFD700]">
                  {isPlaying ? '▶ جاري العرض' : '⏸ انقر للمعاينة'}
                </span>
              </div>

              {/* Scenario Description Subtitle */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-right">
                <p className="text-xs font-semibold text-white/90 leading-snug">
                  «{currentDilemma.video_desc}»
                </p>
              </div>
            </div>

            {/* Scientific Theory Badge */}
            <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-right">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#FFD700]" />
                <span className="text-[11px] text-white/80 font-medium">الأساس المعرفي: {currentDilemma.theory}</span>
              </div>
              <BookOpen className="w-3.5 h-3.5 text-white/40" />
            </div>

            {/* 4 Interactive Decision Buttons */}
            <div className="space-y-2.5 pt-1">
              <span className="block text-xs font-bold text-white/80 text-right pr-1">
                ما هو قرارك وتصرفك في هذا الموقف؟
              </span>
              <div className="space-y-2">
                {currentDilemma.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="w-full p-4 rounded-2xl bg-[#0A2540]/60 hover:bg-[#0A2540]/90 backdrop-blur-xl border border-white/15 hover:border-[#FFD700]/60 transition-all text-right shadow-lg hover:shadow-[0_0_15px_rgba(255,215,0,0.15)] flex items-center justify-between gap-3 group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#FFD700] text-white group-hover:text-[#0A2540] flex items-center justify-center text-xs font-black transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white/95 group-hover:text-white">
                        {option.text}
                      </span>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-[#FFD700] group-hover:translate-x-[-3px] transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            POPUP MODAL: ANSWER ANALYSIS (تحليل اختيارك)
        ======================================================== */}
        {showAnalysisModal && selectedOptionIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-[#0A2540]/90 backdrop-blur-2xl border border-white/20 p-6 space-y-5 text-right shadow-2xl animate-in zoom-in-95">
              
              {/* Modal Header */}
              <div className="flex items-center justify-center gap-2 border-b border-white/10 pb-3">
                <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-[#FFD700]" />
                </div>
                <h3 className="text-base font-black text-white">تحليل اختيارك</h3>
              </div>

              {/* Chosen Option Review */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/60 block mb-0.5">اختيارك الحالي:</span>
                <p className="text-xs font-bold text-[#FFD700]">
                  «{currentDilemma.options[selectedOptionIndex].text}»
                </p>
              </div>

              {/* Two Analysis Boxes */}
              <div className="space-y-2.5">
                {/* Reason Box */}
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-1 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>السبب السلوكي:</span>
                  </div>
                  <p className="text-xs text-white/90 pr-3.5 font-medium leading-relaxed">
                    {currentDilemma.options[selectedOptionIndex].reason}
                  </p>
                </div>

                {/* Alternative Box */}
                <div className="p-3.5 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 space-y-1 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-[#FFD700] font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
                    <span>البديل المعرفي والنزاهة:</span>
                  </div>
                  <p className="text-xs text-white/95 pr-3.5 font-medium leading-relaxed">
                    {currentDilemma.options[selectedOptionIndex].alternative}
                  </p>
                </div>
              </div>

              {/* Theory Reference */}
              <div className="text-[10px] text-white/60 text-center">
                مؤطر علمياً وفق: <span className="text-white/80 font-bold">{currentDilemma.theory}</span>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextSituation}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#FFD700] hover:bg-[#E5C200] text-[#0A2540] font-black text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{currentIndex + 1 < MORAL_DILEMMAS.length ? 'الموقف التالي ←' : 'عرض لوحة مؤشر النزاهة 🏆'}</span>
              </button>

            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 2: INTEGRITY DASHBOARD (مؤشر النزاهة الخاص بك)
        ======================================================== */}
        {isCompleted && finalReport && (
          <div className="space-y-6 animate-in zoom-in-95 duration-500 text-right">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/40 text-[#FFD700] text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>تقرير السلوك الأخلاقي والنزاهة</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">مؤشر النزاهة الخاص بك</h2>
              <p className="text-xs text-white/60">تحليل القرارات المتخذة عبر المواقف الخمسة</p>
            </div>

            {/* Circular Gauge Card */}
            <div className="p-6 rounded-3xl bg-[#0A2540]/80 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* SVG Circular Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#FFD700"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - finalReport.scorePercentage / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Inner Center Gauge Glass */}
                <div className="absolute inset-4 rounded-full bg-[#0A2540]/90 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-3xl sm:text-4xl font-black text-[#FFD700] tracking-tight">
                    {finalReport.scorePercentage}%
                  </span>
                  <span className="text-[10px] text-white/70 font-bold mt-0.5">معدل النزاهة</span>
                </div>
              </div>
              <p className="text-xs text-white/80 mt-3 max-w-xs leading-relaxed">
                {finalReport.scorePercentage >= 80
                  ? '🌟 أداء أخلاقي رفيع! تتمتع بشجاعة عالية ونزاهة استثنائية في أصعب المواقف.'
                  : finalReport.scorePercentage >= 60
                  ? '👍 وعي أخلاقي جيد مع فرصة لتعزيز الشجاعة والمواجهة الإيجابية.'
                  : '💡 تجربة مهمة لترسيخ مبادئ الأمانة والاستقلالية ومقاومة الضغوط.'}
              </p>
            </div>

            {/* Line Chart Card: Progress over 5 situations */}
            <div className="p-5 rounded-3xl bg-[#0A2540]/80 backdrop-blur-2xl border border-white/20 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FFD700]" />
                  <h4 className="text-xs font-bold text-white">تطورك خلال المواقف الـ 5</h4>
                </div>
                <span className="text-[10px] text-white/50">مسار القرارات</span>
              </div>

              {/* Chart SVG */}
              <div className="h-28 w-full pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#FFD700" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

                  {/* Area fill */}
                  <path
                    d={`M 0,100 L 0,${100 - (finalReport.trendScores[0] || 50)} L 80,${100 - (finalReport.trendScores[0] || 50)} L 160,${100 - (finalReport.trendScores[1] || 60)} L 240,${100 - (finalReport.trendScores[2] || 70)} L 320,${100 - (finalReport.trendScores[3] || 75)} L 400,${100 - (finalReport.trendScores[4] || 85)} L 400,100 Z`}
                    fill="url(#chartGrad)"
                  />

                  {/* Smooth Trend Line */}
                  <path
                    d={`M 0,${100 - (finalReport.trendScores[0] || 50)} Q 80,${100 - (finalReport.trendScores[1] || 60)} 160,${100 - (finalReport.trendScores[1] || 60)} T 240,${100 - (finalReport.trendScores[2] || 70)} T 320,${100 - (finalReport.trendScores[3] || 75)} T 400,${100 - (finalReport.trendScores[4] || 85)}`}
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="3"
                    className="drop-shadow-[0_0_8px_#FFD700]"
                  />

                  {/* Data Points */}
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const cx = idx * 100;
                    const val = finalReport.trendScores[idx] || 60;
                    const cy = Math.max(15, Math.min(85, 100 - val));
                    return (
                      <circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r="4.5"
                        fill="#0A2540"
                        stroke="#FFD700"
                        strokeWidth="2.5"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Situation Labels */}
              <div className="flex justify-between text-[9px] text-white/50 px-1 pt-1">
                <span>موقف 1</span>
                <span>موقف 2</span>
                <span>موقف 3</span>
                <span>موقف 4</span>
                <span>موقف 5</span>
              </div>
            </div>

            {/* 3 Value Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#0A2540]/80 backdrop-blur-xl border border-white/15 text-center space-y-1">
                <Shield className="w-4 h-4 text-[#FFD700] mx-auto" />
                <span className="text-[10px] text-white/60 block">الأمانة</span>
                <span className="text-sm sm:text-base font-black text-white">{finalReport.honestyScore}%</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0A2540]/80 backdrop-blur-xl border border-white/15 text-center space-y-1">
                <Award className="w-4 h-4 text-[#FFD700] mx-auto" />
                <span className="text-[10px] text-white/60 block">الشجاعة</span>
                <span className="text-sm sm:text-base font-black text-white">{finalReport.moralCourageScore}%</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0A2540]/80 backdrop-blur-xl border border-white/15 text-center space-y-1">
                <Sparkles className="w-4 h-4 text-[#FFD700] mx-auto" />
                <span className="text-[10px] text-white/60 block">الاستقلالية</span>
                <span className="text-sm sm:text-base font-black text-white">{finalReport.independenceScore}%</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleRestart}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#FFD700] hover:bg-[#E5C200] text-[#0A2540] font-black text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة التجربة والمواقف</span>
              </button>

              <Link
                href="/"
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>العودة للصفحة الرئيسية</span>
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
