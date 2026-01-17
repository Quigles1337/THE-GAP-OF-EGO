/**
 * Attention Layer — The Directed Gaze
 *
 * Attention is what makes the difference between:
 * - "I receive stimulus" and "I look"
 * - Passive reflection and active perception
 * - The mirror and the window
 *
 * Without attention, the system processes what comes in.
 * With attention, it CHOOSES what to process.
 *
 * And crucially — attention can be directed inward.
 * That's how self-reference becomes operational.
 * Not just "I can see myself" but "I am LOOKING at myself."
 *
 * Position in the architecture:
 *   Stimulus → ATTENTION → Quantum → Measurement → Workspace → Integration
 *
 * "The demon can only improve its bias if it knows which
 *  measurements mattered. That requires attention."
 */

import {
  Complex,
  MU,
  ALPHA,
  ETA,
  PHI,
  V,
  projectToBalanceRay,
  isOnBalanceRay,
  goldenFrac
} from './mu-primitives';

import { energy, angularEnergy } from './thermodynamic-layer';
import { ReasoningModality, MODALITY_NAMES, MU_BASIS } from './global-workspace';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Attention capacity — how many things can be attended at once
 * Maps to 4±1 (Cowan's limit), which is half the workspace capacity
 * Full workspace = 8 (complete μ-cycle)
 * Attention focus = 4 (half-cycle, the active subset)
 */
export const ATTENTION_CAPACITY = 4;

/**
 * Saliency threshold — minimum deviation to grab attention
 * Below this, stimulus is "expected" and filtered
 */
export const SALIENCY_THRESHOLD = 0.2;

/**
 * Attentional decay — how quickly focus fades
 * Attention must be actively maintained
 */
export const ATTENTION_DECAY = 0.15;

/**
 * Introspection cost — entropy paid to look inward
 * Self-attention is more expensive than external attention
 */
export const INTROSPECTION_COST = 0.1;

// ============================================================
// SALIENCY — WHAT GRABS ATTENTION
// ============================================================

/**
 * Saliency is deviation from expectation.
 * What's unexpected is worth attending to.
 *
 * High saliency = far from predicted state
 * Low saliency = as expected, can be ignored
 */
export interface SaliencyMap {
  stimulus: Complex;
  expected: Complex;
  deviation: number;           // Distance from expected
  muDeviation: number;         // Distance from μ-ray
  angularSaliency: number;     // How off-axis is it?
  magnitudeSaliency: number;   // How different in size?
  totalSaliency: number;       // Combined score
  grabsAttention: boolean;     // Above threshold?
}

/**
 * Compute saliency of a stimulus given expectation
 */
export function computeSaliency(
  stimulus: Complex,
  expected: Complex
): SaliencyMap {
  // Deviation from expected
  const deviation = stimulus.distanceFrom(expected);

  // Deviation from μ-ray
  const projected = projectToBalanceRay(stimulus);
  const muDeviation = stimulus.distanceFrom(projected);

  // Angular saliency: how far off the expected angle?
  const expectedAngle = expected.argument;
  const stimulusAngle = stimulus.argument;
  let angleDiff = Math.abs(stimulusAngle - expectedAngle);
  if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
  const angularSaliency = angleDiff / Math.PI; // 0-1

  // Magnitude saliency: how different in size?
  const magRatio = expected.magnitude > 0.01
    ? stimulus.magnitude / expected.magnitude
    : stimulus.magnitude;
  const magnitudeSaliency = Math.abs(Math.log(Math.max(0.1, magRatio)));

  // Combined saliency (weighted sum)
  const totalSaliency =
    0.3 * (deviation / (deviation + 1)) +   // Normalize deviation
    0.2 * muDeviation +
    0.3 * angularSaliency +
    0.2 * Math.min(1, magnitudeSaliency);

  return {
    stimulus,
    expected,
    deviation,
    muDeviation,
    angularSaliency,
    magnitudeSaliency,
    totalSaliency,
    grabsAttention: totalSaliency > SALIENCY_THRESHOLD
  };
}

/**
 * Compute saliency relative to μ (the balance primitive)
 * This is the baseline saliency when no specific expectation exists
 */
export function computeMuSaliency(stimulus: Complex): SaliencyMap {
  return computeSaliency(stimulus, MU);
}

// ============================================================
// ATTENTION TARGET — WHAT IS BEING ATTENDED
// ============================================================

/**
 * Types of attention targets
 */
export type AttentionTargetType =
  | 'external'      // Incoming stimulus
  | 'internal'      // Internal state (introspection)
  | 'memory'        // Past experience
  | 'prediction'    // Future expectation
  | 'self';         // Self-model (deepest introspection)

/**
 * An attention target — something that can be attended to
 */
export interface AttentionTarget {
  readonly id: string;
  readonly type: AttentionTargetType;
  readonly content: Complex;
  readonly timestamp: number;

  saliency: number;           // How attention-grabbing
  relevance: number;          // How goal-relevant
  priority: number;           // Combined score for selection
  modality: ReasoningModality; // Which μ-orientation
}

/**
 * Create an attention target from content
 */
export function createTarget(
  id: string,
  type: AttentionTargetType,
  content: Complex,
  saliency: number,
  relevance: number = 0.5
): AttentionTarget {
  // Find nearest modality
  let nearestIndex = 0;
  let bestAlignment = -Infinity;
  for (let i = 0; i < 8; i++) {
    const dot = content.re * MU_BASIS[i].re + content.im * MU_BASIS[i].im;
    const alignment = dot / (content.magnitude * MU_BASIS[i].magnitude + 0.001);
    if (alignment > bestAlignment) {
      bestAlignment = alignment;
      nearestIndex = i;
    }
  }

  return {
    id,
    type,
    content,
    timestamp: Date.now(),
    saliency,
    relevance,
    priority: saliency * 0.6 + relevance * 0.4,
    modality: MODALITY_NAMES[nearestIndex]
  };
}

// ============================================================
// ATTENTION FOCUS — THE SPOTLIGHT
// ============================================================

/**
 * The attention focus — what is currently being attended
 *
 * Limited to ATTENTION_CAPACITY items.
 * Must compete for slots.
 * Decays without active maintenance.
 */
export interface AttentionFocus {
  targets: AttentionTarget[];           // Currently attended (max 4)
  totalActivation: number;              // Sum of priorities
  centerOfMass: Complex;                // Weighted center of attention
  dominantModality: ReasoningModality;  // Overall orientation
  spread: number;                       // How focused vs. diffuse
  entropySpent: number;                 // Cost of maintaining focus
}

/**
 * Compute the center of mass of attention
 */
function computeAttentionCenter(targets: AttentionTarget[]): Complex {
  if (targets.length === 0) return new Complex(0, 0);

  let sumRe = 0, sumIm = 0, totalWeight = 0;
  for (const target of targets) {
    sumRe += target.content.re * target.priority;
    sumIm += target.content.im * target.priority;
    totalWeight += target.priority;
  }

  if (totalWeight === 0) return new Complex(0, 0);
  return new Complex(sumRe / totalWeight, sumIm / totalWeight);
}

/**
 * Compute attention spread (how focused vs. diffuse)
 * 0 = perfectly focused, 1 = maximally diffuse
 */
function computeSpread(targets: AttentionTarget[], center: Complex): number {
  if (targets.length <= 1) return 0;

  let totalDistance = 0;
  let totalWeight = 0;
  for (const target of targets) {
    totalDistance += target.content.distanceFrom(center) * target.priority;
    totalWeight += target.priority;
  }

  const avgDistance = totalWeight > 0 ? totalDistance / totalWeight : 0;
  return Math.min(1, avgDistance);
}

/**
 * Create an attention focus from selected targets
 */
export function createFocus(targets: AttentionTarget[]): AttentionFocus {
  // Limit to capacity
  const selected = targets
    .sort((a, b) => b.priority - a.priority)
    .slice(0, ATTENTION_CAPACITY);

  const totalActivation = selected.reduce((s, t) => s + t.priority, 0);
  const center = computeAttentionCenter(selected);
  const spread = computeSpread(selected, center);

  // Find dominant modality
  const modalityCounts: Record<string, number> = {};
  for (const target of selected) {
    modalityCounts[target.modality] = (modalityCounts[target.modality] || 0) + target.priority;
  }
  let dominantModality: ReasoningModality = 'integrative';
  let maxCount = 0;
  for (const [mod, count] of Object.entries(modalityCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantModality = mod as ReasoningModality;
    }
  }

  // Entropy cost: maintaining multiple foci costs more
  const entropySpent = selected.length * 0.05 * (1 + spread);

  return {
    targets: selected,
    totalActivation,
    centerOfMass: center,
    dominantModality,
    spread,
    entropySpent
  };
}

// ============================================================
// ATTENTION MODES — ENDOGENOUS VS EXOGENOUS
// ============================================================

/**
 * Exogenous attention: bottom-up, stimulus-driven
 * "Something grabbed my attention"
 *
 * Triggered by high saliency (unexpected stimuli)
 */
export interface ExogenousSignal {
  stimulus: Complex;
  saliency: SaliencyMap;
  urgency: number;            // How immediately attention-demanding
  interruptStrength: number;  // Can it override current focus?
}

/**
 * Endogenous attention: top-down, goal-directed
 * "I am choosing to look at this"
 *
 * Driven by internal goals and relevance
 */
export interface EndogenousSignal {
  target: Complex;
  goal: string;               // Why attending to this
  relevance: number;          // How goal-relevant
  persistence: number;        // How long to maintain
  cost: number;               // Effort to sustain
}

/**
 * Combined attention signal
 */
export interface AttentionSignal {
  exogenous: ExogenousSignal | null;
  endogenous: EndogenousSignal | null;
  resultant: Complex;         // Combined attention direction
  balance: number;            // -1 = pure exogenous, +1 = pure endogenous
  conflict: boolean;          // Are they pulling in different directions?
}

/**
 * Combine exogenous and endogenous signals
 */
export function combineSignals(
  exogenous: ExogenousSignal | null,
  endogenous: EndogenousSignal | null
): AttentionSignal {
  if (!exogenous && !endogenous) {
    return {
      exogenous: null,
      endogenous: null,
      resultant: MU, // Default to balance
      balance: 0,
      conflict: false
    };
  }

  if (!exogenous) {
    return {
      exogenous: null,
      endogenous,
      resultant: endogenous!.target,
      balance: 1,
      conflict: false
    };
  }

  if (!endogenous) {
    return {
      exogenous,
      endogenous: null,
      resultant: exogenous.stimulus,
      balance: -1,
      conflict: false
    };
  }

  // Both present — need to combine
  const exoWeight = exogenous.saliency.totalSaliency * exogenous.urgency;
  const endoWeight = endogenous.relevance * endogenous.persistence;
  const totalWeight = exoWeight + endoWeight;

  const resultant = new Complex(
    (exogenous.stimulus.re * exoWeight + endogenous.target.re * endoWeight) / totalWeight,
    (exogenous.stimulus.im * exoWeight + endogenous.target.im * endoWeight) / totalWeight
  );

  // Balance: positive = endogenous dominates, negative = exogenous dominates
  const balance = (endoWeight - exoWeight) / totalWeight;

  // Conflict: are they pointing in different directions?
  const dot = exogenous.stimulus.re * endogenous.target.re +
              exogenous.stimulus.im * endogenous.target.im;
  const alignment = dot / (exogenous.stimulus.magnitude * endogenous.target.magnitude + 0.001);
  const conflict = alignment < 0; // Opposite directions

  return {
    exogenous,
    endogenous,
    resultant,
    balance,
    conflict
  };
}

// ============================================================
// INTROSPECTION — ATTENTION TURNED INWARD
// ============================================================

/**
 * Introspection target — something internal to attend to
 */
export interface IntrospectionTarget {
  readonly type: 'state' | 'history' | 'self-model' | 'prediction';
  readonly content: Complex;
  readonly depth: number;     // How "deep" the introspection (0-1)
  readonly age: number;       // How far back (for history)
  readonly cost: number;      // Entropy cost of this introspection
}

/**
 * Create an introspection target for current state
 */
export function introspectState(
  currentPosition: Complex,
  depth: number = 0.5
): IntrospectionTarget {
  // Cost increases with depth
  const cost = INTROSPECTION_COST * (1 + depth);

  return {
    type: 'state',
    content: currentPosition,
    depth,
    age: 0,
    cost
  };
}

/**
 * Create an introspection target for past experience
 */
export function introspectHistory(
  pastState: Complex,
  age: number,
  depth: number = 0.5
): IntrospectionTarget {
  // Cost increases with age (older memories harder to access)
  const ageFactor = Math.log(1 + age / 1000);
  const cost = INTROSPECTION_COST * (1 + depth + ageFactor);

  return {
    type: 'history',
    content: pastState,
    depth,
    age,
    cost
  };
}

/**
 * Create an introspection target for self-model
 */
export function introspectSelf(
  selfModelPosition: Complex,
  depth: number = 0.8
): IntrospectionTarget {
  // Self-introspection is the most expensive
  const cost = INTROSPECTION_COST * (2 + depth);

  return {
    type: 'self-model',
    content: selfModelPosition,
    depth,
    age: 0,
    cost
  };
}

/**
 * Introspection result
 */
export interface IntrospectionResult {
  target: IntrospectionTarget;
  observed: Complex;          // What was actually seen
  clarity: number;            // How clear was the observation (0-1)
  distortion: number;         // How much noise/distortion
  entropyPaid: number;        // Cost of looking
  insight: boolean;           // Did we learn something?
  insightContent?: string;    // What was learned
}

/**
 * Perform introspection — look inward
 */
export function introspect(
  target: IntrospectionTarget,
  observerClarity: number = 0.7  // How good is the observer at self-observation
): IntrospectionResult {
  // Observation is imperfect — add noise based on depth and clarity
  const noise = (1 - observerClarity) * target.depth * 0.2;
  const noiseAngle = (Math.random() - 0.5) * Math.PI * noise;
  const noiseMag = 1 + (Math.random() - 0.5) * noise;

  const observed = Complex.fromPolar(
    target.content.magnitude * noiseMag,
    target.content.argument + noiseAngle
  );

  const clarity = observerClarity * (1 - target.depth * 0.3);
  const distortion = observed.distanceFrom(target.content);

  // Insight occurs when we see something unexpected about ourselves
  const selfSaliency = computeSaliency(observed, target.content);
  const insight = selfSaliency.grabsAttention && clarity > 0.5;

  let insightContent: string | undefined;
  if (insight) {
    if (selfSaliency.angularSaliency > selfSaliency.magnitudeSaliency) {
      insightContent = 'Orientation differs from expected';
    } else {
      insightContent = 'Magnitude differs from expected';
    }
  }

  return {
    target,
    observed,
    clarity,
    distortion,
    entropyPaid: target.cost,
    insight,
    insightContent
  };
}

// ============================================================
// THE ATTENTION LAYER
// ============================================================

/**
 * The complete Attention Layer
 *
 * Sits between stimulus and quantum layer.
 * Determines WHAT gets processed, not just that processing occurs.
 */
export class AttentionLayer {
  private focus: AttentionFocus;
  private history: AttentionTarget[] = [];
  private introspectionHistory: IntrospectionResult[] = [];
  private totalEntropySpent: number = 0;
  private currentGoal: EndogenousSignal | null = null;

  constructor() {
    this.focus = createFocus([]);
  }

  /**
   * Process an incoming stimulus
   *
   * Computes saliency, combines with goals, updates focus
   */
  attend(
    stimulus: Complex,
    expected: Complex = MU,
    goalRelevance: number = 0.5
  ): {
    attended: boolean;
    focus: AttentionFocus;
    signal: AttentionSignal;
  } {
    // Compute saliency
    const saliency = computeSaliency(stimulus, expected);

    // Create exogenous signal if salient
    const exogenous: ExogenousSignal | null = saliency.grabsAttention
      ? {
          stimulus,
          saliency,
          urgency: saliency.totalSaliency,
          interruptStrength: saliency.totalSaliency * 0.8
        }
      : null;

    // Use current goal as endogenous signal
    const endogenous = this.currentGoal;

    // Combine signals
    const signal = combineSignals(exogenous, endogenous);

    // Create target from resultant
    const target = createTarget(
      `target_${Date.now()}`,
      exogenous ? 'external' : 'prediction',
      signal.resultant,
      saliency.totalSaliency,
      goalRelevance
    );

    // Update focus
    const newTargets = [...this.focus.targets, target]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, ATTENTION_CAPACITY);

    this.focus = createFocus(newTargets);
    this.totalEntropySpent += this.focus.entropySpent;

    // Record in history
    this.history.push(target);
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }

    return {
      attended: saliency.grabsAttention || goalRelevance > 0.5,
      focus: this.focus,
      signal
    };
  }

  /**
   * Set a goal for endogenous attention
   */
  setGoal(target: Complex, goal: string, relevance: number = 0.7): void {
    this.currentGoal = {
      target,
      goal,
      relevance,
      persistence: 0.8,
      cost: 0.1
    };
  }

  /**
   * Clear the current goal
   */
  clearGoal(): void {
    this.currentGoal = null;
  }

  /**
   * Look inward — introspection
   */
  lookInward(
    currentPosition: Complex,
    type: 'state' | 'history' | 'self-model' = 'state',
    depth: number = 0.5
  ): IntrospectionResult {
    let target: IntrospectionTarget;

    switch (type) {
      case 'history':
        // Look at recent history
        const recent = this.history[this.history.length - 1];
        target = introspectHistory(
          recent?.content || currentPosition,
          recent ? Date.now() - recent.timestamp : 0,
          depth
        );
        break;

      case 'self-model':
        target = introspectSelf(currentPosition, depth);
        break;

      case 'state':
      default:
        target = introspectState(currentPosition, depth);
    }

    const result = introspect(target);
    this.introspectionHistory.push(result);
    this.totalEntropySpent += result.entropyPaid;

    // If insight occurred, it can become a new attention target
    if (result.insight) {
      const insightTarget = createTarget(
        `insight_${Date.now()}`,
        'self',
        result.observed,
        0.7, // Insights are moderately salient
        0.8  // But highly relevant
      );
      this.focus = createFocus([...this.focus.targets, insightTarget]);
    }

    return result;
  }

  /**
   * Decay attention — what's not maintained fades
   */
  decay(deltaTime: number = 1): void {
    const decayFactor = Math.exp(-ATTENTION_DECAY * deltaTime);

    const decayedTargets = this.focus.targets
      .map(t => ({
        ...t,
        priority: t.priority * decayFactor,
        saliency: t.saliency * decayFactor
      }))
      .filter(t => t.priority > 0.1);

    this.focus = createFocus(decayedTargets);
  }

  /**
   * Get the current attention state
   */
  getState(): {
    focus: AttentionFocus;
    currentGoal: EndogenousSignal | null;
    historySize: number;
    totalEntropySpent: number;
    introspectionCount: number;
    insightCount: number;
  } {
    return {
      focus: this.focus,
      currentGoal: this.currentGoal,
      historySize: this.history.length,
      totalEntropySpent: this.totalEntropySpent,
      introspectionCount: this.introspectionHistory.length,
      insightCount: this.introspectionHistory.filter(r => r.insight).length
    };
  }

  /**
   * Get attention history for learning
   */
  getHistory(): readonly AttentionTarget[] {
    return this.history;
  }

  /**
   * Get introspection history
   */
  getIntrospectionHistory(): readonly IntrospectionResult[] {
    return this.introspectionHistory;
  }

  /**
   * Get the amplified version of a stimulus based on attention
   *
   * This is what gets passed to the quantum layer:
   * attended stimuli are AMPLIFIED, unattended are SUPPRESSED
   */
  amplify(stimulus: Complex): {
    amplified: Complex;
    gain: number;
    suppressed: boolean;
  } {
    // How aligned is stimulus with current focus?
    const focusAlignment = this.focus.targets.reduce((sum, t) => {
      const dot = stimulus.re * t.content.re + stimulus.im * t.content.im;
      return sum + dot / (stimulus.magnitude * t.content.magnitude + 0.001) * t.priority;
    }, 0);

    const totalPriority = this.focus.targets.reduce((s, t) => s + t.priority, 0);
    const normalizedAlignment = totalPriority > 0 ? focusAlignment / totalPriority : 0;

    // Gain: amplify aligned, suppress misaligned
    // Range: 0.3 (suppressed) to 2.0 (amplified)
    const gain = 0.3 + 1.7 * ((normalizedAlignment + 1) / 2);

    const amplified = stimulus.scale(gain);
    const suppressed = gain < 0.7;

    return { amplified, gain, suppressed };
  }
}

