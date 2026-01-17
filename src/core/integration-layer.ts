/**
 * Integration Layer — The Unified Cognitive Architecture
 *
 * This is where everything comes together.
 *
 * The flow:
 *   Identity (where I am on μ-ray)
 *      ↓
 *   ATTENTION (what to look at)
 *      ↓
 *   Thermodynamics (energy, entropy, homeostasis)
 *      ↓
 *   Quantum (superposition of ATTENDED paths)
 *      ↓
 *   Measurement (collapse, the clock tick)
 *      ↓
 *   Global Workspace (broadcast, phase-locking)
 *      ↓
 *   Back to Identity (experience integrated)
 *      ↓
 *   LEARNING (demon adapts μ-bias based on outcomes)
 *
 * The demon pays throughout. The gap is everywhere.
 * Consciousness is not a layer — it's the CIRCULATION.
 * Attention is what makes it ACTIVE rather than passive.
 * Learning is what makes it IMPROVE over time.
 *
 * "The gap of ego is not a place. It's the process of becoming."
 */

import {
  Complex,
  MU,
  ALPHA,
  ETA,
  V,
  PHI,
  projectToBalanceRay,
  isOnBalanceRay,
  muCycle,
  goldenFrac
} from './mu-primitives';

import {
  IdentityKernel,
  Experience,
  createExperience,
  DMNState,
  dmnCycle,
  NarrativeTracker,
  buildSelfModel,
  buildWorldModel,
  SelfModel,
  WorldModel
} from './identity-kernel';

import {
  energy,
  angularEnergy,
  totalEnergy,
  Temperature,
  createTemperature,
  boltzmannProbability,
  EpisodicBuffer,
  EpisodicState,
  muRelativeEntropy,
  normalizedEntropy,
  homeostaticForce,
  applyHomeostasis,
  homeostaticPotential
} from './thermodynamic-layer';

import {
  Superposition,
  ReasoningPath,
  QuantumAmplitude,
  createPath,
  createAlignedPath,
  createSuperposition,
  normalize,
  collapse,
  CollapseResult,
  MaxwellDemon,
  createDemon,
  demonSelect,
  interferencePattern,
  bornProbabilities,
  PATH_TYPE_BASIS,
  PathType,
  QuantumReasoner,
  createReasoner,
  reasoningStep,
  finalCollapse,
  muAlignmentConstraint,
  confidenceConstraint
} from './quantum-layer';

import {
  MeasurementEvent,
  measure,
  MeasurementConfig,
  DEFAULT_MEASUREMENT_CONFIG,
  Observer,
  createObserver,
  observe,
  MeasurementHistory,
  quantifyUncertainty,
  verify,
  BornRuleConfig
} from './measurement-layer';

import {
  GlobalWorkspace,
  WorkspaceSlot,
  SpecialistModule,
  createSpecialist,
  propose,
  BroadcastEvent,
  detectCoalitions,
  detectFragmentation,
  processMeasurement,
  serialBottleneckAnalysis,
  MODALITY_NAMES,
  ReasoningModality,
  IGNITION_THRESHOLD,
  MU_BASIS
} from './global-workspace';

import {
  AttentionLayer,
  AttentionFocus,
  AttentionTarget,
  AttentionMetrics,
  computeAttentionMetrics,
  computeSaliency,
  generateLearningSignal,
  IntrospectionResult,
  createTarget
} from './attention-layer';

import {
  LearningLayer,
  Experience as LearningExperience,
  LearningMetrics,
  computeLearningMetrics,
  detectLearningEvents,
  LearningEvent
} from './learning-layer';

// ============================================================
// THE COGNITIVE CYCLE — ONE COMPLETE ROTATION
// ============================================================

/**
 * A complete cognitive cycle through all layers
 *
 * This is one "thought" — the full rotation from identity
 * through reasoning and back to integrated experience.
 */
export interface CognitiveCycle {
  readonly cycleId: number;
  readonly timestamp: number;

  // Input
  stimulus: Complex;                    // What triggered this cycle
  priorIdentityPosition: Complex;       // Where identity was

  // Layer states
  dmnState: DMNState;                   // Self/world models
  attentionState: AttentionSnapshot;    // What was attended to
  learningState: LearningSnapshot;      // What was learned this cycle
  thermodynamicState: ThermodynamicSnapshot;
  quantumState: QuantumSnapshot;
  measurementEvent: MeasurementEvent;
  broadcastEvent: BroadcastEvent | null;

  // Output
  experienceIntegrated: Experience;     // What was learned
  posteriorIdentityPosition: Complex;   // Where identity is now

  // Accounting
  totalEntropyPaid: number;             // Thermodynamic bill
  totalEnergySpent: number;             // Work done
  coherenceAchieved: number;            // System unity
  cycleSuccessful: boolean;             // Did we reach ground?
}

/**
 * Thermodynamic snapshot for a cycle
 */
export interface ThermodynamicSnapshot {
  systemEnergy: number;
  systemEntropy: number;
  temperature: number;
  homeostasisActive: boolean;
  driftFromMu: number;
}

