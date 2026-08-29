'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { SCHOOL_LOCATIONS, CATEGORIES } from '@/lib/constants';
import { formatArabicDate } from '@/lib/utils';
import ItemVisual from '@/components/ItemVisual';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Building2, 
  Trash2, 
  Printer, 
  QrCode, 
  MapPin, 
  Check, 
  Eye, 
  Inbox,
  Lock,
  ArrowLeft,
  Users2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { 
    currentUser, 
    switchUserRole,
    items, 
    claims,
    approveClaim,
    rejectClaim,
    updateItemStatus, 
    updateItemCustody, 
    deleteItem, 
    adminDirectReunite 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'inventory' | 'qr_generator'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lost' | 'found' | 'at_office' | 'reunited'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // ========================================================
  // 🛡️ ROLE-BASED ACCESS CONTROL (RBAC) GUARD
  // ========================================================
  const isAuthorized = canAccessAdmin(currentUser);

  if (!isAuthorized) {
    return (
      <div className="px-4 py-16 text-center max-w-md mx-auto space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#E11D48] flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-1.5 text-right sm:text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] text-[#E11D48] text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>منطقة محمية · صلاحيات الإدارة فقط</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#18201D]">
            غير مصرح لك بالدخول إلى لوحة الإدارة
          </h1>
          <p className="text-xs text-[#66706B] leading-relaxed">
            أنت مسجل حالياً بحساب الطالبة <strong>«{currentUser.name}»</strong>. لوحة الإشراف مخصصة حصرياً لإدارة المدرسة المعتمدة.
          </p>
        </div>

        {/* Action to switch to Moshira or return Home */}
        <div className="p-4 rounded-2xl bg-white border border-[#E4E7E4] space-y-3 text-right">
          <span className="text-[11px] font-bold text-[#66706B] block">
            لأغراض العرض التقديمي (Demo):
          </span>
          <button
            onClick={() => switchUserRole('admin')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>التبديل إلى حساب (م. مشيرة - إدارة المدرسة)</span>
          </button>
          
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] text-xs font-bold transition-colors block text-center"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // ========================================================
  // AUTHORIZED ADMIN VIEW (م. مشيرة)
  // ========================================================
  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // KPIs
  const totalItems = items.length;
  const lostCount = items.filter((i) => i.type === 'lost' && i.status !== 'reunited').length;
  const foundCount = items.filter((i) => i.type === 'found' && i.status !== 'reunited').length;
  const atOfficeCount = items.filter((i) => i.custody === 'at_office' && i.status !== 'reunited').length;
  const reunitedCount = items.filter((i) => i.status === 'reunited').length + 42;
  const pendingClaims = claims.filter((c) => c.status === 'pending');

  // Filtered Inventory List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'lost' && (item.type !== 'lost' || item.status === 'reunited')) return false;
      if (statusFilter === 'found' && (item.type !== 'found' || item.status === 'reunited')) return false;
      if (statusFilter === 'at_office' && (item.custody !== 'at_office' || item.status === 'reunited')) return false;
      if (statusFilter === 'reunited' && item.status !== 'reunited') return false;

      if (locationFilter !== 'all' && item.locationId !== locationFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesReporter = item.reportedBy?.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesColor = item.color?.toLowerCase().includes(q);
        const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
        const matchesLoc = loc?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesReporter && !matchesDesc && !matchesColor && !matchesLoc) {
          return false;
        }
      }

      return true;
    });
  }, [items, statusFilter, locationFilter, searchQuery]);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="app-card p-5 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-right">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18201D] text-white text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>إدارة FindIt المدرسية المعتمدة</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#18201D]">
            أهلاً م. مشيرة 👋
          </h1>
          <p className="text-xs text-[#66706B]">
            هذه أهم العمليات والبلاغات التي تحتاج مراجعتك اليوم في مرافق المدرسة.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="py-2 px-4 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>طباعة تقرير الإدارة</span>
        </button>
      </div>

      {/* Action Toast Alert */}
      {actionSuccessMessage && (
        <div className="p-3 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Operations Quick KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('claims')}
          className="app-card app-card-interactive p-4 text-right space-y-1 bg-white"
        >
          <span className="text-[11px] text-[#66706B] block font-semibold">طلبات إثبات معلقة</span>
          <div className="text-2xl font-black text-[#E11D48]">{pendingClaims.length}</div>
          <span className="text-[10px] text-[#E11D48] font-bold">تحتاج مراجعة فورية &larr;</span>
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setStatusFilter('lost'); }}
          className="app-card app-card-interactive p-4 text-right space-y-1 bg-white"
        >
          <span className="text-[11px] text-[#66706B] block font-semibold">مفقودات قيد البحث</span>
          <div className="text-2xl font-black text-[#D97706]">{lostCount}</div>
          <span className="text-[10px] text-[#66706B]">بانتظار العثور</span>
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setStatusFilter('at_office'); }}
          className="app-card app-card-interactive p-4 text-right space-y-1 bg-white"
        >
          <span className="text-[11px] text-[#66706B] block font-semibold">أمانات بمكتب الإدارة</span>
          <div className="text-2xl font-black text-[#176B5B]">{atOfficeCount}</div>
          <span className="text-[10px] text-[#176B5B] font-bold">بحيازتك حالياً</span>
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setStatusFilter('reunited'); }}
          className="app-card app-card-interactive p-4 text-right space-y-1 bg-white"
        >
          <span className="text-[11px] text-[#66706B] block font-semibold">أغراض مستردة</span>
          <div className="text-2xl font-black text-[#059669]">{reunitedCount}</div>
          <span className="text-[10px] text-[#059669] font-bold">نجاح التسليم</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center p-1 bg-[#F1F3F0] rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white text-[#18201D] shadow-2xs'
              : 'text-[#66706B]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>نظرة عامة</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'claims'
              ? 'bg-white text-[#18201D] shadow-2xs'
              : 'text-[#66706B]'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>طلبات الملكية ({pendingClaims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-white text-[#18201D] shadow-2xs'
              : 'text-[#66706B]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>سجل المفقودات ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('qr_generator')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'qr_generator'
              ? 'bg-white text-[#18201D] shadow-2xs'
              : 'text-[#66706B]'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>ملصقات QR للمرافق</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: Overview & Pending Claims Queue
      ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Quick Operations Highlight */}
          <div className="app-card p-5 sm:p-6 bg-white space-y-4 text-right">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#18201D]">
                طلبات استرداد تتطلب اعتماد الإدارة
              </h2>
              <button
                onClick={() => setActiveTab('claims')}
                className="text-xs text-[#176B5B] font-bold hover:underline"
              >
                عرض كافة الطلبات &larr;
              </button>
            </div>

            {pendingClaims.length > 0 ? (
              <div className="space-y-3">
                {pendingClaims.slice(0, 3).map((claim) => {
                  const item = items.find((i) => i.id === claim.itemId);
                  return (
                    <div
                      key={claim.id}
                      className="p-4 rounded-xl bg-[#F1F3F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FEF3C7] text-[#92400E]">
                            طلب بانتظار الاعتماد
                          </span>
                          <span className="text-[10px] text-[#66706B]">{formatArabicDate(claim.createdAt)}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#18201D]">{item?.title}</h4>
                        <p className="text-xs text-[#66706B]">
                          مقدم الطلب: <strong className="text-[#18201D]">{claim.claimant.name}</strong> ({claim.claimant.grade})
                        </p>
                        <p className="text-xs text-[#176B5B] font-medium mt-1">
                          الإجابة: «{claim.answerText}»
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            approveClaim(claim.id);
                            showFeedback(`تم اعتماد طلب (${claim.claimant.name}) وتوليد رمز PIN بنجاح!`);
                          }}
                          className="py-1.5 px-3.5 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold shadow-xs"
                        >
                          اعتماد وتوليد PIN
                        </button>
                        <button
                          onClick={() => {
                            rejectClaim(claim.id);
                            showFeedback(`تم رفض الطلب`);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-white hover:bg-[#FEE2E2] text-[#E11D48] text-xs font-bold border border-[#E4E7E4]"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#F1F3F0] rounded-xl space-y-1">
                <CheckCircle2 className="w-7 h-7 text-[#059669] mx-auto" />
                <h4 className="text-xs font-bold text-[#18201D]">كافة الطلبات معتمدة ومحدثة</h4>
                <p className="text-[11px] text-[#66706B]">لا توجد طلبات إثبات ملكية معلقة حالياً.</p>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
            <div
              onClick={() => setActiveTab('inventory')}
              className="app-card app-card-interactive p-5 bg-white space-y-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E6F1ED] text-[#176B5B] flex items-center justify-center">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#18201D]">سجل مفقودات المدرسة الكامل</h3>
              <p className="text-xs text-[#66706B]">
                تصفح وإدارة وتعديل حالات كافة الأغراض المسجلة في مرافق المدرسة.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('qr_generator')}
              className="app-card app-card-interactive p-5 bg-white space-y-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E6F1ED] text-[#176B5B] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#18201D]">ملصقات QR جاهزة للطباعة</h3>
              <p className="text-xs text-[#66706B]">
                طباعة باركودات المعامل والمكتبة والصالات لتعليقها داخل المدرسة.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: All Claims Management
      ======================================================== */}
      {activeTab === 'claims' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between text-right">
            <h2 className="text-sm sm:text-base font-bold text-[#18201D]">
              سجل طلبات إثبات الملكية الواردة
            </h2>
            <span className="text-xs text-[#66706B]">
              إجمالي الطلبات: {claims.length}
            </span>
          </div>

          {claims.length > 0 ? (
            <div className="space-y-3">
              {claims.map((claim) => {
                const item = items.find((i) => i.id === claim.itemId);
                const isPending = claim.status === 'pending';
                const isApproved = claim.status === 'approved';
                const isCompleted = claim.status === 'completed';

                return (
                  <div
                    key={claim.id}
                    className="app-card p-5 space-y-3 text-right bg-white"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E4E7E4] pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-[#18201D]">{item?.title}</h4>
                        <p className="text-xs text-[#66706B]">
                          الطالب: <strong className="text-[#18201D]">{claim.claimant.name}</strong> ({claim.claimant.grade})
                        </p>
                      </div>

                      <div>
                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            تم التسليم بنجاح
                          </span>
                        ) : isApproved ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F1ED] text-[#176B5B]">
                            معتمد · رمز PIN: {claim.handoverPin}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                            بانتظار المراجعة
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F1F3F0] text-xs space-y-1">
                      <span className="text-[#66706B] block">السؤال السري: «{item?.secretQuestion || 'العلامة المميزة'}»</span>
                      <p className="font-bold text-[#18201D]">إجابة الطالب: «{claim.answerText}»</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {isPending && (
                        <>
                          <button
                            onClick={() => {
                              approveClaim(claim.id);
                              showFeedback(`تم اعتماد الطلب وتوليد الرمز`);
                            }}
                            className="py-1.5 px-3.5 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold shadow-xs"
                          >
                            اعتماد
                          </button>
                          <button
                            onClick={() => {
                              rejectClaim(claim.id);
                              showFeedback(`تم رفض الطلب`);
                            }}
                            className="py-1.5 px-3 rounded-xl bg-[#F1F3F0] text-[#E11D48] text-xs font-bold"
                          >
                            رفض
                          </button>
                        </>
                      )}

                      {!isCompleted && isApproved && (
                        <button
                          onClick={() => {
                            adminDirectReunite(claim.itemId);
                            showFeedback(`تم تأكيد تسليم الغرض رسمياً وإغلاق البلاغ 🎉`);
                          }}
                          className="py-1.5 px-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs"
                        >
                          تأكيد التسليم المباشر (Reunite)
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="app-card p-10 text-center space-y-2 bg-white">
              <FileCheck className="w-8 h-8 text-[#66706B] mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D]">لا توجد طلبات إثبات ملكية مسجلة بعد</h3>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: Inventory Table
      ======================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-[#66706B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الطالب أو المكان..."
                className="w-full py-2 pr-9 pl-4 rounded-xl bg-white border border-[#E4E7E4] text-xs text-[#18201D] focus:outline-none focus:border-[#176B5B]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#F1F3F0] rounded-xl overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  statusFilter === 'all' ? 'bg-white text-[#18201D] shadow-2xs' : 'text-[#66706B]'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setStatusFilter('lost')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  statusFilter === 'lost' ? 'bg-white text-[#D97706] shadow-2xs' : 'text-[#66706B]'
                }`}
              >
                مفقودات
              </button>
              <button
                onClick={() => setStatusFilter('at_office')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  statusFilter === 'at_office' ? 'bg-white text-[#176B5B] shadow-2xs' : 'text-[#66706B]'
                }`}
              >
                بالأمانات
              </button>
              <button
                onClick={() => setStatusFilter('reunited')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  statusFilter === 'reunited' ? 'bg-white text-[#059669] shadow-2xs' : 'text-[#66706B]'
                }`}
              >
                مستردة
              </button>
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-white border border-[#E4E7E4] text-xs text-[#18201D] focus:outline-none focus:border-[#176B5B] w-full sm:w-auto"
            >
              <option value="all">📍 كافة المواقع</option>
              {SCHOOL_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
                const isReunited = item.status === 'reunited';

                return (
                  <div
                    key={item.id}
                    className="app-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-right bg-white"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        <ItemVisual
                          category={item.category}
                          title={item.title}
                          imageUrl={item.imageUrl}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isReunited
                              ? 'bg-[#E0E7FF] text-[#3730A3]'
                              : item.type === 'lost'
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-[#D1FAE5] text-[#065F46]'
                          }`}>
                            {isReunited ? 'تم الاسترداد' : item.type === 'lost' ? 'مفقود' : 'معثور عليه'}
                          </span>

                          {!isReunited && item.custody === 'at_office' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18201D] text-white">
                              🏛️ في مكتب الإدارة
                            </span>
                          )}

                          <span className="text-[10px] text-[#66706B]">
                            {formatArabicDate(item.date || item.createdAt)}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-[#18201D] truncate">{item.title}</h3>
                        
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#66706B]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#176B5B]" />
                            {loc?.name}
                          </span>
                          <span>•</span>
                          <span>اللون: {item.color}</span>
                          <span>•</span>
                          <span>الطالب: <strong>{item.reportedBy?.name}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#E4E7E4]">
                      {!isReunited && (
                        <button
                          onClick={() => {
                            adminDirectReunite(item.id);
                            showFeedback(`تم توثيق تسليم (${item.title}) لصاحبه بنجاح 🎉`);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>تسليم لصاحبه</span>
                        </button>
                      )}

                      {!isReunited && item.custody !== 'at_office' && item.type === 'found' && (
                        <button
                          onClick={() => {
                            updateItemCustody(item.id, 'at_office');
                            showFeedback(`تم نقل الغرض إلى حيازة مكتب الأمانات 🏛️`);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#176B5B] text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>استلام للأمانات</span>
                        </button>
                      )}

                      <Link
                        href={`/items/${item.id}`}
                        className="py-1.5 px-3 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </Link>

                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف بلاغ (${item.title})؟`)) {
                            deleteItem(item.id);
                            showFeedback(`تم حذف البلاغ بنجاح`);
                          }
                        }}
                        className="p-1.5 rounded-xl hover:bg-[#FEF2F2] text-[#E11D48]"
                        title="حذف البلاغ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="app-card p-10 text-center space-y-2 bg-white">
              <Inbox className="w-8 h-8 text-[#66706B] mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D]">لا توجد أغراض مطابقة</h3>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          TAB 4: Printable QR Posters
      ======================================================== */}
      {activeTab === 'qr_generator' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E7E4] pb-4 text-right">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#18201D]">ملصقات الباركود الذكية لمرافق المدرسة</h2>
              <p className="text-xs text-[#66706B]">
                ملصقات جاهزة للطباعة والتعليق في المعامل والمكتبة والملاعب لتسهيل الإبلاغ السريع
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="py-2 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كافة الملصقات (Print All)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCHOOL_LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                className="bg-white border-2 border-dashed border-[#CBD3CE] rounded-2xl p-5 flex flex-col items-center text-center space-y-3"
              >
                <div className="w-full flex items-center justify-between border-b border-[#E4E7E4] pb-2">
                  <span className="font-extrabold text-xs text-[#18201D]">FindIt SCHOOL</span>
                  <span className="text-[10px] text-[#176B5B] font-bold">نقطة أمانات ذكية</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#18201D]">{loc.name}</h3>
                  <p className="text-[10px] text-[#66706B]">{loc.building} • {loc.floor}</p>
                </div>

                <div className="p-2.5 bg-white rounded-xl shadow-2xs border border-[#E4E7E4]">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 text-[#18201D]" fill="currentColor">
                    <rect width="30" height="30" x="10" y="10" rx="4" fill="#18201D" />
                    <rect width="18" height="18" x="16" y="16" rx="2" fill="white" />
                    <rect width="10" height="10" x="20" y="20" rx="1" fill="#176B5B" />

                    <rect width="30" height="30" x="60" y="10" rx="4" fill="#18201D" />
                    <rect width="18" height="18" x="66" y="16" rx="2" fill="white" />
                    <rect width="10" height="10" x="70" y="20" rx="1" fill="#176B5B" />

                    <rect width="30" height="30" x="10" y="60" rx="4" fill="#18201D" />
                    <rect width="18" height="18" x="16" y="66" rx="2" fill="white" />
                    <rect width="10" height="10" x="20" y="70" rx="1" fill="#176B5B" />

                    <rect width="6" height="6" x="48" y="14" rx="1" fill="#18201D" />
                    <rect width="6" height="6" x="48" y="26" rx="1" fill="#18201D" />
                    <rect width="6" height="6" x="14" y="48" rx="1" fill="#18201D" />
                    <rect width="6" height="6" x="26" y="48" rx="1" fill="#18201D" />
                    <rect width="10" height="10" x="45" y="45" rx="2" fill="#059669" />
                    <rect width="6" height="6" x="62" y="48" rx="1" fill="#18201D" />
                    <rect width="6" height="6" x="78" y="48" rx="1" fill="#18201D" />
                    <rect width="6" height="6" x="48" y="66" rx="1" fill="#18201D" />
                    <rect width="6" height="6" x="64" y="66" rx="1" fill="#18201D" />
                    <rect width="6" height="6" x="78" y="78" rx="1" fill="#18201D" />
                  </svg>
                </div>

                <p className="text-[10px] text-[#66706B] font-medium leading-relaxed">
                  «عثرت على شيء هنا؟ امسح الباركود للإبلاغ فوراً»
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
