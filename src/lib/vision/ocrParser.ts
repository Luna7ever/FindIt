import { ExtractedEntities, OcrParsedResult } from '@/types';

/**
 * Known School Brands Catalog
 */
export const SCHOOL_BRANDS_CATALOG: string[] = [
  // Calculators & Tech
  'Casio',
  'Texas Instruments',
  'Sharp',
  'Apple',
  'Samsung',
  'Sony',
  'HP',
  'Dell',
  'Lenovo',
  'Anker',
  'JBL',
  'Xiaomi',
  'SanDisk',
  'Logitech',

  // Stationery
  'Faber-Castell',
  'Staedtler',
  'Pilot',
  'Zebra',
  'Maped',
  'BIC',
  'Rotring',
  'Uni-ball',

  // Bags & Sports
  'Nike',
  'Adidas',
  'Puma',
  'Under Armour',
  'JanSport',
  'Eastpak',

  // Water Bottles
  'Hydro Flask',
  'Yeti',
  'Stanley',
  'Contigo',
  'CamelBak',
];

/**
 * Standard Levenshtein Distance calculation
 */
export function levenshteinDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (!al) return bl;
  if (!bl) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[al][bl];
}

/**
 * Normalizes text and tokenizes into alphanumeric words
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  // Remove punctuation except hyphens inside tokens
  return text
    .replace(/[^\p{L}\p{N}\-_]+/gu, ' ')
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

/**
 * Corrects typical OCR noise characters for brands
 * (e.g., 'Cas1o' -> 'Casio', 'N1ke' -> 'Nike')
 */
export function matchBrandFuzzy(token: string): string | undefined {
  const clean = token.trim();
  if (clean.length < 3) return undefined;

  for (const brand of SCHOOL_BRANDS_CATALOG) {
    if (brand.toLowerCase() === clean.toLowerCase()) {
      return brand;
    }

    // Levenshtein tolerance: 1 edit for length >= 4
    if (clean.length >= 4 && levenshteinDistance(clean, brand) <= 1) {
      return brand;
    }
  }

  return undefined;
}

/**
 * Extracts student name from Arabic or English handwritten/printed text
 */
function extractStudentName(text: string): string | undefined {
  // Arabic patterns: اسم الطالب: فلان | الطالب: فلان | ملك فلان
  const arabicRegex = /(?:اسم الطالب|اسم الطالبة|الطالب|الطالبة|الاسم|ملك|للطالب)[:\s]+([^\n,.;\-_0-9]+)/i;
  const mAr = text.match(arabicRegex);
  if (mAr && mAr[1]) {
    const candidate = mAr[1].trim();
    if (candidate.length >= 3 && candidate.length <= 40) {
      return candidate;
    }
  }

  // English patterns: Student Name: John Doe | Property of: John Doe
  const englishRegex = /(?:Student Name|Name|Property of|Owner)[:\s]+([A-Za-z\s]+)/i;
  const mEn = text.match(englishRegex);
  if (mEn && mEn[1]) {
    const candidate = mEn[1].trim();
    if (candidate.length >= 3 && candidate.length <= 40) {
      return candidate;
    }
  }

  return undefined;
}

/**
 * Extracts scientific calculator models (e.g. fx-991EX, CAS-991, FX-82ES)
 */
function extractCalculatorModel(text: string): string | undefined {
  const modelRegex = /\b(?:fx|FX)[-\s]?[0-9]{2,4}[A-Za-z]{0,3}\b/;
  const m = text.match(modelRegex);
  if (m) {
    return m[0].replace(/\s+/g, '-').toUpperCase();
  }

  const altModelRegex = /\b(?:CAS|TI)[-\s]?[0-9]{2,4}[A-Za-z0-9]*\b/i;
  const mAlt = text.match(altModelRegex);
  if (mAlt) {
    return mAlt[0].toUpperCase();
  }

  return undefined;
}

/**
 * Extracts hardware serial numbers or distinct identification codes
 */
