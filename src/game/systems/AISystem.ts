import { IteratingSystem } from '@core/ecs';
import type { Entity } from '@core/ecs';
import { EventBus } from '@core/events';
import { Vector2D } from '@core/utils';
import {
  TransformComponent,
  MovementComponent,
  AIComponent,
  AIBehaviorType,
  AIState,
  CombatComponent,
  PlayerComponent,
} from '../components';

/**
 * AISystem - controls enemy behavior and decision-making
 */
export class AISystem extends IteratingSystem {
  protected readonly requiredComponents = [
    TransformComponent,
    MovementComponent,
    AIComponent,
  ];
  public readonly priority = 25; // After collision, before rendering

  private eventBus: EventBus;
  private playerEntity: Entity | null = null;

  constructor(eventBus: EventBus) {
    super();
    this.eventBus = eventBus;
  }

  update(entities: readonly Entity[], deltaTime: number): void {
    // Find player entity
    this.playerEntity = this.findPlayer(entities);

    // Process AI entities
    super.update(entities, deltaTime);
  }

  protected processEntity(entity: Entity, deltaTime: number): void {
    const ai = entity.getComponent(AIComponent)!;
    const transform = entity.getComponent(TransformComponent)!;
    const movement = entity.getComponent(MovementComponent)!;

    // Dead entities don't think
    if (ai.state === AIState.DEAD) return;

    // No player, go idle
    if (!this.playerEntity) {
      ai.setState(AIState.IDLE);
      movement.stop();
      return;
    }

    const playerTransform = this.playerEntity.getComponent(TransformComponent)!;

    // Calculate distance to player
    const distanceToPlayer = transform.position.distanceTo(playerTransform.position);

    // Decide behavior based on type and state
    switch (ai.behaviorType) {
      case AIBehaviorType.AGGRESSIVE:
        this.updateAggressiveBehavior(entity, distanceToPlayer, deltaTime);
        break;

      case AIBehaviorType.RANGED:
        this.updateRangedBehavior(entity, distanceToPlayer, deltaTime);
        break;

      case AIBehaviorType.PATROL:
        this.updatePatrolBehavior(entity, distanceToPlayer, deltaTime);
        break;

      case AIBehaviorType.FLEE:
        this.updateFleeBehavior(entity, distanceToPlayer, deltaTime);
        break;

      default:
        ai.setState(AIState.IDLE);
        movement.stop();
    }
  }

  /**
   * Aggressive behavior - chase and attack player
   */
  private updateAggressiveBehavior(
    entity: Entity,
    distanceToPlayer: number,
    deltaTime: number
  ): void {
    const ai = entity.getComponent(AIComponent)!;
    const transform = entity.getComponent(TransformComponent)!;
    const movement = entity.getComponent(MovementComponent)!;
    const combat = entity.getComponent(CombatComponent);

    const playerTransform = this.playerEntity!.getComponent(TransformComponent)!;

    // In aggro range?
    if (distanceToPlayer <= ai.aggroRange) {
      ai.setTarget(this.playerEntity!.id);

      // In attack range?
      if (distanceToPlayer <= ai.attackRange) {
        ai.setState(AIState.ATTACK);
        movement.stop();

        // Perform attack
        if (combat && combat.canAttack()) {
          this.eventBus.emit('combat:attack', {
            attacker: entity,
            target: this.playerEntity,
          });
        }
      } else {
        // Chase player
        ai.setState(AIState.CHASE);
        this.moveTowards(entity, playerTransform.position, deltaTime);
      }
    } else {
      // Out of range, go idle
      ai.setState(AIState.IDLE);
      ai.clearTarget();
      movement.stop();
    }
  }

