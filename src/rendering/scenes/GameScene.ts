import Phaser from 'phaser';
import { Dungeon } from '../../game/Dungeon';
import { World } from '../../core/ecs/World';
import { EntityFactory } from '../../game/factory/EntityFactory';
import { MovementSystem } from '../../game/systems/MovementSystem';
import { CombatSystem } from '../../game/systems/CombatSystem';
import { HealthSystem } from '../../game/systems/HealthSystem';
import { SpriteSystem } from '../../game/systems/SpriteSystem';
import { AISystem } from '../../game/systems/AISystem';
import { eventBus } from '../../core/events/EventBus';
import type { Entity } from '../../core/ecs/Entity';
import { updateHealth, updateExp, updateLevel, updateStats, updateKills } from '../../ui/stores/gameStore';

export class GameScene extends Phaser.Scene {
  // ECS World
  private world!: World;
  private factory!: EntityFactory;

  // Systems
  private movementSystem!: MovementSystem;
  private combatSystem!: CombatSystem;
  private healthSystem!: HealthSystem;
  private spriteSystem!: SpriteSystem;
  private aiSystem!: AISystem;

  // Game state
  private dungeon!: Dungeon;
  private playerEntity!: Entity;
  private enemyEntities: Entity[] = [];
  private monstersKilled = 0;

  // Input
  private keys!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Create ECS World
    this.world = new World();
    this.factory = new EntityFactory(this, this.world);

    // Create and register systems
    this.movementSystem = new MovementSystem();
    this.combatSystem = new CombatSystem();
    this.healthSystem = new HealthSystem();
    this.spriteSystem = new SpriteSystem();
    this.aiSystem = new AISystem();

    this.world.addSystem(this.movementSystem);
    this.world.addSystem(this.combatSystem);
    this.world.addSystem(this.healthSystem);
    this.world.addSystem(this.spriteSystem);
    this.world.addSystem(this.aiSystem);

    // Create dungeon
    this.dungeon = new Dungeon(this, 800, 600, 40);

    // Set dungeon reference in systems
    this.movementSystem.setDungeon(this.dungeon);
    this.aiSystem.setDungeon(this.dungeon);

    // Create player entity
    this.playerEntity = this.factory.createPlayer(400, 300);
    this.aiSystem.setPlayerEntity(this.playerEntity.id);

    // Spawn initial enemies
    this.spawnInitialEnemies();

    // Setup event listeners
    this.setupEventListeners();

    // Setup input
    this.keys = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    this.keys.space.on('down', () => {
      this.handleAttack();
    });

