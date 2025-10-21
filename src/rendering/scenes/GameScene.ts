import Phaser from 'phaser';
import { Player } from '../../game/Player';
import { Enemy } from '../../game/Enemy';
import { Dungeon } from '../../game/Dungeon';
import { updateHealth, updateExp, updateLevel, updateStats, updateKills } from '../../ui/stores/gameStore';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private dungeon!: Dungeon;
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
  private monstersKilled = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Create dungeon
    this.dungeon = new Dungeon(this, 800, 600, 40);

    // Create player
    this.player = new Player(this, 400, 300);

    // Spawn initial enemies
    this.spawnInitialEnemies();

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
      this.player.attack(this.enemies);
    });

    // Initial UI update
    this.updateUI();
  }

  update(_time: number, delta: number) {
    // Handle input
    this.handleInput();

    // Update player
    this.player.update(delta);

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(this.player);
    });

    // Remove dead enemies
    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.alive) {
        this.monstersKilled++;
        this.player.gainExperience(enemy.exp);
        this.updateUI();
        enemy.destroy();
        return false;
      }
      return true;
    });

    // Spawn more enemies if too few
    if (this.enemies.length < 3) {
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

    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal movement
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
      this.player.move(dx, dy, this.dungeon);
    }
  }

  private spawnInitialEnemies() {
    const enemyTypes: ('slime' | 'goblin' | 'skeleton' | 'demon')[] = ['slime', 'slime', 'goblin', 'skeleton'];

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
      // Scale enemy type based on player level
      if (!type) {
        if (this.player.level >= 5) {
          type = Math.random() < 0.5 ? 'skeleton' : 'goblin';
        } else if (this.player.level >= 3) {
          type = Math.random() < 0.5 ? 'goblin' : 'slime';
        } else {
          type = Math.random() < 0.7 ? 'slime' : 'goblin';
        }
      }

      this.enemies.push(new Enemy(this, x, y, type));
    }
  }

  public updateUI() {
    updateHealth(this.player.health, this.player.maxHealth);
    updateExp(this.player.experience, this.player.experienceToNextLevel);
    updateLevel(this.player.level);
    updateStats(this.player.strength, this.player.defense, this.player.speed);
    updateKills(this.monstersKilled);
  }

  public getDungeon(): Dungeon {
    return this.dungeon;
  }
}
