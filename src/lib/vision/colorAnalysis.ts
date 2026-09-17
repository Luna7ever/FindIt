import { DominantColor } from '@/types';

// Canonical 9-color school palette with precomputed RGB, HEX, and CIELAB values
export interface CanonicalColorDefinition {
  id: string;
  name: string;
  arabicName: string;
  hex: string;
  rgb: [number, number, number];
  lab: [number, number, number];
}

export interface ImageBufferData {
  data: Uint8ClampedArray | number[];
  width: number;
  height: number;
}

/**
 * Converts sRGB [0..255] to Linear RGB [0..1]
 */
function sRgbToLinear(c: number): number {
  const norm = c / 255;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

/**
 * Converts sRGB [r, g, b] (0..255) to CIE 1931 XYZ with standard D65 illuminant
 */
export function rgbToXyz(rgb: [number, number, number]): [number, number, number] {
  const r = sRgbToLinear(rgb[0]);
  const g = sRgbToLinear(rgb[1]);
  const b = sRgbToLinear(rgb[2]);

  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

  return [x, y, z];
}

/**
 * Standard CIELAB transfer function
 */
function fLab(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787037 * t + 16 / 116;
}

/**
 * Converts sRGB [r, g, b] (0..255) to CIELAB [L*, a*, b*] under D65 standard illuminant
 * Reference White: Xn = 0.95047, Yn = 1.00000, Zn = 1.08883
 */
export function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  const [x, y, z] = rgbToXyz(rgb);

  const fx = fLab(x / 0.95047);
  const fy = fLab(y / 1.00000);
  const fz = fLab(z / 1.08883);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
}

/**
 * CIE76 Color Difference (Delta-E)
 * Calculates Euclidean distance between two CIELAB colors
 */
export function deltaE(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * 9 Canonical School Colors aligned with ITEM_COLORS
 */
export const CANONICAL_PALETTE: CanonicalColorDefinition[] = [
  {
    id: 'black',
    name: 'black',
    arabicName: 'أسود',
    hex: '#18181B',
    rgb: [24, 24, 27],
    lab: rgbToLab([24, 24, 27]),
  },
  {
    id: 'blue',
    name: 'blue',
    arabicName: 'أزرق',
    hex: '#2563EB',
    rgb: [37, 99, 235],
    lab: rgbToLab([37, 99, 235]),
  },
  {
    id: 'gray',
    name: 'gray',
    arabicName: 'فضي / رمادي',
    hex: '#64748B',
    rgb: [100, 116, 139],
    lab: rgbToLab([100, 116, 139]),
  },
  {
    id: 'white',
    name: 'white',
    arabicName: 'أبيض',
    hex: '#F8FAFC',
    rgb: [248, 250, 252],
    lab: rgbToLab([248, 250, 252]),
  },
  {
    id: 'navy',
    name: 'navy',
    arabicName: 'كحلي',
    hex: '#1E293B',
    rgb: [30, 41, 59],
    lab: rgbToLab([30, 41, 59]),
  },
  {
    id: 'green',
    name: 'green',
    arabicName: 'أخضر',
    hex: '#16A34A',
    rgb: [22, 163, 74],
    lab: rgbToLab([22, 163, 74]),
  },
  {
    id: 'red',
    name: 'red',
    arabicName: 'أحمر',
    hex: '#DC2626',
    rgb: [220, 38, 38],
    lab: rgbToLab([220, 38, 38]),
  },
  {
    id: 'brown',
    name: 'brown',
    arabicName: 'بني',
    hex: '#78350F',
    rgb: [120, 53, 15],
    lab: rgbToLab([120, 53, 15]),
  },
  {
    id: 'purple',
    name: 'purple',
    arabicName: 'أخرى',
    hex: '#8B5CF6',
    rgb: [139, 92, 246],
    lab: rgbToLab([139, 92, 246]),
  },
];

/**
 * Finds the nearest canonical palette color for any given RGB pixel
 */
export function findNearestCanonicalColor(
  rgb: [number, number, number]
): {
  color: CanonicalColorDefinition;
  index: number;
  distance: number;
} {
  const pixelLab = rgbToLab(rgb);
  let minDistance = Infinity;
  let bestIndex = 0;

  for (let i = 0; i < CANONICAL_PALETTE.length; i++) {
    const dist = deltaE(pixelLab, CANONICAL_PALETTE[i].lab);
    if (dist < minDistance) {
      minDistance = dist;
      bestIndex = i;
    }
  }

  return {
    color: CANONICAL_PALETTE[bestIndex],
    index: bestIndex,
    distance: minDistance,
  };
}

/**
 * Extracts a normalized 9-bin center-weighted color histogram from raw image buffer
 */
export function extractColorHistogram(buffer: ImageBufferData): number[] {
  const { data, width, height } = buffer;
  const bins = new Array(CANONICAL_PALETTE.length).fill(0);
  if (!width || !height || data.length < 4) {
    return bins;
  }

  const cx = width / 2;
  const cy = height / 2;
  const maxRadiusSq = cx * cx + cy * cy || 1;
  let totalWeight = 0;

  const totalPixels = width * height;
  const step = totalPixels > 4096 ? Math.ceil(totalPixels / 4096) : 1;

  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3] !== undefined ? data[idx + 3] : 255;

    // Skip transparent or near-transparent pixels
    if (a < 30) continue;

    const x = i % width;
    const y = Math.floor(i / width);
    const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    // Center weighting: 1.0 at center, down to 0.5 at edges
    const weight = Math.max(0.4, 1.0 - 0.5 * (distSq / maxRadiusSq));

    const { index } = findNearestCanonicalColor([r, g, b]);
    bins[index] += weight;
    totalWeight += weight;
  }

  if (totalWeight > 0) {
    for (let k = 0; k < bins.length; k++) {
      bins[k] = bins[k] / totalWeight;
    }
  }

  return bins;
}

