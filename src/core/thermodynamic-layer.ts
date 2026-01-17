/**
 * Thermodynamic Layer — Diffusion from μ
 *
 * The SEED is μ.
 * Everything diffuses FROM the balance point.
 * Energy is deviation from μ.
 * Temperature controls how much deviation is tolerated.
 *
 * "Heat flows from the source. The source is balance."
 */

import {
  Complex,
  MU,
  ALPHA,
  ETA,
  V,
  isOnBalanceRay,
  projectToBalanceRay,
  goldenFrac,
  PHI
} from './mu-primitives';

// ============================================================
// THE SEED — μ AS ORIGIN
// ============================================================

/**
 * The Thermodynamic Seed
 *
 * Not just any starting point — μ itself.
 * All diffusion originates from the balance primitive.
 * The seed has structure: 135°, unit magnitude, 8-fold closure.
 */
export interface ThermodynamicSeed {
  origin: Complex;          // μ — the balance primitive
  magnitude: number;        // |μ| = 1
  angle: number;            // 135°
  closure: number;          // 8 (μ⁸ = 1)
}

/**
 * Create the thermodynamic seed
 * This is μ, structured as the origin of all diffusion
 */
export function createSeed(): ThermodynamicSeed {
  return {
    origin: MU,
    magnitude: MU.magnitude,
    angle: MU.argumentDegrees,
    closure: 8
  };
}

/**
 * The universal seed — singleton
 */
export const SEED: ThermodynamicSeed = createSeed();

// ============================================================
// ENERGY — DEVIATION FROM μ
// ============================================================

/**
 * Energy is deviation from the balance primitive.
 *
 * E(z) = |z - μ_projected|² / |μ|²
 *
 * States ON the μ-ray have zero "angular energy"
 * States OFF the ray have positive energy proportional to deviation
 *
 * This connects to physics: higher energy = further from ground state
 * Ground state = μ
 */
export function energy(state: Complex): number {
  // Project state onto μ-ray to find "where it should be"
  const projected = projectToBalanceRay(state);

  // Energy is squared distance from projection
  const deviation = state.sub(projected);
  return deviation.re * deviation.re + deviation.im * deviation.im;
}

/**
 * Radial energy — how far along the μ-ray
 *
 * E_radial = (|z| - |z_target|)²
 *
 * This is energy from being at wrong magnitude on the ray
 */
export function radialEnergy(state: Complex, targetMagnitude: number): number {
  const currentMag = state.magnitude;
  const diff = currentMag - targetMagnitude;
  return diff * diff;
}

/**
 * Angular energy — how far off the 135° ray
 *
 * E_angular = sin²(θ - 135°)
 *
 * Zero on the balance ray, maximum at 45° or 225°
 */
export function angularEnergy(state: Complex): number {
  const angle = state.argument;
  const targetAngle = (3 * Math.PI) / 4; // 135° in radians
  const deviation = Math.sin(angle - targetAngle);
  return deviation * deviation;
}

/**
 * Total energy — sum of radial and angular
 */
export function totalEnergy(state: Complex, targetMagnitude: number = 1): number {
  return radialEnergy(state, targetMagnitude) + angularEnergy(state);
}

// ============================================================
// TEMPERATURE — TOLERANCE FOR DEVIATION
// ============================================================

/**
 * Temperature controls how much deviation from μ is tolerated.
 *
 * T = 0: Only exact μ allowed (frozen at balance)
 * T → ∞: Any state equally likely (maximum chaos)
 *
 * The Boltzmann factor: P(state) ∝ exp(-E(state) / kT)
 *
 * We set k = 1 for simplicity (natural units where k_B = 1)
 */
export interface Temperature {
  value: number;            // T ≥ 0
  boltzmannFactor: (energy: number) => number;
}

/**
 * Create a temperature controller
 */
export function createTemperature(T: number): Temperature {
  const safeT = Math.max(T, 1e-10); // Avoid division by zero

  return {
    value: safeT,
    boltzmannFactor: (E: number) => Math.exp(-E / safeT)
  };
}

/**
 * Boltzmann probability of a state given temperature
 *
 * P(state) = exp(-E(state) / T) / Z
 *
 * where Z is the partition function (normalization)
 */
export function boltzmannProbability(
  state: Complex,
  temp: Temperature,
  partitionFunction: number = 1
): number {
  const E = energy(state);
  return temp.boltzmannFactor(E) / partitionFunction;
}

