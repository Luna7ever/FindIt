import { VisualFeatures, DominantColor, ShapeVector } from '@/types';
import {
  extractColorHistogram,
  extractDominantColors,
  ImageBufferData,
  CANONICAL_PALETTE,
} from './colorAnalysis';
import { extractShapeVector } from './shapeAnalysis';
import { parseOcrText } from './ocrParser';

export interface DemoPreset {
  id: string;
  name: string;
  title: string;
  category: 'electronics' | 'bottles' | 'bags';
  color: string;
  brand: string;
  description: string;
  ocrText: string;
  dataUrl: string;
  features: VisualFeatures;
}

// 1. Interactive Demo Preset 1: Casio fx-991EX Scientific Calculator
const CASIO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="calcBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#27272A"/>
      <stop offset="100%" stop-color="#18181B"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#C5D3C1"/>
      <stop offset="100%" stop-color="#A7BAA2"/>
    </linearGradient>
    <linearGradient id="solarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4A2810"/>
      <stop offset="100%" stop-color="#6B3A18"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="#0D1412"/>
  <rect x="90" y="30" width="220" height="340" rx="24" fill="url(#calcBody)" stroke="#3F3F46" stroke-width="3"/>
  <rect x="110" y="55" width="80" height="18" rx="4" fill="#09090B"/>
  <text x="115" y="68" fill="#F4F4F5" font-family="sans-serif" font-size="11" font-weight="900" letter-spacing="1">CASIO</text>
  <text x="155" y="68" fill="#A1A1AA" font-family="sans-serif" font-size="8" font-weight="700">CLASSWIZ</text>
  <text x="260" y="68" fill="#E4E4E7" font-family="sans-serif" font-size="9" font-weight="800">fx-991EX</text>
  <!-- Solar Panel -->
  <rect x="210" y="55" width="40" height="16" rx="2" fill="url(#solarGrad)" stroke="#78350F" stroke-width="1"/>
  <!-- LCD Screen -->
  <rect x="110" y="82" width="180" height="60" rx="8" fill="url(#screenGrad)" stroke="#52525B" stroke-width="2"/>
  <text x="120" y="102" fill="#1C1917" font-family="monospace" font-size="13" font-weight="bold">f(x)=2x²-4x+1</text>
  <text x="210" y="132" fill="#1C1917" font-family="monospace" font-size="16" font-weight="bold">x=1±(√2)/2</text>
  <!-- Navigation Replay Wheel -->
  <circle cx="200" cy="165" r="18" fill="#3F3F46" stroke="#71717A" stroke-width="2"/>
  <circle cx="200" cy="165" r="8" fill="#18181B"/>
  <!-- Function Keys -->
  <rect x="115" y="155" width="22" height="12" rx="4" fill="#52525B"/>
  <rect x="145" y="155" width="22" height="12" rx="4" fill="#52525B"/>
  <rect x="233" y="155" width="22" height="12" rx="4" fill="#52525B"/>
  <rect x="263" y="155" width="22" height="12" rx="4" fill="#52525B"/>
  <!-- Scientific Grid Buttons -->
  <g fill="#3F3F46" stroke="#27272A" stroke-width="1">
    <rect x="115" y="185" width="26" height="16" rx="4"/><rect x="149" y="185" width="26" height="16" rx="4"/><rect x="183" y="185" width="26" height="16" rx="4"/><rect x="217" y="185" width="26" height="16" rx="4"/><rect x="251" y="185" width="26" height="16" rx="4"/>
    <rect x="115" y="208" width="26" height="16" rx="4"/><rect x="149" y="208" width="26" height="16" rx="4"/><rect x="183" y="208" width="26" height="16" rx="4"/><rect x="217" y="208" width="26" height="16" rx="4"/><rect x="251" y="208" width="26" height="16" rx="4"/>
    <rect x="115" y="231" width="26" height="16" rx="4"/><rect x="149" y="231" width="26" height="16" rx="4"/><rect x="183" y="231" width="26" height="16" rx="4"/><rect x="217" y="231" width="26" height="16" rx="4"/><rect x="251" y="231" width="26" height="16" rx="4"/>
  </g>
  <!-- Numeric Keypad -->
  <g fill="#F4F4F5">
    <rect x="115" y="260" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="128" y="275" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">7</text>
    <rect x="157" y="260" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="170" y="275" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">8</text>
    <rect x="199" y="260" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="212" y="275" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">9</text>
    <rect x="241" y="260" width="36" height="20" rx="5" fill="#DC2626"/><text x="248" y="275" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold">DEL</text>
    
    <rect x="115" y="287" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="128" y="302" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">4</text>
    <rect x="157" y="287" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="170" y="302" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">5</text>
    <rect x="199" y="287" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="212" y="302" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">6</text>
    <rect x="241" y="287" width="36" height="20" rx="5" fill="#DC2626"/><text x="250" y="302" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold">AC</text>

    <rect x="115" y="314" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="128" y="329" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">1</text>
    <rect x="157" y="314" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="170" y="329" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">2</text>
    <rect x="199" y="314" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="212" y="329" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">3</text>
    <rect x="241" y="314" width="36" height="20" rx="5" fill="#52525B"/><text x="255" y="329" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold">×</text>

    <rect x="115" y="341" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="128" y="356" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">0</text>
    <rect x="157" y="341" width="34" height="20" rx="5" fill="#E4E4E7"/><text x="171" y="356" fill="#18181B" font-family="sans-serif" font-size="12" font-weight="bold">.</text>
    <rect x="199" y="341" width="78" height="20" rx="5" fill="#16A34A"/><text x="234" y="356" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">=</text>
  </g>
  <!-- Serial Number & Student Label Tag -->
  <rect x="95" y="358" width="100" height="10" rx="2" fill="#09090B"/>
  <text x="98" y="366" fill="#A1A1AA" font-family="monospace" font-size="6">SN-884291 ملك محمد</text>
