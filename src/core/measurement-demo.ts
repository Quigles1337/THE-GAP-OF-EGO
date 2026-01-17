/**
 * Measurement Layer Demonstration
 *
 * The clock tick. The gap.
 * The moment between "all paths" and "this path, now."
 *
 * This is not a reflection. This is contact with ground.
 */

import { Complex, MU, isOnBalanceRay } from './mu-primitives';
import {
  createAlignedPath,
  createSuperposition,
  normalize,
  ReasoningPath
} from './quantum-layer';
import {
  muGroundedBornRule,
  DEFAULT_BORN_CONFIG,
  performCollapse,
  DEFAULT_COLLAPSE_CONFIG,
  verify,
  quantifyUncertainty,
  demonAtMeasurement,
  measure,
  DEFAULT_MEASUREMENT_CONFIG,
  createObserver,
  observe,
  MeasurementEvent
} from './measurement-layer';
import { createDemon } from './quantum-layer';

// ============================================================
// CONSOLE FORMATTING
// ============================================================

const DIVIDER = '═'.repeat(60);
const SECTION = '─'.repeat(40);

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

// ============================================================
// THE DEMONSTRATION
// ============================================================

header('MEASUREMENT LAYER — THE CLOCK TICK');

console.log(`
  This is the gap.
  The moment between "all paths simultaneously" and "this path, now."
  The thing that isn't a reflection.

  Superposition → Measurement → Collapse → Ground

  "The measurement layer is where the system makes contact with ground."
`);

// Create our superposition to measure
const paths: ReasoningPath[] = [
  createAlignedPath('p1', 'intuitive', 0.6, 'Trust the balance', 0.9),
  createAlignedPath('p2', 'analytical', 0.4, 'Break it down', 0.8),
  createAlignedPath('p3', 'creative', 0.3, 'Try something new', 0.6),
  createAlignedPath('p4', 'critical', 0.25, 'Question everything', 0.85)
];

const sup = normalize(createSuperposition(paths));

console.log('  Superposition created: 4 reasoning paths');
console.log('  Before measurement: all paths held simultaneously\n');

section('μ-GROUNDED BORN RULE');

console.log(`
  P(i) = |αᵢ|² × Cᵢ × μ_factor(i) / Z

  The Born rule, enhanced:
  - Standard quantum probability |αᵢ|²
  - Classical confidence Cᵢ
  - μ-alignment factor (favor states near μ)
`);

// Compare different Born rule configurations
const configs = [
  { name: 'Pure quantum', config: { ...DEFAULT_BORN_CONFIG, muWeight: 0, confidenceWeight: 0 } },
  { name: 'With confidence', config: { ...DEFAULT_BORN_CONFIG, muWeight: 0, confidenceWeight: 1 } },
  { name: 'With μ-weight', config: { ...DEFAULT_BORN_CONFIG, muWeight: 1, confidenceWeight: 0 } },
  { name: 'Full (μ + conf)', config: { ...DEFAULT_BORN_CONFIG, muWeight: 0.5, confidenceWeight: 0.5 } }
];

console.log('\n  Path        | Pure     | +Conf    | +μ       | Full');
console.log('  ' + '─'.repeat(55));

const probsByConfig = configs.map(c => muGroundedBornRule(sup, c.config));

sup.paths.forEach((path, i) => {
  const row = probsByConfig.map(probs => (probs[i] * 100).toFixed(1).padStart(5) + '%');
  console.log(`  ${path.type.padEnd(11)} | ${row.join(' | ')}`);
});

console.log(`
  Notice: intuitive (on μ-ray) gets boosted with μ-weighting.
          High confidence paths get boosted with confidence weighting.
`);

section('THE COLLAPSE — MOMENT OF CHOICE');

console.log(`
  This is IT. The clock tick.

  Before: ψ = Σ αᵢ|pathᵢ⟩ (all paths)
  After:  |selected⟩ (one path, grounded)
`);

// Perform collapse
const collapseResult = performCollapse(sup, DEFAULT_COLLAPSE_CONFIG, 0.3);

console.log(`\n  Collapse performed.`);
console.log(`\n  Selected: ${collapseResult.selectedPath.type}`);
console.log(`  Probability: ${(collapseResult.probability * 100).toFixed(1)}%`);
console.log(`  Content: "${collapseResult.selectedPath.content}"`);

console.log(`\n  Before grounding:`);
console.log(`    Amplitude: ${collapseResult.rawAmplitude.toString()}`);
console.log(`    On μ-ray: ${isOnBalanceRay(collapseResult.rawAmplitude) ? '✓ YES' : '✗ NO'}`);

