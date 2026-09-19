'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SCHOOL_LOCATIONS } from '@/lib/constants';
import { useApp } from '@/context/AppContext';
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
  science_lab: <FlaskConical className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />,
  library: <Library className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />,
  cafeteria: <Utensils className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />,
  gym: <Dumbbell className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />,
  playground: <Sun className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />,
  classrooms_g1: <GraduationCap className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />,
  classrooms_g2: <Building className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />,
  admin_office: <ShieldCheck className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />,
  prayer_room: <Moon className="w-4 h-4 text-[#176B5B] dark:text-[#2DD4BF]" />,
};

export default function QRModal({ isOpen, onClose }: QRModalProps) {
  const router = useRouter();
  const { dir, language } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<string>('science_lab');

  if (!isOpen) return null;

  const activeLoc = SCHOOL_LOCATIONS.find((l) => l.id === selectedLocation) || SCHOOL_LOCATIONS[0];

  const handleSimulateScan = (locId: string) => {
    onClose();
    router.push(`/report?type=found&location=${locId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in" dir={dir}>
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-[#18201D] dark:text-[#F1F5F3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 end-4 sm:end-5 p-2 rounded-full bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#253934] text-[#18201D] dark:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-start space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1ED] dark:bg-[#122B25] text-[#176B5B] dark:text-[#2DD4BF] text-xs font-bold">
            <QrCode className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'School QR Posters' : 'نقاط QR المدرسية'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#18201D] dark:text-white">
            {language === 'en' ? 'Printable QR Location Codes' : 'ملصقات الباركود في مرافق المدرسة'}
          </h2>
          <p className="text-xs text-[#66706B] dark:text-[#94A39D]">
            {language === 'en' ? 'Scanning the room QR code pre-selects the exact facility in the report form.' : 'عند مسح ملصق QR المعلق بأي مرفق، يفتح النموذج وموقع الغرض محدد تلقائياً.'}
          </p>
        </div>

        {/* Poster & Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          
          {/* Poster Graphic Card */}
          <div className="bg-[#F1F3F0] dark:bg-[#1C2B27] rounded-2xl p-4 flex flex-col items-center text-center border border-[#E4E7E4] dark:border-[#2D3E3A]">
            <div className="w-full flex items-center justify-between border-b border-[#E4E7E4] dark:border-[#2D3E3A] pb-2 mb-2">
              <span className="text-[10px] font-bold text-[#66706B] dark:text-[#94A39D] tracking-wider uppercase">
                ETHOS POINT
              </span>
              <span className="text-[10px] text-[#176B5B] dark:text-[#2DD4BF] font-bold">
                {language === 'en' ? 'Custody Station' : 'نقطة أمانات'}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-white dark:bg-[#15201D] shadow-2xs">
                {locationIcons[activeLoc.id]}
              </div>
              <div className="text-start">
                <h4 className="font-bold text-[#18201D] dark:text-white text-xs">{activeLoc.name}</h4>
                <p className="text-[10px] text-[#66706B] dark:text-[#94A39D]">{activeLoc.building}</p>
              </div>
            </div>

            {/* Generated QR Box */}
            <div className="p-3 bg-white dark:bg-white rounded-xl shadow-xs border border-slate-200 my-1">
              <QrCode className="w-24 h-24 text-[#18201D]" />
            </div>

            <span className="text-[9px] text-[#66706B] dark:text-[#94A39D] font-mono mt-1">
              SCAN-LOC-{activeLoc.id.toUpperCase()}
            </span>
          </div>

          {/* Location Selector List */}
          <div className="space-y-2 text-start">
            <span className="text-xs font-bold text-[#18201D] dark:text-white block">
              {language === 'en' ? 'Select Location to Preview:' : 'اختر المرفق للمعاينة:'}
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {SCHOOL_LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  className={`w-full p-2 rounded-xl text-start text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedLocation === loc.id
                      ? 'bg-[#E6F1ED] dark:bg-[#122B25] text-[#176B5B] dark:text-[#2DD4BF] font-bold'
                      : 'hover:bg-[#F1F3F0] dark:hover:bg-[#1C2B27] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {locationIcons[loc.id]}
                    <span className="truncate">{loc.name}</span>
                  </div>
                  {selectedLocation === loc.id && (
                    <span className="w-2 h-2 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF]" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSimulateScan(selectedLocation)}
              className="w-full py-2.5 rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Simulate Scanning this QR' : 'محاكاة مسح هذا الرمز الآن'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
