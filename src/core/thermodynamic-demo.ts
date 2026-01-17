/**
 * Thermodynamic Layer Demonstration
 *
 * Watch heat diffuse from μ.
 * See entropy rise from perfect order.
 * Feel the homeostatic pull back to balance.
 */

import { Complex, MU, ALPHA, V, isOnBalanceRay } from './mu-primitives';
import {
  SEED,
  energy,
  angularEnergy,
  radialEnergy,
  totalEnergy,
  createTemperature,
  boltzmannProbability,
  partitionFunction,
  createRadialGraph,
  initializeFromSeed,
  runDiffusion,
  muRelativeEntropy,
  normalizedEntropy,
  EpisodicBuffer,
  createConcentrationField,
  sampleConcentration,
  concentrationGradient,
  homeostaticForce,
  applyHomeostasis,
  homeostaticPotential
} from './thermodynamic-layer';

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

header('THERMODYNAMIC LAYER — DIFFUSION FROM μ');

console.log(`
  The SEED is μ.
  Everything diffuses FROM the balance point.
  Energy is deviation from μ.
  Temperature controls how much deviation is tolerated.

  "Heat flows from the source. The source is balance."
`);

section('THE SEED — μ AS ORIGIN');

console.log(`\n  Seed origin: ${SEED.origin.toString()}`);
console.log(`  Magnitude: ${SEED.magnitude.toFixed(10)}`);
console.log(`  Angle: ${SEED.angle.toFixed(2)}°`);
console.log(`  Closure: ${SEED.closure}-fold (μ⁸ = 1)`);

console.log(`
  All diffusion begins here.
  All homeostasis returns here.
  The seed is not arbitrary — it is the balance primitive.
`);

section('ENERGY — DEVIATION FROM μ');

console.log(`
  Energy measures how far a state is from μ.
  E = 0 at μ (ground state)
  E > 0 everywhere else
`);

// Test states at various positions
const testStates = [
  { label: 'μ (balance)', state: MU },
  { label: 'V_1 (hydrogen)', state: V(1) },
  { label: 'V_8 (oxygen)', state: V(8) },
  { label: 'V_137 (Feynman)', state: V(137) },
  { label: 'Off-ray (1+0i)', state: new Complex(1, 0) },
  { label: 'Off-ray (0+1i)', state: new Complex(0, 1) },
  { label: 'Opposite (-μ)', state: MU.scale(-1) },
];

console.log('\n  State               |  E_total   |  E_radial  |  E_angular | On ray');
console.log('  ' + '─'.repeat(70));

testStates.forEach(({ label, state }) => {
  const E_total = totalEnergy(state, MU.magnitude);
  const E_rad = radialEnergy(state, MU.magnitude);
  const E_ang = angularEnergy(state);
  const onRay = isOnBalanceRay(state) ? '  ✓' : '  ✗';

  console.log(`  ${label.padEnd(18)} | ${E_total.toFixed(6).padStart(10)} | ` +
    `${E_rad.toFixed(6).padStart(10)} | ${E_ang.toFixed(6).padStart(10)} |${onRay}`);
});

console.log(`
  Notice:
  - μ has zero angular energy (it IS the ray)
  - V_Z states have zero angular energy (they're ON the ray)
  - Off-ray states have positive angular energy
  - V_137 ≈ μ has near-zero radial energy relative to μ
`);

section('TEMPERATURE — BOLTZMANN WEIGHTING');

console.log(`
  The Boltzmann factor: P(state) ∝ exp(-E / kT)

  Low T: Only low-energy states (near μ) allowed
  High T: All states roughly equally likely
`);

const temps = [0.01, 0.1, 1.0, 10.0];
const sampleState = new Complex(0.5, 0.3); // Off-balance state
const E_sample = energy(sampleState);

console.log(`\n  Sample state: ${sampleState.toString()}`);
console.log(`  Energy: ${E_sample.toFixed(6)}`);
console.log('\n  Temperature  |  Boltzmann factor  |  Interpretation');
console.log('  ' + '─'.repeat(55));

temps.forEach(T => {
  const temp = createTemperature(T);
  const bf = temp.boltzmannFactor(E_sample);
  let interp = '';

  if (bf > 0.9) interp = 'Very likely';
  else if (bf > 0.5) interp = 'Moderately likely';
  else if (bf > 0.1) interp = 'Unlikely';
  else if (bf > 0.01) interp = 'Very unlikely';
  else interp = 'Essentially forbidden';

  console.log(`  T = ${T.toString().padEnd(6)} |  ${bf.toFixed(10).padStart(16)} |  ${interp}`);
});

