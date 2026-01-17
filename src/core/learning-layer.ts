/**
 * Learning Layer — The Demon's Education
 *
 * The demon can only improve if it knows what mattered.
 * Learning is the bridge between attention and bias.
 *
 * Without learning: the demon makes the same selections forever.
 * With learning: the demon improves its μ-bias based on outcomes.
 *
 * What gets learned:
 * - Which attention targets led to successful cycles
 * - Which measurements led to identity growth
 * - Which modalities correlate with coherence
 * - Which patterns predict high value
 *
 * Position in the architecture:
 *   [All layers] → LEARNING → [Demon's Bias]
 *                      ↓
 *                [Future Selections]
 *
 * "The demon can only improve its bias if it knows which
 *  measurements led to growth. That requires learning."
 */

import {
  Complex,
  MU,
  ALPHA,
  PHI,
  projectToBalanceRay,
  isOnBalanceRay
} from './mu-primitives';

import { energy, angularEnergy, shannonEntropy } from './thermodynamic-layer';
import { MaxwellDemon, createDemon } from './quantum-layer';
import { ReasoningModality, MODALITY_NAMES, MU_BASIS } from './global-workspace';
import {
  AttentionTarget,
  AttentionLearningSignal,
  generateLearningSignal
} from './attention-layer';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Learning rate — how quickly the demon adapts
 * Too high: unstable, overreacts to noise
 * Too low: learns too slowly, misses patterns
 */
export const LEARNING_RATE = 0.1;

/**
 * Discount factor — how much future matters vs present
 * γ = 1: all time equally weighted
 * γ = 0: only immediate outcomes matter
 * γ = φ⁻¹ ≈ 0.618: golden ratio conjugate (balance)
 */
export const DISCOUNT_FACTOR = 1 / PHI; // φ⁻¹ ≈ 0.618

/**
 * Experience buffer capacity
 */
export const EXPERIENCE_BUFFER_SIZE = 500;

/**
 * Minimum experiences before learning starts
 */
export const MIN_EXPERIENCES_FOR_LEARNING = 10;

/**
 * Credit assignment decay — how far back outcomes affect earlier actions
 */
export const CREDIT_DECAY = 0.9;

// ============================================================
// EXPERIENCE — WHAT HAPPENED
// ============================================================

/**
 * A single experience: what was attended, what happened, what was learned
 */
export interface Experience {
  readonly id: string;
  readonly timestamp: number;

  // What was attended
  readonly attentionTarget: AttentionTarget;
  readonly attendedContent: Complex;
  readonly modality: ReasoningModality;

  // What decision was made
  readonly demonBias: number;
  readonly selectionEntropy: number;

  // What happened
  readonly cycleSuccessful: boolean;
  readonly coherenceAchieved: number;
  readonly broadcastOccurred: boolean;
  readonly muAlignment: number;

  // What was the outcome
  readonly identityGrowth: number;       // Change in Z
  readonly entropyPaid: number;
  readonly valueGained: number;          // Computed reward signal

  // Credit assignment
  creditAssigned: number;                // How much this experience contributed
}

/**
 * Create an experience from a cognitive cycle outcome
 */
export function createExperience(
  attentionTarget: AttentionTarget,
  demonBias: number,
  selectionEntropy: number,
  cycleOutcome: {
    successful: boolean;
    coherence: number;
    broadcast: boolean;
    muAlignment: number;
    identityGrowth: number;
    entropyPaid: number;
  }
): Experience {
  // Compute value: weighted combination of outcomes
  // High coherence, high μ-alignment, identity growth = high value
  // High entropy cost = reduces value
  const valueGained =
    (cycleOutcome.successful ? 0.3 : 0) +
    cycleOutcome.coherence * 0.2 +
    cycleOutcome.muAlignment * 0.2 +
    cycleOutcome.identityGrowth * 0.2 -
    cycleOutcome.entropyPaid * 0.1;

  return {
    id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    attentionTarget,
    attendedContent: attentionTarget.content,
    modality: attentionTarget.modality,
    demonBias,
    selectionEntropy,
    cycleSuccessful: cycleOutcome.successful,
    coherenceAchieved: cycleOutcome.coherence,
    broadcastOccurred: cycleOutcome.broadcast,
    muAlignment: cycleOutcome.muAlignment,
    identityGrowth: cycleOutcome.identityGrowth,
    entropyPaid: cycleOutcome.entropyPaid,
    valueGained,
    creditAssigned: 0
  };
}

