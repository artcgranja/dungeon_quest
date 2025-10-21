/**
 * EntityFactory - Centralized entity creation
 * Creates entities with all necessary components pre-configured
 */

import type { World } from '../../core/ecs/World';
import type { Entity } from '../../core/ecs/Entity';
import {
  TransformComponent,
  HealthComponent,
  CombatComponent,
  MovementComponent,
  SpriteComponent,
  AIComponent,
  PlayerComponent,
  EnemyComponent,
  AnimationComponent,
  StateMachineComponent
} from '../../core/ecs/ComponentTypes';
import type { GameScene } from '../../rendering/scenes/GameScene';

export type EnemyType = 'slime' | 'goblin' | 'skeleton' | 'demon';

interface EnemyStats {
  color: number;
  health: number;
  damage: number;
  speed: number;
  exp: number;
  attackCooldown: number;
}

export class EntityFactory {
  private scene: GameScene;
  private world: World;

  private static readonly ENEMY_STATS: Record<EnemyType, EnemyStats> = {
    slime: {
      color: 0x8b5cf6,
      health: 30,
      damage: 5,
      speed: 1,
      exp: 25,
      attackCooldown: 1500
    },
    goblin: {
      color: 0xef4444,
      health: 50,
      damage: 10,
      speed: 1.5,
      exp: 50,
      attackCooldown: 1500
    },
    skeleton: {
      color: 0xf3f4f6,
      health: 70,
      damage: 15,
      speed: 1.2,
      exp: 75,
      attackCooldown: 1500
    },
    demon: {
      color: 0x991b1b,
      health: 100,
      damage: 20,
      speed: 0.8,
      exp: 150,
      attackCooldown: 1500
    }
  };

  constructor(scene: GameScene, world: World) {
    this.scene = scene;
    this.world = world;
  }

  /**
   * Create player entity
   */
  createPlayer(x: number, y: number): Entity {
    const entity = this.world.createEntity();

    // Add components
    this.world.addComponent(entity, new TransformComponent(x, y, 30, 30));
    this.world.addComponent(entity, new HealthComponent(100, 100));
    this.world.addComponent(entity, new CombatComponent(10, 5, 50, 500));
    this.world.addComponent(entity, new MovementComponent(3, 'down'));
    this.world.addComponent(
      entity,
      new SpriteComponent(this.scene.add.graphics(), 0x4ecca3, 1)
    );
    this.world.addComponent(entity, new PlayerComponent(1, 0, 100, 10, 0));

    // Add animation and state machine
    this.world.addComponent(entity, new AnimationComponent('idle'));

    const stateMachine = new StateMachineComponent('idle');
    stateMachine.transitions.set('idle', ['walking', 'attacking', 'dead']);
    stateMachine.transitions.set('walking', ['idle', 'attacking', 'dead']);
    stateMachine.transitions.set('attacking', ['idle', 'walking', 'dead']);
    stateMachine.transitions.set('dead', []);
    this.world.addComponent(entity, stateMachine);

    return entity;
  }

  /**
   * Create enemy entity
   */
  createEnemy(x: number, y: number, type: EnemyType): Entity {
    const stats = EntityFactory.ENEMY_STATS[type];
    const entity = this.world.createEntity();

    // Add components
    this.world.addComponent(entity, new TransformComponent(x, y, 25, 25));
    this.world.addComponent(entity, new HealthComponent(stats.health, stats.health));
    this.world.addComponent(
      entity,
      new CombatComponent(stats.damage, 0, 35, stats.attackCooldown)
    );
    this.world.addComponent(entity, new MovementComponent(stats.speed, 'down'));
    this.world.addComponent(
      entity,
      new SpriteComponent(this.scene.add.graphics(), stats.color, 0)
    );
    this.world.addComponent(entity, new AIComponent(200, 35, 'chase'));
    this.world.addComponent(entity, new EnemyComponent(type, stats.exp));

    // Add animation and state machine
    this.world.addComponent(entity, new AnimationComponent('idle'));

    const stateMachine = new StateMachineComponent('idle');
    stateMachine.transitions.set('idle', ['chasing', 'dead']);
    stateMachine.transitions.set('chasing', ['idle', 'dead']);
    stateMachine.transitions.set('dead', []);
    this.world.addComponent(entity, stateMachine);

    return entity;
  }

  /**
   * Create random enemy based on player level
   */
  createRandomEnemy(x: number, y: number, playerLevel: number): Entity {
    let type: EnemyType;

    if (playerLevel >= 5) {
      type = Math.random() < 0.5 ? 'skeleton' : 'demon';
    } else if (playerLevel >= 3) {
      type = Math.random() < 0.5 ? 'goblin' : 'skeleton';
    } else {
      type = Math.random() < 0.7 ? 'slime' : 'goblin';
    }

    return this.createEnemy(x, y, type);
  }

  /**
   * Get enemy stats (for external use)
   */
  static getEnemyStats(type: EnemyType): EnemyStats {
    return { ...EntityFactory.ENEMY_STATS[type] };
  }
}
