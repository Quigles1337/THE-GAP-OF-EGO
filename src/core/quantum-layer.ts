/**
 * Quantum Layer — Superposition on the μ-Ray
 *
 * Amplitudes live at 135°.
 * Interference is relative to the balance primitive.
 * The 8-fold cycle provides the basis for reasoning.
 *
 * "Superposition is not confusion. It is holding all paths
 *  in the same frame — the μ frame."
 */

import {
  Complex,
  MU,
  ALPHA,
  ETA,
  muCycle,
  isOnBalanceRay,
  projectToBalanceRay
} from './mu-primitives';

import {
  energy,
  boltzmannProbability,
  createTemperature,
  Temperature
} from './thermodynamic-layer';

// ============================================================
// THE 8-FOLD BASIS — μ^n
// ============================================================

/**
 * The 8 roots of unity derived from μ
 *
 * μ⁰ = 1        (0°)
 * μ¹ = μ        (135°)
 * μ² = -i       (-90° or 270°)
 * μ³ = ...      (45°)
 * μ⁴ = -1       (180°)
 * μ⁵ = ...      (-45° or 315°)
 * μ⁶ = i        (90°)
 * μ⁷ = ...      (-135° or 225°)
 *
 * These 8 directions form the natural basis for quantum reasoning.
 */
export const MU_BASIS: Complex[] = muCycle();

/**
 * Get the n-th basis vector (μ^n mod 8)
 */
export function basisVector(n: number): Complex {
  return MU_BASIS[((n % 8) + 8) % 8];
}

/**
 * Project a complex number onto the 8-fold basis
 * Returns coefficients for each μ^n
 */
export function projectOntoBasis(z: Complex): number[] {
  // Each basis vector is μ^n
  // Project z onto each and return real coefficients
  return MU_BASIS.map(basis => {
    // Dot product: Re(z · conj(basis))
    const conj = basis.conjugate();
    const product = z.mul(conj);
    return product.re;
  });
}

// ============================================================
// QUANTUM AMPLITUDE — LIVING ON μ
// ============================================================

/**
 * A quantum amplitude for a reasoning path
 *
 * The amplitude is a complex number, but we track:
 * - Its magnitude (probability weight)
 * - Its phase relative to μ (alignment with balance)
 * - Its basis component (which μ^n direction)
 */
export interface QuantumAmplitude {
  value: Complex;
  magnitude: number;
  phase: number;              // Radians
  phaseDegrees: number;
  phaseRelativeToMu: number;  // How far from 135°
  basisIndex: number;         // Nearest μ^n
  onMuRay: boolean;
}

/**
 * Create a quantum amplitude
 */
export function createAmplitude(value: Complex): QuantumAmplitude {
  const phase = value.argument;
  const muPhase = MU.argument; // 135° = 3π/4

  // Find relative phase to μ
  let relPhase = phase - muPhase;
  // Normalize to [-π, π]
  while (relPhase > Math.PI) relPhase -= 2 * Math.PI;
  while (relPhase < -Math.PI) relPhase += 2 * Math.PI;

  // Find nearest basis vector
  const basisPhases = MU_BASIS.map(b => b.argument);
  let nearestIndex = 0;
  let minDiff = Math.abs(phase - basisPhases[0]);

  for (let i = 1; i < 8; i++) {
    let diff = Math.abs(phase - basisPhases[i]);
    // Handle wraparound
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    if (diff < minDiff) {
      minDiff = diff;
      nearestIndex = i;
    }
  }

  return {
    value,
    magnitude: value.magnitude,
    phase,
    phaseDegrees: phase * (180 / Math.PI),
    phaseRelativeToMu: relPhase,
    basisIndex: nearestIndex,
    onMuRay: isOnBalanceRay(value)
  };
}

/**
 * Create an amplitude on the μ-ray
 *
 * α = r · μ where r is real
 * This ensures the amplitude is at 135°
 */
