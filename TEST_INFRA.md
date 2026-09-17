# Test Infrastructure Specification: FindIt Edge AI Multimodal Vision, OCR & ISEF Scientific Benchmarking Suite

**Document Version**: 1.0.0  
**Target Platform**: FindIt (Next.js 16, React 19, TypeScript 5, Tailwind CSS 4)  
**Integrity Mode**: Demo & Continuous Integration  
**Test Engine**: Native Node.js Test Runner (`node:test`, `node:assert/strict`) via `tsx --test`  
**Author**: E2E Test Writer (`test_writer_e2e`)  

---

## 1. Executive Summary & Test Strategy

This document specifies the end-to-end testing architecture, validation methodology, and quality assurance framework for the **FindIt Edge AI Multimodal Vision, OCR & ISEF Scientific Benchmarking Suite**.

The primary objective of the testing infrastructure is to provide **rigorous, deterministic, and opaque-box verification** of client-side computer vision, optical character recognition (OCR), multimodal explainable AI (XAI) scoring, and empirical scientific benchmarking.

### Core Architectural Invariants:
1. **Zero External Server Dependencies**: Every test executes locally in Node.js headless runtime (`npx tsx --test`) without external HTTP/gRPC requests, CDN dependencies, or heavy native binaries.
2. **Buffer/Canvas Decoupling**: Core mathematical routines operate on raw typed buffers (`Uint8ClampedArray` and number arrays) and normalized token streams, enabling high-performance sub-millisecond execution.
3. **Strict Non-Regression Contract**: The test suite guarantees that all **50 existing unit and adversarial tests** continue to pass with 0 regressions, preserving the baseline **88% integer match score** on canonical seed items (`INITIAL_SEED_ITEMS[0]` and `[1]`) and **100% Arabic/English dictionary key symmetry**.
4. **ISEF Empirical Validation**: Automated validation of 24 ground-truth sample pairs demonstrating a statistically significant leap from **58% F1-score (Baseline Heuristic)** to **94%+ F1-score (Multimodal Edge AI)** with sub-50ms execution latency.

---

## 2. Test Philosophy & Design Principles

The FindIt testing framework adheres to four core testing principles:

### 2.1 Opaque-Box & Requirement-Driven Verification
Tests verify observable external behaviors, mathematical properties, and public interface contracts rather than internal private variables or transient DOM lifecycles.
- Color science is verified against the international **CIELAB CIE76 ($\Delta E$) standard** and D65 reference illuminants.
- OCR parsing is tested against strict school inventory domains (brands, calculator model regexes, hardware serial prefixes, Arabic/English student identity labels).
- Matching scores are derived directly from the canonical formula:
  $$\text{MatchScore} = w_{\text{visual}} \cdot S_{\text{color}} + w_{\text{ocr}} \cdot S_{\text{text\_ocr}} + w_{\text{cat}} \cdot S_{\text{category}} + w_{\text{space}} \cdot S_{\text{location}} + w_{\text{time}} \cdot S_{\text{temporal}}$$
  with canonical weights $[0.25, 0.25, 0.20, 0.15, 0.15]$.

### 2.2 Progressive Testability & Self-Containment
Each test case is fully isolated, generates its own synthetic fixtures, does not rely on execution ordering or shared global mutable state, and cleans up transient resources. During milestone implementation, tests are progressively executable without crashing the runner when pending features are being implemented.

### 2.3 Adversarial Verification & Boundary Stress
The test suite incorporates adversarial edge cases across all modules:
- **Color Science**: Polar opposites (pure black vs. pure white), identical colors, high-perceptual similarity (black vs. navy), radical contrast (red vs. green), transparent/zero-alpha buffers, and single-pixel buffers.
- **OCR Parsing**: Tatweel/kashida characters, Arabic diacritics (tashkeel), common OCR character substitutions (`Cas1o` -> `Casio`, `N1ke` -> `Nike`), empty strings, whitespace noise, and punctuation-only inputs.
- **Metrics Safety**: Protection against division-by-zero across precision, recall, and harmonic mean F1 calculations when true positives, false positives, or sample sets are zero.
- **Distractor Rejection**: Rigorous evaluation against 10 hard negative distractors specifically crafted to fool traditional category-and-location heuristics.

---

## 3. Test Architecture & Technology Stack

