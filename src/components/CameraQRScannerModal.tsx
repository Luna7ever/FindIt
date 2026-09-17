'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  X, 
  QrCode, 
  MapPin, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { SCHOOL_LOCATIONS } from '@/lib/constants';
import { SchoolLocationId } from '@/types';
import { useApp } from '@/context/AppContext';

interface CameraQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationScanned?: (locationId: SchoolLocationId) => void;
}

export default function CameraQRScannerModal({
  isOpen,
  onClose,
  onLocationScanned,
}: CameraQRScannerModalProps) {
  const router = useRouter();
  const { addToast, dir, language } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SchoolLocationId | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isMounted) {
            setHasCamera(false);
            setCameraError(language === 'en' ? 'Direct camera access is not supported in this browser' : 'المتصفح لا يدعم الوصول المباشر للكاميرا في هذا الوضع');
          }
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCamera(true);
      } catch (err) {
        if (isMounted) {
          setHasCamera(false);
          setCameraError(language === 'en' ? 'Camera permission was not granted. You can use the instant room picker below.' : 'لم يتم منح إذن الكاميرا أو لا توجد كاميرا متصلة. يمكنك استخدام محاكي المسح بالأسفل.');
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode, language]);

  if (!isOpen) return null;

  const handleSelectLocation = (locId: SchoolLocationId) => {
    setSelectedLocation(locId);
    const loc = SCHOOL_LOCATIONS.find((l) => l.id === locId);
    addToast(language === 'en' ? 'QR Scanned' : 'تم مسح الرمز', `${language === 'en' ? 'Identified location: ' : 'تم التعرف على مرفق: '}${loc?.name}`, 'success');
  };

  const handleAction = (type: 'explore' | 'report') => {
    if (!selectedLocation) return;
    onClose();
    if (onLocationScanned) {
      onLocationScanned(selectedLocation);
    } else if (type === 'explore') {
      router.push(`/explore?location=${selectedLocation}`);
    } else {
      router.push(`/report?location=${selectedLocation}`);
    }
  };

  const selectedLocationObj = SCHOOL_LOCATIONS.find((l) => l.id === selectedLocation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in" dir={dir}>
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#15201D] border border-slate-200 dark:border-[#263834] rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-[#18201D] dark:text-[#F1F5F3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263834] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2DD4BF] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#18201D] dark:text-white leading-tight">
                {language === 'en' ? 'Live Camera QR Scanner' : 'الماسح الذكي لرموز QR المدرسية'}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Scan posters on room doors for instant location matching' : 'امسح ملصقات الباركود على أبواب القاعات لمعرفة المعثورات فوراً'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C2B27] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="my-4 relative rounded-2xl bg-slate-950 overflow-hidden aspect-video flex items-center justify-center shrink-0 border border-slate-800">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Target Box Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-dashed border-emerald-400/80 rounded-2xl relative flex items-center justify-center animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 left-2" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-2 left-2" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-2 right-2" />
              <span className="text-[10px] text-emerald-200 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                {language === 'en' ? 'Align QR Poster' : 'وجّه الكاميرا نحو ملصق QR'}
              </span>
            </div>
          </div>

          {/* Switch Camera Button */}
          <button
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            className="absolute bottom-3 left-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Flip' : 'تبديل الكاميرا'}</span>
          </button>
        </div>

        {/* Quick Simulator Picker */}
        <div className="space-y-3 overflow-y-auto flex-1 text-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'en' ? 'Select School Facility:' : 'أو اختر المرفق المدرسي مباشرة للمحاكاة:'}
            </span>
            {selectedLocation && (
              <span className="text-[10px] text-[#176B5B] dark:text-[#2DD4BF] font-black">
                {language === 'en' ? 'Selected' : 'تم التحديد'} ✓
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {SCHOOL_LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc.id)}
                  className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-[#122823] border-[#176B5B] dark:border-[#2DD4BF] text-[#176B5B] dark:text-[#2DD4BF] font-black shadow-2xs'
                      : 'bg-slate-50 dark:bg-[#1C2B27] border-slate-200 dark:border-[#2D3E3A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#253934]'
                  }`}
                >
                  <p className="font-bold text-xs truncate">{loc.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{loc.floor}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Footer */}
        {selectedLocation && (
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#263834] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={() => handleAction('explore')}
              className="w-full sm:flex-1 py-3 sm:py-2.5 min-h-[44px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Explore Lost & Found Here' : 'استعراض مفقودات هذا المكان'}</span>
            </button>
            <button
              onClick={() => handleAction('report')}
              className="w-full sm:flex-1 py-3 sm:py-2.5 min-h-[44px] rounded-xl bg-slate-100 dark:bg-[#1C2B27] hover:bg-slate-200 dark:hover:bg-[#253934] text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Report Item at this Room' : 'تسجيل بلاغ في هذا المرفق'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
