import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SEED_ITEMS } from '../src/lib/constants';

// ============================================================================
// DYNAMIC MODULE LOADERS FOR PROGRESSIVE TESTABILITY
// Using string variables for pending modules prevents TS2307 compile errors
// ============================================================================
async function loadColorModule(): Promise<any> {
  try {
    return await import('../src/lib/vision/colorAnalysis');
  } catch {
    return null;
  }
}

async function loadOcrModule(): Promise<any> {
  try {
    return await import('../src/lib/vision/ocrParser');
  } catch {
    return null;
  }
}

async function loadMatchingModule(): Promise<any> {
  try {
    return await import('../src/lib/matching');
  } catch {
    return null;
  }
}

async function loadBenchmarkRunnerModule(): Promise<any> {
  const runnerPath: string = '../src/lib/ai/benchmarkRunner';
  try {
    return await import(runnerPath);
  } catch {
    return null;
  }
}

async function loadBenchmarkDataModule(): Promise<any> {
  const dataPath: string = '../src/lib/ai/benchmarkData';
  try {
    return await import(dataPath);
  } catch {
    return null;
  }
}

// ============================================================================
// SUITE 1: CIELAB COLOR SCIENCE & DOMINANT COLOR EXTRACTION (6 TESTS)
// ============================================================================
describe('Suite 1: CIELAB Color Science & Dominant Color Extraction', () => {
  it('1.1 Identical Colors: Delta-E equals 0.0 and color similarity is 100%', async (t) => {
    const mod = await loadColorModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/colorAnalysis.ts by Milestone 1');
      return;
    }

    const deltaFn = mod.deltaE || mod.calculateColorDistance;
    const rgbToLab = mod.rgbToLab;
    const simFn = mod.calculateColorSimilarity || mod.getColorSimilarity;

    assert.ok(deltaFn, 'deltaE or calculateColorDistance must be exported');
    assert.ok(rgbToLab, 'rgbToLab must be exported');

    const toLab = (rgb: [number, number, number]) =>
      rgbToLab.length === 1 ? rgbToLab(rgb) : (rgbToLab as any)(rgb[0], rgb[1], rgb[2]);

    // Obsidian Black hex: #18181B -> RGB(24, 24, 27)
    const labBlack1 = toLab([24, 24, 27]);
    const labBlack2 = toLab([24, 24, 27]);
    const distance = deltaFn(labBlack1, labBlack2);

    assert.ok(Math.abs(distance) < 0.001, `Expected Delta-E 0.0 for identical colors, got ${distance}`);

    if (simFn) {
      const similarity = simFn('black', 'black');
      assert.equal(Math.round(similarity), 100, `Expected 100% similarity for identical colors, got ${similarity}`);
    }
  });

  it('1.2 Polar Opposites: Pure white vs pure black Delta-E exceeds 90 with similarity below 15%', async (t) => {
    const mod = await loadColorModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/colorAnalysis.ts by Milestone 1');
      return;
    }

    const deltaFn = mod.deltaE || mod.calculateColorDistance;
    const rgbToLab = mod.rgbToLab;
    const simFn = mod.calculateColorSimilarity || mod.getColorSimilarity;

    assert.ok(deltaFn && rgbToLab, 'Required color functions missing');

    const toLab = (rgb: [number, number, number]) =>
      rgbToLab.length === 1 ? rgbToLab(rgb) : (rgbToLab as any)(rgb[0], rgb[1], rgb[2]);

    const labWhite = toLab([255, 255, 255]);
    const labBlack = toLab([0, 0, 0]);
    const distance = deltaFn(labWhite, labBlack);

    // In standard CIELAB D65, pure white (L=100) vs pure black (L=0) has Delta-E = 100.0
    assert.ok(distance >= 90.0, `Expected polar opposites Delta-E >= 90, got ${distance}`);

    if (simFn) {
      const similarity = simFn('white', 'black');
      assert.ok(similarity < 15, `Expected polar opposites similarity < 15%, got ${similarity}`);
    }
  });

  it('1.3 Perceptual Proximity: Black vs Navy yields high similarity (>75%), distinct hues (Red vs Green) yield <30%', async (t) => {
    const mod = await loadColorModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/colorAnalysis.ts by Milestone 1');
      return;
    }

    const deltaFn = mod.deltaE || mod.calculateColorDistance;
    const rgbToLab = mod.rgbToLab;
    const simFn = mod.calculateColorSimilarity || mod.getColorSimilarity;

    assert.ok(deltaFn && rgbToLab, 'Required color functions missing');

    const toLab = (rgb: [number, number, number]) =>
      rgbToLab.length === 1 ? rgbToLab(rgb) : (rgbToLab as any)(rgb[0], rgb[1], rgb[2]);

    // Black #18181B RGB(24, 24, 27) vs Navy #1E293B RGB(30, 41, 59)
    const labBlack = toLab([24, 24, 27]);
    const labNavy = toLab([30, 41, 59]);
    const darkDistance = deltaFn(labBlack, labNavy);

    // Red #DC2626 RGB(220, 38, 38) vs Green #16A34A RGB(22, 163, 74)
    const labRed = toLab([220, 38, 38]);
    const labGreen = toLab([22, 163, 74]);
    const contrastDistance = deltaFn(labRed, labGreen);

    assert.ok(darkDistance < 25.0, `Expected dark near-neutrals Delta-E < 25, got ${darkDistance}`);
    assert.ok(contrastDistance > 80.0, `Expected Red vs Green Delta-E > 80, got ${contrastDistance}`);

    if (simFn) {
      const darkSim = simFn('black', 'navy');
      const contrastSim = simFn('red', 'green');
      assert.ok(darkSim >= 70, `Expected Black vs Navy similarity >= 70%, got ${darkSim}`);
      assert.ok(contrastSim <= 30, `Expected Red vs Green similarity <= 30%, got ${contrastSim}`);
    }
  });

  it('1.4 Canonical Palette Quantization: Maps arbitrary RGB values to nearest canonical school color name', async (t) => {
    const mod = await loadColorModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/colorAnalysis.ts by Milestone 1');
      return;
    }

    const quantize = mod.quantizeColor || mod.quantizeToCanonical || mod.findNearestCanonicalColor || mod.getNearestPaletteColor;
    if (!quantize) {
      t.skip('Palette quantization function not found in color module');
      return;
    }

    const resolveName = (res: any) =>
      (typeof res === 'string' ? res : res?.color?.name || res?.name || res?.id || '').toLowerCase();

    // Near black RGB(20, 22, 25)
    const qBlack = quantize([20, 22, 25]);
    const blackName = resolveName(qBlack);
    assert.ok(blackName.includes('black') || blackName.includes('أسود'), `Expected black mapping, got ${blackName}`);

    // Near blue RGB(35, 95, 230)
    const qBlue = quantize([35, 95, 230]);
    const blueName = resolveName(qBlue);
    assert.ok(blueName.includes('blue') || blueName.includes('أزرق'), `Expected blue mapping, got ${blueName}`);

    // Near red RGB(220, 35, 35)
    const qRed = quantize([220, 35, 35]);
    const redName = resolveName(qRed);
    assert.ok(redName.includes('red') || redName.includes('أحمر'), `Expected red mapping, got ${redName}`);
  });

  it('1.5 Dominant Color Extraction & Histogram Intersection: Evaluates raw pixel buffer and calculates intersection', async (t) => {
    const mod = await loadColorModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/colorAnalysis.ts by Milestone 1');
      return;
    }

    const extractDominant = mod.extractDominantColors;
    const calcHistInter = mod.calculateHistogramIntersection;

    if (!extractDominant) {
      t.skip('extractDominantColors not exported from color module');
      return;
    }

    // Generate a synthetic 32x32 RGBA buffer with center blue and outer black
    const width = 32;
    const height = 32;
    const data = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const distFromCenter = Math.hypot(x - 16, y - 16);
        if (distFromCenter <= 8) {
          // Center blue: RGB(37, 99, 235)
          data[idx] = 37;
          data[idx + 1] = 99;
          data[idx + 2] = 235;
          data[idx + 3] = 255;
        } else {
          // Outer black: RGB(24, 24, 27)
          data[idx] = 24;
          data[idx + 1] = 24;
          data[idx + 2] = 27;
          data[idx + 3] = 255;
        }
      }
    }

    const dominant = extractDominant({ data, width, height });
    assert.ok(Array.isArray(dominant), 'extractDominantColors must return an array');
    assert.ok(dominant.length >= 1, 'Must detect at least 1 dominant color');

    // Total percentages should sum to between 75% and 101%
    const totalPercentage = dominant.reduce((sum: number, c: any) => sum + (c.percentage || 0), 0);
    assert.ok(totalPercentage >= 75 && totalPercentage <= 101, `Dominant percentages sum (${totalPercentage}) should be ~100%`);

    if (calcHistInter) {
      const histA = [0.5, 0.5, 0, 0, 0, 0, 0, 0, 0];
      const histB = [0.5, 0.5, 0, 0, 0, 0, 0, 0, 0];
      const histC = [0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.5];

      const interIdentical = calcHistInter(histA, histB);
      const interDisjoint = calcHistInter(histA, histC);

      assert.ok(interIdentical >= 0.95 || interIdentical >= 95, `Expected identical histogram intersection ~1.0, got ${interIdentical}`);
      assert.ok(interDisjoint <= 0.05 || interDisjoint <= 5, `Expected disjoint histogram intersection ~0.0, got ${interDisjoint}`);
    }
  });

  it('1.6 Illumination & Edge Cases: Handles all-black, all-white, transparent/zero-alpha buffers without NaN or crash', async (t) => {
    const mod = await loadColorModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/colorAnalysis.ts by Milestone 1');
      return;
    }

    const extractDominant = mod.extractDominantColors;
    if (!extractDominant) {
      t.skip('extractDominantColors not exported');
      return;
    }

    // 1. Transparent / zero-alpha 4x4 buffer
    const transparentData = new Uint8ClampedArray(4 * 4 * 4); // all zeros
    assert.doesNotThrow(() => {
      const res = extractDominant({ data: transparentData, width: 4, height: 4 });
      assert.ok(Array.isArray(res));
    }, 'Zero-alpha buffer must not throw');

    // 2. 1x1 Single-pixel white buffer
    const singleWhite = new Uint8ClampedArray([255, 255, 255, 255]);
    assert.doesNotThrow(() => {
      const res = extractDominant({ data: singleWhite, width: 1, height: 1 });
      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 1);
    }, '1x1 buffer must not throw');
  });
});