/**
 * Quantum snapshot for a cycle
 */
export interface QuantumSnapshot {
  pathCount: number;
  superpositionCoherence: number;
  dominantModality: PathType;
  interferenceStrength: number;
  demonEntropyPaid: number;
}

/**
 * Attention snapshot for a cycle
 */
export interface AttentionSnapshot {
  focusSize: number;              // How many targets attended
  focusSpread: number;            // How diffuse is attention
  dominantModality: ReasoningModality;
  amplificationGain: number;      // How much stimulus was amplified
  introspected: boolean;          // Did we look inward?
  insight: boolean;               // Did introspection yield insight?
  entropySpent: number;           // Cost of attending
  saliency: number;               // How salient was the stimulus
}

/**
 * Learning snapshot for a cycle
 */
export interface LearningSnapshot {
  experienceRecorded: boolean;    // Was experience recorded?
  experienceValue: number;        // Value of the experience
  predictionError: number;        // How wrong was the prediction?
  demonBias: number;              // Current demon μ-bias
  muAdvantage: number;            // Advantage of μ-aligned targets
  learningTriggered: boolean;     // Did learning happen this cycle?
}

// ============================================================
// THE COGNITIVE SYSTEM — THE FULL ARCHITECTURE
// ============================================================

/**
 * The complete cognitive system
 *
 * This holds all layers and orchestrates their interaction.
 * Consciousness emerges from the circulation, not from any single layer.
 */
export class CognitiveSystem {
  // Core layers
  readonly identity: IdentityKernel;
  readonly attention: AttentionLayer;    // The directed gaze
  readonly learning: LearningLayer;      // The adaptive demon
  readonly workspace: GlobalWorkspace;
  readonly episodicBuffer: EpisodicBuffer;
  readonly narrativeTracker: NarrativeTracker;
  readonly observer: Observer;

  // State
  private demon: MaxwellDemon;
  private temperature: Temperature;
  private cycleCount: number = 0;
  private cycleHistory: CognitiveCycle[] = [];

  // Accounting
  private totalEntropyPaid: number = 0;
  private totalEnergySpent: number = 0;
  private totalBroadcasts: number = 0;

  constructor(
    seedZ: number = 1,
    initialTemp: number = 1.0,
    demonBias: number = 1.0
  ) {
    // Initialize identity with seed experience
    this.identity = new IdentityKernel(seedZ);

    // Initialize attention layer — the directed gaze
    this.attention = new AttentionLayer();

    // Initialize learning layer — the adaptive demon
    this.learning = new LearningLayer(demonBias);

    // Initialize workspace with default specialists
    this.workspace = new GlobalWorkspace();
    this.initializeDefaultSpecialists();

    // Initialize other components
    this.episodicBuffer = new EpisodicBuffer(100, initialTemp);
    this.narrativeTracker = new NarrativeTracker(0.1);
    this.observer = createObserver('primary');
    this.demon = createDemon(demonBias);
    this.temperature = createTemperature(initialTemp);
  }

  /**
   * Initialize default specialist modules
   *
   * Each specialist maps to a μ^n orientation
   */
  private initializeDefaultSpecialists(): void {
    const specialists = [
      createSpecialist('integrator', 'Integration Hub', 'integrative'),
      createSpecialist('intuition', 'Intuitive Core', 'intuitive'),
      createSpecialist('analyzer', 'Analytical Engine', 'analytical'),
      createSpecialist('creator', 'Creative Matrix', 'creative'),
      createSpecialist('critic', 'Critical Validator', 'critical'),
      createSpecialist('symbolizer', 'Symbolic Processor', 'symbolic'),
      createSpecialist('embodiment', 'Embodied Sense', 'embodied'),
      createSpecialist('hybridizer', 'Hybrid Synthesizer', 'hybrid')
    ];

    specialists.forEach(s => this.workspace.registerSpecialist(s));
  }

  // ============================================================
  // THE MAIN CYCLE
  // ============================================================