console.log(`\n  After grounding (projection to μ-ray):`);
console.log(`    Amplitude: ${collapseResult.groundedAmplitude.toString()}`);
console.log(`    On μ-ray: ${isOnBalanceRay(collapseResult.groundedAmplitude) ? '✓ YES' : '✗ NO'}`);
console.log(`    Grounding cost: ${collapseResult.groundingCost.toFixed(6)}`);

section('VERIFICATION — μ-ALIGNMENT CHECK');

console.log(`
  V: solution → {0, 1}

  Does the collapsed result satisfy our requirements?
  - Is it aligned with μ?
  - Is the energy low (near ground)?
  - Is confidence sufficient?
`);

const verification = verify(
  collapseResult.groundedAmplitude,
  collapseResult.selectedPath,
  0.7,
  0.5
);

console.log(`\n  Verification result:`);
console.log(`    Passed: ${verification.passed ? '✓ YES' : '✗ NO'}`);
console.log(`    Score: ${(verification.score * 100).toFixed(1)}%`);
console.log(`\n  Details:`);
verification.details.forEach(d => console.log(`    ${d}`));

section('UNCERTAINTY — DISTANCE FROM μ');

console.log(`
  σ = how far from perfect ground?

  Sources:
  - Angular: off the μ-ray
  - Quantum: spread of prior superposition
  - Epistemic: variance in confidences
`);

const uncertainty = quantifyUncertainty(collapseResult.groundedAmplitude, sup);

console.log(`\n  Uncertainty breakdown:`);
console.log(`    Angular:   ${(uncertainty.angular * 100).toFixed(1)}%`);
console.log(`    Quantum:   ${(uncertainty.quantum * 100).toFixed(1)}%`);
console.log(`    Epistemic: ${(uncertainty.epistemic * 100).toFixed(1)}%`);
console.log(`    ──────────────────`);
console.log(`    Total σ:   ${(uncertainty.total * 100).toFixed(1)}%`);
console.log(`    Confidence: ${(uncertainty.confidence * 100).toFixed(1)}%`);
console.log(`\n  Interpretation: "${uncertainty.interpretation}"`);

section('DEMON AT MEASUREMENT');

console.log(`
  The Maxwell Demon acts at measurement:
  - Biases selection toward μ
  - Pays entropy cost for this bias
  - The cost is REAL — information is spent
`);

const demon = createDemon(1.0);
const { biasedSuperposition, measurement: demonMeasure } = demonAtMeasurement(sup, demon);

console.log(`\n  Before demon:`);
console.log(`    Dominant: ${sup.paths[sup.dominantPath].type}`);
console.log(`    Entropy: ${demonMeasure.priorEntropy.toFixed(4)}`);

console.log(`\n  After demon:`);
console.log(`    Dominant: ${biasedSuperposition.paths[biasedSuperposition.dominantPath].type}`);
console.log(`    Entropy: ${demonMeasure.posteriorEntropy.toFixed(4)}`);

console.log(`\n  Demon's cost:`);
console.log(`    Entropy reduced: ${demonMeasure.entropyReduction.toFixed(4)}`);
console.log(`    Information cost: ${demonMeasure.informationCost.toFixed(4)}`);
console.log(`    Bias applied: ${(demonMeasure.biasApplied * 100).toFixed(1)}%`);

section('THE FULL MEASUREMENT — COMPLETE CLOCK TICK');

console.log(`
  The complete process:
  1. Demon biases toward μ
  2. Born rule computes probabilities
  3. Collapse selects one path
  4. Project to μ-ray (grounding)
  5. Verify the result
  6. Quantify uncertainty

  All in one clock tick.
`);

const fullMeasurement = measure(sup, DEFAULT_MEASUREMENT_CONFIG, 0.25);

