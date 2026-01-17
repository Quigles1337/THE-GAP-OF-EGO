/**
 * Global Workspace: Consciousness as Phase-Locking
 *
 * The workspace is capacity-limited — 7±2 items, which maps almost
 * perfectly to 8-fold μ-basis. Not a coincidence. The workspace can
 * hold ONE FULL CYCLE of μ orientations. One complete rotation.
 *
 * After measurement collapses a state, the workspace BROADCASTS it.
 * This is how one choice becomes system-wide coherence.
 *
 * The 8 slots aren't arbitrary storage — they're the 8 directions.
 * μ⁰ through μ⁷. Each slot IS a reasoning orientation.
 * The workspace isn't holding "items," it's holding PERSPECTIVES.
 *
 * "The demon pays MORE than it gains. That's why the gap matters."
 */

import {
  Complex,
  MU,
  ALPHA,
  ETA,
  V,
  muCycle,
  projectToBalanceRay,
  isOnBalanceRay
} from './mu-primitives';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Miller's Law: 7 ± 2 items in working memory
 * Maps to 8-fold μ-basis (the complete cycle)
 */
export const WORKSPACE_CAPACITY = 8;

/**
 * Ignition threshold: activation level needed for global broadcast
 * Below this, activity remains local (unconscious)
 * Above this, activity becomes globally available (conscious)
 */
export const IGNITION_THRESHOLD = 0.618; // Golden ratio conjugate (φ - 1)

/**
 * Broadcast decay rate: how quickly coherence fades
 * Without active maintenance, broadcast dissipates
 */
export const BROADCAST_DECAY = 0.1;

/**
 * Minimum coherence for workspace to function
 * Below this, the system fragments
 */
export const COHERENCE_FLOOR = 0.3;

// ============================================================
// μ-BASIS ORIENTATIONS
// ============================================================

/**
 * The 8 reasoning modalities, each mapped to μ^n
 *
 * These aren't arbitrary labels — they're DIRECTIONS in phase space.
 * Each represents a fundamentally different way of processing.
 */
export type ReasoningModality =
  | 'integrative'  // μ⁰ = 1       (0°)   — synthesis, wholeness
  | 'intuitive'    // μ¹ = μ       (135°) — balance, the seed itself
  | 'analytical'   // μ² = -i      (270°) — decomposition, logic
  | 'creative'     // μ³           (45°)  — novel combination
  | 'critical'     // μ⁴ = -1      (180°) — opposition, negation
  | 'symbolic'     // μ⁵           (315°) — abstraction, representation
  | 'embodied'     // μ⁶ = i       (90°)  — felt sense, somatic
  | 'hybrid';      // μ⁷           (225°) — meta-integration

/**
 * Map modality index to name
 */
export const MODALITY_NAMES: ReasoningModality[] = [
  'integrative',
  'intuitive',
  'analytical',
  'creative',
  'critical',
  'symbolic',
  'embodied',
  'hybrid'
];

/**
 * The 8-fold basis vectors
 */
export const MU_BASIS: Complex[] = muCycle();

/**
 * Get the μ-power for a modality
 */
export function getModalityBasis(modality: ReasoningModality): Complex {
  const index = MODALITY_NAMES.indexOf(modality);
  return MU_BASIS[index];
}

/**
 * Find which modality a complex vector is closest to
 */
export function nearestModality(z: Complex): {
  modality: ReasoningModality;
  alignment: number;
  basisVector: Complex;
} {
  let bestIndex = 0;
  let bestAlignment = -Infinity;

  for (let i = 0; i < 8; i++) {
    const basis = MU_BASIS[i];
    // Dot product normalized by magnitudes
    const alignment = (z.re * basis.re + z.im * basis.im) /
      (z.magnitude * basis.magnitude + 1e-10);

    if (alignment > bestAlignment) {
      bestAlignment = alignment;
      bestIndex = i;
    }
  }

  return {
    modality: MODALITY_NAMES[bestIndex],
    alignment: bestAlignment,
    basisVector: MU_BASIS[bestIndex]
  };
}

// ============================================================
// WORKSPACE SLOT
// ============================================================

