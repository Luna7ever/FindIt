/**
 * Campus Schedule & Dynamic Time-of-Day Atmosphere Engine
 * Pure, deterministic schedule helper module computing campus periods,
 * time brackets, role-aware greetings, and campus custody reminders.
 */

export type CampusPeriod = 'morning' | 'recess' | 'dismissal' | 'evening';

export interface CampusPeriodDefinition {
  period: CampusPeriod;
  startMinutes: number; // minutes from midnight inclusive [0..1440)
  endMinutes: number;   // minutes from midnight exclusive
  emoji: string;
  timeBracket: string;
  greetingKey: string;
  adminGreetingKey: string;
  awarenessKey: string;
  adminAwarenessKey: string;
  periodNameKey: string;
  badgeColorClass: string;
}

export const CAMPUS_PERIOD_DEFINITIONS: Record<CampusPeriod, CampusPeriodDefinition> = {
  morning: {
    period: 'morning',
    startMinutes: 360, // 06:00
    endMinutes: 570,   // 09:30
    emoji: '☀️',
    timeBracket: '06:00 – 09:30',
    greetingKey: 'campus_morning_greeting',
    adminGreetingKey: 'campus_admin_morning',
    awarenessKey: 'campus_morning_subStudent',
    adminAwarenessKey: 'campus_morning_subAdmin',
    periodNameKey: 'campus_morning_period',
    badgeColorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
  },
  recess: {
    period: 'recess',
    startMinutes: 570, // 09:30
    endMinutes: 750,   // 12:30
    emoji: '🥪',
    timeBracket: '09:30 – 12:30',
    greetingKey: 'campus_recess_greeting',
    adminGreetingKey: 'campus_admin_recess',
    awarenessKey: 'campus_recess_subStudent',
    adminAwarenessKey: 'campus_recess_subAdmin',
    periodNameKey: 'campus_recess_period',
    badgeColorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
  },
  dismissal: {
    period: 'dismissal',
    startMinutes: 750, // 12:30
    endMinutes: 960,   // 16:00
    emoji: '🏫',
    timeBracket: '12:30 – 16:00',
    greetingKey: 'campus_dismissal_greeting',
    adminGreetingKey: 'campus_admin_dismissal',
    awarenessKey: 'campus_dismissal_subStudent',
    adminAwarenessKey: 'campus_dismissal_subAdmin',
    periodNameKey: 'campus_dismissal_period',
    badgeColorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50',
  },
  evening: {
    period: 'evening',
    startMinutes: 960, // 16:00
    endMinutes: 360,   // 06:00 (wraps midnight)
    emoji: '🌙',
    timeBracket: '16:00 – 06:00',
    greetingKey: 'campus_evening_greeting',
    adminGreetingKey: 'campus_admin_evening',
    awarenessKey: 'campus_evening_subStudent',
    adminAwarenessKey: 'campus_evening_subAdmin',
    periodNameKey: 'campus_evening_period',
    badgeColorClass: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50',
  },
};

export const CAMPUS_PERIODS: CampusPeriod[] = ['morning', 'recess', 'dismissal', 'evening'];

export function isCampusPeriod(value: unknown): value is CampusPeriod {
  return typeof value === 'string' && ['morning', 'recess', 'dismissal', 'evening'].includes(value);
}

export interface CampusAtmosphere {
  period: CampusPeriod;
  timeBracket: string;
  greetingKey: string;
  awarenessKey: string;
  icon: string;
  badgeColorClass: string;
  periodNameKey?: string;
}

/**
 * Calculates current campus period based on a Date object.
 * Continuous, deterministic mapping:
 * - Morning:   [360, 570)  -> 06:00 - 09:30
 * - Recess:    [570, 750)  -> 09:30 - 12:30
 * - Dismissal: [750, 960)  -> 12:30 - 16:00
 * - Evening:   [960, 1440) and [0, 360) -> 16:00 - 06:00
 */
export function getCampusPeriod(date: Date = new Date()): CampusPeriod {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes >= 360 && minutes < 570) {
    return 'morning';
  }
  if (minutes >= 570 && minutes < 750) {
    return 'recess';
  }
  if (minutes >= 750 && minutes < 960) {
    return 'dismissal';
  }
  return 'evening';
}

/**
 * Returns atmosphere metadata (icon, keys, time bracket, badge styling).
 */
export function getCampusAtmosphere(
  dateOrPeriod?: Date | CampusPeriod,
  language: 'ar' | 'en' = 'ar',
  isAdmin: boolean = false
): CampusAtmosphere {
  const period: CampusPeriod =
    typeof dateOrPeriod === 'string' && isCampusPeriod(dateOrPeriod)
      ? dateOrPeriod
      : getCampusPeriod(dateOrPeriod instanceof Date ? dateOrPeriod : new Date());

  const def = CAMPUS_PERIOD_DEFINITIONS[period];
  return {
    period,
    timeBracket: def.timeBracket,
    greetingKey: isAdmin ? def.adminGreetingKey : def.greetingKey,
    awarenessKey: isAdmin ? def.adminAwarenessKey : def.awarenessKey,
    icon: def.emoji,
    badgeColorClass: def.badgeColorClass,
    periodNameKey: def.periodNameKey,
  };
}