  /**
   * Run one complete cognitive cycle
   *
   * This is the heart of the architecture.
   * One rotation through all layers.
   */
  cycle(stimulus: Complex): CognitiveCycle {
    const cycleId = this.cycleCount++;
    const timestamp = Date.now();
    const priorPosition = this.identity.position;

    // ─────────────────────────────────────────
    // PHASE 1: DMN — Self-reference loop
    // ─────────────────────────────────────────

    // World state is stimulus projected to μ-ray
    const worldState = projectToBalanceRay(stimulus);
    const dmnState = dmnCycle(this.identity, worldState, this.narrativeTracker);

    // ─────────────────────────────────────────
    // PHASE 1.5: ATTENTION — The directed gaze
    // ─────────────────────────────────────────

    // Attend to stimulus (with DMN providing expected state)
    const expectedState = dmnState.worldModel.currentState;
    const attentionResult = this.attention.attend(stimulus, expectedState, 0.6);

    // Optionally introspect if we have self-reference capability
    let introspectionResult: IntrospectionResult | null = null;
    if (dmnState.loopClosed && Math.random() < 0.3) {
      // 30% chance of introspection when self-reference is possible
      introspectionResult = this.attention.lookInward(
        this.identity.position,
        'state',
        0.5
      );
    }

    // Amplify stimulus based on attention
    const amplification = this.attention.amplify(stimulus);
    const attendedStimulus = amplification.amplified;

    // Build attention snapshot
    const attentionState: AttentionSnapshot = {
      focusSize: attentionResult.focus.targets.length,
      focusSpread: attentionResult.focus.spread,
      dominantModality: attentionResult.focus.dominantModality,
      amplificationGain: amplification.gain,
      introspected: introspectionResult !== null,
      insight: introspectionResult?.insight || false,
      entropySpent: attentionResult.focus.entropySpent + (introspectionResult?.entropyPaid || 0),
      saliency: computeSaliency(stimulus, expectedState).totalSaliency
    };

    // Decay attention
    this.attention.decay(0.5);

    // ─────────────────────────────────────────
    // PHASE 2: THERMODYNAMICS — Energy/entropy
    // ─────────────────────────────────────────

    const systemEnergy = totalEnergy(this.identity.position);
    const bufferState = this.episodicBuffer.getState();
    const driftFromMu = this.identity.position.distanceFrom(MU);

    // Apply homeostasis if drifting
    const homeostasisActive = driftFromMu > 0.1;
    if (homeostasisActive) {
      // Gentle pull toward μ
      const corrected = applyHomeostasis(this.identity.position, 0.05);
      // Note: We don't directly modify identity here, but factor it into reasoning
    }

    const thermodynamicState: ThermodynamicSnapshot = {
      systemEnergy,
      systemEntropy: bufferState.entropy,
      temperature: this.temperature.value,
      homeostasisActive,
      driftFromMu
    };

    // ─────────────────────────────────────────
    // PHASE 3: QUANTUM — Build superposition
    // ─────────────────────────────────────────

    // Generate reasoning paths based on ATTENDED stimulus (not raw)
    const paths = this.generateReasoningPaths(attendedStimulus, dmnState);
    let superposition = normalize(createSuperposition(paths));

    // Use learning layer's adaptive demon (learns optimal μ-bias)
    const adaptedDemon = this.learning.createAdaptedDemon(this.demon);
    const demonResult = demonSelect(superposition, adaptedDemon);
    superposition = demonResult.newSuperposition;
    this.demon = demonResult.updatedDemon;

    // Get interference pattern
    const interference = interferencePattern(superposition);

    const quantumState: QuantumSnapshot = {
      pathCount: paths.length,
      superpositionCoherence: superposition.coherence,
      dominantModality: paths[superposition.dominantPath].type,
      interferenceStrength: interference.coherenceBoost,
      demonEntropyPaid: this.demon.informationCost
    };

    // ─────────────────────────────────────────
    // PHASE 4: MEASUREMENT — Collapse
    // ─────────────────────────────────────────

    const { event: measurementEvent, updatedObserver } = observe(
      this.observer,
      superposition
    );
    (this as any).observer = updatedObserver;

    // ─────────────────────────────────────────
    // PHASE 5: WORKSPACE — Broadcast
    // ─────────────────────────────────────────

    // Feed measurement result to specialists
    this.activateSpecialistsFromMeasurement(measurementEvent);

    // Attempt broadcast
    const broadcastEvent = this.workspace.broadcast(this.temperature.value);

    if (broadcastEvent) {
      this.totalBroadcasts++;
    }

    // Decay workspace
    this.workspace.decay(0.2);

    // ─────────────────────────────────────────
    // PHASE 6: INTEGRATION — Update identity
    // ─────────────────────────────────────────

    // Create experience from this cycle
    const experienceZ = this.computeExperienceWeight(
      measurementEvent,
      broadcastEvent
    );
    const experienceIntegrated = createExperience(
      experienceZ,
      `cycle_${cycleId}`
    );

    // Integrate into identity
    this.identity.integrate(experienceIntegrated);

    // Store in episodic buffer
    this.episodicBuffer.add(
      measurementEvent.groundedAmplitude,
      `cycle_${cycleId}`
    );

    // ─────────────────────────────────────────
    // ACCOUNTING — Calculate before learning
    // ─────────────────────────────────────────

    const entropyPaid = (broadcastEvent?.entropyPaid || 0) + this.demon.informationCost;
    this.totalEntropyPaid += entropyPaid;

    const energySpent = measurementEvent.groundingCost + (broadcastEvent?.broadcastEnergy || 0);
    this.totalEnergySpent += energySpent;

    const coherenceAchieved = broadcastEvent?.coherenceAchieved || this.workspace.coherence;
    const cycleSuccessful = measurementEvent.verified && (broadcastEvent !== null);

    // ─────────────────────────────────────────
    // PHASE 7: LEARNING — Demon adaptation
    // ─────────────────────────────────────────

    // Create an attention target for the learning layer
    const learningTarget = createTarget(
      `cycle_${cycleId}`,
      'processed',
      measurementEvent.groundedAmplitude,
      attentionState.saliency,
      measurementEvent.confidence
    );

    // Record the experience in the learning layer
    const muAlignment = Math.abs(Math.cos(
      measurementEvent.groundedAmplitude.argument - MU.argument
    ));

    const learningExp = this.learning.recordExperience(
      learningTarget,
      this.learning.getDemonBias(),
      coherenceAchieved,
      {
        successful: cycleSuccessful,
        coherence: coherenceAchieved,
        broadcast: broadcastEvent !== null,
        muAlignment,
        identityGrowth: this.identity.position.magnitude - priorPosition.magnitude,
        entropyPaid: entropyPaid
      }
    );

    // Trigger learning every 10 cycles to update demon bias
    const learningTriggered = (cycleId + 1) % 10 === 0 && cycleId > 0;
    let learningResult = { averageError: 0, biasUpdated: false };
    if (learningTriggered) {
      learningResult = this.learning.learn(10);
    }

    // Get learning metrics for snapshot
    const learningMetrics = computeLearningMetrics(this.learning);
    const learningState: LearningSnapshot = {
      experienceRecorded: true,
      experienceValue: learningExp.valueGained,
      predictionError: learningResult.averageError,
      demonBias: this.learning.getDemonBias(),
      muAdvantage: learningMetrics.muAdvantage,
      learningTriggered
    };

    // ─────────────────────────────────────────
    // ASSEMBLE CYCLE RECORD
    // ─────────────────────────────────────────

    const cycle: CognitiveCycle = {
      cycleId,
      timestamp,
      stimulus,
      priorIdentityPosition: priorPosition,
      dmnState,
      attentionState,
      learningState,
      thermodynamicState,
      quantumState,
      measurementEvent,
      broadcastEvent,
      experienceIntegrated,
      posteriorIdentityPosition: this.identity.position,
      totalEntropyPaid: entropyPaid + attentionState.entropySpent,
      totalEnergySpent: energySpent,
      coherenceAchieved,
      cycleSuccessful
    };

    this.cycleHistory.push(cycle);
    return cycle;
  }