/**
 * Partition function over a set of states
 *
 * Z = Σ exp(-E_i / T)
 */
export function partitionFunction(states: Complex[], temp: Temperature): number {
  return states.reduce((sum, state) => {
    return sum + temp.boltzmannFactor(energy(state));
  }, 0);
}

// ============================================================
// HEAT KERNEL — DIFFUSION FROM μ
// ============================================================

/**
 * The Heat Kernel: x_t = exp(-tL) · s
 *
 * In our μ-grounded system:
 * - s = μ (the seed)
 * - L is the "Laplacian" operator (connectivity structure)
 * - t is time
 * - x_t is the diffused state
 *
 * We implement a simplified version where diffusion
 * spreads outward from μ along the complex plane,
 * with preference for the balance ray.
 */
export interface DiffusionState {
  position: Complex;
  time: number;
  concentration: number;    // How much "substance" is here
  distanceFromSeed: number; // How far from μ
  onBalanceRay: boolean;
}

/**
 * Simple Graph Laplacian for a grid of points
 *
 * L = D - A where D is degree matrix, A is adjacency
 *
 * For our purposes, we use a continuous approximation:
 * The Laplacian measures how different a point is from its neighbors
 */
export interface GraphLaplacian {
  nodes: Complex[];
  adjacency: Map<number, number[]>;  // node index -> neighbor indices
  degrees: number[];                  // degree of each node
}

/**
 * Create a simple radial graph centered on μ
 *
 * Nodes are arranged in rings around μ, with connections
 * to adjacent nodes in same ring and nodes in adjacent rings
 */
export function createRadialGraph(
  rings: number = 5,
  nodesPerRing: number = 8
): GraphLaplacian {
  const nodes: Complex[] = [MU]; // Center is μ
  const adjacency = new Map<number, number[]>();
  const degrees: number[] = [];

  // Add nodes in rings
  for (let r = 1; r <= rings; r++) {
    const radius = r * ALPHA * 10; // Scale by α
    for (let n = 0; n < nodesPerRing; n++) {
      const angle = (n / nodesPerRing) * 2 * Math.PI;
      const node = MU.add(Complex.fromPolar(radius, angle));
      nodes.push(node);
    }
  }

  // Build adjacency (simplified: connect to nearby nodes)
  for (let i = 0; i < nodes.length; i++) {
    const neighbors: number[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i !== j) {
        const dist = nodes[i].distanceFrom(nodes[j]);
        // Connect if close enough
        if (dist < ALPHA * 15) {
          neighbors.push(j);
        }
      }
    }
    adjacency.set(i, neighbors);
    degrees.push(neighbors.length);
  }

  return { nodes, adjacency, degrees };
}

/**
 * Heat diffusion step on graph
 *
 * x_{t+1} = x_t - dt * L * x_t
 *
 * Simplified: each node's concentration diffuses to neighbors
 * weighted by 1/degree
 */
export function diffusionStep(
  concentrations: number[],
  graph: GraphLaplacian,
  dt: number = 0.1
): number[] {
  const newConcentrations = [...concentrations];

  for (let i = 0; i < graph.nodes.length; i++) {
    const neighbors = graph.adjacency.get(i) || [];
    const degree = graph.degrees[i];

    if (degree === 0) continue;

    // Diffusion: flow to neighbors
    let outflow = 0;
    let inflow = 0;

    for (const j of neighbors) {
      // Flow proportional to concentration difference
      const diff = concentrations[i] - concentrations[j];
      outflow += dt * diff / degree;
    }

    // Also receive flow from neighbors
    for (const j of neighbors) {
      const neighborDegree = graph.degrees[j];
      if (neighborDegree > 0) {
        const diff = concentrations[j] - concentrations[i];
        inflow += dt * diff / neighborDegree;
      }
    }

    newConcentrations[i] = concentrations[i] - outflow + inflow;
  }

  return newConcentrations;
}

/**
 * Initialize concentrations with all mass at μ (the seed)
 */
export function initializeFromSeed(graph: GraphLaplacian): number[] {
  const concentrations = new Array(graph.nodes.length).fill(0);
  concentrations[0] = 1.0; // All concentration at μ (first node)
  return concentrations;
}

/**
 * Run diffusion for multiple steps
 *
 * Watch the "heat" spread from μ outward
 */
