'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { firestoreService } from '@/services/firestoreService';
import { 
  GraduationCap, 
  User, 
  School, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Compass
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
  const { currentUser, setCurrentUser, addToast, dir } = useApp();

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
      setValidationError('يرجى إدخال الفصل المدرسي (مثال: 2/1)');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 25) {
      setValidationError('يرجى إدخال سن مناسب (بين 10 و 25 سنة)');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedProfile = {
        ...currentUser,
        name: name.trim(),
        grade: grade,
        track: isSecondarySenior ? track : undefined,
        classroom: classroom.trim(),
        age: parsedAge,
      };

      // 1. Update Context state
      setCurrentUser(updatedProfile);

      // 2. Persist to Firestore
      await firestoreService.saveUserProfile(updatedProfile);

      // 3. Persist to LocalStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('findit_current_user_v4', updatedProfile.id);
        localStorage.setItem('findit_onboarding_completed', 'true');
      }

      addToast(
        'تم حفظ البيانات بنجاح',
        `أهلاً بك يا ${name.split(' ')[0]} في مجتمع الأمانة المدرسي!`,
        'success'
      );

      onClose();
    } catch (err) {
      setValidationError('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      dir={dir}
    >
      <div 
        className="w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 text-white text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-3 text-emerald-300 shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">تسجيل بيانات الطالب في FindIt</h2>
          <p className="text-xs text-emerald-200/80 mt-1 max-w-xs mx-auto leading-relaxed">
            المنصة الذكية لحفظ الأمانات وتعزيز النزاهة الطلابية
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center gap-2">
              <span className="font-semibold">تنبيه:</span> {validationError}
            </div>
          )}

          {/* Student Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              <span>الاسم بالكامل</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ملك محمد فاروق"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Grade Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-500" />
              <span>المرحلة الدراسية</span>
              <span className="text-red-500">*</span>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            >
              <option value="">اختر المرحلة الدراسية...</option>
              {GRADES.map((g) => (
                <option key={g.id} value={g.label}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Track Selection (Only for 2nd & 3rd Secondary) */}
          {isSecondarySenior && (
            <div className="space-y-1.5 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>المسار التخصصي (خاص بالمرحلة الثانوية)</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                required={isSecondarySenior}
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              >
                <option value="">اختر المسار التخصصي...</option>
                {TRACKS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                يحدد المسار الأكاديمي المعتمد في سجل شهادة النزاهة وسجلات المدرسة.
              </p>
            </div>
          )}

          {/* Classroom and Age in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Classroom */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-500" />
                <span>الفصل</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="مثال: 2/1 أو 3/5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>السن</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="10"
                max="25"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="مثال: 16"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              يتم حفظ هذه البيانات في السجل المدرسي لمنصة FindIt، وتستخدم فقط لإثبات أحقية استلام الأمانات وتوثيق نقاط سفير النزاهة دون مشاركة أي معرفات شخصية حساسة.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-medium rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <span>جاري الحفظ والربط بـ Firebase...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تأكيد البيانات والدخول للمنصة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