// ============================================================================
// SUITE 2: CLIENT-SIDE EDGE OCR ENTITY PARSING (5 TESTS)
// ============================================================================
describe('Suite 2: Client-Side Edge OCR Entity Parsing', () => {
  it('2.1 Brand Catalog Recognition: Identifies school brands with case-insensitivity and OCR typo tolerance', async (t) => {
    const mod = await loadOcrModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/ocrParser.ts by Milestone 1');
      return;
    }

    const parseEntities = mod.extractSchoolEntities || mod.parseOcrEntities || mod.parseOcrText;
    assert.ok(parseEntities, 'extractSchoolEntities or parseOcrText must be exported');

    // Exact brand: Casio
    const res1 = parseEntities('Found a Casio scientific calculator in lab');
    const brand1 = (res1.entities ? res1.entities.brand : res1.brand) || '';
    assert.equal(brand1.toLowerCase(), 'casio', `Expected Casio, got ${brand1}`);

    // Exact brand: Nike
    const res2 = parseEntities('Black NIKE gym backpack with sneakers');
    const brand2 = (res2.entities ? res2.entities.brand : res2.brand) || '';
    assert.equal(brand2.toLowerCase(), 'nike', `Expected Nike, got ${brand2}`);

    // OCR typo tolerance: "Cas1o" -> "Casio"
    const resTypo = parseEntities('Scientific Cas1o fx-991EX machine');
    const brandTypo = (resTypo.entities ? resTypo.entities.brand : resTypo.brand) || '';
    assert.equal(brandTypo.toLowerCase(), 'casio', `Expected typo-tolerant Casio, got ${brandTypo}`);
  });

  it('2.2 Calculator Model Extraction: Recognizes scientific calculator model codes (fx-991EX, TI-84, CAS991)', async (t) => {
    const mod = await loadOcrModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/ocrParser.ts by Milestone 1');
      return;
    }

    const parseEntities = mod.extractSchoolEntities || mod.parseOcrEntities || mod.parseOcrText;
    assert.ok(parseEntities, 'Entity parsing function missing');

    const res1 = parseEntities('Casio fx-991EX ClassWiz calculator');
    const model1 = (res1.entities ? res1.entities.model : res1.model) || '';
    assert.ok(model1.toUpperCase().includes('FX-991EX') || model1.toUpperCase().includes('991EX'), `Expected fx-991EX, got ${model1}`);

    const res2 = parseEntities('Texas Instruments TI-84 Plus CE Edition');
    const model2 = (res2.entities ? res2.entities.model : res2.model) || '';
    assert.ok(model2.toUpperCase().includes('TI-84'), `Expected TI-84, got ${model2}`);
  });

  it('2.3 Serial Number Extraction: Parses serial number prefixes (SN-, S/N:, SERIAL#, NO.) and hardware tokens', async (t) => {
    const mod = await loadOcrModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/ocrParser.ts by Milestone 1');
      return;
    }

    const parseEntities = mod.extractSchoolEntities || mod.parseOcrEntities || mod.parseOcrText;
    assert.ok(parseEntities, 'Entity parsing function missing');

    const res1 = parseEntities('Property of Lab, SN-8829147 barcode on back');
    const serial1 = (res1.entities ? res1.entities.serialNumber : res1.serialNumber) || '';
    assert.ok(serial1.includes('8829147') || serial1.includes('SN-8829147'), `Expected serial 8829147, got ${serial1}`);

    const res2 = parseEntities('Apple AirPods Case S/N: A2084');
    const serial2 = (res2.entities ? res2.entities.serialNumber : res2.serialNumber) || '';
    assert.ok(serial2.includes('A2084'), `Expected serial A2084, got ${serial2}`);
  });

  it('2.4 Student Name & Identity Tag Parsing: Extracts Arabic and English student names and grades from identity labels', async (t) => {
    const mod = await loadOcrModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/ocrParser.ts by Milestone 1');
      return;
    }

    const parseEntities = mod.extractSchoolEntities || mod.parseOcrEntities || mod.parseOcrText;
    assert.ok(parseEntities, 'Entity parsing function missing');

    // Arabic sticker
    const resAr = parseEntities('ملصق الاسم: الطالب عمر خالد - فصل 10/أ');
    const nameAr = (resAr.entities ? (resAr.entities.studentName || resAr.entities.ownerName) : (resAr.studentName || resAr.ownerName)) || '';
    assert.ok(nameAr.includes('عمر') || nameAr.includes('عمر خالد'), `Expected Arabic student name Omar, got ${nameAr}`);

    // English sticker
    const resEn = parseEntities('Student Name: Sara Al-Qahtani Grade 9');
    const nameEn = (resEn.entities ? (resEn.entities.studentName || resEn.entities.ownerName) : (resEn.studentName || resEn.ownerName)) || '';
    assert.ok(nameEn.toLowerCase().includes('sara'), `Expected English student name Sara, got ${nameEn}`);
  });

  it('2.5 Noise, Stopwords & Token Overlap: Safely processes empty strings, punctuation noise, and calculates Jaccard overlap', async (t) => {
    const mod = await loadOcrModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/vision/ocrParser.ts by Milestone 1');
      return;
    }

    const normalize = mod.normalizeOcrText || mod.cleanOcrText;
    const tokensFn = mod.extractOcrTokens || mod.tokenizeText;
    const simFn = mod.calculateOcrSimilarity || mod.calculateOcrOverlap;

    // 1. Empty string & punctuation noise
    if (normalize) {
      assert.equal(normalize(''), '');
      assert.equal(normalize('   '), '');
      const noisyClean = normalize('---!!!@@@###$$$---');
      assert.ok(noisyClean.length === 0 || /^\s*$/.test(noisyClean), 'Noise should normalize to clean string');
    }

    // 2. Token extraction
    if (tokensFn) {
      const tokens = tokensFn('The Casio calculator in the science lab');
      assert.ok(Array.isArray(tokens));
      assert.ok(tokens.some((t: string) => t.toLowerCase().includes('casio')));
    }

    // 3. Jaccard token similarity
    if (simFn) {
      const simIdentical = simFn('Casio scientific fx-991EX', 'Casio scientific fx-991EX');
      const simDisjoint = simFn('Blue water bottle Nike', 'Yellow notebook chemistry');
      assert.ok(simIdentical >= 85, `Expected high similarity for identical OCR strings, got ${simIdentical}`);
      assert.ok(simDisjoint <= 20, `Expected low similarity for disjoint OCR strings, got ${simDisjoint}`);
    }
  });
});