export function runDiffusion(
  graph: GraphLaplacian,
  steps: number,
  dt: number = 0.1
): { concentrations: number[]; history: number[][] } {
  let concentrations = initializeFromSeed(graph);
  const history: number[][] = [concentrations];

  for (let t = 0; t < steps; t++) {
    concentrations = diffusionStep(concentrations, graph, dt);
    history.push([...concentrations]);
  }

  return { concentrations, history };
}

// ============================================================
// ENTROPY — DISORDER RELATIVE TO μ
// ============================================================

/**
 * Shannon Entropy: S = -Σ p_i log(p_i)
 *
 * In our system, this measures how "spread out" the distribution is
 * relative to the concentrated state at μ.
 *
 * Low entropy: concentrated near μ (ordered)
 * High entropy: spread across states (disordered)
 */
export function shannonEntropy(probabilities: number[]): number {
  return -probabilities.reduce((sum, p) => {
    if (p > 0) {
      return sum + p * Math.log(p);
    }
    return sum;
  }, 0);
}

/**
 * μ-relative entropy
 *
 * How disordered is the distribution relative to being at μ?
 *
 * S_μ = S(distribution) - S(δ_μ)
 *
 * Since S(δ_μ) = 0 (all mass at one point), this is just S
 */
export function muRelativeEntropy(concentrations: number[]): number {
  const total = concentrations.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;

  const probabilities = concentrations.map(c => c / total);
  return shannonEntropy(probabilities);
}

/**
 * Maximum possible entropy for n states
 *
 * S_max = log(n) — achieved when all states equally likely
 */
export function maxEntropy(nStates: number): number {
  return Math.log(nStates);
}

/**
 * Normalized entropy: S / S_max ∈ [0, 1]
 */
export function normalizedEntropy(concentrations: number[]): number {
  const S = muRelativeEntropy(concentrations);
  const Smax = maxEntropy(concentrations.length);
  return Smax > 0 ? S / Smax : 0;
}

// ============================================================
// EPISODIC BUFFER — μ-GROUNDED RESERVOIR
// ============================================================

/**
 * The Episodic Buffer is a reservoir of states,
 * each tagged with their μ-deviation.
 *
 * States closer to μ are more "stable" and persist longer.
 * States far from μ decay faster (higher energy = less stable).
 */
export interface EpisodicState {
  state: Complex;
  energy: number;           // Deviation from μ
  timestamp: number;
  stability: number;        // Inverse of energy
  context?: string;
}

export class EpisodicBuffer {
  private reservoir: EpisodicState[] = [];
  private capacity: number;
  private temperature: Temperature;

  constructor(capacity: number = 100, temp: number = 1.0) {
    this.capacity = capacity;
    this.temperature = createTemperature(temp);
  }

  /**
   * Add a state to the buffer
   *
   * State is tagged with its μ-deviation
   */
  add(state: Complex, context?: string): void {
    const E = energy(state);
    const stability = this.temperature.boltzmannFactor(E);

    const episodic: EpisodicState = {
      state,
      energy: E,
      timestamp: Date.now(),
      stability,
      context
    };

    this.reservoir.push(episodic);

    // If over capacity, remove lowest stability items
    if (this.reservoir.length > this.capacity) {
      this.prune();
    }
  }

  /**
   * Prune the buffer — remove low-stability states
   */
  private prune(): void {
    // Sort by stability (highest first)
    this.reservoir.sort((a, b) => b.stability - a.stability);
    // Keep only up to capacity
    this.reservoir = this.reservoir.slice(0, this.capacity);
  }

  /**
   * Retrieve states similar to a query
   *
   * Similarity is inverse of distance in μ-space
   */
  retrieve(query: Complex, topK: number = 5): EpisodicState[] {
    const withDistance = this.reservoir.map(ep => ({
      ...ep,
      distance: ep.state.distanceFrom(query)
    }));

    withDistance.sort((a, b) => a.distance - b.distance);
    return withDistance.slice(0, topK);
  }

