# Original User Request

## Initial Request — 2026-09-15T18:47:23Z

This is a focused end-to-end fix for mobile responsiveness, viewport scaling, and UI padding across all FindIt pages.

Working directory: d:\FindIt
Integrity mode: development

## Requirements

### R1. Full Mobile Viewport & Container Normalization
Audit and fix layout containers in src/components/AppShell.tsx and all page routes (/explore, /report, /my-items, /integrity, /leaderboard, /admin, /) ensuring width scales smoothly to 100% on small mobile viewports (360px - 430px) without horizontal scrolling, clipping, or desktop fixed widths.

### R2. Explore & Filtering Mobile Polish (/explore)
Refactor the search bar, segmented status toggles, school facility selector, category scroll chips, and item grid (grid-cols-1 sm:grid-cols-2) to stack cleanly on phone screens with clear touch targets and no cramped overflow.

### R3. Safe Bottom Dock Spacing & Content Padding
Ensure all pages have adequate bottom padding (pb-24 or safe-bottom-space) so the floating glassmorphic bottom navigation dock never obstructs interactive buttons, forms, feedback cards, or submit actions.

### R4. Integrity Studio, Report & Profile Responsive Harmony
Ensure /integrity, /report, /my-items, and /leaderboard have fluid flexible layouts that scale beautifully from narrow mobile phones up to large desktop monitors.

## Acceptance Criteria

### Mobile Responsiveness & Visual Verification
- [ ] No horizontal scrollbars or overflow clipping on mobile viewports (360px, 390px, 412px, 430px).
- [ ] Explore page filters, category pills, and cards render cleanly on single-column mobile viewports.
- [ ] Floating bottom navigation bar does not overlap or obscure interactive buttons or form submission bars.
- [ ] All 23 automated tests in 
pm test pass (100% pass rate).
- [ ] npm run build succeeds with zero TypeScript or build errors.

## Follow-up — 2026-09-16T12:20:25Z

Audit, declutter, and refine the FindIt school lost & found platform across desktop/laptop and mobile screens, ensuring flawless visual hierarchy, non-crowded spacing, clean navigation flow, touch target ergonomics, and seamless bilingual (AR/EN) and dark/light mode performance following the addition of the School Activities system.

Working directory: d:\FindIt
Integrity mode: development

## Requirements

### R1. Layout Decluttering & Visual Spacing (Desktop & Laptop)
- Eliminate visual density, excessive borders, or cramped elements on standard laptop and desktop resolutions (1280px, 1366px, 1920px).
- Optimize the Desktop Sidebar Rail in `AppShell.tsx` (now with 9 items) to ensure smooth vertical flow and no awkward squishing or scrolling on 768px/800px laptop screen heights.
- Enhance breathing room and whitespace around Home Page sections (Hero greeting, 4-button action strip, Activities banner, Category browser, and Recent items feed).

### R2. Mobile Responsiveness & Bottom Dock Clearance
- Audit all pages (`/`, `/activities`, `/explore`, `/report`, `/my-items`, `/integrity`, `/leaderboard`, `/admin`, `/settings`) on mobile viewports (360px–414px width).
- Ensure universal `pb-28 md:pb-12` or `.safe-bottom-space` is strictly applied so no buttons, forms, or cards are hidden behind the floating mobile navigation dock.
- Ensure the Admin Page tab bar (5 tabs: Overview, Claims, Inventory, Activities, QR) scrolls smoothly without wrapping or distorting layout.
- Ensure touch targets meet 40–44px minimum sizing for comfortable one-handed mobile tapping.

### R3. Visual Harmony, Consistent Obsidian Emerald Theming & Bilingual Parity
- Standardize card styling across all pages (Obsidian Emerald dark theme `dark:bg-[#15201D]`, `dark:border-[#263834]`, and warm cream light theme `bg-white`, `border-[#E4E7E4]`).
- Ensure text truncation, badge chips, and flex-wrap prevent horizontal layout overflow in both Arabic (RTL) and English (LTR).
- Verify all interactive modals (`ActivitySubmissionModal`, `ClaimModal`, `HandoverPinModal`, `CameraQRScannerModal`, `IntegrityCertificateModal`, `NavigationDrawer`) render smoothly on mobile with non-clipped actions.

