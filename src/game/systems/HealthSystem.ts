/**
 * HealthSystem - Manages entity health and death
 */

import { System } from '../../core/ecs/System';
import { eventBus } from '../../core/events/EventBus';

export class HealthSystem extends System {
  readonly requiredComponents = ['Health'] as const;

  update(_delta: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const health = this.world.getComponent(entity, 'Health');
      if (!health) continue;

      // Check if entity is dead
      if (health.current <= 0) {
        this.handleDeath(entity);
      }
    }
  }

  /**
   * Handle entity death
   */
  private handleDeath(entity: any): void {
    // Check if this is an enemy
    const enemyComponent = this.world.getComponent(entity, 'Enemy');
    if (enemyComponent) {
      // Find the player (killer)
      const players = this.world.queryEntities('Player');
      const player = players[0]; // Assume single player

      if (player) {
        // Emit enemy killed event with exp reward
        eventBus.emit('enemy:killed', {
          enemy: entity,
          killer: player,
          expReward: enemyComponent.expReward
        });
      }
    }

    // Mark entity as inactive (will be cleaned up by GameScene)
    entity.active = false;
  }

  /**
   * Heal an entity
   */
  heal(entityId: number, amount: number): void {
    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const health = this.world.getComponent(entity, 'Health');
    if (!health) return;

    health.current = Math.min(health.max, health.current + amount);

    // Emit health changed event
    eventBus.emit('health:changed', {
      entity,
      health: health.current,
      maxHealth: health.max
    });
  }

  /**
   * Set max health and heal to full
   */
  setMaxHealth(entityId: number, newMax: number): void {
    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const health = this.world.getComponent(entity, 'Health');
    if (!health) return;

    health.max = newMax;
    health.current = newMax;

    // Emit health changed event
    eventBus.emit('health:changed', {
      entity,
      health: health.current,
      maxHealth: health.max
    });
  }
}