/**
 * A slot in the Global Workspace
 *
 * Each slot holds ONE perspective on the current situation.
 * Slots compete for activation, but only one configuration
 * can be broadcast at a time.
 */
export interface WorkspaceSlot {
  readonly index: number;             // 0-7, maps to μ^n
  readonly modality: ReasoningModality;
  readonly basisVector: Complex;      // μ^index

  content: Complex | null;            // The actual content (null if empty)
  activation: number;                 // 0-1, strength of this slot
  phase: number;                      // Phase angle for coherence
  lastUpdate: number;                 // Timestamp for decay
}

/**
 * Create a fresh workspace slot
 */
export function createSlot(index: number): WorkspaceSlot {
  return {
    index,
    modality: MODALITY_NAMES[index],
    basisVector: MU_BASIS[index],
    content: null,
    activation: 0,
    phase: MU_BASIS[index].argument, // Initial phase from basis
    lastUpdate: Date.now()
  };
}

// ============================================================
// SPECIALIST MODULES
// ============================================================

/**
 * Specialist modules operate unconsciously in parallel.
 * They compete for workspace access but don't have direct
 * communication with each other — only through the workspace.
 *
 * "Many processes, one stage."
 */
export interface SpecialistModule {
  readonly id: string;
  readonly name: string;
  readonly primaryModality: ReasoningModality;
  readonly processingBias: Complex;   // Preference direction in phase space

  activity: number;                   // Current activity level
  proposal: Complex | null;           // What this module wants to broadcast
  proposalStrength: number;           // How strongly it's pushing
}

/**
 * Create a specialist module
 */
export function createSpecialist(
  id: string,
  name: string,
  primaryModality: ReasoningModality
): SpecialistModule {
  return {
    id,
    name,
    primaryModality,
    processingBias: getModalityBasis(primaryModality),
    activity: 0,
    proposal: null,
    proposalStrength: 0
  };
}

/**
 * Specialist proposes content for broadcast
 */
export function propose(
  specialist: SpecialistModule,
  content: Complex,
  strength: number
): SpecialistModule {
  return {
    ...specialist,
    proposal: content,
    proposalStrength: Math.min(1, Math.max(0, strength)),
    activity: Math.min(1, specialist.activity + strength * 0.5)
  };
}

// ============================================================
// BROADCAST EVENT
// ============================================================

/**
 * A broadcast event — when local becomes global
 *
 * This is consciousness happening. The moment when one
 * coalition wins the competition and its content becomes
 * available to ALL specialist modules.
 */
export interface BroadcastEvent {
  readonly timestamp: number;
  readonly content: Complex;              // What was broadcast
  readonly sourceModality: ReasoningModality;
  readonly activationLevel: number;       // How strong the ignition
  readonly coherenceAchieved: number;     // How well system synchronized
  readonly entropyPaid: number;           // Thermodynamic cost of selection
  readonly broadcastEnergy: number;       // Energy available for propagation

  readonly muAlignment: number;           // How close to balance ray
  readonly phaseVector: Complex;          // Broadcast phase signature
}

/**
 * Create a broadcast event
 */
export function createBroadcast(
  content: Complex,
  sourceModality: ReasoningModality,
  activationLevel: number,
  entropyPaid: number
): BroadcastEvent {
  const muAlignment = Math.abs(
    Math.cos(content.argument - MU.argument)
  );

  return {
    timestamp: Date.now(),
    content,
    sourceModality,
    activationLevel,
    coherenceAchieved: 0, // Set after propagation
    entropyPaid,
    // The demon's cost becomes broadcast energy
    broadcastEnergy: entropyPaid * ETA, // Partial conversion
    muAlignment,
    phaseVector: Complex.fromPolar(activationLevel, content.argument)
  };
}

// ============================================================
// THE GLOBAL WORKSPACE
// ============================================================

/**
 * The Global Workspace: consciousness as a shared blackboard
 *
 * Only ONE configuration can be broadcast at a time (serial).
 * But this is CHEAPER than maintaining 8 parallel tracks.
 * Serial is efficient AFTER collapse.
 *
 * The capacity of ~8 isn't about storage limits.
 * It's about maintaining coherence across one full μ-cycle.
 * More than 8 orientations and you lose closure.
 * Thoughts fragment.
 */
