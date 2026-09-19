'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CATEGORIES, SCHOOL_LOCATIONS, ITEM_COLORS } from '@/lib/constants';
import { getLocalizedLocation, getLocalizedColorName } from '@/lib/i18n/seedDataTranslations';
import { ItemCategory, SchoolLocationId, CustodyStatus, ItemType, VisualFeatures } from '@/types';
import ItemVisual from '@/components/ItemVisual';
import EdgeVisionDropzone, { AutofillPayload } from '@/components/EdgeVisionDropzone';
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
  const { addItem, openQRScanner, dir, language, t, addToast } = useApp();

  const initialType: ItemType = searchParams.get('type') === 'found' ? 'found' : 'lost';
  const initialLocation = (searchParams.get('locationId') || searchParams.get('location')) as SchoolLocationId || 'science_lab';

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
  const [visualFeatures, setVisualFeatures] = useState<VisualFeatures | undefined>(undefined);
  const [isAiVerified, setIsAiVerified] = useState<boolean>(false);
  const [secretQuestion, setSecretQuestion] = useState('');
  const [custody, setCustody] = useState<CustodyStatus>('with_finder');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAutofill = (data: AutofillPayload) => {
    if (data.title) setTitle(data.title);
    if (data.category) setCategory(data.category);
    if (data.color) setColor(data.color);
    if (data.brand) setBrand(data.brand);
    if (data.description) setDescription(data.description);
    if (data.imageUrl) setImageUrl(data.imageUrl);
    if (data.visualFeatures) setVisualFeatures(data.visualFeatures);
    if (data.isAiVerified !== undefined) setIsAiVerified(data.isAiVerified);
  };

  const handleImageSelected = (dataUrl: string, features?: VisualFeatures) => {
    setImageUrl(dataUrl);
    setVisualFeatures(features);
    if (features) {
      setIsAiVerified(true);
    }
  };

  const isRtl = dir === 'rtl';
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const qType = searchParams.get('type');
    if (qType === 'found' || qType === 'lost') {
      setType(qType);
    }
    const qLoc = (searchParams.get('locationId') || searchParams.get('location')) as SchoolLocationId;
    if (qLoc && SCHOOL_LOCATIONS.some((l) => l.id === qLoc)) {
      setLocationId(qLoc);
    }
  }, [searchParams]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        addToast(
          language === 'en' ? 'Item Title Required' : 'اسم الغرض مطلوب',
          language === 'en' ? 'Please enter item title to continue' : 'يرجى إدخال اسم أو عنوان الغرض للمتابعة',
          'warning'
        );
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
    if (!title.trim() || !description.trim()) {
      addToast(
        language === 'en' ? 'Missing Details' : 'بيانات مطلوبة',
        language === 'en' ? 'Please fill all required fields' : 'يرجى إكمال البيانات المطلوبة (اسم ووصف الغرض)',
        'warning'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const newItem = addItem({
        title: title.trim(),
        type,
        category,
        locationId,
        locationDetails: locationDetails.trim(),
        date,
        color,
        brand: brand.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        visualFeatures,
        isAiVerified,
        secretQuestion: type === 'found' ? secretQuestion.trim() : undefined,
        custody: type === 'found' ? custody : undefined,
      });

      addToast(
        language === 'en' ? 'Report Published!' : 'تم نشر البلاغ بنجاح!',
        language === 'en' ? 'Your item has been recorded in the school registry' : 'تم توثيق الغرض في سجل المدرسة وبدء المطابقة الذكية',
        'success'
      );

      router.push(`/items/${newItem.id}`);
    } catch (err) {
      addToast(
        language === 'en' ? 'Error' : 'خطأ في الحفظ',
        err instanceof Error ? err.message : (language === 'en' ? 'An error occurred while saving the report' : 'حدث خطأ أثناء حفظ البلاغ'),
        'error'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-3.5 sm:px-6 py-4 sm:py-8 space-y-6 max-w-2xl mx-auto w-full text-start text-[#18201D] dark:text-[#F1F5F3]" dir={dir}>
      
      {/* Wizard Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-[#18201D] dark:text-white tracking-tight">
            {language === 'en' ? 'Record School Report' : 'تسجيل بلاغ جديد'}
          </h1>
          <span className="text-xs font-bold text-[#176B5B] dark:text-[#2DD4BF] bg-[#E6F1ED] dark:bg-[#122823] px-3 py-1 rounded-full border border-emerald-200/60 dark:border-[#1E463D]">
            {language === 'en' ? `Step ${currentStep} of 3` : `الخطوة ${currentStep} من 3`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 dark:bg-[#1C2B27] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#176B5B] to-emerald-500 dark:from-[#2DD4BF] dark:to-teal-400 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Type Toggle: Lost vs Found */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-white dark:bg-[#15201D] rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-2xs">
        <button
          type="button"
          onClick={() => setType('lost')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            type === 'lost'
              ? 'bg-[#FEF3C7] dark:bg-amber-950/80 text-[#92400E] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1C2B27]'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{language === 'en' ? 'Lost Item (I lost it)' : 'غرض مفقود (أضعته)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setType('found')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            type === 'found'
              ? 'bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#065F46] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1C2B27]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'en' ? 'Found Item (I found it)' : 'غرض معثور عليه (أمانة)'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* STEP 1: Main Category & Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-5 bg-white dark:bg-[#15201D] p-5 sm:p-6 rounded-3xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs">
            
            {/* Edge AI Vision & OCR Ingestion */}
            <EdgeVisionDropzone
              onAutofill={handleAutofill}
              onImageSelected={handleImageSelected}
              currentImageUrl={imageUrl}
            />

            {/* Title Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                {language === 'en' ? 'Item Title / Name *' : 'اسم أو عنوان الغرض *'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Casio Scientific Calculator, Blue Water Bottle...' : 'مثال: حاسبة كاسيو علمية، مطارة ماء زرقاء...'}
                className="w-full p-3 rounded-2xl border border-[#E4E7E4] dark:border-[#2D3E3A] bg-slate-50 dark:bg-[#1C2B27] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#15201D] focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:outline-none transition-colors text-[#18201D] dark:text-white"
                required
              />
            </div>

            {/* Category Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                {language === 'en' ? 'Select Category *' : 'تصنيف الغرض *'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-[#E6F1ED] dark:bg-[#122823] border-[#176B5B] dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                          : 'bg-slate-50 dark:bg-[#1C2B27] border-[#E4E7E4] dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#253934]'
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950' : 'bg-white dark:bg-[#15201D] text-slate-600 dark:text-slate-400'}`}>
                        {categoryIcons[cat.id]}
                      </div>
                      <span className="text-xs font-bold truncate">{t('cat.' + cat.id) || cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                {language === 'en' ? 'Primary Color' : 'اللون الأساسي للغرض'}
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {ITEM_COLORS.map((c) => {
                  const isSelected = color === c.name;
                  return (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#176B5B] dark:border-[#2DD4BF] bg-white dark:bg-[#1C2B27] shadow-xs text-[#176B5B] dark:text-[#2DD4BF]'
                          : 'border-[#E4E7E4] dark:border-[#2D3E3A] bg-slate-50 dark:bg-[#1C2B27] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{getLocalizedColorName(c.name, language)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: Location & Timing */}
        {currentStep === 2 && (
          <div className="space-y-5 bg-white dark:bg-[#15201D] p-5 sm:p-6 rounded-3xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs">
            
            {/* Location Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                  {language === 'en' ? 'School Location / Room *' : 'المرفق أو الغرفة المدرسية *'}
                </label>
                <button
                  type="button"
                  onClick={openQRScanner}
                  className="text-xs text-[#176B5B] dark:text-[#2DD4BF] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Scan Room QR' : 'مسح باركود الغرفة'}</span>
                </button>
              </div>

              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value as SchoolLocationId)}
                className="w-full p-3 rounded-2xl border border-[#E4E7E4] dark:border-[#2D3E3A] bg-slate-50 dark:bg-[#1C2B27] text-xs sm:text-sm font-bold text-[#18201D] dark:text-white focus:outline-none focus:border-[#176B5B] dark:focus:border-[#2DD4BF] cursor-pointer"
              >
                {SCHOOL_LOCATIONS.map((rawLoc) => {
                  const loc = getLocalizedLocation(rawLoc, language);
                  return (
                    <option key={loc.id} value={loc.id} className="bg-white dark:bg-[#15201D] text-[#18201D] dark:text-white">
                      {loc.name} — {loc.building} ({loc.floor})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Location Details */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                {language === 'en' ? 'Specific Location Details' : 'تفاصيل المكان الدقيق (اختياري)'}
              </label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Under table 4, near the window...' : 'مثال: تحت طاولة رقم 4، بجانب النافذة...'}
                className="w-full p-3 rounded-2xl border border-[#E4E7E4] dark:border-[#2D3E3A] bg-slate-50 dark:bg-[#1C2B27] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#15201D] focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:outline-none transition-colors text-[#18201D] dark:text-white"
              />
            </div>

            {/* Date Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                {language === 'en' ? 'Date Found / Lost *' : 'تاريخ الفقدان أو العثور *'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#E4E7E4] dark:border-[#2D3E3A] bg-slate-50 dark:bg-[#1C2B27] text-xs sm:text-sm font-bold text-[#18201D] dark:text-white focus:outline-none focus:border-[#176B5B] dark:focus:border-[#2DD4BF]"
                required
              />
            </div>

          </div>
        )}

        {/* STEP 3: Description, Secret Question & Custody */}
        {currentStep === 3 && (
          <div className="space-y-5 bg-white dark:bg-[#15201D] p-5 sm:p-6 rounded-3xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs">
            
            {/* Brand */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                {language === 'en' ? 'Brand or Manufacturer (Optional)' : 'الماركة أو الشركة المصنعة (اختياري)'}
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Casio, Apple, Nike...' : 'مثال: Casio, Apple, Nike...'}
                className="w-full p-3 rounded-2xl border border-[#E4E7E4] dark:border-[#2D3E3A] bg-slate-50 dark:bg-[#1C2B27] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#15201D] focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:outline-none transition-colors text-[#18201D] dark:text-white"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                {language === 'en' ? 'Detailed Description *' : 'الوصف والمواصفات العامة *'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'en' ? 'Describe the item condition, size, special signs...' : 'اكتب وصفاً للغرض وحالته وأي علامات مميزة...'}
                className="w-full p-3 rounded-2xl border border-[#E4E7E4] dark:border-[#2D3E3A] bg-slate-50 dark:bg-[#1C2B27] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#15201D] focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:outline-none transition-colors text-[#18201D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
            </div>

            {/* Secret Question for Found Items */}
            {type === 'found' && (
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                  <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>{language === 'en' ? 'Secret Question (Ownership Verification):' : 'السؤال السري (لإثبات الملكية):'}</span>
                </div>
                <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
                  {language === 'en' ? 'Ask a question only the true owner would know.' : 'ضع سؤالاً لا يعرف إجابته إلا صاحب الغرض الحقيقي.'}
                </p>
                <input
                  type="text"
                  value={secretQuestion}
                  onChange={(e) => setSecretQuestion(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. What sticker is on the back? What is inside?' : 'مثال: ما هو الملصق الموجود على الخلف؟ ما هي محتويات الحافظة؟'}
                  className="w-full p-3 rounded-2xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-[#15201D] text-xs focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:outline-none text-[#18201D] dark:text-white"
                />
              </div>
            )}

            {/* Custody Status for Found Items */}
            {type === 'found' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#18201D] dark:text-white">
                  {language === 'en' ? 'Current Custody of the Item:' : 'مكان حيازة الغرض حالياً:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustody('with_finder')}
                    className={`p-3 rounded-2xl border text-start text-xs font-bold transition-all cursor-pointer ${
                      custody === 'with_finder'
                        ? 'bg-[#E6F1ED] dark:bg-[#122823] border-[#176B5B] dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF]'
                        : 'bg-slate-50 dark:bg-[#1C2B27] border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {language === 'en' ? 'With Finder (With Me)' : 'مع الملتقط (معي حالياً)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustody('at_office')}
                    className={`p-3 rounded-2xl border text-start text-xs font-bold transition-all cursor-pointer ${
                      custody === 'at_office'
                        ? 'bg-[#E6F1ED] dark:bg-[#122823] border-[#176B5B] dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF]'
                        : 'bg-slate-50 dark:bg-[#1C2B27] border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {language === 'en' ? 'Deposited at Office' : 'تم تسليمه لمكتب الإدارة'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="py-3 px-5 rounded-2xl bg-white dark:bg-[#1C2B27] border border-[#E4E7E4] dark:border-[#2D3E3A] hover:bg-slate-50 dark:hover:bg-[#253934] text-[#18201D] dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BackArrow className="w-4 h-4" />
              <span>{language === 'en' ? 'Back' : 'السابق'}</span>
            </button>
          ) : <div />}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <span>{language === 'en' ? 'Next' : 'التالي'}</span>
              <NextArrow className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-8 rounded-2xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Publish Report' : 'نشر وتوثيق البلاغ')}</span>
            </button>
          )}
        </div>

      </form>

    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading...</div>}>
      <ReportWizardContent />
    </Suspense>
  );
}
