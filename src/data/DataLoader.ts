/**
 * DataLoader - loads game data from JSON files
 * Provides type-safe access to game configuration
 */

export interface EnemyData {
  name: string;
  type: string;
  health: number;
  strength: number;
  defense: number;
  speed: number;
  attackRange: number;
  attackCooldown: number;
  aggroRange: number;
  behavior: string;
  experienceReward: number;
  lootTable: string;
  sprite: {
    texture: string;
    tint: number;
    width: number;
    height: number;
  };
  collider: {
    radius: number;
  };
}

export interface ItemData {
  id: string;
  name: string;
  type: string;
  rarity: string;
  sprite: {
    texture: string;
    tint: number;
    width: number;
    height: number;
  };
  effects?: Record<string, any>;
  stats?: Record<string, number>;
  stackable: boolean;
  maxStack?: number;
  value?: number;
}

export interface GameConfig {
  game: {
    name: string;
    version: string;
    targetFPS: number;
  };
  canvas: {
    width: number;
    height: number;
    backgroundColor: number;
  };
  player: {
    startingHealth: number;
    startingStrength: number;
    startingDefense: number;
    startingSpeed: number;
    attackRange: number;
    attackCooldown: number;
    levelUpStatPoints: number;
    sprite: {
      texture: string;
      tint: number;
      width: number;
      height: number;
    };
    collider: {
      radius: number;
    };
  };
  progression: {
    baseExperienceToLevel: number;
    experienceScaling: number;
    healthPerLevel: number;
    strengthPerLevel: number;
    defensePerLevel: number;
    speedPerLevel: number;
  };
  dungeon: {
    tileSize: number;
    gridWidth: number;
    gridHeight: number;
    wallDensity: number;
    spawnClearRadius: number;
    maxEnemies: number;
    enemySpawnRate: number;
  };
  spawning: {
    initialEnemies: number;
    enemyTypesByLevel: Record<string, string[]>;
    enemyWeightsByLevel: Record<string, number[]>;
  };
  lootTables: Record<string, Record<string, number>>;
  ui: {
    colors: Record<string, number>;
    notifications: {
      defaultDuration: number;
      fadeOutDuration: number;
    };
  };
  debug: {
    showColliders: boolean;
    showFPS: boolean;
    showEntityCount: boolean;
    godMode: boolean;
  };
}

/**
 * Main DataLoader class
 */
export class DataLoader {
  private static instance: DataLoader;

  private enemies: Map<string, EnemyData> = new Map();
  private items: Map<string, ItemData> = new Map();
  private config: GameConfig | null = null;
  private loaded: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  /**
   * Load all game data
   */
  async loadAll(): Promise<void> {
    await Promise.all([this.loadEnemies(), this.loadItems(), this.loadConfig()]);
    this.loaded = true;
  }

  /**
   * Load enemy data
   */
  private async loadEnemies(): Promise<void> {
    const response = await fetch('/data/enemies.json');
    const data = await response.json();

    for (const [key, enemy] of Object.entries(data)) {
      this.enemies.set(key, enemy as EnemyData);
    }
  }

  /**
   * Load item data
   */
  private async loadItems(): Promise<void> {
    const response = await fetch('/data/items.json');
    const data = await response.json();

    for (const [key, item] of Object.entries(data)) {
      this.items.set(key, item as ItemData);
    }
  }

  /**
   * Load game config
   */
  private async loadConfig(): Promise<void> {
    const response = await fetch('/data/game_config.json');
    this.config = await response.json();
  }

  /**
   * Check if data is loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get enemy data by type
   */
  getEnemyData(type: string): EnemyData | null {
    return this.enemies.get(type) ?? null;
  }

  /**
   * Get all enemy types
   */
  getAllEnemyTypes(): string[] {
    return Array.from(this.enemies.keys());
  }

  /**
   * Get enemy data for a specific player level
   */
  getEnemiesForLevel(playerLevel: number): EnemyData[] {
    if (!this.config) return [];

    let enemyTypes: string[] = [];

    // Find matching level range
    for (const [range, types] of Object.entries(
      this.config.spawning.enemyTypesByLevel
    )) {
      if (this.isLevelInRange(playerLevel, range)) {
        enemyTypes = types;
        break;
      }
    }

    return enemyTypes
      .map((type) => this.getEnemyData(type))
      .filter((data) => data !== null) as EnemyData[];
  }

  /**
   * Check if level is in range string (e.g., "1-3", "11+")
   */
  private isLevelInRange(level: number, range: string): boolean {
    if (range.endsWith('+')) {
      const min = parseInt(range.replace('+', ''));
      return level >= min;
    }

    const [min, max] = range.split('-').map(Number);
    return level >= min && level <= max;
  }

  /**
   * Get item data by ID
   */
  getItemData(id: string): ItemData | null {
    return this.items.get(id) ?? null;
  }

  /**
   * Get all item IDs
   */
  getAllItemIds(): string[] {
    return Array.from(this.items.keys());
  }

  /**
   * Get game config
   */
  getConfig(): GameConfig {
    if (!this.config) {
      throw new Error('Game config not loaded');
    }
    return this.config;
  }

  /**
   * Get loot table
   */
  getLootTable(tableName: string): Record<string, number> {
    if (!this.config) return {};
    return this.config.lootTables[tableName] ?? {};
  }

  /**
   * Roll loot from a table
   */
  rollLoot(tableName: string, rng?: { next(): number }): string | null {
    const table = this.getLootTable(tableName);
    const random = rng ? rng.next() : Math.random();

    let cumulative = 0;
    for (const [itemId, chance] of Object.entries(table)) {
      cumulative += chance;
      if (random <= cumulative) {
        return itemId;
      }
    }

    return null;
  }
}

/**
 * Global data loader instance
 */
export const gameData = DataLoader.getInstance();
