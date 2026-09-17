'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { Claim, Item } from '@/types';
import { 
  X, 
  KeyRound, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Trophy,
  Sparkles
} from 'lucide-react';

interface HandoverPinModalProps {
  claim: Claim;
  item: Item;
  isOpen: boolean;
  onClose: () => void;
}

export default function HandoverPinModal({ claim, item, isOpen, onClose }: HandoverPinModalProps) {
  const { completeHandover, dir, language } = useApp();
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const triggerSubtleCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#176B5B', '#059669', '#D97706', '#4F46E5'],
      });
    } catch (e) {
      console.log('Confetti error:', e);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (pin.length !== 4) {
      setErrorMessage(language === 'en' ? 'Please enter the 4-digit PIN' : 'يرجى إدخال رمز التسليم المكون من 4 أرقام');
      return;
    }

    const result = completeHandover(claim.id, pin);
    if (result.success) {
      setIsSuccess(true);
      triggerSubtleCelebration();
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in" dir={dir}>
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-[#18201D] dark:text-[#F1F5F3]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 end-4 sm:end-5 p-2 rounded-full bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#253934] text-[#18201D] dark:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess ? (
          <div className="space-y-4 text-start">
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] text-xs font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Verify Handover' : 'تأكيد التسليم المباشر'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D] dark:text-white">
                {language === 'en' ? 'Enter Handover PIN' : 'إدخال رمز التسليم (PIN)'}
              </h2>
              <p className="text-xs text-[#66706B] dark:text-[#94A39D]">
                {language === 'en' ? `Ask (${claim.claimant.name}) for the 4-digit PIN from their screen.` : `اطلب من الطالب (${claim.claimant.name}) الرمز المكون من 4 أرقام في شاشته.`}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F1F3F0] dark:bg-[#1C2B27] text-xs text-[#18201D] dark:text-white flex items-center justify-between">
              <span className="font-bold">{item.title}</span>
              <span className="text-[#176B5B] dark:text-[#2DD4BF] font-semibold">{item.color}</span>
            </div>

            {/* PIN Input */}
            <form onSubmit={handleVerify} className="space-y-3.5">
              <div className="space-y-1.5 text-center">
                <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                  {language === 'en' ? '4-Digit PIN' : 'الرمز السري المكون من 4 أرقام'}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-44 mx-auto text-center font-mono font-black text-2xl tracking-[0.6em] p-3 bg-slate-50 dark:bg-[#1C2B27] border border-slate-300 dark:border-[#2D3E3A] rounded-2xl focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:bg-white dark:focus:bg-[#15201D] focus:outline-none transition-all text-[#18201D] dark:text-white"
                  autoFocus
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {language === 'en' ? 'Confirm and Complete Handover' : 'تأكيد الرمز وإتمام التسليم'}
              </button>
            </form>

          </div>
        ) : (
          <div className="space-y-5 text-center py-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#2DD4BF] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#18201D] dark:text-white">
                {language === 'en' ? 'Item Reunited Successfully!' : 'تم تسليم الأمانة بنجاح!'}
              </h2>
              <p className="text-xs text-[#66706B] dark:text-[#94A39D]">
                {language === 'en' ? 'Thank you for your honesty! Points and integrity badges have been awarded.' : 'شكراً لأمانتك وحسن صنيعك. تم توثيق التسليم واحتساب نقاط الأمانة.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#122823] border border-emerald-200 dark:border-[#1E463D] flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950 dark:text-emerald-300">
                {language === 'en' ? 'Reward Points:' : 'نقاط الأمانة المكتسبة:'}
              </span>
              <span className="font-black text-[#176B5B] dark:text-[#2DD4BF] text-sm">
                +50 {language === 'en' ? 'pts' : 'نقطة'} ✨
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 font-bold text-xs hover:bg-[#125648] dark:hover:bg-[#14B8A6] transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Done' : 'إغلاق'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
