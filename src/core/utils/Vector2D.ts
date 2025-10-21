/**
 * Vector2D - 2D vector math utilities
 */

export class Vector2D {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}

  /**
   * Create a copy of this vector
   */
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  /**
   * Set vector values
   */
  set(x: number, y: number): Vector2D {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Add another vector
   */
  add(other: Vector2D): Vector2D {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  /**
   * Subtract another vector
   */
  sub(other: Vector2D): Vector2D {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  /**
   * Multiply by scalar
   */
  multiply(scalar: number): Vector2D {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Divide by scalar
   */
  divide(scalar: number): Vector2D {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  /**
   * Get magnitude (length) of vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Get squared magnitude (faster than magnitude, useful for comparisons)
   */
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalize vector (make length = 1)
   */
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag > 0) {
      this.divide(mag);
    }
    return this;
  }

  /**
   * Get distance to another vector
   */
  distanceTo(other: Vector2D): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get squared distance to another vector
   */
  distanceSquaredTo(other: Vector2D): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return dx * dx + dy * dy;
  }

  /**
   * Dot product
   */
  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Get angle in radians
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Rotate by angle (in radians)
   */
  rotate(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;
    this.x = newX;
    this.y = newY;
    return this;
  }

  /**
   * Limit magnitude
   */
  limit(max: number): Vector2D {
    const magSq = this.magnitudeSquared();
    if (magSq > max * max) {
      this.normalize().multiply(max);
    }
    return this;
  }

  /**
   * Static helper: Create vector from two points
   */
  static fromPoints(x1: number, y1: number, x2: number, y2: number): Vector2D {
    return new Vector2D(x2 - x1, y2 - y1);
  }

  /**
   * Static helper: Get distance between two points
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Static helper: Linear interpolation between two vectors
   */
  static lerp(a: Vector2D, b: Vector2D, t: number): Vector2D {
    return new Vector2D(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    );
  }

  /**
   * Convert to string (for debugging)
   */
  toString(): string {
    return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }
}
