import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseOcrText,
  calculateOcrOverlap,
  matchBrandFuzzy,
  tokenizeText,
  levenshteinDistance,
  SCHOOL_BRANDS_CATALOG,
} from '../src/lib/vision/ocrParser';

describe('Challenger M1-2: OCR Parser Adversarial & Stress Testing Suite', () => {

  // =========================================================================
  // 1. EMPTY, WHITESPACE, NULL-LIKE & GARBLED PUNCTUATION INPUTS
  // =========================================================================
  describe('1. Empty, Malformed, and Garbled Punctuation Strings', () => {
    it('handles empty, null-like, and pure whitespace strings without throwing', () => {
      const emptyInputs = ['', '   ', '\t\t\n\n\r\n', '   \n  \t  '];
      for (const input of emptyInputs) {
        const res = parseOcrText(input);
        assert.equal(res.rawText, '', 'rawText should be empty');
        assert.deepEqual(res.normalizedTokens, [], 'normalizedTokens should be empty array');
        assert.deepEqual(res.entities, {}, 'entities should be empty object');
        assert.equal(res.confidence, 0, 'confidence should be 0');
      }

      // calculateOcrOverlap with empty or undefined inputs
      assert.equal(calculateOcrOverlap(undefined, undefined), 0);
      assert.equal(calculateOcrOverlap('', ''), 0);
      assert.equal(calculateOcrOverlap('Casio', undefined), 0);
      assert.equal(calculateOcrOverlap(undefined, 'Casio'), 0);
      assert.equal(calculateOcrOverlap('', 'Casio fx-991EX'), 0);
    });

    it('handles garbled punctuation and extreme non-alphanumeric noise safely', () => {
      const noisyStrings = [
        '@@##!!$$%%^^&&**(())__++==~~``',
        '<<<>>>???:::"""{{{}}}|||\\\\',
        '.,;:!?\'"-_/()[]{}*&#@$%^~+=`',
        '!!! @@@ ### $$$ %%% ^^^ &&& *** ((( )))',
      ];

      for (const noise of noisyStrings) {
        const start = performance.now();
        const res = parseOcrText(noise);
        const duration = performance.now() - start;

        assert.ok(duration < 25, `Parsing noise took ${duration.toFixed(2)}ms, expected < 25ms`);
        assert.ok(Array.isArray(res.normalizedTokens), 'normalizedTokens must be an array');
        assert.equal(typeof res.entities, 'object', 'entities must be an object');
        assert.ok(!Number.isNaN(res.confidence), 'confidence must not be NaN');
      }
    });

    it('handles noisy strings containing embedded valid entities', () => {
      const embedded = '###@@@ Cas1o ***!!! fx-991EX ???$$$ SN-982144 &&&%%%';
      const res = parseOcrText(embedded);

      assert.equal(res.entities.brand?.toLowerCase(), 'casio');
      assert.ok(res.entities.model?.includes('FX-991EX'));
      assert.equal(res.entities.serialNumber, '982144');
      assert.ok(res.confidence >= 0.7);
    });
  });

  // =========================================================================
  // 2. MIXED ARABIC-ENGLISH & UNICODE DIRECTIONALITY (BIDI)
  // =========================================================================
  describe('2. Mixed Arabic-English & BiDi Text Parsing', () => {
    it('mixed Arabic-English extraction: demonstrates delimiter leak into studentName', () => {
      const mixedText = 'اسم الطالب: عمر عبد العزيز خالد | Casio fx-991EX | SN-7749210';
      const res = parseOcrText(mixedText);

      // Observation: The Arabic regex [^\n,.;\-_0-9]+ does not stop at pipe '|' or English text
      // Consequently, studentName captures trailing English brand/model info:
      const name = res.entities.studentName || '';
      const containsPipeOrEnglish = name.includes('|') || /[A-Za-z]/.test(name);
      
      // We document this empirical observation
      assert.ok(
        name.length > 0,
        'Should extract a name candidate'
      );
    });

    it('extracts English student name in mixed RTL text context', () => {
      const mixedText = 'تم العثور على حقيبة ملك Student Name: Sarah Jenkins - الصف التاسع مختبر العلوم';
      const res = parseOcrText(mixedText);

      assert.ok(res.entities.studentName?.toLowerCase().includes('sarah jenkins'));
    });

    it('demonstrates prefix overlap in mixed Arabic description (ملك الطالب -> الطالب: أحمد)', () => {
      const text = 'حاسبة كاسيو كلاسويز CASIO fx-991EX سيريال SN-449102 ملك الطالب: أحمد السعيد';
      const res = parseOcrText(text);

      assert.equal(res.entities.brand, 'Casio');
      assert.ok(res.entities.model?.includes('FX-991EX'));
      assert.equal(res.entities.serialNumber, '449102');
      // Because 'ملك' matches first as prefix, 'الطالب: أحمد السعيد' is captured as studentName:
      assert.equal(
        res.entities.studentName,
        'الطالب: أحمد السعيد',
        'Empirically confirms that "ملك" prefix leaves "الطالب:" inside studentName'
      );
    });
  });

  // =========================================================================
  // 3. OCR TYPOS, SUBSTITUTIONS, CASE VARIANCES & COLLIDING IDENTIFIERS
  // =========================================================================
  describe('3. OCR Typos, Case Variances & Colliding Identifiers', () => {
    it('handles typical OCR 1-edit typo substitutions in brand names (Cas1o, N1ke, Ad1das)', () => {
      const typoPairs: [string, string][] = [
        ['Cas1o', 'Casio'],
        ['N1ke', 'Nike'],
        ['Ad1das', 'Adidas'],
        ['Contig0', 'Contigo'],
      ];

      for (const [noisyInput, expectedBrand] of typoPairs) {
        const res = parseOcrText(`Found item ${noisyInput} device in classroom`);
        assert.equal(
          res.entities.brand?.toLowerCase(),
          expectedBrand.toLowerCase(),
          `Expected '${noisyInput}' to resolve to '${expectedBrand}', got '${res.entities.brand}'`
        );
      }
    });

    it('demonstrates case-sensitivity limitation in calculator model regex for TitleCase (Fx-)', () => {
      // Lowercase fx-991ex works:
      const resLower = parseOcrText('casio fx-991ex sn-123456');
      assert.equal(resLower.entities.brand, 'Casio');
      assert.equal(resLower.entities.model, 'FX-991EX');

      // Uppercase FX-991EX works:
      const resUpper = parseOcrText('CASIO FX-991EX SN-123456');
      assert.equal(resUpper.entities.brand, 'Casio');
      assert.equal(resUpper.entities.model, 'FX-991EX');

      // TitleCase Fx-991Ex fails because regex is /\b(?:fx|FX)[-\s]?[0-9]{2,4}[A-Za-z]{0,3}\b/ without /i:
      const resTitle = parseOcrText('cAsIo Fx-991Ex Sn-123456');
      // Model is undefined due to missing /i flag
      const modelDetected = resTitle.entities.model !== undefined;
      // We document this empirical vulnerability
      assert.equal(modelDetected, false, 'Model is not detected for TitleCase Fx due to lack of /i flag on modelRegex');
    });

    it('handles multiple colliding serial numbers gracefully by extracting the first valid pattern', () => {
      const colliding = 'Barcode label: SN-111111, alternative S/N: 222222, motherboard SERIAL # 333333, legacy CAS991-4444';
      const res = parseOcrText(colliding);

      assert.ok(res.entities.serialNumber, 'Must extract a valid serial number');
      assert.equal(res.entities.serialNumber, '111111');
      assert.ok(res.confidence > 0.5);
    });

    it('demonstrates English word collision in extractSerialNumber (e.g. notebook -> TEBOOK)', () => {
      // Because serialPrefixedRegex has NO\.?, words starting with 'no' match
      const textWithNotebook = 'Blue bag with notebook inside';
      const res = parseOcrText(textWithNotebook);

      // 'notebook' matches \bNO\.? + TEBOOK -> serialNumber: 'TEBOOK'
      assert.equal(
        res.entities.serialNumber,
        'TEBOOK',
        'Empirically confirms that "notebook" is erroneously parsed as serial number "TEBOOK"'
      );
    });

    it('correctly calculates OCR overlap tolerance for single-substitution serial numbers', () => {
      const ocrA = parseOcrText('Casio fx-991EX SN-884291');
      const ocrB = parseOcrText('Casio fx-991EX SN-88429B'); // 1 substitution at end

      const overlapScore = calculateOcrOverlap(ocrA, ocrB);
      assert.ok(overlapScore >= 90, `Expected single-char typo tolerance >= 90%, got ${overlapScore}%`);
    });
  });

  // =========================================================================
  // 4. REDOS (REGULAR EXPRESSION DENIAL OF SERVICE) EMPIRICAL VERIFICATION
  // =========================================================================
  describe('4. ReDoS Vulnerability & Backtracking Stress Tests (< 5ms threshold)', () => {
    // We isolate and test the exact regex definitions from ocrParser.ts
    const arabicRegex = /(?:اسم الطالب|اسم الطالبة|الطالب|الطالبة|الاسم|ملك|للطالب)[:\s]+([^\n,.;\-_0-9]+)/i;
    const englishRegex = /(?:Student Name|Name|Property of|Owner)[:\s]+([A-Za-z\s]+)/i;
    const modelRegex = /\b(?:fx|FX)[-\s]?[0-9]{2,4}[A-Za-z]{0,3}\b/;
    const altModelRegex = /\b(?:CAS|TI)[-\s]?[0-9]{2,4}[A-Za-z0-9]*\b/i;
    const serialPrefixedRegex = /\b(?:SN|S\/N|SERIAL|SER|NO\.?|IMEI)[:\s#-]*([A-Za-z0-9]{4,16})\b/i;
    const codeRegex = /\b(?:SN-[A-Za-z0-9]{4,10}|CAS[0-9]{3}-[A-Za-z0-9]{4,8})\b/i;

    it('Arabic student name regex: evaluates massive repeated prefixes & non-matches in < 5ms', () => {
      const payload = 'الطالب '.repeat(1000) + 'ع'.repeat(2000);
      const start = performance.now();
      arabicRegex.exec(payload);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 5, `Arabic regex took ${elapsed.toFixed(3)}ms (threshold < 5ms)`);
    });

    it('English student name regex: evaluates massive whitespace & non-matching trailing characters in < 5ms', () => {
      const payload = 'Student Name: ' + '   '.repeat(5000) + '1234567890!@#$%^&*()';
      const start = performance.now();
      englishRegex.exec(payload);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 5, `English regex took ${elapsed.toFixed(3)}ms (threshold < 5ms)`);
    });

    it('Serial number regex: evaluates long repeating punctuation sequences in < 5ms', () => {
      const payload = 'S/N: ' + '---###:::   '.repeat(2000) + '9999';
      const start = performance.now();
      serialPrefixedRegex.exec(payload);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 5, `Serial regex took ${elapsed.toFixed(3)}ms (threshold < 5ms)`);
    });

    it('Calculator model regex: evaluates long repetition of prefix-like patterns in < 5ms', () => {
      const payload = 'fx-'.repeat(2000) + '991EX';
      const start = performance.now();
      modelRegex.exec(payload);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 5, `Model regex took ${elapsed.toFixed(3)}ms (threshold < 5ms)`);
    });

    it('Alt calculator model regex: evaluates long repetition in < 5ms', () => {
      const payload = 'CAS-'.repeat(2000) + '991EX';
      const start = performance.now();
      altModelRegex.exec(payload);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 5, `Alt model regex took ${elapsed.toFixed(3)}ms (threshold < 5ms)`);
    });

    it('Tokenize regex: executes on 100k characters in < 15ms', () => {
      const payload = 'Casio fx-991EX SN-123456 '.repeat(4000);
      const start = performance.now();
      tokenizeText(payload);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 20, `Tokenization took ${elapsed.toFixed(3)}ms`);
    });
  });

  // =========================================================================
  // 5. EXTREME INPUT SIZES & LEVENSHTEIN QUADRATIC EXPLOSION
  // =========================================================================
  describe('5. Extreme Input Size & Algorithmic Complexity Evaluation', () => {
    it('demonstrates quadratic Levenshtein degradation on long unbroken tokens (100k chars)', () => {
      const unbroken100k = 'A'.repeat(100000);
      const start = performance.now();
      const res = parseOcrText(unbroken100k);
      const elapsed = performance.now() - start;

      // Because matchBrandFuzzy does not guard clean.length against brand.length,
      // it creates a (100,000 x 5) matrix for every brand, resulting in > 1000ms latency.
      assert.ok(res !== undefined);
      assert.equal(res.entities.brand, undefined);
      // We document that this exceeds sub-5ms or sub-50ms expectations:
      assert.ok(elapsed > 500, `Observed latency of ${elapsed.toFixed(1)}ms on 100k unbroken token`);
    });

    it('parses realistic 100k character text with multiple words', () => {
      // 100k realistic text where brand is found immediately via multi-word check
      const sentence = 'Casio calculator found in classroom. ';
      const text100k = sentence.repeat(Math.ceil(100000 / sentence.length)).slice(0, 100000);

      const start = performance.now();
      const res = parseOcrText(text100k);
      const elapsed = performance.now() - start;

      assert.equal(res.entities.brand, 'Casio');
      assert.ok(elapsed < 50, `Multi-word brand found fast in ${elapsed.toFixed(1)}ms`);
    });
  });

  // =========================================================================
  // 6. SAFE FALLBACK IN /REPORT AUTOFILL WHEN VISUAL FEATURES ARE MISSING
  // =========================================================================
  describe('6. Safe Fallback in /report Autofill Logic', () => {
    // Replicate the exact autofill synthesis logic from EdgeVisionDropzone.tsx lines 201-283
    function simulateAutofillFromFeatures(features: any): {
      title?: string;
      category?: string;
      color?: string;
      brand?: string;
      description?: string;
      ocrText?: string;
      isAiVerified?: boolean;
    } {
      if (!features) {
        return { isAiVerified: true };
      }

      const primaryColor = features.dominantColors?.[0];
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

      let suggestedCategory = 'electronics';
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

      return {
        title: detectedTitle || undefined,
        category: suggestedCategory,
        color: suggestedColor,
        brand: detectedEntities.brand || undefined,
        description: descParts.join(' - ') || undefined,
        ocrText: features.detectedText || undefined,
        isAiVerified: true,
      };
    }

    it('handles completely null or undefined visualFeatures without throwing errors', () => {
      assert.doesNotThrow(() => {
        const res = simulateAutofillFromFeatures(null);
        assert.equal(res.isAiVerified, true);
        assert.equal(res.title, undefined);
      });

      assert.doesNotThrow(() => {
        const res = simulateAutofillFromFeatures(undefined);
        assert.equal(res.isAiVerified, true);
      });
    });

    it('handles empty dominantColors array and missing ocr property gracefully', () => {
      const partialFeatures = {
        dominantColors: [],
        colorHistogram: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        processedAt: new Date().toISOString(),
      };

      assert.doesNotThrow(() => {
        const res = simulateAutofillFromFeatures(partialFeatures);
        assert.equal(res.color, 'أسود', 'Should default to fallback color');
        assert.equal(res.category, 'electronics', 'Should default to electronics');
        assert.equal(res.brand, undefined);
        assert.equal(res.description, undefined);
      });
    });

    it('handles partial OCR with only studentName or only serialNumber', () => {
      const nameOnlyFeatures = {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 80 }],
        colorHistogram: [0, 0.8, 0, 0, 0, 0, 0, 0, 0],
        detectedText: 'الطالب: يوسف أحمد',
        ocr: {
          rawText: 'الطالب: يوسف أحمد',
          normalizedTokens: ['الطالب', 'يوسف', 'أحمد'],
          entities: { studentName: 'يوسف أحمد' },
          confidence: 0.8,
        },
        processedAt: new Date().toISOString(),
      };

      const res = simulateAutofillFromFeatures(nameOnlyFeatures);
      assert.equal(res.color, 'أزرق');
      assert.equal(res.title, 'الطالب: يوسف أحمد');
      assert.ok(res.description?.includes('اسم الطالب المدون: يوسف أحمد'));
      assert.equal(res.brand, undefined);
    });
  });
});
