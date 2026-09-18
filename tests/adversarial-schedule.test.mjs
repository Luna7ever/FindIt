import assert from 'assert/strict';
import { performance } from 'perf_hooks';

console.log('================================================================');
console.log('CHALLENGER 1: ADVERSARIAL CAMPUS SCHEDULE & ATMOSPHERE HARNESS');
console.log('================================================================\n');

// Import typescript compiled or tsx-supported module
const {
  CAMPUS_PERIODS,
  CAMPUS_PERIOD_DEFINITIONS,
  getCampusPeriod,
  getCampusAtmosphere,
  getCampusGreeting,
  isCampusPeriod
} = await import('./src/lib/campusSchedule.ts');

const { TRANSLATIONS } = await import('./src/lib/i18n/translations.ts');

let totalChecks = 0;
let passedChecks = 0;

function check(desc, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  ✔ [PASS] ${desc}`);
  } catch (err) {
    console.error(`  ✖ [FAIL] ${desc}`);
    console.error(err);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// 1. EXTREME AND INVALID DATE INPUTS
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 1: EXTREME & INVALID DATE INPUTS ---');

check('1.1 undefined parameter: defaults to current time and returns valid period', () => {
  const period = getCampusPeriod();
  assert.ok(isCampusPeriod(period), `Expected valid period, got ${period}`);
  const periodExplicitUndefined = getCampusPeriod(undefined);
  assert.ok(isCampusPeriod(periodExplicitUndefined), `Expected valid period for undefined, got ${periodExplicitUndefined}`);
});

check('1.2 Invalid Date (new Date(NaN)): gracefully returns evening period without throwing', () => {
  const invalidDate = new Date(NaN);
  assert.ok(isNaN(invalidDate.getTime()));
  const period = getCampusPeriod(invalidDate);
  assert.strictEqual(period, 'evening', 'Invalid date should safely map to evening fallback');
});

check('1.3 Epoch 0 (1970-01-01T00:00:00Z): deterministic mapping based on local time', () => {
  const epoch = new Date(0);
  const period = getCampusPeriod(epoch);
  assert.ok(isCampusPeriod(period), `Epoch 0 period must be valid: got ${period}`);
  const expectedMinutes = epoch.getHours() * 60 + epoch.getMinutes();
  if (expectedMinutes >= 360 && expectedMinutes < 570) assert.strictEqual(period, 'morning');
  else if (expectedMinutes >= 570 && expectedMinutes < 750) assert.strictEqual(period, 'recess');
  else if (expectedMinutes >= 750 && expectedMinutes < 960) assert.strictEqual(period, 'dismissal');
  else assert.strictEqual(period, 'evening');
});

check('1.4 Negative and boundary millisecond timestamps (-8.64e15 and +8.64e15)', () => {
  const minDate = new Date(-8640000000000000);
  const maxDate = new Date(8640000000000000);
  assert.ok(isCampusPeriod(getCampusPeriod(minDate)), 'Min date must produce valid period');
  assert.ok(isCampusPeriod(getCampusPeriod(maxDate)), 'Max date must produce valid period');
});

check('1.5 Distant Future (Year 3000) & Distant Past (Year 1)', () => {
  const y3000Morning = new Date(3000, 0, 1, 7, 30, 0);
  assert.strictEqual(getCampusPeriod(y3000Morning), 'morning');

  const y1Evening = new Date(1, 0, 1, 20, 0, 0);
  assert.strictEqual(getCampusPeriod(y1Evening), 'evening');
});

check('1.6 Leap Year handling (Feb 29: 2024, 2000, 2028, 2400)', () => {
  const leapDays = [
    { year: 2024, h: 6, m: 30, expected: 'morning' },
    { year: 2000, h: 10, m: 15, expected: 'recess' },
    { year: 2028, h: 13, m: 45, expected: 'dismissal' },
    { year: 2400, h: 22, m: 0, expected: 'evening' },
  ];

  for (const { year, h, m, expected } of leapDays) {
    const d = new Date(year, 1, 29, h, m, 0);
    assert.strictEqual(d.getDate(), 29, `${year} must be a leap year`);
    assert.strictEqual(getCampusPeriod(d), expected, `Feb 29 ${year} at ${h}:${m} must be ${expected}`);
  }
});

check('1.7 Leap Seconds normalization (e.g. 23:59:60)', () => {
  const leapSecDate = new Date('2016-12-31T23:59:60Z');
  const period = getCampusPeriod(leapSecDate);
  assert.ok(isCampusPeriod(period), 'Leap second date must evaluate to valid period');
});

check('1.8 Daylight Saving Time transition days (Spring forward & Fall back)', () => {
  const dstDates = [
    new Date(2026, 2, 29, 2, 30, 0),
    new Date(2026, 2, 29, 6, 0, 0),
    new Date(2026, 9, 25, 1, 30, 0),
    new Date(2026, 9, 25, 12, 30, 0),
  ];
  for (const d of dstDates) {
    const p = getCampusPeriod(d);
    assert.ok(isCampusPeriod(p), `DST transition time ${d.toISOString()} must map to valid period`);
  }
});

// -----------------------------------------------------------------------------
// 2. MICROSECOND & MILLISECOND BOUNDARY TRANSITIONS
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: MICROSECOND & MILLISECOND BOUNDARY TRANSITIONS ---');

check('2.1 Evening -> Morning: 05:59:59.999 vs 06:00:00.000', () => {
  const before = new Date(2026, 8, 18, 5, 59, 59, 999);
  const at = new Date(2026, 8, 18, 6, 0, 0, 0);
  assert.strictEqual(getCampusPeriod(before), 'evening', '05:59:59.999 must be evening');
  assert.strictEqual(getCampusPeriod(at), 'morning', '06:00:00.000 must be morning');
});

check('2.2 Morning -> Recess: 09:29:59.999 vs 09:30:00.000', () => {
  const before = new Date(2026, 8, 18, 9, 29, 59, 999);
  const at = new Date(2026, 8, 18, 9, 30, 0, 0);
  assert.strictEqual(getCampusPeriod(before), 'morning', '09:29:59.999 must be morning');
  assert.strictEqual(getCampusPeriod(at), 'recess', '09:30:00.000 must be recess');
});

check('2.3 Recess -> Dismissal: 12:29:59.999 vs 12:30:00.000', () => {
  const before = new Date(2026, 8, 18, 12, 29, 59, 999);
  const at = new Date(2026, 8, 18, 12, 30, 0, 0);
  assert.strictEqual(getCampusPeriod(before), 'recess', '12:29:59.999 must be recess');
  assert.strictEqual(getCampusPeriod(at), 'dismissal', '12:30:00.000 must be dismissal');
});

check('2.4 Dismissal -> Evening: 15:59:59.999 vs 16:00:00.000', () => {
  const before = new Date(2026, 8, 18, 15, 59, 59, 999);
  const at = new Date(2026, 8, 18, 16, 0, 0, 0);
  assert.strictEqual(getCampusPeriod(before), 'dismissal', '15:59:59.999 must be dismissal');
  assert.strictEqual(getCampusPeriod(at), 'evening', '16:00:00.000 must be evening');
});

check('2.5 Midnight Boundary: 23:59:59.999 vs 00:00:00.000', () => {
  const before = new Date(2026, 8, 18, 23, 59, 59, 999);
  const at = new Date(2026, 8, 19, 0, 0, 0, 0);
  assert.strictEqual(getCampusPeriod(before), 'evening', '23:59:59.999 must be evening');
  assert.strictEqual(getCampusPeriod(at), 'evening', '00:00:00.000 must be evening');
});

check('2.6 Fine-grained 10ms boundary step sweep around all 4 transition points (800 sample points)', () => {
  const transitions = [
    { targetH: 6, targetM: 0, beforePeriod: 'evening', afterPeriod: 'morning' },
    { targetH: 9, targetM: 30, beforePeriod: 'morning', afterPeriod: 'recess' },
    { targetH: 12, targetM: 30, beforePeriod: 'recess', afterPeriod: 'dismissal' },
    { targetH: 16, targetM: 0, beforePeriod: 'dismissal', afterPeriod: 'evening' },
  ];

  for (const { targetH, targetM, beforePeriod, afterPeriod } of transitions) {
    const targetMs = (targetH * 3600 + targetM * 60) * 1000;
    // Test from -1000ms to +1000ms in 10ms increments (201 samples per transition)
    for (let offset = -1000; offset <= 1000; offset += 10) {
      const sampleDate = new Date(2026, 8, 18, 0, 0, 0, targetMs + offset);
      const period = getCampusPeriod(sampleDate);
      if (offset < 0) {
        assert.strictEqual(period, beforePeriod, `Offset ${offset}ms before ${targetH}:${targetM} must be ${beforePeriod}`);
      } else {
        assert.strictEqual(period, afterPeriod, `Offset ${offset}ms at/after ${targetH}:${targetM} must be ${afterPeriod}`);
      }
    }
  }
});

// -----------------------------------------------------------------------------
// 3. EXHAUSTIVE 86,400 SECONDS SWEEP
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: EXHAUSTIVE 86,400 SECONDS SWEEP ---');

check('3.1 Complete 86,400-second sweep: exact partition, zero gaps, 100% determinism', () => {
  const counts = { morning: 0, recess: 0, dismissal: 0, evening: 0 };
  const baseDate = new Date(2026, 8, 18, 0, 0, 0);

  for (let s = 0; s < 86400; s++) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const testDate = new Date(2026, 8, 18, h, m, sec);

    const period = getCampusPeriod(testDate);
    counts[period]++;

    // Verify mathematical intervals
    if (s < 21600) {
      assert.strictEqual(period, 'evening', `Second ${s} (${h}:${m}:${sec}) should be evening`);
    } else if (s < 34200) {
      assert.strictEqual(period, 'morning', `Second ${s} (${h}:${m}:${sec}) should be morning`);
    } else if (s < 45000) {
      assert.strictEqual(period, 'recess', `Second ${s} (${h}:${m}:${sec}) should be recess`);
    } else if (s < 57600) {
      assert.strictEqual(period, 'dismissal', `Second ${s} (${h}:${m}:${sec}) should be dismissal`);
    } else {
      assert.strictEqual(period, 'evening', `Second ${s} (${h}:${m}:${sec}) should be evening`);
    }
  }

  assert.strictEqual(counts.morning, 12600, 'Morning must have exactly 12,600 seconds (3.5 hours)');
  assert.strictEqual(counts.recess, 10800, 'Recess must have exactly 10,800 seconds (3 hours)');
  assert.strictEqual(counts.dismissal, 12600, 'Dismissal must have exactly 12,600 seconds (3.5 hours)');
  assert.strictEqual(counts.evening, 50400, 'Evening must have exactly 50,400 seconds (14 hours)');
  assert.strictEqual(counts.morning + counts.recess + counts.dismissal + counts.evening, 86400, 'Sum must equal 86,400 seconds');

  console.log(`    Second Distribution Verified:
      - Morning:   ${counts.morning.toLocaleString()} sec (14.58%)
      - Recess:    ${counts.recess.toLocaleString()} sec (12.50%)
      - Dismissal: ${counts.dismissal.toLocaleString()} sec (14.58%)
      - Evening:   ${counts.evening.toLocaleString()} sec (58.33%)
      - Total:     86,400 sec (100.00%)`);
});

// -----------------------------------------------------------------------------
// 4. ROLE GREETING ADVERSARIAL STRESS TESTING
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: ROLE GREETING ADVERSARIAL STRESS TESTING ---');

const testNames = [
  { desc: 'empty string', name: '' },
  { desc: 'whitespace only (spaces)', name: '     ' },
  { desc: 'whitespace only (tabs & newlines)', name: "\t\n  \r\n" },
  { desc: 'zero-width & unicode spaces', name: '\u200B\u00A0\u2000' },
  { desc: 'emojis only', name: '🎒🥪📐🎓🏫🌟✨' },
  { desc: 'Arabic diacritics (tashkeel)', name: 'مَلَكُ أَحْمَدُ الشَّيْخُ' },
  { desc: 'BiDi control characters', name: '\u202Ereversed\u202C' },
  { desc: 'HTML/XSS <script> injection', name: "<script>alert('XSS')</script>" },
  { desc: 'HTML/XSS <img> onerror injection', name: '<img src=x onerror=alert(1)>' },
  { desc: 'HTML/XSS svg onload injection', name: '"><svg onload=alert(document.cookie)>' },
  { desc: 'SQL Injection payload', name: "'; DROP TABLE users; --" },
  { desc: '1,000 characters long name', name: 'سارة '.repeat(200) },
  { desc: '10,000 characters long name', name: 'A'.repeat(10000) },
  { desc: '100,000 characters long name', name: 'X'.repeat(100000) },
];

for (const t of testNames) {
  check(`4.1 Adversarial Name: [${t.desc}]`, () => {
    // Test Student Morning AR
    const resStudentMorningAr = getCampusGreeting({ name: t.name, role: 'student' }, 'morning', 'ar');
    assert.ok(typeof resStudentMorningAr === 'string');
    assert.ok(resStudentMorningAr.includes('صباح الهمة والنشاط ☀️'));

    // If trimmed name is empty, verify no trailing dot separator
    if (!t.name.trim()) {
      assert.strictEqual(resStudentMorningAr, 'صباح الهمة والنشاط ☀️');
    } else {
      assert.ok(resStudentMorningAr.includes(t.name.trim()));
      assert.ok(resStudentMorningAr.includes(' · '));
    }

    // Test Student Morning EN
    const resStudentMorningEn = getCampusGreeting({ name: t.name, role: 'student' }, 'morning', 'en');
    assert.ok(typeof resStudentMorningEn === 'string');
    assert.ok(resStudentMorningEn.includes('Good morning! Ready for an active day ☀️'));
    if (!t.name.trim()) {
      assert.strictEqual(resStudentMorningEn, 'Good morning! Ready for an active day ☀️');
    } else {
      assert.ok(resStudentMorningEn.includes(t.name.trim()));
      assert.ok(resStudentMorningEn.includes(' · '));
    }

    // Test Admin Morning AR & EN (Admin greetings ignore user name by design)
    const resAdminMorningAr = getCampusGreeting({ name: t.name, role: 'admin' }, 'morning', 'ar');
    assert.strictEqual(resAdminMorningAr, 'صباح الهمة والنشاط ☀️ — إدارة المدرسة');

    const resAdminMorningEn = getCampusGreeting({ name: t.name, role: 'admin' }, 'morning', 'en');
    assert.strictEqual(resAdminMorningEn, 'Good morning! Ready for an active day ☀️ — School Admin');

    // Test Student Recess & Dismissal (Custody reminders)
    const resStudentRecessAr = getCampusGreeting({ name: t.name, role: 'student' }, 'recess', 'ar');
    assert.strictEqual(resStudentRecessAr, 'استراحة موفقة 🥪 — تفقدي متعلقاتك');

    const resStudentDismissalAr = getCampusGreeting({ name: t.name, role: 'student' }, 'dismissal', 'ar');
    assert.strictEqual(resStudentDismissalAr, 'دمتِ بخير 🏫 — تأكدي من حقيبتك وكتبك');
  });
}

check('4.2 includeName: false override behavior', () => {
  const res = getCampusGreeting({ name: 'Malak Ahmed', role: 'student', includeName: false }, 'morning', 'ar');
  assert.strictEqual(res, 'صباح الهمة والنشاط ☀️', 'includeName: false must omit student name');
});

check('4.3 Overload Signatures Integrity', () => {
  // Overload 1: (userObj, period, lang, isAdmin)
  const g1 = getCampusGreeting({ name: 'Laila', role: 'student' }, 'evening', 'ar');
  assert.strictEqual(g1, 'مساء الخير 🌙 · Laila');

  // Overload 2: (period, isAdmin, name, lang)
  const g2 = getCampusGreeting('evening', true, 'Moshira', 'en');
  assert.strictEqual(g2, 'Good evening 🌙 — Campus Custody Preserved');

  const g2b = getCampusGreeting('evening', false, 'Laila', 'en');
  assert.strictEqual(g2b, 'Good evening 🌙 · Laila');

  // Overload 3: (period, lang)
  const g3ar = getCampusGreeting('morning', 'ar');
  assert.strictEqual(g3ar, 'صباح الهمة والنشاط ☀️');

  const g3en = getCampusGreeting('morning', 'en');
  assert.strictEqual(g3en, 'Good morning! Ready for an active day ☀️');

  // Overload 4: (period)
  const g4 = getCampusGreeting('morning');
  assert.strictEqual(g4, 'صباح الهمة والنشاط ☀️');
});

check('4.4 Non-object, null, and undefined user parameters resilience', () => {
  assert.strictEqual(getCampusGreeting(undefined), 'صباح الهمة والنشاط ☀️');
  assert.strictEqual(getCampusGreeting(null), 'صباح الهمة والنشاط ☀️');
  assert.strictEqual(getCampusGreeting(12345), 'صباح الهمة والنشاط ☀️');
  assert.strictEqual(getCampusGreeting({ name: null, role: null }, 'morning', 'ar'), 'صباح الهمة والنشاط ☀️');
  assert.strictEqual(getCampusGreeting({ name: undefined, role: 'admin' }, 'morning', 'ar'), 'صباح الهمة والنشاط ☀️ — إدارة المدرسة');
  assert.strictEqual(getCampusGreeting({ name: 'Malak', role: undefined }, 'morning', 'en'), 'Good morning! Ready for an active day ☀️ · Malak');
});

// -----------------------------------------------------------------------------
// 5. ATMOSPHERE METADATA & TRANSLATIONS ROBUSTNESS
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: ATMOSPHERE METADATA & TRANSLATIONS ---');

check('5.1 All 4 periods produce complete atmosphere metadata with existing translation keys', () => {
  for (const period of CAMPUS_PERIODS) {
    // Student AR & EN
    const atmosStudentAr = getCampusAtmosphere(period, 'ar', false);
    const atmosStudentEn = getCampusAtmosphere(period, 'en', false);

    assert.ok(atmosStudentAr.icon, `Period ${period} must have icon`);
    assert.ok(atmosStudentAr.timeBracket, `Period ${period} must have timeBracket`);
    assert.ok(atmosStudentAr.badgeColorClass, `Period ${period} must have badgeColorClass`);

    // Translation Key Check
    assert.ok(TRANSLATIONS.ar[atmosStudentAr.greetingKey], `Greeting key ${atmosStudentAr.greetingKey} must exist in AR`);
    assert.ok(TRANSLATIONS.en[atmosStudentEn.greetingKey], `Greeting key ${atmosStudentEn.greetingKey} must exist in EN`);
    assert.ok(TRANSLATIONS.ar[atmosStudentAr.awarenessKey], `Awareness key ${atmosStudentAr.awarenessKey} must exist in AR`);
    assert.ok(TRANSLATIONS.en[atmosStudentEn.awarenessKey], `Awareness key ${atmosStudentEn.awarenessKey} must exist in EN`);

    // Admin AR & EN
    const atmosAdminAr = getCampusAtmosphere(period, 'ar', true);
    const atmosAdminEn = getCampusAtmosphere(period, 'en', true);
    assert.ok(TRANSLATIONS.ar[atmosAdminAr.greetingKey], `Admin greeting key ${atmosAdminAr.greetingKey} must exist in AR`);
    assert.ok(TRANSLATIONS.en[atmosAdminEn.greetingKey], `Admin greeting key ${atmosAdminEn.greetingKey} must exist in EN`);
    assert.ok(TRANSLATIONS.ar[atmosAdminAr.awarenessKey], `Admin awareness key ${atmosAdminAr.awarenessKey} must exist in AR`);
    assert.ok(TRANSLATIONS.en[atmosAdminEn.awarenessKey], `Admin awareness key ${atmosAdminEn.awarenessKey} must exist in EN`);
  }
});

check('5.2 Defensive fallback of getCampusAtmosphere on invalid / null arguments', () => {
  const fallbackNull = getCampusAtmosphere(null, 'ar', false);
  assert.ok(isCampusPeriod(fallbackNull.period));

  const fallbackUndefined = getCampusAtmosphere(undefined, 'en', false);
  assert.ok(isCampusPeriod(fallbackUndefined.period));

  const fallbackNumber = getCampusAtmosphere(12345, 'ar', false);
  assert.ok(isCampusPeriod(fallbackNumber.period));

  const fallbackInvalidString = getCampusAtmosphere('night_shift', 'ar', false);
  assert.ok(isCampusPeriod(fallbackInvalidString.period));
});

check('5.3 isCampusPeriod type guard precision', () => {
  assert.strictEqual(isCampusPeriod('morning'), true);
  assert.strictEqual(isCampusPeriod('recess'), true);
  assert.strictEqual(isCampusPeriod('dismissal'), true);
  assert.strictEqual(isCampusPeriod('evening'), true);

  assert.strictEqual(isCampusPeriod('MORNING'), false);
  assert.strictEqual(isCampusPeriod('afternoon'), false);
  assert.strictEqual(isCampusPeriod('night'), false);
  assert.strictEqual(isCampusPeriod(''), false);
  assert.strictEqual(isCampusPeriod(null), false);
  assert.strictEqual(isCampusPeriod(undefined), false);
  assert.strictEqual(isCampusPeriod(123), false);
  assert.strictEqual(isCampusPeriod({}), false);
  assert.strictEqual(isCampusPeriod([]), false);
  assert.strictEqual(isCampusPeriod(Symbol('morning')), false);
});

// -----------------------------------------------------------------------------
// 6. HIGH-THROUGHPUT STRESS BENCHMARK
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 6: HIGH-THROUGHPUT STRESS BENCHMARK ---');

check('6.1 100,000 getCampusPeriod calculations execute in < 100ms', () => {
  const sample = new Date(2026, 8, 18, 10, 15, 30);
  const start = performance.now();
  for (let i = 0; i < 100000; i++) {
    getCampusPeriod(sample);
  }
  const duration = performance.now() - start;
  assert.ok(duration < 100, `100k calculations took ${duration.toFixed(2)}ms (must be < 100ms)`);
  console.log(`    Throughput: 100,000 calls executed in ${duration.toFixed(2)}ms (${(100000 / duration * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} ops/sec)`);
});

check('6.2 50,000 getCampusGreeting invocations execute in < 100ms', () => {
  const user = { name: 'Malak Ahmed', role: 'student' };
  const start = performance.now();
  for (let i = 0; i < 50000; i++) {
    getCampusGreeting(user, 'morning', 'ar');
  }
  const duration = performance.now() - start;
  assert.ok(duration < 100, `50k greetings took ${duration.toFixed(2)}ms (must be < 100ms)`);
  console.log(`    Throughput: 50,000 greetings executed in ${duration.toFixed(2)}ms (${(50000 / duration * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} ops/sec)`);
});

console.log('\n================================================================');
console.log(`TOTAL ADVERSARIAL STRESS CHECKS: ${totalChecks}`);
console.log(`PASSED: ${passedChecks}`);
console.log(`FAILED: ${totalChecks - passedChecks}`);
console.log('STATUS: ALL ADVERSARIAL CHALLENGES EMPIRICALLY RESOLVED & VERIFIED');
console.log('================================================================\n');