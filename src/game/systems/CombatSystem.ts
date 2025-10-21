/**
 * CombatSystem - Handles combat logic
 * Processes attack requests and damage calculation
 */

import { System } from '../../core/ecs/System';
import { eventBus } from '../../core/events/EventBus';

export class CombatSystem extends System {
  readonly requiredComponents = ['Transform', 'Combat'] as const;

  update(delta: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const combat = this.world.getComponent(entity, 'Combat');
      if (!combat) continue;

      // Update attack animation timer
      if (combat.isAttacking && combat.attackAnimationTime > 0) {
        combat.attackAnimationTime -= delta;
        if (combat.attackAnimationTime <= 0) {
          combat.isAttacking = false;
        }
      }
    }
  }

  /**
   * Process attack from attacker to potential targets
   * Called externally (e.g., from input handler)
   */
  processAttack(attackerId: number, potentialTargets: number[]): void {
    const attacker = this.world.getEntity(attackerId);
    if (!attacker) return;

    const attackerTransform = this.world.getComponent(attacker, 'Transform');
    const attackerCombat = this.world.getComponent(attacker, 'Combat');
    const attackerMovement = this.world.getComponent(attacker, 'Movement');

    if (!attackerTransform || !attackerCombat) return;

    // Check cooldown
    const now = Date.now();
    if (now - attackerCombat.lastAttackTime < attackerCombat.attackCooldown) {
      return;
    }

    // Start attack animation
    attackerCombat.isAttacking = true;
    attackerCombat.attackAnimationTime = 300;
    attackerCombat.lastAttackTime = now;

    // Check each potential target
    for (const targetId of potentialTargets) {
      const target = this.world.getEntity(targetId);
      if (!target || !target.active) continue;

      const targetTransform = this.world.getComponent(target, 'Transform');
      const targetHealth = this.world.getComponent(target, 'Health');

      if (!targetTransform || !targetHealth) continue;

      // Check if target is in range and direction
      if (this.isInAttackRange(attackerTransform, attackerMovement?.direction || 'down', targetTransform, attackerCombat.attackRange)) {
        // Calculate damage
        const baseDamage = attackerCombat.damage;
        const randomVariance = Math.floor(Math.random() * 5);
        const totalDamage = baseDamage + randomVariance;

        // Apply damage
        this.dealDamage(attacker, target, totalDamage);
      }
    }
  }

  /**
   * Deal damage from attacker to target
   */
  private dealDamage(attacker: any, target: any, damage: number): void {
    const targetHealth = this.world.getComponent(target, 'Health');
    const targetCombat = this.world.getComponent(target, 'Combat');

    if (!targetHealth) return;

    // Calculate actual damage (apply defense)
    const defense = targetCombat?.defense || 0;
    const actualDamage = Math.max(1, damage - defense);

    // Apply damage
    targetHealth.current = Math.max(0, targetHealth.current - actualDamage);

    // Emit damage dealt event
    eventBus.emit('damage:dealt', {
      attacker,
      target,
      damage: actualDamage
    });

    // Emit health changed event
    eventBus.emit('health:changed', {
      entity: target,
      health: targetHealth.current,
      maxHealth: targetHealth.max
    });

    // Check if target died
    if (targetHealth.current === 0) {
      eventBus.emit('entity:died', { entity: target });
    }
  }

  /**
   * Check if target is in attack range and direction
   */
  private isInAttackRange(
    attackerTransform: any,
    attackerDirection: 'up' | 'down' | 'left' | 'right',
    targetTransform: any,
    attackRange: number
  ): boolean {
    const dx = targetTransform.x - attackerTransform.x;
    const dy = targetTransform.y - attackerTransform.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if in range
    const inRange = distance < attackRange;
    if (!inRange) return false;

    // Check if in direction
    let inDirection = false;
    switch (attackerDirection) {
      case 'up':
        inDirection = dy < 0 && Math.abs(dx) < attackRange / 2;
        break;
      case 'down':
        inDirection = dy > 0 && Math.abs(dx) < attackRange / 2;
        break;
      case 'left':
        inDirection = dx < 0 && Math.abs(dy) < attackRange / 2;
        break;
      case 'right':
        inDirection = dx > 0 && Math.abs(dy) < attackRange / 2;
        break;
    }

    return inDirection;
  }
}
