import { Entity } from '@core/ecs';
import { Vector2D } from '@core/utils';
import { gameData } from '@data';
import type { EnemyData } from '@data';
import {
  TransformComponent,
  HealthComponent,
  CombatComponent,
  MovementComponent,
  SpriteComponent,
  ColliderComponent,
  PlayerComponent,
  EnemyComponent,
  AIComponent,
  AIBehaviorType,
  EnemyType,
  ColliderShape,
  CollisionLayer,
} from '../components';

/**
 * EntityFactory - creates entities from data
 * Centralizes entity creation logic
 */
export class EntityFactory {
  /**
   * Create the player entity
   */
  static createPlayer(position: Vector2D): Entity {
    const config = gameData.getConfig().player;
    const entity = new Entity('player');

    // Transform
    entity.addComponent(
      new TransformComponent(position, 0, Vector2D.one())
    );

    // Health
    entity.addComponent(
      new HealthComponent(config.startingHealth)
    );

    // Combat
    entity.addComponent(
      new CombatComponent(
        config.startingStrength,
        config.startingDefense,
        config.attackRange,
        config.attackCooldown
      )
    );

    // Movement
    entity.addComponent(
      new MovementComponent(config.startingSpeed)
    );

    // Sprite
    entity.addComponent(
      new SpriteComponent(
        config.sprite.texture,
        config.sprite.tint,
        config.sprite.width,
        config.sprite.height
      )
    );

    // Collider
    const collider = ColliderComponent.circle(config.collider.radius);
    collider.setLayer(CollisionLayer.PLAYER);
    collider.setMask(CollisionLayer.ENEMY | CollisionLayer.WALL | CollisionLayer.ITEM);
    entity.addComponent(collider);

    // Player component
    entity.addComponent(new PlayerComponent());

    return entity;
  }

  /**
   * Create an enemy entity
   */
  static createEnemy(enemyType: string, position: Vector2D): Entity | null {
    const data = gameData.getEnemyData(enemyType);
    if (!data) {
      console.error(`Enemy type '${enemyType}' not found in data`);
      return null;
    }

    const entity = new Entity();

    // Transform
    entity.addComponent(
      new TransformComponent(position, 0, Vector2D.one())
    );

    // Health
    entity.addComponent(
      new HealthComponent(data.health)
    );

    // Combat
    entity.addComponent(
      new CombatComponent(
        data.strength,
        data.defense,
        data.attackRange,
        data.attackCooldown
      )
    );

    // Movement
    entity.addComponent(
      new MovementComponent(data.speed)
    );

    // Sprite
    entity.addComponent(
      new SpriteComponent(
        data.sprite.texture,
        data.sprite.tint,
        data.sprite.width,
        data.sprite.height
      )
    );

    // Collider
    const collider = ColliderComponent.circle(data.collider.radius);
    collider.setLayer(CollisionLayer.ENEMY);
    collider.setMask(CollisionLayer.PLAYER | CollisionLayer.WALL | CollisionLayer.ENEMY);
    entity.addComponent(collider);

    // AI
    const behaviorMap: Record<string, AIBehaviorType> = {
      aggressive: AIBehaviorType.AGGRESSIVE,
      ranged: AIBehaviorType.RANGED,
      patrol: AIBehaviorType.PATROL,
      flee: AIBehaviorType.FLEE,
    };

    entity.addComponent(
      new AIComponent(
        behaviorMap[data.behavior] ?? AIBehaviorType.AGGRESSIVE,
        data.aggroRange,
        data.attackRange
      )
    );

    // Enemy component
    const enemyTypeMap: Record<string, EnemyType> = {
      slime: EnemyType.SLIME,
      goblin: EnemyType.GOBLIN,
      skeleton: EnemyType.SKELETON,
      demon: EnemyType.DEMON,
    };

    entity.addComponent(
      new EnemyComponent(
        enemyTypeMap[data.type] ?? EnemyType.SLIME,
        data.experienceReward,
        data.lootTable
      )
    );

    return entity;
  }

  /**
   * Create a wall tile entity
   */
  static createWall(position: Vector2D, size: number = 40): Entity {
    const entity = new Entity();

    // Transform
    entity.addComponent(
      new TransformComponent(position, 0, Vector2D.one())
    );

    // Sprite
    entity.addComponent(
      new SpriteComponent('wall', 0x2d3748, size, size)
    );

    // Collider (static)
    const collider = ColliderComponent.rectangle(size, size);
    collider.setLayer(CollisionLayer.WALL);
    collider.setMask(CollisionLayer.ALL);
    collider.setStatic(true);
    entity.addComponent(collider);

    return entity;
  }

  /**
   * Create a floor tile entity (non-collidable, just visual)
   */
  static createFloor(position: Vector2D, size: number = 40, tint: number = 0x4a5568): Entity {
    const entity = new Entity();

    // Transform
    entity.addComponent(
      new TransformComponent(position, 0, Vector2D.one())
    );

    // Sprite
    const sprite = new SpriteComponent('floor', tint, size, size);
    sprite.zIndex = -100; // Render below everything
    entity.addComponent(sprite);

    return entity;
  }

  /**
   * Spawn a random enemy appropriate for player level
   */
  static createRandomEnemyForLevel(position: Vector2D, playerLevel: number): Entity | null {
    const enemies = gameData.getEnemiesForLevel(playerLevel);
    if (enemies.length === 0) return null;

    // Get weights for this level
    const config = gameData.getConfig();
    let weights: number[] = [1]; // Default equal weights

    for (const [range, w] of Object.entries(config.spawning.enemyWeightsByLevel)) {
      if (this.isLevelInRange(playerLevel, range)) {
        weights = w;
        break;
      }
    }

    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < enemies.length; i++) {
      random -= weights[i] ?? 1;
      if (random <= 0) {
        return this.createEnemy(enemies[i].type, position);
      }
    }

    // Fallback
    return this.createEnemy(enemies[0].type, position);
  }

  /**
   * Check if level is in range
   */
  private static isLevelInRange(level: number, range: string): boolean {
    if (range.endsWith('+')) {
      const min = parseInt(range.replace('+', ''));
      return level >= min;
    }

    const [min, max] = range.split('-').map(Number);
    return level >= min && level <= max;
  }
}