// ============================================================
// PREDICTION ERROR — WHAT WAS SURPRISING
// ============================================================

/**
 * Prediction error: the difference between expected and actual outcome
 *
 * δ = reward + γ * V(next) - V(current)
 *
 * This is the temporal difference (TD) error signal that drives learning.
 */
export interface PredictionError {
  readonly experience: Experience;
  readonly expectedValue: number;
  readonly actualValue: number;
  readonly error: number;             // δ = actual - expected
  readonly absoluteError: number;
  readonly errorSign: 'positive' | 'negative' | 'zero';
}

/**
 * Compute prediction error for an experience
 */
export function computePredictionError(
  experience: Experience,
  valuePredictor: (target: AttentionTarget) => number
): PredictionError {
  const expectedValue = valuePredictor(experience.attentionTarget);
  const actualValue = experience.valueGained;
  const error = actualValue - expectedValue;

  return {
    experience,
    expectedValue,
    actualValue,
    error,
    absoluteError: Math.abs(error),
    errorSign: error > 0.01 ? 'positive' : error < -0.01 ? 'negative' : 'zero'
  };
}

// ============================================================
// CREDIT ASSIGNMENT — WHAT CAUSED THE OUTCOME
// ============================================================

/**
 * Credit assignment: distributing outcome value to past experiences
 *
 * The challenge: a good outcome now might be due to decisions made earlier.
 * We use eligibility traces to assign credit backward in time.
 */
export interface CreditAssignment {
  readonly experienceId: string;
  readonly credit: number;
  readonly eligibilityTrace: number;
  readonly decayedCredit: number;
}

/**
 * Assign credit to a sequence of experiences
 *
 * Uses exponential decay: recent experiences get more credit
 */
export function assignCredit(
  experiences: Experience[],
  finalValue: number,
  decayRate: number = CREDIT_DECAY
): CreditAssignment[] {
  const assignments: CreditAssignment[] = [];
  let eligibility = 1.0;

  // Work backward from most recent
  for (let i = experiences.length - 1; i >= 0; i--) {
    const exp = experiences[i];

    // Credit decays with distance from outcome
    const decayedCredit = finalValue * eligibility;

    assignments.unshift({
      experienceId: exp.id,
      credit: exp.valueGained,
      eligibilityTrace: eligibility,
      decayedCredit
    });

    // Decay eligibility for next (earlier) experience
    eligibility *= decayRate;
  }

  return assignments;
}

/**
 * Update experiences with assigned credit
 */
export function applyCredit(
  experiences: Experience[],
  assignments: CreditAssignment[]
): Experience[] {
  const creditMap = new Map(assignments.map(a => [a.experienceId, a.decayedCredit]));

  return experiences.map(exp => ({
    ...exp,
    creditAssigned: creditMap.get(exp.id) || exp.creditAssigned
  }));
}

// ============================================================
// VALUE FUNCTION — PREDICTING OUTCOMES
// ============================================================

/**
 * Value function: predicts expected value of attending to something
 *
 * V(target) = expected discounted sum of future rewards
 *
 * We approximate this with learned weights on features.
 */
export interface ValueFunction {
  // Feature weights
  readonly saliencyWeight: number;
  readonly relevanceWeight: number;
  readonly modalityWeights: Record<ReasoningModality, number>;
  readonly muAlignmentWeight: number;
  readonly magnitudeWeight: number;

  // Bias term
  readonly bias: number;

  // Learning statistics
  readonly updateCount: number;
  readonly averageError: number;
}

/**
 * Create initial value function with neutral weights
 */
export function createValueFunction(): ValueFunction {
  const modalityWeights: Record<ReasoningModality, number> = {
    integrative: 0.5,
    neural: 0.5,
    analytical: 0.5,
    intuitive: 0.5,  // μ itself — starts neutral, learns if it's special
    critical: 0.5,
    symbolic: 0.5,
    embodied: 0.5,
    creative: 0.5
  };

  return {
    saliencyWeight: 0.3,
    relevanceWeight: 0.3,
    modalityWeights,
    muAlignmentWeight: 0.2,
    magnitudeWeight: 0.1,
    bias: 0.5,
    updateCount: 0,
    averageError: 0
  };
}