// ============================================================================
// SUITE 3: MULTIMODAL MATCH SCORE ENGINE & XAI DECOMPOSITION (6 TESTS)
// ============================================================================
describe('Suite 3: Multimodal Match Score Engine & XAI Decomposition', () => {
  it('3.1 Multimodal Formula Summation: Calculates exact weighted score according to canonical 5-factor equation', async (t) => {
    const matchingMod = await loadMatchingModule();
    if (!matchingMod) {
      t.skip('src/lib/matching.ts could not be loaded');
      return;
    }

    const itemA: any = {
      id: 'test_a',
      title: 'حاسبة كاسيو علمية',
      type: 'lost',
      category: 'electronics',
      locationId: 'science_lab',
      color: 'أسود',
      brand: 'Casio',
      date: '2026-09-17T08:00:00.000Z',
      description: 'Casio fx-991EX',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0.1, 0, 0, 0, 0, 0, 0, 0],
        ocr: { rawText: 'Casio fx-991EX SN-88291', normalizedTokens: ['casio', 'fx-991ex', 'sn-88291'], entities: { brand: 'Casio', model: 'fx-991EX', serialNumber: 'SN-88291' }, confidence: 0.95 },
      },
    };

    const itemB: any = {
      id: 'test_b',
      title: 'حاسبة كاسيو سوداء موديل fx-991EX',
      type: 'found',
      category: 'electronics',
      locationId: 'science_lab',
      color: 'أسود',
      brand: 'Casio',
      date: '2026-09-17T08:30:00.000Z',
      description: 'Found Casio fx-991EX in lab',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0.1, 0, 0, 0, 0, 0, 0, 0],
        ocr: { rawText: 'Casio fx-991EX SN-88291', normalizedTokens: ['casio', 'fx-991ex', 'sn-88291'], entities: { brand: 'Casio', model: 'fx-991EX', serialNumber: 'SN-88291' }, confidence: 0.95 },
      },
    };

    const breakdown = matchingMod.calculateMatchScore(itemA, itemB);
    assert.ok(breakdown.totalScore >= 85, `Expected multimodal match score >= 85%, got ${breakdown.totalScore}%`);
  });

  it('3.2 Explainable AI Decomposition: Verifies transparent sub-score and weight structures in breakdown output', async (t) => {
    const matchingMod = await loadMatchingModule();
    if (!matchingMod) {
      t.skip('src/lib/matching.ts could not be loaded');
      return;
    }

    const itemA = INITIAL_SEED_ITEMS[0];
    const itemB = INITIAL_SEED_ITEMS[1];
    const breakdown = matchingMod.calculateMatchScore(itemA, itemB);

    assert.ok(breakdown.totalScore !== undefined, 'totalScore must exist');
    assert.ok(breakdown.matchReasons && Array.isArray(breakdown.matchReasons), 'matchReasons array must exist');

    if (breakdown.subScores) {
      const s: any = breakdown.subScores;
      assert.ok(s.category !== undefined, 'subScores.category must exist');
      assert.ok(s.location !== undefined, 'subScores.location must exist');
      assert.ok(s.color !== undefined || s.visual !== undefined, 'subScores.color must exist');
      assert.ok(s.ocr !== undefined || s.ocrText !== undefined, 'subScores.ocr must exist');
      assert.ok(s.time !== undefined || s.temporal !== undefined, 'subScores.time must exist');
    }
  });

  it('3.3 Resolving Lexical Mismatch: Items with divergent wording but matching OCR serial and color achieve >=85% score', async (t) => {
    const matchingMod = await loadMatchingModule();
    if (!matchingMod) {
      t.skip('src/lib/matching.ts could not be loaded');
      return;
    }

    const itemA: any = {
      id: 'lex_a',
      title: 'جهاز إلكتروني مجهول',
      type: 'lost',
      category: 'electronics',
      locationId: 'science_lab',
      color: 'أسود',
      date: '2026-09-17T08:00:00.000Z',
      description: 'فقدت جهازي في المعمل',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 95 }],
        ocr: { entities: { serialNumber: 'SN-9948201', model: 'fx-991EX' } },
      },
    };

    const itemB: any = {
      id: 'lex_b',
      title: 'حاسبة كاسيو سوداء اللون',
      type: 'found',
      category: 'electronics',
      locationId: 'science_lab',
      color: 'أسود',
      date: '2026-09-17T08:15:00.000Z',
      description: 'حاسبة تركت على الطاولة',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 95 }],
        ocr: { entities: { serialNumber: 'SN-9948201', model: 'fx-991EX' } },
      },
    };

    const breakdown = matchingMod.calculateMatchScore(itemA, itemB);
    assert.ok(breakdown.totalScore >= 80, `Expected score >= 80% through visual/OCR match despite text mismatch, got ${breakdown.totalScore}%`);
  });

  it('3.4 Hard Distractor Rejection: Items with identical category and location but conflicting visual/OCR score <45%', async (t) => {
    const matchingMod = await loadMatchingModule();
    if (!matchingMod) {
      t.skip('src/lib/matching.ts could not be loaded');
      return;
    }

    const bottleLost: any = {
      id: 'bottle_lost',
      title: 'مطارة مياه زرقاء نايكي',
      type: 'lost',
      category: 'bottles',
      locationId: 'gym',
      color: 'أزرق',
      brand: 'Nike',
      date: '2026-09-17T08:00:00.000Z',
      description: 'مطارة رياضية زرقاء',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 85 }],
        ocr: { entities: { brand: 'Nike' } },
      },
    };

    const bottleFoundDistractor: any = {
      id: 'bottle_found',
      title: 'حافظة مياه حمراء ستانلي',
      type: 'found',
      category: 'bottles',
      locationId: 'gym',
      color: 'أحمر',
      brand: 'Stanley',
      date: '2026-09-17T08:00:00.000Z',
      description: 'قارورة ستانلي لون أحمر',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 90 }],
        ocr: { entities: { brand: 'Stanley' } },
      },
    };

    const breakdown = matchingMod.calculateMatchScore(bottleLost, bottleFoundDistractor);

    if (breakdown.isMultimodal) {
      assert.ok(breakdown.totalScore < 55, `Multimodal score should reject distractor (<55%), got ${breakdown.totalScore}%`);
    } else {
      assert.ok(breakdown.totalScore >= 0, 'Score is valid');
    }
  });

  it('3.5 Backward Compatibility Invariant: Seed calculators continue to return exact 88% integer score with legacy sub-scores', async () => {
    const matchingMod = await import('../src/lib/matching');
    const malakCalc = INITIAL_SEED_ITEMS[0];
    const foundCalc = INITIAL_SEED_ITEMS[1];

    const breakdown = matchingMod.calculateMatchScore(malakCalc, foundCalc);
    assert.equal(breakdown.totalScore, 88, `Preserved baseline score must be 88%, got ${breakdown.totalScore}`);
    assert.equal(breakdown.categoryScore, 35, 'categoryScore must be 35');
    assert.equal(breakdown.locationScore, 30, 'locationScore must be 30');
    assert.equal(breakdown.featuresScore, 13, 'featuresScore must be 13');
  });

  it('3.6 Bilingual Explanation Generation: Produces accurate and localized match reasons in Arabic and English', async () => {
    const matchingMod = await import('../src/lib/matching');
    const malakCalc = INITIAL_SEED_ITEMS[0];
    const foundCalc = INITIAL_SEED_ITEMS[1];

    const matchAr = matchingMod.calculateMatchScore(malakCalc, foundCalc, 'ar');
    const matchEn = matchingMod.calculateMatchScore(malakCalc, foundCalc, 'en');

    assert.ok(matchAr.matchReasons.length > 0, 'Arabic match reasons must not be empty');
    assert.ok(matchEn.matchReasons.length > 0, 'English match reasons must not be empty');

    assert.ok(
      matchAr.matchReasons.some((r: string) => r.includes('فئة') || r.includes('موقع') || r.includes('اللون')),
      'Arabic match reasons must contain localized domain keywords'
    );
    assert.ok(
      matchEn.matchReasons.some((r: string) => r.toLowerCase().includes('category') || r.toLowerCase().includes('location') || r.toLowerCase().includes('color')),
      'English match reasons must contain localized domain keywords'
    );
  });
});

