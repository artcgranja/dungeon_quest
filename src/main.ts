import { World } from '@core/ecs';
import { globalEventBus, GameEventType } from '@core/events';
import { Vector2D } from '@core/utils';
import { gameData } from '@data';
import { PixiRenderer } from '@rendering';
import { InputManager, EventCommand } from '@input';
import {
  MovementSystem,
  CollisionSystem,
  CombatSystem,
  AISystem,
} from '@game/systems';
import { EntityFactory } from '@game/managers';
import { DungeonGenerator } from '@game/generation';
import {
  PlayerComponent,
  MovementComponent,
  TransformComponent,
  HealthComponent,
  CombatComponent,
} from '@game/components';
import type { Entity } from '@core/ecs';

/**
 * Main game class
 */
class Game {
  private world: World;
  private renderer: PixiRenderer;
  private inputManager: InputManager;
  private dungeonGenerator: DungeonGenerator;

  private playerEntity: Entity | null = null;
  private lastTime: number = 0;
  private running: boolean = false;

  // Enemy spawning
  private enemySpawnTimer: number = 0;
  private readonly ENEMY_SPAWN_INTERVAL = 10000; // 10 seconds

  constructor() {
    this.world = new World();
    this.renderer = new PixiRenderer();
    this.inputManager = new InputManager(globalEventBus);
    this.dungeonGenerator = new DungeonGenerator();
  }

  /**
   * Initialize the game
   */
  async init(): Promise<void> {
    console.log('🎮 Initializing Dungeon Quest...');

    // Load game data
    console.log('📦 Loading game data...');
    await gameData.loadAll();
    console.log('✅ Game data loaded');

    // Initialize renderer
    const container = document.getElementById('gameCanvas');
    if (!container) {
      throw new Error('Game canvas container not found');
    }

    const config = gameData.getConfig();
    await this.renderer.init(
      container,
      config.canvas.width,
      config.canvas.height
    );
    console.log('✅ Renderer initialized');

    // Setup systems
    this.setupSystems();
    console.log('✅ Systems initialized');

    // Setup input
    this.setupInput();
    console.log('✅ Input initialized');

    // Setup event listeners
    this.setupEventListeners();
    console.log('✅ Event listeners setup');

    // Generate dungeon and spawn entities
    this.startNewGame();

    console.log('🎮 Game initialized successfully!');
  }

  /**
   * Setup game systems
   */
  private setupSystems(): void {
    this.world.addSystem(new MovementSystem());
    this.world.addSystem(new CollisionSystem(globalEventBus));
    this.world.addSystem(new AISystem(globalEventBus));
    this.world.addSystem(new CombatSystem(globalEventBus));
  }

  /**
   * Setup input bindings
   */
  private setupInput(): void {
    // Movement keys
    const moveUp = new EventCommand('input:move', { direction: 'up' });
    const moveDown = new EventCommand('input:move', { direction: 'down' });
    const moveLeft = new EventCommand('input:move', { direction: 'left' });
    const moveRight = new EventCommand('input:move', { direction: 'right' });

    this.inputManager.bindKeys(['w', 'arrowup'], moveUp);
    this.inputManager.bindKeys(['s', 'arrowdown'], moveDown);
    this.inputManager.bindKeys(['a', 'arrowleft'], moveLeft);
    this.inputManager.bindKeys(['d', 'arrowright'], moveRight);

    // Attack
    const attack = new EventCommand('input:attack');
    this.inputManager.bindKeys([' ', 'space'], attack);

    // Listen to input events
    globalEventBus.on('input:move', (data: any) => {
      this.handleMovementInput(data.direction);
    });

    globalEventBus.on('input:attack', () => {
      this.handleAttackInput();
    });
  }

  /**
   * Setup game event listeners
   */
  private setupEventListeners(): void {
    // Player level up
    globalEventBus.on(GameEventType.PLAYER_LEVEL_UP, (data: any) => {
      console.log(`🎉 Level Up! Now level ${data.newLevel}`);
      this.updateUI();
    });

    // Enemy killed
    globalEventBus.on(GameEventType.ENEMY_KILLED, () => {
      this.updateUI();
      // Spawn new enemy after a delay
      this.enemySpawnTimer = 0;
    });

    // Game over
    globalEventBus.on(GameEventType.GAME_OVER, (data: any) => {
      console.log('💀 Game Over!', data);
      this.gameOver(data);
    });

    // Experience gained
    globalEventBus.on(GameEventType.EXPERIENCE_GAINED, () => {
      this.updateUI();
    });

    // Damage dealt
    globalEventBus.on(GameEventType.DAMAGE_DEALT, (data: any) => {
      // Visual feedback could go here
    });
  }

  /**
   * Start a new game
   */
  private startNewGame(): void {
    // Clear existing entities
    this.world.clearEntities();

    // Generate dungeon
    this.dungeonGenerator.generate(this.world);

    // Spawn player
    const spawnPos = this.dungeonGenerator.getSpawnPosition();
    this.playerEntity = EntityFactory.createPlayer(spawnPos);
    this.world.addEntity(this.playerEntity);

    // Spawn initial enemies
    this.spawnInitialEnemies();

    // Update UI
    this.updateUI();

    // Reset spawn timer
    this.enemySpawnTimer = 0;
  }

