'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SCHOOL_LOCATIONS } from '@/lib/constants';
import ItemVisual from '@/components/ItemVisual';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

interface ClaimModalProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimModal({ itemId, isOpen, onClose }: ClaimModalProps) {
  const router = useRouter();
  const { getItemById, submitClaim, getClaimForCurrentUserAndItem, dir, language } = useApp();

  const [answerText, setAnswerText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedClaimPin, setGeneratedClaimPin] = useState('');

  if (!isOpen) return null;

  const item = getItemById(itemId);
  if (!item) return null;

  const existingClaim = getClaimForCurrentUserAndItem(itemId);
  const locationInfo = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) {
      alert(language === 'en' ? 'Please enter the answer to the secret question' : 'يرجى كتابة الإجابة على السؤال السري');
      return;
    }

    const claim = submitClaim(itemId, answerText.trim());
    setGeneratedClaimPin(claim.handoverPin);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in" dir={dir}>
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-[#18201D] dark:text-[#F1F5F3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 end-4 sm:end-5 p-2 rounded-full bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#253934] text-[#18201D] dark:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess && !existingClaim ? (
          <div className="space-y-4 text-start">
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1ED] dark:bg-[#122B25] text-[#176B5B] dark:text-[#2DD4BF] text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Proof of Ownership' : 'إثبات الملكية'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D] dark:text-white">
                {language === 'en' ? 'Claim Found Item' : 'المطالبة بالغرض المعثور عليه'}
              </h2>
              <p className="text-xs text-[#66706B] dark:text-[#94A39D]">
                {language === 'en' ? 'Answer the secret question set by the finder to verify your ownership.' : 'أجب على السؤال السري الذي وضعه الملتقط للتأكد من هويتك.'}
              </p>
            </div>

            {/* Item Mini Card */}
            <div className="p-3 rounded-2xl bg-[#F1F3F0] dark:bg-[#1C2B27] flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <ItemVisual
                  category={item.category}
                  title={item.title}
                  imageUrl={item.imageUrl}
                  className="w-full h-full"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-[#18201D] dark:text-white text-xs sm:text-sm truncate">{item.title}</h4>
                <p className="text-[11px] text-[#66706B] dark:text-[#94A39D] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#176B5B] dark:text-[#2DD4BF]" />
                  {locationInfo?.name}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                  <HelpCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>{language === 'en' ? 'Secret Question:' : 'السؤال السري:'}</span>
                </div>
                <p className="text-xs font-semibold text-amber-950 dark:text-amber-200 pr-6">
                  {item.secretQuestion || (language === 'en' ? 'Describe distinguishing markings or unique details on this item.' : 'اذكر علامة مميزة أو محتويات دقيقة داخل هذا الغرض')}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                  {language === 'en' ? 'Your Answer:' : 'إجابتك للتأكيد:'}
                </label>
                <textarea
                  rows={3}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder={language === 'en' ? 'Write precise details known only to the owner...' : 'اكتب تفاصيل دقيقة تثبت أن الغرض ملكك...'}
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-[#1C2B27] border border-[#E4E7E4] dark:border-[#2D3E3A] rounded-2xl focus:bg-white dark:focus:bg-[#15201D] focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:outline-none transition-all text-[#18201D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {language === 'en' ? 'Submit Claim Request' : 'إرسال طلب الاسترداد'}
              </button>
            </form>

          </div>
        ) : (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#2DD4BF] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#18201D] dark:text-white">
                {language === 'en' ? 'Claim Submitted Successfully!' : 'تم تقديم طلب الاسترداد بنجاح!'}
              </h2>
              <p className="text-xs text-[#66706B] dark:text-[#94A39D]">
                {language === 'en' ? 'Your request has been recorded. Present this PIN upon collection.' : 'تم تسجيل طلبك، استخدم رمز PIN السري أدناه عند استلام الغرض.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#122823] dark:to-[#173830] border border-emerald-200 dark:border-[#1E463D] space-y-1">
              <span className="text-[11px] font-bold text-[#66706B] dark:text-[#94A39D] block">
                {language === 'en' ? 'Your Secret Handover PIN:' : 'رمز التسليم السري (PIN):'}
              </span>
              <span className="font-mono text-3xl font-black tracking-widest text-[#176B5B] dark:text-[#2DD4BF]">
                {generatedClaimPin || existingClaim?.handoverPin || '1234'}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                router.push('/my-items');
              }}
              className="w-full py-3 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 font-bold text-xs hover:bg-[#125648] dark:hover:bg-[#14B8A6] transition-colors cursor-pointer"
            >
              {language === 'en' ? 'View in My Items' : 'متابعة الطلب في صفحة أغراضي'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
