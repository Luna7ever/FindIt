import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministic date formatter with fixed 'Africa/Cairo' timezone
 * Eliminates hydration mismatch between SSR and client renders.
 * Supports both Arabic ('ar') and English ('en').
 */
export function formatAppDate(dateStr: string, lang: 'ar' | 'en' = 'ar'): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const locale = lang === 'en' ? 'en-US' : 'ar-EG';
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: 'Africa/Cairo',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    return formatter.format(date);
  } catch {
    return dateStr;
  }
}

export function formatArabicDate(dateStr: string, lang: 'ar' | 'en' = 'ar'): string {
  return formatAppDate(dateStr, lang);
}

export function generate4DigitPin(): string {
  return '4826';
}

/**
 * Masks student/school IDs for privacy (e.g. "4826" -> "••26")
 */
export function maskStudentId(id?: string): string {
  if (!id) return '';
  const str = id.trim();
  if (str.length <= 2) return '••';
  const dotsCount = Math.max(2, str.length - 2);
  return '•'.repeat(dotsCount) + str.slice(-2);
}

/**
 * Returns privacy-safe public label for public exploration and item cards
 */
export function getPublicReporterLabel(
  role?: string,
  isLost?: boolean,
  custody?: string,
  lang: 'ar' | 'en' = 'ar'
): string {
  const isEn = lang === 'en';
  if (role === 'admin' || custody === 'at_office') {
    return isEn ? 'School Administration Custody' : 'أمانات إدارة المدرسة';
  }
  if (isLost) {
    return isEn ? 'School Student' : 'طالبة في المدرسة';
  }
  return isEn ? 'Fellow Student (Goodwill)' : 'أحد الطلاب (أمانة)';
}

/**
 * Client-Side Canvas Image Compressor
 * Resizes large phone camera snapshots (4-8MB) to max 1024px and compresses to JPEG ~100KB
 * Prevents localStorage QuotaExceededError and optimizes edge vision OCR latency.
 */
export async function compressImage(
  source: File | string,
  maxDimension = 1024,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      if (typeof source === 'string') return resolve(source);
      return resolve('');
    }

    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(typeof source === 'string' ? source : URL.createObjectURL(source));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn('Canvas compression error, using original', err);
        resolve(typeof source === 'string' ? source : URL.createObjectURL(source));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(source);
    }
  });
}
