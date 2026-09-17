'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Leaf, 
  FlaskConical, 
  Library, 
  Dumbbell, 
  Users, 
  QrCode,
  Send,
  Award
} from 'lucide-react';
import { SchoolActivity, SchoolLocationId } from '@/types';
import { SCHOOL_LOCATIONS } from '@/lib/constants';
import { useApp } from '@/context/AppContext';
import { getLocalizedActivity, getLocalizedLocation } from '@/lib/i18n/seedDataTranslations';

interface ActivitySubmissionModalProps {
  activity: SchoolActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  FlaskConical: <FlaskConical className="w-5 h-5" />,
  Library: <Library className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  QrCode: <QrCode className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
};

export default function ActivitySubmissionModal({
  activity,
  isOpen,
  onClose,
  onSuccess,
}: ActivitySubmissionModalProps) {
  const { submitSchoolActivity, language, dir, t } = useApp();
  const [notes, setNotes] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<SchoolLocationId | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activity) return null;

  const localizedActivity = getLocalizedActivity(activity, language);
  const isInstant = activity.verificationType === 'instant';

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2DD4BF', '#10B981', '#F59E0B', '#3B82F6'],
      });
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const locId = (selectedLocation || activity.targetLocationId) as SchoolLocationId;
      const res = submitSchoolActivity(activity.id, notes, locId);
      
      if (res.isInstant) {
        triggerCelebration();
      }

      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setIsSubmitting(false);
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ التوثيق');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in" dir={dir}>
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-[#18201D] dark:text-[#F1F5F3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 end-4 sm:end-5 p-2 rounded-full bg-slate-100 dark:bg-[#1C2B27] hover:bg-slate-200 dark:hover:bg-[#253934] text-slate-700 dark:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-3 border-b border-slate-100 dark:border-[#263834] pb-4 text-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2DD4BF] flex items-center justify-center shadow-2xs shrink-0">
              {iconMap[activity.iconName] || <Sparkles className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#176B5B] dark:text-[#2DD4BF] bg-emerald-50 dark:bg-[#122823] px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-[#1E463D] inline-block mb-1">
                {isInstant ? t('activities.completeInstant') : t('activities.submitSupervised')}
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#18201D] dark:text-white leading-tight">
                {localizedActivity.title}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {localizedActivity.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
            <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>+{activity.points} {t('app.points')}</span>
            </span>

            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#1C2B27] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2D3E3A] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>~{activity.estimatedMinutes} {t('activities.minutes')}</span>
            </span>

            <span className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-teal-500" />
              <span>{activity.frequency === 'daily' ? t('activities.frequencyDaily') : t('activities.frequencyWeekly')}</span>
            </span>
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto flex-1 text-start">
          
          {/* Associated Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              {t('activities.locationLabel')}
            </label>
            <select
              value={selectedLocation || activity.targetLocationId || ''}
              onChange={(e) => setSelectedLocation(e.target.value as SchoolLocationId)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#176B5B] dark:focus:border-[#2DD4BF] cursor-pointer"
            >
              {SCHOOL_LOCATIONS.map((loc) => {
                const localizedLoc = getLocalizedLocation(loc, language);
                return (
                  <option key={loc.id} value={loc.id} className="bg-white dark:bg-[#15201D] text-slate-900 dark:text-white">
                    {localizedLoc.name} ({localizedLoc.floor})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Activity Notes Input (Supervised or Instant) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              {t('activities.notesLabel')}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('activities.notesPlaceholder')}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A] rounded-2xl focus:bg-white dark:focus:bg-[#15201D] focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              required={!isInstant}
            />
          </div>

          {/* Instant Info Notice */}
          {isInstant ? (
            <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-[#122823] border border-emerald-200/80 dark:border-[#1E463D] text-[11px] text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#2DD4BF] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {language === 'en'
                  ? 'This quest awards points immediately upon confirmation. Thank you for keeping our school community safe and organized!'
                  : 'هذا النشاط يُحسب فورياً بنقرة واحدة ويضيف النقاط مباشرة إلى رصيدك وترتيبك في لوحة الشرف المدرسية.'}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-[11px] text-blue-950 dark:text-blue-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {language === 'en'
                  ? 'This quest will be sent to the school administration (Eng. Moshira) for verification. Points will be awarded upon approval.'
                  : 'سيتم إرسال توثيقك لمكتب الإدارة (م. مشيرة) للاعتماد وإضافة النقاط إلى رصيدك وشاراتك.'}
              </p>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 sm:py-3.5 min-h-[44px] rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isInstant ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'en' ? `Confirm & Claim +${activity.points} Points` : `تأكيد الإنجاز وكسب +${activity.points} نقطة`}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{language === 'en' ? 'Submit for Administrative Approval' : 'إرسال التقرير للاعتماد الإداري'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