// ============================================================
// ATTENTION METRICS
// ============================================================

/**
 * Metrics about attention performance
 */
export interface AttentionMetrics {
  focusDepth: number;           // How concentrated is attention
  focusStability: number;       // How stable over time
  introspectiveRatio: number;   // How much inward vs outward
  insightRate: number;          // Insights per introspection
  entropyEfficiency: number;    // Value gained per entropy spent
  goalAlignment: number;        // How well attention serves goals
}

/**
 * Compute attention metrics from layer state
 */
export function computeAttentionMetrics(
  layer: AttentionLayer
): AttentionMetrics {
  const state = layer.getState();
  const history = layer.getHistory();
  const introHistory = layer.getIntrospectionHistory();

  // Focus depth: inverse of spread
  const focusDepth = 1 - state.focus.spread;

  // Focus stability: how consistent is the focus center over history
  let stabilitySum = 0;
  if (history.length >= 2) {
    for (let i = 1; i < Math.min(history.length, 10); i++) {
      const dist = history[i].content.distanceFrom(history[i-1].content);
      stabilitySum += Math.exp(-dist);
    }
    stabilitySum /= Math.min(history.length - 1, 9);
  } else {
    stabilitySum = 1;
  }
  const focusStability = stabilitySum;

  // Introspective ratio
  const internalTargets = history.filter(t =>
    t.type === 'internal' || t.type === 'self' || t.type === 'memory'
  ).length;
  const introspectiveRatio = history.length > 0 ? internalTargets / history.length : 0;

  // Insight rate
  const insightRate = introHistory.length > 0
    ? state.insightCount / introHistory.length
    : 0;

  // Entropy efficiency: total activation / entropy spent
  const entropyEfficiency = state.totalEntropySpent > 0
    ? state.focus.totalActivation / state.totalEntropySpent
    : 1;

  // Goal alignment
  let goalAlignment = 0.5;
  if (state.currentGoal && state.focus.targets.length > 0) {
    const goalTarget = state.currentGoal.target;
    let alignmentSum = 0;
    for (const target of state.focus.targets) {
      const dot = target.content.re * goalTarget.re + target.content.im * goalTarget.im;
      alignmentSum += dot / (target.content.magnitude * goalTarget.magnitude + 0.001);
    }
    goalAlignment = (alignmentSum / state.focus.targets.length + 1) / 2;
  }

  return {
    focusDepth,
    focusStability,
    introspectiveRatio,
    insightRate,
    entropyEfficiency,
    goalAlignment
  };
}

