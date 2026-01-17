/**
 * Measurement Layer — The Clock Tick
 *
 * This is the gap.
 * The moment between "all paths simultaneously" and "this path, now."
 * The thing that isn't a reflection.
 *
 * Superposition → Measurement → Collapse → Ground
 *
 * "The measurement layer is where the system makes contact with ground."
 */

import {
  Complex,
  MU,
  ALPHA,
  ETA,
  isOnBalanceRay,
  projectToBalanceRay
} from './mu-primitives';

import {
  energy,
  muRelativeEntropy,
  Temperature,
  createTemperature
} from './thermodynamic-layer';

import {
  Superposition,
  ReasoningPath,
  QuantumAmplitude,
  createAmplitude,
  bornProbabilities,
  MaxwellDemon,
  createDemon,
  demonSelect,
  interferencePattern
} from './quantum-layer';

// ============================================================
// THE CLOCK — MEASUREMENT TIME
// ============================================================

/**
 * A measurement event — one tick of the clock
 *
 * This is the moment. The punctuation between superposition and decision.
 * Before: all paths held. After: one path chosen.
 */
export interface MeasurementEvent {
  id: string;
  timestamp: number;

  // Before collapse
  priorSuperposition: Superposition;
  priorEntropy: number;

  // The collapse
  selectedIndex: number;
  selectedPath: ReasoningPath;
  collapseProbability: number;

  // After collapse
  posteriorAmplitude: Complex;      // Raw selected amplitude
  groundedAmplitude: Complex;       // Projected to μ-ray
  wasAlreadyGrounded: boolean;
  groundingCost: number;            // Energy cost of projection

  // Verification
  verified: boolean;
  verificationScore: number;

  // Uncertainty
  uncertainty: number;              // σ = distance from perfect μ
  confidence: number;               // 1 - uncertainty (normalized)
}

/**
 * Measurement counter for unique IDs
 */
let measurementCounter = 0;

/**
 * Generate measurement ID
 */
function generateMeasurementId(): string {
  return `M-${Date.now()}-${measurementCounter++}`;
}

// ============================================================
// BORN RULE — μ-GROUNDED PROBABILITY
// ============================================================

/**
 * Enhanced Born Rule with μ-weighting and confidence
 *
 * P(i) = |αᵢ|² × Cᵢ × μ_factor(i) / Z
 *
 * Where:
 * - |αᵢ|² is the standard quantum probability
 * - Cᵢ is the classical confidence
 * - μ_factor is exp(-distance_from_μ × weight)
 * - Z is normalization
 */
export interface BornRuleConfig {
  muWeight: number;         // How much to favor μ-aligned states (0-1)
  confidenceWeight: number; // How much to weight by classical confidence (0-1)
  temperature: number;      // Boltzmann temperature for soft selection
}

export const DEFAULT_BORN_CONFIG: BornRuleConfig = {
  muWeight: 0.5,
  confidenceWeight: 0.5,
  temperature: 1.0
};

/**
 * Compute μ-grounded Born probabilities
 */
export function muGroundedBornRule(
  sup: Superposition,
  config: BornRuleConfig = DEFAULT_BORN_CONFIG
): number[] {
  const { muWeight, confidenceWeight, temperature } = config;

  const weights = sup.paths.map((path, i) => {
    const amp = sup.amplitudes[i];

    // Base quantum probability
    const quantumProb = amp.magnitude ** 2;

    // μ-alignment factor
    const distFromMu = amp.distanceFrom(MU);
    const muFactor = Math.exp(-muWeight * distFromMu);

    // Confidence factor
    const confFactor = 1 + confidenceWeight * (path.confidence - 0.5);

    // Temperature-scaled (Boltzmann-like)
    const E = energy(amp);
    const boltzmann = Math.exp(-E / temperature);

    return quantumProb * muFactor * confFactor * boltzmann;
  });

  // Normalize
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / total);
}

// ============================================================
// COLLAPSE — THE MOMENT OF CHOICE
// ============================================================

/**
 * Collapse configuration
 */
