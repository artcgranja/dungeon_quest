/**
 * Vector2D - 2D vector math utilities
 * Immutable by default for safety, with mutable methods when needed
 */
export class Vector2D {
  constructor(
    public readonly x: number = 0,
    public readonly y: number = 0
  ) {}

  // ==================== Static Factory Methods ====================

  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  static one(): Vector2D {
    return new Vector2D(1, 1);
  }

  static up(): Vector2D {
    return new Vector2D(0, -1);
  }

  static down(): Vector2D {
    return new Vector2D(0, 1);
  }

  static left(): Vector2D {
    return new Vector2D(-1, 0);
  }

  static right(): Vector2D {
    return new Vector2D(1, 0);
  }

  static fromAngle(angle: number, length: number = 1): Vector2D {
    return new Vector2D(Math.cos(angle) * length, Math.sin(angle) * length);
  }

  static random(minLength: number = 0, maxLength: number = 1): Vector2D {
    const angle = Math.random() * Math.PI * 2;
    const length = minLength + Math.random() * (maxLength - minLength);
    return Vector2D.fromAngle(angle, length);
  }

  // ==================== Immutable Operations (return new Vector2D) ====================

  /**
   * Add two vectors (returns new vector)
   */
  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtract two vectors (returns new vector)
   */
  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  /**
   * Multiply vector by scalar (returns new vector)
   */
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  /**
   * Divide vector by scalar (returns new vector)
   */
  divide(scalar: number): Vector2D {
    if (scalar === 0) {
      console.warn('Division by zero in Vector2D.divide');
      return this.clone();
    }
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  /**
   * Normalize vector to length 1 (returns new vector)
   */
  normalize(): Vector2D {
    const len = this.length();
    if (len === 0) return Vector2D.zero();
    return this.divide(len);
  }

  /**
   * Set vector length (returns new vector)
   */
  setLength(length: number): Vector2D {
    return this.normalize().multiply(length);
  }

  /**
   * Limit vector length (returns new vector)
   */
  limit(maxLength: number): Vector2D {
    const len = this.length();
    if (len > maxLength) {
      return this.setLength(maxLength);
    }
    return this.clone();
  }

  /**
   * Rotate vector by angle in radians (returns new vector)
   */
  rotate(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  /**
   * Lerp (linear interpolation) between two vectors
   * @param other - Target vector
   * @param t - Interpolation factor (0-1)
   */
  lerp(other: Vector2D, t: number): Vector2D {
    return new Vector2D(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t
    );
  }

  // ==================== Calculations (no mutation) ====================

  /**
   * Calculate vector length (magnitude)
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Calculate squared length (faster than length, useful for comparisons)
   */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Calculate distance to another vector
   */
  distanceTo(other: Vector2D): number {
    return this.subtract(other).length();
  }

  /**
   * Calculate squared distance (faster, useful for comparisons)
   */
  distanceSquaredTo(other: Vector2D): number {
    return this.subtract(other).lengthSquared();
  }

  /**
   * Dot product with another vector
   */
  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Cross product (returns scalar in 2D)
   */
  cross(other: Vector2D): number {
    return this.x * other.y - this.y * other.x;
  }

  /**
   * Get angle in radians
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Get angle to another vector
   */
  angleTo(other: Vector2D): number {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  // ==================== Comparison ====================

  /**
   * Check if vectors are equal (with optional epsilon for floating point comparison)
   */
  equals(other: Vector2D, epsilon: number = 0.0001): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon
    );
  }

  /**
   * Check if vector is zero
   */
  isZero(epsilon: number = 0.0001): boolean {
    return Math.abs(this.x) < epsilon && Math.abs(this.y) < epsilon;
  }

  // ==================== Utility ====================

  /**
   * Clone this vector
   */
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  /**
   * Convert to plain object
   */
  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Convert to array [x, y]
   */
  toArray(): [number, number] {
    return [this.x, this.y];
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  // ==================== Mutable Operations (for performance-critical code) ====================

  /**
   * Create a mutable version of this vector
   */
  toMutable(): MutableVector2D {
    return new MutableVector2D(this.x, this.y);
  }
}

/**
 * MutableVector2D - Performance-optimized mutable vector
 * Use when you need to avoid allocations in hot paths
 */
export class MutableVector2D {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}

  /**
   * Set x and y values
   */
  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Copy values from another vector
   */
  copy(other: Vector2D | MutableVector2D): this {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  /**
   * Add another vector (mutates this)
   */
  addMut(other: Vector2D | MutableVector2D): this {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  /**
   * Subtract another vector (mutates this)
   */
  subtractMut(other: Vector2D | MutableVector2D): this {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  /**
   * Multiply by scalar (mutates this)
   */
  multiplyMut(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Normalize (mutates this)
   */
  normalizeMut(): this {
    const len = Math.sqrt(this.x * this.x + this.y * this.y);
    if (len > 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }

  /**
   * Convert to immutable Vector2D
   */
  toImmutable(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  /**
   * Clone this mutable vector
   */
  clone(): MutableVector2D {
    return new MutableVector2D(this.x, this.y);
  }
}
