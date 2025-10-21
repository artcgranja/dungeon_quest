import { IteratingSystem } from '@core/ecs';
import type { Entity } from '@core/ecs';
import { TransformComponent, MovementComponent } from '../components';

/**
 * MovementSystem - applies velocity to transform position
 * Processes entities with Transform and Movement components
 */
export class MovementSystem extends IteratingSystem {
  protected readonly requiredComponents = [TransformComponent, MovementComponent];
  public readonly priority = 10; // Execute early

  protected processEntity(entity: Entity, deltaTime: number): void {
    const transform = entity.getComponent(TransformComponent)!;
    const movement = entity.getComponent(MovementComponent)!;

    // Apply velocity to position
    if (!movement.velocity.isZero()) {
      const displacement = movement.velocity.multiply(deltaTime);
      transform.translate(displacement);

      // Apply friction
      movement.applyFriction(deltaTime);
    }
  }
}
