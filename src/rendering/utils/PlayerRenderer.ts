/**
 * Player Renderer - Renders player entity
 */

import type { EntityRenderer } from './EntityRenderer';
import type { World } from '../../core/ecs/World';
import type { Entity } from '../../core/ecs/Entity';
import type { TransformComponent, SpriteComponent } from '../../core/ecs/ComponentTypes';
import { DrawingUtils } from './DrawingUtils';
import { GameColors } from './ColorPalette';

export class PlayerRenderer implements EntityRenderer {
  render(
    entity: Entity,
    world: World,
    transform: TransformComponent,
    sprite: SpriteComponent
  ): void {
    const graphics = sprite.graphics;

    // Draw shadow
    DrawingUtils.drawShadow(graphics, transform.x, transform.y, transform.width, transform.height);

    // Draw player body
    DrawingUtils.drawRectEntity(
      graphics,
      transform.x,
      transform.y,
      transform.width,
      transform.height,
      GameColors.player
    );

    // Draw direction indicator
    const movement = world.getComponent(entity, 'Movement');
    if (movement) {
      DrawingUtils.drawDirectionIndicator(
        graphics,
        transform.x,
        transform.y,
        transform.width,
        transform.height,
        movement.direction,
        GameColors.playerDark
      );
    }

    // Draw attack animation
    const combat = world.getComponent(entity, 'Combat');
    if (combat?.isAttacking && combat.attackAnimationTime > 0) {
      if (movement) {
        DrawingUtils.drawAttackArc(
          graphics,
          transform.x,
          transform.y,
          transform.width,
          transform.height,
          movement.direction,
          combat.attackRange
        );
      }
    }
  }
}
