'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CATEGORIES, SCHOOL_LOCATIONS } from '@/lib/constants';
import { getLocalizedItem, getLocalizedLocation } from '@/lib/i18n/seedDataTranslations';
import ItemCard from '@/components/ItemCard';
import { 
  Search, 
  X, 
  MapPin, 
  Inbox, 
  PlusCircle,
  Filter
} from 'lucide-react';
import Link from 'next/link';

function ExploreContent() {
  const searchParams = useSearchParams();
  const { items, dir, language, t } = useApp();

  const queryQ = searchParams.get('q') || '';
  const queryCat = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryQ);
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found' | 'reunited'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(queryCat);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type
      if (selectedType === 'lost' && (item.type !== 'lost' || item.status === 'reunited')) return false;
      if (selectedType === 'found' && (item.type !== 'found' || item.status === 'reunited')) return false;
      if (selectedType === 'reunited' && item.status !== 'reunited') return false;

      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Location
      if (selectedLocation !== 'all' && item.locationId !== selectedLocation) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const localizedItem = getLocalizedItem(item, language);
        const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
        const localizedLoc = loc ? getLocalizedLocation(loc, language) : null;
        const matchesTitle = item.title.toLowerCase().includes(q) || localizedItem.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q) || localizedItem.description.toLowerCase().includes(q);
        const matchesColor = item.color?.toLowerCase().includes(q);
        const matchesBrand = item.brand?.toLowerCase().includes(q);
        const matchesLoc = (loc?.name.toLowerCase().includes(q) || localizedLoc?.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesColor && !matchesBrand && !matchesLoc) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedType, selectedCategory, selectedLocation, searchQuery]);

  const hasActiveFilters = searchQuery !== '' || selectedType !== 'all' || selectedCategory !== 'all' || selectedLocation !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedLocation('all');
  };

  return (
    <div className="px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full text-start text-[#18201D] dark:text-[#F1F5F3]" dir={dir}>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 text-start">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-[#18201D] dark:text-white tracking-tight">
            {language === 'en' ? 'Explore Lost & Found Items' : 'استكشاف المفقودات والأمانات'}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D] mt-0.5">
            {language === 'en' ? `Browse registered school belongings (${items.length} items)` : `تصفح الأغراض المسجلة في كافة مرافق المدرسة (${items.length} غرض)`}
          </p>
        </div>

        <Link
          href="/report"
          className="py-2 px-3 sm:px-4 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Report Item' : 'إبلاغ جديد'}</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute start-3.5 top-3.5 w-4 h-4 text-[#66706B] dark:text-[#94A39D] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'en' ? 'Search by title, color, location...' : 'ابحث بالاسم، اللون، المرفق...'}
          className="w-full py-2.5 px-4 ps-10 pe-10 rounded-xl border border-[#E4E7E4] dark:border-[#263834] bg-white dark:bg-[#15201D] text-xs sm:text-sm focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:outline-none transition-colors text-[#18201D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute end-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="space-y-3 bg-white dark:bg-[#15201D] p-3.5 sm:p-4 rounded-2xl border border-[#E4E7E4] dark:border-[#263834] shadow-2xs">
        
        {/* Type Toggle Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: language === 'en' ? 'All' : 'الكل' },
            { id: 'found', label: language === 'en' ? 'Found Items' : 'معثور عليه' },
            { id: 'lost', label: language === 'en' ? 'Lost Items' : 'مفقود' },
            { id: 'reunited', label: language === 'en' ? 'Reunited' : 'مسترد' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as any)}
              className={`px-3.5 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                selectedType === type.id
                  ? 'bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 shadow-xs'
                  : 'bg-[#F1F3F0] dark:bg-[#1C2B27] text-[#66706B] dark:text-[#94A39D] hover:bg-[#E4E7E4] dark:hover:bg-[#253934]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Category & Location Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[#E4E7E4] dark:border-[#2D3E3A] bg-slate-50 dark:bg-[#1C2B27] text-xs font-bold text-[#18201D] dark:text-white focus:outline-none focus:border-[#176B5B] dark:focus:border-[#2DD4BF] cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-[#15201D] text-[#18201D] dark:text-white">{language === 'en' ? 'All Categories' : 'جميع التصنيفات'}</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-[#15201D] text-[#18201D] dark:text-white">
                {t('cat.' + c.id) || c.label}
              </option>
            ))}
          </select>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[#E4E7E4] dark:border-[#2D3E3A] bg-slate-50 dark:bg-[#1C2B27] text-xs font-bold text-[#18201D] dark:text-white focus:outline-none focus:border-[#176B5B] dark:focus:border-[#2DD4BF] cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-[#15201D] text-[#18201D] dark:text-white">{language === 'en' ? 'All School Locations' : 'جميع المرافق والغرف'}</option>
            {SCHOOL_LOCATIONS.map((l) => {
              const loc = getLocalizedLocation(l, language);
              return (
                <option key={l.id} value={l.id} className="bg-white dark:bg-[#15201D] text-[#18201D] dark:text-white">
                  {loc.name} ({loc.floor})
                </option>
              );
            })}
          </select>
        </div>

        {/* Active Filter Clear */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E4E7E4] dark:border-[#263834] text-xs">
            <span className="text-[#66706B] dark:text-[#94A39D]">
              {language === 'en' ? `Found ${filteredItems.length} matching items` : `تم العثور على ${filteredItems.length} غرض مطابق`}:
            </span>
            <button
              onClick={resetFilters}
              className="text-[#176B5B] dark:text-[#2DD4BF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Clear Filters' : 'إلغاء الفلاتر'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-[#15201D] rounded-3xl border border-[#E4E7E4] dark:border-[#263834] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1C2B27] text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-[#18201D] dark:text-white">
            {language === 'en' ? 'No Matching Items Found' : 'لم نجد أي أغراض مطابقة'}
          </h3>
          <p className="text-xs text-[#66706B] dark:text-[#94A39D] max-w-sm mx-auto">
            {language === 'en' ? 'Try adjusting your search terms or clearing selected filters.' : 'جرب تغيير كلمات البحث أو إعادة تعيين الفلاتر المحددة بالأعلى.'}
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 text-xs font-bold hover:bg-[#125648] dark:hover:bg-[#14B8A6] transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Reset All Filters' : 'عرض كافة المعروضات'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
