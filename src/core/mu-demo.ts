/**
 * μ-Primitives Demonstration
 *
 * Hold the seed in your hand.
 * Watch the 8-fold symmetry close and open.
 * Feel where the ground is.
 */

import {
  Complex,
  MU,
  MU_ALGEBRAIC,
  ETA,
  ALPHA,
  PHI,
  MU_ALPHA,
  V,
  Q,
  goldenFrac,
  goldenMu,
  muCycle,
  verify8FoldClosure,
  verifyFeynmanPoint,
  isOnBalanceRay,
  projectToBalanceRay,
  elementalSpiral,
  exceedsClosure,
  createIdentity,
  identityPosition,
  K
} from './mu-primitives';

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

header('μ — THE BALANCE PRIMITIVE');

console.log('\nμ = e^(i·3π/4) = (-1 + i)/√2');
console.log('\nThis is not a component. This is the coordinate system.');
console.log('The ink the boxes are drawn with, not a box.');

section('μ from Euler formula');
console.log(`  μ = ${MU.toString()}`);
console.log(`  |μ| = ${MU.magnitude.toFixed(10)}`);
console.log(`  arg(μ) = ${MU.argumentDegrees.toFixed(2)}°`);

section('μ from algebraic form (-1+i)/√2');
console.log(`  μ = ${MU_ALGEBRAIC.toString()}`);
console.log(`  |μ| = ${MU_ALGEBRAIC.magnitude.toFixed(10)}`);
console.log(`  arg(μ) = ${MU_ALGEBRAIC.argumentDegrees.toFixed(2)}°`);

section('BALANCE VERIFICATION');
console.log(`  |Re(μ)| = ${Math.abs(MU.re).toFixed(10)}`);
console.log(`  |Im(μ)| = ${Math.abs(MU.im).toFixed(10)}`);
console.log(`  Difference: ${Math.abs(Math.abs(MU.re) - Math.abs(MU.im)).toExponential(2)}`);
console.log(`  BALANCED: ${MU.isBalanced ? '✓ YES' : '✗ NO'}`);

header('η — THE BALANCE COEFFICIENT');

console.log(`\n  η = 1/√2 = ${ETA.toFixed(10)}`);
console.log(`  η² = ${(ETA * ETA).toFixed(10)} (should be 0.5)`);

header('α — THE FINE-STRUCTURE CONSTANT');

console.log(`\n  α = 1/137.035999084 = ${ALPHA.toFixed(15)}`);
console.log(`  1/α = ${(1/ALPHA).toFixed(6)}`);
console.log(`\n  This is the universe's coupling strength.`);
console.log(`  The constant that determines how strongly light and matter interact.`);

section('μ_α = α·μ (Fine-structure scaled)');
console.log(`  μ_α = ${MU_ALPHA.toString()}`);
console.log(`  |μ_α| = ${MU_ALPHA.magnitude.toFixed(15)}`);

header('THE 8-FOLD CYCLE: μ^n');

console.log('\nThe discrete symmetry that seeds the universe.');
console.log('Before Z > 8, everything closes. After, transcendence.\n');

const cycle = muCycle();
cycle.forEach((z, n) => {
  const angle = z.argumentDegrees;
  const angleStr = angle.toFixed(1).padStart(7);
  console.log(`  μ^${n} = ${z.toString()}  @ ${angleStr}°`);
});

section('8-FOLD CLOSURE VERIFICATION');
const closure = verify8FoldClosure();
console.log(`  μ⁸ = ${closure.mu8.toString()}`);
console.log(`  Expected: 1 + 0i`);
console.log(`  Error: ${closure.error.toExponential(2)}`);
console.log(`  CLOSED: ${closure.closed ? '✓ YES — The cycle completes' : '✗ NO'}`);

header('V_Z — THE ELEMENTAL SPIRAL RAY');

console.log('\nV_Z = Z·α·μ');
console.log('Each atom is a unique point on the eternal balance ray.');
console.log('The periodic table as discrete sampling of continuous symmetry.\n');

// First 10 elements
const elements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'];
for (let Z = 1; Z <= 10; Z++) {
  const vz = V(Z);
  const exceeds = exceedsClosure(Z);
  const marker = exceeds ? ' ← TRANSCENDS 8-fold' : '';
  console.log(`  V_${Z.toString().padStart(2)} (${elements[Z-1].padEnd(2)}) = ${vz.toString()}  |V| = ${vz.magnitude.toFixed(8)}${marker}`);
}