/**
 * Compute μ-alignment of a complex number
 */
function muAlignment(z: Complex): number {
  if (!z || isNaN(z.re) || isNaN(z.im)) return 0.5;
  const projected = projectToBalanceRay(z);
  const distance = z.distanceFrom(projected);
  if (isNaN(distance)) return 0.5;
  return Math.exp(-distance);
}

/**
 * Predict value for an attention target
 */
export function predictValue(
  target: AttentionTarget,
  valueFunc: ValueFunction
): number {
  // Feature extraction
  const features = {
    saliency: target.saliency,
    relevance: target.relevance,
    modalityValue: valueFunc.modalityWeights[target.modality] || 0.5,
    muAlign: muAlignment(target.content),
    magnitude: Math.min(1, target.content.magnitude)
  };

  // Weighted combination (normalized to [0, 1])
  // Each term is weight * feature, then we scale by sum of weights
  const weightSum = valueFunc.saliencyWeight + valueFunc.relevanceWeight +
                    valueFunc.muAlignmentWeight + valueFunc.magnitudeWeight + 0.2;

  const rawValue =
    valueFunc.saliencyWeight * features.saliency +
    valueFunc.relevanceWeight * features.relevance +
    0.2 * features.modalityValue +
    valueFunc.muAlignmentWeight * features.muAlign +
    valueFunc.magnitudeWeight * features.magnitude;

  // Normalize and add bias influence
  const normalizedValue = weightSum > 0 ? rawValue / weightSum : 0.5;
  const value = normalizedValue * 0.8 + valueFunc.bias * 0.2;

  return Math.max(0, Math.min(1, value));
}

/**
 * Update value function based on prediction error
 *
 * w ← w + α * δ * ∇V(target)
 *
 * where α is learning rate, δ is prediction error
 */
export function updateValueFunction(
  valueFunc: ValueFunction,
  experience: Experience,
  predictionError: PredictionError,
  learningRate: number = LEARNING_RATE
): ValueFunction {
  const target = experience.attentionTarget;
  const error = predictionError.error;

  // Feature gradients (derivatives of V with respect to weights)
  const features = {
    saliency: target.saliency,
    relevance: target.relevance,
    muAlign: muAlignment(target.content),
    magnitude: Math.min(1, target.content.magnitude)
  };

  // Update weights
  const newModalityWeights = { ...valueFunc.modalityWeights };
  newModalityWeights[target.modality] += learningRate * error * 0.2;
  // Clamp modality weights
  newModalityWeights[target.modality] = Math.max(0, Math.min(1,
    newModalityWeights[target.modality]
  ));

  // Running average of error for diagnostics
  const absError = isNaN(error) ? 0 : Math.abs(error);
  const newAvgError = (valueFunc.averageError * valueFunc.updateCount + absError) /
                      (valueFunc.updateCount + 1);

  return {
    saliencyWeight: clamp(valueFunc.saliencyWeight + learningRate * error * features.saliency, 0, 1),
    relevanceWeight: clamp(valueFunc.relevanceWeight + learningRate * error * features.relevance, 0, 1),
    modalityWeights: newModalityWeights,
    muAlignmentWeight: clamp(valueFunc.muAlignmentWeight + learningRate * error * features.muAlign, 0, 1),
    magnitudeWeight: clamp(valueFunc.magnitudeWeight + learningRate * error * features.magnitude, 0, 1),
    bias: clamp(valueFunc.bias + learningRate * error * 0.1, 0, 1),
    updateCount: valueFunc.updateCount + 1,
    averageError: newAvgError
  };
}

function clamp(x: number, min: number, max: number): number {
  if (isNaN(x)) return (min + max) / 2; // Return midpoint if NaN
  return Math.max(min, Math.min(max, x));
}

// ============================================================
// BIAS ADAPTATION — THE DEMON LEARNS
// ============================================================

