'use client';

import React, { useState } from 'react';
import { MatchScoreBreakdown } from '@/types';
import { Sparkles, ChevronDown, ChevronUp, Cpu } from 'lucide-react';

interface ExplainableAiBreakdownProps {
  breakdown: MatchScoreBreakdown;
  language?: 'ar' | 'en';
}

export default function ExplainableAiBreakdown({
  breakdown,
  language = 'ar',
}: ExplainableAiBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEn = language === 'en';

  const sub = breakdown.subScores || {
    color: 0,
    ocrText: 0,
    category: 0,
    location: 0,
    temporal: 0,
  };

  // Dimensions for 5-Axis Radar Chart
  // Points at 5 angles: -90, -18, 54, 126, 198 degrees
  const size = 180;
  const center = size / 2;
  const radius = 60;
  const angles = [-90, -18, 54, 126, 198].map((deg) => (deg * Math.PI) / 180);

  const factorValues = [
    sub.color,
    sub.ocrText,
    sub.category,
    sub.location,
    sub.temporal,
  ];

  const factorLabels = isEn
    ? ['Visual Color (25%)', 'OCR Text (25%)', 'Category (20%)', 'Location (15%)', 'Time (15%)']
    : ['اللون البصري (25%)', 'نصوص OCR (25%)', 'الفئة (20%)', 'الموقع المكاني (15%)', 'التقارب الزمني (15%)'];

  // Calculate radar polygon points
  const points = factorValues
    .map((val, idx) => {
      const r = (Math.max(5, Math.min(100, val)) / 100) * radius;
      const x = center + r * Math.cos(angles[idx]);
      const y = center + r * Math.sin(angles[idx]);
      return x.toFixed(1) + ',' + y.toFixed(1);
    })
    .join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="mt-3 rounded-xl border border-[#D0DDD8] dark:border-[#233530] bg-[#F7FAF9] dark:bg-[#121B19] overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2.5 px-3.5 flex items-center justify-between text-xs font-bold text-[#144F43] dark:text-[#5EEAD4] hover:bg-[#EEF5F2] dark:hover:bg-[#182622] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#176B5B]/15 dark:bg-[#2DD4BF]/20 flex items-center justify-center text-[#176B5B] dark:text-[#2DD4BF]">
            <Cpu className="w-3 h-3" />
          </div>
          <span>
            {isEn
              ? 'Explainable AI (XAI) Multimodal Breakdown'
              : 'تفاصيل مطابقة الذكاء الاصطناعي القابل للتفسير (XAI)'}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#E0EFEA] dark:bg-[#1D332D] text-[#125648] dark:text-[#5EEAD4] font-mono">
            ISEF Engine
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] opacity-80">
          <span>{isOpen ? (isEn ? 'Hide' : 'إخفاء') : (isEn ? 'Inspect' : 'عرض التفاصيل')}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-2 border-t border-[#D0DDD8] dark:border-[#233530] space-y-4 animate-in fade-in duration-200">
          {/* Mathematical Formula Banner */}
          <div className="p-3 rounded-lg bg-white dark:bg-[#162320] border border-[#E2ECE8] dark:border-[#273B36] text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[#66706B] dark:text-[#94A39D] font-mono text-[10px]">
              <span className="flex items-center gap-1 font-semibold text-[#176B5B] dark:text-[#2DD4BF]">
                <Sparkles className="w-3 h-3" />
                {isEn ? 'Multimodal Weighted Formula:' : 'معادلة المطابقة المتعددة الوسائط:'}
              </span>
              <span>Score = Σ(w_i × S_i)</span>
            </div>
            <div className="font-mono text-[#18201D] dark:text-emerald-300 text-[10px] sm:text-xs overflow-x-auto py-1 dir-ltr text-center">
              Score = (0.25 × S_color) + (0.25 × S_ocr) + (0.20 × S_cat) + (0.15 × S_loc) + (0.15 × S_time)
            </div>
            <div className="text-[10px] text-[#66706B] dark:text-[#94A39D] text-center">
              {isEn
                ? 'Calculated Match: ' + breakdown.totalScore + '% with Zero-Cloud Client-Side Privacy'
                : 'النتيجة المحسوبة: ' + breakdown.totalScore + '% مع الحفاظ التام على خصوصية الطلاب داخل المتصفح'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* 5-Axis SVG Radar Chart */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-[#162320] border border-[#E2ECE8] dark:border-[#273B36]">
              <span className="text-[10px] font-bold text-[#66706B] dark:text-[#94A39D] mb-1">
                {isEn ? '5-Factor Decision Polygon' : 'مخطط القرار الخماسي الأبعاد'}
              </span>
              <svg width={size} height={size} className="overflow-visible">
                {/* Background grid concentric pentagons */}
                {gridLevels.map((lvl) => {
                  const pts = angles
                    .map((a) => {
                      const x = center + lvl * radius * Math.cos(a);
                      const y = center + lvl * radius * Math.sin(a);
                      return x.toFixed(1) + ',' + y.toFixed(1);
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={lvl}
                      points={pts}
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={lvl === 1 ? undefined : '2,2'}
                      className="text-[#D0DDD8] dark:text-[#283E38]"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Radial Axis Lines */}
                {angles.map((a, i) => {
                  const x = center + radius * Math.cos(a);
                  const y = center + radius * Math.sin(a);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="currentColor"
                      className="text-[#D0DDD8] dark:text-[#283E38]"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Match Result Polygon */}
                <polygon
                  points={points}
                  fill="rgba(16, 185, 129, 0.25)"
                  stroke="#10B981"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />

                {/* Point markers */}
                {factorValues.map((val, idx) => {
                  const r = (Math.max(5, Math.min(100, val)) / 100) * radius;
                  const x = center + r * Math.cos(angles[idx]);
                  const y = center + r * Math.sin(angles[idx]);
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#10B981"
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
            </div>

            {/* 5-Factor Progress Meters */}
            <div className="space-y-2.5">
              {[
                { label: factorLabels[0], val: sub.color, weight: 'w=0.25', color: 'bg-emerald-500' },
                { label: factorLabels[1], val: sub.ocrText, weight: 'w=0.25', color: 'bg-teal-500' },
                { label: factorLabels[2], val: sub.category, weight: 'w=0.20', color: 'bg-cyan-500' },
                { label: factorLabels[3], val: sub.location, weight: 'w=0.15', color: 'bg-blue-500' },
                { label: factorLabels[4], val: sub.temporal, weight: 'w=0.15', color: 'bg-amber-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-[#18201D] dark:text-white flex items-center gap-1">
                      <span>{item.label}</span>
                      <span className="text-[9px] text-[#66706B] dark:text-[#94A39D] font-mono">({item.weight})</span>
                    </span>
                    <span className="font-mono font-bold text-[#176B5B] dark:text-emerald-400">
                      {item.val}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E4EBE8] dark:bg-[#1E2E2A] rounded-full overflow-hidden">
                    <div
                      className={'h-full ' + item.color + ' rounded-full transition-all duration-500'}
                      style={{ width: Math.max(0, Math.min(100, item.val)) + '%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable Insights Tags */}
          {breakdown.matchReasons && breakdown.matchReasons.length > 0 && (
            <div className="pt-2 border-t border-[#D0DDD8] dark:border-[#233530]">
              <span className="text-[10px] font-bold text-[#66706B] dark:text-[#94A39D] block mb-1.5">
                {isEn ? 'Multimodal Evidence Inferences:' : 'الاستدلالات والبراهين المستخرجة:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matchReasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-[#162320] border border-[#D0DDD8] dark:border-[#273B36] text-[#18201D] dark:text-white"
                  >
                    ✓ {reason}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
