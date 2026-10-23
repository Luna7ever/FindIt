'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { d1DataService } from '@/services/d1DataService';
import { logger } from '@/lib/logging/logger';
import { UserProfile } from '@/types';
import { speakKidsText } from '@/lib/kidsVoice';
import confetti from 'canvas-confetti';
import { 
  User, 
  School, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  IdCard,
  Lock,
  Volume2,
  Star,
  Heart,
  Smile
} from 'lucide-react';

export interface GradeItem {
  id: string;
  label: string;
  labelEn: string;
  shortLabel: string;
  emoji: string;
  ageMin: number;
  ageMax: number;
  hasTrack?: boolean;
}

export const GRADES: GradeItem[] = [
  { id: 'kg_1', label: 'KG 1 (روضة أولى)', labelEn: 'KG 1 (Preschool 1)', shortLabel: 'KG 1', emoji: '🌱', ageMin: 3, ageMax: 5, hasTrack: false },
  { id: 'kg_2', label: 'KG 2 (روضة ثانية)', labelEn: 'KG 2 (Preschool 2)', shortLabel: 'KG 2', emoji: '🐣', ageMin: 4, ageMax: 6, hasTrack: false },
  { id: 'prim_1', label: 'أولى ابتدائي', labelEn: '1st Grade Primary', shortLabel: 'أولى ابتدائي', emoji: '🎒', ageMin: 5, ageMax: 7, hasTrack: false },
  { id: 'prim_2', label: 'تانية ابتدائي', labelEn: '2nd Grade Primary', shortLabel: 'تانية ابتدائي', emoji: '✏️', ageMin: 6, ageMax: 8, hasTrack: false },
  { id: 'prim_3', label: 'تالتة ابتدائي', labelEn: '3rd Grade Primary', shortLabel: 'تالتة ابتدائي', emoji: '🎨', ageMin: 7, ageMax: 9, hasTrack: false },
  { id: 'prim_4', label: 'رابعة ابتدائي', labelEn: '4th Grade Primary', shortLabel: 'رابعة ابتدائي', emoji: '⭐', ageMin: 8, ageMax: 10, hasTrack: false },
  { id: 'prim_5', label: 'خامسة ابتدائي', labelEn: '5th Grade Primary', shortLabel: 'خامسة ابتدائي', emoji: '🏆', ageMin: 9, ageMax: 12, hasTrack: false },
];

export const AVATAR_OPTIONS = [
  { id: 'girl', emoji: '👧', label: 'أميرة الأمانة', labelEn: 'Honest Girl' },
  { id: 'boy', emoji: '👦', label: 'بطل النزاهة', labelEn: 'Integrity Boy' },
  { id: 'star', emoji: '🌟', label: 'النجم الصغير', labelEn: 'Little Star' },
  { id: 'lion', emoji: '🦁', label: 'الشجاع', labelEn: 'Brave Hero' },
  { id: 'rocket', emoji: '🚀', label: 'المستكشف', labelEn: 'Explorer' },
  { id: 'artist', emoji: '🎨', label: 'المبدع', labelEn: 'Creative Artist' },
];

interface StudentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentOnboardingModal({ isOpen, onClose }: StudentOnboardingModalProps) {
  const { currentUser, updateUserProfile, addToast, dir, language, setLanguage } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<number>(1);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [classroom, setClassroom] = useState('');
  const [age, setAge] = useState<string>('');
  const [avatarEmoji, setAvatarEmoji] = useState('👧');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const isRtl = dir === 'rtl';
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  // Grade & Classroom localized display helpers
  const selectedGradeObj = GRADES.find((g) => g.label === grade || g.labelEn === grade || g.id === grade || g.shortLabel === grade);
  const displayGrade = language === 'en' ? (selectedGradeObj?.labelEn || grade) : (selectedGradeObj?.label || grade);
  const displayClassroom = language === 'en'
    ? (classroom.toLowerCase().includes('فصل') ? classroom.replace(/فصل/g, 'Class').trim() : (classroom ? `Class ${classroom.trim()}` : ''))
    : classroom.trim();

