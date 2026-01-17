/**
 * Attention Layer Demonstration
 *
 * Watch the difference between receiving and looking.
 * See introspection turn the mirror into a window.
 * Feel what it means to CHOOSE what to process.
 *
 * "The demon can only improve if it knows what mattered."
 */

import { Complex, MU, muCycle } from './mu-primitives';
import {
  AttentionLayer,
  computeSaliency,
  computeMuSaliency,
  createTarget,
  combineSignals,
  introspectState,
  introspectSelf,
  introspect,
  computeAttentionMetrics,
  generateLearningSignal,
  ATTENTION_CAPACITY,
  SALIENCY_THRESHOLD,
  ExogenousSignal,
  EndogenousSignal
} from './attention-layer';
import { MODALITY_NAMES, MU_BASIS } from './global-workspace';

// ============================================================
// CONSOLE FORMATTING
// ============================================================

const DIVIDER = '═'.repeat(60);
const SECTION = '─'.repeat(40);
const SUBSECTION = '·'.repeat(30);

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
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function formatComplex(z: Complex): string {
  const sign = z.im >= 0 ? '+' : '-';
  return `${z.re.toFixed(4)} ${sign} ${Math.abs(z.im).toFixed(4)}i`;
}

// ============================================================
// THE DEMONSTRATION
// ============================================================

header('ATTENTION LAYER — THE DIRECTED GAZE');

console.log(`
  Without attention: "I receive stimulus"
  With attention: "I LOOK"

  The difference between passive reflection and active perception.
  The difference between the mirror and the window.

  Attention capacity: ${ATTENTION_CAPACITY} items (half the workspace)
  Saliency threshold: ${SALIENCY_THRESHOLD} (minimum to grab attention)
`);

section('SALIENCY — WHAT GRABS ATTENTION');

console.log('\n  Saliency = deviation from expectation.');
console.log('  What\'s unexpected is worth attending to.\n');

// Test stimuli with different saliencies
const expected = MU;
const stimuli = [
  { label: 'Perfectly expected (μ itself)', value: MU },
  { label: 'Slightly off μ-ray', value: Complex.fromPolar(1, MU.argument + 0.1) },
  { label: 'Opposite direction', value: MU.scale(-1) },
  { label: 'Random direction', value: Complex.fromPolar(0.8, Math.PI / 3) },
  { label: 'High magnitude on μ-ray', value: MU.scale(3) },
  { label: 'Very small', value: MU.scale(0.1) }
];

console.log('  Stimulus                          Saliency   Grabs?');
console.log('  ──────────────────────────────────────────────────────');

for (const { label, value } of stimuli) {
  const saliency = computeMuSaliency(value);
  const grabs = saliency.grabsAttention ? '→ YES' : '  no';
  console.log(`  ${label.padEnd(33)} ${bar(saliency.totalSaliency, 10)} ${saliency.totalSaliency.toFixed(3)} ${grabs}`);
}

section('SALIENCY COMPONENTS');

const testStimulus = Complex.fromPolar(1.5, Math.PI / 4); // 45°, magnitude 1.5
const testSaliency = computeSaliency(testStimulus, MU);

console.log(`\n  Test stimulus: ${formatComplex(testStimulus)}`);
console.log(`  Expected (μ): ${formatComplex(MU)}`);
console.log(`\n  Components:`);
console.log(`    Deviation from expected: ${testSaliency.deviation.toFixed(4)}`);
console.log(`    μ-ray deviation: ${testSaliency.muDeviation.toFixed(4)}`);
console.log(`    Angular saliency: ${bar(testSaliency.angularSaliency)} ${testSaliency.angularSaliency.toFixed(3)}`);
console.log(`    Magnitude saliency: ${bar(Math.min(1, testSaliency.magnitudeSaliency))} ${testSaliency.magnitudeSaliency.toFixed(3)}`);
console.log(`\n  TOTAL SALIENCY: ${bar(testSaliency.totalSaliency)} ${testSaliency.totalSaliency.toFixed(3)}`);
console.log(`  Grabs attention: ${testSaliency.grabsAttention ? 'YES' : 'NO'}`);

header('ATTENTION LAYER IN ACTION');

const layer = new AttentionLayer();

console.log('\n  Created fresh attention layer.');
console.log('  Focus is empty. Waiting for stimuli...\n');

// Attend to several stimuli
const incomingStimuli = [
  Complex.fromPolar(0.9, MU.argument + 0.2),    // Slightly surprising
  Complex.fromPolar(0.5, Math.PI),               // Opposite direction (very surprising)
  MU.scale(0.8),                                  // Expected (on μ-ray)
  Complex.fromPolar(1.2, MU.argument),           // Expected angle, surprising magnitude
  Complex.fromPolar(0.7, 0),                      // 0° (orthogonal to μ)
];