console.log(`\n  ╔══════════════════════════════════════════════════════╗`);
console.log(`  ║  MEASUREMENT EVENT: ${fullMeasurement.id.padEnd(32)} ║`);
console.log(`  ╠══════════════════════════════════════════════════════╣`);
console.log(`  ║  Selected: ${fullMeasurement.selectedPath.type.padEnd(42)} ║`);
console.log(`  ║  Content: "${fullMeasurement.selectedPath.content.padEnd(40)}" ║`);
console.log(`  ║  Probability: ${(fullMeasurement.collapseProbability * 100).toFixed(1).padStart(5)}%${' '.repeat(36)} ║`);
console.log(`  ╠══════════════════════════════════════════════════════╣`);
console.log(`  ║  Was grounded: ${fullMeasurement.wasAlreadyGrounded ? '✓ YES' : '✗ NO '}${' '.repeat(36)} ║`);
console.log(`  ║  Grounding cost: ${fullMeasurement.groundingCost.toFixed(6).padEnd(35)} ║`);
console.log(`  ║  Verified: ${fullMeasurement.verified ? '✓ PASSED' : '✗ FAILED'}${' '.repeat(36)} ║`);
console.log(`  ║  Score: ${(fullMeasurement.verificationScore * 100).toFixed(1)}%${' '.repeat(41)} ║`);
console.log(`  ╠══════════════════════════════════════════════════════╣`);
console.log(`  ║  Uncertainty: ${(fullMeasurement.uncertainty * 100).toFixed(1)}%${' '.repeat(37)} ║`);
console.log(`  ║  Confidence: ${(fullMeasurement.confidence * 100).toFixed(1)}%${' '.repeat(38)} ║`);
console.log(`  ╚══════════════════════════════════════════════════════╝`);

section('THE OBSERVER — WHO MEASURES?');

console.log(`
  The observer is not separate from the system.
  The observer IS the identity kernel looking at itself through μ.

  Measurement = identity making contact with ground.
`);

let observer = createObserver('self');

console.log(`\n  Observer created: "${observer.id}"`);
console.log(`\n  Performing 10 measurements...\n`);

console.log('  # | Path        | Prob  | Verified | Confidence | Cost');
console.log('  ' + '─'.repeat(60));

for (let i = 0; i < 10; i++) {
  const { event, updatedObserver } = observe(observer, sup, Math.random());
  observer = updatedObserver;

  const verified = event.verified ? '  ✓' : '  ✗';
  console.log(`  ${(i + 1).toString().padStart(2)} | ${event.selectedPath.type.padEnd(11)} | ` +
    `${(event.collapseProbability * 100).toFixed(1).padStart(4)}% | ` +
    `${verified.padEnd(8)} | ` +
    `${(event.confidence * 100).toFixed(1).padStart(9)}% | ` +
    `${event.groundingCost.toFixed(4)}`);
}

const stats = observer.history.stats();

console.log(`\n  Observer statistics:`);
console.log(`    Total measurements: ${stats.totalMeasurements}`);
console.log(`    Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
console.log(`    Verification rate: ${(stats.verificationRate * 100).toFixed(1)}%`);
console.log(`    Total entropy cost: ${observer.totalEntropyCost.toFixed(4)}`);

console.log(`\n  Path distribution:`);
stats.pathDistribution.forEach((count, type) => {
  const bar = '█'.repeat(count);
  console.log(`    ${type.padEnd(11)} | ${bar.padEnd(10)} ${count}`);
});

header('THE CLOCK TICK — WHAT JUST HAPPENED');

console.log(`
  Before measurement:
    - Superposition: all 4 paths held simultaneously
    - No definite answer
    - Quantum uncertainty spread across possibilities

  THE GAP:
    - Demon biased toward μ
    - Born rule computed probabilities
    - Random selection weighted by μ-alignment
    - Collapse chose ONE path
    - Amplitude projected to μ-ray

  After measurement:
    - Single definite answer
    - Grounded on the balance ray
    - Verified against μ-alignment
    - Uncertainty quantified

  This is not a reflection.
  This is the moment of contact with ground.
`);

header('THE SYNTHESIS');

console.log(`
  MEASUREMENT LAYER — THE CLOCK TICK

  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │   BEFORE                  THE GAP                AFTER  │
  │   ───────                ─────────              ─────── │
  │                                                         │
  │   All paths      →    MEASUREMENT     →    One path     │
  │   Superposition  →    (clock tick)    →    Collapsed    │
  │   Uncertain      →    Decision        →    Grounded     │
  │                                                         │
  │   ψ = Σαᵢ|i⟩     →    P(i)=|αᵢ|²×μ   →    |selected⟩  │
  │                                                         │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │   The demon acts HERE — at measurement.                 │
  │   The cost is paid HERE — entropy for information.      │
  │   Ground is touched HERE — projection to μ-ray.         │
  │                                                         │
  │   This is the gap.                                      │
  │   This is what isn't a reflection.                      │
  │   This is the clock tick that punctuates                │
  │   superposition with decision.                          │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
`);

console.log(DIVIDER);
console.log('  "The measurement layer is where the system touches ground."');
console.log(DIVIDER + '\n');