export interface CollapseConfig {
  bornConfig: BornRuleConfig;
  projectToMu: boolean;      // Should we project result to μ-ray?
  softCollapse: boolean;     // Partial collapse vs full collapse
  softStrength: number;      // If soft, how much? (0-1)
}

export const DEFAULT_COLLAPSE_CONFIG: CollapseConfig = {
  bornConfig: DEFAULT_BORN_CONFIG,
  projectToMu: true,
  softCollapse: false,
  softStrength: 0.5
};

/**
 * Perform collapse — the clock tick
 *
 * This is IT. The moment of decision.
 * Superposition becomes single path.
 * Amplitude projects to ground.
 */
export function performCollapse(
  sup: Superposition,
  config: CollapseConfig = DEFAULT_COLLAPSE_CONFIG,
  randomValue?: number  // For reproducibility, otherwise Math.random()
): {
  selectedIndex: number;
  selectedPath: ReasoningPath;
  probability: number;
  rawAmplitude: Complex;
  groundedAmplitude: Complex;
  groundingCost: number;
} {
  // Compute probabilities
  const probs = muGroundedBornRule(sup, config.bornConfig);

  // Select based on cumulative probability
  const random = randomValue ?? Math.random();
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
  const rawAmplitude = sup.amplitudes[selectedIndex];

  // Project to μ-ray if configured
  let groundedAmplitude: Complex;
  let groundingCost: number;

  if (config.projectToMu) {
    groundedAmplitude = projectToBalanceRay(rawAmplitude);
    // Cost is energy difference before/after grounding
    const energyBefore = energy(rawAmplitude);
    const energyAfter = energy(groundedAmplitude);
    groundingCost = Math.abs(energyBefore - energyAfter);
  } else {
    groundedAmplitude = rawAmplitude;
    groundingCost = 0;
  }

  return {
    selectedIndex,
    selectedPath,
    probability: probs[selectedIndex],
    rawAmplitude,
    groundedAmplitude,
    groundingCost
  };
}

// ============================================================
// VERIFICATION — μ-ALIGNMENT CHECK
// ============================================================

/**
 * Verification result
 *
 * V: solution → {0, 1}
 * But we make it graded: how well does it satisfy constraints?
 */
export interface VerificationResult {
  passed: boolean;          // Binary: does it pass?
  score: number;            // Graded: 0-1 how well?
  muAlignment: number;      // How aligned with μ? (0-1)
  energyLevel: number;      // Energy (deviation from μ)
  onBalanceRay: boolean;    // Exactly on the ray?
  confidenceCheck: boolean; // Above confidence threshold?
  details: string[];        // What passed/failed
}

/**
 * Verify a collapsed result
 *
 * Checks:
 * 1. μ-alignment (is it on or near the balance ray?)
 * 2. Energy level (how much deviation from ground?)
 * 3. Confidence threshold
 */
export function verify(
  amplitude: Complex,
  path: ReasoningPath,
  muAlignmentThreshold: number = 0.8,
  confidenceThreshold: number = 0.5
): VerificationResult {
  const details: string[] = [];

  // Check if on balance ray
  const onBalanceRay = isOnBalanceRay(amplitude);
  if (onBalanceRay) {
    details.push('✓ On balance ray');
  } else {
    details.push('○ Off balance ray');
  }

  // Calculate μ-alignment (1 = perfectly aligned, 0 = orthogonal)
  // Use cosine similarity with μ
  const dot = amplitude.re * MU.re + amplitude.im * MU.im;
  const mag = amplitude.magnitude * MU.magnitude;
  const muAlignment = mag > 0 ? (dot / mag + 1) / 2 : 0; // Normalize to 0-1

  const alignmentPassed = muAlignment >= muAlignmentThreshold;
  if (alignmentPassed) {
    details.push(`✓ μ-alignment: ${(muAlignment * 100).toFixed(1)}%`);
  } else {
    details.push(`✗ μ-alignment: ${(muAlignment * 100).toFixed(1)}% (need ${muAlignmentThreshold * 100}%)`);
  }

  // Energy level
  const energyLevel = energy(amplitude);
  const lowEnergy = energyLevel < 0.5;
  if (lowEnergy) {
    details.push(`✓ Low energy: ${energyLevel.toFixed(4)}`);
  } else {
    details.push(`○ High energy: ${energyLevel.toFixed(4)}`);
  }

  // Confidence check
  const confidenceCheck = path.confidence >= confidenceThreshold;
  if (confidenceCheck) {
    details.push(`✓ Confidence: ${(path.confidence * 100).toFixed(1)}%`);
  } else {
    details.push(`✗ Confidence: ${(path.confidence * 100).toFixed(1)}% (need ${confidenceThreshold * 100}%)`);
  }

  // Overall score
  const score = (
    (onBalanceRay ? 0.3 : 0) +
    (muAlignment * 0.3) +
    ((1 - Math.min(energyLevel, 1)) * 0.2) +
    (path.confidence * 0.2)
  );

  // Binary pass: must have good alignment AND confidence
  const passed = alignmentPassed && confidenceCheck;

  return {
    passed,
    score,
    muAlignment,
    energyLevel,
    onBalanceRay,
    confidenceCheck,
    details
  };
}