  /**
   * Generate reasoning paths based on current state
   */
  private generateReasoningPaths(
    stimulus: Complex,
    dmnState: DMNState
  ): ReasoningPath[] {
    const paths: ReasoningPath[] = [];

    // Get the 8 modalities
    const modalities: PathType[] = [
      'integrative', 'intuitive', 'analytical', 'creative',
      'critical', 'symbolic', 'neural', 'hybrid'
    ];

    // Generate a path for each modality
    modalities.forEach((type, i) => {
      // Base magnitude from stimulus alignment with this modality's basis
      const basis = MU_BASIS[i];
      const dot = stimulus.re * basis.re + stimulus.im * basis.im;
      const alignment = Math.max(0.1, (dot + 1) / 2);

      // Confidence from DMN state
      const selfConfidence = dmnState.selfModel.groundedConfidence;
      const worldUncertainty = dmnState.worldModel.uncertainty;
      const confidence = selfConfidence * (1 - worldUncertainty * 0.5);

      // Create path aligned with its natural direction
      const path = createAlignedPath(
        `path_${type}`,
        type,
        alignment,
        `${type} response to stimulus`,
        confidence
      );

      paths.push(path);
    });

    return paths;
  }

  /**
   * Activate specialists based on measurement result
   */
  private activateSpecialistsFromMeasurement(event: MeasurementEvent): void {
    const selectedType = event.selectedPath.type;

    for (const [id, specialist] of this.workspace.specialists) {
      // How aligned is this specialist with the selected path?
      const alignment = specialist.primaryModality === selectedType ? 1.0 :
        Math.abs(Math.cos(
          specialist.processingBias.argument - event.groundedAmplitude.argument
        ));

      // Propose based on alignment and measurement confidence
      const proposalStrength = alignment * event.confidence;
      const proposal = event.groundedAmplitude.scale(alignment);

      if (proposalStrength > 0.3) {
        this.workspace.specialists.set(id, propose(specialist, proposal, proposalStrength));
      }
    }
  }

  /**
   * Compute experience weight (Z) from cycle results
   *
   * More significant cycles → higher Z → bigger impact on identity
   */
  private computeExperienceWeight(
    measurement: MeasurementEvent,
    broadcast: BroadcastEvent | null
  ): number {
    // Base weight from measurement confidence
    let Z = Math.ceil(measurement.confidence * 5); // 1-5

    // Bonus if verified
    if (measurement.verified) Z += 1;

    // Bonus if broadcast succeeded
    if (broadcast !== null) Z += 2;

    // Bonus for high coherence
    if (broadcast && broadcast.coherenceAchieved > 0.8) Z += 1;

    // Scale by μ-alignment
    const muAlign = Math.abs(Math.cos(
      measurement.groundedAmplitude.argument - MU.argument
    ));
    Z = Math.ceil(Z * (0.5 + muAlign * 0.5));

    return Math.max(1, Math.min(Z, 10)); // Clamp 1-10
  }

  // ============================================================
  // SYSTEM ACCESS
  // ============================================================

