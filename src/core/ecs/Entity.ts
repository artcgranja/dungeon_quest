import type { Component, ComponentType } from './Component';

/**
 * Unique entity identifier
 */
export type EntityId = string;

/**
 * Entity class - a container for components
 * Entities have no behavior, only data through components
 */
export class Entity {
  private static nextId = 0;

  public readonly id: EntityId;
  private components: Map<string, Component>;
  private _active: boolean;

  constructor(id?: EntityId) {
    this.id = id ?? `entity_${Entity.nextId++}`;
    this.components = new Map();
    this._active = true;
  }

  /**
   * Add a component to this entity
   */
  addComponent<T extends Component>(component: T): this {
    this.components.set(component.type, component);
    return this;
  }

  /**
   * Remove a component from this entity
   */
  removeComponent<T extends Component>(type: ComponentType<T>): this {
    this.components.delete(type.TYPE);
    return this;
  }

  /**
   * Get a component from this entity
   * Returns null if component doesn't exist
   */
  getComponent<T extends Component>(type: ComponentType<T>): T | null {
    return (this.components.get(type.TYPE) as T) ?? null;
  }

  /**
   * Check if entity has a specific component
   */
  hasComponent<T extends Component>(type: ComponentType<T>): boolean {
    return this.components.has(type.TYPE);
  }

  /**
   * Check if entity has all specified components
   */
  hasAllComponents(...types: ComponentType<any>[]): boolean {
    return types.every((type) => this.hasComponent(type));
  }

  /**
   * Check if entity has any of the specified components
   */
  hasAnyComponent(...types: ComponentType<any>[]): boolean {
    return types.some((type) => this.hasComponent(type));
  }

  /**
   * Get all components attached to this entity
   */
  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Get all component types attached to this entity
   */
  getComponentTypes(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Mark entity as inactive (for removal)
   */
  destroy(): void {
    this._active = false;
  }

  /**
   * Check if entity is active
   */
  isActive(): boolean {
    return this._active;
  }

  /**
   * Clone this entity (creates a new entity with copied components)
   */
  clone(newId?: EntityId): Entity {
    const cloned = new Entity(newId);

    for (const component of this.components.values()) {
      if (component.clone) {
        cloned.addComponent(component.clone());
      }
    }

    return cloned;
  }
}
