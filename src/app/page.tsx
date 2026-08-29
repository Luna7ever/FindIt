'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { CATEGORIES } from '@/lib/constants';
import ItemCard from '@/components/ItemCard';
import ItemVisual from '@/components/ItemVisual';
import { 
  Search, 
  PlusCircle, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Laptop,
  PenTool,
  BookOpen,
  Shirt,
  CreditCard,
  Trophy,
  FolderOpen,
  KeyRound,
  ShieldCheck,
  Building2,
  FileCheck,
  CupSoda
} from 'lucide-react';

const categoryIconMap: Record<string, React.ReactNode> = {
  electronics: <Laptop className="w-4 h-4" />,
  stationery: <PenTool className="w-4 h-4" />,
  books: <BookOpen className="w-4 h-4" />,
  clothing: <Shirt className="w-4 h-4" />,
  wallets_cards: <CreditCard className="w-4 h-4" />,
  sports: <Trophy className="w-4 h-4" />,
  bottles: <CupSoda className="w-4 h-4" />,
  keys: <KeyRound className="w-4 h-4" />,
  personal: <FolderOpen className="w-4 h-4" />,
};

export default function HomePage() {
  const router = useRouter();
  const { items, claims, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = canAccessAdmin(currentUser);

  // Recent Items
  const recentFoundItems = useMemo(() => {
    return items
      .filter((i) => i.type === 'found' && i.status !== 'reunited')
      .slice(0, 4);
  }, [items]);

  // Malak's Calculator for High-Match Spotlight (Target: 88% match with item_found_calc_lab)
  const malakLostCalc = useMemo(() => {
    return items.find((i) => i.id === 'item_malak_lost_calc');
  }, [items]);

  const matchingFoundCalc = useMemo(() => {
    return items.find((i) => i.id === 'item_found_calc_lab');
  }, [items]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-8 max-w-4xl mx-auto">
      
      {/* ========================================================
          1. PERSONALIZED HERO GREETING
      ======================================================== */}
      <section className="space-y-1.5 text-right pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1ED] text-[#176B5B] text-xs font-bold mb-1">
          <span>
            {isAdmin ? 'مرحباً، م. مشيرة (إدارة المدرسة) 🏛️' : `مساء الخير، ${currentUser.name} 👋`}
          </span>
        </div>
        
        {isAdmin ? (
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#18201D] tracking-tight">
              لوحة العمليات اليومية <span className="text-[#176B5B]">لمفقودات المدرسة</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#66706B] mt-1">
              متابعة البلاغات النشطة، اعتماد طلبات إثبات الملكية، وتوثيق استلام الأمانات.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#18201D] tracking-tight">
              ضاع منك شيء؟ <span className="text-[#176B5B]">خلّينا نساعدك تلاقيه.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#66706B] mt-1">
              المنظومة الذكية لمطابقة المفقودات والأمانات داخل الحرم المدرسي بأمان وسرية.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================
          2. ADMIN OPERATIONAL SHORTCUTS (Visible when Moshira is active)
      ======================================================== */}
      {isAdmin ? (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Link
            href="/admin"
            className="app-card app-card-interactive p-5 bg-white border-l-4 border-l-[#E11D48] text-right space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E11D48]">طلبات معلقة</span>
              <FileCheck className="w-5 h-5 text-[#E11D48]" />
            </div>
            <div className="text-2xl font-black text-[#18201D]">
              {claims.filter((c) => c.status === 'pending').length}
            </div>
            <p className="text-[11px] text-[#66706B]">تحتاج مراجعة واعتماد السؤال السري &larr;</p>
          </Link>

          <Link
            href="/admin"
            className="app-card app-card-interactive p-5 bg-white border-l-4 border-l-[#176B5B] text-right space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#176B5B]">أمانات بالإدارة</span>
              <Building2 className="w-5 h-5 text-[#176B5B]" />
            </div>
            <div className="text-2xl font-black text-[#18201D]">
              {items.filter((i) => i.custody === 'at_office' && i.status !== 'reunited').length}
            </div>
            <p className="text-[11px] text-[#66706B]">محفوظة لدى المشرف بمكتب الإدارة &larr;</p>
          </Link>

          <Link
            href="/admin"
            className="app-card app-card-interactive p-5 bg-white border-l-4 border-l-[#059669] text-right space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#059669]">أغراض مستردة</span>
              <CheckCircle2 className="w-5 h-5 text-[#059669]" />
            </div>
            <div className="text-2xl font-black text-[#18201D]">
              {items.filter((i) => i.status === 'reunited').length + 42}
            </div>
            <p className="text-[11px] text-[#66706B]">عمليات تسليم ناجحة بالـ PIN &larr;</p>
          </Link>
        </section>
      ) : (
        /* ========================================================
            STUDENT HERO ACTIONS (Visible when Malak is active)
        ======================================================== */
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <Link
            href="/report?type=lost"
            className="app-card app-card-interactive p-5 sm:p-6 border-l-4 border-l-[#D97706] bg-white flex flex-col justify-between space-y-4 group text-right"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-[#FEF3C7] text-[#D97706]">
                <Search className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                بحث فوري
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#18201D] group-hover:text-[#D97706] transition-colors">
                فقدت شيئاً؟
              </h2>
              <p className="text-xs text-[#66706B] mt-1 leading-relaxed">
                سجلي مواصفات الغرض وسيقوم النظام بمطابقته فوراً مع معثورات المدرسة.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] pt-1">
              <span>ابدئي تسجيل المفقود</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </Link>

          <Link
            href="/report?type=found"
            className="app-card app-card-interactive p-5 sm:p-6 border-l-4 border-l-[#059669] bg-white flex flex-col justify-between space-y-4 group text-right"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-[#D1FAE5] text-[#059669]">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46]">
                أمانة
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#18201D] group-hover:text-[#059669] transition-colors">
                عثرت على شيء؟
              </h2>
              <p className="text-xs text-[#66706B] mt-1 leading-relaxed">
                شكراً لأمانتك! وثّقي الغرض مع سؤال سري لنصل إلى صاحبه الحقيقي بأمان.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669] pt-1">
              <span>تسجيل الأمانة الآن</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </Link>
        </section>
      )}

      {/* ========================================================
          3. STUDENT POSSIBLE MATCH SPOTLIGHT CARD (Malak's 88% Match)
      ======================================================== */}
      {!isAdmin && malakLostCalc && matchingFoundCalc && (
        <section className="app-card p-5 sm:p-6 bg-linear-to-l from-[#E6F1ED] via-white to-white border-2 border-[#176B5B]/30 space-y-4 text-right shadow-sm animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#176B5B] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-[#FDE68A]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#176B5B] uppercase tracking-wider">
                  إشعار مطابقة ذكية خاصة بك 🎯
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-[#18201D]">
                  وجدنا تطابقاً بنسبة 88% لحاسبتك المفقودة!
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#176B5B] text-white shadow-2xs">
              88% تطابق
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E4E7E4] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <ItemVisual
                  category={matchingFoundCalc.category}
                  title={matchingFoundCalc.title}
                  className="w-full h-full"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#18201D]">{matchingFoundCalc.title}</h4>
                <p className="text-[11px] text-[#66706B]">
                  وُجدت في: <strong>معمل العلوم والكيمياء</strong> · قبل قليل
                </p>
              </div>
            </div>

            <Link
              href={`/match/${malakLostCalc.id}`}
              className="py-2 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <span>فحص وإثبات الملكية</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-[11px] text-[#66706B] leading-relaxed">
            💡 <strong>ملاحظة:</strong> تطابقت الفئة (إلكترونيات)، المكان (معمل العلوم)، واللون الأسود. يمكنك الإجابة على السؤال السري لاستلامها.
          </p>
        </section>
      )}

      {/* ========================================================
          4. QUICK SEARCH BAR
      ======================================================== */}
      <section>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute right-4 top-3.5 w-4 h-4 text-[#66706B] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أي غرض... (حاسبة كاسيو، سماعات، مفاتيح، قارورة ماء...)"
            className="w-full py-3.5 pr-11 pl-24 rounded-2xl bg-white border border-[#E4E7E4] text-xs sm:text-sm text-[#18201D] placeholder-[#66706B]/70 focus:outline-none focus:border-[#176B5B] focus:ring-2 focus:ring-[#176B5B]/10 shadow-2xs transition-all text-right"
          />
          <button
            type="submit"
            className="absolute left-2 top-2 bottom-2 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-colors flex items-center gap-1"
          >
            <span>بحث</span>
          </button>
        </form>
      </section>

      {/* ========================================================
          5. CATEGORY SHORTCUTS
      ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-right">
          <h3 className="text-xs font-bold text-[#66706B] uppercase tracking-wider">
            تصفح حسب الفئة
          </h3>
          <Link
            href="/explore"
            className="text-xs font-bold text-[#176B5B] hover:underline"
          >
            عرض الكل &larr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CATEGORIES.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.id}`}
              className="app-card app-card-interactive p-3 flex items-center gap-3 bg-white text-right"
            >
              <div className="p-2 rounded-xl bg-[#F1F3F0] text-[#176B5B] shrink-0">
                {categoryIconMap[cat.id] || <FolderOpen className="w-4 h-4" />}
              </div>
              <div className="min-w-0 truncate">
                <h4 className="text-xs font-bold text-[#18201D] truncate leading-tight">
                  {cat.label}
                </h4>
                <p className="text-[10px] text-[#66706B] truncate">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          6. RECENTLY FOUND ITEMS FEED
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-right">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#18201D]">
              أحدث المعثورات بالمدرسة
            </h2>
            <p className="text-xs text-[#66706B]">
              أغراض تم العثور عليها وتنتظر أصحابها
            </p>
          </div>
          <Link
            href="/explore"
            className="py-1.5 px-3 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] text-xs font-bold transition-colors"
          >
            استكشاف جميع الأغراض
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recentFoundItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

    </div>
  );
}