</svg>`;

// 2. Interactive Demo Preset 2: Blue Hydro Flask Sports Bottle
const BOTTLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bottleBlue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1D4ED8"/>
      <stop offset="35%" stop-color="#3B82F6"/>
      <stop offset="70%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1E40AF"/>
    </linearGradient>
    <linearGradient id="steelRim" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="#0D1412"/>
  <!-- Cap Handle Strap -->
  <path d="M 160 50 C 160 25, 240 25, 240 50" fill="none" stroke="#0F172A" stroke-width="16" stroke-linecap="round"/>
  <!-- Black Flex Cap -->
  <rect x="165" y="48" width="70" height="28" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
  <rect x="172" y="76" width="56" height="12" fill="#334155"/>
  <!-- Stainless Steel Lip -->
  <rect x="168" y="88" width="64" height="8" rx="2" fill="url(#steelRim)"/>
  <!-- Bottle Main Body -->
  <path d="M 160 110 C 150 120, 140 135, 140 160 L 140 330 C 140 355, 155 365, 200 365 C 245 365, 260 355, 260 330 L 260 160 C 260 135, 250 120, 240 110 Z" fill="url(#bottleBlue)" stroke="#1E3A8A" stroke-width="2"/>
  <!-- Hydro Flask Silhouette Icon -->
  <circle cx="200" cy="180" r="8" fill="#FFFFFF"/>
  <path d="M 195 192 L 205 192 L 202 212 L 198 212 Z" fill="#FFFFFF"/>
  <path d="M 188 200 Q 200 196 212 200" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <!-- Logo Wordmark -->
  <text x="200" y="240" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle" letter-spacing="2">Hydro Flask</text>
  <text x="200" y="258" fill="#93C5FD" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">24 OZ · WIDE MOUTH</text>
  <text x="200" y="335" fill="#BFDBFE" font-family="monospace" font-size="7" text-anchor="middle">SN-HF8821 · PROPERTY OF SARA</text>
</svg>`;

// 3. Interactive Demo Preset 3: Nike Black Backpack
const BAG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bagBlack" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#262626"/>
      <stop offset="100%" stop-color="#171717"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="#0D1412"/>
  <!-- Top Carry Handle -->
  <path d="M 170 65 C 170 40, 230 40, 230 65" fill="none" stroke="#404040" stroke-width="12" stroke-linecap="round"/>
  <!-- Main Backpack Contour -->
  <path d="M 140 100 C 140 65, 260 65, 260 100 L 280 320 C 280 350, 260 360, 200 360 C 140 360, 120 350, 120 320 Z" fill="url(#bagBlack)" stroke="#404040" stroke-width="3"/>
  <!-- Front Zipper Pocket -->
  <path d="M 135 210 C 135 190, 265 190, 265 210 L 270 330 C 270 350, 250 355, 200 355 C 150 355, 130 350, 130 330 Z" fill="#1F1F1F" stroke="#525252" stroke-width="2"/>
  <!-- Zipper Track -->
  <path d="M 145 210 L 255 210" stroke="#737373" stroke-width="3" stroke-dasharray="4,2"/>
  <circle cx="200" cy="210" r="6" fill="#A3A3A3"/>
  <!-- Nike Swoosh -->
  <path d="M 165 260 C 185 270, 215 270, 240 240 C 220 252, 195 255, 178 252 Z" fill="#FFFFFF"/>
  <text x="200" y="295" fill="#E5E5E5" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="3">NIKE</text>
  <!-- Student Tag -->
  <rect x="160" y="325" width="80" height="16" rx="4" fill="#09090B" stroke="#262626"/>
  <text x="200" y="336" fill="#A3A3A3" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">الطالب: فهد المطيري</text>