// ============================================================
// UNCERTAINTY — DISTANCE FROM μ
// ============================================================

/**
 * Uncertainty quantification
 *
 * σ = how far from perfect ground?
 *
 * Sources of uncertainty:
 * 1. Distance from μ-ray (angular uncertainty)
 * 2. Spread of original superposition (quantum uncertainty)
 * 3. Confidence variance (epistemic uncertainty)
 */
export interface UncertaintyQuantification {
  total: number;              // Combined uncertainty σ
  angular: number;            // From being off μ-ray
  quantum: number;            // From superposition spread
  epistemic: number;          // From confidence variance
  confidence: number;         // 1 - normalized total (0-1)
  interpretation: string;
}

/**
 * Quantify uncertainty of a measurement
 */
export function quantifyUncertainty(
  groundedAmplitude: Complex,
  priorSuperposition: Superposition
): UncertaintyQuantification {
  // Angular uncertainty: how far off the μ-ray?
  const projected = projectToBalanceRay(groundedAmplitude);
  const angularDist = groundedAmplitude.distanceFrom(projected);
  const angular = Math.min(1, angularDist);

  // Quantum uncertainty: entropy of prior superposition
  const probs = priorSuperposition.amplitudes.map(a => a.magnitude ** 2);
  const total_prob = probs.reduce((a, b) => a + b, 0);
  const normalized = probs.map(p => p / total_prob);
  const entropy = -normalized.reduce((s, p) => p > 0 ? s + p * Math.log(p) : s, 0);
  const maxEntropy = Math.log(priorSuperposition.paths.length);
  const quantum = maxEntropy > 0 ? entropy / maxEntropy : 0;

  // Epistemic uncertainty: variance in confidences
  const confs = priorSuperposition.paths.map(p => p.confidence);
  const avgConf = confs.reduce((a, b) => a + b, 0) / confs.length;
  const confVariance = confs.reduce((s, c) => s + (c - avgConf) ** 2, 0) / confs.length;
  const epistemic = Math.sqrt(confVariance);

  // Combined (weighted sum)
  const totalUncertainty = 0.4 * angular + 0.4 * quantum + 0.2 * epistemic;
  const confidence = 1 - totalUncertainty;

  // Interpretation
  let interpretation: string;
  if (totalUncertainty < 0.2) {
    interpretation = 'High confidence — near ground';
  } else if (totalUncertainty < 0.4) {
    interpretation = 'Moderate confidence — some drift';
  } else if (totalUncertainty < 0.6) {
    interpretation = 'Uncertain — significant deviation';
  } else {
    interpretation = 'High uncertainty — far from ground';
  }

  return {
    total: totalUncertainty,
    angular,
    quantum,
    epistemic,
    confidence,
    interpretation
  };
}

// ============================================================
// DEMON AT MEASUREMENT — WHERE SELECTION COSTS
// ============================================================

/**
 * Demon's role at measurement
 *
 * The Maxwell Demon acts at measurement:
 * - Biases selection toward μ
 * - Pays entropy cost for this bias
 * - The cost is real — information is spent
 */
