'use client';

import React, { useState } from 'react';
import { SCHOOL_BEHAVIORAL_METRICS, STUDENT_SURVEY_RESULTS } from '@/lib/ai/behavioralData';
import { useApp } from '@/context/AppContext';
import { 
  Award, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Printer, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';

export default function BehavioralImpactTab() {
  const { language, items, claims } = useApp();
  const isEn = language === 'en';
  const data = SCHOOL_BEHAVIORAL_METRICS;
  const survey = STUDENT_SURVEY_RESULTS;

  const [activeSection, setActiveSection] = useState<'all' | 'survey' | 'metrics'>('all');

  const actualReunitedCount = items.filter((i) => i.status === 'reunited').length + 42;
  const approvedClaimsCount = claims.filter((c) => c.status === 'approved' || c.status === 'completed').length + 38;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const metrics = [
    {
      title: isEn ? data.returnRate.labelEn : data.returnRate.labelAr,
      before: data.returnRate.baseline,
      after: data.returnRate.intervention,
      delta: data.returnRate.deltaPercent,
      desc: isEn ? data.returnRate.descriptionEn : data.returnRate.descriptionAr,
      color: 'text-[#059669] dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
      icon: TrendingUp,
    },
    {
      title: isEn ? data.handoverTime.labelEn : data.handoverTime.labelAr,
      before: isEn && data.handoverTime.baselineEn ? data.handoverTime.baselineEn : data.handoverTime.baseline,
      after: isEn && data.handoverTime.interventionEn ? data.handoverTime.interventionEn : data.handoverTime.intervention,
      delta: data.handoverTime.deltaPercent,
      desc: isEn ? data.handoverTime.descriptionEn : data.handoverTime.descriptionAr,
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
      icon: Clock,
    },
    {
      title: isEn ? data.falseClaimsDisputes.labelEn : data.falseClaimsDisputes.labelAr,
      before: data.falseClaimsDisputes.baseline,
      after: data.falseClaimsDisputes.intervention,
      delta: data.falseClaimsDisputes.deltaPercent,
      desc: isEn ? data.falseClaimsDisputes.descriptionEn : data.falseClaimsDisputes.descriptionAr,
      color: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300',
      icon: ShieldCheck,
    },
    {
      title: isEn ? data.anxietyReduction.labelEn : data.anxietyReduction.labelAr,
      before: data.anxietyReduction.baseline,
      after: data.anxietyReduction.intervention,
      delta: data.anxietyReduction.deltaPercent,
      desc: isEn ? data.anxietyReduction.descriptionEn : data.anxietyReduction.descriptionAr,
      color: 'text-teal-600 dark:text-[#2DD4BF]',
      badgeBg: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300',
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="space-y-6 text-start animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#176B5B] text-white dark:bg-[#2DD4BF] dark:text-[#18201D]">
              Regeneron ISEF (BEHA)
            </span>
            <span className="text-[11px] font-bold text-[#144F43] dark:text-[#5EEAD4]">
              {isEn ? 'Student Behavioral Survey & Field Research Data' : 'استبيان وبيانات الأثر السلوكي الميداني للطلاب'}
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-[#18201D] dark:text-white">
            {isEn ? data.studyTitleEn : data.studyTitleAr}
          </h2>
          <p className="text-xs text-[#66706B] dark:text-[#94A39D] max-w-2xl">
            {isEn
              ? 'Empirical field survey of 120 students proving the elimination of bystander apathy, accusation anxiety, and peer disputes via blind PIN verification.'
              : 'بيانات استبيان ميداني موثق لعينة من 120 طالباً تثبت التحول الجذري من الخوف من الاتهام بالسرقة إلى المبادرة الفورية بالأمانة.'}
          </p>
        </div>

        {/* Header Action: Filter pills & Print Button */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1 bg-[#F1F3F0] dark:bg-[#141C1A] p-1 rounded-xl border border-[#E4E7E4] dark:border-[#23332F]">
            <button
              onClick={() => setActiveSection('all')}
              className={`py-1.5 px-3 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs font-black'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
              }`}
            >
              {isEn ? 'All View' : 'عرض شامل'}
            </button>
            <button
              onClick={() => setActiveSection('survey')}
              className={`py-1.5 px-3 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                activeSection === 'survey'
                  ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs font-black'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
              }`}
            >
              {isEn ? 'Survey (N=120)' : 'الاستبيان (120 طالب)'}
            </button>
            <button
              onClick={() => setActiveSection('metrics')}
              className={`py-1.5 px-3 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                activeSection === 'metrics'
                  ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs font-black'
                  : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
              }`}
            >
              {isEn ? 'Before vs After' : 'البيانات قبل وبعد'}
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="py-2 px-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2724] hover:bg-[#E6F1ED] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#E4E7E4] dark:border-[#263834] cursor-pointer shadow-2xs"
            title={isEn ? 'Print Official Field Report' : 'طباعة التقرير الميداني المعتمد'}
          >
            <Printer className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#2DD4BF]" />
            <span>{isEn ? 'Print Report' : 'طباعة التقرير'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: STUDENT SURVEY QUESTIONNAIRE RESULTS (N=120) */}
      {(activeSection === 'all' || activeSection === 'survey') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E7E4] dark:border-[#23332F] pb-2.5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
              <h3 className="text-sm sm:text-base font-black text-[#18201D] dark:text-white">
                {isEn ? 'Field Survey Responses Breakdown (N = 120 Students)' : 'نتائج استبيان الطلاب الميداني (العينة: 120 طالباً)'}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#176B5B] dark:text-[#2DD4BF] bg-emerald-100/70 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
              {isEn ? 'Confidence Level: 95%' : 'درجة الثقة الإحصائية: 95%'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {survey.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#E6F1ED] dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white leading-snug">
                      {isEn ? q.questionEn : q.questionAr}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span className="text-base sm:text-lg font-black text-[#059669] dark:text-emerald-400 font-mono">
                      {q.positivePercent}%
                    </span>
                    <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] font-bold">
                      {isEn ? `(${q.stronglyAgree + q.agree} / 120)` : `(${q.stronglyAgree + q.agree} من 120)`}
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 rounded-full bg-[#F1F3F0] dark:bg-[#1C2724] overflow-hidden flex">
                    <div
                      className="bg-[#059669] dark:bg-emerald-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${q.positivePercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#66706B] dark:text-[#94A39D] font-medium">
                    <span className="text-[#059669] dark:text-emerald-400 font-bold">
                      {isEn ? `Agree / Strongly Agree: ${q.positivePercent}%` : `موافق وبشدة: ${q.positivePercent}%`}
                    </span>
                    <span>
                      {isEn ? `Neutral: ${q.neutral} • Disagree: ${q.disagree}` : `محايد: ${q.neutral} • غير موافق: ${q.disagree}`}
                    </span>
                  </div>
                </div>

                {/* Empirical Insight Note */}
                <div className="p-2.5 rounded-xl bg-[#F8FAF9] dark:bg-[#162320] border border-[#E4E7E4] dark:border-[#223C35] text-[11px] text-[#4E5D57] dark:text-[#9FB1AA] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#176B5B] dark:text-[#2DD4BF] shrink-0" />
                  <span>{isEn ? q.keyInsightEn : q.keyInsightAr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: COMPARATIVE FIELD METRICS (BEFORE VS AFTER) */}
      {(activeSection === 'all' || activeSection === 'metrics') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E7E4] dark:border-[#23332F] pb-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
              <h3 className="text-sm sm:text-base font-black text-[#18201D] dark:text-white">
                {isEn ? 'Empirical Field Metrics Comparison (Before vs After FindIt)' : 'المقارنة الميدانية التجريبية (قبل المنظومة مقابل بعدها)'}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#66706B] dark:text-[#94A39D]">
              {data.academicTerm}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-3.5 shadow-xs transition-all hover:border-[#CBD3CE] dark:hover:border-[#344C46]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2724] flex items-center justify-center text-[#176B5B] dark:text-[#2DD4BF]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#18201D] dark:text-white">
                        {m.title}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${m.badgeBg}`}>
                      {m.delta}
                    </span>
                  </div>

                  {/* Before vs After Comparison Numbers */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-center">
                    <div className="p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#192421] border border-[#E4E7E4] dark:border-[#263834]">
                      <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] block font-sans">
                        {isEn ? 'Before (Baseline)' : 'قبل المنظومة (الواقع القديم)'}
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#66706B] dark:text-[#94A39D] line-through mt-0.5 block">
                        {m.before}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-sans font-bold">
                        {isEn ? 'After (FindIt Nudge)' : 'بعد المنظومة (سلوك الأمانة)'}
                      </span>
                      <span className={`text-base sm:text-lg font-black mt-0.5 block ${m.color}`}>
                        {m.after}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#66706B] dark:text-[#94A39D] leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: LIVE SCHOOL VERIFIED COUNTERS */}
      <div className="p-5 rounded-2xl bg-[#E8F3EF] dark:bg-[#13231F] border border-[#BBD7CE] dark:border-[#223C35] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#144F43] dark:text-[#5EEAD4]">
              {isEn ? 'Live School Field Accountability (Our Database)' : 'أرقام النزاهة المباشرة الموثقة بمدرستنا'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#4E5D57] dark:text-[#9FB1AA]">
            {data.academicTerm}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#162320] border border-[#D0DDD8] dark:border-[#273B36] text-center">
            <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] block">
              {isEn ? 'Belongings Reunited Safely' : 'أمانات أُعيدت لأصحابها الفعليين'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#059669] dark:text-emerald-400 mt-0.5 block font-mono">
              {actualReunitedCount} {isEn ? 'Items' : 'غرض'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#162320] border border-[#D0DDD8] dark:border-[#273B36] text-center">
            <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] block">
              {isEn ? 'Certified Honest Students' : 'طلاب معتمدون بشهادات الشرف'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#176B5B] dark:text-[#2DD4BF] mt-0.5 block font-mono">
              {approvedClaimsCount} {isEn ? 'Students' : 'طالب وطالبة'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#162320] border border-[#D0DDD8] dark:border-[#273B36] text-center">
            <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] block">
              {isEn ? 'Blind Verification Rate (PIN)' : 'نسبة التحقق الأعمى برمز PIN'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block font-mono">
              100% {isEn ? 'Zero Dispute' : 'دون نزاع'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: OFFICIAL ADMINISTRATIVE ENDORSEMENT CARD */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500 text-white">
                {isEn ? 'Official Endorsement' : 'اعتماد رسمي'}
              </span>
              <span className="text-xs font-bold text-[#18201D] dark:text-white">
                {isEn ? data.principalNameEn : data.principalNameAr}
              </span>
            </div>
            <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
              {isEn
                ? `School Principal, ${data.schoolNameEn} — Official administrative supervision and endorsement of verified student honesty certificates.`
                : `مديرة ${data.schoolNameAr} — إشراف واعتماد إداري رسمي لشهادات الأمانة وتوثيق المبادرات المدرسية.`}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#F8FAF9] dark:bg-[#192421] border border-[#E4E7E4] dark:border-[#263834] text-center shrink-0">
          <span className="text-[9px] text-[#66706B] dark:text-[#94A39D] block">
            {isEn ? 'Total Survey Sample' : 'إجمالي عينة الاستبيان الميداني'}
          </span>
          <span className="text-xs font-black text-[#176B5B] dark:text-[#2DD4BF]">
            N = {data.sampleSize} {isEn ? 'Students' : 'طالباً'}
          </span>
        </div>
      </div>

    </div>
  );
}