  // Non-dismissible on ESC if mandatory
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
      setClassroom(isDemo ? '' : (currentUser.classroom || ''));
      setAge(isDemo ? '' : (currentUser.age ? String(currentUser.age) : ''));
      if (currentUser.avatar && AVATAR_OPTIONS.some(a => a.emoji === currentUser.avatar)) {
        setAvatarEmoji(currentUser.avatar);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Audio Guidance Voice
  const playStepAudio = (targetStep: number) => {
    if (targetStep === 1) {
      speakKidsText(
        language === 'en'
          ? 'Welcome little hero! Type your lovely name and choose your favorite avatar!'
          : 'أهلاً بك يا بطل في إيثوس! اكتب اسمك الجميل واختار بطلك المفضل!'
      );
    } else if (targetStep === 2) {
      speakKidsText(
        language === 'en'
          ? 'Great job! Now choose your classroom, your grade, and how old you are!'
          : 'شاطر يا بطل! دلوقتي اختار صفك وفصلك الجميل وعمرك!'
      );
    } else if (targetStep === 3) {
      speakKidsText(
        language === 'en'
          ? 'Your Little Hero card is ready! Tap confirm to start playing!'
          : 'يا سلام! بطاقتك جاهزة يا بطل! اضغط تأكيد علشان تبدأ اللعب والمغامرة!'
      );
    }
  };

  // Step 1 Validation -> Next
  const handleNextStep1 = () => {
    setValidationError('');
    if (!name.trim() || name.trim().length < 2) {
      const err = language === 'en' ? 'Please enter your lovely name (at least 2 letters) 🌟' : 'يرجى كتابة اسمك الجميل يا بطل 🌟';
      setValidationError(err);
      speakKidsText(err);
      return;
    }
    setDirection(1);
    setStep(2);
    playStepAudio(2);
  };

  // Step 2 Validation -> Next
  const handleNextStep2 = () => {
    setValidationError('');
    if (!grade) {
      const err = language === 'en' ? 'Please choose your grade! 🎒' : 'يرجى اختيار صفك الدراسي يا بطل! 🎒';
      setValidationError(err);
      speakKidsText(err);
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 3 || parsedAge > 13) {
      const err = language === 'en' ? 'Please enter your age between 3 and 12 years 🎂' : 'يرجى إدخال عمر مناسب بين 3 و 12 سنة 🎂';
      setValidationError(err);
      speakKidsText(err);
      return;
    }

    if (!classroom.trim()) {
      const err = language === 'en' ? 'Please enter your classroom (e.g. 1/1) 🏫' : 'يرجى كتابة فصلك المدرسي (مثال: 1/1) 🏫';
      setValidationError(err);
      speakKidsText(err);
      return;
    }

    setDirection(1);
    setStep(3);
    playStepAudio(3);
  };

  // Step Back
  const handlePrevStep = () => {
    setValidationError('');
    setDirection(-1);
    const prevStep = step > 1 ? ((step - 1) as 1 | 2 | 3) : 1;
    setStep(prevStep);
    playStepAudio(prevStep);
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
        track: '',
        classroom: classroom.trim(),
        age: parsedAge,
        avatar: avatarEmoji,
        role: 'student',
        isTrusted: currentUser.isTrusted ?? true,
        goodwillPoints: currentUser.goodwillPoints ?? 20,
      };

      // 1. Save student profile to Cloudflare D1
      await d1DataService.saveUserProfile(studentData);

      // 2. Save locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('ethos_student', JSON.stringify(studentData));
        localStorage.setItem('findit_current_user_profile_v5', JSON.stringify(studentData));
        localStorage.setItem('findit_current_user_v4', studentData.id);
        localStorage.setItem('findit_onboarding_completed', 'true');
      }

