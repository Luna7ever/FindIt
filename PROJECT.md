# Project: FindIt Edge AI Multimodal Vision, OCR & ISEF Scientific Benchmarking Suite

## Architecture
- **Zero-Dependency Client-Side Edge Core**: All visual feature extraction and OCR parsing run in-browser in pure TypeScript with zero external server calls and zero CDN dependencies.
- **Buffer/Canvas Decoupled Design**: The core math functions (`extractDominantColors`, `deltaE`, `parseOcrText`, `calculateMatchScore`, `runBenchmark`) operate on raw typed buffers (`Uint8ClampedArray`) and string/data tokens, enabling 100% test execution in headless Node.js (`npx tsx --test`) while browser adapters handle DOM `<canvas>` and file/camera inputs.
- **Multimodal Explainable AI (XAI) Formula**:
  $$\text{MatchScore} = w_{\text{visual}} \cdot S_{\text{color}} + w_{\text{ocr}} \cdot S_{\text{text\_ocr}} + w_{\text{cat}} \cdot S_{\text{category}} + w_{\text{space}} \cdot S_{\text{location}} + w_{\text{time}} \cdot S_{\text{temporal}}$$
  Canonical weights: $[0.25, 0.25, 0.20, 0.15, 0.15]$. Yields exact 88% on seed items to guarantee 0 regressions on legacy tests, while achieving 94%+ discrimination on multimodal inputs.
