'use client';

import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Leaf, 
  Library, 
  Dumbbell, 
  Users, 
  Mic, 
  Square, 
  RotateCcw, 
  AlertCircle, 
  Play, 
  Pause, 
  Send,
  Volume2
} from 'lucide-react';
import { SchoolActivity, SchoolLocationId } from '@/types';
import { SCHOOL_LOCATIONS } from '@/lib/constants';
import { useApp } from '@/context/AppContext';
import { getLocalizedActivity, getLocalizedLocation } from '@/lib/i18n/seedDataTranslations';
import { speakKidsText } from '@/lib/kidsVoice';

interface ActivitySubmissionModalProps {
  activity: SchoolActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  Library: <Library className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
};

const MAX_RECORDING_SECONDS = 15;

export default function ActivitySubmissionModal({
  activity,
  isOpen,
  onClose,
  onSuccess,
}: ActivitySubmissionModalProps) {
  const { submitSchoolActivity, language, dir, t, addToast } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<SchoolLocationId | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioBase64, setAudioBase64] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [hasMicError, setHasMicError] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up recording when modal closes
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Reset state when opening a new activity
  useEffect(() => {
    if (isOpen) {
      setIsRecording(false);
      setRecordingSeconds(0);
      setAudioBlob(null);
      setAudioBase64('');
      setAudioUrl('');
      setHasMicError(false);
      setMicErrorMessage('');
    }
  }, [isOpen, activity?.id]);

  if (!isOpen || !activity) return null;

  const localizedActivity = getLocalizedActivity(activity, language);

  const startRecording = async () => {
    setHasMicError(false);
    setMicErrorMessage('');
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('المتصفح لا يدعم تسجيل الصوت');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // 15 seconds timer
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setRecordingSeconds(elapsed);
        if (elapsed >= MAX_RECORDING_SECONDS) {
          stopRecording();
        }
      }, 1000);

    } catch (err: any) {
      console.warn('Microphone access error:', err);
      setHasMicError(true);
      const friendlyMsg = language === 'en'
        ? 'Please ask your teacher or parent to enable the microphone!'
        : 'اطلبي من مامتك أو مدرستك تفعّل المايك عشان تحكي لنا اللي عملتيه!';
      setMicErrorMessage(friendlyMsg);
      speakKidsText(friendlyMsg);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioBase64('');
    setAudioUrl('');
    setRecordingSeconds(0);
    setIsRecording(false);
    setHasMicError(false);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#176B5B', '#2DD4BF', '#F59E0B', '#10B981'],
      });
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioBase64) {
      const promptText = language === 'en'
        ? 'Please record your voice note first to describe your activity!'
        : 'يرجى تسجيل رسالة صوتية تحكي فيها إيه اللي عملته قبل الإرسال!';
      addToast('تسجيل الصوت مطلوب 🎙️', promptText, 'warning');
      speakKidsText(promptText);
      return;
    }

    setIsSubmitting(true);

    try {
      const locId = (selectedLocation || activity.targetLocationId) as SchoolLocationId;
      submitSchoolActivity(
        activity.id,
        'تسجيل صوتي موثق من الطالب',
        locId,
        audioBase64,
        recordingSeconds || 15
      );

      triggerCelebration();

      addToast(
        language === 'en' ? 'Voice Evidence Submitted! 🎙️' : 'تم إرسال التسجيل الصوتي! 🎙️',
        language === 'en'
          ? 'Sent to school supervisor (Ms. Moshira) for approval'
          : 'تم إرسال صوتك للمشرفة م. مشيرة لمراجعته واعتماد النجوم لك!',
        'success'
      );

      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setIsSubmitting(false);
      addToast(
        language === 'en' ? 'Submission Error' : 'خطأ في الحفظ',
        err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ التوثيق',
        'error'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in" dir={dir}>
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#15201D] border-2 border-emerald-300 dark:border-[#263834] rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-[#18201D] dark:text-[#F1F5F3]"
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0 text-xl font-bold">
              {iconMap[activity.iconName] || <Sparkles className="w-6 h-6" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-[#176B5B] dark:text-[#2DD4BF] bg-emerald-50 dark:bg-[#122823] px-3 py-0.5 rounded-full border border-emerald-200/50 dark:border-[#1E463D] inline-block mb-1">
                {language === 'en' ? 'Supervised by School Admin' : 'باعتماد المشرفة المدرسية'}
              </span>
              <h2 className="text-base sm:text-xl font-black text-[#18201D] dark:text-white leading-tight">
                {localizedActivity.title}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
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
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto flex-1 text-start">
          
          {/* Location Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('activities.locationLabel')}</span>
            </label>
            <select
              value={selectedLocation || activity.targetLocationId || ''}
              onChange={(e) => setSelectedLocation(e.target.value as SchoolLocationId)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1C2B27] border border-slate-200 dark:border-[#2D3E3A] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#176B5B] dark:focus:border-[#2DD4BF] cursor-pointer font-medium"
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

          {/* Voice Proof Section (Microphone Only) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-cyan-50 dark:from-[#13221E] dark:via-[#162924] dark:to-[#122822] border-2 border-emerald-300/80 dark:border-emerald-700/60 text-center space-y-3">
            
            <div className="flex items-center justify-center gap-2">
              <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                {language === 'en' ? 'Record Your Voice Evidence 🎙️' : 'سجّل صوتك: إثبات النشاط 🎙️'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xs mx-auto">
              {language === 'en'
                ? 'Tap the microphone and tell the supervisor what you did in this activity!'
                : 'اضغط على المايك واحكي للمشرفة بصوتك إيه اللي عملته في النشاط!'}
            </p>

            {/* Error Message if Mic not permitted */}
            {hasMicError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex flex-col items-center gap-2 animate-in zoom-in-95">
                <div className="flex items-center gap-1.5 font-black">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{micErrorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Try Again' : 'إعادة المحاولة'}</span>
                </button>
              </div>
            )}

            {/* Recorder Controls */}
            {!audioUrl ? (
              <div className="flex flex-col items-center gap-2 pt-1">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse cursor-pointer border-4 border-white dark:border-[#13221E]"
                      title="إيقاف التسجيل"
                    >
                      <Square className="w-8 h-8 fill-current" />
                    </button>
                    <div className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span>{language === 'en' ? 'Listening...' : 'جاري الاستماع لصوتك:'} {MAX_RECORDING_SECONDS - recordingSeconds} ثانية</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-white dark:border-[#13221E]"
                    title="بدء التسجيل الصوتي"
                  >
                    <Mic className="w-9 h-9" />
                  </button>
                )}
                {!isRecording && !hasMicError && (
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'en' ? 'Tap mic to speak (Max 15s)' : 'اضغط للتحدث (بحد أقصى 15 ثانية)'}
                  </span>
                )}
              </div>
            ) : (
              /* Playback & Re-record */
              <div className="p-3 bg-white dark:bg-[#182723] rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'en' ? 'Voice Recorded Successfully!' : 'تم تسجيل صوتك بنجاح! 🎉'}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">{recordingSeconds} ثانية</span>
                </div>

                <audio controls src={audioUrl} className="w-full h-10 rounded-xl" />

                <button
                  type="button"
                  onClick={resetRecording}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Re-record Voice Note' : 'إعادة تسجيل الصوت من جديد'}</span>
                </button>
              </div>
            )}

          </div>

          {/* Info Notice for Kids */}
          <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-[11px] text-blue-950 dark:text-blue-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              {language === 'en'
                ? 'Your voice note will be sent directly to the school supervisor (Ms. Moshira). Stars and badges will be awarded upon approval!'
                : 'سيتم إرسال تسجيلك الصوتي مباشرة إلى المشرفة (م. مشيرة). سيتم اعتماد النشاط وإضاءة النجمة ومنحك الوسام بمجرد استماعها لصوتك والتأكد من إنجازك!'}
            </p>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !audioBase64}
              className="w-full py-3.5 min-h-[46px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'en' ? 'Send Voice Recording to Supervisor' : 'إرسال التسجيل الصوتي للمشرفة 🎙️✨'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