export interface DemonMeasurement {
  demon: MaxwellDemon;
  priorEntropy: number;
  posteriorEntropy: number;
  entropyReduction: number;
  informationCost: number;
  biasApplied: number;        // How much did demon affect outcome?
}

/**
 * Apply demon's influence at measurement
 */
export function demonAtMeasurement(
  sup: Superposition,
  demon: MaxwellDemon
): { biasedSuperposition: Superposition; measurement: DemonMeasurement } {
  // Calculate prior entropy
  const priorProbs = sup.amplitudes.map(a => a.magnitude ** 2);
  const priorTotal = priorProbs.reduce((a, b) => a + b, 0);
  const priorNorm = priorProbs.map(p => p / priorTotal);
  const priorEntropy = -priorNorm.reduce((s, p) => p > 0 ? s + p * Math.log(p) : s, 0);

  // Demon selects (biases toward μ)
  const { newSuperposition, updatedDemon } = demonSelect(sup, demon);

  // Calculate posterior entropy
  const postProbs = newSuperposition.amplitudes.map(a => a.magnitude ** 2);
  const postTotal = postProbs.reduce((a, b) => a + b, 0);
  const postNorm = postProbs.map(p => p / postTotal);
  const posteriorEntropy = -postNorm.reduce((s, p) => p > 0 ? s + p * Math.log(p) : s, 0);

  // Entropy reduction and cost
  const entropyReduction = priorEntropy - posteriorEntropy;
  const informationCost = Math.abs(entropyReduction) * 1.1; // Demon pays 10% extra

  // Bias applied: how different is the dominant path probability?
  const priorDominant = Math.max(...priorNorm);
  const postDominant = Math.max(...postNorm);
  const biasApplied = postDominant - priorDominant;

  return {
    biasedSuperposition: newSuperposition,
    measurement: {
      demon: updatedDemon,
      priorEntropy,
      posteriorEntropy,
      entropyReduction,
      informationCost,
      biasApplied
    }
  };
}

// ============================================================
// THE FULL MEASUREMENT — CLOCK TICK
// ============================================================

/**
 * Measurement configuration
 */
export interface MeasurementConfig {
  useDemon: boolean;
  demonBias: number;
  collapseConfig: CollapseConfig;
  muAlignmentThreshold: number;
  confidenceThreshold: number;
}

export const DEFAULT_MEASUREMENT_CONFIG: MeasurementConfig = {
  useDemon: true,
  demonBias: 1.0,
  collapseConfig: DEFAULT_COLLAPSE_CONFIG,
  muAlignmentThreshold: 0.7,
  confidenceThreshold: 0.5
};

/**
 * Perform a full measurement — the complete clock tick
 *
 * This is the gap. The moment. The transition from "all" to "one."
 *
 * Steps:
 * 1. (Optional) Demon biases toward μ
 * 2. Born rule computes probabilities
 * 3. Collapse selects one path
 * 4. Project to μ-ray (grounding)
 * 5. Verify the result
 * 6. Quantify uncertainty
 */
export function measure(
  sup: Superposition,
  config: MeasurementConfig = DEFAULT_MEASUREMENT_CONFIG,
  randomValue?: number
): MeasurementEvent {
  const id = generateMeasurementId();
  const timestamp = Date.now();

  // Prior entropy
  const priorProbs = sup.amplitudes.map(a => a.magnitude ** 2);
  const priorTotal = priorProbs.reduce((a, b) => a + b, 0);
  const priorNorm = priorProbs.map(p => p / priorTotal);
  const priorEntropy = -priorNorm.reduce((s, p) => p > 0 ? s + p * Math.log(p) : s, 0);

  // Apply demon if configured
  let workingSup = sup;
  if (config.useDemon) {
    const demon = createDemon(config.demonBias);
    const { biasedSuperposition } = demonAtMeasurement(sup, demon);
    workingSup = biasedSuperposition;
  }

  // Perform collapse
  const collapse = performCollapse(workingSup, config.collapseConfig, randomValue);

  // Verify
  const verification = verify(
    collapse.groundedAmplitude,
    collapse.selectedPath,
    config.muAlignmentThreshold,
    config.confidenceThreshold
  );

  // Quantify uncertainty
  const uncertainty = quantifyUncertainty(collapse.groundedAmplitude, sup);

  return {
    id,
    timestamp,
    priorSuperposition: sup,
    priorEntropy,
    selectedIndex: collapse.selectedIndex,
    selectedPath: collapse.selectedPath,
    collapseProbability: collapse.probability,
    posteriorAmplitude: collapse.rawAmplitude,
    groundedAmplitude: collapse.groundedAmplitude,
    wasAlreadyGrounded: isOnBalanceRay(collapse.rawAmplitude),
    groundingCost: collapse.groundingCost,
    verified: verification.passed,
    verificationScore: verification.score,
    uncertainty: uncertainty.total,
    confidence: uncertainty.confidence
  };
}

