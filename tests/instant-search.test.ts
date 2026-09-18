import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeArabicSearch } from '../src/components/InstantSearchBar';

describe('Instant Live Search & Arabic Normalization Engine', () => {
  describe('1. Arabic Normalization (normalizeArabicSearch)', () => {
    it('1.1 Normalizes all Alef forms (أ, إ, آ) to bare alef (ا)', () => {
      assert.strictEqual(normalizeArabicSearch('أحمد'), 'احمد');
      assert.strictEqual(normalizeArabicSearch('إلكترونيات'), 'الكترونيات');
      assert.strictEqual(normalizeArabicSearch('آمنة'), 'امنه');
      assert.strictEqual(normalizeArabicSearch('أمانة'), 'امانه');
    });

    it('1.2 Normalizes Taa Marbuta (ة) to Haa (ه)', () => {
      assert.strictEqual(normalizeArabicSearch('حاسبة'), 'حاسبه');
      assert.strictEqual(normalizeArabicSearch('ساعة'), 'ساعه');
      assert.strictEqual(normalizeArabicSearch('نظارة'), 'نظاره');
      assert.strictEqual(normalizeArabicSearch('حقيبة'), 'حقيبه');
    });

    it('1.3 Normalizes Alif Maqsura (ى) to Yaa (ي)', () => {
      assert.strictEqual(normalizeArabicSearch('مبنى'), 'مبني');
      assert.strictEqual(normalizeArabicSearch('هدى'), 'هدي');
      assert.strictEqual(normalizeArabicSearch('مستشفى'), 'مستشفي');
    });

    it('1.4 Strips all Arabic Tashkeel and Diacritics', () => {
      assert.strictEqual(normalizeArabicSearch('حَاسِبَةٌ'), 'حاسبه');
      assert.strictEqual(normalizeArabicSearch('مَلَك مُحَمَّد'), 'ملك محمد');
      assert.strictEqual(normalizeArabicSearch('أَمَانَةٌ مَدْرَسِيَّةٌ'), 'امانه مدرسيه');
    });

    it('1.5 Safely handles English lowercasing, whitespace and punctuation', () => {
      assert.strictEqual(normalizeArabicSearch('  Casio FX-991EX  '), 'casio fx-991ex');
      assert.strictEqual(normalizeArabicSearch('APPLE Watch Series'), 'apple watch series');
      assert.strictEqual(normalizeArabicSearch(''), '');
      assert.strictEqual(normalizeArabicSearch('   '), '');
    });
  });

  describe('2. Multi-Word and Partial Fuzzy Substring Matching', () => {
    const mockItems = [
      {
        id: '1',
        title: 'آلة حاسبة علمية كاسيو',
        description: 'حاسبة رمادية فُقدت في معمل الرياضيات',
        color: 'رمادي',
        brand: 'Casio',
        location: 'معمل الرياضيات',
      },
      {
        id: '2',
        title: 'ساعة يد أبل ذكية',
        description: 'ساعة سوداء تم العثور عليها في الملعب الرياضي',
        color: 'أسود',
        brand: 'Apple',
        location: 'الملعب والساحة الخارجية',
      },
      {
        id: '3',
        title: 'نظارة طبية بإطار كحلي',
        description: 'نظارة طبية داخل جراب أسود',
        color: 'كحلي',
        brand: 'RayBan',
        location: 'مكتبة المدرسة',
      }
    ];

    function searchMockItems(query: string) {
      const normQuery = normalizeArabicSearch(query);
      const queryWords = normQuery.split(' ').filter(Boolean);

      return mockItems.filter((item) => {
        const haystack = normalizeArabicSearch(
          `${item.title} ${item.description} ${item.color} ${item.brand} ${item.location}`
        );
        return queryWords.every((word) => haystack.includes(word));
      });
    }

    it('2.1 Matches "حاسبه" with "حاسبة" despite taa marbuta divergence', () => {
      const results = searchMockItems('حاسبه');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, '1');
    });

    it('2.2 Matches "اله حاسبه" with "آلة حاسبة" despite alef and taa marbuta divergences', () => {
      const results = searchMockItems('اله حاسبه');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, '1');
    });

    it('2.3 Matches English brand "casio" case-insensitively', () => {
      const results = searchMockItems('CASIO');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, '1');
    });

    it('2.4 Matches location name "الملعب" or "رياضيات"', () => {
      const resultsPlayground = searchMockItems('الملعب');
      assert.strictEqual(resultsPlayground.length, 1);
      assert.strictEqual(resultsPlayground[0].id, '2');

      const resultsMath = searchMockItems('الرياضيات');
      assert.strictEqual(resultsMath.length, 1);
      assert.strictEqual(resultsMath[0].id, '1');
    });

    it('2.5 Returns empty array for non-existent item without errors', () => {
      const results = searchMockItems('دراجة نارية هامر');
      assert.strictEqual(results.length, 0);
    });
  });
});
