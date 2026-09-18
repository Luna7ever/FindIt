'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ItemCategory, VisualFeatures } from '@/types';
import {
  DEMO_PRESETS,
  processBrowserImage,
  DemoPreset,
} from '@/lib/vision/edgeVisionEngine';
import { getLocalizedColorName } from '@/lib/i18n/seedDataTranslations';
import {
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  X,
  Cpu,
  Layers,
  Tag,
  Hash,
  UserCheck,
  Check,
  RotateCw,
} from 'lucide-react';

export interface AutofillPayload {
  title?: string;
  category?: ItemCategory;
  color?: string;
  brand?: string;
  description?: string;
  imageUrl?: string;
  visualFeatures?: VisualFeatures;
  ocrText?: string;
  isAiVerified?: boolean;
}

interface EdgeVisionDropzoneProps {
  onAutofill?: (data: AutofillPayload) => void;
  onImageSelected?: (dataUrl: string, features?: VisualFeatures) => void;
  currentImageUrl?: string;
}

export default function EdgeVisionDropzone({
  onAutofill,
  onImageSelected,
  currentImageUrl,
}: EdgeVisionDropzoneProps) {
  const { language, t, dir } = useApp();
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [features, setFeatures] = useState<VisualFeatures | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number>(18);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAutofillApplied, setIsAutofillApplied] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (currentImageUrl && !previewUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl, previewUrl]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          language === 'en'
            ? 'Direct camera access is not supported in this browser. Please use file upload or demo presets.'
            : 'المتصفح لا يدعم الوصول المباشر للكاميرا. يرجى رفع ملف أو استخدام النماذج التجريبية.'
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      setCameraError(
        language === 'en'
          ? 'Camera permission denied or camera unavailable. Please upload a photo or pick a demo preset.'
          : 'لم يتم منح إذن الكاميرا أو لا توجد كاميرا متصلة. يرجى رفع صورة أو اختيار نموذج تجريبي.'
      );
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleCaptureSnapshot = async () => {
    if (!videoRef.current) return;

    try {
      setIsProcessing(true);
      const startTime = performance.now();
      const video = videoRef.current;
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = video.videoWidth || 640;
      snapCanvas.height = video.videoHeight || 480;

      const snapCtx = snapCanvas.getContext('2d');
      if (snapCtx) {
        snapCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
      }

      const rawDataUrl = snapCanvas.toDataURL('image/jpeg', 0.85);
      handleStopCamera();

      // Process through edge vision engine
      const { dataUrl, features: extracted } = await processBrowserImage(rawDataUrl);
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed || 18);

      setPreviewUrl(dataUrl);
      setFeatures(extracted);
      setActivePresetId(null);
      setIsAutofillApplied(false);

      if (onImageSelected) {
        onImageSelected(dataUrl, extracted);
      }
    } catch (err) {
      console.error('Error capturing camera image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert(language === 'en' ? 'Please select an image file' : 'يرجى اختيار ملف صورة صالح');
      return;
    }

    try {
      setIsProcessing(true);
      const startTime = performance.now();
      const { dataUrl, features: extracted } = await processBrowserImage(file);
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed || 22);

      setPreviewUrl(dataUrl);
      setFeatures(extracted);
      setActivePresetId(null);
      setIsAutofillApplied(false);

      if (onImageSelected) {
        onImageSelected(dataUrl, extracted);
      }
    } catch (err) {
      console.error('Error processing image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetSelect = (preset: DemoPreset) => {
    setActivePresetId(preset.id);
    setPreviewUrl(preset.dataUrl);
    setFeatures(preset.features);
    setLatencyMs(12);
    setIsAutofillApplied(false);

    if (onImageSelected) {
      onImageSelected(preset.dataUrl, preset.features);
    }
  };

  const handleApplyAutofill = () => {
    if (!features && !activePresetId) return;

    let payload: AutofillPayload = {
      imageUrl: previewUrl,
      visualFeatures: features || undefined,
      isAiVerified: true,
    };

    if (activePresetId) {
      const preset = DEMO_PRESETS.find((p) => p.id === activePresetId);
      if (preset) {
        payload = {
          title: preset.title,
          category: preset.category,
          color: preset.color,
          brand: preset.brand,
          description: preset.description,
          ocrText: preset.ocrText,
          imageUrl: preset.dataUrl,
          visualFeatures: preset.features,
          isAiVerified: true,
        };
      }
    } else if (features) {
      const primaryColor = features.dominantColors[0];
      const detectedEntities = features.ocr?.entities || {};

      let suggestedColor = 'أسود';
      if (primaryColor) {
        if (primaryColor.name === 'blue') suggestedColor = 'أزرق';
        else if (primaryColor.name === 'gray') suggestedColor = 'فضي / رمادي';
        else if (primaryColor.name === 'white') suggestedColor = 'أبيض';
        else if (primaryColor.name === 'navy') suggestedColor = 'كحلي';
        else if (primaryColor.name === 'green') suggestedColor = 'أخضر';
        else if (primaryColor.name === 'red') suggestedColor = 'أحمر';
        else if (primaryColor.name === 'brown') suggestedColor = 'بني';
        else if (primaryColor.name === 'purple') suggestedColor = 'أخرى';
      }

      let detectedTitle = '';
      if (detectedEntities.brand && detectedEntities.model) {
        detectedTitle = `${detectedEntities.brand} ${detectedEntities.model}`;
      } else if (detectedEntities.brand) {
        detectedTitle = `${detectedEntities.brand}`;
      } else if (features.detectedText) {
        detectedTitle = features.detectedText.slice(0, 40);
      }

      let suggestedCategory: ItemCategory = 'electronics';
      if (detectedEntities.brand === 'Hydro Flask' || detectedEntities.brand === 'Stanley' || detectedEntities.brand === 'Contigo') {
        suggestedCategory = 'bottles';
      } else if (detectedEntities.brand === 'Nike' || detectedEntities.brand === 'Adidas' || detectedEntities.brand === 'JanSport') {
        suggestedCategory = 'bags';
      } else if (detectedEntities.brand === 'Faber-Castell' || detectedEntities.brand === 'Staedtler' || detectedEntities.brand === 'Pilot') {
        suggestedCategory = 'stationery';
      }

      const descParts: string[] = [];
      if (detectedEntities.brand) descParts.push(`الماركة: ${detectedEntities.brand}`);
      if (detectedEntities.model) descParts.push(`الموديل: ${detectedEntities.model}`);
      if (detectedEntities.serialNumber) descParts.push(`الرقم التسلسلي: ${detectedEntities.serialNumber}`);
      if (detectedEntities.studentName) descParts.push(`اسم الطالب المدون: ${detectedEntities.studentName}`);

      payload = {
        title: detectedTitle || undefined,
        category: suggestedCategory,
        color: suggestedColor,
        brand: detectedEntities.brand || undefined,
        description: descParts.join(' - ') || undefined,
        ocrText: features.detectedText || undefined,
        imageUrl: previewUrl,
        visualFeatures: features,
        isAiVerified: true,
      };
    }

    if (onAutofill) {
      onAutofill(payload);
      setIsAutofillApplied(true);
      setTimeout(() => setIsAutofillApplied(false), 3000);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl('');
    setFeatures(null);
    setActivePresetId(null);
    setIsAutofillApplied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageSelected) {
      onImageSelected('', undefined);
    }
  };

  return (
    <div className="space-y-4 bg-gradient-to-b from-white to-slate-50 dark:from-[#15201D] dark:to-[#121B19] p-4 sm:p-5 rounded-3xl border border-[#E4E7E4] dark:border-[#263834] shadow-xs" dir={dir}>
      {/* Header & Edge AI Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-[#18201D] dark:text-white">
              {t('report.aiVisionTitle') || (language === 'en' ? 'Edge AI Vision & OCR Ingestion' : 'التحليل البصري الذكي للغرض')}
            </h3>
          </div>
          <p className="text-[11px] text-[#66706B] dark:text-[#94A39D] leading-relaxed">
            {t('report.aiVisionDesc') || (language === 'en' ? 'Upload or snap a photo for instant on-device color, brand, and serial detection.' : 'ارفع أو التقط صورة ليتم التعرف على اللون والماركة والنصوص فورياً.')}
          </p>
        </div>

        <span className="shrink-0 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          <span>Edge AI</span>
        </span>
      </div>

      {/* Preset Demo Strip */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <span>{t('report.demoPresets') || (language === 'en' ? 'Quick Demo Samples:' : 'نماذج تجريبية سريعة:')}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            {language === 'en' ? 'Zero Server Calls' : 'معالجة طرفية 100%'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DEMO_PRESETS.map((p) => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center truncate ${
                  isSelected
                    ? 'border-[#176B5B] dark:border-[#2DD4BF] bg-[#E6F1ED] dark:bg-[#122823] text-[#176B5B] dark:text-[#2DD4BF] shadow-xs'
                    : 'border-[#E4E7E4] dark:border-[#2D3E3A] bg-white dark:bg-[#1C2B27] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#253934]'
                }`}
              >
                {p.id === 'casio' && (t('report.presetCasio') || p.name)}
                {p.id === 'bottle' && (t('report.presetBottle') || p.name)}
                {p.id === 'bag' && (t('report.presetBag') || p.name)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Live Viewfinder Mode */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 shadow-md">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-56 object-cover"
          />

          {cameraError && (
            <div className="absolute inset-0 bg-black/85 p-4 flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-xs text-rose-300 font-bold max-w-xs">{cameraError}</p>
              <button
                type="button"
                onClick={handleStopCamera}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold"
              >
                {t('report.cameraClose') || (language === 'en' ? 'Close Camera' : 'إلغاء الكاميرا')}
              </button>
            </div>
          )}

          {!cameraError && (
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={isProcessing}
                className="px-5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>{t('report.cameraSnap') || (language === 'en' ? 'Take Snapshot' : 'التقاط الصورة')}</span>
              </button>

              <button
                type="button"
                onClick={handleStopCamera}
                className="px-3 py-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white font-bold text-xs cursor-pointer"
              >
                {t('report.cameraClose') || (language === 'en' ? 'Cancel' : 'إلغاء')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload & Dropzone Area (When camera is inactive and no image or replacing) */}
      {!isCameraActive && !previewUrl && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) handleFileChange(droppedFile);
          }}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-[#E4E7E4] dark:border-[#2D3E3A] hover:border-emerald-400 dark:hover:border-emerald-600 bg-white/60 dark:bg-[#15201D]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-[#1C2B27] text-slate-500 dark:text-slate-400">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-[#18201D] dark:text-white">
                {t('report.dropOrBrowse') || (language === 'en' ? 'Drag & drop image here or click to browse' : 'اسحب وأفلت الصورة هنا أو اضغط للاختيار')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'JPG, PNG, WebP up to 10MB (Processed on device)' : 'JPG أو PNG حتى 10MB (تتم المعالجة بالكامل داخل جهازك)'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1C2B27] hover:bg-slate-200 dark:hover:bg-[#253934] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Browse Files' : 'اختيار من الجهاز'}
              </button>

              <button
                type="button"
                onClick={handleStartCamera}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-[#122823] hover:bg-emerald-100 dark:hover:bg-[#1A3831] text-[#176B5B] dark:text-[#2DD4BF] text-xs font-bold border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t('report.cameraCapture') || (language === 'en' ? 'Snap Camera' : 'التقاط بالكاميرا')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state during edge processing */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#122823] border border-emerald-200 dark:border-[#1E463D] flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <RotateCw className="w-4 h-4 animate-spin" />
          <span>{t('report.analyzing') || (language === 'en' ? 'Analyzing on-device (<30ms)...' : 'جارِ التحليل الطرفي المباشر (<30ms)...')}</span>
        </div>
      )}

      {/* Preview & Visual Inspection Details (When preview is present) */}
      {!isCameraActive && previewUrl && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#1C2B27] border border-[#E4E7E4] dark:border-[#2D3E3A]">
            {/* Thumbnail Preview */}
            <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-[#3F3F46]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded item preview"
                className="w-full h-full object-contain p-1"
              />
              <button
                type="button"
                onClick={handleClearImage}
                title={t('report.removeImage') || (language === 'en' ? 'Remove Image' : 'إزالة الصورة')}
                aria-label={t('report.removeImage') || (language === 'en' ? 'Remove Image' : 'إزالة الصورة')}
                className="absolute top-1 end-1 min-w-[40px] min-h-[40px] rounded-lg bg-black/70 hover:bg-black text-white transition-colors cursor-pointer flex items-center justify-center shadow-xs z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Verified Badge & Processing Speed */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-[#E6F1ED] dark:bg-[#122823] border border-[#176B5B]/30 dark:border-[#2DD4BF]/40 text-[#176B5B] dark:text-[#2DD4BF] font-black text-xs flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('report.aiVerifiedBadge') || (language === 'en' ? 'Edge AI Verified' : 'تم الفحص بالذكاء الاصطناعي الطرفي')}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {latencyMs}ms on-device
                </span>
              </div>

              {/* Detected Dominant Colors */}
              {features?.dominantColors && features.dominantColors.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {t('report.detectedColors') || (language === 'en' ? 'Colors:' : 'الألوان:')}
                  </span>
                  {features.dominantColors.map((col, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-[#3F3F46] bg-slate-50 dark:bg-[#15201D] text-[10px] font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{getLocalizedColorName(col.name, language)}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                        {col.percentage}%
                      </span>
                    </span>
                  ))}
                </div>
              )}

              {/* Detected OCR Badges */}
              {features?.ocr?.entities && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {features.ocr.entities.brand && (
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{features.ocr.entities.brand}</span>
                    </span>
                  )}
                  {features.ocr.entities.model && (
                    <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5" />
                      <span>{features.ocr.entities.model}</span>
                    </span>
                  )}
                  {features.ocr.entities.serialNumber && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      <span>SN: {features.ocr.entities.serialNumber}</span>
                    </span>
                  )}
                  {features.ocr.entities.studentName && (
                    <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1">
                      <UserCheck className="w-2.5 h-2.5" />
                      <span>{features.ocr.entities.studentName}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* One-Click Autofill Action Button */}
          <button
            type="button"
            onClick={handleApplyAutofill}
            className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              isAutofillApplied
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-slate-950'
            }`}
          >
            {isAutofillApplied ? (
              <>
                <Check className="w-4 h-4" />
                <span>{language === 'en' ? 'AI Suggestions Applied to Form! ✓' : 'تم تطبيق اقتراحات الذكاء الاصطناعي بنجاح! ✓'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t('report.aiAutofillBtn') || (language === 'en' ? 'Apply AI Autofill to Report Form' : 'تطبيق اقتراحات الذكاء الاصطناعي على النموذج')}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