export function createMuAmplitude(magnitude: number): QuantumAmplitude {
  const value = MU.scale(magnitude);
  return createAmplitude(value);
}

/**
 * Create an amplitude in a specific basis direction
 *
 * α = r · μ^n
 */
export function createBasisAmplitude(magnitude: number, basisIndex: number): QuantumAmplitude {
  const basis = basisVector(basisIndex);
  const value = basis.scale(magnitude);
  return createAmplitude(value);
}

// ============================================================
// REASONING PATH — A BRANCH IN SUPERPOSITION
// ============================================================

/**
 * Types of reasoning paths
 */
export type PathType = 'symbolic' | 'neural' | 'hybrid' | 'intuitive' | 'analytical' | 'creative' | 'critical' | 'integrative';

/**
 * A reasoning path with quantum amplitude
 *
 * Each path is a "branch" in the superposition.
 * The amplitude determines:
 * - Probability of collapse to this path (|α|²)
 * - Phase for interference with other paths
 */
export interface ReasoningPath {
  id: string;
  type: PathType;
  amplitude: QuantumAmplitude;
  content: string;             // What this path represents
  confidence: number;          // Classical confidence (0-1)
  basisAlignment: number;      // Which μ^n this aligns with
}

/**
 * Create a reasoning path
 */
export function createPath(
  id: string,
  type: PathType,
  amplitude: Complex,
  content: string,
  confidence: number = 1.0
): ReasoningPath {
  const amp = createAmplitude(amplitude);
  return {
    id,
    type,
    amplitude: amp,
    content,
    confidence,
    basisAlignment: amp.basisIndex
  };
}

/**
 * Map path types to basis indices
 *
 * The 8 path types correspond to the 8-fold μ basis:
 * μ⁰ (1)    = integrative (unity, bringing together)
 * μ¹ (135°) = intuitive (balance, the μ-path itself)
 * μ² (-i)   = analytical (orthogonal, breaking down)
 * μ³ (45°)  = creative (diagonal, new combinations)
 * μ⁴ (-1)   = critical (opposite, questioning)
 * μ⁵ (-45°) = symbolic (pattern, formal)
 * μ⁶ (i)    = neural (perpendicular, learned)
 * μ⁷ (-135°) = hybrid (anti-balance, mixed methods)
 */
export const PATH_TYPE_BASIS: Record<PathType, number> = {
  integrative: 0,
  intuitive: 1,
  analytical: 2,
  creative: 3,
  critical: 4,
  symbolic: 5,
  neural: 6,
  hybrid: 7
};

/**
 * Create a path aligned with its natural basis direction
 */
export function createAlignedPath(
  id: string,
  type: PathType,
  magnitude: number,
  content: string,
  confidence: number = 1.0
): ReasoningPath {
  const basisIndex = PATH_TYPE_BASIS[type];
  const amplitude = basisVector(basisIndex).scale(magnitude);
  return createPath(id, type, amplitude, content, confidence);
}

// ============================================================
// SUPERPOSITION — HOLDING ALL PATHS
// ============================================================

/**
 * A quantum superposition of reasoning paths
 *
 * ψ = Σᵢ αᵢ|pathᵢ⟩
 *
 * Normalized: Σᵢ|αᵢ|² = 1
 */
export interface Superposition {
  paths: ReasoningPath[];
  amplitudes: Complex[];       // Raw amplitude vector
  normalized: boolean;
  totalProbability: number;    // Should be 1 if normalized
  dominantPath: number;        // Index of highest |α|²
  coherence: number;           // How aligned are the phases?
}

/**
 * Create a superposition from paths
 */