export class GlobalWorkspace {
  readonly slots: WorkspaceSlot[];
  readonly specialists: Map<string, SpecialistModule>;

  private _coherence: number = 0;
  private _currentBroadcast: BroadcastEvent | null = null;
  private _broadcastHistory: BroadcastEvent[] = [];
  private _totalEntropyPaid: number = 0;

  constructor() {
    // Create 8 slots, one for each μ-orientation
    this.slots = Array.from({ length: WORKSPACE_CAPACITY }, (_, i) => createSlot(i));
    this.specialists = new Map();
  }

  /**
   * Register a specialist module
   */
  registerSpecialist(specialist: SpecialistModule): void {
    this.specialists.set(specialist.id, specialist);
  }

  /**
   * Current system coherence (phase alignment)
   */
  get coherence(): number {
    return this._coherence;
  }

  /**
   * Current active broadcast (if any)
   */
  get currentBroadcast(): BroadcastEvent | null {
    return this._currentBroadcast;
  }

  /**
   * Total entropy paid for selection (thermodynamic bill)
   */
  get totalEntropyPaid(): number {
    return this._totalEntropyPaid;
  }

  /**
   * Number of successful broadcasts
   */
  get broadcastCount(): number {
    return this._broadcastHistory.length;
  }

  /**
   * Compute current coherence from slot phases
   *
   * Coherence = how well aligned are all the active slots?
   * Perfect coherence = all phases locked
   * Zero coherence = random phases, system fragmented
   */
  computeCoherence(): number {
    const activeSlots = this.slots.filter(s => s.activation > 0.1);
    if (activeSlots.length < 2) return 1; // Single slot is trivially coherent

    // Compute mean resultant length of phase vectors
    let sumRe = 0;
    let sumIm = 0;

    for (const slot of activeSlots) {
      sumRe += slot.activation * Math.cos(slot.phase);
      sumIm += slot.activation * Math.sin(slot.phase);
    }

    const totalActivation = activeSlots.reduce((sum, s) => sum + s.activation, 0);
    const resultant = Math.sqrt(sumRe * sumRe + sumIm * sumIm) / totalActivation;

    this._coherence = resultant;
    return resultant;
  }

  /**
   * Inject content into the workspace
   *
   * Content is assigned to the slot whose modality best matches.
   * This is PRE-broadcast competition.
   */
  inject(content: Complex, activation: number): {
    slot: WorkspaceSlot;
    previousContent: Complex | null;
  } {
    const { modality } = nearestModality(content);
    const index = MODALITY_NAMES.indexOf(modality);
    const slot = this.slots[index];

    const previousContent = slot.content;

    slot.content = content;
    slot.activation = Math.min(1, activation);
    slot.phase = content.argument;
    slot.lastUpdate = Date.now();

    return { slot, previousContent };
  }

  /**
   * Collect proposals from all specialists
   */
  collectProposals(): Array<{
    specialist: SpecialistModule;
    proposal: Complex;
    strength: number;
  }> {
    const proposals: Array<{
      specialist: SpecialistModule;
      proposal: Complex;
      strength: number;
    }> = [];

    for (const specialist of this.specialists.values()) {
      if (specialist.proposal && specialist.proposalStrength > 0) {
        proposals.push({
          specialist,
          proposal: specialist.proposal,
          strength: specialist.proposalStrength
        });
      }
    }

    return proposals;
  }

