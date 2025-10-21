import { System } from '@core/ecs';
import type { Entity } from '@core/ecs';
import { EventBus, GameEventType } from '@core/events';
import type {
  DamageDealtEvent,
  EntityDiedEvent,
  ExperienceGainedEvent,
  EnemyKilledEvent,
} from '@core/events';
import {
  TransformComponent,
  HealthComponent,
  CombatComponent,
  PlayerComponent,
  EnemyComponent,
} from '../components';

/**
 * CombatSystem - handles damage, death, and combat interactions
 */
export class CombatSystem extends System {
  protected readonly requiredComponents = [
    TransformComponent,
    HealthComponent,
    CombatComponent,
  ];
  public readonly priority = 30; // After collision

  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    super();
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  init(): void {
    // System initialization if needed
  }

  update(entities: readonly Entity[], deltaTime: number): void {
    // Check for dead entities
    const combatEntities = this.filterEntities(entities);

    for (const entity of combatEntities) {
      const health = entity.getComponent(HealthComponent)!;

      if (health.isDead()) {
        this.handleEntityDeath(entity, entities);
      }
    }
  }

  /**
   * Setup event listeners for combat events
   */
  private setupEventListeners(): void {
    // Listen for collision events to trigger damage
    this.eventBus.on('combat:attack', (data: any) => {
      this.handleAttack(data.attacker, data.target);
    });
  }

  /**
   * Handle an attack between entities
   */
  private handleAttack(attacker: Entity, target: Entity): void {
    const attackerCombat = attacker.getComponent(CombatComponent);
    const targetHealth = target.getComponent(HealthComponent);
    const targetCombat = target.getComponent(CombatComponent);

    if (!attackerCombat || !targetHealth) return;

    // Check attack cooldown
    if (!attackerCombat.canAttack()) return;

    // Calculate damage
    const rawDamage = attackerCombat.calculateDamage();
    const actualDamage = targetCombat
      ? targetCombat.calculateDamageReceived(rawDamage)
      : rawDamage;

    // Apply damage
    targetHealth.takeDamage(actualDamage);
    attackerCombat.performAttack();

    // Emit damage event
    const damageEvent: DamageDealtEvent = {
      attackerId: attacker.id,
      targetId: target.id,
      damage: actualDamage,
      isCritical: false, // TODO: implement critical hits
    };

    this.eventBus.emit(GameEventType.DAMAGE_DEALT, damageEvent);
  }

  /**
   * Handle entity death
   */
  private handleEntityDeath(deadEntity: Entity, allEntities: readonly Entity[]): void {
    const transform = deadEntity.getComponent(TransformComponent)!;
    const enemy = deadEntity.getComponent(EnemyComponent);
    const player = deadEntity.getComponent(PlayerComponent);

    // Find killer (entity that dealt last damage)
    let killerId: string | undefined;

    // Emit death event
    const deathEvent: EntityDiedEvent = {
      entityId: deadEntity.id,
      killerId,
      position: {
        x: transform.position.x,
        y: transform.position.y,
      },
    };

    this.eventBus.emit(GameEventType.ENTITY_DIED, deathEvent);

    // Handle enemy death
    if (enemy) {
      this.handleEnemyDeath(deadEntity, allEntities);
    }

    // Handle player death
    if (player) {
      this.handlePlayerDeath(deadEntity);
    }

    // Mark entity for removal
    deadEntity.destroy();
  }

  /**
   * Handle enemy death (drop loot, give XP)
   */
  private handleEnemyDeath(
    enemyEntity: Entity,
    allEntities: readonly Entity[]
  ): void {
    const enemy = enemyEntity.getComponent(EnemyComponent)!;
    const transform = enemyEntity.getComponent(TransformComponent)!;

    // Emit enemy killed event
    const killedEvent: EnemyKilledEvent = {
      entityId: enemyEntity.id,
      enemyType: enemy.enemyType,
      experienceReward: enemy.experienceReward,
      lootDrops: [], // TODO: implement loot system
    };

    this.eventBus.emit(GameEventType.ENEMY_KILLED, killedEvent);

    // Award experience to player
    const playerEntity = this.findPlayer(allEntities);

    if (playerEntity) {
      const playerComp = playerEntity.getComponent(PlayerComponent)!;
      const combat = playerEntity.getComponent(CombatComponent);
      const health = playerEntity.getComponent(HealthComponent);

      // Add kill count
      playerComp.addKill();

      // Add experience
      const leveledUp = playerComp.addExperience(enemy.experienceReward);

      // Emit experience gained event
      const expEvent: ExperienceGainedEvent = {
        amount: enemy.experienceReward,
        currentExp: playerComp.experience,
        expToNext: playerComp.experienceToNext,
      };

      this.eventBus.emit(GameEventType.EXPERIENCE_GAINED, expEvent);

      // Handle level up
      if (leveledUp) {
        this.handlePlayerLevelUp(playerEntity);
      }
    }
  }

  /**
   * Handle player death
   */
  private handlePlayerDeath(playerEntity: Entity): void {
    const player = playerEntity.getComponent(PlayerComponent)!;

    // Emit game over event
    this.eventBus.emit(GameEventType.GAME_OVER, {
      reason: 'death',
      stats: {
        level: player.level,
        kills: player.kills,
        playtime: 0, // TODO: track playtime
      },
    });
  }

  /**
   * Handle player level up
   */
  private handlePlayerLevelUp(playerEntity: Entity): void {
    const player = playerEntity.getComponent(PlayerComponent)!;
    const combat = playerEntity.getComponent(CombatComponent);
    const health = playerEntity.getComponent(HealthComponent);

    // Increase stats (base scaling)
    if (combat) {
      combat.strength += 3;
      combat.defense += 2;
    }

    if (health) {
      const healthIncrease = 20;
      health.increaseMax(healthIncrease);
      health.restore(); // Full heal on level up
    }

    // Emit level up event
    this.eventBus.emit(GameEventType.PLAYER_LEVEL_UP, {
      newLevel: player.level,
      statPoints: player.statPoints,
    });

    // Show notification
    this.eventBus.emit(GameEventType.NOTIFICATION, {
      message: `Level Up! You are now level ${player.level}`,
      type: 'success',
      duration: 2000,
    });
  }

  /**
   * Find player entity
   */
  private findPlayer(entities: readonly Entity[]): Entity | null {
    return entities.find((e) => e.hasComponent(PlayerComponent)) ?? null;
  }
}
