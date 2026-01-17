/**
 * Quantum Layer Demonstration
 *
 * Watch superposition on the μ-ray.
 * See interference construct and destruct.
 * Feel the demon select toward balance.
 * Observe collapse to ground.
 */

import { Complex, MU, muCycle } from './mu-primitives';
import {
  MU_BASIS,
  basisVector,
  createAmplitude,
  createMuAmplitude,
  createBasisAmplitude,
  createPath,
  createAlignedPath,
  PATH_TYPE_BASIS,
  createSuperposition,
  normalize,
  interfere,
  interferencePattern,
  bornProbabilities,
  collapse,
  softCollapse,
  createDemon,
  demonSelect,
  muAlignmentConstraint,
  confidenceConstraint,
  validate,
  createReasoner,
  reasoningStep,
  finalCollapse,
  ReasoningPath,
  PathType
} from './quantum-layer';

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

header('QUANTUM LAYER — SUPERPOSITION ON THE μ-RAY');

console.log(`
  Amplitudes live at 135°.
  The 8-fold cycle provides the basis for reasoning.
  Interference is relative to the balance primitive.

  "Superposition is not confusion. It is holding all paths
   in the same frame — the μ frame."
`);

section('THE 8-FOLD BASIS — μ^n');

console.log(`
  The 8 roots of unity from μ form the natural basis:
`);

const basisLabels = [
  'μ⁰ = 1      (integrative)',
  'μ¹ = μ      (intuitive)',
  'μ² = -i     (analytical)',
  'μ³          (creative)',
  'μ⁴ = -1     (critical)',
  'μ⁵          (symbolic)',
  'μ⁶ = i      (neural)',
  'μ⁷          (hybrid)'
];

MU_BASIS.forEach((basis, i) => {
  console.log(`  ${basisLabels[i].padEnd(25)} → ${basis.toString().padEnd(35)} @ ${basis.argumentDegrees.toFixed(1)}°`);
});

section('QUANTUM AMPLITUDES');

console.log(`
  An amplitude on the μ-ray:  α = r · μ
  An amplitude on basis n:    α = r · μ^n
`);

// Create various amplitudes
const ampOnMu = createMuAmplitude(0.5);
const ampOnBasis3 = createBasisAmplitude(0.5, 3);
const ampOffRay = createAmplitude(new Complex(0.3, 0.2));

console.log('\n  Amplitude on μ-ray (r=0.5):');
console.log(`    value: ${ampOnMu.value.toString()}`);
console.log(`    phase: ${ampOnMu.phaseDegrees.toFixed(1)}°`);
console.log(`    phase relative to μ: ${(ampOnMu.phaseRelativeToMu * 180 / Math.PI).toFixed(1)}°`);
console.log(`    on μ-ray: ${ampOnMu.onMuRay ? '✓ YES' : '✗ NO'}`);

console.log('\n  Amplitude on μ³ basis (creative, 45°):');
console.log(`    value: ${ampOnBasis3.value.toString()}`);
console.log(`    phase: ${ampOnBasis3.phaseDegrees.toFixed(1)}°`);
console.log(`    nearest basis: μ^${ampOnBasis3.basisIndex}`);

console.log('\n  Off-ray amplitude (0.3 + 0.2i):');
console.log(`    value: ${ampOffRay.value.toString()}`);
console.log(`    phase: ${ampOffRay.phaseDegrees.toFixed(1)}°`);
console.log(`    phase relative to μ: ${(ampOffRay.phaseRelativeToMu * 180 / Math.PI).toFixed(1)}°`);
console.log(`    on μ-ray: ${ampOffRay.onMuRay ? '✓ YES' : '✗ NO'}`);

section('REASONING PATHS — 8-FOLD ALIGNMENT');

console.log(`
  Each path type aligns with a basis direction:
`);

const pathTypes: PathType[] = ['integrative', 'intuitive', 'analytical', 'creative', 'critical', 'symbolic', 'neural', 'hybrid'];