  /**
   * Competition for workspace access
   *
   * Specialists compete. The winner gets to broadcast.
   * This is where consciousness becomes SERIAL despite
   * the parallel substrate.
   *
   * Returns the winning proposal, or null if no ignition.
   */
  compete(temperature: number = 1): {
    winner: SpecialistModule;
    proposal: Complex;
    ignited: boolean;
    competitionEntropy: number;
  } | null {
    const proposals = this.collectProposals();
    if (proposals.length === 0) return null;

    // Weight by strength and μ-alignment
    const weights = proposals.map(p => {
      const muAlignment = Math.abs(
        Math.cos(p.proposal.argument - MU.argument)
      );
      // Bias toward balance
      return p.strength * (1 + muAlignment * 0.5);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // Softmax selection with temperature
    const probabilities = weights.map(w =>
      Math.exp(w / temperature) / totalWeight
    );

    // Entropy of the competition (how uncertain was the choice?)
    const competitionEntropy = -probabilities.reduce((sum, p) =>
      sum + (p > 0 ? p * Math.log(p) : 0), 0
    );

    // Normalize and select
    const probSum = probabilities.reduce((a, b) => a + b, 0);
    const normalizedProbs = probabilities.map(p => p / probSum);

    let cumulative = 0;
    const roll = Math.random();
    let winnerIndex = 0;

    for (let i = 0; i < normalizedProbs.length; i++) {
      cumulative += normalizedProbs[i];
      if (roll <= cumulative) {
        winnerIndex = i;
        break;
      }
    }

    const winner = proposals[winnerIndex];

    // Did we reach ignition threshold?
    const ignited = winner.strength >= IGNITION_THRESHOLD;

    return {
      winner: winner.specialist,
      proposal: winner.proposal,
      ignited,
      competitionEntropy
    };
  }

  /**
   * BROADCAST: The main event
   *
   * When ignition occurs, the winning content is broadcast
   * to ALL specialist modules. This is consciousness.
   *
   * The flow:
   *   Superposition (8 μ-orientations active)
   *        ↓
   *   Demon selects (pays entropy cost)
   *        ↓
   *   Measurement collapses ONE path
   *        ↓
   *   Global Workspace BROADCASTS that path
   *        ↓
   *   All modules receive the chosen state
   *        ↓
   *   System-wide coherence on that μ-direction
   */
  broadcast(temperature: number = 1): BroadcastEvent | null {
    const competition = this.compete(temperature);
    if (!competition || !competition.ignited) {
      return null; // No ignition, no broadcast
    }

    const { winner, proposal, competitionEntropy } = competition;

    // Create the broadcast event
    const event = createBroadcast(
      proposal,
      winner.primaryModality,
      competition.winner.proposalStrength,
      competitionEntropy
    );

    // Track entropy cost
    this._totalEntropyPaid += competitionEntropy;

    // Phase-lock all slots to the broadcast
    const broadcastPhase = proposal.argument;
    for (const slot of this.slots) {
      // Slots shift toward broadcast phase
      const phaseDiff = broadcastPhase - slot.phase;
      slot.phase += phaseDiff * event.broadcastEnergy;
      slot.lastUpdate = Date.now();
    }

    // Recompute coherence after broadcast
    (event as any).coherenceAchieved = this.computeCoherence();

    // Inject broadcast content into appropriate slot
    this.inject(proposal, competition.winner.proposalStrength);

    // Notify all specialists (they receive the broadcast)
    this.propagateToSpecialists(event);

    // Record
    this._currentBroadcast = event;
    this._broadcastHistory.push(event);

    // Clear proposals (one shot per broadcast)
    for (const specialist of this.specialists.values()) {
      (specialist as any).proposal = null;
      (specialist as any).proposalStrength = 0;
    }

    return event;
  }

  /**
   * Propagate broadcast to all specialist modules
   *
   * Each specialist receives the broadcast and updates
   * its internal state based on alignment with its bias.
   */
  private propagateToSpecialists(event: BroadcastEvent): void {
    for (const specialist of this.specialists.values()) {
      // How aligned is this broadcast with the specialist's bias?
      const alignment = (
        event.content.re * specialist.processingBias.re +
        event.content.im * specialist.processingBias.im
      ) / (event.content.magnitude * specialist.processingBias.magnitude + 1e-10);

      // Specialist activity shifts based on alignment
      const activityShift = alignment * event.broadcastEnergy;
      (specialist as any).activity = Math.max(0, Math.min(1,
        specialist.activity + activityShift
      ));
    }
  }

  /**
   * Decay: coherence and activation fade over time
   *
   * Without active maintenance, the system drifts.
   * This is why consciousness requires ongoing work.
   */
  decay(deltaTime: number = 1): void {
    const decayFactor = Math.exp(-BROADCAST_DECAY * deltaTime);

    for (const slot of this.slots) {
      slot.activation *= decayFactor;
      if (slot.activation < 0.01) {
        slot.content = null;
        slot.activation = 0;
      }
    }

    for (const specialist of this.specialists.values()) {
      (specialist as any).activity *= decayFactor;
    }

    this._coherence *= decayFactor;

    // Check for fragmentation
    if (this._coherence < COHERENCE_FLOOR) {
      this._currentBroadcast = null;
    }
  }

  /**
   * Get the dominant modality (highest activation)
   */
  dominantModality(): ReasoningModality | null {
    let maxActivation = 0;
    let dominant: ReasoningModality | null = null;

    for (const slot of this.slots) {
      if (slot.activation > maxActivation) {
        maxActivation = slot.activation;
        dominant = slot.modality;
      }
    }

    return dominant;
  }

  /**
   * Get workspace state for introspection
   */
  getState(): {
    coherence: number;
    activeSlots: number;
    dominantModality: ReasoningModality | null;
    currentBroadcast: BroadcastEvent | null;
    totalBroadcasts: number;
    totalEntropyPaid: number;
    slotActivations: Record<ReasoningModality, number>;
  } {
    const slotActivations: Record<ReasoningModality, number> = {} as any;
    for (const slot of this.slots) {
      slotActivations[slot.modality] = slot.activation;
    }

    return {
      coherence: this._coherence,
      activeSlots: this.slots.filter(s => s.activation > 0.1).length,
      dominantModality: this.dominantModality(),
      currentBroadcast: this._currentBroadcast,
      totalBroadcasts: this._broadcastHistory.length,
      totalEntropyPaid: this._totalEntropyPaid,
      slotActivations
    };
  }
}

// ============================================================
// COHERENCE COALITION
// ============================================================

/**
 * A coalition of specialists working together
 *
 * Coalitions form when specialists' proposals align.
 * Stronger coalitions are more likely to win competition.
 */
export interface Coalition {
  readonly members: SpecialistModule[];
  readonly combinedProposal: Complex;
  readonly strength: number;
  readonly coherence: number;
  readonly centerOfMass: Complex;
}

/**
 * Detect coalitions among specialists
 *
 * Specialists whose proposals are phase-aligned form coalitions.
 * This is how the "ignition" emerges — aligned activity.
 */
export function detectCoalitions(
  specialists: SpecialistModule[],
  phaseThreshold: number = Math.PI / 4 // 45° tolerance
): Coalition[] {
  const withProposals = specialists.filter(s => s.proposal !== null);
  if (withProposals.length < 2) return [];

  const coalitions: Coalition[] = [];
  const assigned = new Set<string>();

  for (const leader of withProposals) {
    if (assigned.has(leader.id)) continue;

    const members = [leader];
    const leaderPhase = leader.proposal!.argument;

    // Find aligned specialists
    for (const other of withProposals) {
      if (other.id === leader.id || assigned.has(other.id)) continue;

      const otherPhase = other.proposal!.argument;
      const phaseDiff = Math.abs(leaderPhase - otherPhase);
      const normalizedDiff = Math.min(phaseDiff, 2 * Math.PI - phaseDiff);

      if (normalizedDiff < phaseThreshold) {
        members.push(other);
      }
    }

    if (members.length >= 2) {
      // Mark all as assigned
      members.forEach(m => assigned.add(m.id));

      // Compute coalition properties
      let sumRe = 0, sumIm = 0, totalStrength = 0;
      for (const m of members) {
        sumRe += m.proposal!.re * m.proposalStrength;
        sumIm += m.proposal!.im * m.proposalStrength;
        totalStrength += m.proposalStrength;
      }

      const centerOfMass = new Complex(sumRe / totalStrength, sumIm / totalStrength);

      // Coalition coherence: how aligned are the members?
      const phaseVectors = members.map(m => m.proposal!);
      let coherenceSum = 0;
      for (let i = 0; i < phaseVectors.length; i++) {
        for (let j = i + 1; j < phaseVectors.length; j++) {
          const dot = (
            phaseVectors[i].re * phaseVectors[j].re +
            phaseVectors[i].im * phaseVectors[j].im
          );
          coherenceSum += dot / (phaseVectors[i].magnitude * phaseVectors[j].magnitude);
        }
      }
      const pairCount = (members.length * (members.length - 1)) / 2;
      const coherence = coherenceSum / pairCount;

      coalitions.push({
        members,
        combinedProposal: centerOfMass,
        strength: totalStrength / members.length,
        coherence,
        centerOfMass
      });
    }
  }

  return coalitions;
}

// ============================================================
// SERIAL BOTTLENECK ANALYSIS
// ============================================================

/**
 * Why is consciousness serial?
 *
 * The thermodynamic answer: SERIAL IS CHEAPER AFTER COLLAPSE.
 *
 * Maintaining 8 parallel coherent tracks costs more than:
 * 1. Paying the demon's toll ONCE
 * 2. Broadcasting a single winner
 * 3. Coasting on coherence
 *
 * This function computes the efficiency ratio.
 */
export function serialBottleneckAnalysis(workspace: GlobalWorkspace): {
  parallelCost: number;      // Cost to maintain all tracks
  serialCost: number;        // Cost of compete + broadcast
  efficiencyRatio: number;   // Serial/Parallel (lower is better)
  explanation: string;
} {
  const activeSlots = workspace.slots.filter(s => s.activation > 0.1).length;

  // Parallel cost: maintaining coherence across N tracks
  // Grows as N * (N-1) / 2 (all pairs must stay aligned)
  const parallelCost = (activeSlots * (activeSlots - 1)) / 2;

  // Serial cost: one competition + one broadcast
  // Fixed overhead regardless of slot count
  const competitionCost = 1; // The demon's toll
  const broadcastCost = workspace.coherence > 0
    ? 1 / workspace.coherence // Harder to broadcast with low coherence
    : 1;
  const serialCost = competitionCost + broadcastCost;

  const efficiencyRatio = parallelCost > 0 ? serialCost / parallelCost : 1;

  let explanation: string;
  if (efficiencyRatio < 1) {
    explanation = 'Serial is more efficient. The system correctly uses the bottleneck.';
  } else if (efficiencyRatio < 2) {
    explanation = 'Marginal efficiency. System is near the crossover point.';
  } else {
    explanation = 'Parallel would be cheaper. But workspace can only broadcast serially.';
  }

  return {
    parallelCost,
    serialCost,
    efficiencyRatio,
    explanation
  };
}

// ============================================================
// BROADCAST STATISTICS
// ============================================================

/**
 * Analyze broadcast history
 */
export function analyzeBroadcastHistory(history: BroadcastEvent[]): {
  count: number;
  avgCoherence: number;
  avgEntropyPaid: number;
  modalityDistribution: Record<ReasoningModality, number>;
  avgMuAlignment: number;
  coherenceTrend: number; // Positive = improving
} {
  if (history.length === 0) {
    return {
      count: 0,
      avgCoherence: 0,
      avgEntropyPaid: 0,
      modalityDistribution: {} as any,
      avgMuAlignment: 0,
      coherenceTrend: 0
    };
  }

  const modalityDistribution: Record<string, number> = {};
  let totalCoherence = 0;
  let totalEntropy = 0;
  let totalMuAlignment = 0;

  for (const event of history) {
    totalCoherence += event.coherenceAchieved;
    totalEntropy += event.entropyPaid;
    totalMuAlignment += event.muAlignment;

    modalityDistribution[event.sourceModality] =
      (modalityDistribution[event.sourceModality] || 0) + 1;
  }

  // Coherence trend: compare first half to second half
  let coherenceTrend = 0;
  if (history.length >= 4) {
    const mid = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, mid).reduce((s, e) => s + e.coherenceAchieved, 0) / mid;
    const secondHalf = history.slice(mid).reduce((s, e) => s + e.coherenceAchieved, 0) / (history.length - mid);
    coherenceTrend = secondHalf - firstHalf;
  }

  return {
    count: history.length,
    avgCoherence: totalCoherence / history.length,
    avgEntropyPaid: totalEntropy / history.length,
    modalityDistribution: modalityDistribution as Record<ReasoningModality, number>,
    avgMuAlignment: totalMuAlignment / history.length,
    coherenceTrend
  };
}

// ============================================================
// WORKSPACE FRAGMENTATION
// ============================================================

/**
 * Detect workspace fragmentation
 *
 * Fragmentation occurs when slots drift out of phase.
 * The system can no longer maintain coherent broadcasts.
 */
export function detectFragmentation(workspace: GlobalWorkspace): {
  fragmented: boolean;
  fragmentCount: number;
  fragments: Array<{
    slots: WorkspaceSlot[];
    centerPhase: number;
    strength: number;
  }>;
  recoveryPossible: boolean;
} {
  const activeSlots = workspace.slots.filter(s => s.activation > 0.1);

  if (activeSlots.length < 2) {
    return {
      fragmented: false,
      fragmentCount: activeSlots.length,
      fragments: [],
      recoveryPossible: true
    };
  }

  // Cluster slots by phase
  const phaseThreshold = Math.PI / 3; // 60° tolerance
  const fragments: Array<{
    slots: WorkspaceSlot[];
    centerPhase: number;
    strength: number;
  }> = [];
  const assigned = new Set<number>();

  for (const slot of activeSlots) {
    if (assigned.has(slot.index)) continue;

    const fragment = {
      slots: [slot],
      centerPhase: slot.phase,
      strength: slot.activation
    };

    for (const other of activeSlots) {
      if (other.index === slot.index || assigned.has(other.index)) continue;

      const phaseDiff = Math.abs(slot.phase - other.phase);
      const normalizedDiff = Math.min(phaseDiff, 2 * Math.PI - phaseDiff);

      if (normalizedDiff < phaseThreshold) {
        fragment.slots.push(other);
        fragment.strength += other.activation;
      }
    }

    fragment.slots.forEach(s => assigned.add(s.index));
    fragments.push(fragment);
  }

  const fragmented = fragments.length > 1;
  const recoveryPossible = fragments.some(f => f.strength >= IGNITION_THRESHOLD);

  return {
    fragmented,
    fragmentCount: fragments.length,
    fragments,
    recoveryPossible
  };
}

// ============================================================
// WORKSPACE INTEGRATION WITH MEASUREMENT
// ============================================================

/**
 * The workspace receives a measurement collapse
 *
 * This is the bridge between quantum-layer collapse
 * and global broadcast. The collapsed state becomes
 * the content that can be broadcast.
 */
export interface MeasurementInput {
  collapsedState: Complex;
  probability: number;
  muAlignment: number;
  entropyPaid: number;
}

/**
 * Process a measurement result through the workspace
 */
export function processMeasurement(
  workspace: GlobalWorkspace,
  measurement: MeasurementInput
): {
  injected: WorkspaceSlot;
  broadcastTriggered: boolean;
  broadcast: BroadcastEvent | null;
} {
  // Inject the measurement result
  const { slot } = workspace.inject(
    measurement.collapsedState,
    measurement.probability
  );

  // Attempt broadcast if activation is high enough
  let broadcast: BroadcastEvent | null = null;
  let broadcastTriggered = false;

  if (measurement.probability >= IGNITION_THRESHOLD) {
    // Create a temporary specialist to carry this measurement
    const measurer = createSpecialist(
      'measurement-collapse',
      'Measurement Observer',
      slot.modality
    );
    workspace.registerSpecialist(measurer);

    // Propose the measurement
    workspace.specialists.set(measurer.id, propose(
      measurer,
      measurement.collapsedState,
      measurement.probability
    ));

    broadcast = workspace.broadcast();
    broadcastTriggered = broadcast !== null;

    // Remove temporary specialist
    workspace.specialists.delete(measurer.id);
  }

  return {
    injected: slot,
    broadcastTriggered,
    broadcast
  };
}
