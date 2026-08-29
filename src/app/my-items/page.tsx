'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { SCHOOL_LOCATIONS } from '@/lib/constants';
import { formatArabicDate } from '@/lib/utils';
import { Claim, Item } from '@/types';
import ItemCard from '@/components/ItemCard';
import HandoverPinModal from '@/components/HandoverPinModal';
import { 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  PlusCircle, 
  HelpCircle, 
  Inbox,
  Clock,
  MapPin
} from 'lucide-react';

export default function MyItemsPage() {
  const { 
    currentUser, 
    items, 
    approveClaim, 
    rejectClaim, 
    getClaimsForMyItems 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'claims' | 'lost' | 'found' | 'reunited'>('claims');
  const [selectedHandover, setSelectedHandover] = useState<{ claim: Claim; item: Item } | null>(null);

  const incomingClaims = getClaimsForMyItems();
  const myLostItems = items.filter((i) => i.reportedBy?.id === currentUser.id && i.type === 'lost' && i.status !== 'reunited');
  const myFoundItems = items.filter((i) => i.reportedBy?.id === currentUser.id && i.type === 'found' && i.status !== 'reunited');
  const myReunitedItems = items.filter((i) => i.reportedBy?.id === currentUser.id && i.status === 'reunited');

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto space-y-6">
      
      {/* Student Profile Card */}
      <div className="app-card p-5 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-right">
        
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-[#E4E7E4]"
            />
            {currentUser.isTrusted && (
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#059669] text-white shadow-2xs" title="طالب موثوق">
                <ShieldCheck className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#18201D] truncate">{currentUser.name}</h1>
              {currentUser.isTrusted && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46]">
                  طالب موثوق 🌟
                </span>
              )}
            </div>
            <p className="text-xs text-[#66706B] truncate">{currentUser.grade}</p>
          </div>
        </div>

        {/* Goodwill points */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial p-2.5 rounded-xl bg-[#F1F3F0] text-center min-w-20">
            <span className="block text-base font-black text-[#18201D]">{currentUser.returnedCount || 0}</span>
            <span className="text-[10px] text-[#66706B]">أمانة مستردة</span>
          </div>
          <div className="flex-1 sm:flex-initial p-2.5 rounded-xl bg-[#E6F1ED] text-center min-w-20">
            <span className="block text-base font-black text-[#176B5B]">{currentUser.goodwillPoints || 0} ⭐</span>
            <span className="text-[10px] text-[#176B5B] font-semibold">نقاط الأمانة</span>
          </div>
        </div>

      </div>

      {/* Segmented Tab Chips */}
      <div className="flex items-center p-1 bg-[#F1F3F0] rounded-xl overflow-x-auto">
        
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'claims'
              ? 'bg-white text-[#18201D] shadow-2xs'
              : 'text-[#66706B]'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>طلبات الاسترداد ({incomingClaims.length})</span>
          {incomingClaims.filter((c) => c.claim.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('lost')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'lost'
              ? 'bg-white text-[#D97706] shadow-2xs'
              : 'text-[#66706B]'
          }`}
        >
          مفقوداتي ({myLostItems.length})
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'found'
              ? 'bg-white text-[#059669] shadow-2xs'
              : 'text-[#66706B]'
          }`}
        >
          معثوراتي ({myFoundItems.length})
        </button>

        <button
          onClick={() => setActiveTab('reunited')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'reunited'
              ? 'bg-white text-[#4F46E5] shadow-2xs'
              : 'text-[#66706B]'
          }`}
        >
          المستردة ({myReunitedItems.length})
        </button>

      </div>

      {/* TAB 1: Incoming Claims Review */}
      {activeTab === 'claims' && (
        <div className="space-y-3.5 animate-in fade-in">
          {incomingClaims.length > 0 ? (
            <div className="space-y-3">
              {incomingClaims.map(({ claim, item }) => {
                const isPending = claim.status === 'pending';
                const isApproved = claim.status === 'approved';
                const isCompleted = claim.status === 'completed';

                return (
                  <div
                    key={claim.id}
                    className="app-card p-5 space-y-3 text-right bg-white"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E4E7E4] pb-3">
                      <div>
                        <span className="text-[10px] text-[#66706B]">طلب استرداد لـ:</span>
                        <h3 className="font-bold text-sm text-[#18201D]">{item.title}</h3>
                        <p className="text-xs text-[#66706B]">
                          مقدم الطلب: <strong className="text-[#18201D]">{claim.claimant.name}</strong> ({claim.claimant.grade})
                        </p>
                      </div>

                      <div>
                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            تم الاسترداد والتسليم 🎉
                          </span>
                        ) : isApproved ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F1ED] text-[#176B5B] flex items-center gap-1">
                            <KeyRound className="w-3 h-3" />
                            تمت الموافقة · بانتظار PIN
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                            طلب بانتظار مراجعتك
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question & Answer Box */}
                    <div className="p-3 rounded-xl bg-[#F1F3F0] space-y-1 text-xs">
                      <div className="flex items-center gap-1 text-[#176B5B] font-bold">
                        <HelpCircle className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>السؤال السري: «{item.secretQuestion}»</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#E4E7E4]">
                        <span className="text-[10px] text-[#66706B] block">إجابة الطالب:</span>
                        <p className="font-bold text-[#18201D]">«{claim.answerText}»</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveClaim(claim.id)}
                            className="py-2 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>الموافقة على الإثبات</span>
                          </button>
                          <button
                            onClick={() => rejectClaim(claim.id)}
                            className="py-2 px-3 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#E11D48] font-bold text-xs"
                          >
                            رفض
                          </button>
                        </div>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => setSelectedHandover({ claim, item })}
                          className="py-2 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>إدخال رمز الـ PIN المكون من 4 أرقام لإتمام التسليم</span>
                        </button>
                      )}

                      <Link
                        href={`/items/${item.id}`}
                        className="text-xs text-[#66706B] hover:text-[#18201D]"
                      >
                        معاينة صفحة الغرض
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="app-card p-12 text-center space-y-2 bg-white max-w-md mx-auto">
              <KeyRound className="w-8 h-8 text-[#66706B] mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D]">لا توجد طلبات إثبات ملكية حالياً</h3>
              <p className="text-xs text-[#66706B]">
                عندما يطلب أي طالب استرداد غرض عثرت عليه، ستظهر إجابته هنا للتحقق.
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
            <div className="app-card p-12 text-center space-y-3 bg-white max-w-md mx-auto">
              <Inbox className="w-8 h-8 text-[#66706B] mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D]">ما عندك أي بلاغات مفقودة</h3>
              <p className="text-xs text-[#66706B]">إذا ضاع منك أي غرض سجل بلاغاً لنبحث عنه فوراً.</p>
              <Link
                href="/report?type=lost"
                className="inline-block py-2 px-4 rounded-xl bg-[#176B5B] text-white text-xs font-bold"
              >
                تسجيل مفقود جديد
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
            <div className="app-card p-12 text-center space-y-3 bg-white max-w-md mx-auto">
              <Inbox className="w-8 h-8 text-[#66706B] mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D]">لم تقم بتسجيل أي أمانة بعد</h3>
              <Link
                href="/report?type=found"
                className="inline-block py-2 px-4 rounded-xl bg-[#176B5B] text-white text-xs font-bold"
              >
                تسجيل معثور عليه
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
            <div className="app-card p-12 text-center space-y-2 bg-white max-w-md mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto" />
              <h3 className="text-sm font-bold text-[#18201D]">لا توجد أغراض مستردة مسجلة بعد</h3>
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
