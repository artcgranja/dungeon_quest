import { BaseComponent } from '@core/ecs';

/**
 * PlayerComponent - Tag component to identify the player entity
 * Also stores player-specific stats
 */
export class PlayerComponent extends BaseComponent {
  static readonly TYPE = 'Player';
  readonly type = PlayerComponent.TYPE;

  public level: number;
  public experience: number;
  public experienceToNext: number;
  public statPoints: number;
  public kills: number;

  constructor() {
    super();
    this.level = 1;
    this.experience = 0;
    this.experienceToNext = 100;
    this.statPoints = 0;
    this.kills = 0;
  }

  /**
   * Add experience
   * @returns true if leveled up
   */
  addExperience(amount: number): boolean {
    this.experience += amount;

    if (this.experience >= this.experienceToNext) {
      return this.levelUp();
    }

    return false;
  }

  /**
   * Level up the player
   */
  levelUp(): boolean {
    this.level++;
    this.experience -= this.experienceToNext;
    this.experienceToNext = Math.floor(this.experienceToNext * 1.5);
    this.statPoints += 3; // Award stat points
    return true;
  }

  /**
   * Spend a stat point
   */
  spendStatPoint(): boolean {
    if (this.statPoints > 0) {
      this.statPoints--;
      return true;
    }
    return false;
  }

  /**
   * Get experience progress (0-1)
   */
  getExpProgress(): number {
    return this.experience / this.experienceToNext;
  }

  /**
   * Record a kill
   */
  addKill(): this {
    this.kills++;
    return this;
  }

  clone(): this {
    const cloned = new PlayerComponent();
    cloned.level = this.level;
    cloned.experience = this.experience;
    cloned.experienceToNext = this.experienceToNext;
    cloned.statPoints = this.statPoints;
    cloned.kills = this.kills;
    return cloned as this;
  }
}