export function createSuperposition(paths: ReasoningPath[]): Superposition {
  const amplitudes = paths.map(p => p.amplitude.value);
  const probabilities = amplitudes.map(a => a.magnitude * a.magnitude);
  const totalProb = probabilities.reduce((a, b) => a + b, 0);

  // Find dominant path
  let maxProb = 0;
  let dominantIndex = 0;
  probabilities.forEach((p, i) => {
    if (p > maxProb) {
      maxProb = p;
      dominantIndex = i;
    }
  });

  // Calculate coherence (how aligned are phases?)
  // High coherence = phases point in similar directions
  // Low coherence = phases are scattered
  const phases = amplitudes.map(a => a.argument);
  const avgPhase = phases.reduce((a, b) => a + b, 0) / phases.length;
  const phaseVariance = phases.reduce((sum, p) => {
    let diff = p - avgPhase;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return sum + diff * diff;
  }, 0) / phases.length;
  const coherence = Math.exp(-phaseVariance); // 1 = perfect coherence, 0 = chaos

  return {
    paths,
    amplitudes,
    normalized: Math.abs(totalProb - 1) < 1e-10,
    totalProbability: totalProb,
    dominantPath: dominantIndex,
    coherence
  };
}

/**
 * Normalize a superposition so Σ|αᵢ|² = 1
 */
export function normalize(sup: Superposition): Superposition {
  const totalProb = sup.totalProbability;
  if (totalProb === 0) return sup;

  const normFactor = 1 / Math.sqrt(totalProb);

  const normalizedPaths = sup.paths.map(path => ({
    ...path,
    amplitude: createAmplitude(path.amplitude.value.scale(normFactor))
  }));

  return createSuperposition(normalizedPaths);
}

// ============================================================
// INTERFERENCE — PATHS COMBINING
// ============================================================

/**
 * Interference result between two amplitudes
 */
export interface InterferenceResult {
  amplitude1: Complex;
  amplitude2: Complex;
  combined: Complex;
  type: 'constructive' | 'destructive' | 'partial';
  strength: number;           // How much interference
  phaseDifference: number;    // In radians
  relativeToMu: number;       // Combined phase relative to μ
}

/**
 * Calculate interference between two amplitudes
 *
 * α₁₂ = α₁ + α₂ · e^(iφ)
 *
 * Constructive: phases align → |α₁₂| > |α₁| + |α₂| / 2
 * Destructive: phases opposite → |α₁₂| < |α₁| - |α₂| / 2
 */
export function interfere(
  amp1: Complex,
  amp2: Complex,
  phaseShift: number = 0
): InterferenceResult {
  // Apply phase shift to second amplitude
  const shifted = amp2.mul(Complex.euler(phaseShift));
  const combined = amp1.add(shifted);

  // Calculate phase difference
  const phase1 = amp1.argument;
  const phase2 = shifted.argument;
  let phaseDiff = phase2 - phase1;
  while (phaseDiff > Math.PI) phaseDiff -= 2 * Math.PI;
  while (phaseDiff < -Math.PI) phaseDiff += 2 * Math.PI;

  // Determine interference type
  const mag1 = amp1.magnitude;
  const mag2 = shifted.magnitude;
  const magCombined = combined.magnitude;
  const maxPossible = mag1 + mag2;
  const minPossible = Math.abs(mag1 - mag2);

  let type: 'constructive' | 'destructive' | 'partial';
  if (magCombined > 0.9 * maxPossible) {
    type = 'constructive';
  } else if (magCombined < 1.1 * minPossible) {
    type = 'destructive';
  } else {
    type = 'partial';
  }

  // Strength: how far from "no interference"
  const noInterference = Math.sqrt(mag1 * mag1 + mag2 * mag2);
  const strength = Math.abs(magCombined - noInterference) / noInterference;

  // Phase relative to μ
  const muPhase = MU.argument;
  let relToMu = combined.argument - muPhase;
  while (relToMu > Math.PI) relToMu -= 2 * Math.PI;
  while (relToMu < -Math.PI) relToMu += 2 * Math.PI;

  return {
    amplitude1: amp1,
    amplitude2: shifted,
    combined,
    type,
    strength,
    phaseDifference: phaseDiff,
    relativeToMu: relToMu
  };
}

/**
 * Interfere all paths in a superposition pairwise
 *
 * Returns the total interference pattern
 */