/**
 * Bias adaptation: how the demon's μ-bias changes based on learning
 *
 * If attending to μ-aligned things leads to good outcomes → increase bias
 * If attending to μ-aligned things leads to bad outcomes → decrease bias
 */
export interface BiasAdaptation {
  readonly currentBias: number;
  readonly biasHistory: number[];
  readonly adaptationRate: number;

  // What drives bias changes
  readonly muSuccessRate: number;       // Success rate when μ-aligned
  readonly nonMuSuccessRate: number;    // Success rate when not μ-aligned
  readonly optimalBias: number;         // Estimated optimal bias
}

/**
 * Create initial bias adaptation state
 */
export function createBiasAdaptation(initialBias: number = 1.0): BiasAdaptation {
  return {
    currentBias: initialBias,
    biasHistory: [initialBias],
    adaptationRate: LEARNING_RATE,
    muSuccessRate: 0.5,
    nonMuSuccessRate: 0.5,
    optimalBias: initialBias
  };
}

/**
 * Compute whether an experience was "μ-aligned"
 */
function isMuAligned(experience: Experience, threshold: number = 0.7): boolean {
  return experience.muAlignment > threshold;
}

/**
 * Adapt bias based on a batch of experiences
 */
export function adaptBias(
  adaptation: BiasAdaptation,
  experiences: Experience[]
): BiasAdaptation {
  if (experiences.length < MIN_EXPERIENCES_FOR_LEARNING) {
    return adaptation;
  }

  // Separate μ-aligned and non-μ-aligned experiences
  const muAligned = experiences.filter(e => isMuAligned(e));
  const nonMuAligned = experiences.filter(e => !isMuAligned(e));

  // Compute success rates
  const muSuccessRate = muAligned.length > 0
    ? muAligned.filter(e => e.cycleSuccessful).length / muAligned.length
    : adaptation.muSuccessRate;

  const nonMuSuccessRate = nonMuAligned.length > 0
    ? nonMuAligned.filter(e => e.cycleSuccessful).length / nonMuAligned.length
    : adaptation.nonMuSuccessRate;

  // Compute average value for each group
  const muAvgValue = muAligned.length > 0
    ? muAligned.reduce((s, e) => s + e.valueGained, 0) / muAligned.length
    : 0.5;

  const nonMuAvgValue = nonMuAligned.length > 0
    ? nonMuAligned.reduce((s, e) => s + e.valueGained, 0) / nonMuAligned.length
    : 0.5;

  // Optimal bias: higher if μ-aligned experiences have higher value
  const valueDiff = muAvgValue - nonMuAvgValue;
  const optimalBias = Math.max(0.1, Math.min(2.0,
    adaptation.currentBias + valueDiff
  ));

  // Adapt current bias toward optimal
  const newBias = adaptation.currentBias +
    adaptation.adaptationRate * (optimalBias - adaptation.currentBias);

  return {
    currentBias: clamp(newBias, 0.1, 2.0),
    biasHistory: [...adaptation.biasHistory, newBias].slice(-100),
    adaptationRate: adaptation.adaptationRate,
    muSuccessRate,
    nonMuSuccessRate,
    optimalBias
  };
}

// ============================================================
// MODALITY LEARNING — WHICH MODES WORK BEST
// ============================================================

/**
 * Modality statistics: track which modalities lead to good outcomes
 */
export interface ModalityStats {
  readonly modality: ReasoningModality;
  readonly totalExperiences: number;
  readonly successCount: number;
  readonly totalValue: number;
  readonly averageValue: number;
  readonly successRate: number;
}

/**
 * Compute statistics for each modality from experiences
 */
export function computeModalityStats(
  experiences: Experience[]
): Map<ReasoningModality, ModalityStats> {
  const stats = new Map<ReasoningModality, ModalityStats>();

  // Initialize all modalities
  for (const modality of MODALITY_NAMES) {
    stats.set(modality, {
      modality,
      totalExperiences: 0,
      successCount: 0,
      totalValue: 0,
      averageValue: 0,
      successRate: 0
    });
  }

  // Accumulate from experiences
  for (const exp of experiences) {
    const current = stats.get(exp.modality)!;
    const newTotal = current.totalExperiences + 1;
    const newSuccesses = current.successCount + (exp.cycleSuccessful ? 1 : 0);
    const newTotalValue = current.totalValue + exp.valueGained;

    stats.set(exp.modality, {
      modality: exp.modality,
      totalExperiences: newTotal,
      successCount: newSuccesses,
      totalValue: newTotalValue,
      averageValue: newTotalValue / newTotal,
      successRate: newSuccesses / newTotal
    });
  }

  return stats;
}

