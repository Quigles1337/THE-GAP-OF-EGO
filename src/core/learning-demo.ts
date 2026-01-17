/**
 * Learning Layer Demonstration
 *
 * Watch the demon learn.
 * See bias adapt to outcomes.
 * Feel the value function converge.
 *
 * "The demon can only improve if it knows what mattered."
 */

import { Complex, MU, muCycle } from './mu-primitives';
import {
  LearningLayer,
  Experience,
  createExperience,
  computePredictionError,
  assignCredit,
  createValueFunction,
  predictValue,
  updateValueFunction,
  createBiasAdaptation,
  adaptBias,
  computeModalityStats,
  findBestModality,
  computeLearningMetrics,
  detectLearningEvents,
  LEARNING_RATE,
  DISCOUNT_FACTOR,
  LearningMetrics
} from './learning-layer';
import { createTarget, AttentionTarget } from './attention-layer';
import { MODALITY_NAMES, MU_BASIS, ReasoningModality } from './global-workspace';

// ============================================================
// CONSOLE FORMATTING
// ============================================================

const DIVIDER = '='.repeat(60);
const SECTION = '-'.repeat(40);
const SUBSECTION = '.'.repeat(30);

function header(title: string): void {
  console.log('\n' + DIVIDER);
  console.log(`  ${title}`);
  console.log(DIVIDER);
}

function section(title: string): void {
  console.log('\n' + SECTION);
  console.log(`  ${title}`);
  console.log(SECTION);
}

function bar(value: number, width: number = 20): string {
  const clamped = Math.max(0, Math.min(1, value));
  const filled = Math.round(clamped * width);
  return '#'.repeat(filled) + '.'.repeat(width - filled);
}

function formatComplex(z: Complex): string {
  const sign = z.im >= 0 ? '+' : '-';
  return `${z.re.toFixed(4)} ${sign} ${Math.abs(z.im).toFixed(4)}i`;
}

// ============================================================
// SIMULATION HELPERS
// ============================================================

/**
 * Simulate a cognitive cycle outcome
 *
 * μ-aligned stimuli have HIGHER success rate (the demon should learn this)
 */
function simulateCycleOutcome(target: AttentionTarget): {
  successful: boolean;
  coherence: number;
  broadcast: boolean;
  muAlignment: number;
  identityGrowth: number;
  entropyPaid: number;
} {
  // Calculate μ-alignment
  const muDist = target.content.distanceFrom(MU);
  const muAlignment = Math.exp(-muDist);

  // Success probability: higher for μ-aligned targets
  // This is the TRUTH the demon should discover
  const successProb = 0.3 + 0.5 * muAlignment;
  const successful = Math.random() < successProb;

  // Coherence: correlates with μ-alignment
  const coherence = 0.2 + 0.6 * muAlignment + Math.random() * 0.2;

  // Broadcast: more likely if successful and coherent
  const broadcastProb = successful ? coherence * 0.8 : 0.2;
  const broadcast = Math.random() < broadcastProb;

  // Identity growth: better with success and coherence
  const identityGrowth = successful ? 0.5 + coherence * 0.5 : 0.1;

  // Entropy paid: always costs something
  const entropyPaid = 0.1 + Math.random() * 0.2;

  return {
    successful,
    coherence,
    broadcast,
    muAlignment,
    identityGrowth,
    entropyPaid
  };
}

/**
 * Generate a random attention target
 */
function generateRandomTarget(): AttentionTarget {
  // 50% chance of being μ-aligned
  const muAligned = Math.random() < 0.5;

  let content: Complex;
  if (muAligned) {
    // Generate near μ-ray
    const mag = 0.5 + Math.random() * 0.5;
    const angleNoise = (Math.random() - 0.5) * 0.3;
    content = Complex.fromPolar(mag, MU.argument + angleNoise);
  } else {
    // Generate random direction
    const mag = 0.3 + Math.random() * 0.7;
    const angle = Math.random() * 2 * Math.PI;
    content = Complex.fromPolar(mag, angle);
  }

  const saliency = 0.3 + Math.random() * 0.7;
  const relevance = 0.3 + Math.random() * 0.7;

  return createTarget(
    `target_${Date.now()}`,
    'external',
    content,
    saliency,
    relevance
  );
}