/**
 * Overloaded signatures for getCampusGreeting supporting object user,
 * period-first, and role-adaptive callers.
 */
export function getCampusGreeting(
  user: { name?: string; role?: string; includeName?: boolean },
  period: CampusPeriod,
  language?: 'ar' | 'en',
  isAdmin?: boolean
): string;
export function getCampusGreeting(
  period: CampusPeriod,
  isAdmin: boolean,
  userName: string,
  language?: 'ar' | 'en'
): string;
export function getCampusGreeting(
  period: CampusPeriod,
  language?: 'ar' | 'en'
): string;
export function getCampusGreeting(
  userOrPeriod: { name?: string; role?: string; includeName?: boolean } | CampusPeriod | string,
  periodOrIsAdmin?: CampusPeriod | boolean | 'ar' | 'en',
  languageOrName?: 'ar' | 'en' | string,
  isAdminOrLang?: boolean | 'ar' | 'en'
): string {
  let period: CampusPeriod = 'morning';
  let isAdmin = false;
  let userName = '';
  let language: 'ar' | 'en' = 'ar';

  if (typeof userOrPeriod === 'object' && userOrPeriod !== null) {
    userName = userOrPeriod.name || '';
    isAdmin = userOrPeriod.role === 'admin';
    if (typeof periodOrIsAdmin === 'string' && isCampusPeriod(periodOrIsAdmin)) {
      period = periodOrIsAdmin;
    }
    if (typeof languageOrName === 'string' && (languageOrName === 'ar' || languageOrName === 'en')) {
      language = languageOrName;
    }
    if (typeof isAdminOrLang === 'boolean') {
      isAdmin = isAdminOrLang;
    }
    if (userOrPeriod.includeName === false) {
      userName = '';
    }
  } else if (typeof userOrPeriod === 'string' && isCampusPeriod(userOrPeriod)) {
    period = userOrPeriod;
    if (typeof periodOrIsAdmin === 'boolean') {
      isAdmin = periodOrIsAdmin;
      if (typeof languageOrName === 'string') {
        userName = languageOrName;
      }
      if (typeof isAdminOrLang === 'string' && (isAdminOrLang === 'ar' || isAdminOrLang === 'en')) {
        language = isAdminOrLang;
      }
    } else if (typeof periodOrIsAdmin === 'string') {
      if (periodOrIsAdmin === 'ar' || periodOrIsAdmin === 'en') {
        language = periodOrIsAdmin;
      }
    }
  } else if (typeof userOrPeriod === 'string') {
    userName = userOrPeriod;
    if (typeof periodOrIsAdmin === 'string' && isCampusPeriod(periodOrIsAdmin)) {
      period = periodOrIsAdmin;
    }
    if (typeof languageOrName === 'string' && (languageOrName === 'ar' || languageOrName === 'en')) {
      language = languageOrName;
    }
    if (typeof isAdminOrLang === 'boolean') {
      isAdmin = isAdminOrLang;
    }
  }

  const isEn = language === 'en';

  if (isAdmin) {
    switch (period) {
      case 'morning':
        return isEn
          ? 'Good morning! Ready for an active day ☀️ — School Admin'
          : 'صباح الهمة والنشاط ☀️ — إدارة المدرسة';
      case 'recess':
        return isEn
          ? 'Enjoy your break 🥪 — Administrative Follow-up'
          : 'استراحة موفقة 🥪 — المتابعة الإدارية';
      case 'dismissal':
        return isEn
          ? 'Have a safe dismissal 🏫 — Daily Custody Review'
          : 'دمتِ بخير 🏫 — حصر الأمانات اليومية';
      case 'evening':
        return isEn
          ? 'Good evening 🌙 — Campus Custody Preserved'
          : 'مساء الخير 🌙 — حفظ الأمانات المدرسية';
    }
  }

  // Student / General User
  const trimmedName = userName.trim();
  switch (period) {
    case 'morning':
      return isEn
        ? (trimmedName ? `Good morning! Ready for an active day ☀️ · ${trimmedName}` : 'Good morning! Ready for an active day ☀️')
        : (trimmedName ? `صباح الهمة والنشاط ☀️ · ${trimmedName}` : 'صباح الهمة والنشاط ☀️');
    case 'recess':
      return isEn
        ? 'Enjoy your break 🥪 — Keep track of your belongings'
        : 'استراحة موفقة 🥪 — تفقدي متعلقاتك';
    case 'dismissal':
      return isEn
        ? 'Have a safe dismissal 🏫 — Check your bag and books'
        : 'دمتِ بخير 🏫 — تأكدي من حقيبتك وكتبك';
    case 'evening':
      return isEn
        ? (trimmedName ? `Good evening 🌙 · ${trimmedName}` : 'Good evening 🌙')
        : (trimmedName ? `مساء الخير 🌙 · ${trimmedName}` : 'مساء الخير 🌙');
  }
}
