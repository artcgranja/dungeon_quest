import { BaseComponent } from '@core/ecs';

/**
 * HealthComponent - Health/HP tracking
 */
export class HealthComponent extends BaseComponent {
  static readonly TYPE = 'Health';
  readonly type = HealthComponent.TYPE;

  public current: number;
  public max: number;
  public invulnerable: boolean;
  public lastDamageTime: number;

  constructor(max: number, current?: number) {
    super();
    this.max = max;
    this.current = current ?? max;
    this.invulnerable = false;
    this.lastDamageTime = 0;
  }

  /**
   * Take damage
   * @returns actual damage dealt (after clamping)
   */
  takeDamage(amount: number): number {
    if (this.invulnerable) return 0;

    const oldHealth = this.current;
    this.current = Math.max(0, this.current - amount);
    this.lastDamageTime = Date.now();
    return oldHealth - this.current;
  }

  /**
   * Heal
   * @returns actual amount healed
   */
  heal(amount: number): number {
    const oldHealth = this.current;
    this.current = Math.min(this.max, this.current + amount);
    return this.current - oldHealth;
  }

  /**
   * Set to full health
   */
  restore(): this {
    this.current = this.max;
    return this;
  }

  /**
   * Check if alive
   */
  isAlive(): boolean {
    return this.current > 0;
  }

  /**
   * Check if dead
   */
  isDead(): boolean {
    return this.current <= 0;
  }

  /**
   * Get health percentage (0-1)
   */
  getHealthPercent(): number {
    return this.max > 0 ? this.current / this.max : 0;
  }

  /**
   * Increase max health
   */
  increaseMax(amount: number, restoreFull: boolean = false): this {
    this.max += amount;
    if (restoreFull) {
      this.current = this.max;
    }
    return this;
  }

  clone(): this {
    const cloned = new HealthComponent(this.max, this.current);
    cloned.invulnerable = this.invulnerable;
    cloned.lastDamageTime = this.lastDamageTime;
    return cloned as this;
  }
}
