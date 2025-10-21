import type { EntityId } from '../ecs/Entity';

/**
 * Game Event Definitions
 * Type-safe event data interfaces
 */

// ==================== Combat Events ====================

export interface DamageDealtEvent {
  attackerId: EntityId;
  targetId: EntityId;
  damage: number;
  isCritical?: boolean;
}

export interface EntityDiedEvent {
  entityId: EntityId;
  killerId?: EntityId;
  position: { x: number; y: number };
}

export interface AttackEvent {
  attackerId: EntityId;
  targetId?: EntityId;
  direction: { x: number; y: number };
}

// ==================== Player Events ====================

export interface PlayerLevelUpEvent {
  newLevel: number;
  statPoints: number;
}

export interface PlayerStatUpgradeEvent {
  stat: 'strength' | 'defense' | 'speed';
  oldValue: number;
  newValue: number;
}

export interface ExperienceGainedEvent {
  amount: number;
  currentExp: number;
  expToNext: number;
}

// ==================== Enemy Events ====================

export interface EnemySpawnedEvent {
  entityId: EntityId;
  enemyType: string;
  position: { x: number; y: number };
}

export interface EnemyKilledEvent {
  entityId: EntityId;
  enemyType: string;
  experienceReward: number;
  lootDrops?: string[];
}

// ==================== Item Events ====================

export interface ItemPickedUpEvent {
  entityId: EntityId;
  itemId: string;
  itemType: string;
}

export interface ItemDroppedEvent {
  itemId: string;
  position: { x: number; y: number };
}

export interface ItemUsedEvent {
  entityId: EntityId;
  itemId: string;
}

// ==================== Collision Events ====================

export interface CollisionEvent {
  entityA: EntityId;
  entityB: EntityId;
  position: { x: number; y: number };
}

export interface TileCollisionEvent {
  entityId: EntityId;
  tileX: number;
  tileY: number;
}

// ==================== Level Events ====================

export interface RoomClearedEvent {
  roomId: string;
  enemiesKilled: number;
  completionTime: number;
}

export interface LevelGeneratedEvent {
  levelNumber: number;
  roomCount: number;
  enemyCount: number;
}

export interface DoorOpenedEvent {
  doorId: string;
  fromRoom: string;
  toRoom: string;
}

// ==================== Game State Events ====================

export interface GamePausedEvent {
  timestamp: number;
}

export interface GameResumedEvent {
  timestamp: number;
}

export interface GameOverEvent {
  reason: 'death' | 'quit' | 'win';
  stats: {
    level: number;
    kills: number;
    playtime: number;
  };
}

// ==================== UI Events ====================

export interface NotificationEvent {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

// ==================== Event Type Enum ====================

/**
 * Centralized event names for type safety
 * Use these constants when emitting/listening to events
 */
export const GameEventType = {
  // Combat
  DAMAGE_DEALT: 'damage:dealt',
  ENTITY_DIED: 'entity:died',
  ATTACK: 'attack',

  // Player
  PLAYER_LEVEL_UP: 'player:levelup',
  PLAYER_STAT_UPGRADE: 'player:stat_upgrade',
  EXPERIENCE_GAINED: 'player:exp_gained',

  // Enemy
  ENEMY_SPAWNED: 'enemy:spawned',
  ENEMY_KILLED: 'enemy:killed',

  // Items
  ITEM_PICKED_UP: 'item:picked_up',
  ITEM_DROPPED: 'item:dropped',
  ITEM_USED: 'item:used',

  // Collision
  COLLISION: 'collision',
  TILE_COLLISION: 'collision:tile',

  // Level
  ROOM_CLEARED: 'level:room_cleared',
  LEVEL_GENERATED: 'level:generated',
  DOOR_OPENED: 'level:door_opened',

  // Game State
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
  GAME_OVER: 'game:over',

  // UI
  NOTIFICATION: 'ui:notification',
} as const;

/**
 * Type helper for event type keys
 */
export type GameEventTypeKey = typeof GameEventType[keyof typeof GameEventType];