    // Initial UI update
    this.updateUI();
  }

  update(_time: number, delta: number) {
    // Handle input
    this.handleInput();

    // Update ECS World (all systems)
    this.world.update(delta);

    // Cleanup dead entities
    this.cleanupDeadEntities();

    // Spawn more enemies if too few
    const aliveEnemies = this.enemyEntities.filter(e => e.active).length;
    if (aliveEnemies < 3) {
      this.spawnRandomEnemy();
    }
  }

  private handleInput() {
    let dx = 0;
    let dy = 0;

    if (this.keys.w.isDown || this.keys.up.isDown) dy -= 1;
    if (this.keys.s.isDown || this.keys.down.isDown) dy += 1;
    if (this.keys.a.isDown || this.keys.left.isDown) dx -= 1;
    if (this.keys.d.isDown || this.keys.right.isDown) dx += 1;

    // Set player velocity
    const movement = this.world.getComponent(this.playerEntity, 'Movement');
    if (movement) {
      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal movement
        const length = Math.sqrt(dx * dx + dy * dy);
        movement.velocityX = dx / length;
        movement.velocityY = dy / length;
      } else {
        movement.velocityX = 0;
        movement.velocityY = 0;
      }
    }
  }

  private handleAttack() {
    // Get all enemy entity IDs
    const enemyIds = this.enemyEntities.filter(e => e.active).map(e => e.id);

    // Process attack through combat system
    this.combatSystem.processAttack(this.playerEntity.id, enemyIds);
  }

  private spawnInitialEnemies() {
    const enemyTypes: ('slime' | 'goblin' | 'skeleton' | 'demon')[] = [
      'slime',
      'slime',
      'goblin',
      'skeleton'
    ];

    for (let i = 0; i < 5; i++) {
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      this.spawnRandomEnemy(type);
    }
  }

  private spawnRandomEnemy(type?: 'slime' | 'goblin' | 'skeleton' | 'demon') {
    let x: number, y: number;
    let attempts = 0;
    const maxAttempts = 50;

    // Find a valid spawn position
    do {
      x = Math.random() * (800 - 100) + 50;
      y = Math.random() * (600 - 100) + 50;
      attempts++;
    } while (this.dungeon.isWall(x, y, 25, 25) && attempts < maxAttempts);

    if (attempts < maxAttempts) {
      // Get player level
      const playerComponent = this.world.getComponent(this.playerEntity, 'Player');
      const playerLevel = playerComponent?.level || 1;

      // Create enemy
      const enemy = type
        ? this.factory.createEnemy(x, y, type)
        : this.factory.createRandomEnemy(x, y, playerLevel);

      this.enemyEntities.push(enemy);
    }
  }

  private cleanupDeadEntities() {
    this.enemyEntities = this.enemyEntities.filter(entity => {
      if (!entity.active) {
        // Destroy graphics
        const sprite = this.world.getComponent(entity, 'Sprite');
        if (sprite) {
          sprite.graphics.destroy();
        }

        // Remove from world
        this.world.removeEntity(entity);
        return false;
      }
      return true;
    });
  }

  private setupEventListeners() {
    // Listen to enemy killed events
    eventBus.on('enemy:killed', (data) => {
      this.monstersKilled++;

      // Give player experience
      const playerComponent = this.world.getComponent(this.playerEntity, 'Player');
      if (playerComponent) {
        playerComponent.experience += data.expReward;

        // Check for level up
        if (playerComponent.experience >= playerComponent.experienceToNextLevel) {
          this.handleLevelUp();
        }

        this.updateUI();
      }
    });

    // Listen to entity died events
    eventBus.on('entity:died', (data) => {
      // Check if it's the player
      if (data.entity === this.playerEntity) {
        alert('Game Over! You have been defeated. Reloading...');
        window.location.reload();
      }
    });

    // Listen to health changed events to update UI
    eventBus.on('health:changed', (data) => {
      if (data.entity === this.playerEntity) {
        this.updateUI();
      }
    });
  }

  private handleLevelUp() {
    const playerComponent = this.world.getComponent(this.playerEntity, 'Player');
    const playerHealth = this.world.getComponent(this.playerEntity, 'Health');
    const playerCombat = this.world.getComponent(this.playerEntity, 'Combat');
    const playerMovement = this.world.getComponent(this.playerEntity, 'Movement');

    if (!playerComponent || !playerHealth || !playerCombat || !playerMovement) return;

    // Level up
    playerComponent.level++;
    playerComponent.experience -= playerComponent.experienceToNextLevel;
    playerComponent.experienceToNextLevel = Math.floor(
      playerComponent.experienceToNextLevel * 1.5
    );

    // Automatic stat increases
    playerHealth.max += 20;
    playerHealth.current = playerHealth.max;
    playerCombat.damage += 3;
    playerCombat.defense += 2;
    playerMovement.speed += 0.2;
    playerComponent.strength += 3;

    // Grant upgrade points
    playerComponent.upgradePoints += 3;

    // Show notification
    console.log(`LEVEL UP! Now Level ${playerComponent.level}`);

    // Emit level up event
    eventBus.emit('player:levelup', {
      player: this.playerEntity,
      level: playerComponent.level,
      newStrength: playerComponent.strength,
      newDefense: playerCombat.defense,
      newSpeed: playerMovement.speed
    });

    this.updateUI();
  }

  public updateUI() {
    const playerComponent = this.world.getComponent(this.playerEntity, 'Player');
    const playerHealth = this.world.getComponent(this.playerEntity, 'Health');
    const playerCombat = this.world.getComponent(this.playerEntity, 'Combat');
    const playerMovement = this.world.getComponent(this.playerEntity, 'Movement');

    if (!playerComponent || !playerHealth || !playerCombat || !playerMovement) return;

    updateHealth(playerHealth.current, playerHealth.max);
    updateExp(playerComponent.experience, playerComponent.experienceToNextLevel);
    updateLevel(playerComponent.level);
    updateStats(playerComponent.strength, playerCombat.defense, playerMovement.speed);
    updateKills(this.monstersKilled);
  }

  public getDungeon(): Dungeon {
    return this.dungeon;
  }
}
