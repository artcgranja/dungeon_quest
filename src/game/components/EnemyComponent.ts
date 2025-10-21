import { BaseComponent } from '@core/ecs';

/**
 * Enemy types
 */
export enum EnemyType {
  SLIME = 'slime',
  GOBLIN = 'goblin',
  SKELETON = 'skeleton',
  DEMON = 'demon',
}

/**
 * EnemyComponent - Tag component for enemy entities
 */
export class EnemyComponent extends BaseComponent {
  static readonly TYPE = 'Enemy';
  readonly type = EnemyComponent.TYPE;

  public enemyType: EnemyType;
  public experienceReward: number;
  public lootTable: string; // Reference to loot table in data

  constructor(
    enemyType: EnemyType = EnemyType.SLIME,
    experienceReward: number = 25,
    lootTable: string = 'common'
  ) {
    super();
    this.enemyType = enemyType;
    this.experienceReward = experienceReward;
    this.lootTable = lootTable;
  }

  clone(): this {
    return new EnemyComponent(
      this.enemyType,
      this.experienceReward,
      this.lootTable
    ) as this;
  }
}
