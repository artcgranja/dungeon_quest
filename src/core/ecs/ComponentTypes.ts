/**
 * All component type definitions
 * Components are pure data containers - NO LOGIC
 */

import { BaseComponent } from './Component';

/**
 * Transform Component - Position and size
 */
export class TransformComponent extends BaseComponent {
  readonly type = 'Transform' as const;

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {
    super();
  }
}

/**
 * Health Component - Health tracking
 */
export class HealthComponent extends BaseComponent {
  readonly type = 'Health' as const;

  constructor(
    public current: number,
    public max: number
  ) {
    super();
  }
}

/**
 * Combat Component - Combat stats
 */
export class CombatComponent extends BaseComponent {
  readonly type = 'Combat' as const;

  constructor(
    public damage: number,
    public defense: number,
    public attackRange: number,
    public attackCooldown: number,
    public lastAttackTime: number = 0,
    public isAttacking: boolean = false,
    public attackAnimationTime: number = 0
  ) {
    super();
  }
}

/**
 * Movement Component - Movement data
 */
export class MovementComponent extends BaseComponent {
  readonly type = 'Movement' as const;

  constructor(
    public speed: number,
    public direction: 'up' | 'down' | 'left' | 'right' = 'down',
    public velocityX: number = 0,
    public velocityY: number = 0
  ) {
    super();
  }
}

/**
 * Sprite Component - Visual rendering data
 */
export class SpriteComponent extends BaseComponent {
  readonly type = 'Sprite' as const;

  constructor(
    public graphics: Phaser.GameObjects.Graphics,
    public color: number,
    public renderLayer: number = 0
  ) {
    super();
  }
}

/**
 * AI Component - AI behavior data
 */
export class AIComponent extends BaseComponent {
  readonly type = 'AI' as const;

  constructor(
    public aggroRange: number,
    public attackRange: number,
    public behavior: 'chase' | 'flee' | 'patrol' | 'idle' = 'chase',
    public targetEntityId: number | null = null
  ) {
    super();
  }
}

/**
 * Player Component - Tag component for player entity
 */
export class PlayerComponent extends BaseComponent {
  readonly type = 'Player' as const;

  constructor(
    public level: number,
    public experience: number,
    public experienceToNextLevel: number,
    public strength: number,
    public upgradePoints: number = 0
  ) {
    super();
  }
}

/**
 * Enemy Component - Tag component for enemy entities
 */
export class EnemyComponent extends BaseComponent {
  readonly type = 'Enemy' as const;

  constructor(
    public enemyType: 'slime' | 'goblin' | 'skeleton' | 'demon',
    public expReward: number
  ) {
    super();
  }
}

/**
 * Type guard helpers
 */
export type ComponentTypeMap = {
  Transform: TransformComponent;
  Health: HealthComponent;
  Combat: CombatComponent;
  Movement: MovementComponent;
  Sprite: SpriteComponent;
  AI: AIComponent;
  Player: PlayerComponent;
  Enemy: EnemyComponent;
};

export type ComponentTypeName = keyof ComponentTypeMap;
