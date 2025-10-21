/**
 * ObjectPool - Generic object pooling for performance
 * Reuse objects instead of creating/destroying them
 */

export class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private reset?: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset?: (obj: T) => void,
    initialSize: number = 10,
    maxSize: number = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  /**
   * Get an object from the pool
   */
  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      console.warn('Attempting to release object not acquired from pool');
      return;
    }

    this.inUse.delete(obj);

    // Reset object if reset function provided
    if (this.reset) {
      this.reset(obj);
    }

    // Only keep if pool is not at max size
    if (this.available.length < this.maxSize) {
      this.available.push(obj);
    }
  }

  /**
   * Release all objects
   */
  releaseAll(): void {
    for (const obj of this.inUse) {
      if (this.reset) {
        this.reset(obj);
      }
      if (this.available.length < this.maxSize) {
        this.available.push(obj);
      }
    }
    this.inUse.clear();
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.available = [];
    this.inUse.clear();
  }

  /**
   * Get pool statistics
   */
  getStats(): { available: number; inUse: number; total: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }

  /**
   * Get number of available objects
   */
  getAvailableCount(): number {
    return this.available.length;
  }

  /**
   * Get number of in-use objects
   */
  getInUseCount(): number {
    return this.inUse.size;
  }
}