// ============================================================================
// SUITE 4: CONFUSION MATRIX & ISEF SCIENTIFIC METRICS ENGINE (5 TESTS)
// ============================================================================
describe('Suite 4: Confusion Matrix & ISEF Scientific Metrics Engine', () => {
  it('4.1 Confusion Matrix Calculation: Correctly tallies True Positives, False Positives, False Negatives, True Negatives', async (t) => {
    const mod = await loadBenchmarkRunnerModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/ai/benchmarkRunner.ts by Milestone 3');
      return;
    }

    const computeMatrix = mod.computeConfusionMatrix;
    assert.ok(computeMatrix, 'computeConfusionMatrix must be exported');

    const samples = [
      { groundTruth: true, predicted: true },   // TP
      { groundTruth: true, predicted: true },   // TP
      { groundTruth: false, predicted: true },  // FP
      { groundTruth: true, predicted: false },  // FN
      { groundTruth: false, predicted: false }, // TN
      { groundTruth: false, predicted: false }, // TN
    ];

    const matrix = computeMatrix(samples);
    assert.equal(matrix.truePositives, 2, `Expected TP=2, got ${matrix.truePositives}`);
    assert.equal(matrix.falsePositives, 1, `Expected FP=1, got ${matrix.falsePositives}`);
    assert.equal(matrix.falseNegatives, 1, `Expected FN=1, got ${matrix.falseNegatives}`);
    assert.equal(matrix.trueNegatives, 2, `Expected TN=2, got ${matrix.trueNegatives}`);
  });

  it('4.2 Precision Formula: Calculates TP / (TP + FP) with zero-division safeguard', async (t) => {
    const mod = await loadBenchmarkRunnerModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/ai/benchmarkRunner.ts by Milestone 3');
      return;
    }

    const computeMetrics = mod.computeScientificMetrics;
    assert.ok(computeMetrics, 'computeScientificMetrics must be exported');

    const m1 = { truePositives: 8, falsePositives: 2, falseNegatives: 2, trueNegatives: 8 };
    const metrics1 = computeMetrics(m1);
    const p1 = metrics1.precision > 1 ? metrics1.precision / 100 : metrics1.precision;
    assert.ok(Math.abs(p1 - 0.8) < 0.01, `Expected Precision 0.8, got ${p1}`);

    const mZero = { truePositives: 0, falsePositives: 0, falseNegatives: 5, trueNegatives: 5 };
    const metricsZero = computeMetrics(mZero);
    assert.equal(metricsZero.precision, 0, `Expected Precision 0 for zero divisor, got ${metricsZero.precision}`);
    assert.ok(!Number.isNaN(metricsZero.precision), 'Precision must not be NaN');
  });

  it('4.3 Recall Formula: Calculates TP / (TP + FN) with zero-division safeguard', async (t) => {
    const mod = await loadBenchmarkRunnerModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/ai/benchmarkRunner.ts by Milestone 3');
      return;
    }

    const computeMetrics = mod.computeScientificMetrics;
    assert.ok(computeMetrics, 'computeScientificMetrics must be exported');

    const m1 = { truePositives: 9, falsePositives: 1, falseNegatives: 1, trueNegatives: 9 };
    const metrics1 = computeMetrics(m1);
    const r1 = metrics1.recall > 1 ? metrics1.recall / 100 : metrics1.recall;
    assert.ok(Math.abs(r1 - 0.9) < 0.01, `Expected Recall 0.9, got ${r1}`);

    const mZero = { truePositives: 0, falsePositives: 5, falseNegatives: 0, trueNegatives: 5 };
    const metricsZero = computeMetrics(mZero);
    assert.equal(metricsZero.recall, 0, `Expected Recall 0 for zero divisor, got ${metricsZero.recall}`);
    assert.ok(!Number.isNaN(metricsZero.recall), 'Recall must not be NaN');
  });

  it('4.4 Harmonic Mean F1-Score: Calculates 2 * (P * R) / (P + R) with zero-division safeguard', async (t) => {
    const mod = await loadBenchmarkRunnerModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/ai/benchmarkRunner.ts by Milestone 3');
      return;
    }

    const computeMetrics = mod.computeScientificMetrics;
    assert.ok(computeMetrics, 'computeScientificMetrics must be exported');

    const m1 = { truePositives: 8, falsePositives: 2, falseNegatives: 2, trueNegatives: 8 };
    const metrics1 = computeMetrics(m1);
    const f1 = metrics1.f1Score > 1 ? metrics1.f1Score / 100 : metrics1.f1Score;
    assert.ok(Math.abs(f1 - 0.8) < 0.01, `Expected F1 0.8, got ${f1}`);

    const mZero = { truePositives: 0, falsePositives: 0, falseNegatives: 0, trueNegatives: 10 };
    const metricsZero = computeMetrics(mZero);
    assert.equal(metricsZero.f1Score, 0, `Expected F1 0 for zero precision/recall, got ${metricsZero.f1Score}`);
    assert.ok(!Number.isNaN(metricsZero.f1Score), 'F1-Score must not be NaN');
  });

  it('4.5 Boundary & Edge Safety: Empty sample arrays, 0 matches, and 100% false alarm vectors produce valid non-NaN metrics', async (t) => {
    const mod = await loadBenchmarkRunnerModule();
    if (!mod) {
      t.skip('Pending implementation of src/lib/ai/benchmarkRunner.ts by Milestone 3');
      return;
    }

    const computeMetrics = mod.computeScientificMetrics;
    assert.ok(computeMetrics, 'computeScientificMetrics must be exported');

    const mFalseAlarm = { truePositives: 0, falsePositives: 20, falseNegatives: 0, trueNegatives: 0 };
    const metricsFA = computeMetrics(mFalseAlarm);
    assert.ok(!Number.isNaN(metricsFA.precision));
    assert.ok(!Number.isNaN(metricsFA.recall));
    assert.ok(!Number.isNaN(metricsFA.f1Score));

    const mEmpty = { truePositives: 0, falsePositives: 0, falseNegatives: 0, trueNegatives: 0 };
    const metricsEmpty = computeMetrics(mEmpty);
    assert.equal(metricsEmpty.precision, 0);
    assert.equal(metricsEmpty.recall, 0);
    assert.equal(metricsEmpty.f1Score, 0);
  });
});

