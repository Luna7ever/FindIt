'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { SCHOOL_LOCATIONS } from '@/lib/constants';
import { formatAppDate, maskStudentId } from '@/lib/utils';
import { getLocalizedItem, getLocalizedUser } from '@/lib/i18n/seedDataTranslations';
import { Claim, Item } from '@/types';
import ItemCard from '@/components/ItemCard';
import HandoverPinModal from '@/components/HandoverPinModal';
import UserAvatar from '@/components/UserAvatar';
import TrustBadge from '@/components/TrustBadge';
import IntegrityCard from '@/components/IntegrityCard';
import { env } from '@/config/env';
import { 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  PlusCircle, 
  HelpCircle, 
  Inbox,
  Clock,
  MapPin,
  Award
} from 'lucide-react';

export default function MyItemsPage() {
  const { 
    currentUser, 
    items, 
    users,
    currentUserTrustTier,
    setCurrentUserById,
    approveClaim, 
    rejectClaim, 
    getClaimsForMyItems,
    openCertificateModal,
    t,
    dir,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState<'claims' | 'lost' | 'found' | 'reunited'>('claims');
  const [selectedHandover, setSelectedHandover] = useState<{ claim: Claim; item: Item } | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const localizedUser = getLocalizedUser(currentUser, language);
  const incomingClaims = getClaimsForMyItems();
  const myLostItems = items.filter((i) => i.reportedBy?.id === currentUser.id && i.type === 'lost' && i.status !== 'reunited');
  const myFoundItems = items.filter((i) => i.reportedBy?.id === currentUser.id && i.type === 'found' && i.status !== 'reunited');
  const myReunitedItems = items.filter((i) => i.reportedBy?.id === currentUser.id && i.status === 'reunited');

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0 px-3.5 sm:px-6 py-5 sm:py-8 max-w-4xl mx-auto space-y-6" dir={dir}>
      
      {/* Student Profile Card */}
      <div className="app-card p-4 sm:p-6 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-start transition-colors duration-300 w-full max-w-full overflow-hidden">
        
        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
          <div className="relative shrink-0">
            <UserAvatar
              size="lg"
              name={currentUser.name}
              role={currentUser.role}
              avatarUrl={currentUser.avatar}
              showBadge={currentUser.role === 'admin'}
            />
            {currentUser.isTrusted && (
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#059669] text-white shadow-2xs" title="موثوق">
                <ShieldCheck className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-[#18201D] dark:text-white truncate">{localizedUser.name}</h1>
              <TrustBadge tier={currentUserTrustTier} size="sm" />
              {env.NEXT_PUBLIC_DEMO_MODE && (
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="ms-auto sm:ms-0 px-2 py-0.5 rounded-lg border border-[#E4E7E4] dark:border-[#2D3E3A] hover:bg-[#F1F3F0] dark:hover:bg-[#1C2B27] text-[10px] font-bold text-[#176B5B] dark:text-emerald-400 transition-colors cursor-pointer shrink-0"
                  title="تبديل حساب العرض"
                >
                  تبديل
                </button>
              )}
            </div>
            <p className="text-xs text-[#66706B] dark:text-[#94A39D] truncate">{localizedUser.grade}</p>
            <p className="text-[11px] text-[#66706B]/80 dark:text-[#94A39D]/80 mt-0.5 font-mono">
              {t('myItems.studentIdLabel')} <span className="font-bold text-[#18201D] dark:text-white">{maskStudentId(currentUser.id === 'user_malak' ? '4826' : '9102')}</span>
            </p>
          </div>
        </div>

        {/* Goodwill points, Certificate & Stats (Balanced 3-Column Grid) */}
        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center">
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] text-center border border-transparent dark:border-[#2D3E3A] flex flex-col items-center justify-center min-w-0">
            <span className="block text-sm sm:text-base font-black text-[#18201D] dark:text-white leading-tight">{currentUser.returnedCount || 0}</span>
            <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] truncate mt-0.5">
              {currentUser.role === 'admin' ? (language === 'en' ? 'Verified' : 'تسليمات') : t('myItems.returnedGoodwill')}
            </span>
          </div>
          {currentUser.role !== 'admin' && (
            <Link
              href="/integrity"
              className="p-2 sm:p-2.5 rounded-xl bg-[#E6F1ED] dark:bg-[#176B5B]/20 hover:bg-[#d5eae2] dark:hover:bg-[#176B5B]/30 transition-colors text-center group border border-transparent dark:border-[#176B5B]/40 flex flex-col items-center justify-center min-w-0"
              title="الانتقال إلى وحدة سفير النزاهة واختبارات الأمانة"
            >
              <span className="block text-sm sm:text-base font-black text-[#176B5B] dark:text-emerald-400 leading-tight">{currentUser.goodwillPoints || 0} ⭐</span>
              <span className="text-[10px] text-[#176B5B] dark:text-emerald-400 font-semibold flex items-center justify-center gap-0.5 truncate mt-0.5">
                <span>{t('app.points')}</span>
                <Award className="w-3 h-3 text-[#176B5B] dark:text-emerald-400 shrink-0" />
              </span>
            </Link>
          )}
          {currentUser.role !== 'admin' && (
            <button
              onClick={() => openCertificateModal(currentUser)}
              className="p-2 sm:p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/80 text-amber-950 dark:text-amber-200 transition-colors border border-amber-300 dark:border-amber-800 flex flex-col items-center justify-center gap-0.5 cursor-pointer min-w-0"
              title="عرض وطباعة شهادة النزاهة الرقمية المعتمدة"
            >
              <span className="text-sm sm:text-base leading-none">📜</span>
              <span className="text-[10px] font-bold truncate">{t('myItems.certificate')}</span>
            </button>
          )}
        </div>

      </div>

      {/* Integrity Ambassador Showcase */}
      {currentUser.role === 'student' && <IntegrityCard />}

      {/* Demo Account Switcher Modal */}
      {showRoleModal && env.NEXT_PUBLIC_DEMO_MODE && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-card max-w-sm w-full bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] p-5 space-y-4 text-start shadow-2xl animate-in zoom-in-95">
            <div className="border-b border-[#E4E7E4] dark:border-[#263834] pb-2">
              <h3 className="font-bold text-sm text-[#18201D] dark:text-white">تبديل حساب العرض التقديمي (Demo)</h3>
              <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">اختر الحساب لعرض تجربة الطالب أو إدارة المدرسة</p>
            </div>
            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUserById(u.id);
                    setShowRoleModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-start cursor-pointer ${
                    currentUser.id === u.id
                      ? 'border-[#176B5B] bg-[#E6F1ED] dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-emerald-300'
                      : 'border-[#E4E7E4] dark:border-[#2D3E3A] hover:bg-[#F1F3F0] dark:hover:bg-[#1C2B27] text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar size="md" name={u.name} role={u.role} avatarUrl={u.avatar} showBadge={u.role === 'admin'} />
                    <div>
                      <h4 className="font-bold text-xs">{u.name}</h4>
                      <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">{u.role === 'admin' ? 'إدارة المدرسة والأمانات' : 'طالبة (الصف الحادي عشر)'}</p>
                    </div>
                  </div>
                  {currentUser.id === u.id && <CheckCircle2 className="w-5 h-5 text-[#176B5B] dark:text-emerald-400" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRoleModal(false)}
              className="w-full py-2 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-xs font-bold text-[#66706B] dark:text-slate-300 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Segmented Tab Chips */}
      <div className="flex items-center p-1 bg-[#F1F3F0] dark:bg-[#141C1A] rounded-xl overflow-x-auto scrollbar-none border border-transparent dark:border-[#23332F] w-full max-w-full">
        
        <button
          onClick={() => setActiveTab('claims')}
          className={`shrink-0 sm:flex-1 min-h-[40px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs'
              : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 shrink-0" />
          <span>{t('myItems.tabClaims')} ({incomingClaims.length})</span>
          {incomingClaims.filter((c) => c.claim.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('lost')}
          className={`shrink-0 sm:flex-1 min-h-[40px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center whitespace-nowrap cursor-pointer ${
            activeTab === 'lost'
              ? 'bg-white dark:bg-[#1C2B27] text-[#D97706] dark:text-amber-400 shadow-2xs'
              : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
          }`}
        >
          {t('myItems.tabLost')} ({myLostItems.length})
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`shrink-0 sm:flex-1 min-h-[40px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center whitespace-nowrap cursor-pointer ${
            activeTab === 'found'
              ? 'bg-white dark:bg-[#1C2B27] text-[#059669] dark:text-emerald-400 shadow-2xs'
              : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
          }`}
        >
          {t('myItems.tabFound')} ({myFoundItems.length})
        </button>

        <button
          onClick={() => setActiveTab('reunited')}
          className={`shrink-0 sm:flex-1 min-h-[40px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center whitespace-nowrap cursor-pointer ${
            activeTab === 'reunited'
              ? 'bg-white dark:bg-[#1C2B27] text-[#4F46E5] dark:text-indigo-400 shadow-2xs'
              : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
          }`}
        >
          {t('myItems.tabReunited')} ({myReunitedItems.length})
        </button>

      </div>

      {/* TAB 1: Incoming Claims Review */}
      {activeTab === 'claims' && (
        <div className="space-y-3.5 animate-in fade-in">
          {incomingClaims.length > 0 ? (
            <div className="space-y-3">
              {incomingClaims.map(({ claim, item: rawItem }) => {
                const item = getLocalizedItem(rawItem, language);
                const isPending = claim.status === 'pending';
                const isApproved = claim.status === 'approved';
                const isCompleted = claim.status === 'completed';

                return (
                  <div
                    key={claim.id}
                    className="app-card p-5 space-y-3 text-start bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834]"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E4E7E4] dark:border-[#23332F] pb-3">
                      <div>
                        <span className="text-[10px] text-[#66706B] dark:text-[#94A39D]">{language === 'en' ? 'Claim request for:' : 'طلب استرداد لـ:'}</span>
                        <h3 className="font-bold text-sm text-[#18201D] dark:text-white">{item.title}</h3>
                        <p className="text-xs text-[#66706B] dark:text-[#94A39D]">
                          {t('myItems.applicant')} <strong className="text-[#18201D] dark:text-white">{claim.claimant.name}</strong> ({claim.claimant.grade})
                        </p>
                      </div>

                      <div>
                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D1FAE5] dark:bg-emerald-950/60 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {language === 'en' ? 'Reunited & Handed Over 🎉' : 'تم الاسترداد والتسليم 🎉'}
                          </span>
                        ) : isApproved ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F1ED] dark:bg-[#176B5B]/30 text-[#176B5B] dark:text-emerald-300 border border-[#176B5B]/30 flex items-center gap-1">
                            <KeyRound className="w-3 h-3" />
                            {t('status.approved')}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] dark:bg-amber-950/60 text-[#92400E] dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                            {language === 'en' ? 'Awaiting your review' : 'طلب بانتظار مراجعتك'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question & Answer Box */}
                    <div className="p-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] space-y-1 text-xs border border-transparent dark:border-[#2D3E3A]">
                      <div className="flex items-center gap-1 text-[#176B5B] dark:text-emerald-400 font-bold">
                        <HelpCircle className="w-3.5 h-3.5 text-[#D97706] dark:text-amber-400" />
                        <span>{t('myItems.secretQuestion')} «{item.secretQuestion}»</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834]">
                        <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] block">{t('myItems.studentAnswer')}</span>
                        <p className="font-bold text-[#18201D] dark:text-white">«{claim.answerText}»</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveClaim(claim.id)}
                            className="py-2.5 px-4 min-h-[42px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('myItems.approveProof')}</span>
                          </button>
                          <button
                            onClick={() => rejectClaim(claim.id)}
                            className="py-2.5 px-3 min-h-[42px] rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#E11D48] dark:text-rose-400 font-bold text-xs border border-transparent dark:border-[#2D3E3A] cursor-pointer"
                          >
                            رفض
                          </button>
                        </div>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => setSelectedHandover({ claim, item })}
                          className="py-2.5 px-4 min-h-[42px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>{t('myItems.enterPinToDeliver')}</span>
                        </button>
                      )}

                      <Link
                        href={`/items/${item.id}`}
                        className="text-xs text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white"
                      >
                        {t('myItems.previewItem')}
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="app-card p-12 text-center space-y-2 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] max-w-md mx-auto">
              <KeyRound className="w-8 h-8 text-[#66706B] dark:text-[#94A39D] mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D] dark:text-white">{t('myItems.noClaimsYet')}</h3>
              <p className="text-xs text-[#66706B] dark:text-[#94A39D]">
                {t('myItems.noClaimsDesc')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Lost Items */}
      {activeTab === 'lost' && (
        <div className="space-y-4 animate-in fade-in">
          {myLostItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myLostItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="app-card p-12 text-center space-y-3 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] max-w-md mx-auto">
              <Inbox className="w-8 h-8 text-[#66706B] dark:text-[#94A39D] mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D] dark:text-white">{t('myItems.noLostYet')}</h3>
              <p className="text-xs text-[#66706B] dark:text-[#94A39D]">{t('myItems.noLostDesc')}</p>
              <Link
                href="/report?type=lost"
                className="inline-flex items-center justify-center py-2.5 px-4 min-h-[42px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 text-xs font-bold shadow-xs cursor-pointer"
              >
                {t('myItems.reportNewLost')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: My Found Items */}
      {activeTab === 'found' && (
        <div className="space-y-4 animate-in fade-in">
          {myFoundItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myFoundItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="app-card p-12 text-center space-y-3 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] max-w-md mx-auto">
              <Inbox className="w-8 h-8 text-[#66706B] dark:text-[#94A39D] mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D] dark:text-white">{t('myItems.noFoundYet')}</h3>
              <Link
                href="/report?type=found"
                className="inline-flex items-center justify-center py-2.5 px-4 min-h-[42px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 text-xs font-bold shadow-xs cursor-pointer"
              >
                {t('myItems.reportNewFound')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Reunited Items */}
      {activeTab === 'reunited' && (
        <div className="space-y-4 animate-in fade-in">
          {myReunitedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myReunitedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="app-card p-12 text-center space-y-2 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] max-w-md mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#059669] dark:text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D] dark:text-white">{t('myItems.noReunitedYet')}</h3>
            </div>
          )}
        </div>
      )}

      {/* Handover PIN Modal */}
      {selectedHandover && (
        <HandoverPinModal
          claim={selectedHandover.claim}
          item={selectedHandover.item}
          isOpen={true}
          onClose={() => setSelectedHandover(null)}
        />
      )}

    </div>
  );
}