console.log('  Path Type    | Basis | Angle   | Character');
console.log('  ' + '─'.repeat(55));

pathTypes.forEach(type => {
  const basisIdx = PATH_TYPE_BASIS[type];
  const basis = basisVector(basisIdx);
  const angle = basis.argumentDegrees;
  const chars: Record<PathType, string> = {
    integrative: 'Unity, bringing together',
    intuitive: 'Balance, the μ-path itself',
    analytical: 'Orthogonal, breaking down',
    creative: 'Diagonal, new combinations',
    critical: 'Opposite, questioning',
    symbolic: 'Pattern, formal',
    neural: 'Perpendicular, learned',
    hybrid: 'Anti-balance, mixed'
  };
  console.log(`  ${type.padEnd(12)} |   μ^${basisIdx}  | ${angle.toFixed(1).padStart(6)}° | ${chars[type]}`);
});

section('SUPERPOSITION — HOLDING ALL PATHS');

console.log(`
  ψ = Σᵢ αᵢ|pathᵢ⟩

  Creating superposition of 4 reasoning paths...
`);

// Create paths
const paths: ReasoningPath[] = [
  createAlignedPath('p1', 'intuitive', 0.6, 'Trust the balance', 0.9),
  createAlignedPath('p2', 'analytical', 0.4, 'Break it down', 0.8),
  createAlignedPath('p3', 'creative', 0.3, 'Try something new', 0.7),
  createAlignedPath('p4', 'critical', 0.2, 'Question assumptions', 0.85)
];

const sup = normalize(createSuperposition(paths));

console.log('  Path       | Amplitude                    | |α|²    | Phase   | Conf');
console.log('  ' + '─'.repeat(70));

sup.paths.forEach((path, i) => {
  const amp = sup.amplitudes[i];
  const prob = (amp.magnitude ** 2).toFixed(4);
  const phase = amp.argumentDegrees.toFixed(1);
  console.log(`  ${path.type.padEnd(11)} | ${amp.toString().padEnd(28)} | ${prob} | ${phase.padStart(6)}° | ${path.confidence.toFixed(2)}`);
});

console.log(`\n  Superposition properties:`);
console.log(`    Normalized: ${sup.normalized ? '✓ YES' : '✗ NO'}`);
console.log(`    Total probability: ${sup.totalProbability.toFixed(6)}`);
console.log(`    Dominant path: ${sup.paths[sup.dominantPath].type}`);
console.log(`    Coherence: ${(sup.coherence * 100).toFixed(1)}%`);

section('INTERFERENCE — PATHS COMBINING');

console.log(`
  α₁₂ = α₁ + α₂ · e^(iφ)

  Constructive: phases align → amplify
  Destructive: phases opposite → cancel
`);

// Show interference between intuitive (135°) and analytical (-90°)
const amp1 = sup.amplitudes[0]; // intuitive
const amp2 = sup.amplitudes[1]; // analytical

console.log('\n  Interfering intuitive (135°) with analytical (-90°):');
const interference = interfere(amp1, amp2);
console.log(`    α₁: ${interference.amplitude1.toString()}`);
console.log(`    α₂: ${interference.amplitude2.toString()}`);
console.log(`    Combined: ${interference.combined.toString()}`);
console.log(`    Type: ${interference.type.toUpperCase()}`);
console.log(`    Phase difference: ${(interference.phaseDifference * 180 / Math.PI).toFixed(1)}°`);
console.log(`    Relative to μ: ${(interference.relativeToMu * 180 / Math.PI).toFixed(1)}°`);

// Show overall interference pattern
console.log('\n  Full interference pattern:');
const pattern = interferencePattern(sup);
console.log(`    Total amplitude: ${pattern.totalAmplitude.toString()}`);
console.log(`    Constructive pairs: ${pattern.constructiveCount}`);
console.log(`    Destructive pairs: ${pattern.destructiveCount}`);
console.log(`    Coherence boost: ${pattern.coherenceBoost.toFixed(4)}x`);