```
                                  FindIt Test Harness
                                 (npx tsx --test tests/*.test.ts)
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             ▼                                 ▼                                 ▼
   Existing Regression Suite        Automated Vision AI Suite         Adversarial & Layout Suite
    (tests/production-suite.test.ts)   (tests/vision-ai.test.ts)       (tests/m1-adversarial.test.ts)
    (tests/integrity-service.test.ts)  ├── Suite 1: CIELAB Color        ├── AppShell & Viewport Bounds
    (tests/leaderboard.test.ts)        ├── Suite 2: Edge OCR Parser     ├── RTL/LTR Transforms
    (tests/activities.test.ts)         ├── Suite 3: Multimodal XAI      └── Extreme Input Handling
    (tests/i18n.test.ts)               ├── Suite 4: Confusion Matrix
                                       └── Suite 5: ISEF Benchmark
```

### 3.1 Technology Specifications
- **Runner**: Node.js Native Test Runner (`node:test`) executed via `tsx` (TypeScript Execute).
- **Assertions**: `node:assert/strict` providing strict equality (`assert.equal`), object deep equality (`assert.deepEqual`), truthiness (`assert.ok`), and exception testing (`assert.throws`).
- **Execution Latency**:
  - Unit tests: < 5ms per test.
  - Full 24-sample benchmark execution: < 50ms total execution time.
  - Entire test suite (77 tests across 7 files): < 6,000ms.
- **Concurrency & Isolation**: Headless parallel module resolution with isolated thread execution.

---

## 4. Feature Inventory & 4-Tier Test Mapping

All 20 features defined in `PROJECT.md` are systematically mapped across 4 validation tiers:

| Feature # | Feature Name | Target Milestone | Test Tier | Test Coverage & Verification Method |
|:---:|---|:---:|:---:|---|
| **F01** | Color Quantization & Delta-E | M1 | Tier 1 | `tests/vision-ai.test.ts` (Suite 1: Tests 1–4) — CIE76 $\Delta E$, RGB $\to$ CIELAB, canonical palette quantization. |
| **F02** | Dominant Color Histogram | M1 | Tier 1 | `tests/vision-ai.test.ts` (Suite 1: Tests 5–6) — Center-weighted histogram intersection and dominant color extraction from raw buffers. |
| **F03** | Geometric Shape Vector | M1 | Tier 1 | `tests/vision-ai.test.ts` (Suite 1: Test 6) — Aspect ratio, density, and edge complexity invariants. |
| **F04** | Edge OCR Entity Parser | M1 | Tier 1 & 2 | `tests/vision-ai.test.ts` (Suite 2: Tests 1–5) — Brand catalog, calculator model regexes (`fx-991EX`), serial numbers, student names, and Levenshtein typo tolerance. |
| **F05** | Edge Vision Dropzone UI | M1 | Tier 2 | Integration verification via component rendering, file input, and camera capture simulation. |
| **F06** | Real-time Feedback & Autofill | M1 | Tier 2 & 3 | Autofill payload validation mapping detected visual/OCR entities to report form state. |
| **F07** | Data URL Schema Expansion | M1 | Tier 2 | `tests/production-suite.test.ts` (Test 1) & `vision-ai.test.ts` — Verifies `imageUrl` schema handles up to 2,000,000 characters without validation failure. |
| **F08** | Multimodal Formula Upgrade | M2 | Tier 1 & 2 | `tests/vision-ai.test.ts` (Suite 3: Tests 1–3) — Mathematical summation with canonical weights $[0.25, 0.25, 0.20, 0.15, 0.15]$. |
| **F09** | Backward-Compatible Score Schema | M2 | Tier 2 | `tests/production-suite.test.ts` (Test 6) & `tests/vision-ai.test.ts` (Suite 3: Test 5) — Exact 88% integer match on `INITIAL_SEED_ITEMS[0]` and `[1]`. |
| **F10** | Explainable AI Factor Meters | M2 | Tier 3 | `tests/vision-ai.test.ts` (Suite 3: Test 2) — Verification of discrete sub-scores (`color`, `ocr`, `category`, `location`, `temporal`). |
| **F11** | Zero-Dependency SVG Radar Chart | M2 | Tier 3 | Mathematical verification of 5-axis pentagon vertex coordinates. |
| **F12** | Mathematical Formula Disclosure | M2 | Tier 3 | `tests/vision-ai.test.ts` (Suite 3: Test 6) — Bilingual formula and match reason disclosure strings. |
| **F13** | ISEF Ground-Truth Dataset | M3 | Tier 2 & 4 | `tests/vision-ai.test.ts` (Suite 5: Tests 1–5) — 24 curated sample pairs (14 True Matches + 10 Hard Negative Distractors) in `src/lib/ai/benchmarkData.ts`. |
| **F14** | Empirical Metrics Engine | M3 | Tier 1 & 2 | `tests/vision-ai.test.ts` (Suite 4: Tests 1–5) — Confusion matrix tallies, precision, recall, harmonic mean F1-score, and zero-division guards. |
| **F15** | ISEF Benchmark Dashboard UI | M3 | Tier 4 | Route accessibility at `/admin/benchmark`, RBAC protection, and live execution trigger. |
| **F16** | Comparative Benchmark Visualizer | M3 | Tier 3 & 4 | `tests/vision-ai.test.ts` (Suite 5: Tests 1–3) — Empirical contrast of 58% baseline vs 94%+ multimodal AI. |
| **F17** | Admin Navigation Integration | M3 | Tier 3 | `src/app/admin/page.tsx` 6th tab and overview hero card link. |
| **F18** | Automated Test Suite (vision-ai) | M4 | Tier 1–4 | `tests/vision-ai.test.ts` — 27 discrete automated tests across 5 suites with 0 failures. |
| **F19** | Zero-Regression Suite Pass | M4 | Tier 4 | `tests/*.test.ts` — All 50 existing tests pass concurrently (total 77 passing tests). |
| **F20** | Clean Production Build | M4 | Tier 4 | `npm run build` compiles with 0 TypeScript and Turbopack errors. |

