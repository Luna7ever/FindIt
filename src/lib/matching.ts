import { Item, MatchResult, MatchScoreBreakdown } from '@/types';

/**
 * Deterministic, Bounded Matching Engine
 * Pre-filters candidate pool to avoid O(N²) global database scans.
 */

export function calculateMatchScore(itemA: Item, itemB: Item): MatchScoreBreakdown {
  const matchReasons: string[] = [];
  let categoryScore = 0;
  let locationScore = 0;
  let featuresScore = 0;
  let timeScore = 0;

  // 1. Category Match (Max 35 pts)
  if (itemA.category === itemB.category) {
    categoryScore = 35;
    matchReasons.push('تطابق تام في فئة الغرض');
  }

  // 2. Location Match (Max 30 pts)
  if (itemA.locationId === itemB.locationId) {
    locationScore = 30;
    matchReasons.push('تطابق تام في موقع الفقدان والعثور');
  } else {
    // Proximity groups
    const nearbyGroups = [
      ['classrooms_g1', 'classrooms_g2', 'library'],
      ['science_lab', 'computer_lab', 'classrooms_g1'],
      ['gym', 'playground'],
      ['cafeteria', 'admin_office', 'prayer_room'],
    ];

    const isNearby = nearbyGroups.some(
      (group) => group.includes(itemA.locationId) && group.includes(itemB.locationId)
    );

    if (isNearby) {
      locationScore = 15;
      matchReasons.push('تقارب في المبنى والمرافق المجاورة');
    }
  }

  // 3. Color & Brand / Feature Keywords (Max 25 pts)
  let colorPts = 0;
  let brandPts = 0;

  if (itemA.color && itemB.color && itemA.color.trim() === itemB.color.trim()) {
    colorPts = 8;
    matchReasons.push(`تطابق اللون (${itemA.color})`);
  }

  const brandA = itemA.brand?.toLowerCase().trim() || '';
  const brandB = itemB.brand?.toLowerCase().trim() || '';
  const titleA = itemA.title.toLowerCase();
  const titleB = itemB.title.toLowerCase();

  if (brandA && brandB && (brandA === brandB || brandA.includes(brandB) || brandB.includes(brandA))) {
    brandPts = 5;
    matchReasons.push(`تطابق الماركة (${itemA.brand})`);
  } else {
    const wordsA = titleA.split(/\s+/).filter((w) => w.length > 2);
    const wordsB = titleB.split(/\s+/).filter((w) => w.length > 2);
    const commonWords = wordsA.filter((w) => wordsB.some((wb) => wb.includes(w) || w.includes(wb)));
    
    if (commonWords.length > 0) {
      brandPts = 10;
      matchReasons.push(`تشابه الكلمات الدلالية (${commonWords.slice(0, 2).join(', ')})`);
    }
  }

  featuresScore = Math.min(25, colorPts + brandPts);

  // 4. Time Proximity (Max 10 pts)
  try {
    const timeA = new Date(itemA.date || itemA.createdAt).getTime();
    const timeB = new Date(itemB.date || itemB.createdAt).getTime();
    const diffHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);

    if (diffHours <= 24) {
      timeScore = 10;
      matchReasons.push('فارق زمني أقل من 24 ساعة');
    } else if (diffHours <= 72) {
      timeScore = 6;
      matchReasons.push('فارق زمني خلال 3 أيام');
    } else if (diffHours <= 168) {
      timeScore = 3;
      matchReasons.push('فارق زمني خلال أسبوع');
    }
  } catch {
    timeScore = 5;
  }

  const totalScore = Math.min(100, categoryScore + locationScore + featuresScore + timeScore);

  return {
    totalScore,
    categoryScore,
    locationScore,
    featuresScore,
    timeScore,
    matchReasons,
  };
}

/**
 * Finds top matching candidates with bounded pre-filtering
 */
export function findMatchesForItem(
  targetItem: Item,
  allItems: Item[],
  maxResults = 10
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
    const breakdown = calculateMatchScore(targetItem, candidate);
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
