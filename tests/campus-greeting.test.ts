import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CampusPeriod,
  CAMPUS_PERIODS,
  CAMPUS_PERIOD_DEFINITIONS,
  getCampusPeriod,
  getCampusAtmosphere,
  getCampusGreeting,
  isCampusPeriod,
} from '../src/lib/campusSchedule';
import { TRANSLATIONS } from '../src/lib/i18n/translations';
import { DEMO_USERS } from '../src/lib/constants';
import { getLocalizedUser } from '../src/lib/i18n/seedDataTranslations';

/**
 * Helper to construct a local Date object at specific hours, minutes, seconds.
 */
function createLocalDate(hours: number, minutes: number, seconds: number = 0, ms: number = 0): Date {
  const d = new Date(2026, 8, 18, hours, minutes, seconds, ms);
  return d;
}

describe('Campus Greeting & Schedule Atmosphere Suite', () => {

  // =========================================================================
  // 1. SCHEDULE BRACKET MAPPING
  // =========================================================================
  describe('1. Schedule Bracket Mapping (Continuous 24-Hour Cycle)', () => {
    it('1.1 maps morning period [06:00, 09:30) correctly: 06:00, 08:00, 09:29', () => {
      const t0600 = createLocalDate(6, 0, 0);
      const t0800 = createLocalDate(8, 0, 0);
      const t0929 = createLocalDate(9, 29, 59);

      assert.strictEqual(getCampusPeriod(t0600), 'morning', '06:00:00 must be morning');
      assert.strictEqual(getCampusPeriod(t0800), 'morning', '08:00:00 must be morning');
      assert.strictEqual(getCampusPeriod(t0929), 'morning', '09:29:59 must be morning');
    });

    it('1.2 maps recess period [09:30, 12:30) correctly: 09:30, 11:00, 12:29', () => {
      const t0930 = createLocalDate(9, 30, 0);
      const t1100 = createLocalDate(11, 0, 0);
      const t1229 = createLocalDate(12, 29, 59);

      assert.strictEqual(getCampusPeriod(t0930), 'recess', '09:30:00 must be recess');
      assert.strictEqual(getCampusPeriod(t1100), 'recess', '11:00:00 must be recess');
      assert.strictEqual(getCampusPeriod(t1229), 'recess', '12:29:59 must be recess');
    });

    it('1.3 maps dismissal period [12:30, 16:00) correctly: 12:30, 14:00, 15:59', () => {
      const t1230 = createLocalDate(12, 30, 0);
      const t1400 = createLocalDate(14, 0, 0);
      const t1559 = createLocalDate(15, 59, 59);

      assert.strictEqual(getCampusPeriod(t1230), 'dismissal', '12:30:00 must be dismissal');
      assert.strictEqual(getCampusPeriod(t1400), 'dismissal', '14:00:00 must be dismissal');
      assert.strictEqual(getCampusPeriod(t1559), 'dismissal', '15:59:59 must be dismissal');
    });

    it('1.4 maps evening period [16:00, 06:00) correctly: 16:00, 20:00, 23:59, 00:00, 05:59', () => {
      const t1600 = createLocalDate(16, 0, 0);
      const t2000 = createLocalDate(20, 0, 0);
      const t2359 = createLocalDate(23, 59, 59);
      const t0000 = createLocalDate(0, 0, 0);
      const t0559 = createLocalDate(5, 59, 59);

      assert.strictEqual(getCampusPeriod(t1600), 'evening', '16:00:00 must be evening');
      assert.strictEqual(getCampusPeriod(t2000), 'evening', '20:00:00 must be evening');
      assert.strictEqual(getCampusPeriod(t2359), 'evening', '23:59:59 must be evening');
      assert.strictEqual(getCampusPeriod(t0000), 'evening', '00:00:00 must be evening');
      assert.strictEqual(getCampusPeriod(t0559), 'evening', '05:59:59 must be evening');
    });

    it('1.5 exhaustive partition: every minute in 24h maps to exactly one valid period without gaps', () => {
      const counts: Record<CampusPeriod, number> = {
        morning: 0,
        recess: 0,
        dismissal: 0,
        evening: 0,
      };

      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m++) {
          const d = createLocalDate(h, m, 0);
          const period = getCampusPeriod(d);
          assert.ok(isCampusPeriod(period), `Invalid period ${period} at ${h}:${m}`);
          counts[period]++;
        }
      }

      // 06:00 to 09:30 = 3.5h = 210 minutes
      assert.strictEqual(counts.morning, 210, 'Morning should have 210 minutes');
      // 09:30 to 12:30 = 3.0h = 180 minutes
      assert.strictEqual(counts.recess, 180, 'Recess should have 180 minutes');
      // 12:30 to 16:00 = 3.5h = 210 minutes
      assert.strictEqual(counts.dismissal, 210, 'Dismissal should have 210 minutes');
      // 16:00 to 06:00 = 14.0h = 840 minutes
      assert.strictEqual(counts.evening, 840, 'Evening should have 840 minutes');

      // Total must equal 1440 minutes in a full day
      assert.strictEqual(counts.morning + counts.recess + counts.dismissal + counts.evening, 1440);
    });
  });

  // =========================================================================
  // 2. BOUNDARY SECOND TRANSITIONS
  // =========================================================================
  describe('2. Boundary Second Transitions & Precision Timekeeping', () => {
    it('2.1 transitions exactly from evening to morning: 05:59:59 -> 06:00:00', () => {
      const before = createLocalDate(5, 59, 59, 999);
      const atBoundary = createLocalDate(6, 0, 0, 0);

      assert.strictEqual(getCampusPeriod(before), 'evening');
      assert.strictEqual(getCampusPeriod(atBoundary), 'morning');
    });

    it('2.2 transitions exactly from morning to recess: 09:29:59 -> 09:30:00', () => {
      const before = createLocalDate(9, 29, 59, 999);
      const atBoundary = createLocalDate(9, 30, 0, 0);

      assert.strictEqual(getCampusPeriod(before), 'morning');
      assert.strictEqual(getCampusPeriod(atBoundary), 'recess');
    });

    it('2.3 transitions exactly from recess to dismissal: 12:29:59 -> 12:30:00', () => {
      const before = createLocalDate(12, 29, 59, 999);
      const atBoundary = createLocalDate(12, 30, 0, 0);

      assert.strictEqual(getCampusPeriod(before), 'recess');
      assert.strictEqual(getCampusPeriod(atBoundary), 'dismissal');
    });

    it('2.4 transitions exactly from dismissal to evening: 15:59:59 -> 16:00:00', () => {
      const before = createLocalDate(15, 59, 59, 999);
      const atBoundary = createLocalDate(16, 0, 0, 0);

      assert.strictEqual(getCampusPeriod(before), 'dismissal');
      assert.strictEqual(getCampusPeriod(atBoundary), 'evening');
    });

    it('2.5 default invocation: getCampusPeriod() returns valid CampusPeriod without arguments', () => {
      const current = getCampusPeriod();
      assert.ok(isCampusPeriod(current), 'getCampusPeriod() must return a valid CampusPeriod');
    });
  });

  // =========================================================================
  // 3. EXACT USER-REQUESTED ARABIC & ENGLISH STRINGS
  // =========================================================================
  describe('3. Exact User-Requested Arabic & English Strings', () => {
    it('3.1 Morning: verifies exact requested strings in Arabic and English', () => {
      const expectedAr = 'صباح الهمة والنشاط ☀️';
      const expectedEn = 'Good morning! Ready for an active day ☀️';

      assert.strictEqual(getCampusGreeting('morning', 'ar'), expectedAr);
      assert.strictEqual(getCampusGreeting('morning', 'en'), expectedEn);
      assert.strictEqual(TRANSLATIONS.ar.campus_morning_greeting, expectedAr);
      assert.strictEqual(TRANSLATIONS.en.campus_morning_greeting, expectedEn);
    });

    it('3.2 Recess: verifies exact requested strings in Arabic and English', () => {
      const expectedAr = 'استراحة موفقة 🥪 — تفقدي متعلقاتك';
      const expectedEn = 'Enjoy your break 🥪 — Keep track of your belongings';

      assert.strictEqual(getCampusGreeting('recess', 'ar'), expectedAr);
      assert.strictEqual(getCampusGreeting('recess', 'en'), expectedEn);
      assert.strictEqual(TRANSLATIONS.ar.campus_recess_greeting, expectedAr);
      assert.strictEqual(TRANSLATIONS.en.campus_recess_greeting, expectedEn);
    });

    it('3.3 Dismissal: verifies exact requested strings in Arabic and English', () => {
      const expectedAr = 'دمتِ بخير 🏫 — تأكدي من حقيبتك وكتبك';
      const expectedEn = 'Have a safe dismissal 🏫 — Check your bag and books';

      assert.strictEqual(getCampusGreeting('dismissal', 'ar'), expectedAr);
      assert.strictEqual(getCampusGreeting('dismissal', 'en'), expectedEn);
      assert.strictEqual(TRANSLATIONS.ar.campus_dismissal_greeting, expectedAr);
      assert.strictEqual(TRANSLATIONS.en.campus_dismissal_greeting, expectedEn);
    });

    it('3.4 Evening: verifies exact requested strings in Arabic and English', () => {
      const expectedAr = 'مساء الخير 🌙';
      const expectedEn = 'Good evening 🌙';

      assert.strictEqual(getCampusGreeting('evening', 'ar'), expectedAr);
      assert.strictEqual(getCampusGreeting('evening', 'en'), expectedEn);
      assert.strictEqual(TRANSLATIONS.ar.campus_evening_greeting, expectedAr);
      assert.strictEqual(TRANSLATIONS.en.campus_evening_greeting, expectedEn);
    });
  });

  // =========================================================================
  // 4. ROLE AWARENESS (STUDENT VS SCHOOL ADMIN)
  // =========================================================================
  describe('4. Role Awareness (Student vs School Admin Context)', () => {
    it('4.1 Student role: appends personal student name in morning and evening greetings', () => {
      const studentSarah = { name: 'سارة أحمد', role: 'student' };
      const arGreeting = getCampusGreeting(studentSarah, 'morning', 'ar');
      assert.strictEqual(arGreeting, 'صباح الهمة والنشاط ☀️ · سارة أحمد');

      const enStudent = { name: 'Sarah Ahmed', role: 'student' };
      const enGreeting = getCampusGreeting(enStudent, 'morning', 'en');
      assert.strictEqual(enGreeting, 'Good morning! Ready for an active day ☀️ · Sarah Ahmed');

      const eveningGreeting = getCampusGreeting(studentSarah, 'evening', 'ar');
      assert.strictEqual(eveningGreeting, 'مساء الخير 🌙 · سارة أحمد');
    });

    it('4.2 Student role: falls back gracefully without trailing dot when name is absent or empty', () => {
      const studentNoName = { name: '', role: 'student' };
      assert.strictEqual(getCampusGreeting(studentNoName, 'morning', 'ar'), 'صباح الهمة والنشاط ☀️');
      assert.strictEqual(getCampusGreeting(studentNoName, 'evening', 'en'), 'Good evening 🌙');

      const studentSpacesOnly = { name: '   ', role: 'student' };
      assert.strictEqual(getCampusGreeting(studentSpacesOnly, 'morning', 'ar'), 'صباح الهمة والنشاط ☀️');
    });

    it('4.3 Student role: displays specific custody and belongings reminders during recess and dismissal', () => {
      const student = { name: 'سارة أحمد', role: 'student' };

      const recessAr = getCampusGreeting(student, 'recess', 'ar');
      assert.ok(recessAr.includes('تفقدي متعلقاتك'), 'Recess greeting must remind student to track belongings');

      const dismissalAr = getCampusGreeting(student, 'dismissal', 'ar');
      assert.ok(dismissalAr.includes('تأكدي من حقيبتك وكتبك'), 'Dismissal greeting must remind student to check bag and books');

      const recessEn = getCampusGreeting(student, 'recess', 'en');
      assert.ok(recessEn.includes('Keep track of your belongings'), 'Recess EN must mention belongings');

      const dismissalEn = getCampusGreeting(student, 'dismissal', 'en');
      assert.ok(dismissalEn.includes('Check your bag and books'), 'Dismissal EN must mention bag and books');
    });

    it('4.4 School Admin role: embeds institutional administrative context across all 4 periods', () => {
      const adminUser = { name: 'أ. مشيرة', role: 'admin' };

      // Arabic admin greetings
      const arMorning = getCampusGreeting(adminUser, 'morning', 'ar');
      assert.strictEqual(arMorning, 'صباح الهمة والنشاط ☀️ — إدارة المدرسة');
      assert.ok(arMorning.includes('إدارة المدرسة'));

      const arRecess = getCampusGreeting(adminUser, 'recess', 'ar');
      assert.strictEqual(arRecess, 'استراحة موفقة 🥪 — المتابعة الإدارية');
      assert.ok(arRecess.includes('المتابعة الإدارية'));

      const arDismissal = getCampusGreeting(adminUser, 'dismissal', 'ar');
      assert.strictEqual(arDismissal, 'دمتِ بخير 🏫 — حصر الأمانات اليومية');
      assert.ok(arDismissal.includes('حصر الأمانات اليومية'));

      const arEvening = getCampusGreeting(adminUser, 'evening', 'ar');
      assert.strictEqual(arEvening, 'مساء الخير 🌙 — حفظ الأمانات المدرسية');
      assert.ok(arEvening.includes('حفظ الأمانات المدرسية'));

      // English admin greetings
      const enMorning = getCampusGreeting(adminUser, 'morning', 'en');
      assert.strictEqual(enMorning, 'Good morning! Ready for an active day ☀️ — School Admin');

      const enRecess = getCampusGreeting(adminUser, 'recess', 'en');
      assert.strictEqual(enRecess, 'Enjoy your break 🥪 — Administrative Follow-up');

      const enDismissal = getCampusGreeting(adminUser, 'dismissal', 'en');
      assert.strictEqual(enDismissal, 'Have a safe dismissal 🏫 — Daily Custody Review');

      const enEvening = getCampusGreeting(adminUser, 'evening', 'en');
      assert.strictEqual(enEvening, 'Good evening 🌙 — Campus Custody Preserved');
    });

    it('4.5 Demo Users integration: verifies student Malak and admin Ms. Moshira format as expected', () => {
      const malak = DEMO_USERS.find((u) => u.id === 'user_malak');
      const moshira = DEMO_USERS.find((u) => u.id === 'user_moshira');

      assert.ok(malak, 'Malak user should exist');
      assert.ok(moshira, 'Moshira user should exist');

      const malakAr = getCampusGreeting(malak, 'morning', 'ar');
      assert.ok(malakAr.includes(malak.name), 'Malak greeting should contain her name');

      const malakEn = getCampusGreeting(getLocalizedUser(malak, 'en'), 'morning', 'en');
      assert.ok(malakEn.includes('Malak'), 'Malak EN greeting should contain Malak');

      const moshiraAr = getCampusGreeting(moshira, 'morning', 'ar');
      assert.ok(moshiraAr.includes('إدارة المدرسة'), 'Admin greeting should contain institutional admin label');
    });

    it('4.6 supports multiple function overload signatures reliably', () => {
      // Signature 1: (userObject, period, language)
      assert.strictEqual(
        getCampusGreeting({ name: 'نور', role: 'student' }, 'morning', 'ar'),
        'صباح الهمة والنشاط ☀️ · نور'
      );

      // Signature 2: (period, isAdmin, userName, language)
      assert.strictEqual(
        getCampusGreeting('morning', true, 'أ. مشيرة', 'ar'),
        'صباح الهمة والنشاط ☀️ — إدارة المدرسة'
      );
      assert.strictEqual(
        getCampusGreeting('morning', false, 'نور', 'ar'),
        'صباح الهمة والنشاط ☀️ · نور'
      );

      // Signature 3: (period, language)
      assert.strictEqual(
        getCampusGreeting('evening', 'ar'),
        'مساء الخير 🌙'
      );
      assert.strictEqual(
        getCampusGreeting('evening', 'en'),
        'Good evening 🌙'
      );
    });
  });

  // =========================================================================
  // 5. ATMOSPHERE METADATA & DESIGN TOKEN INTEGRITY
  // =========================================================================
  describe('5. Atmosphere Metadata & Design Token Integrity', () => {
    it('5.1 CAMPUS_PERIOD_DEFINITIONS holds all 4 periods with correct time brackets and emojis', () => {
      assert.strictEqual(CAMPUS_PERIODS.length, 4);

      for (const p of CAMPUS_PERIODS) {
        const def = CAMPUS_PERIOD_DEFINITIONS[p];
        assert.ok(def, `Definition for period ${p} must exist`);
        assert.strictEqual(def.period, p);
        assert.ok(def.emoji.length > 0, `Emoji for ${p} must be non-empty`);
        assert.ok(def.timeBracket.length > 0, `TimeBracket for ${p} must be non-empty`);
        assert.ok(def.badgeColorClass.length > 0, `BadgeColorClass for ${p} must be non-empty`);
      }

      assert.strictEqual(CAMPUS_PERIOD_DEFINITIONS.morning.emoji, '☀️');
      assert.strictEqual(CAMPUS_PERIOD_DEFINITIONS.recess.emoji, '🥪');
      assert.strictEqual(CAMPUS_PERIOD_DEFINITIONS.dismissal.emoji, '🏫');
      assert.strictEqual(CAMPUS_PERIOD_DEFINITIONS.evening.emoji, '🌙');

      assert.strictEqual(CAMPUS_PERIOD_DEFINITIONS.morning.timeBracket, '06:00 – 09:30');
      assert.strictEqual(CAMPUS_PERIOD_DEFINITIONS.recess.timeBracket, '09:30 – 12:30');
      assert.strictEqual(CAMPUS_PERIOD_DEFINITIONS.dismissal.timeBracket, '12:30 – 16:00');
      assert.strictEqual(CAMPUS_PERIOD_DEFINITIONS.evening.timeBracket, '16:00 – 06:00');
    });

    it('5.2 getCampusAtmosphere returns complete metadata and distinct badge colors', () => {
      const morningAtm = getCampusAtmosphere('morning', 'ar', false);
      assert.strictEqual(morningAtm.period, 'morning');
      assert.strictEqual(morningAtm.icon, '☀️');
      assert.strictEqual(morningAtm.timeBracket, '06:00 – 09:30');
      assert.ok(morningAtm.badgeColorClass.includes('amber'), 'Morning badge should use amber color class');

      const recessAtm = getCampusAtmosphere('recess', 'ar', false);
      assert.strictEqual(recessAtm.period, 'recess');
      assert.strictEqual(recessAtm.icon, '🥪');
      assert.strictEqual(recessAtm.timeBracket, '09:30 – 12:30');
      assert.ok(recessAtm.badgeColorClass.includes('emerald'), 'Recess badge should use emerald color class');

      const dismissalAtm = getCampusAtmosphere('dismissal', 'ar', false);
      assert.strictEqual(dismissalAtm.period, 'dismissal');
      assert.strictEqual(dismissalAtm.icon, '🏫');
      assert.strictEqual(dismissalAtm.timeBracket, '12:30 – 16:00');
      assert.ok(dismissalAtm.badgeColorClass.includes('indigo'), 'Dismissal badge should use indigo color class');

      const eveningAtm = getCampusAtmosphere('evening', 'ar', false);
      assert.strictEqual(eveningAtm.period, 'evening');
      assert.strictEqual(eveningAtm.icon, '🌙');
      assert.strictEqual(eveningAtm.timeBracket, '16:00 – 06:00');
      assert.ok(eveningAtm.badgeColorClass.includes('slate'), 'Evening badge should use slate color class');
    });

    it('5.3 getCampusAtmosphere adjusts keys according to isAdmin parameter', () => {
      const studentAtm = getCampusAtmosphere('morning', 'ar', false);
      const adminAtm = getCampusAtmosphere('morning', 'ar', true);

      assert.strictEqual(studentAtm.greetingKey, 'campus_morning_greeting');
      assert.strictEqual(adminAtm.greetingKey, 'campus_admin_morning');

      assert.strictEqual(studentAtm.awarenessKey, 'campus_morning_subStudent');
      assert.strictEqual(adminAtm.awarenessKey, 'campus_morning_subAdmin');
    });

    it('5.4 isCampusPeriod validates correctly for valid and invalid values', () => {
      assert.strictEqual(isCampusPeriod('morning'), true);
      assert.strictEqual(isCampusPeriod('recess'), true);
      assert.strictEqual(isCampusPeriod('dismissal'), true);
      assert.strictEqual(isCampusPeriod('evening'), true);

      assert.strictEqual(isCampusPeriod('afternoon'), false);
      assert.strictEqual(isCampusPeriod('night'), false);
      assert.strictEqual(isCampusPeriod(''), false);
      assert.strictEqual(isCampusPeriod(null), false);
      assert.strictEqual(isCampusPeriod(undefined), false);
      assert.strictEqual(isCampusPeriod(123), false);
      assert.strictEqual(isCampusPeriod({}), false);
    });
  });

  // =========================================================================
  // 6. BILINGUAL TRANSLATION KEY PARITY & COMPLETENESS
  // =========================================================================
  describe('6. Bilingual Translation Key Parity & Completeness', () => {
    it('6.1 verifies all campus greeting and atmosphere translation keys exist in both AR and EN', () => {
      const requiredKeys = [
        'campus_morning_greeting',
        'campus_recess_greeting',
        'campus_dismissal_greeting',
        'campus_evening_greeting',
        'campus_admin_morning',
        'campus_admin_recess',
        'campus_admin_dismissal',
        'campus_admin_evening',
        'campus_morning_period',
        'campus_recess_period',
        'campus_dismissal_period',
        'campus_evening_period',
        'campus_morning_time',
        'campus_recess_time',
        'campus_dismissal_time',
        'campus_evening_time',
        'campus_morning_subStudent',
        'campus_morning_subAdmin',
        'campus_recess_subStudent',
        'campus_recess_subAdmin',
        'campus_dismissal_subStudent',
        'campus_dismissal_subAdmin',
        'campus_evening_subStudent',
        'campus_evening_subAdmin',
        'campus_atmosphere_badge',
        'campus_atmosphere_now',
      ];

      for (const key of requiredKeys) {
        assert.ok(key in TRANSLATIONS.ar, `Missing Arabic key: ${key}`);
        assert.ok(key in TRANSLATIONS.en, `Missing English key: ${key}`);
        assert.ok(TRANSLATIONS.ar[key].trim().length > 0, `Arabic key ${key} cannot be empty`);
        assert.ok(TRANSLATIONS.en[key].trim().length > 0, `English key ${key} cannot be empty`);
      }
    });

    it('6.2 verifies dot-notation compatibility mirror keys exist and match values', () => {
      const mirrorKeyPairs = [
        { dot: 'campus.morning.student', base: 'campus_morning_greeting' },
        { dot: 'campus.morning.admin', base: 'campus_admin_morning' },
        { dot: 'campus.recess.student', base: 'campus_recess_greeting' },
        { dot: 'campus.recess.admin', base: 'campus_admin_recess' },
        { dot: 'campus.dismissal.student', base: 'campus_dismissal_greeting' },
        { dot: 'campus.dismissal.admin', base: 'campus_admin_dismissal' },
        { dot: 'campus.evening.student', base: 'campus_evening_greeting' },
        { dot: 'campus.evening.admin', base: 'campus_admin_evening' },
      ];

      for (const { dot, base } of mirrorKeyPairs) {
        assert.strictEqual(
          TRANSLATIONS.ar[dot],
          TRANSLATIONS.ar[base],
          `Arabic mirror mismatch for ${dot} vs ${base}`
        );
        assert.strictEqual(
          TRANSLATIONS.en[dot],
          TRANSLATIONS.en[base],
          `English mirror mismatch for ${dot} vs ${base}`
        );
      }
    });
  });

});
