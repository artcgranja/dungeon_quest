/**
 * Entity Renderer Interface
 * Base interface for all entity-specific renderers
 */

import type { World } from '../../core/ecs/World';
import type { Entity } from '../../core/ecs/Entity';
import type { TransformComponent, SpriteComponent } from '../../core/ecs/ComponentTypes';

export interface EntityRenderer {
  /**
   * Render the entity
   */
  render(
    entity: Entity,
    world: World,
    transform: TransformComponent,
    sprite: SpriteComponent
  ): void;
}