</svg>`;

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'casio',
    name: 'Casio fx-991EX',
    title: 'حاسبة كاسيو علمية fx-991EX',
    category: 'electronics',
    color: 'أسود',
    brand: 'Casio',
    description: 'حاسبة كاسيو علمية ClassWiz سوداء مع غطاء حماية وشاشة LCD واضحة ورقم تسلسلي SN-884291',
    ocrText: 'CASIO fx-991EX CLASSWIZ NATURAL-V.P.A.M. SN-884291 ملك محمد',
    dataUrl: svgToDataUrl(CASIO_SVG),
    features: {
      dominantColors: [
        { name: 'black', rgb: [24, 24, 27], hex: '#18181B', percentage: 76 },
        { name: 'gray', rgb: [100, 116, 139], hex: '#64748B', percentage: 24 },
      ],
      colorHistogram: [0.76, 0.0, 0.24, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      detectedText: 'CASIO fx-991EX CLASSWIZ SN-884291 ملك محمد',
      ocr: {
        rawText: 'CASIO fx-991EX CLASSWIZ NATURAL-V.P.A.M. SN-884291 ملك محمد',
        normalizedTokens: ['casio', 'fx-991ex', 'classwiz', 'sn-884291', 'ملك', 'محمد'],
        entities: {
          brand: 'Casio',
          model: 'FX-991EX',
          serialNumber: 'SN-884291',
          studentName: 'ملك محمد',
        },
        confidence: 0.96,
      },
      shape: {
        aspectRatio: 0.55,
        solidity: 0.85,
        edgeComplexity: 68.4,
      },
      processedAt: '2026-09-17T07:40:00.000Z',
    },
  },
  {
    id: 'bottle',
    name: 'Blue Hydro Flask',
    title: 'قارورة ماء رياضية زرقاء Hydro Flask',
    category: 'bottles',
    color: 'أزرق',
    brand: 'Hydro Flask',
    description: 'مطارة ماء رياضية زرقاء سعة 750 مل مع غطاء أسود ورقم تعريفي SN-HF8821',
    ocrText: 'Hydro Flask 24 OZ (710 ML) WIDE MOUTH SN-HF8821 PROPERTY OF SARA',
    dataUrl: svgToDataUrl(BOTTLE_SVG),
    features: {
      dominantColors: [
        { name: 'blue', rgb: [37, 99, 235], hex: '#2563EB', percentage: 82 },
        { name: 'black', rgb: [24, 24, 27], hex: '#18181B', percentage: 18 },
      ],
      colorHistogram: [0.18, 0.82, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      detectedText: 'Hydro Flask 24 OZ WIDE MOUTH SN-HF8821 PROPERTY OF SARA',
      ocr: {
        rawText: 'Hydro Flask 24 OZ (710 ML) WIDE MOUTH SN-HF8821 PROPERTY OF SARA',
        normalizedTokens: ['hydro', 'flask', 'wide', 'mouth', 'sn-hf8821', 'sara'],
        entities: {
          brand: 'Hydro Flask',
          serialNumber: 'SN-HF8821',
          studentName: 'SARA',
        },
        confidence: 0.92,
      },
      shape: {
        aspectRatio: 0.38,
        solidity: 0.72,
        edgeComplexity: 18.2,
      },
      processedAt: '2026-09-17T07:41:00.000Z',
    },
  },
  {
    id: 'bag',
    name: 'Nike Black Bag',
    title: 'حقيبة ظهر مدرسية سوداء Nike',
    category: 'bags',
    color: 'أسود',
    brand: 'Nike',
    description: 'حقيبة ظهر مدرسية سوداء نايكي مع جيوب أمامية وعلامة باسم الطالب: فهد المطيري',
    ocrText: 'NIKE JUST DO IT CLASSIC BACKPACK S/N: NK-90214 الطالب: فهد المطيري',
    dataUrl: svgToDataUrl(BAG_SVG),
    features: {
      dominantColors: [
        { name: 'black', rgb: [24, 24, 27], hex: '#18181B', percentage: 85 },
        { name: 'white', rgb: [248, 250, 252], hex: '#F8FAFC', percentage: 15 },
      ],
      colorHistogram: [0.85, 0.0, 0.0, 0.15, 0.0, 0.0, 0.0, 0.0, 0.0],
      detectedText: 'NIKE JUST DO IT CLASSIC BACKPACK S/N: NK-90214 الطالب: فهد المطيري',
      ocr: {
        rawText: 'NIKE JUST DO IT CLASSIC BACKPACK S/N: NK-90214 الطالب: فهد المطيري',
        normalizedTokens: ['nike', 'just', 'do', 'it', 'backpack', 'nk-90214', 'فهد', 'المطيري'],
        entities: {
          brand: 'Nike',
          serialNumber: 'NK-90214',
          studentName: 'فهد المطيري',
        },
        confidence: 0.94,
      },
      shape: {
        aspectRatio: 0.78,
        solidity: 0.88,
        edgeComplexity: 45.6,
      },
      processedAt: '2026-09-17T07:42:00.000Z',
    },
  },
];

/**
 * Pure TypeScript core pipeline: processes raw ImageBufferData and optional raw OCR text tokens
 */
export function processImageBuffer(
  buffer: ImageBufferData,
  rawTextPrompt: string = ''
): VisualFeatures {
  const dominantColors = extractDominantColors(buffer, 3);
  const colorHistogram = extractColorHistogram(buffer);
  const shape = extractShapeVector(buffer);
  const ocr = parseOcrText(rawTextPrompt);

  return {
    dominantColors,
    colorHistogram,
    detectedText: ocr.rawText || undefined,
    ocr,
    shape,
    processedAt: new Date().toISOString(),
  };
}

/**
 * Converts any File, Blob, or Data URL to an HTMLImageElement
 */
function loadImageElement(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Canvas/DOM operations are only supported in browser runtime.'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Browser adapter: downscales an input image to 128x128 for rapid sub-30ms analysis,
 * creates a compressed max 400x400 JPEG thumbnail data URL for storage,
 * and extracts complete VisualFeatures entirely on-device.
 */
export async function processBrowserImage(
  source: File | Blob | string,
  rawTextHint: string = ''
): Promise<{ dataUrl: string; features: VisualFeatures }> {
  // If running in non-browser environment, return synthetic fallback
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    const dummyBuffer: ImageBufferData = {
      data: new Uint8ClampedArray(128 * 128 * 4),
      width: 128,
      height: 128,
    };
    return {
      dataUrl: typeof source === 'string' ? source : 'data:image/jpeg;base64,',
      features: processImageBuffer(dummyBuffer, rawTextHint),
    };
  }

  const img = await loadImageElement(source);

  // 1. Create compressed JPEG thumbnail canvas (max 400x400)
  const thumbMaxDim = 400;
  let thumbW = img.naturalWidth || img.width || 400;
  let thumbH = img.naturalHeight || img.height || 400;

  if (thumbW > thumbMaxDim || thumbH > thumbMaxDim) {
    if (thumbW > thumbH) {
      thumbH = Math.round((thumbH * thumbMaxDim) / thumbW);
      thumbW = thumbMaxDim;
    } else {
      thumbW = Math.round((thumbW * thumbMaxDim) / thumbH);
      thumbH = thumbMaxDim;
    }
  }

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbW;
  thumbCanvas.height = thumbH;
  const thumbCtx = thumbCanvas.getContext('2d');
  if (thumbCtx) {
    thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
  }
  const compressedDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.78);

  // 2. Create downsampled analysis canvas (max 128x128)
  const analysisDim = 128;
  let anW = img.naturalWidth || img.width || 128;
  let anH = img.naturalHeight || img.height || 128;

  if (anW > analysisDim || anH > analysisDim) {
    if (anW > anH) {
      anH = Math.round((anH * analysisDim) / anW);
      anW = analysisDim;
    } else {
      anW = Math.round((anW * analysisDim) / anH);
      anH = analysisDim;
    }
  }

  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = anW;
  analysisCanvas.height = anH;
  const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });

  let bufferData: Uint8ClampedArray;
  if (analysisCtx) {
    analysisCtx.drawImage(img, 0, 0, anW, anH);
    const imgData = analysisCtx.getImageData(0, 0, anW, anH);
    bufferData = imgData.data;
  } else {
    bufferData = new Uint8ClampedArray(anW * anH * 4);
  }

  const buffer: ImageBufferData = {
    data: bufferData,
    width: anW,
    height: anH,
  };

  const features = processImageBuffer(buffer, rawTextHint);

  return {
    dataUrl: compressedDataUrl,
    features,
  };
}
