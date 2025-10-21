import Phaser from 'phaser';
import type { GameScene } from '../rendering/scenes/GameScene';

export class Dungeon {
  private tiles: number[][] = [];
  private width: number;
  private height: number;
  private tileSize: number;
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: GameScene, gameWidth: number, gameHeight: number, tileSize: number) {
    this.tileSize = tileSize;
    this.width = Math.floor(gameWidth / tileSize);
    this.height = Math.floor(gameHeight / tileSize);
    this.graphics = scene.add.graphics();

    this.generate();
    this.draw();
  }

  generate() {
    // Create a simple dungeon layout
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        // Walls on edges
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          this.tiles[y][x] = 1;
        }
        // Random obstacles
        else if (Math.random() < 0.08) {
          this.tiles[y][x] = 1;
        }
        // Floor
        else {
          this.tiles[y][x] = 0;
        }
      }
    }

    // Clear starting area around player spawn
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    for (let y = centerY - 2; y <= centerY + 2; y++) {
      for (let x = centerX - 2; x <= centerX + 2; x++) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          this.tiles[y][x] = 0;
        }
      }
    }
  }

  isWall(x: number, y: number, width: number, height: number): boolean {
    // Check all corners of the entity
    const corners: [number, number][] = [
      [x, y],
      [x + width, y],
      [x, y + height],
      [x + width, y + height]
    ];

    for (let [cx, cy] of corners) {
      const tileX = Math.floor(cx / this.tileSize);
      const tileY = Math.floor(cy / this.tileSize);

      if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
        return true;
      }

      if (this.tiles[tileY] && this.tiles[tileY][tileX] === 1) {
        return true;
      }
    }

    return false;
  }

  draw() {
    this.graphics.clear();

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        if (tile === 1) {
          // Wall
          this.graphics.fillStyle(0x2d3748);
          this.graphics.fillRect(px, py, this.tileSize, this.tileSize);
          this.graphics.lineStyle(1, 0x1a202c);
          this.graphics.strokeRect(px, py, this.tileSize, this.tileSize);
        } else {
          // Floor (checkerboard pattern)
          const color = (x + y) % 2 === 0 ? 0x4a5568 : 0x3d4653;
          this.graphics.fillStyle(color);
          this.graphics.fillRect(px, py, this.tileSize, this.tileSize);
        }
      }
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}
