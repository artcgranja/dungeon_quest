import Phaser from 'phaser';
import type { Player } from './Player';
import type { GameScene } from '../rendering/scenes/GameScene';

export type EnemyType = 'slime' | 'goblin' | 'skeleton' | 'demon';

interface EnemyStats {
  color: number;
  health: number;
  damage: number;
  speed: number;
  exp: number;
}

export class Enemy {
  public scene: GameScene;
  public x: number;
  public y: number;
  public width = 25;
  public height = 25;
  public alive = true;

  // Stats
  public type: EnemyType;
  public maxHealth: number;
  public health: number;
  public damage: number;
  public speed: number;
  public exp: number;
  public color: number;

  // AI
  public aggroRange = 200;
  public attackRange = 35;
  public lastAttackTime = 0;
  public attackCooldown = 1500;

  // Graphics
  private graphics: Phaser.GameObjects.Graphics;

  private static readonly TYPES: Record<EnemyType, EnemyStats> = {
    slime: { color: 0x8b5cf6, health: 30, damage: 5, speed: 1, exp: 25 },
    goblin: { color: 0xef4444, health: 50, damage: 10, speed: 1.5, exp: 50 },
    skeleton: { color: 0xf3f4f6, health: 70, damage: 15, speed: 1.2, exp: 75 },
    demon: { color: 0x991b1b, health: 100, damage: 20, speed: 0.8, exp: 150 }
  };

  constructor(scene: GameScene, x: number, y: number, type: EnemyType = 'slime') {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type;

    const stats = Enemy.TYPES[type];
    this.maxHealth = stats.health;
    this.health = stats.health;
    this.damage = stats.damage;
    this.speed = stats.speed;
    this.exp = stats.exp;
    this.color = stats.color;

    this.graphics = scene.add.graphics();
  }

  update(player: Player) {
    if (!this.alive) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Chase player if in aggro range
    if (distance < this.aggroRange) {
      const moveX = (dx / distance) * this.speed;
      const moveY = (dy / distance) * this.speed;

      // Move towards player if not in attack range
      if (distance > this.attackRange) {
        const newX = this.x + moveX;
        const newY = this.y + moveY;

        const dungeon = this.scene.getDungeon();
        if (!dungeon.isWall(newX, this.y, this.width, this.height)) {
          this.x = newX;
        }
        if (!dungeon.isWall(this.x, newY, this.width, this.height)) {
          this.y = newY;
        }
      } else {
        // Attack player
        this.attackPlayer(player);
      }
    }

    this.draw();
  }

  attackPlayer(player: Player) {
    const now = Date.now();
    if (now - this.lastAttackTime > this.attackCooldown) {
      player.takeDamage(this.damage);
      this.lastAttackTime = now;
    }
  }

  takeDamage(amount: number) {
    this.health -= amount;

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.alive = false;
  }

  draw() {
    if (!this.alive) return;

    this.graphics.clear();

    // Draw shadow
    this.graphics.fillStyle(0x000000, 0.3);
    this.graphics.fillEllipse(
      this.x + this.width / 2,
      this.y + this.height + 5,
      this.width / 2,
      5
    );

    // Draw enemy body
    this.graphics.fillStyle(this.color);
    this.graphics.fillRect(this.x, this.y, this.width, this.height);

    // Draw eyes
    this.graphics.fillStyle(0xffffff);
    this.graphics.fillRect(this.x + 5, this.y + 8, 5, 5);
    this.graphics.fillRect(this.x + 15, this.y + 8, 5, 5);

    // Draw health bar
    const healthBarWidth = this.width;
    const healthBarHeight = 4;
    const healthPercent = this.health / this.maxHealth;

    this.graphics.fillStyle(0x333333);
    this.graphics.fillRect(this.x, this.y - 10, healthBarWidth, healthBarHeight);

    this.graphics.fillStyle(0xe94560);
    this.graphics.fillRect(this.x, this.y - 10, healthBarWidth * healthPercent, healthBarHeight);
  }

  destroy() {
    this.graphics.destroy();
  }
}