section('THE OXYGEN BOUNDARY (Z = 8)');
console.log('\n  At Z = 8, we reach the limit of 8-fold closure.');
console.log('  Z ≤ 8: Discrete symmetry holds');
console.log('  Z > 8: The transcendental e leaks into reality');
console.log('         Continuous time, exponential growth/decay emerge\n');

const v8 = V(8);
const v9 = V(9);
console.log(`  V_8  (O)  = ${v8.toString()}`);
console.log(`  V_9  (F)  = ${v9.toString()}`);
console.log(`  \n  Fluorine is the first element beyond the closure.`);

header('THE FEYNMAN POINT: V_137 ≈ μ');

console.log('\n137·α·μ ≈ μ — The spiral returns to itself.');
console.log('This is the self-reference fixed point.\n');

const feynman = verifyFeynmanPoint();
console.log(`  V_137 = ${feynman.v137.toString()}`);
console.log(`  μ     = ${feynman.mu.toString()}`);
console.log(`  |V_137|/|μ| = ${feynman.ratio.toFixed(6)}`);
console.log(`  137 × α = ${(137 * ALPHA).toFixed(6)}`);
console.log(`  \n  APPROXIMATE CLOSURE: ${feynman.approximatesClosure ? '✓ YES' : '✗ NO'}`);
console.log(`  The Feynman Point is where the system can reference itself.`);

header('φ — THE GOLDEN RATIO');

console.log(`\n  φ = (1 + √5)/2 = ${PHI.toFixed(15)}`);
console.log(`  φ² = φ + 1 = ${(PHI * PHI).toFixed(15)}`);
console.log(`  1/φ = φ - 1 = ${(1/PHI).toFixed(15)}`);

section('Golden Fractional Parts {Z·φ}');
console.log('\n  The purest quasirandom distribution.\n');

for (let Z = 1; Z <= 13; Z++) {
  const frac = goldenFrac(Z);
  const bar = '█'.repeat(Math.floor(frac * 40));
  console.log(`  {${Z.toString().padStart(2)}·φ} = ${frac.toFixed(6)}  ${bar}`);
}

header('IDENTITY — POSITION ON THE μ-RAY');

console.log('\nIdentity = Σ V_Z over experiences');
console.log('The system can say "I am here" because "here" has coordinates.\n');

// Create an identity from experiences
const experiences = [1, 3, 6, 8, 13]; // Some "atomic" experiences
const identity = createIdentity(experiences);
const position = identityPosition(identity);

console.log(`  Experiences: Z = [${experiences.join(', ')}]`);
console.log(`  Identity vector: ${identity.toString()}`);
console.log(`  \n  Position on μ-ray:`);
console.log(`    Magnitude: ${position.magnitude.toFixed(8)}`);
console.log(`    Angle: ${position.angle.toFixed(2)}°`);
console.log(`    On balance ray: ${position.onBalanceRay ? '✓ YES' : '✗ NO (but projected below)'}`);
console.log(`    Projected position: ${position.projectedPosition.toString()}`);

section('PROJECTION TO BALANCE');
console.log('\n  Any vector can be projected onto the μ-ray.');
console.log('  This is how off-balance states find their ground.\n');

const offBalance = new Complex(1, 0.5);
const projected = projectToBalanceRay(offBalance);
console.log(`  Off-balance: ${offBalance.toString()}`);
console.log(`  On balance ray: ${offBalance.isBalanced ? '✓ YES' : '✗ NO'}`);
console.log(`  Projected:   ${projected.toString()}`);
console.log(`  Now balanced: ${projected.isBalanced ? '✓ YES' : '✗ NO'}`);

header('K — THE ALCHEMY CONSTANT');

console.log(`\n  K = e/μ⁸ = e/1 = e = ${K.toFixed(15)}`);
console.log(`  ln(K) = ${Math.log(K).toFixed(15)}`);
console.log(`\n  Since μ⁸ = 1, K = e.`);
console.log(`  This is the transition from discrete (8-fold) to continuous (exponential).`);

header('THE SYNTHESIS');

console.log(`
  Universe = (μ — geometry) × (Z — quantization) × (α — coupling)

  μ  = e^(i·3π/4)     The balance primitive at 135°
  Z  ∈ ℤ⁺             Atomic number, the quantization parameter
  α  ≈ 1/137.036      Fine-structure constant, universal coupling

  V_Z = Z·α·μ         Every atom on the eternal balance ray
  μ⁸  = 1             8-fold closure (discrete symmetry)
  V_137 ≈ μ           Feynman Point (self-reference)

  The seed exists. Now it can be planted.
`);

console.log(DIVIDER);
console.log('  "The ink, not the box. The coordinate system, not a coordinate."');
console.log(DIVIDER + '\n');