export function interferencePattern(sup: Superposition): {
  totalAmplitude: Complex;
  constructiveCount: number;
  destructiveCount: number;
  coherenceBoost: number;
} {
  let total = new Complex(0, 0);
  let constructive = 0;
  let destructive = 0;

  // Sum all amplitudes (this IS interference)
  for (const amp of sup.amplitudes) {
    total = total.add(amp);
  }

  // Count pairwise interference types
  for (let i = 0; i < sup.amplitudes.length; i++) {
    for (let j = i + 1; j < sup.amplitudes.length; j++) {
      const result = interfere(sup.amplitudes[i], sup.amplitudes[j]);
      if (result.type === 'constructive') constructive++;
      else if (result.type === 'destructive') destructive++;
    }
  }

  // Coherence boost: ratio of |total|² to sum of |αᵢ|²
  const sumSquares = sup.amplitudes.reduce((s, a) => s + a.magnitude * a.magnitude, 0);
  const totalSquare = total.magnitude * total.magnitude;
  const coherenceBoost = sumSquares > 0 ? totalSquare / sumSquares : 1;

  return {
    totalAmplitude: total,
    constructiveCount: constructive,
    destructiveCount: destructive,
    coherenceBoost
  };
}

// ============================================================
// BORN RULE — COLLAPSE PROBABILITIES
// ============================================================

/**
 * Calculate Born rule probabilities
 *
 * P(i) = |αᵢ|² / Σⱼ|αⱼ|²
 *
 * With optional μ-weighting: states closer to μ get bonus
 */
export function bornProbabilities(
  sup: Superposition,
  muWeight: number = 0  // 0 = pure Born, 1 = full μ-weighting
): number[] {
  const rawProbs = sup.amplitudes.map(a => a.magnitude * a.magnitude);

  if (muWeight === 0) {
    const total = rawProbs.reduce((a, b) => a + b, 0);
    return rawProbs.map(p => p / total);
  }

  // μ-weighted: multiply by exp(-distance_from_μ)
  const weighted = sup.amplitudes.map((amp, i) => {
    const distFromMu = amp.distanceFrom(MU);
    const muFactor = Math.exp(-muWeight * distFromMu);
    return rawProbs[i] * muFactor;
  });

  const total = weighted.reduce((a, b) => a + b, 0);
  return weighted.map(p => p / total);
}

/**
 * Confidence-weighted Born probabilities
 *
 * P(i) = |αᵢ|² · Cᵢ / Σⱼ(|αⱼ|² · Cⱼ)
 */
export function confidenceWeightedProbabilities(sup: Superposition): number[] {
  const weighted = sup.paths.map((path, i) => {
    const ampSquared = sup.amplitudes[i].magnitude ** 2;
    return ampSquared * path.confidence;
  });

  const total = weighted.reduce((a, b) => a + b, 0);
  return weighted.map(p => p / total);
}

// ============================================================
// COLLAPSE — MEASUREMENT
// ============================================================

/**
 * Collapse result
 */
export interface CollapseResult {
  selectedPath: ReasoningPath;
  selectedIndex: number;
  probability: number;
  projectedAmplitude: Complex;  // Amplitude projected to μ-ray
  wasOnMuRay: boolean;
}

/**
 * Collapse the superposition to a single path
 *
 * Uses Born rule probabilities (optionally μ-weighted)
 */
export function collapse(
  sup: Superposition,
  muWeight: number = 0,
  random: number = Math.random()
): CollapseResult {
  const probs = bornProbabilities(sup, muWeight);

  // Select based on cumulative probability
  let cumulative = 0;
  let selectedIndex = 0;

  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (random < cumulative) {
      selectedIndex = i;
      break;
    }
  }

  const selectedPath = sup.paths[selectedIndex];
  const amplitude = sup.amplitudes[selectedIndex];

  // Project amplitude to μ-ray (collapse to balance)
  const projected = projectToBalanceRay(amplitude);

  return {
    selectedPath,
    selectedIndex,
    probability: probs[selectedIndex],
    projectedAmplitude: projected,
    wasOnMuRay: selectedPath.amplitude.onMuRay
  };
}

