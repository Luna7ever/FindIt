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
  const { completeHandover } = useApp();
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
      setErrorMessage('يرجى إدخال رمز التسليم المكون من 4 أرقام');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white border border-[#E4E7E4] rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess ? (
          <div className="space-y-4 text-right">
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1ED] text-[#176B5B] text-xs font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                <span>تأكيد التسليم المباشر</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D]">
                إدخال رمز التسليم (PIN)
              </h2>
              <p className="text-xs text-[#66706B]">
                اطلب من الطالب <strong>({claim.claimant.name})</strong> الرمز المكون من 4 أرقام في شاشته.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F1F3F0] text-xs text-[#18201D] flex items-center justify-between">
              <span className="font-bold">{item.title}</span>
              <span className="text-[#176B5B] font-semibold">{item.color}</span>
            </div>

            {/* PIN Input */}
            <form onSubmit={handleVerify} className="space-y-3.5">
              <div className="space-y-1.5 text-center">
                <label className="block text-xs font-bold text-[#18201D]">
                  أدخل رمز الـ 4 أرقام:
                </label>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="• • • •"
                  className="w-full py-3 text-center tracking-[0.5em] text-2xl font-bold text-[#18201D] bg-[#F1F3F0] border border-[#E4E7E4] rounded-2xl focus:bg-white focus:border-[#176B5B] focus:outline-none font-mono shadow-inner transition-colors"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#E11D48] text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>التحقق من الرمز وإتمام التسليم</span>
              </button>
            </form>

            <div className="text-[11px] text-[#66706B] text-center">
              💡 الرمز لـ {claim.claimant.name}: <span className="text-[#176B5B] font-bold font-mono">{claim.handoverPin}</span>
            </div>

          </div>
        ) : (
          <div className="space-y-4 text-center py-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center mx-auto shadow-2xs">
              <Sparkles className="w-7 h-7 text-[#059669]" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#059669] tracking-wider uppercase">
                فُقِدَ • تَطابَقَ • عَادَ 🎉
              </span>
              <h3 className="text-xl font-extrabold text-[#18201D]">
                عادت الأمانة لصاحبها!
              </h3>
              <p className="text-xs text-[#66706B] max-w-xs mx-auto">
                شكراً لأمانتك! تم توثيق استرداد <strong>({item.title})</strong> بنجاح.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F1F3F0] text-xs space-y-1.5 text-right">
              <div className="flex items-center justify-between text-[#18201D]">
                <span>نقاط الأمانة والموثوقية المكتسبة:</span>
                <span className="font-bold text-[#176B5B]">+50 نقطة ⭐</span>
              </div>
              <div className="flex items-center justify-between text-[#18201D]">
                <span>شارة الطالب الموثوق:</span>
                <span className="font-bold text-[#059669] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  مفعلة
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#18201D] text-white font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
