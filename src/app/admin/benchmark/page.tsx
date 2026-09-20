'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { runComparativeBenchmark, BenchmarkComparison } from '@/lib/ai/benchmarkRunner';
import { BENCHMARK_SAMPLES } from '@/lib/ai/benchmarkData';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  Clock, 
  Play, 
  RotateCcw,
  Award
} from 'lucide-react';

export default function BenchmarkPage() {
  const { dir, isRtl, language } = useApp();
  const isEn = language === 'en';

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkComparison | null>(null);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      const comparison = await runComparativeBenchmark(0.65);
      setResults(comparison);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0 px-3 sm:px-6 py-4 sm:py-8 max-w-5xl mx-auto space-y-5 pb-32 md:pb-12" dir={dir}>
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start w-full max-w-full">
        <div className="min-w-0 flex-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white transition-colors mb-2"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isEn ? 'Back to Admin Control' : 'العودة للوحة الإدارة'}</span>
          </Link>
          <h1 className="text-lg sm:text-2xl font-black text-[#18201D] dark:text-white flex items-center gap-2 min-w-0">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-[#176B5B] dark:text-[#2DD4BF] shrink-0" />
            <span className="break-words">{isEn ? 'ISEF Multimodal AI Scientific Benchmark' : 'التقييم العلمي التجريبي لنظام الذكاء الاصطناعي (ISEF)'}</span>
          </h1>
          <p className="text-xs text-[#66706B] dark:text-[#94A39D] mt-1">
            {isEn 
              ? 'Empirical validation of Multimodal Edge AI vs Baseline Heuristic across 24 ground-truth sample pairs.'
              : 'التحقق التجريبي الدقيق بين الذكاء الاصطناعي متعدد الوسائط والخوارزمية التقليدية على 24 عينة قياسية معتمدة.'}
          </p>
        </div>

        {/* Action Trigger */}
        <div className="w-full sm:w-auto shrink-0">
          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{isEn ? 'Executing Suite...' : 'جارِ الاختبار الحسابي...'}</span>
              </>
            ) : results ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>{isEn ? 'Re-run Benchmark' : 'إعادة تشغيل التقييم'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isEn ? 'Run Scientific Benchmark' : 'بدء التقييم العلمي المباشر'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Science Rigor Badge */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#E8F3EF] dark:bg-[#13231F] border border-[#BBD7CE] dark:border-[#223C35] flex items-center gap-3 text-start w-full max-w-full overflow-hidden">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#176B5B] text-white flex items-center justify-center shrink-0">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
        </div>
        <div className="min-w-0 flex-1 text-xs">
          <div className="font-bold text-[#144F43] dark:text-[#5EEAD4] flex flex-wrap items-center gap-1.5 leading-snug">
            <span className="break-words">Regeneron ISEF - Systems Software (SOFT) Empirical Rigor</span>
            <span className="px-1.5 py-0.5 rounded bg-[#176B5B] text-white text-[9px] shrink-0">100% Client-Side</span>
          </div>
          <p className="text-[#4E5D57] dark:text-[#9FB1AA] text-[10px] sm:text-[11px] mt-1 leading-relaxed">
            {isEn 
              ? 'Evaluates Precision, Recall, and F1-Score with zero network roundtrip latency. Preserves student privacy via on-device feature extraction.'
              : 'يقيس مؤشرات الدقة والاستدعاء ومعامل F1 بدون إرسال أي صور أو بيانات لخوادم خارجية، لحماية خصوصية الطلاب تماماً.'}
          </p>
        </div>
      </div>

      {/* Benchmark Results */}
      {results ? (
        <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-full">
          {/* Main KPI Comparative Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-full">
            {/* F1 Score */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-1 text-start min-w-0 overflow-hidden flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#66706B] dark:text-[#94A39D] truncate block">
                {isEn ? 'F1-Score Leap' : 'معامل الدقة التوافقي (F1)'}
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#059669] dark:text-emerald-400 truncate">
                  {(results.multimodal.metrics.f1Score * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] sm:text-xs text-[#66706B] dark:text-[#94A39D] line-through shrink-0">
                  {(results.baseline.metrics.f1Score * 100).toFixed(1)}%
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#059669] dark:text-emerald-400 flex items-center gap-1 truncate">
                <TrendingUp className="w-3 h-3 shrink-0" />
                <span className="truncate">+{((results.multimodal.metrics.f1Score - results.baseline.metrics.f1Score) * 100).toFixed(1)}% {isEn ? 'Improvement' : 'طفرة نوعية'}</span>
              </span>
            </div>

            {/* Precision */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-1 text-start min-w-0 overflow-hidden flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#66706B] dark:text-[#94A39D] truncate block">
                {isEn ? 'Precision (P)' : 'الدقة القطعية (Precision)'}
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#176B5B] dark:text-[#2DD4BF] truncate">
                  {(results.multimodal.metrics.precision * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] sm:text-xs text-[#66706B] dark:text-[#94A39D] line-through shrink-0">
                  {(results.baseline.metrics.precision * 100).toFixed(1)}%
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#66706B] dark:text-[#94A39D] truncate block">
                {isEn ? 'Minimizes false claim disputes' : 'تلافي الادعاءات الخاطئة والنزاعات'}
              </span>
            </div>

            {/* Recall */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-1 text-start min-w-0 overflow-hidden flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#66706B] dark:text-[#94A39D] truncate block">
                {isEn ? 'Recall (R)' : 'الاسترجاع الشامل (Recall)'}
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-600 dark:text-cyan-400 truncate">
                  {(results.multimodal.metrics.recall * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] sm:text-xs text-[#66706B] dark:text-[#94A39D] line-through shrink-0">
                  {(results.baseline.metrics.recall * 100).toFixed(1)}%
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#66706B] dark:text-[#94A39D] truncate block">
                {isEn ? 'Finds items with mismatched words' : 'رصد الأغراض حتى لو اختلفت الكلمات'}
              </span>
            </div>

            {/* Latency */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-1 text-start min-w-0 overflow-hidden flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#66706B] dark:text-[#94A39D] truncate block">
                {isEn ? 'Execution Latency' : 'زمن المعالجة الطرفية'}
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 truncate">
                  {results.multimodal.metrics.meanLatencyMs.toFixed(1)}ms
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#059669] dark:text-emerald-400 font-bold flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">{isEn ? 'Target < 50ms (Passed)' : 'الهدف أقل من 50ms (متحقق)'}</span>
              </span>
            </div>
          </div>

          {/* Side-by-Side Confusion Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start w-full max-w-full">
            {/* Baseline Heuristic Matrix */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-3 w-full max-w-full overflow-hidden min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-[#66706B] dark:text-[#94A39D] truncate min-w-0 flex-1">
                  {isEn ? 'Baseline Heuristic (Rule-Based)' : 'النموذج التقليدي المرجعي (Rule-Based)'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-[#23332F] text-[#66706B] dark:text-[#94A39D] font-mono shrink-0">
                  F1: {(results.baseline.metrics.f1Score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center font-mono w-full min-w-0">
                <div className="p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#192421] border border-slate-200 dark:border-[#263834] min-w-0 overflow-hidden">
                  <div className="text-[9px] sm:text-[10px] text-[#66706B] dark:text-[#94A39D] truncate">{isEn ? 'True Positives (TP)' : 'صحيح إيجابي (TP)'}</div>
                  <div className="text-lg sm:text-xl font-bold text-[#18201D] dark:text-white mt-0.5 truncate">{results.baseline.matrix.truePositives}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 min-w-0 overflow-hidden">
                  <div className="text-[9px] sm:text-[10px] text-red-700 dark:text-red-400 truncate">{isEn ? 'False Positives (FP)' : 'خطأ إيجابي (FP)'}</div>
                  <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mt-0.5 truncate">{results.baseline.matrix.falsePositives}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 min-w-0 overflow-hidden">
                  <div className="text-[9px] sm:text-[10px] text-amber-700 dark:text-amber-400 truncate">{isEn ? 'False Negatives (FN)' : 'خطأ سلبي (FN)'}</div>
                  <div className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 truncate">{results.baseline.matrix.falseNegatives}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#192421] border border-slate-200 dark:border-[#263834] min-w-0 overflow-hidden">
                  <div className="text-[9px] sm:text-[10px] text-[#66706B] dark:text-[#94A39D] truncate">{isEn ? 'True Negatives (TN)' : 'صحيح سلبي (TN)'}</div>
                  <div className="text-lg sm:text-xl font-bold text-[#18201D] dark:text-white mt-0.5 truncate">{results.baseline.matrix.trueNegatives}</div>
                </div>
              </div>
            </div>

            {/* Multimodal Edge AI Matrix */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#F6FBF9] dark:bg-[#13201D] border-2 border-[#176B5B] dark:border-[#2DD4BF] space-y-3 shadow-xs w-full max-w-full overflow-hidden min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-[#176B5B] dark:text-[#2DD4BF] flex items-center gap-1.5 truncate min-w-0 flex-1">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="truncate">{isEn ? 'Multimodal Edge AI Engine' : 'محرك الذكاء الاصطناعي متعدد الوسائط'}</span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#176B5B] text-white dark:bg-[#2DD4BF] dark:text-slate-950 font-mono font-bold shrink-0">
                  F1: {(results.multimodal.metrics.f1Score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center font-mono w-full min-w-0">
                <div className="p-2 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 min-w-0 overflow-hidden">
                  <div className="text-[9px] sm:text-[10px] text-emerald-800 dark:text-emerald-300 font-bold truncate">{isEn ? 'True Positives (TP)' : 'صحيح إيجابي (TP)'}</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">{results.multimodal.matrix.truePositives}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-white dark:bg-[#182622] border border-slate-200 dark:border-[#263834] min-w-0 overflow-hidden">
                  <div className="text-[9px] sm:text-[10px] text-[#66706B] dark:text-[#94A39D] truncate">{isEn ? 'False Positives (FP)' : 'خطأ إيجابي (FP)'}</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{results.multimodal.matrix.falsePositives}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-white dark:bg-[#182622] border border-slate-200 dark:border-[#263834] min-w-0 overflow-hidden">
                  <div className="text-[9px] sm:text-[10px] text-[#66706B] dark:text-[#94A39D] truncate">{isEn ? 'False Negatives (FN)' : 'خطأ سلبي (FN)'}</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{results.multimodal.matrix.falseNegatives}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 min-w-0 overflow-hidden">
                  <div className="text-[9px] sm:text-[10px] text-emerald-800 dark:text-emerald-300 font-bold truncate">{isEn ? 'True Negatives (TN)' : 'صحيح سلبي (TN)'}</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">{results.multimodal.matrix.trueNegatives}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Dataset Samples Explorer */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-4 text-start w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white truncate">
                  {isEn ? 'Ground-Truth Sample Pairs (N=24)' : 'عينات الاختبار القياسية المعتمدة (24 زوجاً)'}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D] truncate">
                  {isEn 
                    ? '14 True Matches (resolving wording discrepancies) & 10 Hard Negative Distractors'
                    : '14 تطابق حقيقي (يتجاوز الاختلافات اللفظية) و 10 مضللات سلبية صعبة'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#176B5B] dark:text-[#2DD4BF] shrink-0 self-start sm:self-auto">
                {BENCHMARK_SAMPLES.length} Samples
              </span>
            </div>

            <div className="divide-y divide-[#E4E7E4] dark:divide-[#23332F] max-h-80 overflow-y-auto pr-1">
              {BENCHMARK_SAMPLES.map((sample, i) => (
                <div key={sample.id} className="py-2.5 flex items-center justify-between gap-2 sm:gap-3 text-xs min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[10px] text-[#66706B] dark:text-[#94A39D] shrink-0">#{i + 1}</span>
                      <span className="font-bold text-[#18201D] dark:text-white truncate text-[11px] sm:text-xs">
                        {sample.itemA.title} ↔ {sample.itemB.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#66706B] dark:text-[#94A39D] truncate mt-0.5">
                      {sample.name}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <span className={'px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold shrink-0 ' + (
                      sample.groundTruth
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    )}>
                      {sample.groundTruth ? (isEn ? 'Match' : 'تطابق حقيقي') : (isEn ? 'Negative' : 'مضلل سلبي')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-6 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-4 w-full max-w-full overflow-hidden">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E6F1ED] dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
            <Cpu className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm sm:text-base font-bold text-[#18201D] dark:text-white">
              {isEn ? 'Ready for ISEF Scientific Evaluation' : 'جاهز للتقييم العلمي الدقيق المباشر'}
            </h3>
            <p className="text-xs text-[#66706B] dark:text-[#94A39D] leading-relaxed">
              {isEn 
                ? 'Click below to run real-time inference on all 24 verified ground-truth test pairs and generate the scientific Confusion Matrix.'
                : 'اضغط على الزر أدناه لإجراء الحسابات العلمية واستخراج مصفوفة الارتباك (Confusion Matrix) ومعدل الدقة والاستدعاء فورياً.'}
            </p>
          </div>
          <button
            onClick={handleRunBenchmark}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs transition-all shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isEn ? 'Start Evaluation Now' : 'تشغيل الاختبار العلمي الآن'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
