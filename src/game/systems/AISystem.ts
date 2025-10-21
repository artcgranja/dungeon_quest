/**
 * AISystem - Handles enemy AI behavior
 * Processes entities with AI, Transform, and Movement components
 */

import { System } from '../../core/ecs/System';
import type { Dungeon } from '../Dungeon';
import { eventBus } from '../../core/events/EventBus';

export class AISystem extends System {
  readonly requiredComponents = ['AI', 'Transform', 'Movement'] as const;

  private playerEntityId: number | null = null;

  setDungeon(_dungeon: Dungeon): void {
    // Dungeon reference not needed for now (collision handled by MovementSystem)
  }

  setPlayerEntity(playerId: number): void {
    this.playerEntityId = playerId;
  }

  update(_delta: number): void {
    if (this.playerEntityId === null) return;

    const player = this.world.getEntity(this.playerEntityId);
    if (!player) return;

    const playerTransform = this.world.getComponent(player, 'Transform');
    if (!playerTransform) return;

    const entities = this.getEntities();

    for (const entity of entities) {
      const ai = this.world.getComponent(entity, 'AI');
      const transform = this.world.getComponent(entity, 'Transform');
      const movement = this.world.getComponent(entity, 'Movement');
      const combat = this.world.getComponent(entity, 'Combat');

      if (!ai || !transform || !movement) continue;

      // Calculate distance to player
      const dx = playerTransform.x - transform.x;
      const dy = playerTransform.y - transform.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Reset velocity
      movement.velocityX = 0;
      movement.velocityY = 0;

      // Check if player is in aggro range
      if (distance < ai.aggroRange) {
        // Check if in attack range
        if (combat && distance <= combat.attackRange) {
          // Attack player
          this.attackTarget(entity, player, combat);
        } else {
          // Chase player
          this.chaseTarget(entity, playerTransform, transform, movement);
        }
      }
    }
  }

  /**
   * Chase behavior - move towards target
   */
  private chaseTarget(_entity: any, targetTransform: any, transform: any, movement: any): void {
    const dx = targetTransform.x - transform.x;
    const dy = targetTransform.y - transform.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Normalize and set velocity
      movement.velocityX = dx / distance;
      movement.velocityY = dy / distance;
    }
  }

  /**
   * Attack target (check cooldown and deal damage)
   */
  private attackTarget(entity: any, target: any, combat: any): void {
    const now = Date.now();
    if (now - combat.lastAttackTime > combat.attackCooldown) {
      // Get player health
      const targetHealth = this.world.getComponent(target, 'Health');
      const targetCombat = this.world.getComponent(target, 'Combat');

      if (targetHealth) {
        // Calculate damage
        const baseDamage = combat.damage;
        const defense = targetCombat?.defense || 0;
        const actualDamage = Math.max(1, baseDamage - defense);

        // Apply damage
        targetHealth.current = Math.max(0, targetHealth.current - actualDamage);

        // Update last attack time
        combat.lastAttackTime = now;

        // Emit events
        eventBus.emit('damage:dealt', {
          attacker: entity,
          target: target,
          damage: actualDamage
        });

        eventBus.emit('health:changed', {
          entity: target,
          health: targetHealth.current,
          maxHealth: targetHealth.max
        });

        // Check if player died
        if (targetHealth.current === 0) {
          eventBus.emit('entity:died', { entity: target });
        }
      }
    }
  }
}
