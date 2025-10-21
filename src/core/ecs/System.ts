import type { Entity } from './Entity';
import type { ComponentType, Component } from './Component';

/**
 * Base abstract class for all game systems
 * Systems contain logic and operate on entities with specific components
 */
export abstract class System {
  /**
   * Priority for system execution order (lower = earlier)
   * Default priority is 0
   */
  public readonly priority: number = 0;

  /**
   * Define which components this system requires
   * Systems will only process entities that have ALL these components
   */
  protected abstract readonly requiredComponents: ComponentType<any>[];

  /**
   * Optional components that the system can use but doesn't require
   */
  protected optionalComponents?: ComponentType<any>[];

  /**
   * Initialize the system (called once before first update)
   */
  init?(): void;

  /**
   * Update loop - called every frame
   * @param entities - All entities in the world
   * @param deltaTime - Time elapsed since last frame (in seconds)
   */
  abstract update(entities: readonly Entity[], deltaTime: number): void;

  /**
   * Cleanup - called when system is removed
   */
  destroy?(): void;

  /**
   * Filter entities that match this system's required components
   */
  protected filterEntities(entities: readonly Entity[]): Entity[] {
    return entities.filter((entity) =>
      entity.isActive() && entity.hasAllComponents(...this.requiredComponents)
    );
  }

  /**
   * Process each matching entity (helper method)
   */
  protected processEntity?(entity: Entity, deltaTime: number): void;

  /**
   * Get required component types
   */
  getRequiredComponents(): ComponentType<any>[] {
    return this.requiredComponents;
  }
}

/**
 * System that processes entities one by one
 * Automatically filters and iterates over matching entities
 */
export abstract class IteratingSystem extends System {
  update(entities: readonly Entity[], deltaTime: number): void {
    const matchingEntities = this.filterEntities(entities);

    for (const entity of matchingEntities) {
      this.processEntity(entity, deltaTime);
    }
  }

  /**
   * Process a single entity
   * Must be implemented by subclasses
   */
  protected abstract processEntity(entity: Entity, deltaTime: number): void;
}
