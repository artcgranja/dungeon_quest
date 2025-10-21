/**
 * Event listener callback function
 */
export type EventListener<T = any> = (data: T) => void;

/**
 * Event subscription interface
 */
export interface EventSubscription {
  unsubscribe(): void;
}

/**
 * EventBus - centralized event system using Observer pattern
 * Enables decoupled communication between systems
 */
export class EventBus {
  private listeners: Map<string, Set<EventListener>>;
  private onceListeners: Map<string, Set<EventListener>>;

  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param event - Event name
   * @param callback - Function to call when event is emitted
   * @returns Subscription object with unsubscribe method
   */
  on<T = any>(event: string, callback: EventListener<T>): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listeners = this.listeners.get(event)!;
    listeners.add(callback);

    // Return subscription object
    return {
      unsubscribe: () => this.off(event, callback),
    };
  }

  /**
   * Subscribe to an event that fires only once
   * Automatically unsubscribes after first emission
   */
  once<T = any>(event: string, callback: EventListener<T>): EventSubscription {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }

    const listeners = this.onceListeners.get(event)!;
    listeners.add(callback);

    return {
      unsubscribe: () => {
        listeners.delete(callback);
      },
    };
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(event: string, callback: EventListener<T>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      // Clean up empty listener sets
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      onceListeners.delete(callback);
      if (onceListeners.size === 0) {
        this.onceListeners.delete(event);
      }
    }
  }

  /**
   * Emit an event with optional data
   * All subscribed listeners will be called synchronously
   */
  emit<T = any>(event: string, data?: T): void {
    // Call regular listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      // Create copy to avoid issues if listeners modify the set during iteration
      const listenersCopy = Array.from(listeners);
      for (const callback of listenersCopy) {
        callback(data);
      }
    }

    // Call and remove once listeners
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      const listenersCopy = Array.from(onceListeners);
      onceListeners.clear();
      this.onceListeners.delete(event);

      for (const callback of listenersCopy) {
        callback(data);
      }
    }
  }

  /**
   * Emit an event asynchronously (next tick)
   * Useful for avoiding race conditions
   */
  emitAsync<T = any>(event: string, data?: T): void {
    setTimeout(() => this.emit(event, data), 0);
  }

  /**
   * Remove all listeners for a specific event
   */
  clear(event: string): void {
    this.listeners.delete(event);
    this.onceListeners.delete(event);
  }

  /**
   * Remove all listeners for all events
   */
  clearAll(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }

  /**
   * Check if an event has any listeners
   */
  hasListeners(event: string): boolean {
    const regularListeners = this.listeners.get(event);
    const tempListeners = this.onceListeners.get(event);

    return (
      (regularListeners && regularListeners.size > 0) ||
      (tempListeners && tempListeners.size > 0) ||
      false
    );
  }

  /**
   * Get number of listeners for an event
   */
  listenerCount(event: string): number {
    const regularCount = this.listeners.get(event)?.size ?? 0;
    const onceCount = this.onceListeners.get(event)?.size ?? 0;
    return regularCount + onceCount;
  }

  /**
   * Get all registered event names
   */
  getEventNames(): string[] {
    const regular = Array.from(this.listeners.keys());
    const once = Array.from(this.onceListeners.keys());
    return [...new Set([...regular, ...once])];
  }

  /**
   * Get debug information
   */
  getStats(): {
    totalEvents: number;
    totalListeners: number;
    events: Record<string, number>;
  } {
    const stats = {
      totalEvents: 0,
      totalListeners: 0,
      events: {} as Record<string, number>,
    };

    for (const [event, listeners] of this.listeners) {
      const count = listeners.size;
      stats.events[event] = count;
      stats.totalListeners += count;
    }

    for (const [event, listeners] of this.onceListeners) {
      const count = listeners.size;
      stats.events[event] = (stats.events[event] ?? 0) + count;
      stats.totalListeners += count;
    }

    stats.totalEvents = Object.keys(stats.events).length;
    return stats;
  }
}

/**
 * Global event bus instance (singleton)
 * Can be imported and used throughout the application
 */
export const globalEventBus = new EventBus();
