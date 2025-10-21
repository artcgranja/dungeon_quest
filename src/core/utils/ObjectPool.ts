/**
 * ObjectPool - Reusable object pool for performance optimization
 * Reduces garbage collection by reusing objects instead of creating new ones
 */
export class ObjectPool<T> {
  private available: T[];
  private inUse: Set<T>;
  private maxSize: number;

  /**
   * Create an object pool
   * @param factory - Function to create new objects
   * @param reset - Function to reset object state before reuse
   * @param initialSize - Number of objects to pre-allocate
   * @param maxSize - Maximum pool size (0 = unlimited)
   */
  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize: number = 0,
    maxSize: number = 0
  ) {
    this.available = [];
    this.inUse = new Set();
    this.maxSize = maxSize;

    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  /**
   * Acquire an object from the pool
   * Creates a new one if pool is empty
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
   * Release an object back to the pool
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      console.warn('Attempting to release object not acquired from pool');
      return;
    }

    this.inUse.delete(obj);

    // Reset object state
    this.reset(obj);

    // Return to pool if under max size
    if (this.maxSize === 0 || this.available.length < this.maxSize) {
      this.available.push(obj);
    }
    // Otherwise let it be garbage collected
  }

  /**
   * Release all in-use objects
   */
  releaseAll(): void {
    for (const obj of this.inUse) {
      this.reset(obj);
      if (this.maxSize === 0 || this.available.length < this.maxSize) {
        this.available.push(obj);
      }
    }
    this.inUse.clear();
  }

  /**
   * Clear the pool completely
   */
  clear(): void {
    this.available = [];
    this.inUse.clear();
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    available: number;
    inUse: number;
    total: number;
  } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }

  /**
   * Pre-warm the pool by creating objects
   */
  prewarm(count: number): void {
    for (let i = 0; i < count; i++) {
      this.available.push(this.factory());
    }
  }
}

/**
 * Simple object pool without tracking (lighter weight)
 */
export class SimplePool<T> {
  private pool: T[];

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize: number = 0
  ) {
    this.pool = [];
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  /**
   * Get an object from the pool
   */
  get(): T {
    return this.pool.pop() ?? this.factory();
  }

  /**
   * Return an object to the pool
   */
  put(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }

  /**
   * Get pool size
   */
  size(): number {
    return this.pool.length;
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
  }
}

/**
 * Poolable interface - objects that can be pooled should implement this
 */
export interface Poolable {
  /**
   * Reset object state for reuse
   */
  reset(): void;

  /**
   * Optional: called when object is acquired from pool
   */
  onAcquire?(): void;

  /**
   * Optional: called when object is released to pool
   */
  onRelease?(): void;
}

/**
 * Create a pool for poolable objects
 */
export function createPoolablePool<T extends Poolable>(
  factory: () => T,
  initialSize: number = 0,
  maxSize: number = 0
): ObjectPool<T> {
  return new ObjectPool(
    factory,
    (obj) => {
      if (obj.onRelease) obj.onRelease();
      obj.reset();
    },
    initialSize,
    maxSize
  );
}
