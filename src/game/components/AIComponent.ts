import { BaseComponent } from '@core/ecs';
import type { EntityId } from '@core/ecs';

/**
 * AI behavior types
 */
export enum AIBehaviorType {
  IDLE = 'idle',
  AGGRESSIVE = 'aggressive', // Chase and attack
  RANGED = 'ranged', // Keep distance and shoot
  PATROL = 'patrol', // Move between points
  FLEE = 'flee', // Run away from player
}

/**
 * AI state
 */
export enum AIState {
  IDLE = 'idle',
  PATROL = 'patrol',
  CHASE = 'chase',
  ATTACK = 'attack',
  FLEE = 'flee',
  DEAD = 'dead',
}

/**
 * AIComponent - Enemy behavior and decision-making
 */
export class AIComponent extends BaseComponent {
  static readonly TYPE = 'AI';
  readonly type = AIComponent.TYPE;

  public behaviorType: AIBehaviorType;
  public state: AIState;
  public targetId: EntityId | null;
  public aggroRange: number;
  public attackRange: number;
  public patrolPoints: Array<{ x: number; y: number }>;
  public currentPatrolIndex: number;
  public lastStateChange: number;

  constructor(
    behaviorType: AIBehaviorType = AIBehaviorType.AGGRESSIVE,
    aggroRange: number = 200,
    attackRange: number = 50
  ) {
    super();
    this.behaviorType = behaviorType;
    this.state = AIState.IDLE;
    this.targetId = null;
    this.aggroRange = aggroRange;
    this.attackRange = attackRange;
    this.patrolPoints = [];
    this.currentPatrolIndex = 0;
    this.lastStateChange = Date.now();
  }

  /**
   * Set AI state
   */
  setState(state: AIState): this {
    if (this.state !== state) {
      this.state = state;
      this.lastStateChange = Date.now();
    }
    return this;
  }

  /**
   * Set target entity
   */
  setTarget(targetId: EntityId | null): this {
    this.targetId = targetId;
    return this;
  }

  /**
   * Check if has target
   */
  hasTarget(): boolean {
    return this.targetId !== null;
  }

  /**
   * Clear target
   */
  clearTarget(): this {
    this.targetId = null;
    return this;
  }

  /**
   * Add patrol point
   */
  addPatrolPoint(x: number, y: number): this {
    this.patrolPoints.push({ x, y });
    return this;
  }

  /**
   * Get current patrol point
   */
  getCurrentPatrolPoint(): { x: number; y: number } | null {
    if (this.patrolPoints.length === 0) return null;
    return this.patrolPoints[this.currentPatrolIndex];
  }

  /**
   * Move to next patrol point
   */
  nextPatrolPoint(): this {
    if (this.patrolPoints.length > 0) {
      this.currentPatrolIndex =
        (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    }
    return this;
  }

  /**
   * Get time in current state (milliseconds)
   */
  getTimeInState(): number {
    return Date.now() - this.lastStateChange;
  }

  clone(): this {
    const cloned = new AIComponent(
      this.behaviorType,
      this.aggroRange,
      this.attackRange
    );
    cloned.state = this.state;
    cloned.targetId = this.targetId;
    cloned.patrolPoints = [...this.patrolPoints];
    cloned.currentPatrolIndex = this.currentPatrolIndex;
    cloned.lastStateChange = this.lastStateChange;
    return cloned as this;
  }
}
