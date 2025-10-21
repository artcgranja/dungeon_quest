/**
 * SpriteSystem - Handles rendering of sprites based on components
 * Reads Transform + Sprite components and delegates to specialized renderers
 */

import { System } from '../../core/ecs/System';
import { PlayerRenderer } from '../../rendering/utils/PlayerRenderer';
import { EnemyRenderer } from '../../rendering/utils/EnemyRenderer';
import type { EntityRenderer } from '../../rendering/utils/EntityRenderer';

export class SpriteSystem extends System {
  readonly requiredComponents = ['Transform', 'Sprite'] as const;

  private playerRenderer: EntityRenderer = new PlayerRenderer();
  private enemyRenderer: EntityRenderer = new EnemyRenderer();

  update(_delta: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const transform = this.world.getComponent(entity, 'Transform');
      const sprite = this.world.getComponent(entity, 'Sprite');

      if (!transform || !sprite) continue;

      // Clear previous frame
      sprite.graphics.clear();

      // Determine which renderer to use
      const playerComponent = this.world.getComponent(entity, 'Player');
      const enemyComponent = this.world.getComponent(entity, 'Enemy');

      if (playerComponent) {
        this.playerRenderer.render(entity, this.world, transform, sprite);
      } else if (enemyComponent) {
        this.enemyRenderer.render(entity, this.world, transform, sprite);
      } else {
        // Generic rendering for entities without specific renderer
        sprite.graphics.fillStyle(sprite.color);
        sprite.graphics.fillRect(transform.x, transform.y, transform.width, transform.height);
      }
    }
  }
}