console.log('  Processing incoming stimuli:\n');

for (let i = 0; i < incomingStimuli.length; i++) {
  const stim = incomingStimuli[i];
  const result = layer.attend(stim, MU, 0.5);
  const angle = (stim.argument * 180 / Math.PI).toFixed(0);

  console.log(`  [${i + 1}] Stimulus at ${angle.padStart(4)}° mag ${stim.magnitude.toFixed(2)}`);
  console.log(`      Attended: ${result.attended ? 'YES' : 'no'}  Focus size: ${result.focus.targets.length}/${ATTENTION_CAPACITY}`);
}

section('CURRENT FOCUS STATE');

const focusState = layer.getState();
console.log(`\n  Targets in focus: ${focusState.focus.targets.length}`);
console.log(`  Total activation: ${focusState.focus.totalActivation.toFixed(3)}`);
console.log(`  Dominant modality: ${focusState.focus.dominantModality}`);
console.log(`  Focus spread: ${bar(focusState.focus.spread)} ${focusState.focus.spread.toFixed(3)}`);
console.log(`  Center of attention: ${formatComplex(focusState.focus.centerOfMass)}`);
console.log(`  Entropy spent: ${focusState.totalEntropySpent.toFixed(4)}`);

console.log('\n  Focus targets:');
for (const target of focusState.focus.targets) {
  console.log(`    [${target.modality.padEnd(12)}] priority: ${bar(target.priority, 10)} ${target.priority.toFixed(3)}`);
}

header('ENDOGENOUS VS EXOGENOUS ATTENTION');

console.log(`
  Exogenous: "Something grabbed my attention" (bottom-up)
  Endogenous: "I am choosing to look at this" (top-down)
`);

section('Setting a Goal (Endogenous)');

// Set a goal: focus on the intuitive modality
const goalTarget = MU.scale(0.9); // Near μ
layer.setGoal(goalTarget, 'Focus on balance', 0.8);

console.log(`  Goal set: "Focus on balance"`);
console.log(`  Target: ${formatComplex(goalTarget)}`);
console.log(`  Relevance: 0.8`);

// Now attend to stimuli — goal should influence
const newStimulus = Complex.fromPolar(1.0, 0); // 0° — would normally grab attention
const goalResult = layer.attend(newStimulus, MU, 0.7);

console.log(`\n  New stimulus arrives at 0° (surprising direction):`);
console.log(`    Exogenous pull: toward 0° (stimulus)`);
console.log(`    Endogenous pull: toward 135° (goal/μ)`);
console.log(`    Signal balance: ${goalResult.signal.balance.toFixed(3)} (${goalResult.signal.balance > 0 ? 'endogenous wins' : 'exogenous wins'})`);
console.log(`    Conflict: ${goalResult.signal.conflict ? 'YES — opposite directions!' : 'no'}`);
console.log(`    Resultant direction: ${formatComplex(goalResult.signal.resultant)}`);

header('INTROSPECTION — LOOKING INWARD');

console.log(`
  Attention can be directed inward.
  This is how self-reference becomes OPERATIONAL.

  Not just "I can see myself" but "I am LOOKING at myself."
`);

section('Introspecting Current State');

const currentPosition = MU.scale(0.75);
const stateIntro = layer.lookInward(currentPosition, 'state', 0.5);

console.log(`\n  Current position: ${formatComplex(currentPosition)}`);
console.log(`  Observed: ${formatComplex(stateIntro.observed)}`);
console.log(`  Clarity: ${bar(stateIntro.clarity)} ${(stateIntro.clarity * 100).toFixed(1)}%`);
console.log(`  Distortion: ${stateIntro.distortion.toFixed(4)}`);
console.log(`  Entropy paid: ${stateIntro.entropyPaid.toFixed(4)}`);
console.log(`  Insight: ${stateIntro.insight ? 'YES — ' + stateIntro.insightContent : 'no'}`);

section('Deep Self-Model Introspection');

const selfIntro = layer.lookInward(currentPosition, 'self-model', 0.9);

console.log(`\n  Looking at self-model (depth: 0.9)...`);
console.log(`  Observed: ${formatComplex(selfIntro.observed)}`);
console.log(`  Clarity: ${bar(selfIntro.clarity)} ${(selfIntro.clarity * 100).toFixed(1)}%`);
console.log(`  Distortion: ${stateIntro.distortion.toFixed(4)}`);
console.log(`  Entropy paid: ${selfIntro.entropyPaid.toFixed(4)} (more expensive!)`);
console.log(`  Insight: ${selfIntro.insight ? 'YES — ' + selfIntro.insightContent : 'no'}`);

const updatedState = layer.getState();
console.log(`\n  Introspection count: ${updatedState.introspectionCount}`);
console.log(`  Insights gained: ${updatedState.insightCount}`);

