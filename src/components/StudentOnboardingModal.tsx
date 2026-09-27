'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  IdCard,
  Lock,
  X
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

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<number>(1);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [track, setTrack] = useState('');
  const [classroom, setClassroom] = useState('');
  const [age, setAge] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const isRtl = dir === 'rtl';
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  // Check if chosen grade requires a track (تانية ثانوي or تالتة ثانوي)
  const isSecondarySenior = grade === 'تانية ثانوي' || grade === 'تالتة ثانوي';

  // Strictly non-dismissible: Prevent closing via ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  useEffect(() => {
    if (currentUser) {
      const isDemo = !currentUser.name || currentUser.id === 'user_malak' || currentUser.name === 'ملك محمد فروق' || currentUser.name === 'ملك محمد';
      setName(isDemo ? '' : currentUser.name);
      setGrade(isDemo ? '' : (currentUser.grade || ''));
      setTrack(isDemo ? '' : (currentUser.track || ''));
      setClassroom(isDemo ? '' : (currentUser.classroom || ''));
      setAge(isDemo ? '' : (currentUser.age ? String(currentUser.age) : ''));
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Step 1 Validation -> Next
  const handleNextStep1 = () => {
    setValidationError('');
    if (!name.trim()) {
      setValidationError('يرجى إدخال اسمك ثلاثياً للمتابعة');
      return;
    }
    if (name.trim().split(/\s+/).length < 2) {
      setValidationError('يرجى كتابة الاسم ثنائياً أو ثلاثياً على الأقل');
      return;
    }
    setDirection(1);
    setStep(2);
  };

  // Step 2 Validation -> Next
  const handleNextStep2 = () => {
    setValidationError('');
    if (!grade) {
      setValidationError('يرجى اختيار المرحلة الدراسية');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 25) {
      setValidationError('يرجى إدخال سن مناسب بين 10 و 25 سنة');
      return;
    }

    if (!classroom.trim()) {
      setValidationError('يرجى إدخال الفصل المدرسي (مثال: 1/2)');
      return;
    }

    if (isSecondarySenior && !track) {
      setValidationError('يرجى اختيار المسار التخصصي لطلاب تانية وتالتة ثانوي');
      return;
    }

    setDirection(1);
    setStep(3);
  };

  // Step Back
  const handlePrevStep = () => {
    setValidationError('');
    setDirection(-1);
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1));
  };

  // Final Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError('');

    const parsedAge = parseInt(age, 10);

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
        'تم استخراج هوية الطالب بنجاح ✨',
        `أهلاً بك يا ${name.trim().split(' ')[0]} في منصة Ethos المدرسية!`,
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

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#243a33] bg-slate-50/70 dark:bg-[#15231f] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#182924] transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const selectClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#243a33] bg-slate-50/70 dark:bg-[#15231f] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#182924] transition-all duration-200 cursor-pointer";

  // Animation variants
  const slideVariants = {
    enter: (dirValue: number) => ({
      x: dirValue > 0 ? (isRtl ? -40 : 40) : (isRtl ? 40 : -40),
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dirValue: number) => ({
      x: dirValue > 0 ? (isRtl ? 40 : -40) : (isRtl ? -40 : 40),
      opacity: 0,
    }),
  };

  const progressPercent = step === 1 ? 33.33 : step === 2 ? 66.66 : 100;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none cursor-default"
      dir={dir}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div 
        className="w-full h-full sm:h-auto sm:max-w-lg bg-white/95 dark:bg-[#111a17]/95 backdrop-blur-xl border-0 sm:border border-slate-200/90 dark:border-emerald-500/20 rounded-none sm:rounded-3xl shadow-2xl shadow-emerald-950/25 overflow-hidden flex flex-col max-h-none sm:max-h-[92vh] animate-in zoom-in-95 duration-200 cursor-auto select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Ribbon & Stepper Navigation (Centered Balance) */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-[#0d2e25] to-teal-950 p-5 sm:p-6 text-white border-b border-emerald-500/20 text-center">
          {/* Centered Crest & Title */}
          <div className="flex flex-col items-center justify-center mb-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner mb-2">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
              منصة Ethos المدرسية
            </h3>
            <p className="text-[11px] text-emerald-300/80 font-medium mt-1">
              {step === 1 && 'الخطوة 1 من 3: الترحيب وبيانات الاسم'}
              {step === 2 && 'الخطوة 2 من 3: المعلومات الدراسية'}
              {step === 3 && 'الخطوة 3 من 3: مراجعة واعتماد هوية الطالب'}
            </p>
          </div>

          {/* Stepper Progress Bar & Dots */}
          <div className="space-y-2 pt-1 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-200/80">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-emerald-500 text-white shadow-xs' : 'bg-white/10 text-white/60'}`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                <span>الاسم</span>
              </div>
              <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-emerald-500 text-white shadow-xs' : 'bg-white/10 text-white/60'}`}>
                  {step > 2 ? '✓' : '2'}
                </span>
                <span>الدراسة</span>
              </div>
              <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-emerald-500 text-white shadow-xs' : 'bg-white/10 text-white/60'}`}>
                  3
                </span>
                <span>الهوية</span>
              </div>
            </div>

            {/* Progress track */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 rounded-full"
                initial={{ width: '33.33%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Modal Dynamic Body with AnimatePresence */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-[310px]">
          {validationError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
              <span className="font-bold">تنبيه:</span> {validationError}
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 1: Welcome & Name */}
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="space-y-5"
              >
                <div className="text-center py-2 space-y-1.5">
                  <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-1">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    مرحباً بك في منصة Ethos
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    المنظومة المدرسية الذكية لترسيخ قيم النزاهة وحفظ الأمانات وتوثيق السلوك الإيجابي
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>الاسم بالكامل</span>
                    <span className="text-rose-500 text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNextStep1();
                      }
                    }}
                    placeholder="أدخل اسمك ثلاثياً..."
                    className={inputClasses}
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    💡 يرجى كتابة الاسم الثلاثي كما هو معتمد في كشوف المدرسة لربطه بالهوية.
                  </p>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    disabled={!name.trim()}
                    className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 dark:shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none group"
                  >
                    <span className="text-sm font-bold tracking-wide">المتابعة للبيانات الدراسية</span>
                    <NextIcon className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Academic Information */}
            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    المعلومات الدراسية والفصل
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    حدد مرحلتك التعليمية وفصلك الدراسي لتخصيص تجربتك وسجلاتك المدرسية
                  </p>
                </div>

                {/* Grade and Age Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

                {/* Classroom & Optional Track */}
                <div className="space-y-3.5">
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
                      placeholder="مثال: 1/2 أو 2/3"
                      className={inputClasses}
                    />
                  </div>

                  {isSecondarySenior && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>المسار التخصصي (للمرحلة الثانوية)</span>
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
                    </motion.div>
                  )}
                </div>

                {/* Step 2 Actions */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-[#243a33] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2b25] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BackIcon className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep2}
                    disabled={!grade || !classroom.trim() || !age || (isSecondarySenior && !track)}
                    className="flex-1 py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 dark:shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none group"
                  >
                    <span className="text-sm font-bold tracking-wide">معاينة الهوية وتأكيد التسجيل</span>
                    <NextIcon className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Summary & Final Confirmation */}
            {step === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>مراجعة واستخراج هوية الطالب</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تأكد من صحة بياناتك قبل إصدار الهوية الرقمية والربط السحابي
                  </p>
                </div>

                {/* Digital Student Identity Card Preview */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 via-teal-900/20 to-slate-900/30 dark:from-[#0d2a22] dark:to-[#081813] border border-emerald-500/30 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />

                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300">
                        ETHOS DIGITAL STUDENT ID
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      طالب نشط
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">اسم الطالب</p>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {name.trim()}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-500/10">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">الصف الدراسي</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{grade}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-500/10">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">الفصل</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{classroom.trim()}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-500/10">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">العمر</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{age} سنة</p>
                      </div>
                    </div>

                    {track && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">المسار: </span>
                        <span className="font-bold text-emerald-800 dark:text-emerald-200">{track}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Privacy & Trust Badge Box */}
                <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-slate-600 dark:text-emerald-200/80 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    يتم حفظ هذه البيانات بأمان في السجل المدرسي لمنظومة Ethos لربطها ببطاقة الطالب وشهادات النزاهة دون مشاركة أي معلومات حساسة.
                  </p>
                </div>

                {/* Step 3 Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="py-3.5 px-4 rounded-xl border border-slate-200 dark:border-[#243a33] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2b25] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <BackIcon className="w-4 h-4" />
                    <span>تعديل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/25 dark:shadow-emerald-900/35 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span className="text-sm font-semibold tracking-wide">جاري استخراج الهوية والربط السحابي...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold tracking-wide">تأكيد واستخراج هوية الطالب ✨</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