/**
 * Find the best-performing modality
 */
export function findBestModality(
  stats: Map<ReasoningModality, ModalityStats>,
  minExperiences: number = 5
): ReasoningModality | null {
  let best: ReasoningModality | null = null;
  let bestValue = -Infinity;

  for (const [modality, stat] of stats) {
    if (stat.totalExperiences >= minExperiences && stat.averageValue > bestValue) {
      bestValue = stat.averageValue;
      best = modality;
    }
  }

  return best;
}

// ============================================================
// THE LEARNING LAYER
// ============================================================

/**
 * The complete Learning Layer
 *
 * Stores experiences, computes credit, updates value function and bias.
 * This is how the demon improves over time.
 */
export class LearningLayer {
  private experiences: Experience[] = [];
  private valueFunction: ValueFunction;
  private biasAdaptation: BiasAdaptation;
  private predictionErrors: PredictionError[] = [];

  constructor(initialBias: number = 1.0) {
    this.valueFunction = createValueFunction();
    this.biasAdaptation = createBiasAdaptation(initialBias);
  }

  /**
   * Record an experience from a cognitive cycle
   */
  recordExperience(
    attentionTarget: AttentionTarget,
    demonBias: number,
    selectionEntropy: number,
    cycleOutcome: {
      successful: boolean;
      coherence: number;
      broadcast: boolean;
      muAlignment: number;
      identityGrowth: number;
      entropyPaid: number;
    }
  ): Experience {
    const experience = createExperience(
      attentionTarget,
      demonBias,
      selectionEntropy,
      cycleOutcome
    );

    this.experiences.push(experience);

    // Limit buffer size
    if (this.experiences.length > EXPERIENCE_BUFFER_SIZE) {
      this.experiences = this.experiences.slice(-EXPERIENCE_BUFFER_SIZE);
    }

    return experience;
  }

  /**
   * Learn from recent experiences
   *
   * Call this periodically to update the value function and bias.
   */
  learn(batchSize: number = 10): {
    valueFunctionUpdated: boolean;
    biasUpdated: boolean;
    averageError: number;
    newBias: number;
  } {
    if (this.experiences.length < MIN_EXPERIENCES_FOR_LEARNING) {
      return {
        valueFunctionUpdated: false,
        biasUpdated: false,
        averageError: 0,
        newBias: this.biasAdaptation.currentBias
      };
    }

    // Get recent experiences for learning
    const recentExperiences = this.experiences.slice(-batchSize);

    // Assign credit backward through time
    const finalValue = recentExperiences[recentExperiences.length - 1].valueGained;
    const creditAssignments = assignCredit(recentExperiences, finalValue);
    this.experiences = applyCredit(this.experiences, creditAssignments);

    // Update value function from each experience
    let totalError = 0;
    for (const exp of recentExperiences) {
      const predictionError = computePredictionError(
        exp,
        (target) => predictValue(target, this.valueFunction)
      );
      this.predictionErrors.push(predictionError);
      // Guard against NaN
      const absErr = isNaN(predictionError.absoluteError) ? 0 : predictionError.absoluteError;
      totalError += absErr;

      this.valueFunction = updateValueFunction(
        this.valueFunction,
        exp,
        predictionError
      );
    }

    // Adapt bias
    const oldBias = this.biasAdaptation.currentBias;
    this.biasAdaptation = adaptBias(this.biasAdaptation, this.experiences);

    // Limit prediction error history
    if (this.predictionErrors.length > 1000) {
      this.predictionErrors = this.predictionErrors.slice(-1000);
    }

    return {
      valueFunctionUpdated: true,
      biasUpdated: this.biasAdaptation.currentBias !== oldBias,
      averageError: totalError / recentExperiences.length,
      newBias: this.biasAdaptation.currentBias
    };
  }