---

## 5. Specification of `tests/vision-ai.test.ts` (5 Suites, 27 Discrete Tests)

The core test suite is organized into 5 discrete suites totaling 27 tests:

### Suite 1: CIELAB Color Science & Dominant Color Extraction (6 Tests)
- **Test 1.1 (Identical Colors)**: Verifies $\Delta E = 0.0$ and similarity $= 100\%$ for identical hex codes (`#18181B` vs `#18181B`).
- **Test 1.2 (Polar Opposites)**: Verifies pure white (`#FFFFFF`) vs pure black (`#000000`) yields $\Delta E > 90.0$ and similarity $< 15\%$.
- **Test 1.3 (Perceptual Proximity)**: Verifies Black (`#18181B`) vs Navy (`#1E293B`) yields similarity $> 75\%$, while Red (`#DC2626`) vs Green (`#16A34A`) yields similarity $< 30\%$.
- **Test 1.4 (Canonical Palette Quantization)**: Verifies arbitrary RGB tuples correctly map to their nearest canonical school color name.
- **Test 1.5 (Histogram Intersection)**: Verifies multi-color palette histogram intersection returns a normalized similarity score $\in [0, 100]$.
- **Test 1.6 (Illumination & Edge Cases)**: Verifies robust handling of all-black, all-white, transparent/zero-alpha, and extreme lighting variations without `NaN` or crashes.

### Suite 2: Client-Side Edge OCR Entity Parsing (5 Tests)
- **Test 2.1 (Brand Catalog Recognition)**: Verifies case-insensitive brand identification (`Casio`, `Nike`, `Adidas`, `Stanley`, `Faber-Castell`) with OCR typo tolerance (`Cas1o` -> `Casio`).
- **Test 2.2 (Calculator Model Extraction)**: Verifies parsing of scientific calculator model codes (`fx-991EX`, `FX-82ES`, `TI-84`, `CAS991-8842`).
- **Test 2.3 (Serial Number Extraction)**: Verifies parsing of serial number prefixes (`SN-`, `S/N:`, `SERIAL#`, `NO.`) and distinctive alphanumeric hardware tokens.
- **Test 2.4 (Student Name & Identity Tags)**: Verifies extraction of student names and grades from Arabic labels (`الطالب: عمر خالد - 10/أ`) and English labels (`Student Name: Omar Khalid`).
- **Test 2.5 (Noise & Token Overlap)**: Verifies stopword removal, Jaccard token similarity, and safe error handling for empty strings and non-alphanumeric noise.

### Suite 3: Multimodal Match Score Engine & XAI Decomposition (6 Tests)
- **Test 3.1 (Multimodal Formula Summation)**: Verifies exact weighted score calculation:
  $$\text{Score} = 0.25 S_{\text{color}} + 0.25 S_{\text{ocr}} + 0.20 S_{\text{cat}} + 0.15 S_{\text{loc}} + 0.15 S_{\text{time}}$$
