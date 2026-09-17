import { Item, MatchResult, MatchScoreBreakdown, MultimodalSubScores, MultimodalWeights } from '@/types';
import { getLocalizedColorName } from '@/lib/i18n/seedDataTranslations';
import { calculateColorSimilarity } from '@/lib/vision/colorAnalysis';
import { calculateOcrSimilarity, parseOcrText } from '@/lib/vision/ocrParser';

/**
 * Deterministic, Multimodal Explainable AI Matching Engine
 * Pre-filters candidate pool to avoid O(N²) global database scans.
 */

export const CANONICAL_MULTIMODAL_WEIGHTS: MultimodalWeights = {
  visual: 0.25,
  ocr: 0.25,
  category: 0.20,
  location: 0.15,
  temporal: 0.15,
};

export function calculateMatchScore(itemA: Item, itemB: Item, lang: 'ar' | 'en' = 'ar'): MatchScoreBreakdown {
  const isEn = lang === 'en';
  const matchReasons: string[] = [];

  // Check if either item has modern edge visual features
  const hasMultimodalFeatures = Boolean(itemA.visualFeatures || itemB.visualFeatures);

  // --------------------------------------------------------------------------
  // 1. Category Matching
  // --------------------------------------------------------------------------
  let categoryRawScore = 0; // 0 - 100
  let legacyCategoryScore = 0; // 0 - 35
  if (itemA.category === itemB.category) {
    categoryRawScore = 100;
    legacyCategoryScore = 35;
    matchReasons.push(isEn ? 'Exact category match' : 'تطابق تام في فئة الغرض');
  }

  // --------------------------------------------------------------------------
  // 2. Location Matching
  // --------------------------------------------------------------------------
  let locationRawScore = 0; // 0 - 100
  let legacyLocationScore = 0; // 0 - 30
  const nearbyGroups = [
    ['classrooms_g1', 'classrooms_g2', 'library'],
    ['science_lab', 'computer_lab', 'classrooms_g1'],
    ['gym', 'playground'],
    ['cafeteria', 'admin_office', 'prayer_room'],
  ];

  if (itemA.locationId === itemB.locationId) {
    locationRawScore = 100;
    legacyLocationScore = 30;
    matchReasons.push(isEn ? 'Exact location match' : 'تطابق تام في موقع الفقدان والعثور');
  } else {
    const isNearby = nearbyGroups.some(
      (group) => group.includes(itemA.locationId) && group.includes(itemB.locationId)
    );
    if (isNearby) {
      locationRawScore = 50;
      legacyLocationScore = 15;
      matchReasons.push(isEn ? 'Nearby building or facility' : 'تقارب في المبنى والمرافق المجاورة');
    }
  }

  // --------------------------------------------------------------------------
  // 3. Time Proximity
  // --------------------------------------------------------------------------
  let temporalRawScore = 0; // 0 - 100
  let legacyTimeScore = 0; // 0 - 10
  try {
    const timeA = new Date(itemA.date || itemA.createdAt).getTime();
    const timeB = new Date(itemB.date || itemB.createdAt).getTime();
    const diffHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);

    if (diffHours <= 24) {
      temporalRawScore = 100;
      legacyTimeScore = 10;
      matchReasons.push(isEn ? 'Time difference under 24 hours' : 'فارق زمني أقل من 24 ساعة');
    } else if (diffHours <= 72) {
      temporalRawScore = 60;
      legacyTimeScore = 6;
      matchReasons.push(isEn ? 'Time difference within 3 days' : 'فارق زمني خلال 3 أيام');
    } else if (diffHours <= 168) {
      temporalRawScore = 30;
      legacyTimeScore = 3;
      matchReasons.push(isEn ? 'Time difference within 1 week' : 'فارق زمني خلال أسبوع');
    }
  } catch {
    temporalRawScore = 50;
    legacyTimeScore = 5;
  }

  // --------------------------------------------------------------------------
  // 4. Visual (Color) Matching
  // --------------------------------------------------------------------------
  let colorRawScore = 0; // 0 - 100
  let legacyColorPts = 0; // 0 - 8

  if (itemA.visualFeatures?.colorHistogram && itemB.visualFeatures?.colorHistogram) {
    colorRawScore = calculateColorSimilarity(
      itemA.visualFeatures.colorHistogram,
      itemB.visualFeatures.colorHistogram
    );
  } else if (itemA.visualFeatures?.dominantColors && itemB.visualFeatures?.dominantColors) {
    colorRawScore = calculateColorSimilarity(
      itemA.visualFeatures.dominantColors,
      itemB.visualFeatures.dominantColors
    );
  } else if (itemA.color && itemB.color) {
    colorRawScore = calculateColorSimilarity(itemA.color, itemB.color);
  }

  if (itemA.color && itemB.color && itemA.color.trim() === itemB.color.trim()) {
    legacyColorPts = 8;
    if (colorRawScore === 0) colorRawScore = 100;
    matchReasons.push(isEn ? `Color match (${getLocalizedColorName(itemA.color, 'en')})` : `تطابق اللون (${itemA.color})`);
  } else if (colorRawScore >= 75) {
    matchReasons.push(isEn ? `High visual color similarity (${colorRawScore}%)` : `تشابه بصري لوني مرتفع (${colorRawScore}%)`);
  }

  // --------------------------------------------------------------------------
  // 5. OCR & Brand/Text Matching
  // --------------------------------------------------------------------------
  let ocrRawScore = 0; // 0 - 100
  let legacyBrandPts = 0; // 0 - 10

  const ocrA = itemA.visualFeatures?.ocr || parseOcrText(`${itemA.brand || ''} ${itemA.title} ${itemA.description}`);
  const ocrB = itemB.visualFeatures?.ocr || parseOcrText(`${itemB.brand || ''} ${itemB.title} ${itemB.description}`);

  if (ocrA && ocrB) {
    ocrRawScore = calculateOcrSimilarity(ocrA, ocrB);
  }

  // Legacy title/brand matching logic for compatibility
  const brandA = itemA.brand?.toLowerCase().trim() || '';
  const brandB = itemB.brand?.toLowerCase().trim() || '';
  const titleA = itemA.title.toLowerCase();
  const titleB = itemB.title.toLowerCase();

  if (brandA && brandB && (brandA === brandB || brandA.includes(brandB) || brandB.includes(brandA))) {
    legacyBrandPts = 5;
    matchReasons.push(isEn ? `Brand match (${itemA.brand})` : `تطابق الماركة (${itemA.brand})`);
  } else {
    const wordsA = titleA.split(/\s+/).filter((w) => w.length > 2);
    const wordsB = titleB.split(/\s+/).filter((w) => w.length > 2);
    const commonWords = wordsA.filter((w) => wordsB.some((wb) => wb.includes(w) || w.includes(wb)));
    
    if (commonWords.length > 0) {
      legacyBrandPts = 10;
      matchReasons.push(isEn ? `Keyword similarity (${commonWords.slice(0, 2).join(', ')})` : `تشابه الكلمات الدلالية (${commonWords.slice(0, 2).join(', ')})`);
    }
  }

  const legacyFeaturesScore = Math.min(25, legacyColorPts + legacyBrandPts);

  // If OCR detected serial match or model match, add prominent match reason
  if (ocrA?.entities.serialNumber && ocrB?.entities.serialNumber && ocrA.entities.serialNumber.toUpperCase() === ocrB.entities.serialNumber.toUpperCase()) {
    matchReasons.push(isEn ? `Verified Hardware Serial Match (${ocrA.entities.serialNumber})` : `تطابق مؤكد للرقم التسلسلي (${ocrA.entities.serialNumber})`);
  } else if (ocrA?.entities.model && ocrB?.entities.model && ocrA.entities.model.toLowerCase() === ocrB.entities.model.toLowerCase()) {
    matchReasons.push(isEn ? `Device Model Match (${ocrA.entities.model})` : `تطابق موديل الجهاز (${ocrA.entities.model})`);
  } else if (ocrA?.entities.studentName && ocrB?.entities.studentName && ocrA.entities.studentName.toLowerCase().includes(ocrB.entities.studentName.toLowerCase())) {
    matchReasons.push(isEn ? `Student Name Tag Match (${ocrA.entities.studentName})` : `تطابق ملصق اسم الطالب (${ocrA.entities.studentName})`);
  }

  // --------------------------------------------------------------------------
  // Final Score Computation
  // --------------------------------------------------------------------------
  const subScores: MultimodalSubScores = {
    color: colorRawScore,
    ocrText: ocrRawScore,
    category: categoryRawScore,
    location: locationRawScore,
    temporal: temporalRawScore,
  };

  const weights: MultimodalWeights = CANONICAL_MULTIMODAL_WEIGHTS;

  let totalScore: number;

  if (hasMultimodalFeatures) {
    // Canonical Multimodal 5-factor weighted formula
    const weightedSum =
      weights.visual * subScores.color +
      weights.ocr * subScores.ocrText +
      weights.category * subScores.category +
      weights.location * subScores.location +
      weights.temporal * subScores.temporal;

    totalScore = Math.min(100, Math.max(0, Math.round(weightedSum)));
  } else {
    // Exact legacy heuristic for seed items without visual features
    totalScore = Math.min(100, legacyCategoryScore + legacyLocationScore + legacyFeaturesScore + legacyTimeScore);
  }

  return {
    totalScore,
    categoryScore: legacyCategoryScore,
    locationScore: legacyLocationScore,
    featuresScore: legacyFeaturesScore,
    timeScore: legacyTimeScore,
    subScores,
    weights,
    isMultimodal: hasMultimodalFeatures,
    matchReasons,
  };
}

/**
 * Finds top matching candidates with bounded pre-filtering
 */
export function findMatchesForItem(
  targetItem: Item,
  allItems: Item[],
  maxResults = 10,
  lang: 'ar' | 'en' = 'ar'
): MatchResult[] {
  const oppositeType = targetItem.type === 'lost' ? 'found' : 'lost';

  // Candidate pre-filtering to bound computations
  const candidates = allItems.filter(
    (item) =>
      item.type === oppositeType &&
      item.id !== targetItem.id &&
      item.status !== 'reunited' &&
      item.status !== 'archived'
  );

  const results: MatchResult[] = [];

  for (const candidate of candidates) {
    const breakdown = calculateMatchScore(targetItem, candidate, lang);
    if (breakdown.totalScore >= 40) {
      results.push({
        targetItem,
        matchedItem: candidate,
        breakdown,
      });
    }
  }

  return results
    .sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore)
    .slice(0, maxResults);
}