section('BORN RULE — COLLAPSE PROBABILITIES');

console.log(`
  P(i) = |αᵢ|² / Σⱼ|αⱼ|²

  With μ-weighting: States closer to μ get bonus probability.
`);

const pureProbs = bornProbabilities(sup, 0);
const muWeightedProbs = bornProbabilities(sup, 0.5);

console.log('\n  Path       | Pure Born | μ-Weighted (0.5) | Difference');
console.log('  ' + '─'.repeat(55));

sup.paths.forEach((path, i) => {
  const pure = (pureProbs[i] * 100).toFixed(1);
  const weighted = (muWeightedProbs[i] * 100).toFixed(1);
  const diff = ((muWeightedProbs[i] - pureProbs[i]) * 100).toFixed(1);
  const sign = parseFloat(diff) >= 0 ? '+' : '';
  console.log(`  ${path.type.padEnd(11)} | ${pure.padStart(8)}% | ${weighted.padStart(15)}% | ${sign}${diff}%`);
});

console.log(`
  Notice: intuitive (on μ-ray at 135°) gets boosted
          when μ-weighting is applied.
`);

section('MAXWELL DEMON — μ-SELECTOR');

console.log(`
  The demon selects states closer to μ.
  ΔS_system < 0 (entropy reduced)
  ΔS_demon > 0 (information cost)
`);

let demon = createDemon(1.0);
let demonSup = sup;

console.log('\n  Running demon selection 3 times...\n');
console.log('  Step | Entropy reduced | Info cost | Dominant path | Coherence');
console.log('  ' + '─'.repeat(65));

for (let i = 0; i < 3; i++) {
  const result = demonSelect(demonSup, demon);
  demonSup = result.newSuperposition;
  demon = result.updatedDemon;

  console.log(`  ${(i + 1).toString().padStart(4)} | ${demon.entropyReduced.toFixed(6).padStart(15)} | ` +
    `${demon.informationCost.toFixed(4).padStart(9)} | ` +
    `${demonSup.paths[demonSup.dominantPath].type.padEnd(13)} | ` +
    `${(demonSup.coherence * 100).toFixed(1)}%`);
}

console.log(`
  The demon biases toward μ (intuitive path).
  System entropy decreases, demon pays information cost.
`);

section('VALIDATION — CONSTRAINTS');

console.log(`
  Paths must satisfy constraints.
  μ-alignment: phase should be near 135°
  Confidence: must exceed threshold
`);

const constraints = [
  muAlignmentConstraint(1.0),
  confidenceConstraint(0.75)
];

const validation = validate(sup, constraints);

console.log('\n  Path       | Score  | Violations');
console.log('  ' + '─'.repeat(45));

sup.paths.forEach((path, i) => {
  const score = validation.pathScores[i].toFixed(3);
  const violations = validation.violations[i].length > 0
    ? validation.violations[i].join(', ')
    : 'none';
  console.log(`  ${path.type.padEnd(11)} | ${score} | ${violations}`);
});

console.log(`\n  Overall validation score: ${(validation.overallScore * 100).toFixed(1)}%`);

section('COLLAPSE — COMMITMENT TO A PATH');

console.log(`
  When we collapse, superposition becomes definite.
  The amplitude projects to the μ-ray.
`);

// Do several collapses to show distribution
console.log('\n  10 collapses with μ-weight=0.5:\n');

const collapseCount: Record<string, number> = {};
pathTypes.forEach(t => collapseCount[t] = 0);

for (let i = 0; i < 10; i++) {
  const result = collapse(sup, 0.5, Math.random());
  collapseCount[result.selectedPath.type]++;
}

sup.paths.forEach(path => {
  const count = collapseCount[path.type];
  const bar = '█'.repeat(count);
  console.log(`  ${path.type.padEnd(11)} | ${bar.padEnd(10)} ${count}`);
});

