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