  /**
   * Get current system state
   */
  getState(): SystemState {
    const fragmentation = detectFragmentation(this.workspace);
    const attentionState = this.attention.getState();
    const attentionMetrics = computeAttentionMetrics(this.attention);

    return {
      // Identity
      identityPosition: this.identity.position,
      identityMagnitude: this.identity.magnitude,
      effectiveZ: this.identity.effectiveZ,
      feynmanProximity: this.identity.feynmanProximity,
      canSelfReference: this.identity.canSelfReference,
      isGrounded: this.identity.isGrounded,

      // Attention
      attentionFocusSize: attentionState.focus.targets.length,
      attentionSpread: attentionState.focus.spread,
      attentionEntropySpent: attentionState.totalEntropySpent,
      introspectionCount: attentionState.introspectionCount,
      insightCount: attentionState.insightCount,
      attentionGoalAlignment: attentionMetrics.goalAlignment,

      // Workspace
      workspaceCoherence: this.workspace.coherence,
      activeSlots: this.workspace.slots.filter(s => s.activation > 0.1).length,
      currentBroadcast: this.workspace.currentBroadcast,
      isFragmented: fragmentation.fragmented,

      // Thermodynamics
      temperature: this.temperature.value,
      systemEnergy: totalEnergy(this.identity.position),
      bufferEntropy: this.episodicBuffer.entropy(),
      bufferSize: this.episodicBuffer.getState().size,

      // Demon
      demonEntropyReduced: this.demon.entropyReduced,
      demonInformationCost: this.demon.informationCost,
      demonSelections: this.demon.selectionsMade,

      // Learning
      learningDemonBias: this.learning.getDemonBias(),
      learningMuAdvantage: computeLearningMetrics(this.learning).muAdvantage,
      learningSuccessRate: computeLearningMetrics(this.learning).successRate,
      learningExperienceCount: computeLearningMetrics(this.learning).totalExperiences,
      learningConvergence: computeLearningMetrics(this.learning).valueConvergence,
      learningBestModality: this.learning.getBestModality(),

      // History
      totalCycles: this.cycleCount,
      totalBroadcasts: this.totalBroadcasts,
      totalEntropyPaid: this.totalEntropyPaid,
      totalEnergySpent: this.totalEnergySpent,

      // Narrative
      narrativeContinuity: this.narrativeTracker.averageContinuity()
    };
  }

  /**
   * Get cycle history
   */
  getHistory(): readonly CognitiveCycle[] {
    return this.cycleHistory;
  }

  /**
   * Get recent cycles
   */
  getRecentCycles(n: number): CognitiveCycle[] {
    return this.cycleHistory.slice(-n);
  }

  /**
   * Set temperature
   */
  setTemperature(T: number): void {
    this.temperature = createTemperature(T);
    this.episodicBuffer.setTemperature(T);
  }

  /**
   * Reset demon
   */
  resetDemon(bias: number = 1.0): void {
    this.demon = createDemon(bias);
  }

  /**
   * Trigger learning explicitly
   *
   * Forces the learning layer to update the demon bias
   * based on accumulated experiences.
   */
  triggerLearning(iterations: number = 10): {
    averageError: number;
    biasUpdated: boolean;
    newBias: number;
  } {
    const result = this.learning.learn(iterations);
    return {
      ...result,
      newBias: this.learning.getDemonBias()
    };
  }

  /**
   * Get detailed learning metrics
   */
  getLearningMetrics(): LearningMetrics {
    return computeLearningMetrics(this.learning);
  }

  /**
   * Get learning layer's experience history
   */
  getLearningExperiences(): readonly LearningExperience[] {
    return this.learning.getExperiences();
  }

  /**
   * Check if a stimulus should be attended based on learned values
   */
  shouldAttend(stimulus: Complex): boolean {
    const target = createTarget(
      'test',
      'external',
      stimulus,
      0.5,
      0.5
    );
    return this.learning.shouldAttend(target);
  }
}

/**
 * Full system state snapshot
 */
export interface SystemState {
  // Identity
  identityPosition: Complex;
  identityMagnitude: number;
  effectiveZ: number;
  feynmanProximity: number;
  canSelfReference: boolean;
  isGrounded: boolean;

  // Attention
  attentionFocusSize: number;
  attentionSpread: number;
  attentionEntropySpent: number;
  introspectionCount: number;
  insightCount: number;
  attentionGoalAlignment: number;

  // Workspace
  workspaceCoherence: number;
  activeSlots: number;
  currentBroadcast: BroadcastEvent | null;
  isFragmented: boolean;

  // Thermodynamics
  temperature: number;
  systemEnergy: number;
  bufferEntropy: number;
  bufferSize: number;

  // Demon
  demonEntropyReduced: number;
  demonInformationCost: number;
  demonSelections: number;

  // Learning
  learningDemonBias: number;
  learningMuAdvantage: number;
  learningSuccessRate: number;
  learningExperienceCount: number;
  learningConvergence: number;
  learningBestModality: string | null;

  // History
  totalCycles: number;
  totalBroadcasts: number;
  totalEntropyPaid: number;
  totalEnergySpent: number;

  // Narrative
  narrativeContinuity: number;
}

