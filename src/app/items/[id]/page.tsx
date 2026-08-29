'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SCHOOL_LOCATIONS, CATEGORIES } from '@/lib/constants';
import { formatArabicDate, getPublicReporterLabel } from '@/lib/utils';
import ClaimModal from '@/components/ClaimModal';
import ItemVisual from '@/components/ItemVisual';
import UserAvatar from '@/components/UserAvatar';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Share2
} from 'lucide-react';

export default function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getItemById, currentUser } = useApp();
  const [showClaimModal, setShowClaimModal] = useState(false);

  const item = getItemById(resolvedParams.id);

  if (!item) {
    return (
      <div className="px-4 py-16 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-[#E11D48] mx-auto" />
        <h2 className="text-xl font-bold text-[#18201D]">الغرض غير موجود</h2>
        <p className="text-xs text-[#66706B]">قد يكون تم حذفه أو تغييره.</p>
        <Link
          href="/"
          className="inline-block py-2.5 px-5 rounded-xl bg-[#18201D] text-white text-xs font-bold"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const categoryInfo = CATEGORIES.find((c) => c.id === item.category);
  const locationInfo = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);

  const isLost = item.type === 'lost';
  const isReunited = item.status === 'reunited';
  const isMyReport = item.reportedBy?.id === currentUser.id;

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto space-y-6">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between text-right">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-[#66706B] hover:text-[#18201D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>العودة لقائمة المفقودات</span>
        </Link>

        <Link
          href={`/match/${item.id}`}
          className="py-1.5 px-3.5 rounded-xl bg-[#E6F1ED] hover:bg-[#D5EAE2] text-[#176B5B] text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>المطابقة الذكية</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Item Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="app-card overflow-hidden bg-white">
            
            {/* Visual Header */}
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <ItemVisual
                category={item.category}
                title={item.title}
                imageUrl={item.imageUrl}
                className="w-full h-full"
              />

              {/* Badges */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                {isReunited ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E0E7FF] text-[#3730A3] border border-[#C7D2FE] flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تم الاسترداد بنجاح
                  </span>
                ) : isLost ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1 shadow-xs">
                    غرض مفقود (قيد البحث)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] flex items-center gap-1 shadow-xs">
                    معثور عليه (أمانة محفوظة)
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-5 text-right">
              
              <div className="flex items-center justify-between text-xs text-[#66706B]">
                <span className="px-3 py-1 rounded-lg bg-[#F1F3F0] text-[#18201D] font-bold">
                  {categoryInfo?.label}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatArabicDate(item.date || item.createdAt)}
                </span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-3xl font-extrabold text-[#18201D]">{item.title}</h1>
                <p className="text-xs sm:text-sm text-[#66706B] leading-relaxed">{item.description}</p>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#F1F3F0]">
                  <span className="text-[10px] text-[#66706B] block">اللون</span>
                  <span className="text-xs font-bold text-[#18201D]">{item.color}</span>
                </div>
                {item.brand && (
                  <div className="p-3 rounded-xl bg-[#F1F3F0]">
                    <span className="text-[10px] text-[#66706B] block">الماركة</span>
                    <span className="text-xs font-bold text-[#18201D]">{item.brand}</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-[#F1F3F0]">
                  <span className="text-[10px] text-[#66706B] block">الحيازة</span>
                  <span className="text-xs font-bold text-[#18201D]">
                    {item.custody === 'at_office' ? 'مكتب الإدارة' : 'مع الملتقط'}
                  </span>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-4 rounded-2xl bg-[#F1F3F0] space-y-1 text-xs text-[#18201D]">
                <div className="flex items-center gap-1.5 font-bold text-[#176B5B]">
                  <MapPin className="w-4 h-4" />
                  <span>الموقع المدرسي المحدد:</span>
                </div>
                <p className="font-bold text-[#18201D]">{locationInfo?.name}</p>
                <p className="text-[#66706B]">{locationInfo?.building} • {locationInfo?.floor}</p>
                {item.locationDetails && (
                  <p className="text-[#18201D] pt-1 font-medium">
                    ملاحظة المكان: «{item.locationDetails}»
                  </p>
                )}
              </div>

              {/* Secret Question Indicator */}
              {!isLost && item.secretQuestion && !isReunited && (
                <div className="p-4 rounded-2xl bg-[#FEF3C7]/70 border border-[#FDE68A] space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#92400E]">
                    <Lock className="w-4 h-4 text-[#D97706]" />
                    <span>مطلوب إثبات ملكية (سؤال سري):</span>
                  </div>
                  <p className="text-[#18201D] font-medium leading-relaxed">
                    «{item.secretQuestion}»
                  </p>
                  <p className="text-[10px] text-[#66706B]">
                    🔒 أجب على هذا السؤال لإثبات أن هذا الغرض ملكك وتوليد رمز التسليم.
                  </p>
                </div>
              )}

              {/* Primary Claim Action */}
              {!isLost && !isReunited && !isMyReport && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#176B5B] hover:bg-[#125648] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>هذا غراضي! (إثبات الملكية وطلب الاسترداد)</span>
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Col: Reporter & Safety */}
        <div className="space-y-6">
          
          {/* Reporter Card */}
          <div className="app-card p-5 space-y-3.5 text-right bg-white">
            <span className="text-[10px] font-bold text-[#66706B] uppercase tracking-wider block">
              صاحب البلاغ
            </span>

            <div className="flex items-center gap-3">
              <UserAvatar
                size="lg"
                name={isMyReport || currentUser.role === 'admin' ? item.reportedBy?.name : (item.reportedBy?.role === 'admin' ? 'إدارة المدرسة' : 'طالب')}
                role={item.reportedBy?.role}
                avatarUrl={item.reportedBy?.avatar}
                showBadge={item.reportedBy?.role === 'admin'}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-xs sm:text-sm text-[#18201D] truncate">
                    {isMyReport || currentUser.role === 'admin'
                      ? item.reportedBy?.name
                      : getPublicReporterLabel(item.reportedBy?.role, isLost, item.custody)}
                  </h4>
                  {item.reportedBy?.isTrusted && (
                    <span title="موثوق">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#66706B] truncate">
                  {isMyReport || currentUser.role === 'admin' 
                    ? item.reportedBy?.grade 
                    : (item.reportedBy?.role === 'admin' ? 'إدارة المدرسة والأمانات' : 'عضو في المدرسة')}
                </p>
                <span className="text-[10px] text-[#059669] font-bold block mt-0.5">
                  ⭐ {item.reportedBy?.returnedCount || 0} أغراض مستردة
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E7E4] text-[11px] text-[#66706B] leading-relaxed">
              🔒 <strong>الأمان والخصوصية:</strong> لا يتم مشاركة أرقام الهواتف؛ تتم كافة عمليات التواصل والتسليم عبر منصة FindIt ورموز PIN الرقمية.
            </div>
          </div>

          {/* Handover Guidelines */}
          <div className="app-card p-5 space-y-2.5 text-right bg-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#176B5B]">
              <ShieldCheck className="w-4 h-4" />
              <span>إرشادات التسليم الآمن</span>
            </div>
            <ul className="text-xs text-[#66706B] space-y-1.5 list-disc list-inside leading-relaxed">
              <li>الالتقاء في أماكن عامة داخل المدرسة (المكتبة، الكافتيريا).</li>
              <li>طلب رمز الـ PIN المكون من 4 أرقام قبل تسليم الغرض.</li>
              <li>إمكانية تسليم الغرض لمكتب الأمانات بالإدارة.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          itemId={item.id}
          isOpen={true}
          onClose={() => setShowClaimModal(false)}
        />
      )}

    </div>
  );
}
