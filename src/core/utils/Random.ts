/**
 * Random - Seeded random number generator
 * Based on Mulberry32 algorithm (fast and good quality)
 */
export class Random {
  private state: number;

  constructor(seed?: number) {
    this.state = seed ?? Date.now();
  }

  /**
   * Get the current seed
   */
  getSeed(): number {
    return this.state;
  }

  /**
   * Set a new seed
   */
  setSeed(seed: number): void {
    this.state = seed;
  }

  /**
   * Generate a random float between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    // Mulberry32 algorithm
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate a random integer between min (inclusive) and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    min = Math.floor(min);
    max = Math.floor(max);
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate a random float between min (inclusive) and max (exclusive)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Generate a random boolean with optional probability
   * @param probability - Probability of returning true (0-1), default 0.5
   */
  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Shuffle an array (Fisher-Yates shuffle)
   * Returns a new shuffled array
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Shuffle an array in-place
   */
  shuffleMut<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Pick N random unique elements from an array
   */
  pickMultiple<T>(array: T[], count: number): T[] {
    if (count > array.length) {
      throw new Error('Cannot pick more elements than array length');
    }
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, count);
  }

  /**
   * Weighted random selection
   * @param items - Array of items
   * @param weights - Array of weights (must be same length as items)
   */
  weightedPick<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error('Items and weights arrays must have same length');
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.nextFloat(0, totalWeight);

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    // Fallback (shouldn't happen)
    return items[items.length - 1];
  }

  /**
   * Generate random value from gaussian/normal distribution
   * Uses Box-Muller transform
   * @param mean - Mean of the distribution (default 0)
   * @param stdDev - Standard deviation (default 1)
   */
  gaussian(mean: number = 0, stdDev: number = 1): number {
    // Box-Muller transform
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Generate a random point in a circle
   */
  inCircle(radius: number = 1): { x: number; y: number } {
    const angle = this.nextFloat(0, Math.PI * 2);
    const r = Math.sqrt(this.next()) * radius; // sqrt for uniform distribution
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    };
  }

  /**
   * Generate a random point in a rectangle
   */
  inRect(
    x: number,
    y: number,
    width: number,
    height: number
  ): { x: number; y: number } {
    return {
      x: this.nextFloat(x, x + width),
      y: this.nextFloat(y, y + height),
    };
  }
}

/**
 * Global random instance
 */
export const random = new Random();

/**
 * Utility functions for common random operations
 */
export const RandomUtils = {
  /**
   * Roll dice notation (e.g., "2d6" = roll 2 six-sided dice)
   */
  rollDice(notation: string, rng: Random = random): number {
    const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!match) {
      throw new Error(`Invalid dice notation: ${notation}`);
    }

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    let total = modifier;
    for (let i = 0; i < count; i++) {
      total += rng.nextInt(1, sides);
    }

    return total;
  },

  /**
   * Roll with advantage (roll twice, take highest)
   */
  rollWithAdvantage(min: number, max: number, rng: Random = random): number {
    const roll1 = rng.nextInt(min, max);
    const roll2 = rng.nextInt(min, max);
    return Math.max(roll1, roll2);
  },

  /**
   * Roll with disadvantage (roll twice, take lowest)
   */
  rollWithDisadvantage(
    min: number,
    max: number,
    rng: Random = random
  ): number {
    const roll1 = rng.nextInt(min, max);
    const roll2 = rng.nextInt(min, max);
    return Math.min(roll1, roll2);
  },

  /**
   * Percentage chance check
   */
  chance(percentage: number, rng: Random = random): boolean {
    return rng.next() < percentage / 100;
  },

  /**
   * Generate a UUID-like random ID
   */
  generateId(rng: Random = random): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = rng.nextInt(0, 15);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
};
