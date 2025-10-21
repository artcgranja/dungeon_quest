/**
 * Enemy Renderer - Renders enemy entities
 */

import type { EntityRenderer } from './EntityRenderer';
import type { World } from '../../core/ecs/World';
import type { Entity } from '../../core/ecs/Entity';
import type { TransformComponent, SpriteComponent } from '../../core/ecs/ComponentTypes';
import { DrawingUtils } from './DrawingUtils';

export class EnemyRenderer implements EntityRenderer {
  render(
    entity: Entity,
    world: World,
    transform: TransformComponent,
    sprite: SpriteComponent
  ): void {
    const graphics = sprite.graphics;

    // Draw shadow
    DrawingUtils.drawShadow(graphics, transform.x, transform.y, transform.width, transform.height);

    // Draw enemy body
    DrawingUtils.drawRectEntity(
      graphics,
      transform.x,
      transform.y,
      transform.width,
      transform.height,
      sprite.color
    );

    // Draw eyes
    DrawingUtils.drawEyes(graphics, transform.x, transform.y);

    // Draw health bar
    const health = world.getComponent(entity, 'Health');
    if (health) {
      DrawingUtils.drawHealthBar(
        graphics,
        transform.x,
        transform.y,
        transform.width,
        health.current,
        health.max
      );
    }
  }
}