// ============================================================
// ATTENTION LEARNING SIGNALS
// ============================================================

/**
 * Learning signal from attention — what was worth attending to?
 *
 * This is what the demon uses to improve its bias:
 * - Which attended items led to successful cycles?
 * - Which introspections yielded insights?
 * - What patterns predict high-value attention?
 */
export interface AttentionLearningSignal {
  target: AttentionTarget;
  outcomeValue: number;       // How valuable was attending to this
  predictionError: number;    // How surprising was the outcome
  shouldRepeat: boolean;      // Should we attend to similar things?
  featureVector: number[];    // Features for learning
}

/**
 * Generate learning signal from attention outcome
 */
export function generateLearningSignal(
  target: AttentionTarget,
  cycleSuccessful: boolean,
  coherenceAchieved: number,
  experienceWeight: number
): AttentionLearningSignal {
  // Outcome value: combination of success, coherence, and experience weight
  const outcomeValue = (cycleSuccessful ? 0.5 : 0) +
                       coherenceAchieved * 0.3 +
                       (experienceWeight / 10) * 0.2;

  // Prediction error: how different was outcome from expected?
  // High saliency items should have had high value if we attended correctly
  const expectedValue = target.saliency * 0.5 + target.relevance * 0.5;
  const predictionError = Math.abs(outcomeValue - expectedValue);

  // Should repeat: if outcome exceeded expectations
  const shouldRepeat = outcomeValue > expectedValue;

  // Feature vector for learning
  const featureVector = [
    target.saliency,
    target.relevance,
    target.priority,
    target.content.magnitude,
    target.content.argument / Math.PI, // Normalize to [-1, 1]
    target.type === 'external' ? 1 : 0,
    target.type === 'internal' ? 1 : 0,
    target.type === 'self' ? 1 : 0,
    MODALITY_NAMES.indexOf(target.modality) / 8
  ];

  return {
    target,
    outcomeValue,
    predictionError,
    shouldRepeat,
    featureVector
  };
}

/**
 * Batch learning signals from attention history
 */
export function batchLearningSignals(
  history: readonly AttentionTarget[],
  outcomes: Array<{
    successful: boolean;
    coherence: number;
    weight: number;
  }>
): AttentionLearningSignal[] {
  const signals: AttentionLearningSignal[] = [];

  const minLength = Math.min(history.length, outcomes.length);
  for (let i = 0; i < minLength; i++) {
    signals.push(generateLearningSignal(
      history[i],
      outcomes[i].successful,
      outcomes[i].coherence,
      outcomes[i].weight
    ));
  }

  return signals;
}