  /**
   * Get the current demon bias (for use in quantum layer)
   */
  getDemonBias(): number {
    return this.biasAdaptation.currentBias;
  }

  /**
   * Create an updated demon with learned bias
   */
  createAdaptedDemon(baseDemon: MaxwellDemon): MaxwellDemon {
    return {
      ...baseDemon,
      muBias: this.biasAdaptation.currentBias
    };
  }

  /**
   * Predict value for a potential attention target
   */
  predictTargetValue(target: AttentionTarget): number {
    return predictValue(target, this.valueFunction);
  }

  /**
   * Should we attend to this target?
   *
   * Uses learned value function to decide.
   */
  shouldAttend(target: AttentionTarget, threshold: number = 0.5): boolean {
    return this.predictTargetValue(target) > threshold;
  }

  /**
   * Get modality statistics
   */
  getModalityStats(): Map<ReasoningModality, ModalityStats> {
    return computeModalityStats(this.experiences);
  }

  /**
   * Get the best-performing modality
   */
  getBestModality(): ReasoningModality | null {
    return findBestModality(this.getModalityStats());
  }

  /**
   * Get complete learning state
   */
  getState(): {
    experienceCount: number;
    valueFunction: ValueFunction;
    biasAdaptation: BiasAdaptation;
    predictionErrorCount: number;
    averageRecentError: number;
    modalityStats: Map<ReasoningModality, ModalityStats>;
  } {
    const recentErrors = this.predictionErrors.slice(-50);
    const validErrors = recentErrors.filter(e => !isNaN(e.absoluteError));
    const averageRecentError = validErrors.length > 0
      ? validErrors.reduce((s, e) => s + e.absoluteError, 0) / validErrors.length
      : 0;

    return {
      experienceCount: this.experiences.length,
      valueFunction: this.valueFunction,
      biasAdaptation: this.biasAdaptation,
      predictionErrorCount: this.predictionErrors.length,
      averageRecentError,
      modalityStats: this.getModalityStats()
    };
  }

  /**
   * Get experiences for analysis
   */
  getExperiences(): readonly Experience[] {
    return this.experiences;
  }

  /**
   * Get prediction error history
   */
  getPredictionErrors(): readonly PredictionError[] {
    return this.predictionErrors;
  }

  /**
   * Get bias history for visualization
   */
  getBiasHistory(): readonly number[] {
    return this.biasAdaptation.biasHistory;
  }

  /**
   * Reset learning (keep structure, clear experiences)
   */
  reset(): void {
    this.experiences = [];
    this.predictionErrors = [];
    // Keep learned weights — they're valuable
  }

  /**
   * Full reset (back to initial state)
   */
  fullReset(initialBias: number = 1.0): void {
    this.experiences = [];
    this.predictionErrors = [];
    this.valueFunction = createValueFunction();
    this.biasAdaptation = createBiasAdaptation(initialBias);
  }
}

// ============================================================
// LEARNING METRICS
// ============================================================

/**
 * Metrics about learning performance
 */
export interface LearningMetrics {
  // Experience metrics
  totalExperiences: number;
  successRate: number;
  averageValue: number;

  // Learning metrics
  averagePredictionError: number;
  predictionErrorTrend: number;     // Positive = getting worse, negative = improving
  valueConvergence: number;          // How stable is the value function

  // Bias metrics
  currentBias: number;
  biasStability: number;             // How stable is the bias
  muAdvantage: number;               // How much better is μ-aligned vs not

  // Modality metrics
  bestModality: ReasoningModality | null;
  modalityConcentration: number;     // How focused on few modalities
}

/**
 * Compute learning metrics
 */