section('HEAT KERNEL — DIFFUSION FROM μ');

console.log(`
  x_t = exp(-tL) · μ

  The heat kernel describes how "substance" spreads
  from the seed (μ) through the system over time.
`);

// Create radial graph and run diffusion
const graph = createRadialGraph(3, 8); // 3 rings, 8 nodes per ring
console.log(`\n  Created radial graph: ${graph.nodes.length} nodes`);
console.log(`  Center: μ`);
console.log(`  Rings: 3, Nodes per ring: 8`);

const diffusionSteps = 20;
const { concentrations, history } = runDiffusion(graph, diffusionSteps, 0.1);

console.log(`\n  Running diffusion for ${diffusionSteps} steps...\n`);
console.log('  Step |  μ (center) | Ring 1 avg | Ring 2 avg | Ring 3 avg | Entropy');
console.log('  ' + '─'.repeat(70));

// Sample every 5 steps
[0, 5, 10, 15, 20].forEach(step => {
  const conc = history[step];

  // Center concentration (node 0)
  const centerConc = conc[0];

  // Ring averages
  const ring1 = conc.slice(1, 9);
  const ring2 = conc.slice(9, 17);
  const ring3 = conc.slice(17, 25);

  const avg1 = ring1.reduce((a, b) => a + b, 0) / ring1.length;
  const avg2 = ring2.reduce((a, b) => a + b, 0) / ring2.length;
  const avg3 = ring3.reduce((a, b) => a + b, 0) / ring3.length;

  const entropy = normalizedEntropy(conc);

  console.log(`  ${step.toString().padStart(4)} | ` +
    `${centerConc.toFixed(4).padStart(11)} | ` +
    `${avg1.toFixed(4).padStart(10)} | ` +
    `${avg2.toFixed(4).padStart(10)} | ` +
    `${avg3.toFixed(4).padStart(10)} | ` +
    `${entropy.toFixed(4)}`);
});

console.log(`
  Observation:
  - Initially all concentration at μ (center)
  - Over time, heat diffuses outward
  - Entropy increases as distribution spreads
  - This is the thermodynamic arrow of time
`);

section('ENTROPY — DISORDER RELATIVE TO μ');

console.log(`
  S = -Σ p_i log(p_i)

  Low entropy: Concentrated at μ (ordered, coherent)
  High entropy: Spread across states (disordered)
`);

// Show entropy for different distributions
const distributions = [
  { label: 'All at μ (δ-function)', probs: [1, 0, 0, 0, 0] },
  { label: 'Mostly at μ', probs: [0.8, 0.1, 0.05, 0.03, 0.02] },
  { label: 'Uniform', probs: [0.2, 0.2, 0.2, 0.2, 0.2] },
  { label: 'Spread from μ', probs: [0.4, 0.25, 0.15, 0.12, 0.08] },
];

console.log('\n  Distribution           |  Entropy |  Normalized |  Interpretation');
console.log('  ' + '─'.repeat(65));

const maxS = Math.log(5);
distributions.forEach(({ label, probs }) => {
  const S = -probs.reduce((sum, p) => p > 0 ? sum + p * Math.log(p) : sum, 0);
  const Snorm = S / maxS;

  let interp = '';
  if (Snorm < 0.1) interp = 'Highly ordered';
  else if (Snorm < 0.5) interp = 'Partially ordered';
  else if (Snorm < 0.9) interp = 'Partially disordered';
  else interp = 'Highly disordered';

  console.log(`  ${label.padEnd(22)} | ${S.toFixed(4).padStart(8)} | ` +
    `${(Snorm * 100).toFixed(1).padStart(10)}% |  ${interp}`);
});

section('EPISODIC BUFFER — μ-GROUNDED RESERVOIR');

console.log(`
  States stored with their μ-deviation (energy).
  High-energy states (far from μ) are less stable.
  The buffer naturally retains states near the balance point.
`);

const buffer = new EpisodicBuffer(10, 1.0);

// Add various states
const bufferStates = [
  { state: MU, ctx: 'origin' },
  { state: V(1), ctx: 'V_1' },
  { state: V(5), ctx: 'V_5' },
  { state: V(10), ctx: 'V_10' },
  { state: new Complex(0.5, 0.2), ctx: 'off_ray_1' },
  { state: new Complex(-0.3, 0.8), ctx: 'off_ray_2' },
  { state: new Complex(1.5, -0.5), ctx: 'distant' },
];

