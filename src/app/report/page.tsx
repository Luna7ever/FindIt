'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CATEGORIES, SCHOOL_LOCATIONS, ITEM_COLORS } from '@/lib/constants';
import { ItemCategory, SchoolLocationId, CustodyStatus, ItemType } from '@/types';
import ItemVisual from '@/components/ItemVisual';
import { 
  Search, 
  PlusCircle, 
  MapPin, 
  Lock, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Camera, 
  Laptop, 
  PenTool, 
  BookOpen, 
  Shirt, 
  CreditCard, 
  Trophy, 
  FolderOpen,
  KeyRound,
  ShoppingBag,
  CupSoda
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  electronics: <Laptop className="w-5 h-5" />,
  stationery: <PenTool className="w-5 h-5" />,
  books: <BookOpen className="w-5 h-5" />,
  clothing: <Shirt className="w-5 h-5" />,
  wallets_cards: <CreditCard className="w-5 h-5" />,
  sports: <Trophy className="w-5 h-5" />,
  bottles: <CupSoda className="w-5 h-5" />,
  keys: <KeyRound className="w-5 h-5" />,
  bags: <ShoppingBag className="w-5 h-5" />,
  personal: <FolderOpen className="w-5 h-5" />,
};

function ReportWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useApp();

  const initialType: ItemType = searchParams.get('type') === 'found' ? 'found' : 'lost';
  const initialLocation = (searchParams.get('location') as SchoolLocationId) || 'science_lab';

  // Step state (1, 2, 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<ItemType>(initialType);

  // Step 1 Data
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('أسود');

  // Step 2 Data
  const [locationId, setLocationId] = useState<SchoolLocationId>(initialLocation);
  const [locationDetails, setLocationDetails] = useState('');
  const [date, setDate] = useState('2026-08-29');

  // Step 3 Data
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [secretQuestion, setSecretQuestion] = useState('');
  const [custody, setCustody] = useState<CustodyStatus>('with_finder');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const qType = searchParams.get('type');
    if (qType === 'found' || qType === 'lost') {
      setType(qType);
    }
    const qLoc = searchParams.get('location') as SchoolLocationId;
    if (qLoc && SCHOOL_LOCATIONS.some((l) => l.id === qLoc)) {
      setLocationId(qLoc);
    }
  }, [searchParams]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        alert('يرجى إدخال اسم أو عنوان الغرض للمتابعة');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى كتابة اسم الغرض');
      return;
    }

    setIsSubmitting(true);

    const newItem = addItem({
      title: title.trim(),
      type,
      category,
      locationId,
      locationDetails: locationDetails.trim() || undefined,
      date,
      color,
      brand: brand.trim() || undefined,
      description: description.trim() || 'لا يوجد وصف إضافي',
      imageUrl: imageUrl.trim() || undefined,
      secretQuestion: type === 'found' ? secretQuestion.trim() || undefined : undefined,
      custody: type === 'found' ? custody : undefined,
      status: 'open',
    });

    setTimeout(() => {
      router.push(`/match/${newItem.id}`);
    }, 200);
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-2xl mx-auto">
      
      {/* Wizard Card Container */}
      <div className="app-card p-6 sm:p-8 bg-white space-y-6">
        
        {/* Top Header & Type Switcher */}
        <div className="space-y-4 text-right border-b border-[#E4E7E4] pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#176B5B] uppercase tracking-wider block mb-0.5">
                معالج البلاغات الذكي
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#18201D]">
                {type === 'lost' ? 'تسجيل غرض مفقود' : 'تسجيل غرض معثور عليه'}
              </h1>
            </div>

            {/* Type Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-[#F1F3F0] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setType('lost')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  type === 'lost'
                    ? 'bg-white text-[#D97706] shadow-2xs'
                    : 'text-[#66706B]'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>أضعت غرضاً</span>
              </button>
              <button
                type="button"
                onClick={() => setType('found')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  type === 'found'
                    ? 'bg-white text-[#059669] shadow-2xs'
                    : 'text-[#66706B]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>عثرت على غرض</span>
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#66706B]">
              <span>الخطوة {currentStep} من 3</span>
              <span>
                {currentStep === 1
                  ? '١. ما هو الغرض؟'
                  : currentStep === 2
                  ? '٢. أين ومتى؟'
                  : '٣. تفاصيل التحقق والعلامات'}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-[#F1F3F0] overflow-hidden">
              <div
                className="h-full bg-[#176B5B] transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          
          {/* ========================================================
              STEP 1: What did you lose/find? (Category, Name, Color)
          ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Category Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#18201D]">
                  اختر فئة الغرض <span className="text-[#E11D48]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#E6F1ED] border-[#176B5B] text-[#176B5B] font-bold shadow-2xs'
                            : 'bg-white border-[#E4E7E4] text-[#66706B] hover:bg-[#F1F3F0] hover:text-[#18201D]'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white text-[#176B5B]' : 'bg-[#F1F3F0]'}`}>
                          {categoryIcons[cat.id] || <FolderOpen className="w-5 h-5" />}
                        </div>
                        <span className="text-xs">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#18201D]">
                  اسم أو نوع الغرض <span className="text-[#E11D48]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: حاسبة كاسيو علمية سوداء، سماعات آيربودز، جاكيت أزرق..."
                  className="w-full py-3 px-4 rounded-xl bg-white border border-[#E4E7E4] text-xs sm:text-sm text-[#18201D] placeholder-[#66706B]/70 focus:outline-none focus:border-[#176B5B] focus:ring-2 focus:ring-[#176B5B]/10 shadow-2xs transition-all"
                />
              </div>

              {/* Color Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#18201D]">
                  اللون الرئيسي
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ITEM_COLORS.map((c) => {
                    const isSelected = color === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColor(c.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all border ${
                          isSelected
                            ? 'bg-[#18201D] text-white border-[#18201D] font-bold shadow-xs'
                            : 'bg-white text-[#66706B] border-[#E4E7E4] hover:bg-[#F1F3F0]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              STEP 2: Where and when? (Location, Date, Detail)
          ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Location Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#18201D] flex items-center justify-between">
                  <span>الموقع في المدرسة <span className="text-[#E11D48]">*</span></span>
                  {searchParams.get('location') && (
                    <span className="text-[10px] text-[#059669] font-bold">
                      ✓ محدد عبر QR
                    </span>
                  )}
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value as SchoolLocationId)}
                  className="w-full py-3 px-4 rounded-xl bg-white border border-[#E4E7E4] text-xs sm:text-sm text-[#18201D] focus:outline-none focus:border-[#176B5B] shadow-2xs"
                >
                  {SCHOOL_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.building} - {loc.floor})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#18201D]">
                  تاريخ الحادثة التقريبي
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl bg-white border border-[#E4E7E4] text-xs sm:text-sm text-[#18201D] focus:outline-none focus:border-[#176B5B] shadow-2xs"
                />
              </div>

              {/* Specific Location Detail */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#18201D]">
                  مكان التواجد بدقة داخل المرفق (اختياري)
                </label>
                <input
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="مثال: على طاولة التجارب رقم 4، أو عند مدرجات الصالة الرياضية..."
                  className="w-full py-3 px-4 rounded-xl bg-white border border-[#E4E7E4] text-xs sm:text-sm text-[#18201D] placeholder-[#66706B]/70 focus:outline-none focus:border-[#176B5B] shadow-2xs"
                />
              </div>

            </div>
          )}

          {/* ========================================================
              STEP 3: Help us recognize it (Brand, Secret Detail, Visual)
          ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Brand & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#18201D]">
                    الماركة أو الشركة المصنعة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="مثال: Casio, Apple, Nike..."
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[#E4E7E4] text-xs text-[#18201D] focus:outline-none focus:border-[#176B5B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#18201D]">
                    وصف أو علامات عامة واضحة
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثال: بحالة جيدة مع غلاف حماية..."
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[#E4E7E4] text-xs text-[#18201D] focus:outline-none focus:border-[#176B5B]"
                  />
                </div>
              </div>

              {/* Automatic CSS Illustration Preview Notice */}
              <div className="p-3.5 rounded-2xl bg-[#E6F1ED] border border-[#C2DDD5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#A7F3D0]">
                  <ItemVisual
                    category={category}
                    title={title || 'غرض'}
                    className="w-full h-full"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#176B5B] block">
                    سيتم توليد رسم توضيحي ذكي للغرض تلقائياً ✨
                  </span>
                  <p className="text-[10px] text-[#66706B]">
                    لا حاجة لالتقاط أو رفع صور حقيقية؛ يولد النظام مظهراً هندسياً أنيقاً متطابقاً مع الفئة.
                  </p>
                </div>
              </div>

              {/* FOUND ONLY: Secret Question & Custody */}
              {type === 'found' && (
                <div className="p-4 rounded-2xl bg-[#F1F3F0] border border-[#E4E7E4] space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669]">
                    <Lock className="w-4 h-4" />
                    <span>العلامة المخفية لإثبات الملكية (لن تظهر علناً)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#18201D]">
                      سؤال التحقق السري <span className="text-[#E11D48]">*</span>
                    </label>
                    <input
                      type="text"
                      required={type === 'found'}
                      value={secretQuestion}
                      onChange={(e) => setSecretQuestion(e.target.value)}
                      placeholder="مثال: ما هو لون وشكل الملصق بالخلف؟ أو ما الاسم المكتوب بالداخل؟"
                      className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[#E4E7E4] text-xs text-[#18201D] focus:outline-none focus:border-[#176B5B]"
                    />
                    <p className="text-[10px] text-[#66706B]">
                      🔒 لن يتم تسليم الغرض لأي طالب إلا بعد الإجابة الصحيحة على هذا السؤال.
                    </p>
                  </div>

                  {/* Custody */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#18201D]">
                      أين يتواجد الغرض الآن؟
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCustody('with_finder')}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                          custody === 'with_finder'
                            ? 'bg-white border-[#176B5B] text-[#176B5B] font-bold shadow-2xs'
                            : 'bg-white/60 border-[#E4E7E4] text-[#66706B]'
                        }`}
                      >
                        <span>🤝</span>
                        <span className="text-xs">معي شخصياً</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustody('at_office')}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                          custody === 'at_office'
                            ? 'bg-white border-[#176B5B] text-[#176B5B] font-bold shadow-2xs'
                            : 'bg-white/60 border-[#E4E7E4] text-[#66706B]'
                        }`}
                      >
                        <span>🏛️</span>
                        <span className="text-xs">في مكتب الأمانات</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Bottom Step Actions */}
          <div className="pt-3 border-t border-[#E4E7E4] flex items-center justify-between gap-3">
            
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="py-2.5 px-5 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-6 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>التالي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-6 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <span>{isSubmitting ? 'جارِ التحليل والمطابقة...' : 'نشر البلاغ وبدء المطابقة 🔍'}</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}

          </div>

        </form>

      </div>

    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#66706B]">جارِ تحميل المعالج...</div>}>
      <ReportWizardContent />
    </Suspense>
  );
}