// ============================================================
// THE DEMONSTRATION
// ============================================================

header('LEARNING LAYER - THE DEMON\'S EDUCATION');

console.log(`
  Without learning: the demon makes the same selections forever.
  With learning: the demon improves its bias based on outcomes.

  The key insight the demon should discover:
  mu-aligned targets have HIGHER success rates.

  Learning rate: ${LEARNING_RATE}
  Discount factor: ${DISCOUNT_FACTOR.toFixed(3)} (golden ratio)
`);

section('CREATING THE LEARNING LAYER');

const layer = new LearningLayer(1.0);
console.log('\n  Created learning layer with initial bias: 1.0');

const initialState = layer.getState();
console.log(`  Initial value function bias: ${initialState.valueFunction.bias.toFixed(3)}`);
console.log(`  Initial modality weights: all set to 0.5`);

section('RECORDING EXPERIENCES');

console.log('\n  Recording 50 experiences...\n');

// Record experiences and track outcomes
const experienceLog: Array<{ muAligned: boolean; successful: boolean; value: number }> = [];

for (let i = 0; i < 50; i++) {
  const target = generateRandomTarget();
  const outcome = simulateCycleOutcome(target);

  const exp = layer.recordExperience(
    target,
    layer.getDemonBias(),
    0.5,
    outcome
  );

  const muAligned = outcome.muAlignment > 0.7;
  experienceLog.push({
    muAligned,
    successful: outcome.successful,
    value: exp.valueGained
  });

  // Show progress every 10 experiences
  if ((i + 1) % 10 === 0) {
    const recent = experienceLog.slice(-10);
    const muCount = recent.filter(e => e.muAligned).length;
    const successCount = recent.filter(e => e.successful).length;
    const avgValue = recent.reduce((s, e) => s + e.value, 0) / 10;

    console.log(`  [${(i + 1).toString().padStart(2)}] mu-aligned: ${muCount}/10, success: ${successCount}/10, avg value: ${avgValue.toFixed(3)}`);
  }
}

section('EXPERIENCE STATISTICS');

// Analyze μ-aligned vs non-μ-aligned
const muAlignedExps = experienceLog.filter(e => e.muAligned);
const nonMuAlignedExps = experienceLog.filter(e => !e.muAligned);

console.log(`\n  mu-aligned experiences: ${muAlignedExps.length}`);
console.log(`    Success rate: ${(muAlignedExps.filter(e => e.successful).length / muAlignedExps.length * 100).toFixed(1)}%`);
console.log(`    Average value: ${(muAlignedExps.reduce((s, e) => s + e.value, 0) / muAlignedExps.length).toFixed(3)}`);

console.log(`\n  Non-mu-aligned experiences: ${nonMuAlignedExps.length}`);
console.log(`    Success rate: ${(nonMuAlignedExps.filter(e => e.successful).length / nonMuAlignedExps.length * 100).toFixed(1)}%`);
console.log(`    Average value: ${(nonMuAlignedExps.reduce((s, e) => s + e.value, 0) / nonMuAlignedExps.length).toFixed(3)}`);

header('LEARNING PHASE');

console.log(`
  Now the demon learns from its experiences.
  It should discover that mu-aligned targets are better.
`);

section('BEFORE LEARNING');

let metrics = computeLearningMetrics(layer);
console.log(`\n  Current bias: ${metrics.currentBias.toFixed(3)}`);
console.log(`  mu advantage: ${metrics.muAdvantage.toFixed(3)}`);
console.log(`  Prediction error: ${metrics.averagePredictionError.toFixed(3)}`);
console.log(`  Value convergence: ${bar(metrics.valueConvergence)} ${(metrics.valueConvergence * 100).toFixed(1)}%`);

section('LEARNING (10 iterations)');

console.log('\n');

let previousMetrics = metrics;