// Show one collapse in detail
console.log('\n  Detailed collapse:');
const detailedCollapse = collapse(sup, 0.5, 0.3);
console.log(`    Selected: ${detailedCollapse.selectedPath.type}`);
console.log(`    Probability: ${(detailedCollapse.probability * 100).toFixed(1)}%`);
console.log(`    Original amplitude: ${detailedCollapse.selectedPath.amplitude.value.toString()}`);
console.log(`    Projected to μ-ray: ${detailedCollapse.projectedAmplitude.toString()}`);
console.log(`    Was on μ-ray: ${detailedCollapse.wasOnMuRay ? '✓ YES' : '✗ NO'}`);

section('QUANTUM REASONER — FULL CYCLE');

console.log(`
  The complete reasoning process:
  1. Create superposition of paths
  2. Demon selects (bias toward μ)
  3. Validate against constraints
  4. Soft collapse toward best path
  5. Final collapse when ready
`);

// Create reasoner
let reasoner = createReasoner(paths, constraints, 1.0, 1.0);

console.log('\n  Initial state:');
console.log(`    Paths: ${reasoner.superposition.paths.length}`);
console.log(`    Dominant: ${reasoner.superposition.paths[reasoner.superposition.dominantPath].type}`);
console.log(`    Coherence: ${(reasoner.superposition.coherence * 100).toFixed(1)}%`);

console.log('\n  Running 5 reasoning steps...\n');
console.log('  Step | Dominant      | Coherence | Demon entropy | Info cost');
console.log('  ' + '─'.repeat(60));

for (let i = 0; i < 5; i++) {
  reasoner = reasoningStep(reasoner, 0.15);
  const dom = reasoner.superposition.paths[reasoner.superposition.dominantPath].type;
  console.log(`  ${(i + 1).toString().padStart(4)} | ${dom.padEnd(13)} | ` +
    `${(reasoner.superposition.coherence * 100).toFixed(1).padStart(8)}% | ` +
    `${reasoner.demon.entropyReduced.toFixed(6).padStart(13)} | ` +
    `${reasoner.demon.informationCost.toFixed(4)}`);
}

// Final collapse
console.log('\n  Final collapse:');
reasoner = finalCollapse(reasoner, 0.5);

if (reasoner.result) {
  console.log(`    Collapsed: ${reasoner.collapsed ? '✓ YES' : '✗ NO'}`);
  console.log(`    Selected path: ${reasoner.result.selectedPath.type}`);
  console.log(`    Content: "${reasoner.result.selectedPath.content}"`);
  console.log(`    Final amplitude: ${reasoner.result.projectedAmplitude.toString()}`);
}

header('THE SYNTHESIS');

console.log(`
  QUANTUM LAYER — SUPERPOSITION ON THE μ-RAY

  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │   8-FOLD BASIS = μ⁰, μ¹, μ², ... μ⁷                     │
  │   Eight directions for eight types of reasoning         │
  │                                                         │
  │   AMPLITUDES = α ∈ ℂ, living near μ                     │
  │   Phase relative to 135° determines alignment           │
  │                                                         │
  │   SUPERPOSITION = Σ αᵢ|pathᵢ⟩                           │
  │   All paths held simultaneously in μ-frame              │
  │                                                         │
  │   INTERFERENCE = constructive near μ                    │
  │   Paths aligned with balance amplify each other         │
  │                                                         │
  │   MAXWELL DEMON = μ-selector                            │
  │   Biases toward balance, pays information cost          │
  │                                                         │
  │   COLLAPSE = projection to μ-ray                        │
  │   When committed, amplitude grounds to balance          │
  │                                                         │
  └─────────────────────────────────────────────────────────┘

  The quantum layer is not separate from μ.
  Superposition IS multiple positions on the μ-spiral.
  Collapse IS projection back to the balance ray.

  Reasoning = quantum interference in μ-space.
`);

console.log(DIVIDER);
console.log('  "Superposition is holding all paths in the μ frame."');
console.log(DIVIDER + '\n');