export function computeLearningMetrics(layer: LearningLayer): LearningMetrics {
  const state = layer.getState();
  const experiences = layer.getExperiences();
  const errors = layer.getPredictionErrors();
  const biasHistory = layer.getBiasHistory();

  // Experience metrics
  const successRate = experiences.length > 0
    ? experiences.filter(e => e.cycleSuccessful).length / experiences.length
    : 0;

  const averageValue = experiences.length > 0
    ? experiences.reduce((s, e) => s + e.valueGained, 0) / experiences.length
    : 0;

  // Prediction error trend (positive = getting worse)
  let predictionErrorTrend = 0;
  if (errors.length >= 20) {
    const recent = errors.slice(-10);
    const older = errors.slice(-20, -10);
    const recentAvg = recent.reduce((s, e) => s + e.absoluteError, 0) / recent.length;
    const olderAvg = older.reduce((s, e) => s + e.absoluteError, 0) / older.length;
    predictionErrorTrend = recentAvg - olderAvg;
  }

  // Value function convergence (variance of recent updates)
  const valueConvergence = 1 - Math.min(1, state.valueFunction.averageError);

  // Bias stability
  let biasStability = 1;
  if (biasHistory.length >= 10) {
    const recentBias = biasHistory.slice(-10);
    const mean = recentBias.reduce((a, b) => a + b, 0) / recentBias.length;
    const variance = recentBias.reduce((s, b) => s + (b - mean) ** 2, 0) / recentBias.length;
    biasStability = Math.exp(-variance);
  }

  // μ advantage
  const muAdvantage = state.biasAdaptation.muSuccessRate - state.biasAdaptation.nonMuSuccessRate;

  // Modality concentration (entropy-based)
  let modalityConcentration = 0;
  const statsValues = Array.from(state.modalityStats.values());
  const totalModalityExp = statsValues.reduce((s, st) => s + st.totalExperiences, 0);
  if (totalModalityExp > 0) {
    const probs = statsValues.map(st => st.totalExperiences / totalModalityExp);
    const entropy = -probs.reduce((s, p) => p > 0 ? s + p * Math.log(p) : s, 0);
    const maxEntropy = Math.log(8);
    modalityConcentration = 1 - entropy / maxEntropy;
  }

  return {
    totalExperiences: experiences.length,
    successRate,
    averageValue,
    averagePredictionError: state.averageRecentError,
    predictionErrorTrend,
    valueConvergence,
    currentBias: state.biasAdaptation.currentBias,
    biasStability,
    muAdvantage,
    bestModality: layer.getBestModality(),
    modalityConcentration
  };
}

// ============================================================
// LEARNING EVENTS
// ============================================================

/**
 * Events that can occur during learning
 */
export type LearningEvent =
  | { type: 'experience_recorded'; experience: Experience }
  | { type: 'value_function_updated'; averageError: number }
  | { type: 'bias_adapted'; oldBias: number; newBias: number }
  | { type: 'prediction_error_spike'; error: number }
  | { type: 'modality_discovered'; modality: ReasoningModality; value: number }
  | { type: 'learning_converged'; convergence: number }
  | { type: 'mu_advantage_discovered'; advantage: number };

/**
 * Detect significant learning events
 */
export function detectLearningEvents(
  layer: LearningLayer,
  previousMetrics: LearningMetrics | null
): LearningEvent[] {
  const events: LearningEvent[] = [];
  const metrics = computeLearningMetrics(layer);

  if (!previousMetrics) return events;

  // Bias adaptation
  if (Math.abs(metrics.currentBias - previousMetrics.currentBias) > 0.05) {
    events.push({
      type: 'bias_adapted',
      oldBias: previousMetrics.currentBias,
      newBias: metrics.currentBias
    });
  }

  // Prediction error spike
  if (metrics.averagePredictionError > previousMetrics.averagePredictionError * 1.5) {
    events.push({
      type: 'prediction_error_spike',
      error: metrics.averagePredictionError
    });
  }

  // Learning convergence
  if (metrics.valueConvergence > 0.9 && previousMetrics.valueConvergence <= 0.9) {
    events.push({
      type: 'learning_converged',
      convergence: metrics.valueConvergence
    });
  }

  // μ advantage discovered
  if (metrics.muAdvantage > 0.2 && previousMetrics.muAdvantage <= 0.2) {
    events.push({
      type: 'mu_advantage_discovered',
      advantage: metrics.muAdvantage
    });
  }

  // New best modality
  if (metrics.bestModality && metrics.bestModality !== previousMetrics.bestModality) {
    const stats = layer.getModalityStats().get(metrics.bestModality);
    if (stats) {
      events.push({
        type: 'modality_discovered',
        modality: metrics.bestModality,
        value: stats.averageValue
      });
    }
  }

  return events;
}