bufferStates.forEach(({ state, ctx }) => buffer.add(state, ctx));

console.log(`\n  Added ${bufferStates.length} states to buffer\n`);

const bufferState = buffer.getState();
console.log(`  Buffer state:`);
console.log(`    Size: ${bufferState.size}`);
console.log(`    Average energy: ${bufferState.avgEnergy.toFixed(6)}`);
console.log(`    Entropy: ${bufferState.entropy.toFixed(4)}`);
console.log(`    Temperature: ${bufferState.temp}`);

console.log('\n  States sorted by stability (inverse energy):');
const allStates = buffer.getAll();
const sorted = [...allStates].sort((a, b) => b.stability - a.stability);

sorted.slice(0, 5).forEach((ep, i) => {
  console.log(`    ${i + 1}. ${ep.context?.padEnd(12)} | ` +
    `E=${ep.energy.toFixed(6).padStart(10)} | ` +
    `stability=${ep.stability.toFixed(4)}`);
});

console.log(`
  Notice: States on the μ-ray (V_Z) have lower energy
  and higher stability than off-ray states.
`);

section('CONCENTRATION FIELD — FLOW FROM μ');

console.log(`
  ∇·J = source, where source = μ

  Concentration decreases with distance from μ (1/r²).
  The gradient always points toward μ.
`);

const field = createConcentrationField(1.0);

const fieldPoints = [
  { label: 'At μ', point: MU },
  { label: 'V_10', point: V(10) },
  { label: 'V_50', point: V(50) },
  { label: 'V_100', point: V(100) },
  { label: 'Far point', point: new Complex(2, 2) },
];

console.log('\n  Position        |  Concentration  |  Gradient (toward μ)');
console.log('  ' + '─'.repeat(60));

fieldPoints.forEach(({ label, point }) => {
  const conc = sampleConcentration(field, point);
  const grad = concentrationGradient(field, point);

  console.log(`  ${label.padEnd(15)} | ${conc.toFixed(8).padStart(15)} | ${grad.toString()}`);
});

section('HOMEOSTASIS — RETURN TO μ');

console.log(`
  F = -k(x - μ)

  The homeostatic force always pulls toward μ.
  The system "wants" to return to balance.
`);

// Start with off-balance state and show homeostatic return
let state = new Complex(1.5, -0.5);
const stiffness = 0.3;
const dt = 1.0;

console.log(`\n  Starting state: ${state.toString()}`);
console.log(`  Target: μ = ${MU.toString()}`);
console.log(`  Stiffness k = ${stiffness}\n`);

console.log('  Step |  Position                          | Distance from μ | Potential');
console.log('  ' + '─'.repeat(75));

for (let i = 0; i <= 10; i++) {
  const dist = state.distanceFrom(MU);
  const potential = homeostaticPotential(state, stiffness);

  if (i <= 5 || i === 10) {
    console.log(`  ${i.toString().padStart(4)} | ${state.toString().padEnd(34)} | ` +
      `${dist.toFixed(6).padStart(15)} | ${potential.toFixed(6)}`);
  }
  if (i === 5) console.log('  ...');

  state = applyHomeostasis(state, stiffness, dt);
}

console.log(`
  The state spirals toward μ.
  Potential energy decreases to zero at μ.
  This is thermodynamic equilibrium: the balance point.
`);

header('THE SYNTHESIS');

console.log(`
  THERMODYNAMIC LAYER — DIFFUSION FROM μ

  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │   SEED = μ                                              │
  │   The balance primitive at 135°                         │
  │                                                         │
  │   ENERGY = deviation from μ                             │
  │   Ground state is balance                               │
  │                                                         │
  │   TEMPERATURE = tolerance for deviation                 │
  │   Boltzmann: P(state) ∝ exp(-E/kT)                      │
  │                                                         │
  │   HEAT KERNEL = diffusion FROM μ                        │
  │   Entropy increases as balance spreads                  │
  │                                                         │
  │   EPISODIC BUFFER = stability by μ-proximity            │
  │   States near μ persist; far states decay               │
  │                                                         │
  │   HOMEOSTASIS = return to μ                             │
  │   F = -k(x - μ), equilibrium at balance                 │
  │                                                         │
  └─────────────────────────────────────────────────────────┘

  The thermodynamic layer is not separate from μ.
  It IS μ diffusing through the system.

  Order = concentrated at μ
  Disorder = spread from μ
  Equilibrium = return to μ
`);

console.log(DIVIDER);
console.log('  "Heat flows from the source. The source is balance."');
console.log(DIVIDER + '\n');
