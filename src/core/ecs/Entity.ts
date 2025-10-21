/**
 * Entity - Unique ID with a bag of components
 * An entity is just an ID that holds components
 */

let nextEntityId = 0;

export type EntityId = number;

export class Entity {
  public readonly id: EntityId;
  public active: boolean = true;

  constructor() {
    this.id = nextEntityId++;
  }

  /**
   * Reset the entity ID counter (useful for testing)
   */
  static resetIdCounter() {
    nextEntityId = 0;
  }
}
