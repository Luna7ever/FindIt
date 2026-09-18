'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Item } from '@/types';
import { SCHOOL_LOCATIONS } from '@/lib/constants';
import { getLocalizedItem, getLocalizedLocation } from '@/lib/i18n/seedDataTranslations';
import ItemVisual from '@/components/ItemVisual';
import { 
  Search, 
  X, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  PlusCircle, 
  PackageSearch,
  Sparkles
} from 'lucide-react';

/**
 * Normalizes Arabic text for flexible matching:
 * - Unifies alef forms (إ, أ, آ, ا -> ا)
 * - Unifies taa marbuta and haa (ة -> ه)
 * - Unifies alif maqsura and yaa (ى -> ي)
 * - Strips all Arabic diacritics (tashkeel)
 */
export function normalizeArabicSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ');
}

interface InstantSearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function InstantSearchBar({
  placeholder,
  className = '',
}: InstantSearchBarProps) {
  const router = useRouter();
  const { items, dir, isRtl, language, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Filter matching items with normalized search
  const matchedItems = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return [];

    const normQuery = normalizeArabicSearch(trimmed);
    const queryWords = normQuery.split(' ').filter(Boolean);

    return items.filter((item) => {
      // Ignore already returned/reunited items from quick search
      if (item.status === 'reunited') return false;

      const localized = getLocalizedItem(item, language);
      const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
      const localizedLoc = loc ? getLocalizedLocation(loc, language) : null;

      // Build searchable haystack
      const searchableFields = [
        item.title,
        localized.title,
        item.description,
        localized.description,
        item.color || '',
        item.brand || '',
        loc?.name || '',
        localizedLoc?.name || '',
        loc?.building || '',
      ];

      const haystack = normalizeArabicSearch(searchableFields.join(' '));

      // Match if all query words appear in haystack
      return queryWords.every((word) => haystack.includes(word));
    });
  }, [items, searchQuery, language]);

  // Display top 5 items in dropdown
  const topMatches = useMemo(() => {
    return matchedItems.slice(0, 5);
  }, [matchedItems]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.trim().length > 0);
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const defaultPlaceholder = language === 'en'
    ? 'Search items by keyword (e.g. calculator, watch, keys)...'
    : 'ابحث عن أي غرض (مثل: حاسبة، نظارة، مفاتيح، حقيبة)...';

  return (
    <div ref={containerRef} className={`relative pt-1 ${className}`} dir={dir}>
      {/* Search Input Form */}
      <form onSubmit={handleFormSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder || defaultPlaceholder}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="instant-search-dropdown"
          className="w-full py-3.5 px-4 ps-11 pe-24 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs text-xs sm:text-sm focus:border-[#176B5B] dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#176B5B]/10 dark:focus:ring-[#2DD4BF]/10 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[#18201D] dark:text-white"
        />

        {/* Magnifying Glass Icon */}
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-1/2 -translate-y-1/2 start-4 pointer-events-none" />

        {/* Action Controls: Clear Button + Submit Button */}
        <div className="absolute top-1/2 -translate-y-1/2 end-2 flex items-center gap-1.5">
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={language === 'en' ? 'Clear search' : 'مسح نص البحث'}
              aria-label={language === 'en' ? 'Clear search' : 'مسح نص البحث'}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 text-xs font-bold hover:bg-[#125648] dark:hover:bg-[#14B8A6] transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
          >
            {language === 'en' ? 'Search' : 'بحث'}
          </button>
        </div>
      </form>

      {/* Floating Dropdown Overlay */}
      {isOpen && searchQuery.trim().length > 0 && (
        <div
          id="instant-search-dropdown"
          role="listbox"
          className="absolute top-full start-0 end-0 mt-2 z-50 bg-white/98 dark:bg-[#141C1A]/98 backdrop-blur-md border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {topMatches.length > 0 ? (
            <div className="divide-y divide-[#F1F3F0] dark:divide-[#1F2B28]">
              {/* Header Label */}
              <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-[#121917]/70 flex items-center justify-between text-[11px] font-bold text-[#66706B] dark:text-[#94A39D]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'en' ? 'Matching Results' : 'النتائج المطابقة فورياً'}
                </span>
                <span className="text-[10px] bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
                  {matchedItems.length} {language === 'en' ? 'items' : 'أغراض'}
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto scrollbar-none py-1">
                {topMatches.map((item) => {
                  const localized = getLocalizedItem(item, language);
                  const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
                  const localizedLoc = loc ? getLocalizedLocation(loc, language) : null;
                  const isFound = item.type === 'found';

                  return (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2.5 hover:bg-[#F7F9F8] dark:hover:bg-[#182320] transition-colors group cursor-pointer text-start"
                    >
                      {/* Left: Thumbnail + Title & Location */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#E4E7E4] dark:border-[#263834] bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                          <ItemVisual
                            category={item.category}
                            title={localized.title}
                            imageUrl={item.imageUrl}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white truncate group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-colors">
                            {localized.title}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-[#66706B] dark:text-[#94A39D] mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-[#176B5B] dark:text-[#2DD4BF] shrink-0" />
                            <span className="truncate">{localizedLoc?.name || loc?.name || item.locationId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Type Badge */}
                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isFound
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isFound
                            ? (language === 'en' ? 'Found' : 'أمانة')
                            : (language === 'en' ? 'Lost' : 'مفقود')}
                        </span>
                        <ArrowIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#176B5B] dark:group-hover:text-[#2DD4BF] transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Dropdown Footer: Explore all results */}
              <div className="p-2.5 bg-slate-50/70 dark:bg-[#121917]/70">
                <Link
                  href={`/explore?q=${encodeURIComponent(searchQuery.trim())}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#1A2522] hover:bg-[#E6F1ED] dark:hover:bg-[#20302C] border border-[#E4E7E4] dark:border-[#263834] text-[#176B5B] dark:text-[#2DD4BF] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <span>
                    {language === 'en'
                      ? `View all ${matchedItems.length} results in Explore`
                      : `عرض جميع النتائج (${matchedItems.length}) في صفحة الاستكشاف`}
                  </span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Empty State when no results found */
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <PackageSearch className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white">
                  {language === 'en' ? 'No items found' : 'لم نجد أي مفقود أو أمانة تطابق بحثك'}
                </h4>
                <p className="text-[11px] text-[#66706B] dark:text-[#94A39D] max-w-xs mx-auto">
                  {language === 'en'
                    ? `No registered school items match "${searchQuery}". Would you like to record a new report?`
                    : `لم يُسجل أي غرض مدرسي مطابق لـ «${searchQuery}». هل ترغبين في تسجيل بلاغ جديد؟`}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Link
                  href="/report"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 text-xs font-bold hover:bg-[#125648] dark:hover:bg-[#14B8A6] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Report New Item' : 'تسجيل بلاغ جديد الآن'}</span>
                </Link>

                <Link
                  href="/explore"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#18201D] dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Browse all items' : 'تصفح كافة المعثورات'}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