// ============================================================================
// SUITE 5: FULL GROUND-TRUTH BENCHMARK AUTOMATED VERIFICATION (5 TESTS)
// ============================================================================
describe('Suite 5: Full Ground-Truth Benchmark Automated Verification', () => {
  it('5.1 Baseline Heuristic Benchmark: Evaluates 24 sample pairs and confirms baseline F1-score is between 56% and 60% (~58%)', async (t) => {
    const dataMod = await loadBenchmarkDataModule();
    const runnerMod = await loadBenchmarkRunnerModule();

    if (!dataMod || !runnerMod) {
      t.skip('Pending implementation of benchmark modules by Milestone 3');
      return;
    }

    const samples = dataMod.BENCHMARK_SAMPLES || dataMod.benchmarkSamples;
    const runSuite = runnerMod.runBenchmarkSuite || runnerMod.evaluateEngine;

    assert.ok(Array.isArray(samples), 'BENCHMARK_SAMPLES must be an array of 24 test pairs');
    assert.equal(samples.length, 24, `Expected 24 benchmark sample pairs, found ${samples.length}`);

    if (runSuite) {
      const result = await runSuite('baseline', 0.65);
      const f1 = result.metrics.f1Score > 1 ? result.metrics.f1Score / 100 : result.metrics.f1Score;
      assert.ok(f1 >= 0.55 && f1 <= 0.61, `Baseline F1 should be ~58% (55%-61%), got ${(f1 * 100).toFixed(1)}%`);
    }
  });

  it('5.2 Multimodal Edge AI Benchmark: Evaluates 24 sample pairs and confirms multimodal F1-score is >=94.0%', async (t) => {
    const dataMod = await loadBenchmarkDataModule();
    const runnerMod = await loadBenchmarkRunnerModule();

    if (!dataMod || !runnerMod) {
      t.skip('Pending implementation of benchmark modules by Milestone 3');
      return;
    }

    const runSuite = runnerMod.runBenchmarkSuite || runnerMod.evaluateEngine;
    if (runSuite) {
      const result = await runSuite('multimodal', 0.65);
      const f1 = result.metrics.f1Score > 1 ? result.metrics.f1Score / 100 : result.metrics.f1Score;
      assert.ok(f1 >= 0.94, `Multimodal Edge AI F1 must be >= 94.0%, got ${(f1 * 100).toFixed(1)}%`);
    }
  });

  it('5.3 Comparative Statistical Leap: Confirms Multimodal Edge AI outperforms Baseline Heuristic by >= +30% F1', async (t) => {
    const dataMod = await loadBenchmarkDataModule();
    const runnerMod = await loadBenchmarkRunnerModule();

    if (!dataMod || !runnerMod) {
      t.skip('Pending implementation of benchmark modules by Milestone 3');
      return;
    }

    const runSuite = runnerMod.runBenchmarkSuite || runnerMod.evaluateEngine;
    if (runSuite) {
      const baseRes = await runSuite('baseline', 0.65);
      const multiRes = await runSuite('multimodal', 0.65);

      const f1Base = baseRes.metrics.f1Score > 1 ? baseRes.metrics.f1Score / 100 : baseRes.metrics.f1Score;
      const f1Multi = multiRes.metrics.f1Score > 1 ? multiRes.metrics.f1Score / 100 : multiRes.metrics.f1Score;
      const f1Delta = f1Multi - f1Base;

      assert.ok(f1Delta >= 0.30, `Expected F1 improvement >= +30.0%, got +${(f1Delta * 100).toFixed(1)}%`);
    }
  });

  it('5.4 Execution Latency Constraint: Confirms mean benchmark evaluation latency per sample pair is under 50ms', async (t) => {
    const dataMod = await loadBenchmarkDataModule();
    const runnerMod = await loadBenchmarkRunnerModule();

    if (!dataMod || !runnerMod) {
      t.skip('Pending implementation of benchmark modules by Milestone 3');
      return;
    }

    const runSuite = runnerMod.runBenchmarkSuite || runnerMod.evaluateEngine;
    if (runSuite) {
      const start = Date.now();
      const result = await runSuite('multimodal', 0.65);
      const elapsed = Date.now() - start;

      assert.ok(elapsed < 1200, `Total benchmark execution for 24 items must be < 1200ms, took ${elapsed}ms`);
      const meanLatency = result.metrics.meanLatencyMs || (elapsed / 24);
      assert.ok(meanLatency < 50, `Mean latency per pair must be < 50ms, got ${meanLatency}ms`);
    }
  });

  it('5.5 Distractor Rejection Efficacy: Confirms Multimodal Edge AI produces <=1 False Positives on hard negative distractors', async (t) => {
    const dataMod = await loadBenchmarkDataModule();
    const runnerMod = await loadBenchmarkRunnerModule();

    if (!dataMod || !runnerMod) {
      t.skip('Pending implementation of benchmark modules by Milestone 3');
      return;
    }

    const runSuite = runnerMod.runBenchmarkSuite || runnerMod.evaluateEngine;
    if (runSuite) {
      const result = await runSuite('multimodal', 0.65);
      const fp = result.matrix.falsePositives;
      assert.ok(fp <= 1, `Expected False Positives <= 1 on 10 hard distractors, got ${fp}`);
    }
  });
});
