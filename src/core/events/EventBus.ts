/**
 * EventBus - Type-safe pub/sub event system
 * Enables decoupled communication between systems
 */

import type { GameEventType, GameEventData } from './GameEvents';

type EventHandler<T extends GameEventType> = (data: GameEventData<T>) => void;

export class EventBus {
  private listeners: Map<string, Set<EventHandler<any>>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T extends GameEventType>(eventType: T, handler: EventHandler<T>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(handler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends GameEventType>(eventType: T, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Subscribe to an event for one invocation only
   */
  once<T extends GameEventType>(eventType: T, handler: EventHandler<T>): void {
    const onceHandler: EventHandler<T> = (data) => {
      handler(data);
      this.off(eventType, onceHandler);
    };

    this.on(eventType, onceHandler);
  }

  /**
   * Emit an event
   */
  emit<T extends GameEventType>(eventType: T, data: GameEventData<T>): void {
    const handlers = this.listeners.get(eventType);

    if (handlers) {
      // Create a copy to avoid issues if handlers modify the set
      const handlersCopy = Array.from(handlers);
      for (const handler of handlersCopy) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for '${eventType}':`, error);
        }
      }
    }
  }

  /**
   * Remove all listeners for an event
   */
  clear(eventType?: GameEventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get number of listeners for an event (for debugging)
   */
  getListenerCount(eventType: GameEventType): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }
}

// Global singleton instance
export const eventBus = new EventBus();