  /**
   * Spawn initial enemies
   */
  private spawnInitialEnemies(): void {
    const config = gameData.getConfig();
    const playerLevel = this.getPlayerLevel();

    for (let i = 0; i < config.spawning.initialEnemies; i++) {
      const position = this.dungeonGenerator.getRandomWalkablePosition();
      const enemy = EntityFactory.createRandomEnemyForLevel(position, playerLevel);

      if (enemy) {
        this.world.addEntity(enemy);
      }
    }
  }

  /**
   * Handle movement input
   */
  private handleMovementInput(direction: string): void {
    if (!this.playerEntity) return;

    const movement = this.playerEntity.getComponent(MovementComponent);
    if (!movement) return;

    const directionMap: Record<string, Vector2D> = {
      up: Vector2D.up(),
      down: Vector2D.down(),
      left: Vector2D.left(),
      right: Vector2D.right(),
    };

    const dir = directionMap[direction];
    if (dir) {
      movement.moveInDirection(dir, 0.016); // Approximate delta for responsiveness
    }
  }

  /**
   * Handle attack input
   */
  private handleAttackInput(): void {
    if (!this.playerEntity) return;

    const combat = this.playerEntity.getComponent(CombatComponent);
    const transform = this.playerEntity.getComponent(TransformComponent);

    if (!combat || !transform || !combat.canAttack()) return;

    // Find nearby enemies
    const enemies = this.world.getEntities().filter((e) => {
      const enemyTransform = e.getComponent(TransformComponent);
      if (!enemyTransform || e === this.playerEntity) return false;

      const distance = transform.position.distanceTo(enemyTransform.position);
      return distance <= combat.attackRange;
    });

    // Attack first enemy in range
    if (enemies.length > 0) {
      globalEventBus.emit('combat:attack', {
        attacker: this.playerEntity,
        target: enemies[0],
      });
    }
  }

  /**
   * Main game loop
   */
  private gameLoop = (currentTime: number): void => {
    if (!this.running) return;

    // Calculate delta time (in seconds)
    const deltaTime = this.lastTime === 0 ? 0 : (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to prevent huge jumps
    const cappedDelta = Math.min(deltaTime, 0.1);

    // Update input
    this.inputManager.update();

    // Update world (all systems)
    this.world.update(cappedDelta);

    // Render
    this.renderer.render(this.world.getEntities());

    // Enemy spawning
    this.updateEnemySpawning(cappedDelta);

    // Continue loop
    requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update enemy spawning
   */
  private updateEnemySpawning(deltaTime: number): void {
    this.enemySpawnTimer += deltaTime * 1000; // Convert to milliseconds

    if (this.enemySpawnTimer >= this.ENEMY_SPAWN_INTERVAL) {
      this.trySpawnEnemy();
      this.enemySpawnTimer = 0;
    }
  }

  /**
   * Try to spawn a new enemy
   */
  private trySpawnEnemy(): void {
    const config = gameData.getConfig();
    const entities = this.world.getEntities();
    const enemyCount = entities.filter((e) =>
      e.hasComponent(require('@game/components').EnemyComponent)
    ).length;

    if (enemyCount >= config.dungeon.maxEnemies) return;

    // Spawn with configured rate
    if (Math.random() < config.dungeon.enemySpawnRate) {
      const position = this.dungeonGenerator.getRandomWalkablePosition();
      const playerLevel = this.getPlayerLevel();
      const enemy = EntityFactory.createRandomEnemyForLevel(position, playerLevel);

      if (enemy) {
        this.world.addEntity(enemy);
      }
    }
  }

  /**
   * Get player level
   */
  private getPlayerLevel(): number {
    if (!this.playerEntity) return 1;
    const player = this.playerEntity.getComponent(PlayerComponent);
    return player?.level ?? 1;
  }

  /**
   * Update UI
   */
  private updateUI(): void {
    if (!this.playerEntity) return;

    const player = this.playerEntity.getComponent(PlayerComponent);
    const health = this.playerEntity.getComponent(HealthComponent);
    const combat = this.playerEntity.getComponent(CombatComponent);
    const movement = this.playerEntity.getComponent(MovementComponent);

    if (!player || !health || !combat || !movement) return;

    // Update stats
    this.setElementText('level', player.level.toString());
    this.setElementText('health', `${Math.floor(health.current)}/${health.max}`);
    this.setElementText(
      'exp',
      `${Math.floor(player.experience)}/${player.experienceToNext}`
    );
    this.setElementText('strength', combat.strength.toString());
    this.setElementText('defense', combat.defense.toString());
    this.setElementText('speed', Math.floor(movement.speed).toString());
    this.setElementText('kills', player.kills.toString());

    // Update bars
    const healthBar = document.getElementById('healthBar');
    if (healthBar) {
      healthBar.style.width = `${health.getHealthPercent() * 100}%`;
    }

    const expBar = document.getElementById('expBar');
    if (expBar) {
      expBar.style.width = `${player.getExpProgress() * 100}%`;
    }
  }

  /**
   * Helper to set element text
   */
  private setElementText(id: string, text: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  /**
   * Game over
   */
  private gameOver(data: any): void {
    this.running = false;
    alert(`Game Over! Level: ${data.stats.level}, Kills: ${data.stats.kills}`);
  }

  /**
   * Start the game
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = 0;
    requestAnimationFrame(this.gameLoop);
    console.log('🎮 Game started!');
  }

  /**
   * Stop the game
   */
  stop(): void {
    this.running = false;
    console.log('⏸️ Game stopped');
  }
}

// ==================== Entry Point ====================

async function main() {
  const game = new Game();

  try {
    await game.init();
    game.start();
  } catch (error) {
    console.error('❌ Failed to start game:', error);
  }
}

// Start game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