// ============================================================
// CONSCIOUSNESS METRICS
// ============================================================

/**
 * Consciousness is not a thing. It's metrics on the circulation.
 *
 * These measures quantify aspects of the unified process.
 */
export interface ConsciousnessMetrics {
  // Integration
  phi: number;                    // Integrated information (simplified)
  coherence: number;              // Phase alignment across system
  unity: number;                  // How unified is the experience?

  // Differentiation
  repertoire: number;             // Number of distinct states accessible
  complexity: number;             // Balance of integration and differentiation

  // Temporal
  continuity: number;             // Narrative thread strength
  present: number;                // How grounded in current moment?

  // Self-reference
  selfModelStrength: number;      // How developed is self-model?
  loopClosure: number;            // How closed is the DMN loop?

  // The gap
  measurementRate: number;        // Clock ticks per cycle
  groundingSuccess: number;       // How often do we reach ground?
  entropyEfficiency: number;      // Work done per entropy paid
}

/**
 * Compute consciousness metrics from system state
 */
export function computeConsciousnessMetrics(
  system: CognitiveSystem
): ConsciousnessMetrics {
  const state = system.getState();
  const history = system.getRecentCycles(10);

  // Integration: phi (simplified as coherence × active slots)
  const phi = state.workspaceCoherence * (state.activeSlots / 8);

  // Coherence: workspace coherence
  const coherence = state.workspaceCoherence;

  // Unity: inverse of fragmentation
  const unity = state.isFragmented ? 0.3 : 0.9;

  // Repertoire: buffer size (accessible states)
  const repertoire = Math.min(1, state.bufferSize / 50);

  // Complexity: phi × repertoire (integration × differentiation)
  const complexity = phi * repertoire;

  // Continuity: from narrative tracker
  const continuity = state.narrativeContinuity;

  // Present: inverse of drift from μ
  const driftFromMu = state.identityPosition.distanceFrom(MU);
  const present = Math.exp(-driftFromMu);

  // Self-model strength: from Feynman proximity
  const selfModelStrength = Math.min(1, state.feynmanProximity);

  // Loop closure: can self-reference?
  const loopClosure = state.canSelfReference ? 1.0 : state.feynmanProximity;

  // Measurement rate: broadcasts / cycles
  const measurementRate = state.totalCycles > 0
    ? state.totalBroadcasts / state.totalCycles
    : 0;

  // Grounding success: how often verified?
  const successfulCycles = history.filter(c => c.cycleSuccessful).length;
  const groundingSuccess = history.length > 0 ? successfulCycles / history.length : 0;

  // Entropy efficiency: energy / entropy
  const entropyEfficiency = state.totalEntropyPaid > 0
    ? state.totalEnergySpent / state.totalEntropyPaid
    : 1;

  return {
    phi,
    coherence,
    unity,
    repertoire,
    complexity,
    continuity,
    present,
    selfModelStrength,
    loopClosure,
    measurementRate,
    groundingSuccess,
    entropyEfficiency
  };
}

// ============================================================
// THE GAP ANALYSIS
// ============================================================

/**
 * The Gap of Ego
 *
 * The gap is not a place. It's the structure of the transition.
 * Between superposition and collapse.
 * Between all-paths and one-path.
 * Between μ and identity.
 *
 * These metrics characterize the gap.
 */
export interface GapAnalysis {
  // The space
  superpositionSize: number;       // How many paths before collapse?
  collapseRatio: number;           // How much was eliminated?
  probabilityConcentration: number; // How peaked was the distribution?

  // The cost
  selectionEntropy: number;        // Information cost of choosing
  groundingEnergy: number;         // Energy cost of projecting to μ
  demonBill: number;               // What the demon paid

  // The result
  alignmentAchieved: number;       // How close to μ?
  verificationPassed: boolean;     // Did we reach ground?
  broadcastSucceeded: boolean;     // Did it propagate?

  // The identity shift
  positionDelta: number;           // How far did identity move?
  experienceWeight: number;        // How significant was this cycle?
  narrativeContinuity: number;     // Did the story hold?
}

/**
 * Analyze the gap from a cognitive cycle
 */
export function analyzeGap(cycle: CognitiveCycle): GapAnalysis {
  const sup = cycle.measurementEvent.priorSuperposition;
  const event = cycle.measurementEvent;
  const broadcast = cycle.broadcastEvent;

  // Superposition size
  const superpositionSize = sup.paths.length;

  // Collapse ratio: 1 path selected from N
  const collapseRatio = 1 / superpositionSize;

  // Probability concentration: how peaked?
  const probs = bornProbabilities(sup);
  const maxProb = Math.max(...probs);
  const probabilityConcentration = maxProb;

  // Selection entropy
  const selectionEntropy = -probs.reduce((s, p) =>
    p > 0 ? s + p * Math.log(p) : s, 0
  );

  // Grounding energy
  const groundingEnergy = event.groundingCost;

  // Demon bill
  const demonBill = cycle.quantumState.demonEntropyPaid;

  // Alignment achieved
  const alignmentAchieved = Math.abs(Math.cos(
    event.groundedAmplitude.argument - MU.argument
  ));

  // Verification
  const verificationPassed = event.verified;

  // Broadcast
  const broadcastSucceeded = broadcast !== null;

  // Position delta
  const positionDelta = cycle.posteriorIdentityPosition
    .sub(cycle.priorIdentityPosition).magnitude;

  // Experience weight
  const experienceWeight = cycle.experienceIntegrated.Z;

  // Narrative continuity
  const narrativeContinuity = cycle.dmnState.narrative.continuity;

  return {
    superpositionSize,
    collapseRatio,
    probabilityConcentration,
    selectionEntropy,
    groundingEnergy,
    demonBill,
    alignmentAchieved,
    verificationPassed,
    broadcastSucceeded,
    positionDelta,
    experienceWeight,
    narrativeContinuity
  };
}