## Acceptance Criteria

### Visual & Responsive Ergonomics
- [ ] No horizontal scrollbars on mobile viewport widths (360px, 375px, 390px, 414px).
- [ ] Desktop sidebar rail fits cleanly within 768px laptop height without awkward overflow.
- [ ] Mobile bottom dock never obscures any action button or interactive form element across all 9 pages.
- [ ] Admin tabs and category filters scroll horizontally smoothly (`scrollbar-none`, `overflow-x-auto`).

### Code Quality & Build Verification
- [ ] All 35+ automated unit tests (`npx tsx --test tests/*.test.ts`) pass with 0 failures.
- [ ] Production build (`npm run build`) compiles cleanly with 0 TypeScript or Turbopack errors.
- [ ] Light mode and Dark mode maintain high contrast and legible typography in all states.
- [ ] 100% bilingual parity across Arabic and English without mixed-language fragments.

## 2026-09-17T07:32:48Z

Build a client-side Edge AI Multimodal Computer Vision & Optical Character Recognition (OCR) matching engine with an Explainable AI (XAI) breakdown inspector and an interactive ISEF Scientific Benchmarking Suite for the FindIt school lost-and-found system.

Working directory: d:\FindIt
Integrity mode: demo

## Requirements

### R1. Client-Side Edge Vision & Optical Character Recognition (OCR) Core
- Process images entirely on-device (in-browser) using lightweight visual feature extraction and OCR text parsing to extract dominant color histograms, text strings (serial numbers, handwritten names, brands), and visual shape vectors without external server calls.
- Provide real-time instant visual feedback and autofill in the reporting interface (`/report`) when an image is uploaded or captured, showing detected colors and OCR text.

### R2. Multimodal Explainable AI (XAI) Matching Engine
- Upgrade `calculateMatchScore` in `src/lib/matching.ts` from rule-based text heuristics to a unified multimodal formula:
  $$\text{MatchScore} = w_{\text{visual}} \cdot S_{\text{color}} + w_{\text{ocr}} \cdot S_{\text{text\_ocr}} + w_{\text{cat}} \cdot S_{\text{category}} + w_{\text{space}} \cdot S_{\text{location}} + w_{\text{time}} \cdot S_{\text{temporal}}$$
- Implement transparent score decomposition (Explainable AI breakdown) showing sub-scores (Color %, OCR text overlap %, Location %, Time %) in the match details interface (`/match/[id]`).

### R3. Interactive ISEF Scientific Benchmarking Dashboard
- Build an interactive evaluation suite (`/admin/benchmark`) allowing judges/users to trigger automated benchmarking on test samples.
- Compute and render live empirical validation metrics:
  - Confusion Matrix (True Positives, False Positives, False Negatives).
  - Standard scientific metrics: Precision, Recall, F1-Score, and Mean Latency (ms).
  - Comparative benchmark visualization: Baseline Heuristic (58%) vs. Multimodal Edge AI (94%+).

## Acceptance Criteria

### Automated Testing & Algorithmic Rigor
- [ ] Automated test suite (`tests/vision-ai.test.ts`) verifies color distance, OCR parsing, match score calculation, and Confusion Matrix/F1 calculations with 0 failures.
- [ ] All existing 50 unit and adversarial tests (`tests/*.test.ts`) pass with 0 regressions.
- [ ] Production build (`npm run build`) succeeds cleanly with 0 TypeScript or build errors.

### User Interface & Live Evaluation
- [ ] Uploading or capturing an item image in `/report` triggers sub-second visual feature extraction and populates detected fields with an AI badge.
- [ ] `/match/[id]` displays the Explainable AI radar/breakdown showing exact visual and textual score factors.
- [ ] `/admin/benchmark` runs live benchmark execution and renders the Confusion Matrix and comparative scientific metrics dynamically.
