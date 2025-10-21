/**
 * MovementSystem - Handles entity movement
 * Processes entities with Transform and Movement components
 */

import { System } from '../../core/ecs/System';
import type { Dungeon } from '../Dungeon';

export class MovementSystem extends System {
  readonly requiredComponents = ['Transform', 'Movement'] as const;

  private dungeon: Dungeon | null = null;

  setDungeon(dungeon: Dungeon): void {
    this.dungeon = dungeon;
  }

  update(_delta: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const transform = this.world.getComponent(entity, 'Transform');
      const movement = this.world.getComponent(entity, 'Movement');

      if (!transform || !movement) continue;

      // Apply velocity if set
      if (movement.velocityX !== 0 || movement.velocityY !== 0) {
        const newX = transform.x + movement.velocityX * movement.speed;
        const newY = transform.y + movement.velocityY * movement.speed;

        // Check collision with walls if dungeon is set
        if (this.dungeon) {
          if (!this.dungeon.isWall(newX, transform.y, transform.width, transform.height)) {
            transform.x = newX;
          }
          if (!this.dungeon.isWall(transform.x, newY, transform.width, transform.height)) {
            transform.y = newY;
          }
        } else {
          // No collision checking
          transform.x = newX;
          transform.y = newY;
        }

        // Update direction based on velocity
        if (movement.velocityX > 0) movement.direction = 'right';
        else if (movement.velocityX < 0) movement.direction = 'left';
        else if (movement.velocityY > 0) movement.direction = 'down';
        else if (movement.velocityY < 0) movement.direction = 'up';
      }

      // Keep entity in bounds (assuming 800x600 world)
      transform.x = Math.max(0, Math.min(800 - transform.width, transform.x));
      transform.y = Math.max(0, Math.min(600 - transform.height, transform.y));
    }
  }
}