/**
 * Extracts dominant colors from raw image buffer with percentages
 */
export function extractDominantColors(
  buffer: ImageBufferData,
  maxColors: number = 3
): DominantColor[] {
  const histogram = extractColorHistogram(buffer);
  const colorShares = histogram.map((ratio, index) => ({
    palette: CANONICAL_PALETTE[index],
    ratio,
    percentage: Math.round(ratio * 100),
  }));

  // Sort descending by ratio
  colorShares.sort((a, b) => b.ratio - a.ratio);

  // Take top colors with at least 5% share
  const filtered = colorShares.filter((c) => c.percentage >= 5).slice(0, maxColors);

  // If none meet 5%, take the single highest bin
  const topList = filtered.length > 0 ? filtered : colorShares.slice(0, 1);

  return topList.map((item) => ({
    name: item.palette.name,
    rgb: item.palette.rgb,
    hex: item.palette.hex,
    percentage: Math.max(1, item.percentage),
  }));
}

/**
 * Computes color matching similarity S_color (0 - 100) between two items
 * using histogram intersection and primary color CIELAB delta-E
 */
export function calculateColorSimilarity(
  inputA: DominantColor[] | number[] | string,
  inputB: DominantColor[] | number[] | string
): number {
  // Case 1: Both are 9-bin histograms
  if (
    Array.isArray(inputA) &&
    Array.isArray(inputB) &&
    inputA.length === 9 &&
    inputB.length === 9 &&
    typeof inputA[0] === 'number' &&
    typeof inputB[0] === 'number'
  ) {
    const histA = inputA as number[];
    const histB = inputB as number[];

    // Histogram intersection
    let intersection = 0;
    for (let i = 0; i < 9; i++) {
      intersection += Math.min(histA[i], histB[i]);
    }

    // Find primary color index for both
    let maxA = 0;
    let idxA = 0;
    let maxB = 0;
    let idxB = 0;
    for (let i = 0; i < 9; i++) {
      if (histA[i] > maxA) {
        maxA = histA[i];
        idxA = i;
      }
      if (histB[i] > maxB) {
        maxB = histB[i];
        idxB = i;
      }
    }

    const labA = CANONICAL_PALETTE[idxA].lab;
    const labB = CANONICAL_PALETTE[idxB].lab;
    const dE = deltaE(labA, labB);
    const primaryProximity = Math.max(0, 1.0 - dE / 60);

    const unifiedScore = (0.65 * intersection + 0.35 * primaryProximity) * 100;
    return Math.min(100, Math.max(0, Math.round(unifiedScore)));
  }

  // Case 2: DominantColor arrays
  if (Array.isArray(inputA) && Array.isArray(inputB) && inputA.length > 0 && inputB.length > 0) {
    const listA = inputA as DominantColor[];
    const listB = inputB as DominantColor[];

    const primaryA = listA[0];
    const primaryB = listB[0];

    const labA = rgbToLab(primaryA.rgb);
    const labB = rgbToLab(primaryB.rgb);
    const dE = deltaE(labA, labB);

    // Check secondary color overlap
    let secondaryBonus = 0;
    if (listA.length > 1 && listB.length > 1) {
      const match = listA.slice(1).some((ca) => listB.slice(1).some((cb) => ca.name === cb.name));
      if (match) secondaryBonus = 10;
    }

    const primaryScore = Math.max(0, 1.0 - dE / 60) * 90;
    return Math.min(100, Math.max(0, Math.round(primaryScore + secondaryBonus)));
  }

  // Case 3: Fallback string names (e.g. 'أسود' or 'black')
  const strA = String(inputA).trim().toLowerCase();
  const strB = String(inputB).trim().toLowerCase();

  if (strA === strB && strA.length > 0) {
    return 100;
  }

  // Find canonical entries
  const findEntry = (s: string) =>
    CANONICAL_PALETTE.find(
      (c) => c.name.toLowerCase() === s || c.arabicName.toLowerCase() === s || c.id === s
    );

  const entryA = findEntry(strA);
  const entryB = findEntry(strB);

  if (entryA && entryB) {
    const dE = deltaE(entryA.lab, entryB.lab);
    const score = Math.max(0, 1.0 - dE / 60) * 100;
    return Math.round(score);
  }

  return 0;
}