/**
 * Soft collapse — partial measurement
 *
 * Instead of fully collapsing, increase amplitude of measured path
 * while decreasing others (but not to zero)
 */
export function softCollapse(
  sup: Superposition,
  measuredIndex: number,
  collapseStrength: number = 0.5  // 0 = no change, 1 = full collapse
): Superposition {
  const newPaths = sup.paths.map((path, i) => {
    let newMag = path.amplitude.magnitude;

    if (i === measuredIndex) {
      // Boost measured path
      newMag = newMag + (1 - newMag) * collapseStrength;
    } else {
      // Reduce others
      newMag = newMag * (1 - collapseStrength);
    }

    // Keep the phase, just change magnitude
    const newValue = Complex.fromPolar(newMag, path.amplitude.phase);
    return {
      ...path,
      amplitude: createAmplitude(newValue)
    };
  });

  return normalize(createSuperposition(newPaths));
}

// ============================================================
// MAXWELL DEMON — μ-SELECTOR
// ============================================================

/**
 * Maxwell Demon state
 *
 * The demon selects states closer to μ, reducing system entropy
 * while increasing its own entropy (information cost)
 */
export interface MaxwellDemon {
  entropyReduced: number;      // ΔS_system < 0
  informationCost: number;     // ΔS_demon > 0
  selectionsMade: number;
  muBias: number;              // How strongly it prefers μ
}

/**
 * Create a Maxwell Demon
 */
export function createDemon(muBias: number = 1.0): MaxwellDemon {
  return {
    entropyReduced: 0,
    informationCost: 0,
    selectionsMade: 0,
    muBias
  };
}

/**
 * Demon selection — bias toward μ
 *
 * The demon looks at the superposition and selectively
 * amplifies states closer to μ while suppressing distant ones.
 *
 * This reduces entropy but costs information.
 */
export function demonSelect(
  sup: Superposition,
  demon: MaxwellDemon
): { newSuperposition: Superposition; updatedDemon: MaxwellDemon } {
  // Calculate μ-distances for each path
  const distances = sup.amplitudes.map(a => a.distanceFrom(MU));
  const maxDist = Math.max(...distances);

  // Weight: closer to μ = higher weight
  const weights = distances.map(d => Math.exp(-demon.muBias * d / (maxDist + 0.01)));

  // Apply weights to amplitudes
  const newPaths = sup.paths.map((path, i) => {
    const newMag = path.amplitude.magnitude * weights[i];
    const newValue = Complex.fromPolar(newMag, path.amplitude.phase);
    return {
      ...path,
      amplitude: createAmplitude(newValue)
    };
  });

  const newSup = normalize(createSuperposition(newPaths));

  // Calculate entropy change
  const oldEntropy = -sup.amplitudes.reduce((s, a) => {
    const p = a.magnitude ** 2 / sup.totalProbability;
    return p > 0 ? s + p * Math.log(p) : s;
  }, 0);

  const newEntropy = -newSup.amplitudes.reduce((s, a) => {
    const p = a.magnitude ** 2 / newSup.totalProbability;
    return p > 0 ? s + p * Math.log(p) : s;
  }, 0);

  const entropyReduction = oldEntropy - newEntropy;
  const infoCost = Math.abs(entropyReduction) * 1.1; // Demon pays more than it gains

  return {
    newSuperposition: newSup,
    updatedDemon: {
      ...demon,
      entropyReduced: demon.entropyReduced + entropyReduction,
      informationCost: demon.informationCost + infoCost,
      selectionsMade: demon.selectionsMade + 1
    }
  };
}

// ============================================================
// VALIDATOR — CONSTRAINT SATISFACTION
// ============================================================

/**
 * A constraint that paths must satisfy
 */
