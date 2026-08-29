'use client';

import React from 'react';
import Link from 'next/link';
import { Item } from '@/types';
import { CATEGORIES, SCHOOL_LOCATIONS } from '@/lib/constants';
import { formatArabicDate } from '@/lib/utils';
import ItemVisual from '@/components/ItemVisual';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  Lock,
  ChevronLeft
} from 'lucide-react';

interface ItemCardProps {
  item: Item;
  matchScore?: number;
  showMatchButton?: boolean;
}

export default function ItemCard({ item, matchScore, showMatchButton = false }: ItemCardProps) {
  const categoryInfo = CATEGORIES.find((c) => c.id === item.category);
  const locationInfo = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);

  const isLost = item.type === 'lost';
  const isReunited = item.status === 'reunited';

  return (
    <Link
      href={`/items/${item.id}`}
      className="app-card app-card-interactive overflow-hidden flex flex-col justify-between group block text-right"
    >
      {/* Visual Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <ItemVisual
          category={item.category}
          title={item.title}
          imageUrl={item.imageUrl}
          className="w-full h-full"
        />

        {/* Status Pill Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {isReunited ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E0E7FF] text-[#3730A3] border border-[#C7D2FE] flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
              تم الاسترداد
            </span>
          ) : isLost ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
              مفقود
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              معثور عليه
            </span>
          )}

          {!isLost && item.custody === 'at_office' && !isReunited && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#18201D]/80 text-white backdrop-blur-xs">
              في الأمانات
            </span>
          )}
        </div>

        {/* Match Percentage Badge if available */}
        {matchScore !== undefined && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-[#176B5B] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-[#FDE68A]" />
              <span>{matchScore}% تطابق</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Metadata: Category & Relative Date */}
          <div className="flex items-center justify-between text-[11px] text-[#66706B] mb-1">
            <span className="font-semibold text-[#176B5B]">
              {categoryInfo?.label}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#66706B]/70" />
              {formatArabicDate(item.date || item.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-[#18201D] group-hover:text-[#176B5B] transition-colors line-clamp-1">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-[#66706B] mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Location & Verification Indicator */}
        <div className="pt-3 border-t border-[#E4E7E4] space-y-2">
          
          <div className="flex items-center justify-between text-xs text-[#18201D]">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#176B5B] shrink-0" />
              <span>{locationInfo?.name}</span>
            </div>
            <span className="text-[11px] text-[#66706B]">{locationInfo?.floor}</span>
          </div>

          {/* Secret detail hint */}
          {!isLost && item.secretQuestion && !isReunited && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#92400E] bg-[#FEF3C7]/60 px-2 py-0.5 rounded-lg border border-[#FDE68A]/60">
              <Lock className="w-3 h-3 text-[#D97706] shrink-0" />
              <span>يتطلب إثبات ملكية (سؤال سري)</span>
            </div>
          )}

          {/* Reporter & Action trigger */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-[#66706B]">
            <div className="flex items-center gap-1.5">
              <img
                src={item.reportedBy?.avatar}
                alt=""
                className="w-4 h-4 rounded-full object-cover ring-1 ring-[#E4E7E4]"
              />
              <span className="truncate max-w-[120px]">{item.reportedBy?.name}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[#176B5B] font-semibold text-xs group-hover:translate-x-[-2px] transition-transform">
              <span>التفاصيل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

      </div>
    </Link>
  );
}
