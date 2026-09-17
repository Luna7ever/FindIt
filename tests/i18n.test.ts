import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TRANSLATIONS } from '../src/lib/i18n/translations';
import { LOCALIZED_SCENARIOS_EN, getLocalizedScenario } from '../src/lib/i18n/scenarios';
import { INTEGRITY_SCENARIOS, CATEGORIES, SCHOOL_LOCATIONS, DEMO_USERS, INITIAL_SEED_ITEMS } from '../src/lib/constants';
import { 
  getLocalizedItem, 
  getLocalizedUser, 
  getLocalizedLocation, 
  getLocalizedColorName,
  CATEGORY_DESCRIPTIONS_EN,
  COLOR_NAMES_EN
} from '../src/lib/i18n/seedDataTranslations';
import { formatAppDate, getPublicReporterLabel } from '../src/lib/utils';
import { calculateMatchScore } from '../src/lib/matching';

describe('i18n Bilingual Integrity & Coverage', () => {
  it('1. DICTIONARY KEYS PARITY: Arabic and English dictionaries have identical keys', () => {
    const arKeys = Object.keys(TRANSLATIONS.ar).sort();
    const enKeys = Object.keys(TRANSLATIONS.en).sort();

    assert.strictEqual(arKeys.length, enKeys.length, 'Key counts must match');
    for (const key of arKeys) {
      assert.ok(enKeys.includes(key), `Missing English translation for key: ${key}`);
      assert.ok(TRANSLATIONS.ar[key].length > 0, `Arabic key '${key}' cannot be empty`);
      assert.ok(TRANSLATIONS.en[key].length > 0, `English key '${key}' cannot be empty`);
    }
  });

  it('2. SCENARIOS LOCALIZATION: All 5 scenarios have complete English translations with options & feedback', () => {
    assert.strictEqual(INTEGRITY_SCENARIOS.length, 5);
    for (const rawScenario of INTEGRITY_SCENARIOS) {
      const enScenario = getLocalizedScenario(rawScenario, 'en');
      assert.ok(enScenario.topicTitle, 'Topic title should exist');
      assert.ok(enScenario.dilemmaQuote, 'Dilemma quote should exist');
      assert.ok(enScenario.cognitiveBasis, 'Cognitive basis should exist');
      assert.ok(enScenario.detailedDilemma, 'Detailed dilemma should exist');
      assert.ok(enScenario.visualDetails.locationBadge, 'Location badge should exist');
      assert.ok(enScenario.questions[0].options.length === 4, 'Must have 4 options');

      for (const opt of enScenario.questions[0].options) {
        assert.ok(opt.text.length > 0, 'Option text cannot be empty');
        assert.ok(opt.feedback.length > 0, 'Feedback cannot be empty');
        if (opt.score < 100) {
          assert.ok(opt.whyWrong && opt.whyWrong.length > 0, 'Suboptimal options must have whyWrong explanation');
        }
      }
    }
  });

  it('3. SEED ITEMS LOCALIZATION: Items translate correctly in English and fall back cleanly in Arabic', () => {
    for (const item of INITIAL_SEED_ITEMS) {
      const arItem = getLocalizedItem(item, 'ar');
      const enItem = getLocalizedItem(item, 'en');

      assert.strictEqual(arItem.title, item.title);
      assert.ok(enItem.title.length > 0);
      assert.ok(enItem.description.length > 0);
    }
  });

  it('4. USER ROSTER LOCALIZATION: Users have English names and grades', () => {
    for (const user of DEMO_USERS) {
      const enUser = getLocalizedUser(user, 'en');
      assert.ok(enUser.name.length > 0);
      assert.ok(enUser.grade.length > 0);
    }
  });

  it('5. LOCATION & CATEGORY METADATA: Locations and categories have complete English descriptions', () => {
    for (const loc of SCHOOL_LOCATIONS) {
      const enLoc = getLocalizedLocation(loc, 'en');
      assert.ok(enLoc.name.length > 0);
      assert.ok(enLoc.building.length > 0);
      assert.ok(enLoc.floor.length > 0);
    }

    for (const cat of CATEGORIES) {
      assert.ok(CATEGORY_DESCRIPTIONS_EN[cat.id], `Category ${cat.id} must have English description`);
    }
  });

  it('6. DATE & REPORTER FORMATTING: Date and reporter labels format properly in English and Arabic', () => {
    const testDate = '2026-08-29T10:30:00.000Z';
    const arDate = formatAppDate(testDate, 'ar');
    const enDate = formatAppDate(testDate, 'en');

    assert.ok(arDate.length > 0);
    assert.ok(enDate.length > 0);
    assert.notStrictEqual(arDate, enDate);

    const adminLabelEn = getPublicReporterLabel('admin', false, 'at_office', 'en');
    const studentLabelEn = getPublicReporterLabel('student', true, 'with_finder', 'en');
    assert.strictEqual(adminLabelEn, 'School Administration Custody');
    assert.strictEqual(studentLabelEn, 'School Student');
  });

  it('7. MATCHING ENGINE REASONS: Match reasons return in requested language', () => {
    const malakCalc = INITIAL_SEED_ITEMS.find((i) => i.id === 'item_malak_lost_calc')!;
    const foundCalc = INITIAL_SEED_ITEMS.find((i) => i.id === 'item_found_calc_lab')!;

    const matchAr = calculateMatchScore(malakCalc, foundCalc, 'ar');
    const matchEn = calculateMatchScore(malakCalc, foundCalc, 'en');

    assert.ok(matchAr.totalScore >= 80);
    assert.ok(matchEn.totalScore >= 80);
    assert.ok(matchAr.matchReasons.some((r) => r.includes('فئة') || r.includes('موقع') || r.includes('اللون')));
    assert.ok(matchEn.matchReasons.some((r) => r.includes('category') || r.includes('location') || r.includes('Color (Black)')));
  });
});