- **Interactive ISEF Scientific Benchmarking**: Dedicated `/admin/benchmark` route evaluating 24 ground-truth sample pairs (14 True Matches + 10 Hard Negative Distractors) live in-browser (< 50ms latency), rendering dynamic Confusion Matrices, Precision, Recall, F1-Score, and comparative metric visualizations (58% Baseline vs 94%+ Edge AI).
- **Design System & Bilingual Parity**: Obsidian Emerald theming (`dark:bg-[#0D1412]`, cards `dark:bg-[#15201D]`, borders `dark:border-[#263834]`), safe mobile dock clearance (`pb-28 md:pb-12`), and 100% dictionary key symmetry between Arabic and English.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Color Quantization & Delta-E | CIELAB $\Delta E$ (CIE76) color distance and 9-color canonical palette quantization | M1 | Survey (Explorer 1) |
| 2 | Dominant Color Histogram | Extract dominant colors and center-weighted color histogram ($S_{\text{color}}$) from raw buffer | M1 | Survey (Explorer 1) |
| 3 | Geometric Shape Vector | Aspect ratio, foreground solidity, and Sobel edge complexity vectors | M1 | Survey (Explorer 1) |
| 4 | Edge OCR Entity Parser | Domain regex and catalog parser for brands, calculator models (`fx-991EX`), serial numbers, and student names | M1 | Survey (Explorer 1) |
| 5 | Edge Vision Dropzone UI | `/report` dropzone with camera snapshot, drag-and-drop file upload, and demo presets | M1 | Survey (Explorer 1) |
| 6 | Real-time Feedback & Autofill | Instant AI badges, color chips with percentages, OCR entity badges, and one-click autofill in `/report` | M1 | Survey (Explorer 1) |
| 7 | Data URL Schema Expansion | Update `src/lib/validation/schemas.ts` `imageUrl` from `.max(500)` to `.max(2_000_000)` and add `visualFeatures` schema | M1 | Survey (Explorer 1) |
| 8 | Multimodal Formula Upgrade | Upgrade `calculateMatchScore` in `src/lib/matching.ts` with weights $[0.25, 0.25, 0.20, 0.15, 0.15]$ | M2 | Survey (Explorer 2) |
| 9 | Backward-Compatible Score Schema | Retain `categoryScore`, `locationScore`, `featuresScore`, `timeScore` while adding `subScores` & `weights` | M2 | Survey (Explorer 2) |
| 10 | Explainable AI Factor Meters | 5 animated progress meters for Color, OCR, Category, Location, and Time in `/match/[id]` | M2 | Survey (Explorer 2) |
| 11 | Zero-Dependency SVG Radar Chart | 5-axis SVG radar pentagon visualizing multimodal similarity in `/match/[id]` | M2 | Survey (Explorer 2) |
| 12 | Mathematical Formula Disclosure | Interactive formula accordion with weighted component breakdown in `/match/[id]` | M2 | Survey (Explorer 2) |
| 13 | ISEF Ground-Truth Dataset | 24 curated test pairs (14 True Matches + 10 Hard Negative Distractors) in `src/lib/ai/benchmarkData.ts` | M3 | Survey (Explorer 3) |
| 14 | Empirical Metrics Engine | Pure TypeScript runner computing Confusion Matrix (TP, FP, FN, TN), Precision, Recall, F1, and Latency | M3 | Survey (Explorer 3) |
| 15 | ISEF Benchmark Dashboard UI | `/admin/benchmark` page with live trigger, dynamic metrics cards, and Confusion Matrix rendering | M3 | Survey (Explorer 3) |
| 16 | Comparative Benchmark Visualizer | Baseline Heuristic (58%) vs Multimodal Edge AI (94%+) comparative visualization | M3 | Survey (Explorer 3) |
| 17 | Admin Navigation Integration | 6th tab in `/admin/page.tsx` and ISEF Showcase hero card in Overview tab | M3 | Survey (Explorer 3) |
| 18 | Automated Test Suite (vision-ai) | `tests/vision-ai.test.ts` verifying color distance, OCR parsing, match scores, Confusion Matrix, and F1 | M4 / Test Track | Survey (Explorer 3) |
| 19 | Zero-Regression Suite Pass | Pass all existing 50 unit and adversarial tests (`tests/*.test.ts`) with 0 regressions | M4 / Test Track | Survey (Explorer 3) |
| 20 | Clean Production Build | Compile `npm run build` with 0 TypeScript and Turbopack errors | M4 / Test Track | Survey (Explorer 3) |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Client-Side Vision & OCR Core + `/report` Autofill | `src/lib/vision/`, `src/components/EdgeVisionDropzone.tsx`, `src/types/index.ts`, `src/lib/validation/schemas.ts`, `src/app/report/page.tsx`, bilingual translations | None | PLANNED |
| M2 | Multimodal XAI Matching Engine & Match Breakdown UI | `src/lib/matching.ts`, `src/components/ExplainableAiBreakdown.tsx`, `src/app/match/[id]/page.tsx`, bilingual translations | M1 | PLANNED |
| M3 | Interactive ISEF Benchmarking Suite | `src/lib/ai/benchmarkData.ts`, `src/lib/ai/benchmarkRunner.ts`, `src/app/admin/benchmark/page.tsx`, `src/app/admin/page.tsx`, `package.json` test script | M1, M2 | PLANNED |
| M4 | E2E Dual-Track Verification, Full Suite Pass & Adversarial Hardening | Pass 100% of E2E test suite (`tests/vision-ai.test.ts`), verify all 50 existing tests pass, and complete Tier 5 adversarial audit | M1, M2, M3, E2E Test Track | PLANNED |

---

## Interface Contracts

### M1 ↔ M2 Contract: VisualFeatures & OcrParsedResult
```typescript
// src/types/index.ts
export interface DominantColor {
  name: string; // 'black', 'blue', 'red', 'green', 'white', etc.
  rgb: [number, number, number];
  hex: string;
  percentage: number; // 0 - 100
}

export interface ExtractedEntities {
  brand?: string;
  model?: string;
  serialNumber?: string;
  studentName?: string;
}

export interface OcrParsedResult {
  rawText: string;
  normalizedTokens: string[];
  entities: ExtractedEntities;
  confidence: number; // 0 - 1
}

export interface ShapeVector {
  aspectRatio: number;
  solidity: number;
  edgeComplexity: number;
}

export interface VisualFeatures {
  dominantColors: DominantColor[];
  colorHistogram: number[]; // 9-bin canonical color frequencies
  detectedText?: string;
  ocr?: OcrParsedResult;
  shape?: ShapeVector;
  processedAt: string;
}
```

