'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { INTEGRITY_SCENARIOS } from '@/lib/constants';
import { SCHOOL_BEHAVIORAL_METRICS, STUDENT_SURVEY_RESULTS } from '@/lib/ai/behavioralData';
import { getLocalizedScenario } from '@/lib/i18n/scenarios';
import { 
  ShieldCheck, 
  Building2, 
  Printer, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Users2, 
  BookOpen, 
  Award, 
  Brain, 
  Sparkles, 
  FileCheck, 
  AlertCircle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminIntegritySupervisionView() {
  const { language, dir, isRtl, currentUser } = useApp();
  const isEn = language === 'en';

  const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(INTEGRITY_SCENARIOS[0].id);

  const metricsData = SCHOOL_BEHAVIORAL_METRICS;
  const surveyData = STUDENT_SURVEY_RESULTS;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Empirical Student Compliance Rates per Scenario from Field Data
  const scenarioComplianceStats: Record<string, { rate: number; count: number; statusEn: string; statusAr: string }> = {
    scenario_academic_integrity: { rate: 94.2, count: 113, statusEn: 'Exemplary Compliance', statusAr: 'التزام نموذجي مرتفع' },
    scenario_digital_ethics: { rate: 96.7, count: 116, statusEn: 'Outstanding Awareness', statusAr: 'وعي رقمي استثنائي' },
    scenario_custody_honesty: { rate: 97.5, count: 117, statusEn: 'Instant Handover Practice', statusAr: 'تسليم فوري للأمانات' },
    scenario_financial_honesty: { rate: 91.7, count: 110, statusEn: 'High Ethical Conduct', statusAr: 'سلوك أخلاقي معتمد' },
    scenario_courage_mistake: { rate: 93.3, count: 112, statusEn: 'Moral Courage Demonstrated', statusAr: 'شجاعة أدبية مسؤولة' },
  };

  return (
    <div className="px-3 sm:px-6 py-4 max-w-6xl mx-auto space-y-6 text-start font-sans" dir={dir}>
      
      {/* ========================================================
          1. OFFICIAL ADMINISTRATIVE BANNER
      ======================================================== */}
      <div className="p-5 sm:p-6 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-300">
        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18201D] dark:bg-[#1C2B27] border border-[#176B5B]/30 dark:border-[#2D3E3A] text-white text-[11px] font-black">
            <ShieldCheck className="w-4 h-4 text-[#34D399]" />
            <span>{isEn ? 'Supervisory & Educational Standards Board' : 'لوحة الإشراف الإداري والتربوي — م. مشيرة'}</span>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black text-[#18201D] dark:text-white">
            {isEn ? 'Accredited School Integrity Standards & Student Analytics' : 'معايير ومواقف النزاهة المدرسية المعتمدة والبيانات الميدانية'}
          </h1>
          
          <p className="text-xs text-[#66706B] dark:text-[#94A39D] leading-relaxed max-w-3xl">
            {isEn 
              ? 'The official executive dashboard for school leadership to oversee ethical benchmarks, verify student behavioral compliance across school facilities, and review empirical survey insights without personal testing or grading.'
              : 'المرجع التنفيذي الرسمي لإدارة المدرسة للاطلاع على بنك المعايير الأخلاقية الخمسة، ومتابعة مؤشرات التزام الطالبات بالأمانة والمواطنة الرقمية، دون اختبارات أو احتساب نقاط إدارية.'}
          </p>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#E4E7E4] dark:border-[#263834] shadow-2xs"
          >
            <Printer className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />
            <span>{isEn ? 'Print Official Standards Report' : 'طباعة تقرير المعايير المعتمدة'}</span>
          </button>

          <Link
            href="/admin"
            className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-[#18201D] text-xs font-black hover:bg-[#125648] dark:hover:bg-[#14B8A6] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>{isEn ? 'Admin Portal' : 'لوحة الإدارة 🏛️'}</span>
          </Link>
        </div>
      </div>

      {/* ========================================================
          2. KEY FIELD COMPLIANCE KPIS (DATA & ANALYTICS ONLY)
      ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Compliance Rate */}
        <div className="p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">
            <span>{isEn ? 'Ethical Decision Compliance' : 'معدل التزام الطالبات بالمعايير'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">94.6%</div>
          <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
            {isEn ? '+42.6% increase over baseline' : 'ارتفاع بمقدار +42.6% مقارنة بالبداية'}
          </p>
        </div>

        {/* Evaluated Students */}
        <div className="p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">
            <span>{isEn ? 'Assessed Student Body' : 'إجمالي الطالبات الخاضعات للتقييم'}</span>
            <Users2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-[#18201D] dark:text-white">120</div>
          <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
            {isEn ? 'Comprehensive survey cohort' : 'عينة المسح الميداني المعتمدة'}
          </p>
        </div>

        {/* Handover Acceleration */}
        <div className="p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">
            <span>{isEn ? 'Fast Handover Rate (<24h)' : 'تسليم الأمانات في أقل من 24 ساعة'}</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">+84.1%</div>
          <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
            {isEn ? 'From 4.2 days down to 45 min' : 'انخفض من 4.2 أيام إلى 45 دقيقة'}
          </p>
        </div>

        {/* Disputes Reduced */}
        <div className="p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">
            <span>{isEn ? 'Dispute Reduction' : 'انخفاض النزاعات والادعاءات'}</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">-90.3%</div>
          <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
            {isEn ? 'Secret question & PIN zero-fraud' : 'صفر احتيال بفضل السؤال السري والـ PIN'}
          </p>
        </div>
      </div>

      {/* ========================================================
          3. THE 5 ACCREDITED SCHOOL INTEGRITY STANDARDS
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#18201D] dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#176B5B] dark:text-[#2DD4BF]" />
              <span>{isEn ? 'Approved School Ethical Standards Directory' : 'دليل المعايير الأخلاقية الخمسة المعتمدة بالمدرسة'}</span>
            </h2>
            <p className="text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5">
              {isEn 
                ? 'Review standard descriptions, cognitive foundations, exemplary actions, and empirical student compliance.'
                : 'استعراض مواقف النزاهة الخمسة كأسس تقييم تربوية معتمدة، مع نسب التزام الطالبات الميدانية.'}
            </p>
          </div>

          <span className="text-xs font-bold text-[#176B5B] dark:text-[#2DD4BF] bg-[#E6F1ED] dark:bg-[#122823] px-3 py-1 rounded-full border border-[#176B5B]/20">
            5 / 5 {isEn ? 'Standards Accredited' : 'معايير معتمدة'}
          </span>
        </div>

        {/* Standards Cards */}
        <div className="space-y-3">
          {INTEGRITY_SCENARIOS.map((scenario, index) => {
            const localized = getLocalizedScenario(scenario, language);
            const isExpanded = expandedScenarioId === scenario.id;
            const stats = scenarioComplianceStats[scenario.id] || { rate: 94.0, count: 112, statusEn: 'Compliant', statusAr: 'ملتزم' };
            const idealOption = scenario.questions[0]?.options.find((o) => o.score === 100);

            return (
              <div 
                key={scenario.id}
                className="bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setExpandedScenarioId(isExpanded ? null : scenario.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-slate-50/70 dark:hover:bg-[#182320]/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] font-black flex items-center justify-center shrink-0 text-sm border border-[#176B5B]/20">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-teal-100 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300">
                          {isEn ? `Standard ${index + 1}` : `المعيار ${index + 1}`}
                        </span>
                        <span className="text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">
                          {localized.topicTitle}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[#18201D] dark:text-white truncate mt-0.5">
                        {localized.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Compliance Mini Badge */}
                    <div className="text-end hidden sm:block">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {stats.rate}% {isEn ? 'Compliance' : 'نسبة الالتزام'}
                      </div>
                      <span className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                        {stats.count} / 120 {isEn ? 'students' : 'طالبة'}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1C2B27] text-[#66706B] dark:text-[#94A39D]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-5 pt-1 space-y-4 border-t border-[#F1F3F0] dark:border-[#1F2B28] bg-slate-50/50 dark:bg-[#121917]/50 text-xs">
                    
                    {/* Dilemma Summary */}
                    <div className="space-y-1">
                      <span className="font-bold text-[#66706B] dark:text-[#94A39D] block">
                        {isEn ? 'Scenario & Educational Context:' : 'وصف الموقف والمحيط المدرسي:'}
                      </span>
                      <p className="text-[#18201D] dark:text-[#F1F5F3] leading-relaxed">
                        {localized.detailedDilemma}
                      </p>
                    </div>

                    {/* Cognitive & Psychological Foundation */}
                    <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 flex items-start gap-2.5">
                      <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black text-purple-950 dark:text-purple-200 block text-[11px]">
                          {isEn ? 'Theoretical & Psychological Grounding:' : 'الأساس المعرفي والتربوي:'}
                        </span>
                        <p className="text-purple-900 dark:text-purple-300 mt-0.5 leading-relaxed text-[11px]">
                          {localized.cognitiveBasis}
                        </p>
                      </div>
                    </div>

                    {/* Expected Exemplary Behavior */}
                    {idealOption && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
                        <div className="flex items-center gap-2 font-black text-emerald-950 dark:text-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{isEn ? 'Approved Exemplary Action (Benchmark):' : 'السلوك المعتمد المتوقع من الطالبة (المعيار المثالي):'}</span>
                        </div>
                        <p className="text-emerald-900 dark:text-emerald-300 leading-relaxed font-semibold">
                          {idealOption.text}
                        </p>
                        {idealOption.correctActionText && (
                          <p className="text-[11px] text-emerald-800 dark:text-emerald-400 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                            💡 {idealOption.correctActionText}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Field Data Compliance Breakdown */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#18201D] dark:text-white block">
                          {isEn ? 'Empirical Field Performance Status:' : 'مؤشر أداء الطالبات الميداني:'}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          {isEn ? stats.statusEn : stats.statusAr}
                        </span>
                      </div>

                      <div className="w-full sm:w-48 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-[#66706B] dark:text-[#94A39D]">
                          <span>{isEn ? 'Compliance' : 'الالتزام'}</span>
                          <span>{stats.rate}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#176B5B] dark:bg-[#2DD4BF] rounded-full transition-all duration-500" 
                            style={{ width: `${stats.rate}%` }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          4. SUPERVISORY DIRECTIVES & ENDORSEMENT FOOTER
      ======================================================== */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 dark:from-[#111F1C] dark:to-[#152723] border border-emerald-200 dark:border-[#1E463D] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-2xs">
            <FileSpreadsheet className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="font-black text-[#18201D] dark:text-white">
              {isEn ? 'Integrated with 120-Student Empirical Behavioral Study' : 'المعايير مرتبطة بنتائج دراسة الـ 120 طالبة الميدانية'}
            </h4>
            <p className="text-[#66706B] dark:text-[#94A39D] text-[11px] mt-0.5">
              {isEn 
                ? 'All standards correlate directly with the scientific behavioral survey in the Admin Dashboard.' 
                : 'كافة المعايير المذكورة خضعت للقياس والتحليل ضمن تبويب «الاستبيان والبيانات» في لوحة الإدارة.'}
            </p>
          </div>
        </div>

        <Link
          href="/admin"
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#18201D] dark:bg-white text-white dark:text-[#18201D] font-bold text-xs hover:bg-[#2B3B36] dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{isEn ? 'View Survey Analysis' : 'عرض تحليل الاستبيان'}</span>
        </Link>
      </div>

    </div>
  );
}