- **Test 3.2 (Explainable AI Factor Decomposition)**: Verifies output breakdown contains discrete sub-scores for all 5 modalities.
- **Test 3.3 (Resolving Lexical Mismatch)**: Verifies items with divergent wording but matching OCR serial number and visual color achieve match score $\ge 85\%$.
- **Test 3.4 (Hard Distractor Rejection)**: Verifies items sharing identical category and location but conflicting colors and OCR tokens score $< 45\%$ (correctly rejected).
- **Test 3.5 (Backward Compatibility Invariant)**: Verifies `INITIAL_SEED_ITEMS[0]` and `[1]` score exactly `88%` with `categoryScore: 35`, `locationScore: 30`, `featuresScore: 13`.
- **Test 3.6 (Bilingual Explanation Generation)**: Verifies match reasons return correctly in Arabic (`ar`) and English (`en`).

### Suite 4: Confusion Matrix & ISEF Scientific Metrics Engine (5 Tests)
- **Test 4.1 (Confusion Matrix Tally)**: Verifies accurate calculation of True Positives ($TP$), False Positives ($FP$), False Negatives ($FN$), and True Negatives ($TN$).
- **Test 4.2 (Precision Formula)**: Verifies $P = \frac{TP}{TP + FP}$ with zero-division safeguard.
- **Test 4.3 (Recall Formula)**: Verifies $R = \frac{TP}{TP + FN}$ with zero-division safeguard.
- **Test 4.4 (Harmonic Mean F1-Score)**: Verifies $F_1 = 2 \cdot \frac{P \cdot R}{P + R}$ with zero-division safeguard.
- **Test 4.5 (Boundary & Edge Safety)**: Verifies empty sample sets, 0 matches, and 100% false alarm vectors produce clean zeros without `NaN` or unhandled exceptions.

### Suite 5: Full Ground-Truth Benchmark Automated Verification (5 Tests)
- **Test 5.1 (Baseline Heuristic Benchmark)**: Runs baseline heuristic on 24 curated samples at threshold $\tau = 0.65$ and asserts F1-score is between $56.0\%$ and $60.0\%$ (~58%).
- **Test 5.2 (Multimodal Edge AI Benchmark)**: Runs multimodal engine on 24 curated samples at threshold $\tau = 0.65$ and asserts F1-score is $\ge 94.0\%$.
- **Test 5.3 (Comparative Statistical Leap)**: Asserts Multimodal Edge AI achieves an empirical F1 gain $\ge +30\%$ over the Baseline Heuristic.
- **Test 5.4 (Execution Latency Constraint)**: Asserts total benchmark execution time for all 24 sample pairs is $< 1,200\text{ms}$ (mean latency $< 50\text{ms}$ per pair).
- **Test 5.5 (Distractor Rejection Efficacy)**: Asserts Multimodal Edge AI produces $\le 1$ False Positive across the 10 hard negative distractors.

---

## 6. Scientific Validation & Acceptance Thresholds

| Metric / Dimension | Baseline Heuristic Threshold | Multimodal Edge AI Threshold | Acceptance Gate |
|---|:---:|:---:|:---:|
| **Decision Threshold ($\tau$)** | 0.65 (65%) | 0.65 (65%) | Standardized |
| **Dataset Sample Count ($N$)** | 24 pairs | 24 pairs | 14 Positives, 10 Negatives |
| **Expected True Positives ($TP$)** | 8 / 14 | 13–14 / 14 | $\ge 13$ |
| **Expected False Positives ($FP$)** | 5 / 10 | 0–1 / 10 | $\le 1$ |
| **Expected False Negatives ($FN$)** | 6 / 14 | 0–1 / 14 | $\le 1$ |
| **Expected True Negatives ($TN$)** | 5 / 10 | 9–10 / 10 | $\ge 9$ |
| **Precision ($P$)** | ~61.5% | $\ge 92.0\%$ | Pass |
| **Recall ($R$)** | ~57.1% | $\ge 92.0\%$ | Pass |
| **F1-Score ($F_1$)** | **58.0% ± 2.0%** | **≥ 94.0%** | **Mandatory Gate** |
| **Mean Latency ($\mu_L$)** | < 1 ms | < 50 ms | Sub-second real-time |
| **Automated Test Pass Rate** | 100% (50/50) | 100% (27/27) | **77/77 Total Green** |

---

## 7. Execution Commands & Verification Runbook

### Run New Vision AI Test Suite:
```bash
npx tsx --test tests/vision-ai.test.ts
```

### Run Full Regression Suite (All 77 Tests):
```bash
npx tsx --test tests/*.test.ts
```

### Production Build Compilation:
```bash
npm run build
```
