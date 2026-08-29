import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministic Arabic date formatter with fixed 'Africa/Cairo' timezone
 * Eliminates hydration mismatch between SSR and client renders.
 */
export function formatArabicDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const formatter = new Intl.DateTimeFormat('ar-EG', {
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
  custody?: string
): string {
  if (role === 'admin' || custody === 'at_office') {
    return 'أمانات إدارة المدرسة';
  }
  if (isLost) {
    return 'طالبة في المدرسة';
  }
  return 'أحد الطلاب (أمانة)';
}
