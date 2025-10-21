/**
 * AnimationSystem - Manages entity animations
 * Updates animation states based on entity state
 */

import { System } from '../../core/ecs/System';
import { eventBus } from '../../core/events/EventBus';

export class AnimationSystem extends System {
  readonly requiredComponents = ['Animation'] as const;

  update(delta: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const animation = this.world.getComponent(entity, 'Animation');
      if (!animation) continue;

      // Update animation time
      animation.stateTime += delta;

      // Determine current state based on entity components
      this.updateAnimationState(entity);
    }
  }

  /**
   * Update animation state based on entity state
   */
  private updateAnimationState(entity: any): void {
    const animation = this.world.getComponent(entity, 'Animation');
    if (!animation) return;

    // Check for player
    const playerComponent = this.world.getComponent(entity, 'Player');
    if (playerComponent) {
      this.updatePlayerAnimationState(entity, animation);
      return;
    }

    // Check for enemy
    const enemyComponent = this.world.getComponent(entity, 'Enemy');
    if (enemyComponent) {
      this.updateEnemyAnimationState(entity, animation);
      return;
    }
  }

  /**
   * Update player animation state
   */
  private updatePlayerAnimationState(entity: any, animation: any): void {
    const movement = this.world.getComponent(entity, 'Movement');
    const combat = this.world.getComponent(entity, 'Combat');
    const health = this.world.getComponent(entity, 'Health');

    let newState = 'idle';

    // Priority: dead > attacking > moving > idle
    if (health && health.current <= 0) {
      newState = 'dead';
    } else if (combat?.isAttacking) {
      newState = 'attacking';
    } else if (movement && (movement.velocityX !== 0 || movement.velocityY !== 0)) {
      newState = 'walking';
    }

    this.changeState(animation, newState);
  }

  /**
   * Update enemy animation state
   */
  private updateEnemyAnimationState(entity: any, animation: any): void {
    const movement = this.world.getComponent(entity, 'Movement');
    const health = this.world.getComponent(entity, 'Health');
    const ai = this.world.getComponent(entity, 'AI');

    let newState = 'idle';

    // Priority: dead > attacking > chasing > idle
    if (health && health.current <= 0) {
      newState = 'dead';
    } else if (ai?.behavior === 'chase' && movement && (movement.velocityX !== 0 || movement.velocityY !== 0)) {
      newState = 'chasing';
    }

    this.changeState(animation, newState);
  }

  /**
   * Change animation state
   */
  private changeState(animation: any, newState: string): void {
    if (animation.currentState !== newState) {
      animation.previousState = animation.currentState;
      animation.currentState = newState;
      animation.stateTime = 0;
      animation.frameIndex = 0;

      // Emit state change event (for future use with actual sprite animations)
      eventBus.emit('ui:update', {
        type: 'stats',
        data: { animationState: newState }
      });
    }
  }
}