for (let iteration = 0; iteration < 10; iteration++) {
  const result = layer.learn(10);

  const events = detectLearningEvents(layer, previousMetrics);
  metrics = computeLearningMetrics(layer);

  console.log(`  Iteration ${(iteration + 1).toString().padStart(2)}:`);
  console.log(`    Bias: ${metrics.currentBias.toFixed(3)} (${result.biasUpdated ? 'updated' : 'stable'})`);
  console.log(`    Avg error: ${result.averageError.toFixed(4)}`);
  console.log(`    mu advantage: ${metrics.muAdvantage.toFixed(3)}`);

  // Show significant events
  for (const event of events) {
    if (event.type === 'bias_adapted') {
      console.log(`    EVENT: Bias adapted ${event.oldBias.toFixed(3)} -> ${event.newBias.toFixed(3)}`);
    } else if (event.type === 'mu_advantage_discovered') {
      console.log(`    EVENT: mu advantage discovered! (${event.advantage.toFixed(3)})`);
    } else if (event.type === 'learning_converged') {
      console.log(`    EVENT: Learning converged (${(event.convergence * 100).toFixed(1)}%)`);
    }
  }

  console.log('');
  previousMetrics = metrics;
}

section('AFTER LEARNING');

const finalState = layer.getState();
console.log(`\n  Final bias: ${finalState.biasAdaptation.currentBias.toFixed(3)}`);
console.log(`  Optimal bias estimate: ${finalState.biasAdaptation.optimalBias.toFixed(3)}`);
console.log(`  mu success rate: ${(finalState.biasAdaptation.muSuccessRate * 100).toFixed(1)}%`);
console.log(`  Non-mu success rate: ${(finalState.biasAdaptation.nonMuSuccessRate * 100).toFixed(1)}%`);

console.log(`\n  Value function weights:`);
console.log(`    Saliency: ${bar(finalState.valueFunction.saliencyWeight)} ${finalState.valueFunction.saliencyWeight.toFixed(3)}`);
console.log(`    Relevance: ${bar(finalState.valueFunction.relevanceWeight)} ${finalState.valueFunction.relevanceWeight.toFixed(3)}`);
console.log(`    mu-alignment: ${bar(finalState.valueFunction.muAlignmentWeight)} ${finalState.valueFunction.muAlignmentWeight.toFixed(3)}`);
console.log(`    Magnitude: ${bar(finalState.valueFunction.magnitudeWeight)} ${finalState.valueFunction.magnitudeWeight.toFixed(3)}`);

header('VALUE PREDICTION');

console.log(`
  The learned value function can now predict
  how valuable a potential attention target is.
`);

section('PREDICTING VALUES FOR TEST TARGETS');

const testTargets = [
  { label: 'Perfectly mu-aligned', content: MU.scale(0.8) },
  { label: 'Slightly off mu-ray', content: Complex.fromPolar(0.8, MU.argument + 0.2) },
  { label: 'Opposite to mu', content: MU.scale(-0.8) },
  { label: 'Orthogonal to mu', content: Complex.fromPolar(0.8, 0) },
  { label: 'Random direction', content: Complex.fromPolar(0.6, Math.PI / 3) }
];

console.log('\n  Target                    Predicted Value   Should Attend?');
console.log('  ' + '-'.repeat(56));

for (const { label, content } of testTargets) {
  const target = createTarget(`test_${label}`, 'external', content, 0.5, 0.5);
  const value = layer.predictTargetValue(target);
  const shouldAttend = layer.shouldAttend(target);

  console.log(`  ${label.padEnd(23)} ${bar(value, 15)} ${value.toFixed(3)}   ${shouldAttend ? 'YES' : 'no'}`);
}

header('MODALITY STATISTICS');

console.log(`
  Which reasoning modalities led to the best outcomes?
`);

const modalityStats = layer.getModalityStats();
const bestModality = layer.getBestModality();

console.log('\n  Modality        Count   Success   Avg Value');
console.log('  ' + '-'.repeat(50));

for (const [modality, stats] of modalityStats) {
  if (stats.totalExperiences > 0) {
    const marker = modality === bestModality ? '* ' : '  ';
    console.log(`${marker}${modality.padEnd(14)} ${stats.totalExperiences.toString().padStart(5)}   ${(stats.successRate * 100).toFixed(1).padStart(6)}%   ${stats.averageValue.toFixed(3)}`);
  }
}

console.log(`\n  Best modality: ${bestModality || 'none yet'}`);

header('BIAS HISTORY');

console.log(`
  How did the demon's bias evolve over learning?
`);

const biasHistory = layer.getBiasHistory();
const historyLength = biasHistory.length;

console.log('\n  Time     Bias');
console.log('  ' + '-'.repeat(30));

