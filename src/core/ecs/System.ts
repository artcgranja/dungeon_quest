/**
 * System - Contains game logic, operates on entities with specific components
 * Systems should ONLY contain logic, no data
 */

import type { Entity } from './Entity';
import type { World } from './World';
import type { ComponentTypeName } from './ComponentTypes';

export abstract class System {
  /**
   * List of required component types for this system
   * System will only process entities that have ALL these components
   */
  abstract readonly requiredComponents: readonly ComponentTypeName[];

  /**
   * Reference to the world (set by World when system is added)
   */
  protected world!: World;

  /**
   * Initialize the system
   * Called once when system is added to world
   */
  init(world: World): void {
    this.world = world;
  }

  /**
   * Update the system
   * Called every frame
   * @param delta - Time elapsed since last frame (in milliseconds)
   */
  abstract update(delta: number): void;

  /**
   * Cleanup when system is removed
   */
  destroy(): void {
    // Override if needed
  }

  /**
   * Helper: Get all entities that match this system's required components
   */
  protected getEntities(): Entity[] {
    return this.world.queryEntities(...this.requiredComponents);
  }
}
