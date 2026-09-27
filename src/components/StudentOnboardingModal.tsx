'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { firestoreService } from '@/services/firestoreService';
import { logger } from '@/lib/logging/logger';
import { UserProfile } from '@/types';
import { 
  GraduationCap, 
  User, 
  School, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Compass,
  Loader2
} from 'lucide-react';

export const GRADES = [
  { id: 'prep_1', label: 'أولى إعدادي', hasTrack: false },
  { id: 'prep_2', label: 'تانية إعدادي', hasTrack: false },
  { id: 'prep_3', label: 'تالتة إعدادي', hasTrack: false },
  { id: 'sec_1', label: 'أولى ثانوي', hasTrack: false },
  { id: 'sec_2', label: 'تانية ثانوي', hasTrack: true },
  { id: 'sec_3', label: 'تالتة ثانوي', hasTrack: true },
];

export const TRACKS = [
  'المسار العام',
  'مسار علوم الحاسب والهندسة',
  'مسار الصحة والحياة',
  'مسار إدارة الأعمال',
  'مسار الشرعي',
];

interface StudentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentOnboardingModal({ isOpen, onClose }: StudentOnboardingModalProps) {
  const { currentUser, updateUserProfile, addToast, dir } = useApp();

  const [name, setName] = useState(currentUser.name || '');
  const [grade, setGrade] = useState(currentUser.grade || '');
  const [track, setTrack] = useState(currentUser.track || '');
  const [classroom, setClassroom] = useState(currentUser.classroom || '');
  const [age, setAge] = useState<string>(currentUser.age ? String(currentUser.age) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Check if chosen grade requires a track (تانية ثانوي or تالتة ثانوي)
  const isSecondarySenior = grade === 'تانية ثانوي' || grade === 'تالتة ثانوي';

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setGrade(currentUser.grade || '');
      setTrack(currentUser.track || '');
      setClassroom(currentUser.classroom || '');
      setAge(currentUser.age ? String(currentUser.age) : '');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('يرجى إدخال اسم الطالب كاملاً');
      return;
    }

    if (!grade) {
      setValidationError('يرجى اختيار المرحلة الدراسية');
      return;
    }

    if (isSecondarySenior && !track) {
      setValidationError('يرجى اختيار المسار التخصصي لطلاب تانية وتالتة ثانوي');
      return;
    }

    if (!classroom.trim()) {
      setValidationError('يرجى إدخال الفصل المدرسي (مثال: 1/2)');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 25) {
      setValidationError('يرجى إدخال سن مناسب (بين 10 و 25 سنة)');
      return;
    }

    setIsSubmitting(true);

    try {
      const studentId = (currentUser.id && currentUser.id !== 'user_malak' && currentUser.id !== '')
        ? currentUser.id
        : `student_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const studentData: UserProfile = {
        ...currentUser,
        id: studentId,
        name: name.trim(),
        grade: grade,
        track: isSecondarySenior ? track : '',
        classroom: classroom.trim(),
        age: parsedAge,
        role: 'student',
        isTrusted: currentUser.isTrusted ?? false,
        goodwillPoints: currentUser.goodwillPoints ?? 0,
      };

      // 1. Save student profile to Firestore collection 'users'
      await firestoreService.saveUserProfile(studentData);

      // 2. Save complete object to localStorage under 'ethos_student'
      if (typeof window !== 'undefined') {
        localStorage.setItem('ethos_student', JSON.stringify(studentData));
        localStorage.setItem('findit_current_user_profile_v5', JSON.stringify(studentData));
        localStorage.setItem('findit_current_user_v4', studentData.id);
        localStorage.setItem('findit_onboarding_completed', 'true');
      }

      // 3. Update state directly with the registered student data
      await updateUserProfile(studentData);

      addToast(
        'تم حفظ البيانات بنجاح',
        `أهلاً بك يا ${name.trim().split(' ')[0]} في مجتمع الأمانة المدرسي!`,
        'success'
      );

      onClose();
    } catch (err: any) {
      logger.error('Error in onboarding submit', { error: String(err) });
      setValidationError('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243a33] bg-slate-50/70 dark:bg-[#15231f] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#182924] transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const selectClasses = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243a33] bg-slate-50/70 dark:bg-[#15231f] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#182924] transition-all duration-200 cursor-pointer";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
      dir={dir}
    >
      <div 
        className="w-full max-w-xl bg-white/95 dark:bg-[#121c19]/95 backdrop-blur-xl border border-slate-200/90 dark:border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-950/20 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Elevated Gradient with School Crest */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-[#0d3329] to-teal-950 p-6 text-white text-center border-b border-emerald-500/20 overflow-hidden">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-24 bg-emerald-500/10 blur-2xl pointer-events-none rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center mb-3 text-emerald-300 shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              تسجيل بيانات الطالب في Ethos
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1 max-w-sm mx-auto leading-relaxed">
              المنصة المدرسية الذكية لحفظ الأمانات وتوثيق سلوكيات النزاهة الطلابية
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <span className="font-bold">تنبيه:</span> {validationError}
            </div>
          )}

          {/* 1. Full Name (Full Width) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>الاسم بالكامل</span>
              <span className="text-rose-500 text-xs">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك ثلاثياً..."
              className={inputClasses}
            />
          </div>

          {/* 2. Grade and Age (2-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Grade Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>الصف الدراسي</span>
                <span className="text-rose-500 text-xs">*</span>
              </label>
              <select
                required
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  // Clear track if not senior secondary
                  if (e.target.value !== 'تانية ثانوي' && e.target.value !== 'تالتة ثانوي') {
                    setTrack('');
                  }
                }}
                className={selectClasses}
              >
                <option value="">اختر الصف الدراسي...</option>
                {GRADES.map((g) => (
                  <option key={g.id} value={g.label}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>العمر</span>
                <span className="text-rose-500 text-xs">*</span>
              </label>
              <input
                type="number"
                min="10"
                max="25"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="مثال: 16"
                className={inputClasses}
              />
            </div>
          </div>

          {/* 3. Classroom and Track (Responsive Grid) */}
          {isSecondarySenior ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Classroom */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>الفصل المدرسي</span>
                  <span className="text-rose-500 text-xs">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  placeholder="مثال: 1/2"
                  className={inputClasses}
                />
              </div>

              {/* Specialized Track */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>المسار التخصصي</span>
                  <span className="text-rose-500 text-xs">*</span>
                </label>
                <select
                  required={isSecondarySenior}
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">اختر المسار التخصصي...</option>
                  {TRACKS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>الفصل المدرسي</span>
                <span className="text-rose-500 text-xs">*</span>
              </label>
              <input
                type="text"
                required
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="مثال: 1/2"
                className={inputClasses}
              />
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-slate-600 dark:text-emerald-200/80 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              يتم توثيق هذه البيانات مباشرة في السجل المدرسي لمنظومة Ethos لربطها بكارنيه الطالب وشهادة سفير النزاهة دون مشاركة أي بيانات شخصية حساسة.
            </p>
          </div>

          {/* Submit Button with Loading Spinner */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 dark:shadow-emerald-900/30 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span className="text-sm font-semibold tracking-wide">جاري توثيق البيانات والربط بالسحابة...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold tracking-wide">تأكيد البيانات والدخول للمنصة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
