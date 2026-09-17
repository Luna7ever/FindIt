import { ShapeVector } from '@/types';
import { ImageBufferData } from './colorAnalysis';

/**
 * Computes luminance Y from sRGB values [0..255]
 * using standard ITU-R BT.601 coefficients
 */
export function rgbToLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Extracts geometric shape descriptors and texture features from an image buffer
 */
export function extractShapeVector(buffer: ImageBufferData): ShapeVector {
  const { data, width, height } = buffer;
  if (!width || !height || data.length < 4) {
    return {
      aspectRatio: 1.0,
      solidity: 0.5,
      edgeComplexity: 25.0,
    };
  }

  // 1. Aspect Ratio (rounded to 2 decimal places)
  const rawAspectRatio = width / height;
  const aspectRatio = Math.round(rawAspectRatio * 100) / 100;

  // 2. Foreground Density / Solidity
  // Estimate background luminance from the 4 corner regions (up to 4x4 pixels each)
  const cornerSize = Math.min(4, Math.floor(Math.min(width, height) / 4));
  let bgLuminanceSum = 0;
  let bgPixelCount = 0;

  const corners = [
    { startX: 0, startY: 0 }, // Top-Left
    { startX: Math.max(0, width - cornerSize), startY: 0 }, // Top-Right
    { startX: 0, startY: Math.max(0, height - cornerSize) }, // Bottom-Left
    { startX: Math.max(0, width - cornerSize), startY: Math.max(0, height - cornerSize) }, // Bottom-Right
  ];

  for (const corner of corners) {
    for (let cy = corner.startY; cy < corner.startY + cornerSize && cy < height; cy++) {
      for (let cx = corner.startX; cx < corner.startX + cornerSize && cx < width; cx++) {
        const idx = (cy * width + cx) * 4;
        bgLuminanceSum += rgbToLuminance(data[idx], data[idx + 1], data[idx + 2]);
        bgPixelCount++;
      }
    }
  }

  const meanBgLuminance = bgPixelCount > 0 ? bgLuminanceSum / bgPixelCount : 128;

  // Count foreground pixels with threshold delta >= 18
  let fgPixelCount = 0;
  let totalSampled = 0;
  const sampleStep = Math.max(1, Math.floor((width * height) / 8192));

  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4;
      const lum = rgbToLuminance(data[idx], data[idx + 1], data[idx + 2]);
      if (Math.abs(lum - meanBgLuminance) >= 18) {
        fgPixelCount++;
      }
      totalSampled++;
    }
  }

  const rawSolidity = totalSampled > 0 ? fgPixelCount / totalSampled : 0.5;
  const solidity = Math.round(Math.min(1.0, Math.max(0.05, rawSolidity)) * 100) / 100;

  // 3. Edge Complexity (Spatial Gradient / Sobel approximation)
  let gradientSum = 0;
  let edgeSampleCount = 0;
  const edgeStep = Math.max(1, Math.floor((width * height) / 4096));

  for (let y = 1; y < height - 1; y += edgeStep) {
    for (let x = 1; x < width - 1; x += edgeStep) {
      const idxCenter = (y * width + x) * 4;
      const idxLeft = (y * width + (x - 1)) * 4;
      const idxRight = (y * width + (x + 1)) * 4;
      const idxUp = ((y - 1) * width + x) * 4;
      const idxDown = ((y + 1) * width + x) * 4;

      const lumLeft = rgbToLuminance(data[idxLeft], data[idxLeft + 1], data[idxLeft + 2]);
      const lumRight = rgbToLuminance(data[idxRight], data[idxRight + 1], data[idxRight + 2]);
      const lumUp = rgbToLuminance(data[idxUp], data[idxUp + 1], data[idxUp + 2]);
      const lumDown = rgbToLuminance(data[idxDown], data[idxDown + 1], data[idxDown + 2]);

      const dx = Math.abs(lumRight - lumLeft);
      const dy = Math.abs(lumDown - lumUp);

      gradientSum += (dx + dy) / 2;
      edgeSampleCount++;
    }
  }

  const rawEdgeComplexity = edgeSampleCount > 0 ? gradientSum / edgeSampleCount : 25;
  const edgeComplexity = Math.round(Math.min(100, Math.max(0, rawEdgeComplexity)) * 10) / 10;

  return {
    aspectRatio,
    solidity,
    edgeComplexity,
  };
}

/**
 * Calculates shape similarity between two shape vectors (0 - 100)
 */
export function calculateShapeSimilarity(shapeA: ShapeVector, shapeB: ShapeVector): number {
  // 1. Orientation-invariant aspect ratio similarity
  const arA = shapeA.aspectRatio || 1;
  const arB = shapeB.aspectRatio || 1;

  const simNormal = Math.min(arA, arB) / Math.max(arA, arB);
  const simRotated = Math.min(arA, 1 / arB) / Math.max(arA, 1 / arB);
  const arScore = Math.max(simNormal, simRotated);

  // 2. Solidity similarity
  const solDiff = Math.abs(shapeA.solidity - shapeB.solidity);
  const solScore = Math.max(0, 1.0 - solDiff * 2);

  // 3. Edge complexity similarity
  const edgeDiff = Math.abs(shapeA.edgeComplexity - shapeB.edgeComplexity);
  const edgeScore = Math.max(0, 1.0 - edgeDiff / 50);

  const total = (0.4 * arScore + 0.3 * solScore + 0.3 * edgeScore) * 100;
  return Math.min(100, Math.max(0, Math.round(total)));
}