function extractSerialNumber(text: string): string | undefined {
  // Prefixed serials: SN-884291, S/N: CAS-991-8842, SERIAL # 991283
  const serialPrefixedRegex = /\b(?:SN|S\/N|SERIAL|SER|NO\.?|IMEI)[:\s#-]*([A-Za-z0-9]{4,16})\b/i;
  const mPrefixed = text.match(serialPrefixedRegex);
  if (mPrefixed && mPrefixed[1]) {
    return mPrefixed[1].toUpperCase();
  }

  // Standalone structured codes: e.g. SN-884291 or CAS991-8842
  const codeRegex = /\b(?:SN-[A-Za-z0-9]{4,10}|CAS[0-9]{3}-[A-Za-z0-9]{4,8})\b/i;
  const mCode = text.match(codeRegex);
  if (mCode) {
    return mCode[0].toUpperCase();
  }

  return undefined;
}

/**
 * Core OCR Parser: parses raw OCR text into structured entities and normalized tokens
 */
export function parseOcrText(rawText: string): OcrParsedResult {
  if (!rawText || !rawText.trim()) {
    return {
      rawText: '',
      normalizedTokens: [],
      entities: {},
      confidence: 0,
    };
  }

  const text = rawText.trim();
  const tokens = tokenizeText(text);

  let detectedBrand: string | undefined;
  let detectedModel: string | undefined = extractCalculatorModel(text);
  let detectedSerial: string | undefined = extractSerialNumber(text);
  let detectedStudentName: string | undefined = extractStudentName(text);

  // Check multi-word brands first
  const lowerText = text.toLowerCase();
  for (const brand of SCHOOL_BRANDS_CATALOG) {
    if (lowerText.includes(brand.toLowerCase())) {
      detectedBrand = brand;
      break;
    }
  }

  // If no multi-word brand matched, check fuzzy single tokens
  if (!detectedBrand) {
    for (const token of tokens) {
      const match = matchBrandFuzzy(token);
      if (match) {
        detectedBrand = match;
        break;
      }
    }
  }

  // If model was found but not brand, infer Casio for fx- series
  if (!detectedBrand && detectedModel && detectedModel.startsWith('FX-')) {
    detectedBrand = 'Casio';
  }

  const entities: ExtractedEntities = {};
  if (detectedBrand) entities.brand = detectedBrand;
  if (detectedModel) entities.model = detectedModel;
  if (detectedSerial) entities.serialNumber = detectedSerial;
  if (detectedStudentName) entities.studentName = detectedStudentName;

  // Calculate heuristic confidence based on extracted entities
  let entityCount = 0;
  if (detectedBrand) entityCount++;
  if (detectedModel) entityCount++;
  if (detectedSerial) entityCount++;
  if (detectedStudentName) entityCount++;

  const baseConfidence = tokens.length > 0 ? Math.min(0.7, 0.4 + tokens.length * 0.05) : 0;
  const confidence = Math.min(0.99, Math.round((baseConfidence + entityCount * 0.15) * 100) / 100);

  return {
    rawText: text,
    normalizedTokens: tokens,
    entities,
    confidence,
  };
}

/**
 * Calculates OCR Text Overlap Score S_text_ocr (0 - 100) between two OCR results or strings
 */
export function calculateOcrOverlap(
  ocrInputA: OcrParsedResult | string | undefined,
  ocrInputB: OcrParsedResult | string | undefined
): number {
  if (!ocrInputA || !ocrInputB) return 0;

  const resultA = typeof ocrInputA === 'string' ? parseOcrText(ocrInputA) : ocrInputA;
  const resultB = typeof ocrInputB === 'string' ? parseOcrText(ocrInputB) : ocrInputB;

  const entA = resultA.entities || {};
  const entB = resultB.entities || {};

  // 1. Exact Serial Number Match -> 100%
  if (entA.serialNumber && entB.serialNumber) {
    const sA = entA.serialNumber.toUpperCase();
    const sB = entB.serialNumber.toUpperCase();
    if (sA === sB) {
      return 100;
    }
    // 1 OCR substitution tolerance (e.g. 8 vs B, 0 vs O)
    if (levenshteinDistance(sA, sB) === 1 && sA.length >= 4) {
      return 90;
    }
  }

  // 2. Exact Student Name Match -> 90%
  if (entA.studentName && entB.studentName) {
    const nameA = entA.studentName.trim().toLowerCase();
    const nameB = entB.studentName.trim().toLowerCase();
    if (nameA === nameB || nameA.includes(nameB) || nameB.includes(nameA)) {
      return 90;
    }
  }

  // 3. Exact Brand + Exact Model Match (e.g. Casio fx-991EX) -> 90%
  if (entA.brand && entB.brand && entA.brand.toLowerCase() === entB.brand.toLowerCase()) {
    if (entA.model && entB.model && entA.model.toLowerCase() === entB.model.toLowerCase()) {
      return 90;
    }
  }

  // 4. Exact Model Match alone
  if (entA.model && entB.model && entA.model.toLowerCase() === entB.model.toLowerCase()) {
    return 85;
  }

  // 5. Brand Match alone
  let brandBonus = 0;
  if (entA.brand && entB.brand && entA.brand.toLowerCase() === entB.brand.toLowerCase()) {
    brandBonus = 70;
  }

  // 6. Tokenized Jaccard Similarity on normalized words
  const tokensA = new Set(resultA.normalizedTokens || []);
  const tokensB = new Set(resultB.normalizedTokens || []);

  if (tokensA.size === 0 || tokensB.size === 0) {
    return brandBonus;
  }

  let intersectionCount = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  const jaccard = unionSize > 0 ? intersectionCount / unionSize : 0;
  const jaccardScore = Math.round(jaccard * 100);

  return Math.min(100, Math.max(brandBonus, jaccardScore));
}

export const calculateOcrSimilarity = calculateOcrOverlap;
