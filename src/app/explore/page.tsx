'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CATEGORIES, SCHOOL_LOCATIONS } from '@/lib/constants';
import ItemCard from '@/components/ItemCard';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  MapPin, 
  Inbox, 
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';

function ExploreContent() {
  const searchParams = useSearchParams();
  const { items } = useApp();

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
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesColor = item.color?.toLowerCase().includes(q);
        const matchesBrand = item.brand?.toLowerCase().includes(q);
        const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
        const matchesLoc = loc?.name.toLowerCase().includes(q);
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
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#18201D]">
            استكشاف المفقودات والأمانات
          </h1>
          <p className="text-xs text-[#66706B] mt-0.5">
            تصفح كافة الأغراض المسجلة في مرافق المدرسة
          </p>
        </div>

        <Link
          href="/report"
          className="self-start sm:self-auto py-2 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>إبلاغ جديد</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-3.5 w-4 h-4 text-[#66706B] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم، الماركة، أو اللون..."
          className="w-full py-3 pr-11 pl-10 rounded-2xl bg-white border border-[#E4E7E4] text-xs sm:text-sm text-[#18201D] placeholder-[#66706B]/70 focus:outline-none focus:border-[#176B5B] focus:ring-2 focus:ring-[#176B5B]/10 shadow-2xs transition-all text-right"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3.5 top-3.5 p-0.5 rounded-full text-[#66706B] hover:bg-[#F1F3F0]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips Bars */}
      <div className="space-y-2.5">
        
        {/* Status / Type Segmented Controls */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F3F0] shrink-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'all'
                  ? 'bg-white text-[#18201D] shadow-2xs'
                  : 'text-[#66706B]'
              }`}
            >
              الكل ({items.length})
            </button>
            <button
              onClick={() => setSelectedType('lost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'lost'
                  ? 'bg-white text-[#D97706] shadow-2xs'
                  : 'text-[#66706B]'
              }`}
            >
              المفقودات
            </button>
            <button
              onClick={() => setSelectedType('found')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'found'
                  ? 'bg-white text-[#059669] shadow-2xs'
                  : 'text-[#66706B]'
              }`}
            >
              المعثور عليها
            </button>
            <button
              onClick={() => setSelectedType('reunited')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'reunited'
                  ? 'bg-white text-[#4F46E5] shadow-2xs'
                  : 'text-[#66706B]'
              }`}
            >
              تم الاسترداد
            </button>
          </div>

          {/* Location Selector */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-[#E4E7E4] text-xs text-[#18201D] focus:outline-none focus:border-[#176B5B] shadow-2xs shrink-0"
          >
            <option value="all">📍 جميع المواقع المدرسية</option>
            {SCHOOL_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

        </div>

        {/* Category Horizontal Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#18201D] text-white shadow-xs'
                : 'bg-white text-[#66706B] hover:text-[#18201D] border border-[#E4E7E4]'
            }`}
          >
            جميع الفئات
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#18201D] text-white font-bold shadow-xs'
                    : 'bg-white text-[#66706B] hover:text-[#18201D] border border-[#E4E7E4]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Active Filter Clear Bar */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs bg-[#F1F3F0] p-2.5 rounded-xl">
          <span className="text-[#66706B]">
            يتم عرض النتائج المصفاة ({filteredItems.length} غرض)
          </span>
          <button
            onClick={resetFilters}
            className="text-[#E11D48] font-bold hover:underline"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}

      {/* Item Feed Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="app-card p-12 text-center max-w-md mx-auto space-y-3 bg-white">
          <div className="w-12 h-12 rounded-full bg-[#F1F3F0] flex items-center justify-center mx-auto text-[#66706B]">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#18201D]">
              لسه ما لقيناش أغراض مطابقة
            </h3>
            <p className="text-xs text-[#66706B] leading-relaxed">
              جرب تغيير خيارات البحث أو قم بتسجيل بلاغ جديد وسنقوم بالبحث المستمر عنه.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={resetFilters}
              className="py-2 px-4 rounded-xl bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] text-xs font-semibold"
            >
              عرض الكل
            </button>
            <Link
              href="/report"
              className="py-2 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold"
            >
              تسجيل بلاغ الآن
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#66706B]">جارِ تحميل المفقودات...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