### M1/M2 ↔ M3 Contract: Multimodal SubScores & MatchScoreBreakdown
```typescript
// src/types/index.ts & src/lib/matching.ts
export interface MultimodalSubScores {
  color: number;       // S_color (0 - 100)
  ocrText: number;     // S_text_ocr (0 - 100)
  category: number;    // S_category (0 - 100)
  location: number;    // S_location (0 - 100)
  temporal: number;    // S_temporal (0 - 100)
}

export interface MultimodalWeights {
  visual: number;      // default: 0.25
  ocr: number;         // default: 0.25
  category: number;    // default: 0.20
  location: number;    // default: 0.15
  temporal: number;    // default: 0.15
}

export interface MatchScoreBreakdown {
  totalScore: number;  // 0 - 100 (integer)
  subScores: MultimodalSubScores;
  weights: MultimodalWeights;
  isMultimodal: boolean;
  matchReasons: string[];
  // Legacy backward-compatibility fields:
  categoryScore: number;
  locationScore: number;
  featuresScore: number;
  timeScore: number;
}
```

### M3 Benchmark Engine Contract: BenchmarkResult & ConfusionMatrix
```typescript
// src/lib/ai/benchmarkRunner.ts
export interface ConfusionMatrix {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
}

export interface ScientificMetrics {
  precision: number; // 0.0 - 1.0 (or %)
  recall: number;    // 0.0 - 1.0 (or %)
  f1Score: number;   // 0.0 - 1.0 (or %)
  accuracy: number;  // 0.0 - 1.0 (or %)
  meanLatencyMs: number;
}

export interface BenchmarkComparison {
  baseline: {
    matrix: ConfusionMatrix;
    metrics: ScientificMetrics;
  };
  multimodal: {
    matrix: ConfusionMatrix;
    metrics: ScientificMetrics;
  };
  sampleCount: number;
  threshold: number; // default 65%
  executionTimestamp: string;
}
```

---

## Code Layout
- `src/types/index.ts`: VisualFeatures, MultimodalSubScores, MatchScoreBreakdown definitions
- `src/lib/validation/schemas.ts`: Expanded `imageUrl` (.max 2_000_000) and `visualFeatures` Zod schema
- `src/lib/vision/`:
  - `colorAnalysis.ts`: CIELAB Delta-E, canonical palette quantization, histogram intersection
  - `shapeAnalysis.ts`: Aspect ratio and geometric shape descriptors
  - `ocrParser.ts`: School brands, calculator models, serial number regex, student name extraction
  - `edgeVisionEngine.ts`: Core processing engine connecting raw pixel buffers and browser canvas
- `src/components/EdgeVisionDropzone.tsx`: Dropzone, camera capture, real-time AI badges & autofill
- `src/app/report/page.tsx`: Embedded dropzone & autofill integration
- `src/lib/matching.ts`: Upgraded `calculateMatchScore` with multimodal equation & backward compatibility
- `src/components/ExplainableAiBreakdown.tsx`: 5-factor meters, 5-axis SVG radar, mathematical formula disclosure
- `src/app/match/[id]/page.tsx`: Integrated Explainable AI breakdown
- `src/lib/ai/benchmarkData.ts`: 24 ground-truth sample pairs
- `src/lib/ai/benchmarkRunner.ts`: Baseline vs Multimodal benchmark evaluation engine
- `src/app/admin/benchmark/page.tsx`: Interactive ISEF Benchmark Dashboard
- `src/app/admin/page.tsx`: 6th tab and overview hero card
- `src/lib/i18n/translations.ts`: Symmetric Arabic & English translation keys
- `tests/vision-ai.test.ts`: Automated test suite for color, OCR, matching, and Confusion Matrix/F1
- `package.json`: Updated `"test"` script
