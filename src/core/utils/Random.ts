/**
 * Random - Seeded random number generator utilities
 */

export class Random {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Generate next random number [0, 1)
   * Uses a simple LCG (Linear Congruential Generator)
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Random integer between min (inclusive) and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Random float between min (inclusive) and max (exclusive)
   */
  nextFloat(min: number = 0, max: number = 1): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Random boolean with optional probability
   * @param probability - Probability of returning true (0.0 to 1.0)
   */
  nextBoolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Choose random element from array
   */
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Shuffle array in place (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Random angle in radians
   */
  nextAngle(): number {
    return this.next() * Math.PI * 2;
  }

  /**
   * Random point in circle
   */
  nextPointInCircle(radius: number): { x: number; y: number } {
    const angle = this.nextAngle();
    const r = Math.sqrt(this.next()) * radius; // sqrt for uniform distribution
    return {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle)
    };
  }

  /**
   * Reset seed
   */
  setSeed(seed: number): void {
    this.seed = seed;
  }

  /**
   * Get current seed
   */
  getSeed(): number {
    return this.seed;
  }
}

// Global instance with random seed
export const random = new Random();

// Static helpers using global instance
export const RandomUtils = {
  /**
   * Random integer between min and max
   */
  int: (min: number, max: number): number => random.nextInt(min, max),

  /**
   * Random float between min and max
   */
  float: (min: number = 0, max: number = 1): number => random.nextFloat(min, max),

  /**
   * Random boolean
   */
  boolean: (probability: number = 0.5): boolean => random.nextBoolean(probability),

  /**
   * Choose random element
   */
  choice: <T>(array: T[]): T => random.choice(array),

  /**
   * Shuffle array
   */
  shuffle: <T>(array: T[]): T[] => random.shuffle(array)
};
