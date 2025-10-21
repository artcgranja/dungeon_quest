import type { Entity } from '@core/ecs';

/**
 * Command interface - encapsulates an action
 * Command pattern allows decoupling input from game logic
 */
export interface Command {
  /**
   * Execute the command
   * @param entity - The entity to execute the command on
   * @param deltaTime - Time since last frame (for time-based commands)
   */
  execute(entity: Entity, deltaTime?: number): void;

  /**
   * Optional: Undo the command
   * Useful for replay systems or command history
   */
  undo?(entity: Entity): void;
}

/**
 * Null command - does nothing
 */
export class NullCommand implements Command {
  execute(): void {
    // Do nothing
  }
}

/**
 * Command that emits an event
 */
export class EventCommand implements Command {
  constructor(
    private eventName: string,
    private eventData?: any
  ) {}

  execute(): void {
    // Will be handled by systems listening to events
    // This is just a placeholder - actual event emission happens in InputManager
  }

  getEventName(): string {
    return this.eventName;
  }

  getEventData(): any {
    return this.eventData;
  }
}