      // 3. Update app context
      await updateUserProfile(studentData);

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#78C218', '#38BDF8', '#F59E0B', '#EC4899', '#10B981']
        });
      } catch (e) {
        // Safe fallback
      }

      const welcomeMsg = language === 'en'
        ? `Welcome ${name.trim()}! Your Little Hero card is ready!`
        : `أهلاً بك يا ${name.trim().split(' ')[0]} في إيثوس! بطاقتك جاهزة ويلا نبدأ اللعب! 🌟`;

      speakKidsText(welcomeMsg);

      addToast(
        language === 'en' ? 'Welcome Little Hero! ✨' : 'أهلاً بك يا بطل الأمانة ✨',
        welcomeMsg,
        'success'
      );

      onClose();
    } catch (err: any) {
      logger.error('Error in onboarding submit', { error: String(err) });
      setValidationError(language === 'en' ? 'An error occurred while saving, please try again.' : 'حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-2xl border-2 border-amber-200 dark:border-emerald-800 bg-white/90 dark:bg-[#15231f] text-slate-900 dark:text-slate-100 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-300/40 dark:focus:ring-emerald-500/30 focus:border-amber-400 dark:focus:border-emerald-400 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs";

  const slideVariants = {
    enter: (dirValue: number) => ({
      x: dirValue > 0 ? (isRtl ? -35 : 35) : (isRtl ? 35 : -35),
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dirValue: number) => ({
      x: dirValue > 0 ? (isRtl ? 35 : -35) : (isRtl ? -35 : 35),
      opacity: 0,
    }),
  };

  const progressPercent = step === 1 ? 33.33 : step === 2 ? 66.66 : 100;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 select-none cursor-default"
      dir={dir}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div 
        className="w-full max-w-lg bg-gradient-to-b from-[#FEFCE8] to-white dark:from-[#111c18] dark:to-[#0c1411] border-2 border-amber-300/80 dark:border-emerald-500/30 rounded-[32px] shadow-2xl shadow-amber-950/20 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 cursor-auto select-text text-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Ribbon & Cheerful Stepper */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 p-4 sm:p-5 text-white border-b-2 border-emerald-400/30 text-center shadow-sm">
          {/* Top Actions: Voice trigger & Language switcher */}
          <div className="absolute top-3 end-3 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={() => {
                const nextLang = language === 'ar' ? 'en' : 'ar';
                setLanguage(nextLang);
                speakKidsText(nextLang === 'en' ? 'Switched to English!' : 'تم التبديل إلى العربية!');
              }}
              className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-black text-[11px] transition-transform active:scale-95 cursor-pointer shadow-xs flex items-center gap-1 border border-white/20"
              title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            >
              <span>🌐</span>
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            <button
              type="button"
              onClick={() => playStepAudio(step)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-transform active:scale-90 cursor-pointer shadow-xs"
              title={language === 'en' ? 'Voice Guidance 🔊' : 'استمع للإرشادات بصوت مرح 🔊'}
            >
              <Volume2 className="w-5 h-5 text-amber-200 animate-pulse" />
            </button>
          </div>

          {/* Centered Cheerful Avatar Crest */}
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="w-14 h-14 rounded-full bg-white shadow-md border-3 border-amber-300 flex items-center justify-center text-3xl mb-1.5 animate-bounce">
              {avatarEmoji}
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight flex items-center gap-1.5">
              <span>{language === 'en' ? 'Little Hero Registration 🌟' : 'تسجيل البطل الصغير 🌟'}</span>
            </h3>
            <p className="text-xs text-emerald-100 font-bold mt-0.5">
              {step === 1 && (language === 'en' ? 'Step 1 of 3: Your Name & Character 👧👦' : 'الخطوة 1 من 3: اسمك وشخصيتك المفضلة 👧👦')}
              {step === 2 && (language === 'en' ? 'Step 2 of 3: Your Class & Grade 🎒' : 'الخطوة 2 من 3: صفك وفصلك الجميل 🎒')}
              {step === 3 && (language === 'en' ? 'Step 3 of 3: Your Hero Identity Card 🌟' : 'الخطوة 3 من 3: بطاقتك المدرسية 🌟')}
            </p>
          </div>

          {/* Stepper Progress Bar & Dots */}
          <div className="space-y-1.5 pt-1 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs font-black text-emerald-100">
              <div className={`flex items-center gap-1 ${step >= 1 ? 'text-amber-200 font-black' : 'text-emerald-200/60'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-amber-400 text-slate-900 shadow-sm' : 'bg-white/20 text-white'}`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                <span>{language === 'en' ? 'Name' : 'الاسم'}</span>
              </div>
              <div className={`flex items-center gap-1 ${step >= 2 ? 'text-amber-200 font-black' : 'text-emerald-200/60'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-amber-400 text-slate-900 shadow-sm' : 'bg-white/20 text-white'}`}>
                  {step > 2 ? '✓' : '2'}
                </span>
                <span>{language === 'en' ? 'Class' : 'فصلي'}</span>
              </div>
              <div className={`flex items-center gap-1 ${step === 3 ? 'text-amber-200 font-black' : 'text-emerald-200/60'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === 3 ? 'bg-amber-400 text-slate-900 shadow-sm' : 'bg-white/20 text-white'}`}>
                  3
                </span>
                <span>{language === 'en' ? 'Card' : 'بطاقتي'}</span>
              </div>
            </div>

            {/* Progress track */}
            <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden p-0.5">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-300 via-yellow-300 to-lime-300 rounded-full"
                initial={{ width: '33.33%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Modal Dynamic Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-[300px]">
          {validationError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-black flex items-center gap-2 animate-in fade-in">
              <span className="text-base">⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 1: Welcome & Name & Character Avatar */}
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
                <div className="text-center py-1 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-black">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                    <span>{language === 'en' ? 'Welcome to ETHOS Playground! 🎮' : 'أهلاً بك في عالم إيثوس للأبطال! 🎮'}</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
                    {language === 'en' ? 'What is your lovely name?' : 'ما هو اسمك الجميل يا بطل؟'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {language === 'en' ? 'Type your name and choose your favorite character avatar!' : 'اكتب اسمك واختار الأفاتار المفضل ليك علشان يظهر في كل ألعابك!'}
                  </p>
                </div>

                {/* Avatar Picker Carousel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Smile className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'en' ? 'Choose Your Character Avatar:' : 'اختر شخصيتك الكرتونية:'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => speakKidsText(language === 'en' ? 'Choose your favorite character!' : 'اختار شخصيتك المفضلة!')}
                      className="p-1 text-slate-400 hover:text-emerald-500 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((item) => {
                      const isSelected = avatarEmoji === item.emoji;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setAvatarEmoji(item.emoji);
                            speakKidsText(language === 'en' ? item.labelEn : item.label);
                          }}
                          className={`p-2 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-100 dark:bg-emerald-950/60 border-amber-400 dark:border-emerald-400 shadow-md scale-105 ring-2 ring-amber-400/50'
                              : 'bg-white dark:bg-[#162420] border-slate-200 dark:border-slate-800 hover:border-amber-300 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate w-full text-center">
                            {language === 'en' ? item.labelEn : item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'en' ? 'Your Name' : 'اسم البطل'}</span>
                      <span className="text-rose-500">*</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => speakKidsText(language === 'en' ? 'Type your name here' : 'اكتب اسمك الجميل هنا')}
                      className="p-1 text-slate-400 hover:text-emerald-500 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
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
                    placeholder={language === 'en' ? 'e.g. Malak Mohamed...' : 'مثال: ملك محمد...'}
                    className={inputClasses}
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    💡 {language === 'en' ? 'Write your name as it appears in school!' : 'اكتب اسمك الجميل كما تناديك المعلمة في المدرسة!'}
                  </p>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    disabled={!name.trim()}
                    className="w-full py-3.5 px-5 bg-gradient-to-r from-[#78C218] via-emerald-600 to-[#176B5B] hover:brightness-105 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-lime-950/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span>{language === 'en' ? 'Next: Choose My Class 🎒' : 'المتابعة لاختيار صفي وفصلي 🎒'}</span>
                    <NextIcon className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Academic Grade, Class & Age (Primary & Early Childhood Only: KG1 to Grade 5) */}
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
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <School className="w-5 h-5 text-emerald-600" />
                      <span>{language === 'en' ? 'My Grade & Classroom 🎒' : 'صفي وفصلي الجميل 🎒'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                      {language === 'en' ? 'Choose your grade level and class' : 'اختار مرحلتك التعليمية وفصلك الجميل'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakKidsText(language === 'en' ? 'Choose your grade, classroom, and age' : 'اختار صفك الدراسي وفصلك وعمرك')}
                    className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-600 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Grade Selection Chips (From KG 1 up to Grade 5) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <span>{language === 'en' ? 'Select Grade (KG 1 - Grade 5):' : 'اختر الصف الدراسي (من KG1 حتى خامسة ابتدائي):'}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GRADES.map((g) => {
                      const isSelected = grade === g.label;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            setGrade(g.label);
                            // Pre-fill default age recommendation
                            if (!age) setAge(String(g.ageMin + 1));
                            speakKidsText(language === 'en' ? g.labelEn : g.label);
                          }}
                          className={`p-2.5 rounded-2xl border-2 text-start transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-md scale-102 font-black'
                              : 'bg-white dark:bg-[#162420] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-300 font-bold'
                          }`}
                        >
                          <span className="text-xl shrink-0">{g.emoji}</span>
                          <span className="text-xs truncate">
                            {language === 'en' ? g.labelEn : g.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Classroom and Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'en' ? 'Classroom (e.g. 1/1)' : 'الفصل المدرسي (مثال: 1/1)'}</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={classroom}
                      onChange={(e) => setClassroom(e.target.value)}
                      placeholder={language === 'en' ? 'e.g. 1/1 or Stars Class' : 'مثال: 1/1 أو فصل النجوم 🌟'}
                      className={inputClasses}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'en' ? 'Age (Years)' : 'العمر (سنوات)'}</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="13"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder={language === 'en' ? 'e.g. 6 or 7' : 'مثال: 6 أو 7 سنوات'}
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Quick Age Pills */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'en' ? 'Quick select your age:' : 'أو اضغط على عمرك مباشرة:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setAge(String(num));
                          speakKidsText(language === 'en' ? `${num} years old` : `${num} سنوات`);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                          age === String(num)
                            ? 'bg-amber-400 text-slate-900 border-amber-500 scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                        }`}
                      >
                        {num} {language === 'en' ? 'yrs' : 'سنوات'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="py-3 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BackIcon className="w-4 h-4" />
                    <span>{language === 'en' ? 'Back' : 'السابق'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep2}
                    disabled={!grade || !classroom.trim() || !age}
                    className="flex-1 py-3 px-5 bg-gradient-to-r from-[#78C218] via-emerald-600 to-[#176B5B] hover:brightness-105 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-lime-950/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span>{language === 'en' ? 'Preview My Hero Card 🌟' : 'معاينة بطاقة البطل الصغير 🌟'}</span>
                    <NextIcon className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Summary & Final Little Hero Identity Card */}
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
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <IdCard className="w-5 h-5 text-emerald-600" />
                      <span>{language === 'en' ? 'My Hero Card 🌟' : 'بطاقة البطل الصغير 🌟'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                      {language === 'en' ? 'Review your card and click confirm to start!' : 'راجع بياناتك واضغط تأكيد علشان تبدأ اللعب!'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakKidsText(language === 'en' ? 'Your hero card is ready! Tap confirm to start playing!' : 'يا سلام! بطاقتك جاهزة يا بطل! اضغط تأكيد علشان تبدأ اللعب والمغامرة!')}
                    className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-600 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Digital Little Hero Identity Card Preview */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FEF08A]/60 via-[#BAE6FD]/40 to-[#A7F3D0]/60 dark:from-[#0d2a22] dark:to-[#081813] border-3 border-amber-300 dark:border-emerald-500/40 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b-2 border-amber-300/40 dark:border-emerald-500/20 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-2xl bg-[#78C218] text-white flex items-center justify-center text-xl shadow-sm">
                        ⭐
                      </div>
                      <div>
                        <span className="font-black text-xs text-emerald-900 dark:text-emerald-300 block">
                          {language === 'en' ? 'ETHOS HERO CARD' : 'بطاقة بطل النزاهة الصغير'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {language === 'en' ? 'Official Student ID' : 'معتمدة في الحرم المدرسي'}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-lime-500 text-white shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      {language === 'en' ? 'Active Hero' : 'بطل نشط 🌟'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-white shadow-md border-3 border-amber-300 flex items-center justify-center text-4xl shrink-0">
                      {avatarEmoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        {language === 'en' ? 'Hero Name' : 'اسم البطل'}
                      </p>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">
                        {name.trim()}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                          {displayGrade}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-black">
                          {displayClassroom}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-amber-300/30 dark:border-emerald-500/20 text-xs">
                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-black/30 border border-amber-200 dark:border-emerald-500/20">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{language === 'en' ? 'Age' : 'العمر'}</p>
                      <p className="font-black text-slate-800 dark:text-slate-200">{age} {language === 'en' ? 'Years' : 'سنوات 🎂'}</p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-black/30 border border-amber-200 dark:border-emerald-500/20">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{language === 'en' ? 'Honor Rank' : 'الرتبة'}</p>
                      <p className="font-black text-emerald-700 dark:text-emerald-300">{language === 'en' ? 'Honest Hero ⭐' : 'بطل الأمانة ⭐'}</p>
                    </div>
                  </div>
                </div>

                {/* Privacy & Safe Note */}
                <div className="p-3 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-emerald-200/80 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p>
                    {language === 'en' 
                      ? 'All student information is safely encrypted and protected by the school system.'
                      : 'يتم حفظ بيانات البطل بأمان في سجلات المدرسة لربطها بالأنشطة والتحديات الممتعة!'}
                  </p>
                </div>

                {/* Step 3 Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <BackIcon className="w-4 h-4" />
                    <span>{language === 'en' ? 'Edit' : 'تعديل'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 px-5 bg-gradient-to-r from-[#78C218] via-emerald-600 to-[#176B5B] hover:brightness-105 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-lime-950/20 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span>{language === 'en' ? 'Issuing Hero Card...' : 'جاري استخراج بطاقة البطل...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                        <span>{language === 'en' ? 'Confirm & Start Playing! 🎮✨' : 'تأكيد واستخراج بطاقة البطل والبدء! 🎮✨'}</span>
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
