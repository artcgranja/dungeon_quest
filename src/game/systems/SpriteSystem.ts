/**
 * SpriteSystem - Handles rendering of sprites based on components
 * Reads Transform + Sprite components and updates graphics
 */

import { System } from '../../core/ecs/System';

export class SpriteSystem extends System {
  readonly requiredComponents = ['Transform', 'Sprite'] as const;

  update(_delta: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const transform = this.world.getComponent(entity, 'Transform');
      const sprite = this.world.getComponent(entity, 'Sprite');

      if (!transform || !sprite) continue;

      // Clear previous frame
      sprite.graphics.clear();

      // Draw shadow
      sprite.graphics.fillStyle(0x000000, 0.3);
      sprite.graphics.fillEllipse(
        transform.x + transform.width / 2,
        transform.y + transform.height + 5,
        transform.width / 2,
        5
      );

      // Draw entity body
      sprite.graphics.fillStyle(sprite.color);
      sprite.graphics.fillRect(transform.x, transform.y, transform.width, transform.height);

      // Draw player-specific visuals
      const playerComponent = this.world.getComponent(entity, 'Player');
      if (playerComponent) {
        this.drawPlayer(entity, transform, sprite);
      }

      // Draw enemy-specific visuals
      const enemyComponent = this.world.getComponent(entity, 'Enemy');
      if (enemyComponent) {
        this.drawEnemy(entity, transform, sprite);
      }
    }
  }

  /**
   * Draw player-specific visuals
   */
  private drawPlayer(entity: any, transform: any, sprite: any): void {
    const movement = this.world.getComponent(entity, 'Movement');
    const combat = this.world.getComponent(entity, 'Combat');

    // Draw direction indicator
    sprite.graphics.fillStyle(0x45b393);
    switch (movement?.direction) {
      case 'up':
        sprite.graphics.fillRect(transform.x + 8, transform.y, 14, 10);
        break;
      case 'down':
        sprite.graphics.fillRect(transform.x + 8, transform.y + 20, 14, 10);
        break;
      case 'left':
        sprite.graphics.fillRect(transform.x, transform.y + 8, 10, 14);
        break;
      case 'right':
        sprite.graphics.fillRect(transform.x + 20, transform.y + 8, 10, 14);
        break;
    }

    // Draw attack animation
    if (combat?.isAttacking && combat.attackAnimationTime > 0) {
      sprite.graphics.lineStyle(3, 0xe94560);

      const attackOffset = 35;
      const attackRange = combat.attackRange;

      switch (movement?.direction) {
        case 'up':
          sprite.graphics.arc(
            transform.x + transform.width / 2,
            transform.y - attackOffset,
            attackRange / 2,
            Math.PI,
            0,
            true
          );
          break;
        case 'down':
          sprite.graphics.arc(
            transform.x + transform.width / 2,
            transform.y + transform.height + attackOffset,
            attackRange / 2,
            0,
            Math.PI,
            true
          );
          break;
        case 'left':
          sprite.graphics.arc(
            transform.x - attackOffset,
            transform.y + transform.height / 2,
            attackRange / 2,
            -Math.PI / 2,
            Math.PI / 2,
            true
          );
          break;
        case 'right':
          sprite.graphics.arc(
            transform.x + transform.width + attackOffset,
            transform.y + transform.height / 2,
            attackRange / 2,
            Math.PI / 2,
            -Math.PI / 2,
            true
          );
          break;
      }
      sprite.graphics.strokePath();
    }
  }

  /**
   * Draw enemy-specific visuals
   */
  private drawEnemy(entity: any, transform: any, sprite: any): void {
    const health = this.world.getComponent(entity, 'Health');

    // Draw eyes
    sprite.graphics.fillStyle(0xffffff);
    sprite.graphics.fillRect(transform.x + 5, transform.y + 8, 5, 5);
    sprite.graphics.fillRect(transform.x + 15, transform.y + 8, 5, 5);

    // Draw health bar
    if (health) {
      const healthBarWidth = transform.width;
      const healthBarHeight = 4;
      const healthPercent = health.current / health.max;

      sprite.graphics.fillStyle(0x333333);
      sprite.graphics.fillRect(transform.x, transform.y - 10, healthBarWidth, healthBarHeight);

      sprite.graphics.fillStyle(0xe94560);
      sprite.graphics.fillRect(
        transform.x,
        transform.y - 10,
        healthBarWidth * healthPercent,
        healthBarHeight
      );
    }
  }
}
