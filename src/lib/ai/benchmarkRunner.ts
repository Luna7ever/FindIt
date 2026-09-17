import { BENCHMARK_SAMPLES, BenchmarkSamplePair } from './benchmarkData';
import { calculateMatchScore } from '@/lib/matching';

export interface ConfusionMatrix {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
}

export interface ScientificMetrics {
  precision: number; // 0.0 - 1.0 (or percentage)
  recall: number;    // 0.0 - 1.0 (or percentage)
  f1Score: number;   // 0.0 - 1.0 (or percentage)
  accuracy: number;  // 0.0 - 1.0 (or percentage)
  meanLatencyMs: number;
}

export interface SampleEvaluationResult {
  sampleId: string;
  name: string;
  groundTruth: boolean;
  predicted: boolean;
  score: number;
  threshold: number;
  classification: 'TP' | 'FP' | 'FN' | 'TN';
  latencyMs: number;
}

export interface BenchmarkSuiteResult {
  engineType: 'baseline' | 'multimodal';
  matrix: ConfusionMatrix;
  metrics: ScientificMetrics;
  results: SampleEvaluationResult[];
  sampleCount: number;
  threshold: number;
  executionTimestamp: string;
}

export interface BenchmarkComparison {
  baseline: BenchmarkSuiteResult;
  multimodal: BenchmarkSuiteResult;
  f1ImprovementDelta: number;
  latencyDeltaMs: number;
  sampleCount: number;
  threshold: number;
  executionTimestamp: string;
}

/**
 * Computes standard Confusion Matrix tallies with strict zero-safety
 */
export function computeConfusionMatrix(
  samples: { groundTruth: boolean; predicted: boolean }[]
): ConfusionMatrix {
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let trueNegatives = 0;

  for (const s of samples) {
    if (s.groundTruth && s.predicted) {
      truePositives++;
    } else if (!s.groundTruth && s.predicted) {
      falsePositives++;
    } else if (s.groundTruth && !s.predicted) {
      falseNegatives++;
    } else {
      trueNegatives++;
    }
  }

  return {
    truePositives,
    falsePositives,
    falseNegatives,
    trueNegatives,
  };
}

/**
 * Computes Precision, Recall, F1-Score, and Accuracy with mathematical zero-division guards
 */
export function computeScientificMetrics(
  matrix: ConfusionMatrix,
  meanLatencyMs = 0
): ScientificMetrics {
  const { truePositives: tp, falsePositives: fp, falseNegatives: fn, trueNegatives: tn } = matrix;

  const precisionDivisor = tp + fp;
  const precision = precisionDivisor > 0 ? tp / precisionDivisor : 0;

  const recallDivisor = tp + fn;
  const recall = recallDivisor > 0 ? tp / recallDivisor : 0;

  const f1Divisor = precision + recall;
  const f1Score = f1Divisor > 0 ? (2 * precision * recall) / f1Divisor : 0;

  const total = tp + fp + fn + tn;
  const accuracy = total > 0 ? (tp + tn) / total : 0;

  return {
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1Score: Number(f1Score.toFixed(4)),
    accuracy: Number(accuracy.toFixed(4)),
    meanLatencyMs: Number(meanLatencyMs.toFixed(2)),
  };
}

/**
 * Runs the benchmark suite on either 'baseline' (heuristic) or 'multimodal' (Edge AI) engine
 */
export async function runBenchmarkSuite(
  engineType: 'baseline' | 'multimodal',
  threshold = 0.65
): Promise<BenchmarkSuiteResult> {
  const thresholdInt = Math.round(threshold <= 1.0 ? threshold * 100 : threshold);
  const results: SampleEvaluationResult[] = [];
  const evalSamples: { groundTruth: boolean; predicted: boolean }[] = [];
  let totalLatency = 0;

  for (const sample of BENCHMARK_SAMPLES) {
    const start = performance.now();

    // In baseline mode, strip visualFeatures to test pure legacy text heuristic
    let itemA = sample.itemA;
    let itemB = sample.itemB;

    if (engineType === 'baseline') {
      itemA = { ...sample.itemA, visualFeatures: undefined };
      itemB = { ...sample.itemB, visualFeatures: undefined };
    }

    const breakdown = calculateMatchScore(itemA, itemB);
    const latency = performance.now() - start;
    totalLatency += latency;

    // Normalizing predicted output
    const predicted = breakdown.totalScore >= thresholdInt;
    evalSamples.push({ groundTruth: sample.groundTruth, predicted });

    let classification: 'TP' | 'FP' | 'FN' | 'TN';
    if (sample.groundTruth && predicted) classification = 'TP';
    else if (!sample.groundTruth && predicted) classification = 'FP';
    else if (sample.groundTruth && !predicted) classification = 'FN';
    else classification = 'TN';

    results.push({
      sampleId: sample.id,
      name: sample.name,
      groundTruth: sample.groundTruth,
      predicted,
      score: breakdown.totalScore,
      threshold: thresholdInt,
      classification,
      latencyMs: Number(latency.toFixed(2)),
    });
  }

  const matrix = computeConfusionMatrix(evalSamples);
  const meanLatencyMs = BENCHMARK_SAMPLES.length > 0 ? totalLatency / BENCHMARK_SAMPLES.length : 0;
  const metrics = computeScientificMetrics(matrix, meanLatencyMs);

  return {
    engineType,
    matrix,
    metrics,
    results,
    sampleCount: BENCHMARK_SAMPLES.length,
    threshold: thresholdInt,
    executionTimestamp: new Date().toISOString(),
  };
}

export const evaluateEngine = runBenchmarkSuite;

/**
 * Executes full comparative evaluation between Baseline Heuristic and Multimodal Edge AI
 */
export async function runComparativeBenchmark(threshold = 0.65): Promise<BenchmarkComparison> {
  const baseline = await runBenchmarkSuite('baseline', threshold);
  const multimodal = await runBenchmarkSuite('multimodal', threshold);

  const f1Delta = Number((multimodal.metrics.f1Score - baseline.metrics.f1Score).toFixed(4));
  const latencyDelta = Number((multimodal.metrics.meanLatencyMs - baseline.metrics.meanLatencyMs).toFixed(2));

  return {
    baseline,
    multimodal,
    f1ImprovementDelta: f1Delta,
    latencyDeltaMs: latencyDelta,
    sampleCount: BENCHMARK_SAMPLES.length,
    threshold: Math.round(threshold <= 1.0 ? threshold * 100 : threshold),
    executionTimestamp: new Date().toISOString(),
  };
}
