import { BaseComponent } from '@core/ecs';

/**
 * CombatComponent - Attack and defense stats
 */
export class CombatComponent extends BaseComponent {
  static readonly TYPE = 'Combat';
  readonly type = CombatComponent.TYPE;

  public strength: number;
  public defense: number;
  public attackRange: number;
  public attackCooldown: number; // milliseconds
  public lastAttackTime: number;

  constructor(
    strength: number = 10,
    defense: number = 5,
    attackRange: number = 50,
    attackCooldown: number = 500
  ) {
    super();
    this.strength = strength;
    this.defense = defense;
    this.attackRange = attackRange;
    this.attackCooldown = attackCooldown;
    this.lastAttackTime = 0;
  }

  /**
   * Check if can attack (cooldown elapsed)
   */
  canAttack(): boolean {
    return Date.now() - this.lastAttackTime >= this.attackCooldown;
  }

  /**
   * Mark that an attack was performed
   */
  performAttack(): this {
    this.lastAttackTime = Date.now();
    return this;
  }

  /**
   * Calculate damage dealt (with random variance)
   */
  calculateDamage(): number {
    // Base damage + random 0-4
    return this.strength + Math.floor(Math.random() * 5);
  }

  /**
   * Calculate damage received after defense
   */
  calculateDamageReceived(incomingDamage: number): number {
    return Math.max(1, incomingDamage - this.defense);
  }

  /**
   * Get attack cooldown progress (0-1)
   */
  getCooldownProgress(): number {
    const elapsed = Date.now() - this.lastAttackTime;
    return Math.min(1, elapsed / this.attackCooldown);
  }

  /**
   * Reset attack cooldown
   */
  resetCooldown(): this {
    this.lastAttackTime = 0;
    return this;
  }

  clone(): this {
    const cloned = new CombatComponent(
      this.strength,
      this.defense,
      this.attackRange,
      this.attackCooldown
    );
    cloned.lastAttackTime = this.lastAttackTime;
    return cloned as this;
  }
}
