/**
 * World - Manages all entities, components, and systems
 * Central ECS coordinator
 */

import { Entity, type EntityId } from './Entity';
import type { Component } from './Component';
import type { System } from './System';
import type { ComponentTypeName, ComponentTypeMap } from './ComponentTypes';

export class World {
  private entities: Map<EntityId, Entity> = new Map();
  private components: Map<EntityId, Map<string, Component>> = new Map();
  private systems: System[] = [];

  /**
   * Create a new entity
   */
  createEntity(): Entity {
    const entity = new Entity();
    this.entities.set(entity.id, entity);
    this.components.set(entity.id, new Map());
    return entity;
  }

  /**
   * Remove an entity and all its components
   */
  removeEntity(entity: Entity | EntityId): void {
    const id = typeof entity === 'number' ? entity : entity.id;

    this.components.delete(id);
    this.entities.delete(id);
  }

  /**
   * Get entity by ID
   */
  getEntity(id: EntityId): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Add a component to an entity
   */
  addComponent<T extends Component>(entity: Entity | EntityId, component: T): void {
    const id = typeof entity === 'number' ? entity : entity.id;
    const entityComponents = this.components.get(id);

    if (!entityComponents) {
      console.warn(`Entity ${id} not found when adding component`);
      return;
    }

    entityComponents.set(component.type, component);
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entity: Entity | EntityId, componentType: ComponentTypeName): void {
    const id = typeof entity === 'number' ? entity : entity.id;
    const entityComponents = this.components.get(id);

    if (entityComponents) {
      entityComponents.delete(componentType);
    }
  }

  /**
   * Get a specific component from an entity
   */
  getComponent<K extends ComponentTypeName>(
    entity: Entity | EntityId,
    componentType: K
  ): ComponentTypeMap[K] | undefined {
    const id = typeof entity === 'number' ? entity : entity.id;
    const entityComponents = this.components.get(id);

    if (!entityComponents) {
      return undefined;
    }

    return entityComponents.get(componentType) as ComponentTypeMap[K] | undefined;
  }

  /**
   * Check if entity has a component
   */
  hasComponent(entity: Entity | EntityId, componentType: ComponentTypeName): boolean {
    const id = typeof entity === 'number' ? entity : entity.id;
    const entityComponents = this.components.get(id);
    return entityComponents?.has(componentType) ?? false;
  }

  /**
   * Check if entity has all specified components
   */
  hasAllComponents(entity: Entity | EntityId, ...componentTypes: ComponentTypeName[]): boolean {
    return componentTypes.every(type => this.hasComponent(entity, type));
  }

  /**
   * Query entities that have ALL specified components
   */
  queryEntities(...componentTypes: ComponentTypeName[]): Entity[] {
    const result: Entity[] = [];

    for (const entity of this.entities.values()) {
      if (!entity.active) continue;

      if (this.hasAllComponents(entity, ...componentTypes)) {
        result.push(entity);
      }
    }

    return result;
  }

  /**
   * Add a system to the world
   */
  addSystem(system: System): void {
    system.init(this);
    this.systems.push(system);
  }

  /**
   * Remove a system from the world
   */
  removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems[index].destroy();
      this.systems.splice(index, 1);
    }
  }

  /**
   * Update all systems
   * @param delta - Time elapsed since last frame (in milliseconds)
   */
  update(delta: number): void {
    for (const system of this.systems) {
      system.update(delta);
    }
  }

  /**
   * Cleanup world
   */
  destroy(): void {
    // Destroy all systems
    for (const system of this.systems) {
      system.destroy();
    }
    this.systems = [];

    // Clear all entities and components
    this.entities.clear();
    this.components.clear();
  }

  /**
   * Get all entities (for debugging)
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Get entity count (for debugging)
   */
  getEntityCount(): number {
    return this.entities.size;
  }
}