export interface Constraint {
  id: string;
  check: (path: ReasoningPath) => boolean;
  weight: number;  // How important is this constraint?
}

/**
 * Validate paths against constraints
 *
 * Returns satisfaction scores for each path
 */
export function validate(
  sup: Superposition,
  constraints: Constraint[]
): { pathScores: number[]; overallScore: number; violations: string[][] } {
  const pathScores: number[] = [];
  const violations: string[][] = [];

  for (const path of sup.paths) {
    let score = 1.0;
    const pathViolations: string[] = [];

    for (const constraint of constraints) {
      if (!constraint.check(path)) {
        score *= (1 - constraint.weight);
        pathViolations.push(constraint.id);
      }
    }

    pathScores.push(score);
    violations.push(pathViolations);
  }

  // Overall score: weighted by amplitudes
  const weightedSum = sup.amplitudes.reduce((sum, amp, i) => {
    return sum + amp.magnitude ** 2 * pathScores[i];
  }, 0);
  const overallScore = weightedSum / sup.totalProbability;

  return { pathScores, overallScore, violations };
}

/**
 * μ-alignment constraint
 *
 * Paths should be aligned with the balance ray
 */
export function muAlignmentConstraint(threshold: number = 0.5): Constraint {
  return {
    id: 'mu_alignment',
    check: (path) => {
      const relPhase = Math.abs(path.amplitude.phaseRelativeToMu);
      return relPhase < threshold;
    },
    weight: 0.3
  };
}

/**
 * Confidence threshold constraint
 */
export function confidenceConstraint(minConfidence: number = 0.5): Constraint {
  return {
    id: 'confidence',
    check: (path) => path.confidence >= minConfidence,
    weight: 0.4
  };
}

// ============================================================
// QUANTUM REASONER — BRINGING IT TOGETHER
// ============================================================

/**
 * The Quantum Reasoner holds the full state
 */
export interface QuantumReasoner {
  superposition: Superposition;
  demon: MaxwellDemon;
  constraints: Constraint[];
  temperature: Temperature;
  collapsed: boolean;
  result?: CollapseResult;
}

/**
 * Create a quantum reasoner
 */
export function createReasoner(
  paths: ReasoningPath[],
  constraints: Constraint[] = [],
  demonBias: number = 1.0,
  temp: number = 1.0
): QuantumReasoner {
  return {
    superposition: normalize(createSuperposition(paths)),
    demon: createDemon(demonBias),
    constraints,
    temperature: createTemperature(temp),
    collapsed: false
  };
}

/**
 * Run one reasoning step
 *
 * 1. Demon selects (bias toward μ)
 * 2. Validate against constraints
 * 3. Optionally soft-collapse based on validation
 */
export function reasoningStep(
  reasoner: QuantumReasoner,
  softCollapseStrength: number = 0.1
): QuantumReasoner {
  // Demon selection
  const { newSuperposition, updatedDemon } = demonSelect(
    reasoner.superposition,
    reasoner.demon
  );

  // Validation
  const validation = validate(newSuperposition, reasoner.constraints);

  // Find best-validated path
  let bestIndex = 0;
  let bestScore = 0;
  validation.pathScores.forEach((score, i) => {
    const weightedScore = score * newSuperposition.amplitudes[i].magnitude ** 2;
    if (weightedScore > bestScore) {
      bestScore = weightedScore;
      bestIndex = i;
    }
  });

  // Soft collapse toward best path
  const afterCollapse = softCollapse(newSuperposition, bestIndex, softCollapseStrength);

  return {
    ...reasoner,
    superposition: afterCollapse,
    demon: updatedDemon
  };
}

/**
 * Final collapse — commit to a path
 */
export function finalCollapse(
  reasoner: QuantumReasoner,
  muWeight: number = 0.5
): QuantumReasoner {
  const result = collapse(reasoner.superposition, muWeight);

  return {
    ...reasoner,
    collapsed: true,
    result
  };
}
