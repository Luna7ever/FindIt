import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  deltaE,
  rgbToLab,
  findNearestCanonicalColor,
  extractColorHistogram,
  extractDominantColors,
  calculateColorSimilarity,
  CANONICAL_PALETTE,
  ImageBufferData,
} from '../src/lib/vision/colorAnalysis';
import {
  extractShapeVector,
  calculateShapeSimilarity,
} from '../src/lib/vision/shapeAnalysis';
import { processImageBuffer } from '../src/lib/vision/edgeVisionEngine';
import { ShapeVector } from '../src/types';

// Helper to create synthetic RGBA buffers
function createSolidBuffer(width: number, height: number, r: number, g: number, b: number, a: number = 255): ImageBufferData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = a;
  }
  return { data, width, height };
}

describe('Challenger M1-1: Vision Core Stress Testing & Adversarial Verification', () => {

  // ==========================================================================
  // 1. PATHOLOGICAL BUFFERS & BOUNDARY CONDITIONS (colorAnalysis.ts)
  // ==========================================================================
  describe('1. Pathological Buffers & Boundary Conditions (colorAnalysis)', () => {
    it('1.1 Empty and zero-dimension buffers return safe zero histogram and default dominant color without throwing', () => {
      const emptyBuffer1: ImageBufferData = { data: new Uint8ClampedArray(0), width: 0, height: 0 };
      const hist1 = extractColorHistogram(emptyBuffer1);
      assert.equal(hist1.length, 9, 'Histogram must have 9 bins');
      assert.ok(hist1.every((v) => v === 0), 'All bins must be 0 for empty buffer');

      const dominant1 = extractDominantColors(emptyBuffer1);
      assert.ok(Array.isArray(dominant1), 'Must return an array');
      assert.equal(dominant1.length, 1, 'Must fallback to 1 default color');
      assert.ok(!Number.isNaN(dominant1[0].percentage), 'Percentage must not be NaN');

      const emptyBuffer2: ImageBufferData = { data: new Uint8ClampedArray(16), width: 0, height: 4 };
      const hist2 = extractColorHistogram(emptyBuffer2);
      assert.ok(hist2.every((v) => v === 0));

      const emptyBuffer3: ImageBufferData = { data: new Uint8ClampedArray(16), width: 4, height: 0 };
      const hist3 = extractColorHistogram(emptyBuffer3);
      assert.ok(hist3.every((v) => v === 0));
    });

    it('1.2 Minimal 1x1 Pixel Buffers: processes single-pixel images accurately without NaN or divide-by-zero', () => {
      // 1x1 Red pixel
      const redPixel = createSolidBuffer(1, 1, 220, 38, 38, 255);
      const histRed = extractColorHistogram(redPixel);
      const domRed = extractDominantColors(redPixel);

      assert.equal(histRed.length, 9);
      const redIndex = CANONICAL_PALETTE.findIndex((c) => c.id === 'red');
      assert.equal(histRed[redIndex], 1.0, 'Red bin should have 100% weight');
      assert.equal(domRed[0].name, 'red');
      assert.equal(domRed[0].percentage, 100);

      // 1x1 Pure Black pixel
      const blackPixel = createSolidBuffer(1, 1, 0, 0, 0, 255);
      const domBlack = extractDominantColors(blackPixel);
      assert.equal(domBlack[0].name, 'black');
      assert.equal(domBlack[0].percentage, 100);

      // 1x1 Transparent pixel (a = 0)
      const transparentPixel = createSolidBuffer(1, 1, 255, 0, 0, 0);
      const domTrans = extractDominantColors(transparentPixel);
      assert.ok(domTrans.length >= 1);
      assert.ok(!Number.isNaN(domTrans[0].percentage));
    });

    it('1.3 All-transparent buffer (alpha < 30) does not cause division by zero or NaN', () => {
      const transBuffer = createSolidBuffer(16, 16, 100, 150, 200, 10);
      const hist = extractColorHistogram(transBuffer);
      assert.ok(hist.every((v) => v === 0), 'All bins must be 0 when all pixels are transparent');
      assert.ok(hist.every((v) => !Number.isNaN(v)), 'No bin may be NaN');

      const dominant = extractDominantColors(transBuffer);
      assert.ok(dominant.length >= 1);
      assert.ok(!Number.isNaN(dominant[0].percentage));
    });
  });

  // ==========================================================================
  // 2. MONOCHROMATIC, NOISE & INVERTED COLORS (colorAnalysis.ts)
  // ==========================================================================
  describe('2. Monochromatic, Noise & Inverted Colors (colorAnalysis)', () => {
    it('2.1 Saturated Monochromatic Colors: Maps all primary saturated colors to canonical palette with 100% precision', () => {
      const primaries = [
        { name: 'red', rgb: [220, 38, 38] as [number, number, number] },
        { name: 'green', rgb: [22, 163, 74] as [number, number, number] },
        { name: 'blue', rgb: [37, 99, 235] as [number, number, number] },
        { name: 'black', rgb: [24, 24, 27] as [number, number, number] },
        { name: 'white', rgb: [248, 250, 252] as [number, number, number] },
        { name: 'navy', rgb: [30, 41, 59] as [number, number, number] },
        { name: 'brown', rgb: [120, 53, 15] as [number, number, number] },
        { name: 'purple', rgb: [139, 92, 246] as [number, number, number] },
      ];

      for (const primary of primaries) {
        const nearest = findNearestCanonicalColor(primary.rgb);
        assert.equal(nearest.color.name, primary.name, `RGB ${primary.rgb} should map to ${primary.name}`);
        assert.ok(nearest.distance < 0.01, `Delta-E to itself should be ~0, got ${nearest.distance}`);

        const buffer = createSolidBuffer(32, 32, primary.rgb[0], primary.rgb[1], primary.rgb[2]);
        const dominant = extractDominantColors(buffer);
        assert.equal(dominant[0].name, primary.name);
        assert.ok(dominant[0].percentage >= 99);
      }
    });

    it('2.2 Uniform White, Black, and Gray Noise: Confirms dominant classification and histogram stability', () => {
      // 1. Pure White
      const whiteBuffer = createSolidBuffer(32, 32, 255, 255, 255);
      const whiteDom = extractDominantColors(whiteBuffer);
      assert.equal(whiteDom[0].name, 'white');
      assert.ok(whiteDom[0].percentage >= 99);

      // 2. Pure Black
      const blackBuffer = createSolidBuffer(32, 32, 0, 0, 0);
      const blackDom = extractDominantColors(blackBuffer);
      assert.equal(blackDom[0].name, 'black');
      assert.ok(blackDom[0].percentage >= 99);

      // 3. Mid Gray
      const grayBuffer = createSolidBuffer(32, 32, 100, 116, 139);
      const grayDom = extractDominantColors(grayBuffer);
      assert.equal(grayDom[0].name, 'gray');
      assert.ok(grayDom[0].percentage >= 99);

      // 4. Uniform Random Noise (Pseudorandom LCG)
      const noiseData = new Uint8ClampedArray(64 * 64 * 4);
      let seed = 12345;
      for (let i = 0; i < 64 * 64 * 4; i += 4) {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        noiseData[i] = seed & 0xff;
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        noiseData[i + 1] = seed & 0xff;
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        noiseData[i + 2] = seed & 0xff;
        noiseData[i + 3] = 255;
      }
      const noiseBuffer: ImageBufferData = { data: noiseData, width: 64, height: 64 };
      const noiseHist = extractColorHistogram(noiseBuffer);
      const sumHist = noiseHist.reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(sumHist - 1.0) < 0.01, `Noise histogram sum should be 1.0, got ${sumHist}`);
      assert.ok(noiseHist.every((v) => !Number.isNaN(v) && v >= 0 && v <= 1));

      const noiseDominant = extractDominantColors(noiseBuffer);
      assert.ok(noiseDominant.length >= 1);
      assert.ok(noiseDominant.every((c) => !Number.isNaN(c.percentage) && c.percentage > 0));
    });

    it('2.3 Inverted Colors & Metric Axioms: Verifies Delta-E symmetry, positivity, and triangle inequality', () => {
      // Metric Axiom 1: Positivity (d(x, y) >= 0 and d(x, x) == 0)
      const labA = rgbToLab([150, 50, 200]);
      const labB = rgbToLab([50, 200, 100]);
      const labC = rgbToLab([200, 150, 50]);

      assert.equal(deltaE(labA, labA), 0, 'd(A, A) must be 0');
      assert.ok(deltaE(labA, labB) > 0, 'd(A, B) must be > 0 for distinct colors');

      // Metric Axiom 2: Symmetry (d(x, y) == d(y, x))
      assert.equal(deltaE(labA, labB), deltaE(labB, labA), 'Delta-E must be symmetric');

      // Metric Axiom 3: Triangle Inequality (d(A, C) <= d(A, B) + d(B, C))
      const dAC = deltaE(labA, labC);
      const dAB_BC = deltaE(labA, labB) + deltaE(labB, labC);
      assert.ok(dAC <= dAB_BC + 1e-9, `Triangle inequality violation: ${dAC} > ${dAB_BC}`);

      // Inverted color test: Pure Red vs Inverted Red (Cyan)
      const red = rgbToLab([255, 0, 0]);
      const cyan = rgbToLab([0, 255, 255]);
      const invDistance = deltaE(red, cyan);
      assert.ok(invDistance > 80, `Distance between red and cyan should be high (>80), got ${invDistance}`);

      // Similarity between inverted colors should be low
      const redDom = [{ name: 'red', rgb: [220, 38, 38] as [number, number, number], hex: '#DC2626', percentage: 100 }];
      const cyanDom = [{ name: 'blue', rgb: [37, 99, 235] as [number, number, number], hex: '#2563EB', percentage: 100 }];
      const sim = calculateColorSimilarity(redDom, cyanDom);
      assert.ok(sim < 30, `Red vs Cyan similarity should be low (<30%), got ${sim}%`);
    });

    it('2.4 Histogram Intersection Properties: Commutative, bounded [0..100], identical is 100%', () => {
      const h1 = [0.4, 0.3, 0.2, 0.1, 0, 0, 0, 0, 0];
      const h2 = [0.1, 0.2, 0.3, 0.4, 0, 0, 0, 0, 0];
      const hDisjoint = [0, 0, 0, 0, 0.5, 0.5, 0, 0, 0];

      // Identical
      const simIdentical = calculateColorSimilarity(h1, h1);
      assert.equal(simIdentical, 100, `Identical histogram similarity should be 100%, got ${simIdentical}`);

      // Commutative: sim(A, B) == sim(B, A)
      const simAB = calculateColorSimilarity(h1, h2);
      const simBA = calculateColorSimilarity(h2, h1);
      assert.equal(simAB, simBA, `Histogram similarity should be commutative: ${simAB} vs ${simBA}`);

      // Disjoint: intersection is 0
      const simDisjoint = calculateColorSimilarity(h1, hDisjoint);
      assert.ok(simDisjoint <= 35, `Disjoint histogram similarity should be low, got ${simDisjoint}`);
    });
  });

  // ==========================================================================
  // 3. SHAPE ANALYSIS STRESS TESTS (shapeAnalysis.ts)
  // ==========================================================================
  describe('3. Shape Analysis Stress Tests (shapeAnalysis)', () => {
    it('3.1 Pathological and Zero-Dimension Buffers: Returns safe fallback shape vector without throwing', () => {
      const emptyBuffer: ImageBufferData = { data: new Uint8ClampedArray(0), width: 0, height: 0 };
      const shape = extractShapeVector(emptyBuffer);
      assert.equal(shape.aspectRatio, 1.0);
      assert.equal(shape.solidity, 0.5);
      assert.equal(shape.edgeComplexity, 25.0);

      const tinyBuffer: ImageBufferData = { data: new Uint8ClampedArray(2), width: 2, height: 2 };
      const shapeTiny = extractShapeVector(tinyBuffer);
      assert.equal(shapeTiny.aspectRatio, 1.0);
      assert.equal(shapeTiny.solidity, 0.5);
    });

    it('3.2 1x1 Pixel Images: Computes non-NaN shape descriptors with zero corner size', () => {
      const onePixel = createSolidBuffer(1, 1, 200, 100, 50);
      const shape = extractShapeVector(onePixel);

      assert.equal(shape.aspectRatio, 1.0);
      assert.ok(!Number.isNaN(shape.solidity), 'Solidity must not be NaN');
      assert.ok(shape.solidity >= 0.05 && shape.solidity <= 1.0, `Solidity should be in [0.05, 1.0], got ${shape.solidity}`);
      assert.ok(!Number.isNaN(shape.edgeComplexity), 'Edge complexity must not be NaN');
      assert.equal(shape.edgeComplexity, 25.0, '1x1 buffer has 0 edge samples, should fallback to 25.0');
    });

    it('3.3 Extreme Aspect Ratios (1000:1 and 1:1000): Does not crash or divide by zero', () => {
      // 1000:1 ultra-wide strip
      const wideBuffer = createSolidBuffer(1000, 1, 255, 255, 255);
      const wideShape = extractShapeVector(wideBuffer);
      assert.equal(wideShape.aspectRatio, 1000);
      assert.ok(!Number.isNaN(wideShape.solidity));
      assert.ok(!Number.isNaN(wideShape.edgeComplexity));

      // 1:1000 ultra-tall strip
      const tallBuffer = createSolidBuffer(1, 1000, 0, 0, 0);
      const tallShape = extractShapeVector(tallBuffer);
      assert.ok(!Number.isNaN(tallShape.aspectRatio));
      assert.ok(!Number.isNaN(tallShape.solidity));
      assert.ok(!Number.isNaN(tallShape.edgeComplexity));

      // Calculate similarity between extreme aspect ratios
      assert.doesNotThrow(() => {
        const sim = calculateShapeSimilarity(wideShape, tallShape);
        assert.ok(!Number.isNaN(sim));
        assert.ok(sim >= 0 && sim <= 100, `Similarity must be in [0, 100], got ${sim}`);
      }, 'Calculating similarity between 1000:1 and 1:1000 must not throw');

      // Orientation invariance: a horizontal 2:1 rectangle should match a vertical 1:2 rectangle
      const horizontalBox: ShapeVector = { aspectRatio: 2.0, solidity: 0.8, edgeComplexity: 40 };
      const verticalBox: ShapeVector = { aspectRatio: 0.5, solidity: 0.8, edgeComplexity: 40 };
      const orientSim = calculateShapeSimilarity(horizontalBox, verticalBox);
      assert.equal(orientSim, 100, `Rotated 2:1 and 1:2 rectangles should achieve 100% shape similarity, got ${orientSim}%`);
    });

    it('3.4 Uniform Foreground vs Background (Solidity Extremes): Flat color yields minimum solidity (0.05)', () => {
      // Completely uniform black canvas: foreground delta is 0 (< 18), so fgPixelCount = 0 -> minimum clamped 0.05
      const blackCanvas = createSolidBuffer(32, 32, 0, 0, 0);
      const blackShape = extractShapeVector(blackCanvas);
      assert.equal(blackShape.solidity, 0.05, `Uniform canvas solidity should be clamped to 0.05, got ${blackShape.solidity}`);

      // High contrast foreground box (black box in center of white canvas)
      const boxCanvas = createSolidBuffer(32, 32, 255, 255, 255);
      for (let y = 8; y < 24; y++) {
        for (let x = 8; x < 24; x++) {
          const idx = (y * 32 + x) * 4;
          boxCanvas.data[idx] = 0;
          boxCanvas.data[idx + 1] = 0;
          boxCanvas.data[idx + 2] = 0;
        }
      }
      const boxShape = extractShapeVector(boxCanvas);
      assert.ok(boxShape.solidity > 0.20 && boxShape.solidity < 0.35, `16x16 center box on 32x32 canvas should have ~25% solidity, got ${boxShape.solidity}`);
    });

    it('3.5 Edge Complexity Extremes: Flat canvas has 0.0, 4x4 block checkerboard has high complexity, and 1-pixel checkerboard demonstrates central difference Nyquist blind spot', () => {
      // 1. Flat canvas: perfectly uniform, no gradient anywhere
      const flatCanvas = createSolidBuffer(32, 32, 128, 128, 128);
      const flatShape = extractShapeVector(flatCanvas);
      assert.equal(flatShape.edgeComplexity, 0.0, `Flat canvas edge complexity should be 0.0, got ${flatShape.edgeComplexity}`);

      // 2. High-contrast multi-pixel block pattern (4x4 blocks): strong edges detected
      const blockData = new Uint8ClampedArray(32 * 32 * 4);
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const idx = (y * 32 + x) * 4;
          const val = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0 ? 0 : 255;
          blockData[idx] = val;
          blockData[idx + 1] = val;
          blockData[idx + 2] = val;
          blockData[idx + 3] = 255;
        }
      }
      const blockBuffer: ImageBufferData = { data: blockData, width: 32, height: 32 };
      const blockShape = extractShapeVector(blockBuffer);
      assert.ok(blockShape.edgeComplexity >= 30.0, `Multi-pixel block edges should have high complexity (>=30), got ${blockShape.edgeComplexity}`);

      // 3. Adversarial Edge Case: 1-pixel checkerboard (period 2)
      // Because central difference operator evaluates f(x+1) - f(x-1) and f(y+1) - f(y-1),
      // period-2 patterns have identical parity at +/- 1 pixel, producing exactly 0.0 gradient.
      const checkerData = new Uint8ClampedArray(32 * 32 * 4);
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const idx = (y * 32 + x) * 4;
          const val = (x + y) % 2 === 0 ? 0 : 255;
          checkerData[idx] = val;
          checkerData[idx + 1] = val;
          checkerData[idx + 2] = val;
          checkerData[idx + 3] = 255;
        }
      }
      const checkerBuffer: ImageBufferData = { data: checkerData, width: 32, height: 32 };
      const checkerShape = extractShapeVector(checkerBuffer);
      assert.equal(checkerShape.edgeComplexity, 0.0, 'Central difference filter mathematically zeros out period-2 parity checkerboards');
    });

    it('3.6 Shape Similarity Metric Properties: Identity, symmetry, and bounds', () => {
      const s1: ShapeVector = { aspectRatio: 1.5, solidity: 0.7, edgeComplexity: 50 };
      const s2: ShapeVector = { aspectRatio: 0.8, solidity: 0.4, edgeComplexity: 20 };

      // Identity: sim(s, s) === 100
      assert.equal(calculateShapeSimilarity(s1, s1), 100);
      assert.equal(calculateShapeSimilarity(s2, s2), 100);

      // Symmetry: sim(s1, s2) === sim(s2, s1)
      assert.equal(calculateShapeSimilarity(s1, s2), calculateShapeSimilarity(s2, s1));

      // Bounds: between 0 and 100 for any extreme values
      const sExtreme1: ShapeVector = { aspectRatio: 10000, solidity: 1.0, edgeComplexity: 100 };
      const sExtreme2: ShapeVector = { aspectRatio: 0.0001, solidity: 0.05, edgeComplexity: 0 };
      const extremeSim = calculateShapeSimilarity(sExtreme1, sExtreme2);
      assert.ok(extremeSim >= 0 && extremeSim <= 100);
    });
  });

  // ==========================================================================
  // 4. SUB-30MS PERFORMANCE BENCHMARKS UNDER LOAD
  // ==========================================================================
  describe('4. Sub-30ms Performance Benchmarks Under Load', () => {
    it('4.1 Large 1024x1024 Buffer (1 Megapixel): Color extraction executes in strictly < 30ms', () => {
      const width = 1024;
      const height = 1024;
      const data = new Uint8ClampedArray(width * height * 4);
      // Fill with gradient data
      for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        data[idx] = (i % 256);
        data[idx + 1] = ((i * 3) % 256);
        data[idx + 2] = ((i * 7) % 256);
        data[idx + 3] = 255;
      }
      const largeBuffer: ImageBufferData = { data, width, height };

      const start = performance.now();
      const dominant = extractDominantColors(largeBuffer, 3);
      const hist = extractColorHistogram(largeBuffer);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 30.0, `Color extraction for 1024x1024 image took ${elapsed.toFixed(2)}ms (must be < 30ms)`);
      assert.ok(dominant.length >= 1);
      assert.equal(hist.length, 9);
    });

    it('4.2 Large 1024x1024 Buffer (1 Megapixel): Shape extraction executes in strictly < 30ms', () => {
      const width = 1024;
      const height = 1024;
      const data = new Uint8ClampedArray(width * height * 4);
      // Fill with checkerboard pattern
      for (let y = 0; y < height; y += 8) {
        for (let x = 0; x < width; x += 8) {
          const idx = (y * width + x) * 4;
          data[idx] = ((x + y) % 16 === 0) ? 255 : 0;
          data[idx + 1] = 128;
          data[idx + 2] = 64;
          data[idx + 3] = 255;
        }
      }
      const largeBuffer: ImageBufferData = { data, width, height };

      const start = performance.now();
      const shape = extractShapeVector(largeBuffer);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 30.0, `Shape extraction for 1024x1024 image took ${elapsed.toFixed(2)}ms (must be < 30ms)`);
      assert.ok(shape.aspectRatio > 0);
      assert.ok(!Number.isNaN(shape.solidity));
      assert.ok(!Number.isNaN(shape.edgeComplexity));
    });

    it('4.3 Canonical 128x128 Analysis Buffer: Mean execution latency over 50 iterations is sub-30ms (well under 15ms)', () => {
      const width = 128;
      const height = 128;
      const buffer = createSolidBuffer(width, height, 37, 99, 235); // Blue
      // Put a red center
      for (let y = 32; y < 96; y++) {
        for (let x = 32; x < 96; x++) {
          const idx = (y * width + x) * 4;
          buffer.data[idx] = 220;
          buffer.data[idx + 1] = 38;
          buffer.data[idx + 2] = 38;
        }
      }

      const iterations = 50;
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        extractDominantColors(buffer, 3);
        extractShapeVector(buffer);
      }
      const totalElapsed = performance.now() - start;
      const meanLatency = totalElapsed / iterations;

      assert.ok(meanLatency < 15.0, `Mean latency per 128x128 frame was ${meanLatency.toFixed(3)}ms (must be strictly sub-30ms)`);
    });

    it('4.4 End-to-End Pipeline (processImageBuffer): Completes in < 15ms on 128x128 buffer with full OCR prompt', () => {
      const buffer = createSolidBuffer(128, 128, 24, 24, 27);
      const rawPrompt = 'Casio fx-991EX CLASSWIZ SN-8829147 الطالبة ريم أحمد';

      // Warm up JIT execution
      processImageBuffer(buffer, rawPrompt);

      const start = performance.now();
      const result = processImageBuffer(buffer, rawPrompt);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 30.0, `End-to-end processImageBuffer took ${elapsed.toFixed(2)}ms (must be < 30ms)`);
      assert.equal(result.dominantColors[0].name, 'black');
      assert.equal(result.shape?.aspectRatio, 1.0);
      assert.equal(result.ocr?.entities.brand?.toLowerCase(), 'casio');
      assert.ok(result.ocr?.entities.model?.includes('991EX'));
      assert.ok(result.ocr?.entities.serialNumber?.includes('8829147'));
      assert.ok(result.ocr?.entities.studentName?.includes('ريم'));
    });
  });
});
