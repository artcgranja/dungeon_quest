import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { Dungeon } from './Dungeon';
import type { GameScene } from '../rendering/scenes/GameScene';

export class Player {
  public scene: GameScene;
  public x: number;
  public y: number;
  public width = 30;
  public height = 30;
  public speed = 3;
  public direction: 'up' | 'down' | 'left' | 'right' = 'down';

  // Stats
  public level = 1;
  public maxHealth = 100;
  public health = 100;
  public strength = 10;
  public defense = 5;
  public experience = 0;
  public experienceToNextLevel = 100;

  // Combat
  public attackRange = 50;
  public isAttacking = false;
  public attackAnimationTime = 0;
  public lastAttackTime = 0;
  public attackCooldown = 500;

  // Graphics
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: GameScene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.graphics = scene.add.graphics();
  }

  move(dx: number, dy: number, dungeon: Dungeon) {
    const newX = this.x + dx * this.speed;
    const newY = this.y + dy * this.speed;

    // Check collision with walls
    if (!dungeon.isWall(newX, this.y, this.width, this.height)) {
      this.x = newX;
    }
    if (!dungeon.isWall(this.x, newY, this.width, this.height)) {
      this.y = newY;
    }

    // Update direction
    if (dx > 0) this.direction = 'right';
    else if (dx < 0) this.direction = 'left';
    else if (dy > 0) this.direction = 'down';
    else if (dy < 0) this.direction = 'up';

    // Keep player in bounds
    this.x = Math.max(0, Math.min(800 - this.width, this.x));
    this.y = Math.max(0, Math.min(600 - this.height, this.y));
  }

  attack(enemies: Enemy[]) {
    const now = Date.now();
    if (now - this.lastAttackTime < this.attackCooldown) {
      return;
    }

    this.isAttacking = true;
    this.attackAnimationTime = 300;
    this.lastAttackTime = now;

    // Check if any enemy is in range
    enemies.forEach(enemy => {
      if (enemy.alive && this.isInAttackRange(enemy)) {
        const damage = this.strength + Math.floor(Math.random() * 5);
        enemy.takeDamage(damage);
      }
    });
  }

  isInAttackRange(enemy: Enemy): boolean {
    const dx = enemy.x - this.x;
    const dy = enemy.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if enemy is in front of player based on direction
    const inRange = distance < this.attackRange;
    let inDirection = false;

    switch(this.direction) {
      case 'up': inDirection = dy < 0 && Math.abs(dx) < this.attackRange / 2; break;
      case 'down': inDirection = dy > 0 && Math.abs(dx) < this.attackRange / 2; break;
      case 'left': inDirection = dx < 0 && Math.abs(dy) < this.attackRange / 2; break;
      case 'right': inDirection = dx > 0 && Math.abs(dy) < this.attackRange / 2; break;
    }

    return inRange && inDirection;
  }

  takeDamage(amount: number) {
    const actualDamage = Math.max(1, amount - this.defense);
    this.health = Math.max(0, this.health - actualDamage);

    if (this.health === 0) {
      this.die();
    }

    this.scene.updateUI();
  }

  gainExperience(amount: number) {
    this.experience += amount;

    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }

    this.scene.updateUI();
  }

  levelUp() {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);

    // Automatic stat increases
    this.maxHealth += 20;
    this.health = this.maxHealth;
    this.strength += 3;
    this.defense += 2;
    this.speed += 0.2;

    // Show level up message (you can implement a proper notification system later)
    console.log(`LEVEL UP! Now Level ${this.level}`);

    this.scene.updateUI();
  }

  die() {
    alert('Game Over! You have been defeated. Reloading...');
    window.location.reload();
  }

  update(delta: number) {
    // Update attack animation
    if (this.isAttacking && this.attackAnimationTime > 0) {
      this.attackAnimationTime -= delta;
      if (this.attackAnimationTime <= 0) {
        this.isAttacking = false;
      }
    }

    this.draw();
  }

  draw() {
    this.graphics.clear();

    // Draw shadow
    this.graphics.fillStyle(0x000000, 0.3);
    this.graphics.fillEllipse(
      this.x + this.width / 2,
      this.y + this.height + 5,
      this.width / 2,
      5
    );

    // Draw player body
    this.graphics.fillStyle(0x4ecca3);
    this.graphics.fillRect(this.x, this.y, this.width, this.height);

    // Draw player face/direction indicator
    this.graphics.fillStyle(0x45b393);
    switch(this.direction) {
      case 'up':
        this.graphics.fillRect(this.x + 8, this.y, 14, 10);
        break;
      case 'down':
        this.graphics.fillRect(this.x + 8, this.y + 20, 14, 10);
        break;
      case 'left':
        this.graphics.fillRect(this.x, this.y + 8, 10, 14);
        break;
      case 'right':
        this.graphics.fillRect(this.x + 20, this.y + 8, 10, 14);
        break;
    }

    // Draw attack animation
    if (this.isAttacking && this.attackAnimationTime > 0) {
      this.graphics.lineStyle(3, 0xe94560);

      const attackOffset = 35;
      switch(this.direction) {
        case 'up':
          this.graphics.arc(
            this.x + this.width / 2,
            this.y - attackOffset,
            this.attackRange / 2,
            Math.PI,
            0,
            true
          );
          break;
        case 'down':
          this.graphics.arc(
            this.x + this.width / 2,
            this.y + this.height + attackOffset,
            this.attackRange / 2,
            0,
            Math.PI,
            true
          );
          break;
        case 'left':
          this.graphics.arc(
            this.x - attackOffset,
            this.y + this.height / 2,
            this.attackRange / 2,
            -Math.PI / 2,
            Math.PI / 2,
            true
          );
          break;
        case 'right':
          this.graphics.arc(
            this.x + this.width + attackOffset,
            this.y + this.height / 2,
            this.attackRange / 2,
            Math.PI / 2,
            -Math.PI / 2,
            true
          );
          break;
      }
      this.graphics.strokePath();
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}
