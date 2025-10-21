import type { World } from '@core/ecs';
import { Vector2D, Random } from '@core/utils';
import { gameData } from '@data';
import { EntityFactory } from '../managers/EntityFactory';

/**
 * Tile types
 */
export enum TileType {
  FLOOR = 0,
  WALL = 1,
}

/**
 * DungeonGenerator - procedural dungeon generation
 */
export class DungeonGenerator {
  private width: number;
  private height: number;
  private tileSize: number;
  private tiles: TileType[][];
  private random: Random;

  constructor(seed?: number) {
    const config = gameData.getConfig().dungeon;
    this.width = config.gridWidth;
    this.height = config.gridHeight;
    this.tileSize = config.tileSize;
    this.tiles = [];
    this.random = new Random(seed);
  }

  /**
   * Generate a new dungeon
   */
  generate(world: World): void {
    this.initializeTiles();
    this.placeWalls();
    this.clearSpawnArea();
    this.spawnTilesToWorld(world);
  }

  /**
   * Initialize all tiles as floor
   */
  private initializeTiles(): void {
    this.tiles = [];
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = TileType.FLOOR;
      }
    }
  }

  /**
   * Place walls randomly
   */
  private placeWalls(): void {
    const config = gameData.getConfig().dungeon;

    // Place edge walls
    for (let x = 0; x < this.width; x++) {
      this.tiles[0][x] = TileType.WALL;
      this.tiles[this.height - 1][x] = TileType.WALL;
    }

    for (let y = 0; y < this.height; y++) {
      this.tiles[y][0] = TileType.WALL;
      this.tiles[y][this.width - 1] = TileType.WALL;
    }

    // Place random interior walls
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.random.next() < config.wallDensity) {
          this.tiles[y][x] = TileType.WALL;
        }
      }
    }
  }

  /**
   * Clear spawn area in center
   */
  private clearSpawnArea(): void {
    const config = gameData.getConfig().dungeon;
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    const radius = config.spawnClearRadius;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius) {
          this.tiles[y][x] = TileType.FLOOR;
        }
      }
    }
  }

  /**
   * Spawn tile entities into the world
   */
  private spawnTilesToWorld(world: World): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const worldX = x * this.tileSize + this.tileSize / 2;
        const worldY = y * this.tileSize + this.tileSize / 2;
        const position = new Vector2D(worldX, worldY);

        // Always spawn floor for visual
        const floorTint = (x + y) % 2 === 0 ? 0x4a5568 : 0x3d4653;
        const floor = EntityFactory.createFloor(position, this.tileSize, floorTint);
        world.addEntity(floor);

        // Spawn wall if needed
        if (this.tiles[y][x] === TileType.WALL) {
          const wall = EntityFactory.createWall(position, this.tileSize);
          world.addEntity(wall);
        }
      }
    }
  }

  /**
   * Get spawn position (center of dungeon)
   */
  getSpawnPosition(): Vector2D {
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    return new Vector2D(
      centerX * this.tileSize + this.tileSize / 2,
      centerY * this.tileSize + this.tileSize / 2
    );
  }

  /**
   * Get random walkable position
   */
  getRandomWalkablePosition(): Vector2D {
    let x, y;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      x = this.random.nextInt(1, this.width - 2);
      y = this.random.nextInt(1, this.height - 2);
      attempts++;
    } while (this.tiles[y][x] === TileType.WALL && attempts < maxAttempts);

    return new Vector2D(
      x * this.tileSize + this.tileSize / 2,
      y * this.tileSize + this.tileSize / 2
    );
  }

  /**
   * Check if position is walkable
   */
  isWalkable(worldX: number, worldY: number): boolean {
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);

    if (
      tileX < 0 ||
      tileX >= this.width ||
      tileY < 0 ||
      tileY >= this.height
    ) {
      return false;
    }

    return this.tiles[tileY][tileX] === TileType.FLOOR;
  }

  /**
   * Get tile at world position
   */
  getTileAt(worldX: number, worldY: number): TileType | null {
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);

    if (
      tileX < 0 ||
      tileX >= this.width ||
      tileY < 0 ||
      tileY >= this.height
    ) {
      return null;
    }

    return this.tiles[tileY][tileX];
  }

  /**
   * Get dungeon bounds
   */
  getBounds(): { width: number; height: number } {
    return {
      width: this.width * this.tileSize,
      height: this.height * this.tileSize,
    };
  }
}
