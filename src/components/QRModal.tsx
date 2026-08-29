'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SCHOOL_LOCATIONS } from '@/lib/constants';
import { 
  X, 
  QrCode, 
  FlaskConical, 
  Library, 
  Utensils, 
  Dumbbell, 
  Sun, 
  GraduationCap, 
  Building, 
  ShieldCheck, 
  Moon,
  ArrowLeft
} from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const locationIcons: Record<string, React.ReactNode> = {
  science_lab: <FlaskConical className="w-4 h-4 text-[#176B5B]" />,
  library: <Library className="w-4 h-4 text-[#176B5B]" />,
  cafeteria: <Utensils className="w-4 h-4 text-[#176B5B]" />,
  gym: <Dumbbell className="w-4 h-4 text-[#176B5B]" />,
  playground: <Sun className="w-4 h-4 text-[#176B5B]" />,
  classrooms_g1: <GraduationCap className="w-4 h-4 text-[#176B5B]" />,
  classrooms_g2: <Building className="w-4 h-4 text-[#176B5B]" />,
  admin_office: <ShieldCheck className="w-4 h-4 text-[#176B5B]" />,
  prayer_room: <Moon className="w-4 h-4 text-[#176B5B]" />,
};

export default function QRModal({ isOpen, onClose }: QRModalProps) {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<string>('science_lab');

  if (!isOpen) return null;

  const activeLoc = SCHOOL_LOCATIONS.find((l) => l.id === selectedLocation) || SCHOOL_LOCATIONS[0];

  const handleSimulateScan = (locId: string) => {
    onClose();
    router.push(`/report?type=found&location=${locId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-white border border-[#E4E7E4] rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-[#F1F3F0] hover:bg-[#E4E7E4] text-[#18201D] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-right space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1ED] text-[#176B5B] text-xs font-bold">
            <QrCode className="w-3.5 h-3.5" />
            <span>نقاط QR المدرسية</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D]">
            ملصقات الباركود في مرافق المدرسة
          </h2>
          <p className="text-xs text-[#66706B]">
            عند مسح ملصق QR المعلق بأي مرفق، يفتح النموذج وموقع الغرض محدد تلقائياً.
          </p>
        </div>

        {/* Poster & Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          
          {/* Poster Graphic Card */}
          <div className="bg-[#F1F3F0] rounded-2xl p-4 flex flex-col items-center text-center border border-[#E4E7E4]">
            <div className="w-full flex items-center justify-between border-b border-[#E4E7E4] pb-2 mb-2">
              <span className="text-[10px] font-bold text-[#66706B] tracking-wider uppercase">
                FindIt POINT
              </span>
              <span className="text-[10px] text-[#176B5B] font-bold">نقطة أمانات</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-white shadow-2xs">
                {locationIcons[activeLoc.id]}
              </div>
              <div className="text-right">
                <h4 className="font-bold text-[#18201D] text-xs">{activeLoc.name}</h4>
                <p className="text-[10px] text-[#66706B]">{activeLoc.building}</p>
              </div>
            </div>

            {/* QR Graphic */}
            <div className="p-2 bg-white rounded-xl shadow-2xs border border-[#E4E7E4] my-1">
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

            {/* Direct URL Preview */}
            <div className="w-full mt-1 px-2 py-1 rounded-lg bg-white/80 border border-[#E4E7E4] text-[9px] text-[#66706B] font-mono truncate text-center dir-ltr">
              https://app.findit-us.workers.dev/report?type=found&location={activeLoc.id}
            </div>

            <button
              onClick={() => handleSimulateScan(activeLoc.id)}
              className="mt-2 w-full py-2 px-3 rounded-xl bg-[#176B5B] hover:bg-[#125648] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>محاكاة مسح الباركود</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Location Picker */}
          <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
            <span className="block text-xs font-bold text-[#18201D] mb-1 text-right">
              اختر موقعاً للمعاينة:
            </span>
            {SCHOOL_LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-all border ${
                    isSelected
                      ? 'bg-[#18201D] border-[#18201D] text-white'
                      : 'bg-white border-[#E4E7E4] text-[#66706B] hover:bg-[#F1F3F0] hover:text-[#18201D]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-white/20">
                      {locationIcons[loc.id]}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{loc.name}</p>
                      <p className="text-[10px] opacity-70">{loc.building}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                      محدد
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
