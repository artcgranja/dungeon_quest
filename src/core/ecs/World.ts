import { Entity, type EntityId } from './Entity';
import type { System } from './System';
import type { Component, ComponentType } from './Component';

/**
 * World - manages all entities and systems
 * Central ECS coordinator
 */
export class World {
  private entities: Map<EntityId, Entity>;
  private systems: System[];
  private entitiesToAdd: Entity[];
  private entitiesToRemove: EntityId[];

  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.entitiesToAdd = [];
    this.entitiesToRemove = [];
  }

  // ==================== Entity Management ====================

  /**
   * Create and add a new entity to the world
   */
  createEntity(id?: EntityId): Entity {
    const entity = new Entity(id);
    this.entitiesToAdd.push(entity);
    return entity;
  }

  /**
   * Add an existing entity to the world
   */
  addEntity(entity: Entity): void {
    this.entitiesToAdd.push(entity);
  }

  /**
   * Remove an entity from the world
   */
  removeEntity(entityId: EntityId): void {
    this.entitiesToRemove.push(entityId);
  }

  /**
   * Destroy an entity (marks for removal)
   */
  destroyEntity(entityId: EntityId): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.destroy();
      this.entitiesToRemove.push(entityId);
    }
  }

  /**
   * Get an entity by ID
   */
  getEntity(entityId: EntityId): Entity | null {
    return this.entities.get(entityId) ?? null;
  }

  /**
   * Get all entities
   */
  getEntities(): readonly Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Get all active entities
   */
  getActiveEntities(): Entity[] {
    return Array.from(this.entities.values()).filter((e) => e.isActive());
  }

  /**
   * Query entities by component types
   */
  queryEntities(...componentTypes: ComponentType<any>[]): Entity[] {
    return this.getActiveEntities().filter((entity) =>
      entity.hasAllComponents(...componentTypes)
    );
  }

  /**
   * Query entities that have any of the specified components
   */
  queryEntitiesAny(...componentTypes: ComponentType<any>[]): Entity[] {
    return this.getActiveEntities().filter((entity) =>
      entity.hasAnyComponent(...componentTypes)
    );
  }

  /**
   * Find first entity with specific components
   */
  findEntity(...componentTypes: ComponentType<any>[]): Entity | null {
    return this.getActiveEntities().find((entity) =>
      entity.hasAllComponents(...componentTypes)
    ) ?? null;
  }

  /**
   * Clear all entities from the world
   */
  clearEntities(): void {
    this.entities.clear();
    this.entitiesToAdd = [];
    this.entitiesToRemove = [];
  }

  // ==================== System Management ====================

  /**
   * Add a system to the world
   */
  addSystem(system: System): void {
    this.systems.push(system);
    // Sort by priority (lower priority = executed first)
    this.systems.sort((a, b) => a.priority - b.priority);

    // Initialize system if it has an init method
    if (system.init) {
      system.init();
    }
  }

  /**
   * Remove a system from the world
   */
  removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      if (system.destroy) {
        system.destroy();
      }
      this.systems.splice(index, 1);
    }
  }

  /**
   * Get all systems
   */
  getSystems(): readonly System[] {
    return this.systems;
  }

  /**
   * Clear all systems
   */
  clearSystems(): void {
    this.systems.forEach((system) => {
      if (system.destroy) {
        system.destroy();
      }
    });
    this.systems = [];
  }

  // ==================== Update Loop ====================

  /**
   * Update all systems (called every frame)
   */
  update(deltaTime: number): void {
    // Process pending entity additions/removals
    this.processPendingEntities();

    // Update all systems in priority order
    const activeEntities = this.getActiveEntities();
    for (const system of this.systems) {
      system.update(activeEntities, deltaTime);
    }

    // Clean up destroyed entities
    this.processPendingEntities();
  }

  /**
   * Process entities queued for addition or removal
   */
  private processPendingEntities(): void {
    // Add new entities
    for (const entity of this.entitiesToAdd) {
      this.entities.set(entity.id, entity);
    }
    this.entitiesToAdd = [];

    // Remove destroyed entities
    for (const entityId of this.entitiesToRemove) {
      this.entities.delete(entityId);
    }
    this.entitiesToRemove = [];
  }

  /**
   * Get world statistics
   */
  getStats(): {
    entityCount: number;
    activeEntityCount: number;
    systemCount: number;
  } {
    return {
      entityCount: this.entities.size,
      activeEntityCount: this.getActiveEntities().length,
      systemCount: this.systems.length,
    };
  }

  /**
   * Destroy the world and cleanup
   */
  destroy(): void {
    this.clearSystems();
    this.clearEntities();
  }
}