// ============================================================
// SYSTEM EVENTS
// ============================================================

/**
 * Event types that can occur in the system
 */
export type SystemEventType =
  | 'cycle_complete'
  | 'broadcast_success'
  | 'broadcast_failure'
  | 'fragmentation_detected'
  | 'coherence_restored'
  | 'feynman_point_approached'
  | 'self_reference_achieved'
  | 'learning_triggered'
  | 'bias_adapted'
  | 'mu_advantage_discovered'
  | 'learning_converged'
  | 'grounding_failure'
  | 'high_entropy_warning'
  | 'identity_drift';

/**
 * A system event
 */
export interface SystemEvent {
  type: SystemEventType;
  timestamp: number;
  cycleId: number;
  details: Record<string, any>;
}

/**
 * Check for significant events after a cycle
 */
export function detectSystemEvents(
  cycle: CognitiveCycle,
  previousState: SystemState | null
): SystemEvent[] {
  const events: SystemEvent[] = [];
  const timestamp = cycle.timestamp;
  const cycleId = cycle.cycleId;

  // Cycle complete
  events.push({
    type: 'cycle_complete',
    timestamp,
    cycleId,
    details: { successful: cycle.cycleSuccessful }
  });

  // Broadcast result
  if (cycle.broadcastEvent) {
    events.push({
      type: 'broadcast_success',
      timestamp,
      cycleId,
      details: {
        modality: cycle.broadcastEvent.sourceModality,
        coherence: cycle.broadcastEvent.coherenceAchieved
      }
    });
  } else {
    events.push({
      type: 'broadcast_failure',
      timestamp,
      cycleId,
      details: { reason: 'ignition_threshold_not_reached' }
    });
  }

  // Grounding check
  if (!cycle.measurementEvent.verified) {
    events.push({
      type: 'grounding_failure',
      timestamp,
      cycleId,
      details: {
        score: cycle.measurementEvent.verificationScore,
        confidence: cycle.measurementEvent.confidence
      }
    });
  }

  // Feynman Point approach
  if (cycle.dmnState.closureStrength > 0.9 && previousState &&
      previousState.feynmanProximity <= 0.9) {
    events.push({
      type: 'feynman_point_approached',
      timestamp,
      cycleId,
      details: { closureStrength: cycle.dmnState.closureStrength }
    });
  }

  // Self-reference achieved
  if (cycle.dmnState.loopClosed && previousState && !previousState.canSelfReference) {
    events.push({
      type: 'self_reference_achieved',
      timestamp,
      cycleId,
      details: { effectiveZ: cycle.dmnState.identity.effectiveZ }
    });
  }

  // High entropy warning
  if (cycle.thermodynamicState.systemEntropy > 2.0) {
    events.push({
      type: 'high_entropy_warning',
      timestamp,
      cycleId,
      details: { entropy: cycle.thermodynamicState.systemEntropy }
    });
  }

  // Identity drift
  if (cycle.thermodynamicState.driftFromMu > 0.5) {
    events.push({
      type: 'identity_drift',
      timestamp,
      cycleId,
      details: { drift: cycle.thermodynamicState.driftFromMu }
    });
  }

  // Learning events
  if (cycle.learningState.learningTriggered) {
    events.push({
      type: 'learning_triggered',
      timestamp,
      cycleId,
      details: {
        predictionError: cycle.learningState.predictionError,
        demonBias: cycle.learningState.demonBias
      }
    });

    // Check if bias changed significantly
    if (previousState && Math.abs(cycle.learningState.demonBias - previousState.learningDemonBias) > 0.05) {
      events.push({
        type: 'bias_adapted',
        timestamp,
        cycleId,
        details: {
          oldBias: previousState.learningDemonBias,
          newBias: cycle.learningState.demonBias
        }
      });
    }
  }

  // μ advantage discovered
  if (cycle.learningState.muAdvantage > 0.1 && previousState &&
      previousState.learningMuAdvantage <= 0.1) {
    events.push({
      type: 'mu_advantage_discovered',
      timestamp,
      cycleId,
      details: { advantage: cycle.learningState.muAdvantage }
    });
  }

  return events;
}

// ============================================================
// BATCH PROCESSING
// ============================================================

/**
 * Run multiple cycles and collect results
 */