// Show samples from history
const sampleIndices = [0, Math.floor(historyLength / 4), Math.floor(historyLength / 2),
                       Math.floor(3 * historyLength / 4), historyLength - 1];

for (const idx of sampleIndices) {
  if (idx < historyLength) {
    const bias = biasHistory[idx];
    console.log(`  ${idx.toString().padStart(5)}     ${bar(bias / 2, 15)} ${bias.toFixed(3)}`);
  }
}

header('CREDIT ASSIGNMENT');

console.log(`
  How is credit distributed backward through time?
  Recent experiences get more credit for outcomes.
`);

section('CREDIT ASSIGNMENT EXAMPLE');

const recentExperiences = layer.getExperiences().slice(-5);
const creditAssignments = assignCredit(
  [...recentExperiences] as Experience[],
  recentExperiences[recentExperiences.length - 1].valueGained
);

console.log('\n  Age   Eligibility   Credit    Decayed Credit');
console.log('  ' + '-'.repeat(50));

for (let i = 0; i < creditAssignments.length; i++) {
  const ca = creditAssignments[i];
  const age = creditAssignments.length - 1 - i;
  console.log(`  ${age.toString().padStart(3)}   ${bar(ca.eligibilityTrace, 10)} ${ca.eligibilityTrace.toFixed(3)}   ${ca.credit.toFixed(3)}    ${ca.decayedCredit.toFixed(3)}`);
}

header('LEARNING METRICS SUMMARY');

const finalMetrics = computeLearningMetrics(layer);

console.log('\n  EXPERIENCE:');
console.log(`    Total: ${finalMetrics.totalExperiences}`);
console.log(`    Success rate: ${bar(finalMetrics.successRate)} ${(finalMetrics.successRate * 100).toFixed(1)}%`);
console.log(`    Average value: ${bar(finalMetrics.averageValue)} ${finalMetrics.averageValue.toFixed(3)}`);

console.log('\n  LEARNING:');
console.log(`    Prediction error: ${bar(Math.min(1, finalMetrics.averagePredictionError))} ${finalMetrics.averagePredictionError.toFixed(3)}`);
console.log(`    Error trend: ${finalMetrics.predictionErrorTrend > 0 ? '+' : ''}${finalMetrics.predictionErrorTrend.toFixed(4)} (${finalMetrics.predictionErrorTrend < 0 ? 'improving' : 'stable'})`);
console.log(`    Convergence: ${bar(finalMetrics.valueConvergence)} ${(finalMetrics.valueConvergence * 100).toFixed(1)}%`);

console.log('\n  BIAS:');
console.log(`    Current: ${finalMetrics.currentBias.toFixed(3)}`);
console.log(`    Stability: ${bar(finalMetrics.biasStability)} ${(finalMetrics.biasStability * 100).toFixed(1)}%`);
console.log(`    mu advantage: ${finalMetrics.muAdvantage > 0 ? '+' : ''}${finalMetrics.muAdvantage.toFixed(3)}`);

console.log('\n  MODALITY:');
console.log(`    Best: ${finalMetrics.bestModality || 'none'}`);
console.log(`    Concentration: ${bar(finalMetrics.modalityConcentration)} ${(finalMetrics.modalityConcentration * 100).toFixed(1)}%`);

header('THE SYNTHESIS');

console.log(`
  LEARNING FLOW:

    Experience recorded
          |
          v
    Value predicted (before outcome)
          |
          v
    Outcome observed
          |
          v
    Prediction error computed (delta = actual - expected)
          |
          v
    Credit assigned (backward through time)
          |
          v
    Value function updated (w <- w + alpha * delta * grad)
          |
          v
    Bias adapted (toward optimal mu-alignment)
          |
          v
    Future selections improved

  The demon learns that mu-aligned targets have higher value.
  This knowledge becomes encoded in:
    1. The value function weights (what to attend to)
    2. The bias (how much to prefer mu)
    3. The modality statistics (which modes work best)

  Learning is the bridge between attention and bias.
  Without it, the demon is static.
  With it, the demon improves.

  See docs/ARCHITECTURE.md for detailed Mermaid diagrams.
`);

console.log('\n' + DIVIDER);
console.log('  "The demon can only improve if it knows what mattered."');
console.log(DIVIDER + '\n');