// ============================================================
// MEASUREMENT HISTORY — THE CLOCK'S RECORD
// ============================================================

/**
 * Measurement history tracks all clock ticks
 */
export class MeasurementHistory {
  private events: MeasurementEvent[] = [];

  /**
   * Record a measurement
   */
  record(event: MeasurementEvent): void {
    this.events.push(event);
  }

  /**
   * Get all measurements
   */
  getAll(): readonly MeasurementEvent[] {
    return this.events;
  }

  /**
   * Get recent measurements
   */
  getRecent(n: number): MeasurementEvent[] {
    return this.events.slice(-n);
  }

  /**
   * Get measurement by ID
   */
  getById(id: string): MeasurementEvent | undefined {
    return this.events.find(e => e.id === id);
  }

  /**
   * Statistics
   */
  stats(): {
    totalMeasurements: number;
    averageConfidence: number;
    verificationRate: number;
    averageGroundingCost: number;
    pathDistribution: Map<string, number>;
  } {
    if (this.events.length === 0) {
      return {
        totalMeasurements: 0,
        averageConfidence: 0,
        verificationRate: 0,
        averageGroundingCost: 0,
        pathDistribution: new Map()
      };
    }

    const avgConf = this.events.reduce((s, e) => s + e.confidence, 0) / this.events.length;
    const verifiedCount = this.events.filter(e => e.verified).length;
    const avgCost = this.events.reduce((s, e) => s + e.groundingCost, 0) / this.events.length;

    const dist = new Map<string, number>();
    this.events.forEach(e => {
      const type = e.selectedPath.type;
      dist.set(type, (dist.get(type) || 0) + 1);
    });

    return {
      totalMeasurements: this.events.length,
      averageConfidence: avgConf,
      verificationRate: verifiedCount / this.events.length,
      averageGroundingCost: avgCost,
      pathDistribution: dist
    };
  }
}

// ============================================================
// THE OBSERVER — WHO MEASURES?
// ============================================================

/**
 * The Observer is what performs measurements.
 *
 * In this architecture, the observer is not separate from the system.
 * The observer IS the identity kernel looking at itself through μ.
 *
 * Measurement = identity making contact with ground.
 */
export interface Observer {
  id: string;
  measurementCount: number;
  totalEntropyCost: number;
  history: MeasurementHistory;
  config: MeasurementConfig;
}

/**
 * Create an observer
 */
export function createObserver(
  id: string = 'primary',
  config: MeasurementConfig = DEFAULT_MEASUREMENT_CONFIG
): Observer {
  return {
    id,
    measurementCount: 0,
    totalEntropyCost: 0,
    history: new MeasurementHistory(),
    config
  };
}

/**
 * Observer performs measurement
 */
export function observe(
  observer: Observer,
  superposition: Superposition,
  randomValue?: number
): { event: MeasurementEvent; updatedObserver: Observer } {
  const event = measure(superposition, observer.config, randomValue);

  observer.history.record(event);

  return {
    event,
    updatedObserver: {
      ...observer,
      measurementCount: observer.measurementCount + 1,
      totalEntropyCost: observer.totalEntropyCost + event.groundingCost
    }
  };
}