  /**
   * Ranged behavior - keep distance and attack
   */
  private updateRangedBehavior(
    entity: Entity,
    distanceToPlayer: number,
    deltaTime: number
  ): void {
    const ai = entity.getComponent(AIComponent)!;
    const transform = entity.getComponent(TransformComponent)!;
    const movement = entity.getComponent(MovementComponent)!;
    const combat = entity.getComponent(CombatComponent);

    const playerTransform = this.playerEntity!.getComponent(TransformComponent)!;

    const optimalRange = ai.attackRange * 0.8; // Keep some distance

    if (distanceToPlayer <= ai.aggroRange) {
      ai.setTarget(this.playerEntity!.id);

      if (distanceToPlayer < optimalRange) {
        // Too close, back away
        ai.setState(AIState.FLEE);
        this.moveAway(entity, playerTransform.position, deltaTime);
      } else if (distanceToPlayer > ai.attackRange) {
        // Too far, move closer
        ai.setState(AIState.CHASE);
        this.moveTowards(entity, playerTransform.position, deltaTime);
      } else {
        // Perfect range, attack
        ai.setState(AIState.ATTACK);
        movement.stop();

        if (combat && combat.canAttack()) {
          // TODO: Fire projectile
          this.eventBus.emit('combat:attack', {
            attacker: entity,
            target: this.playerEntity,
          });
        }
      }
    } else {
      ai.setState(AIState.IDLE);
      ai.clearTarget();
      movement.stop();
    }
  }

  /**
   * Patrol behavior - move between points, chase if player nearby
   */
  private updatePatrolBehavior(
    entity: Entity,
    distanceToPlayer: number,
    deltaTime: number
  ): void {
    const ai = entity.getComponent(AIComponent)!;
    const transform = entity.getComponent(TransformComponent)!;
    const movement = entity.getComponent(MovementComponent)!;

    // Player in aggro range? Switch to chase
    if (distanceToPlayer <= ai.aggroRange) {
      this.updateAggressiveBehavior(entity, distanceToPlayer, deltaTime);
      return;
    }

    // Patrol between points
    const patrolPoint = ai.getCurrentPatrolPoint();

    if (patrolPoint) {
      ai.setState(AIState.PATROL);
      const patrolPos = new Vector2D(patrolPoint.x, patrolPoint.y);
      const distanceToPatrol = transform.position.distanceTo(patrolPos);

      if (distanceToPatrol < 10) {
        // Reached patrol point, move to next
        ai.nextPatrolPoint();
      } else {
        this.moveTowards(entity, patrolPos, deltaTime);
      }
    } else {
      ai.setState(AIState.IDLE);
      movement.stop();
    }
  }

  /**
   * Flee behavior - run away from player
   */
  private updateFleeBehavior(
    entity: Entity,
    distanceToPlayer: number,
    deltaTime: number
  ): void {
    const ai = entity.getComponent(AIComponent)!;
    const movement = entity.getComponent(MovementComponent)!;
    const playerTransform = this.playerEntity!.getComponent(TransformComponent)!;

    const fleeRange = ai.aggroRange * 1.5;

    if (distanceToPlayer < fleeRange) {
      ai.setState(AIState.FLEE);
      this.moveAway(entity, playerTransform.position, deltaTime);
    } else {
      ai.setState(AIState.IDLE);
      movement.stop();
    }
  }

  /**
   * Move entity towards a target position
   */
  private moveTowards(
    entity: Entity,
    targetPos: Vector2D,
    deltaTime: number
  ): void {
    const transform = entity.getComponent(TransformComponent)!;
    const movement = entity.getComponent(MovementComponent)!;

    const direction = targetPos.subtract(transform.position).normalize();
    movement.moveInDirection(direction, deltaTime);

    // Face movement direction
    transform.lookAt(targetPos);
  }

  /**
   * Move entity away from a target position
   */
  private moveAway(entity: Entity, targetPos: Vector2D, deltaTime: number): void {
    const transform = entity.getComponent(TransformComponent)!;
    const movement = entity.getComponent(MovementComponent)!;

    const direction = transform.position.subtract(targetPos).normalize();
    movement.moveInDirection(direction, deltaTime);

    // Face away from target
    transform.rotation = direction.angle();
  }

  /**
   * Find the player entity
   */
  private findPlayer(entities: readonly Entity[]): Entity | null {
    return entities.find((e) => e.hasComponent(PlayerComponent)) ?? null;
  }
}