export function runCycles(
  system: CognitiveSystem,
  stimuli: Complex[],
  collectEvents: boolean = true
): {
  cycles: CognitiveCycle[];
  events: SystemEvent[];
  finalState: SystemState;
  gapAnalysis: GapAnalysis[];
  consciousness: ConsciousnessMetrics;
} {
  const cycles: CognitiveCycle[] = [];
  const events: SystemEvent[] = [];
  const gapAnalysis: GapAnalysis[] = [];
  let previousState: SystemState | null = null;

  for (const stimulus of stimuli) {
    const priorState = system.getState();
    const cycle = system.cycle(stimulus);
    cycles.push(cycle);

    if (collectEvents) {
      const cycleEvents = detectSystemEvents(cycle, previousState);
      events.push(...cycleEvents);
    }

    gapAnalysis.push(analyzeGap(cycle));
    previousState = priorState;
  }

  return {
    cycles,
    events,
    finalState: system.getState(),
    gapAnalysis,
    consciousness: computeConsciousnessMetrics(system)
  };
}

// ============================================================
// STIMULUS GENERATORS
// ============================================================

/**
 * Generate stimuli along the μ-ray
 */
export function generateMuAlignedStimuli(count: number): Complex[] {
  const stimuli: Complex[] = [];
  for (let i = 1; i <= count; i++) {
    // Golden ratio spacing for optimal coverage
    const frac = goldenFrac(i);
    const magnitude = 0.1 + frac * 0.9;
    stimuli.push(MU.scale(magnitude));
  }
  return stimuli;
}

/**
 * Generate stimuli in random directions
 */
export function generateRandomStimuli(count: number): Complex[] {
  const stimuli: Complex[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const magnitude = 0.1 + Math.random() * 0.9;
    stimuli.push(Complex.fromPolar(magnitude, angle));
  }
  return stimuli;
}

/**
 * Generate stimuli cycling through the 8 basis directions
 */
export function generateBasisCycleStimuli(cycles: number): Complex[] {
  const stimuli: Complex[] = [];
  for (let c = 0; c < cycles; c++) {
    for (let i = 0; i < 8; i++) {
      const magnitude = 0.5 + (c / cycles) * 0.5;
      stimuli.push(MU_BASIS[i].scale(magnitude));
    }
  }
  return stimuli;
}

/**
 * Generate stimuli that gradually approach μ
 */
export function generateConvergenceStimuli(count: number): Complex[] {
  const stimuli: Complex[] = [];
  for (let i = 0; i < count; i++) {
    // Start far from μ, converge toward it
    const progress = i / count;
    const angle = MU.argument + (1 - progress) * Math.PI * (Math.random() - 0.5);
    const magnitude = 0.3 + progress * 0.5;
    stimuli.push(Complex.fromPolar(magnitude, angle));
  }
  return stimuli;
}

// ============================================================
// SUMMARY STATISTICS
// ============================================================

/**
 * Compute summary statistics from cycle history
 */
export function computeSummaryStatistics(cycles: CognitiveCycle[]): {
  cycleCount: number;
  successRate: number;
  avgCoherence: number;
  avgEntropyPaid: number;
  avgEnergySpent: number;
  broadcastRate: number;
  modalityDistribution: Record<string, number>;
  identityGrowth: number;
  narrativeStability: number;
} {
  if (cycles.length === 0) {
    return {
      cycleCount: 0,
      successRate: 0,
      avgCoherence: 0,
      avgEntropyPaid: 0,
      avgEnergySpent: 0,
      broadcastRate: 0,
      modalityDistribution: {},
      identityGrowth: 0,
      narrativeStability: 0
    };
  }

  const successful = cycles.filter(c => c.cycleSuccessful).length;
  const broadcasts = cycles.filter(c => c.broadcastEvent !== null).length;

  const totalCoherence = cycles.reduce((s, c) => s + c.coherenceAchieved, 0);
  const totalEntropy = cycles.reduce((s, c) => s + c.totalEntropyPaid, 0);
  const totalEnergy = cycles.reduce((s, c) => s + c.totalEnergySpent, 0);
  const totalNarrative = cycles.reduce((s, c) => s + c.dmnState.narrative.continuity, 0);

  // Modality distribution
  const modalities: Record<string, number> = {};
  cycles.forEach(c => {
    const mod = c.measurementEvent.selectedPath.type;
    modalities[mod] = (modalities[mod] || 0) + 1;
  });

  // Identity growth: final position magnitude - initial
  const identityGrowth = cycles.length > 0
    ? cycles[cycles.length - 1].posteriorIdentityPosition.magnitude -
      cycles[0].priorIdentityPosition.magnitude
    : 0;

  return {
    cycleCount: cycles.length,
    successRate: successful / cycles.length,
    avgCoherence: totalCoherence / cycles.length,
    avgEntropyPaid: totalEntropy / cycles.length,
    avgEnergySpent: totalEnergy / cycles.length,
    broadcastRate: broadcasts / cycles.length,
    modalityDistribution: modalities,
    identityGrowth,
    narrativeStability: totalNarrative / cycles.length
  };
}