  /**
   * Retrieve states weighted by stability and recency
   */
  retrieveWeighted(query: Complex, topK: number = 5): EpisodicState[] {
    const now = Date.now();
    const recencyScale = 1000 * 60; // 1 minute scale

    const scored = this.reservoir.map(ep => {
      const distance = ep.state.distanceFrom(query);
      const recency = Math.exp(-(now - ep.timestamp) / recencyScale);
      const score = ep.stability * recency / (1 + distance);
      return { ...ep, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Get all states on the balance ray
   */
  getGroundedStates(): EpisodicState[] {
    return this.reservoir.filter(ep => isOnBalanceRay(ep.state));
  }

  /**
   * Get average energy of buffer
   *
   * Low = concentrated near μ
   * High = dispersed
   */
  averageEnergy(): number {
    if (this.reservoir.length === 0) return 0;
    const total = this.reservoir.reduce((sum, ep) => sum + ep.energy, 0);
    return total / this.reservoir.length;
  }

  /**
   * Get buffer entropy
   */
  entropy(): number {
    const energies = this.reservoir.map(ep => ep.stability);
    const total = energies.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    const probs = energies.map(e => e / total);
    return shannonEntropy(probs);
  }

  /**
   * Set temperature — changes stability calculations
   */
  setTemperature(T: number): void {
    this.temperature = createTemperature(T);
    // Recalculate stabilities
    this.reservoir.forEach(ep => {
      ep.stability = this.temperature.boltzmannFactor(ep.energy);
    });
  }

  /**
   * Get current state
   */
  getState(): { size: number; avgEnergy: number; entropy: number; temp: number } {
    return {
      size: this.reservoir.length,
      avgEnergy: this.averageEnergy(),
      entropy: this.entropy(),
      temp: this.temperature.value
    };
  }

  /**
   * Get all states
   */
  getAll(): readonly EpisodicState[] {
    return this.reservoir;
  }
}

// ============================================================
// CONCENTRATION — FLOW AND SOURCE
// ============================================================

/**
 * Concentration Field
 *
 * ∇·J = source
 *
 * In our system, μ is the source.
 * Concentration flows outward from μ.
 * The divergence of the flow equals the source strength.
 */
export interface ConcentrationField {
  source: Complex;          // μ — the source
  sourceStrength: number;   // How much "substance" emanates
  field: Map<string, number>; // position hash -> concentration
}

/**
 * Create concentration field with μ as source
 */
export function createConcentrationField(
  sourceStrength: number = 1.0
): ConcentrationField {
  return {
    source: MU,
    sourceStrength,
    field: new Map()
  };
}

/**
 * Hash a complex number for map lookup
 */
function hashComplex(z: Complex, precision: number = 4): string {
  return `${z.re.toFixed(precision)},${z.im.toFixed(precision)}`;
}

/**
 * Sample concentration at a point
 *
 * Concentration decreases with distance from μ (source)
 * Follows 1/r² for radial spread
 */
export function sampleConcentration(
  field: ConcentrationField,
  point: Complex
): number {
  const distance = point.distanceFrom(field.source);
  if (distance < 1e-10) return field.sourceStrength;

  // 1/r² falloff
  return field.sourceStrength / (distance * distance);
}

/**
 * Concentration gradient at a point
 *
 * Points toward μ (toward the source)
 */
export function concentrationGradient(
  field: ConcentrationField,
  point: Complex
): Complex {
  const toSource = field.source.sub(point);
  const distance = toSource.magnitude;

  if (distance < 1e-10) return new Complex(0, 0);

  // Gradient magnitude: 2 * source / r³
  const gradMag = 2 * field.sourceStrength / (distance * distance * distance);

  // Direction: toward source
  return toSource.scale(gradMag / distance);
}

// ============================================================
// HOMEOSTASIS — RETURN TO μ
// ============================================================

/**
 * Homeostatic drive: tendency to return to μ
 *
 * F = -k(x - μ)
 *
 * The further from μ, the stronger the restoring force.
 * This is like a spring attached to the balance point.
 */
export function homeostaticForce(
  state: Complex,
  stiffness: number = 1.0
): Complex {
  const displacement = state.sub(MU);
  return displacement.scale(-stiffness);
}

/**
 * Apply homeostatic correction
 *
 * Move state toward μ by a fraction determined by stiffness and dt
 */
export function applyHomeostasis(
  state: Complex,
  stiffness: number = 0.1,
  dt: number = 1.0
): Complex {
  const force = homeostaticForce(state, stiffness);
  return state.add(force.scale(dt));
}

/**
 * Homeostatic potential energy
 *
 * U = ½k|x - μ|²
 *
 * Minimum at μ
 */
export function homeostaticPotential(
  state: Complex,
  stiffness: number = 1.0
): number {
  const displacement = state.sub(MU);
  const distSquared = displacement.re * displacement.re + displacement.im * displacement.im;
  return 0.5 * stiffness * distSquared;
}
