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
  const { getItemById, submitClaim, getClaimForCurrentUserAndItem } = useApp();

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
      alert('يرجى كتابة الإجابة على السؤال السري');
      return;
    }

    const claim = submitClaim(itemId, answerText.trim());
    setGeneratedClaimPin(claim.handoverPin);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white border border-[#E4E7E4] rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess && !existingClaim ? (
          <div className="space-y-4 text-right">
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1ED] text-[#176B5B] text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>إثبات الملكية</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D]">
                المطالبة بالغرض المعثور عليه
              </h2>
              <p className="text-xs text-[#66706B]">
                أجب على السؤال السري الذي وضعه الملتقط للتأكد من هويتك.
              </p>
            </div>

            {/* Item Mini Card */}
            <div className="p-3 rounded-2xl bg-[#F1F3F0] flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <ItemVisual
                  category={item.category}
                  title={item.title}
                  imageUrl={item.imageUrl}
                  className="w-full h-full"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-[#18201D] text-xs sm:text-sm truncate">{item.title}</h4>
                <p className="text-[11px] text-[#66706B] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#176B5B]" />
                  {locationInfo?.name}
                </p>
              </div>
            </div>

            {/* Secret Question */}
            <div className="p-3.5 rounded-2xl bg-[#FEF3C7]/60 border border-[#FDE68A] space-y-1 text-xs">
              <div className="flex items-center gap-1 text-[#92400E] font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-[#D97706]" />
                <span>السؤال السري:</span>
              </div>
              <p className="font-bold text-[#18201D] bg-white p-2.5 rounded-xl border border-[#FDE68A]/60 leading-relaxed">
                «{item.secretQuestion || 'ما هي العلامة المميزة للغرض؟'}»
              </p>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#18201D]">
                  إجابتك للعلامة المخفية <span className="text-[#E11D48]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="اكتب إجابتك هنا..."
                  className="w-full p-3 rounded-xl bg-[#F1F3F0] border border-[#E4E7E4] text-[#18201D] text-xs placeholder-[#66706B]/70 focus:bg-white focus:border-[#176B5B] focus:outline-none resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>إرسال إثبات الملكية</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#18201D]">تم إرسال طلبك بنجاح!</h3>
              <p className="text-xs text-[#66706B] max-w-xs mx-auto">
                وصلت إجابتك للملتقط، وبمجرد موافقته ستلتقيان في المدرسة لإتمام الاستلام.
              </p>
            </div>

            {/* PIN Card */}
            <div className="p-4 rounded-2xl bg-[#F1F3F0] border border-[#E4E7E4] space-y-1">
              <span className="text-[11px] text-[#66706B] block font-semibold">
                رمز التسليم الرقمي الخاص بك (PIN):
              </span>
              <div className="text-3xl font-black tracking-widest text-[#176B5B] py-1 font-mono">
                {generatedClaimPin || existingClaim?.handoverPin || '4829'}
              </div>
              <p className="text-[10px] text-[#66706B]">
                اذكر هذا الرمز للملتقط عند اللقاء الفعلي.
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                router.push('/my-items');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#18201D] text-white font-bold text-xs"
            >
              متابعة في قائمة أغراضي
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