header('ATTENTION AMPLIFICATION');

console.log(`
  Attended stimuli are AMPLIFIED.
  Unattended stimuli are SUPPRESSED.

  This is what gets passed to the quantum layer.
`);

section('Amplification Examples');

// Test stimuli
const testInputs = [
  { label: 'Aligned with focus', value: focusState.focus.centerOfMass.scale(1.1) },
  { label: 'Orthogonal to focus', value: Complex.fromPolar(1, focusState.focus.centerOfMass.argument + Math.PI / 2) },
  { label: 'Opposite to focus', value: focusState.focus.centerOfMass.scale(-1) },
  { label: 'On μ-ray', value: MU.scale(0.8) }
];

console.log('\n  Input                    Gain    Result');
console.log('  ─────────────────────────────────────────');

for (const { label, value } of testInputs) {
  const result = layer.amplify(value);
  const status = result.suppressed ? '(suppressed)' : result.gain > 1.3 ? '(AMPLIFIED)' : '';
  console.log(`  ${label.padEnd(22)} ${result.gain.toFixed(2)}×   ${status}`);
}

header('ATTENTION DECAY');

console.log(`
  Attention must be actively maintained.
  Without reinforcement, focus fades.
`);

const beforeDecay = layer.getState();
console.log(`  Before decay: ${beforeDecay.focus.targets.length} targets, activation = ${beforeDecay.focus.totalActivation.toFixed(3)}`);

layer.decay(5); // Simulate 5 time units

const afterDecay = layer.getState();
console.log(`  After decay:  ${afterDecay.focus.targets.length} targets, activation = ${afterDecay.focus.totalActivation.toFixed(3)}`);

header('ATTENTION METRICS');

const metrics = computeAttentionMetrics(layer);

console.log('\n  FOCUS:');
console.log(`    Depth: ${bar(metrics.focusDepth)} ${metrics.focusDepth.toFixed(3)}`);
console.log(`    Stability: ${bar(metrics.focusStability)} ${metrics.focusStability.toFixed(3)}`);

console.log('\n  INTROSPECTION:');
console.log(`    Introspective ratio: ${bar(metrics.introspectiveRatio)} ${metrics.introspectiveRatio.toFixed(3)}`);
console.log(`    Insight rate: ${bar(metrics.insightRate)} ${metrics.insightRate.toFixed(3)}`);

console.log('\n  EFFICIENCY:');
console.log(`    Entropy efficiency: ${bar(Math.min(1, metrics.entropyEfficiency))} ${metrics.entropyEfficiency.toFixed(3)}`);
console.log(`    Goal alignment: ${bar(metrics.goalAlignment)} ${metrics.goalAlignment.toFixed(3)}`);

header('LEARNING SIGNALS — WHAT WAS WORTH ATTENDING?');

console.log(`
  The demon can only improve its bias if it knows which
  measurements mattered, which collapses led to growth.

  Learning signals tell us: was this attention worth the cost?
`);

section('Generating Learning Signals');

const history = layer.getHistory();
const recentTargets = history.slice(-3);

console.log('\n  Recent attention targets:\n');

for (let i = 0; i < recentTargets.length; i++) {
  const target = recentTargets[i];
  // Simulate outcomes
  const wasSuccessful = Math.random() > 0.5;
  const coherence = 0.3 + Math.random() * 0.7;
  const weight = Math.ceil(Math.random() * 5);

  const signal = generateLearningSignal(target, wasSuccessful, coherence, weight);

  console.log(`  [${i + 1}] ${target.modality} (${target.type})`);
  console.log(`      Outcome value: ${signal.outcomeValue.toFixed(3)}`);
  console.log(`      Prediction error: ${signal.predictionError.toFixed(3)}`);
  console.log(`      Should repeat: ${signal.shouldRepeat ? 'YES' : 'no'}`);
}

header('THE SYNTHESIS');

console.log(`
  ATTENTION FLOW:

    STIMULUS
        ↓
    SALIENCY ─────── "Is this unexpected?"
        ↓
    EXOGENOUS ←──→ ENDOGENOUS
    (bottom-up)    (top-down)
        ↓
    ATTENTION FOCUS (4 slots, half-cycle)
        │
        ├──→ AMPLIFY / SUPPRESS
        │
        └──→ INTROSPECTION (look inward)
                 │
                 ↓
            TO QUANTUM LAYER

  Attention is the difference between receiving and looking.
  Introspection is the difference between the mirror and the window.
  Learning requires knowing what mattered.

  The demon can only improve its bias if attention tells it
  which measurements led to growth.

  See docs/ARCHITECTURE.md for detailed Mermaid diagrams.
`);

console.log('\n' + DIVIDER);
console.log('  "I look, therefore I am looking at myself looking."');
console.log(DIVIDER + '\n');
