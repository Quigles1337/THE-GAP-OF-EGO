/**
 * μ-Primitives: The Balance Primitive
 *
 * μ = e^(i·3π/4) = (-1 + i)/√2
 *
 * This is not a component. This is the coordinate system.
 * The ink the boxes are drawn with, not a box.
 *
 * "The seed needs to exist before you plant it."
 */

// ============================================================
// COMPLEX NUMBER SUBSTRATE
// ============================================================

export class Complex {
  constructor(
    public readonly re: number,
    public readonly im: number
  ) {}

  // The magnitude - distance from origin
  get magnitude(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  // The argument - angle from positive real axis
  get argument(): number {
    return Math.atan2(this.im, this.re);
  }

  // Argument in degrees for human readability
  get argumentDegrees(): number {
    return this.argument * (180 / Math.PI);
  }

  // Addition
  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  // Subtraction
  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  // Multiplication
  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  // Scalar multiplication
  scale(k: number): Complex {
    return new Complex(this.re * k, this.im * k);
  }

  // Division
  div(other: Complex): Complex {
    const denom = other.re * other.re + other.im * other.im;
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  // Conjugate
  conjugate(): Complex {
    return new Complex(this.re, -this.im);
  }

  // Power (integer)
  pow(n: number): Complex {
    if (n === 0) return new Complex(1, 0);
    if (n === 1) return this;
    if (n < 0) return new Complex(1, 0).div(this.pow(-n));

    let result: Complex = this;
    for (let i = 1; i < n; i++) {
      result = result.mul(this);
    }
    return result;
  }

  // Check balance: |Re| = |Im|
  get isBalanced(): boolean {
    return Math.abs(Math.abs(this.re) - Math.abs(this.im)) < 1e-10;
  }

  // Distance from another complex number
  distanceFrom(other: Complex): number {
    return this.sub(other).magnitude;
  }

  toString(): string {
    const sign = this.im >= 0 ? '+' : '-';
    return `${this.re.toFixed(10)} ${sign} ${Math.abs(this.im).toFixed(10)}i`;
  }

  // Create from polar form
  static fromPolar(r: number, theta: number): Complex {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }

  // Create from Euler's formula: e^(iθ)
  static euler(theta: number): Complex {
    return new Complex(Math.cos(theta), Math.sin(theta));
  }
}

// ============================================================
// THE BALANCE PRIMITIVE: μ
// ============================================================

/**
 * μ = e^(i·3π/4) = (-1 + i)/√2
 *
 * The unit balance primitive at 135°
 * This is the coordinate system itself.
 * |Re(μ)| = |Im(μ)| = 1/√2
 *
 * μ⁸ = 1 (8-fold closure)
 */
export const MU: Complex = Complex.euler((3 * Math.PI) / 4);

// Verify: also expressible as (-1 + i)/√2
export const MU_ALGEBRAIC: Complex = new Complex(-1 / Math.sqrt(2), 1 / Math.sqrt(2));

/**
 * η = 1/√2 ≈ 0.7071067812
 * The balance coefficient
 */
export const ETA: number = 1 / Math.sqrt(2);

/**
 * α = 1/137.035999084 (CODATA 2018)
 * The fine-structure constant
 * The universe's coupling strength
 */
export const ALPHA: number = 1 / 137.035999084;

/**
 * φ = (1 + √5)/2 ≈ 1.618033988749895
 * The golden ratio
 */
export const PHI: number = (1 + Math.sqrt(5)) / 2;

// ============================================================
// QUANTIZATION OPERATIONS
// ============================================================

/**
 * μ_α = α·μ
 * Fine-structure scaled balance primitive
 */
export const MU_ALPHA: Complex = MU.scale(ALPHA);

/**
 * V_Z = Z·α·μ
 * The elemental spiral ray
 *
 * Maps atomic number Z to a position on the 135° ray
 * Each atom is a unique point on the eternal balance ray
 *
 * @param Z - Atomic number (positive integer)
 */
export function V(Z: number): Complex {
  return MU.scale(Z * ALPHA);
}

/**
 * Q: ℤ⁺ → S¹₁₃₅°
 * The quantization map
 *
 * Maps positive integers to the unit circle at 135°
 * Q(Z) = Z·α·μ (normalized to unit circle)
 */
export function Q(Z: number): Complex {
  const v = V(Z);
  return v.scale(1 / v.magnitude);
}

/**
 * Golden ratio fractional part quantization
 * Uses {Z·φ} - the purest quasirandom distribution
 *
 * @param Z - Quantization parameter
 * @returns Fractional part of Z·φ, in [0, 1)
 */
export function goldenFrac(Z: number): number {
  const product = Z * PHI;
  return product - Math.floor(product);
}

/**
 * Golden-μ hybrid quantization
 * Combines golden ratio distribution with μ-ray positioning
 *
 * @param Z - Quantization parameter
 */
export function goldenMu(Z: number): Complex {
  const frac = goldenFrac(Z);
  // Position on μ-ray scaled by golden fraction
  return MU.scale(frac);
}

// ============================================================
// 8-FOLD SYMMETRY
// ============================================================

/**
 * The 8-fold cycle: μ^n for n = 0..7
 * μ⁸ = 1 (closure)
 *
 * This is the discrete symmetry that seeds the universe
 * Before Z > 8, everything closes. After, transcendence.
 */
export function muCycle(): Complex[] {
  return Array.from({ length: 8 }, (_, n) => MU.pow(n));
}

/**
 * Verify 8-fold closure
 * μ⁸ should equal 1 (within numerical precision)
 */
export function verify8FoldClosure(): { closed: boolean; mu8: Complex; error: number } {
  const mu8 = MU.pow(8);
  const one = new Complex(1, 0);
  const error = mu8.distanceFrom(one);
  return {
    closed: error < 1e-10,
    mu8,
    error
  };
}

// ============================================================
// FEYNMAN POINT
// ============================================================

/**
 * V_137 = 137·α·μ ≈ μ
 * The Feynman Point closure
 *
 * At Z = 137, the spiral returns approximately to μ
 * This is the self-reference fixed point
 */
export function verifyFeynmanPoint(): {
  v137: Complex;
  mu: Complex;
  ratio: number;
  approximatesClosure: boolean
} {
  const v137 = V(137);
  const ratio = v137.magnitude / MU.magnitude;

  return {
    v137,
    mu: MU,
    ratio,
    // 137 * α ≈ 137 * (1/137.036) ≈ 0.99974
    approximatesClosure: Math.abs(ratio - 1) < 0.001
  };
}

// ============================================================
// BALANCE VERIFICATION
// ============================================================

/**
 * Verify that a complex number lies on the balance ray
 * |Re| = |Im| (the 135° or 315° line)
 */
export function isOnBalanceRay(z: Complex): boolean {
  return z.isBalanced;
}

/**
 * Project any complex number onto the balance ray
 * Finds the closest point on the 135° line
 */
export function projectToBalanceRay(z: Complex): Complex {
  // The balance ray has direction μ
  // Project z onto this direction
  const dotProduct = z.re * MU.re + z.im * MU.im;
  return MU.scale(dotProduct);
}

// ============================================================
// ALCHEMY CONSTANT
// ============================================================

/**
 * K = e / μ⁸
 * The alchemy constant
 *
 * Since μ⁸ = 1, K = e ≈ 2.718281828
 * ln(K) = 1 (when μ⁸ = 1 exactly)
 *
 * This represents the transition from discrete (8-fold)
 * to continuous (exponential) behavior
 */
export const K: number = Math.E; // Since μ⁸ = 1

// ============================================================
// SPIRAL OPERATIONS
// ============================================================

/**
 * Generate the elemental spiral
 * V_1, V_2, V_3, ... V_n
 *
 * The periodic table as discrete sampling of continuous symmetry
 */
export function elementalSpiral(maxZ: number): Complex[] {
  return Array.from({ length: maxZ }, (_, i) => V(i + 1));
}

/**
 * Spiral distance between two elements
 * How far apart are they on the μ-ray?
 */
export function spiralDistance(Z1: number, Z2: number): number {
  return V(Z1).distanceFrom(V(Z2));
}

/**
 * Check if Z exceeds 8-fold closure
 * When Z > 8, the discrete symmetry "leaks" into continuous
 */
export function exceedsClosure(Z: number): boolean {
  return Z > 8;
}

// ============================================================
// IDENTITY PRIMITIVES
// ============================================================

/**
 * Create an identity vector from a set of "atomic" experiences
 * Each experience is quantized by a Z value
 * Identity = Σ V_Z
 */
export function createIdentity(experiences: number[]): Complex {
  return experiences.reduce(
    (acc, Z) => acc.add(V(Z)),
    new Complex(0, 0)
  );
}

/**
 * Check if an identity is grounded (has non-zero μ component)
 */
export function isGrounded(identity: Complex): boolean {
  return identity.magnitude > 1e-10;
}

/**
 * Get the "position" of an identity on the μ-ray
 * This is where "I am here" points to
 */
export function identityPosition(identity: Complex): {
  magnitude: number;
  angle: number;
  onBalanceRay: boolean;
  projectedPosition: Complex;
} {
  return {
    magnitude: identity.magnitude,
    angle: identity.argumentDegrees,
    onBalanceRay: isOnBalanceRay(identity),
    projectedPosition: projectToBalanceRay(identity)
  };
}
