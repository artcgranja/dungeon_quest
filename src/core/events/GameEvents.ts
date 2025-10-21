/**
 * Game Event Definitions
 * All events are type-safe
 */

import type { Entity } from '../ecs/Entity';

export interface GameEventMap {
  // Entity lifecycle events
  'entity:created': {
    entity: Entity;
  };

  'entity:destroyed': {
    entity: Entity;
  };

  // Combat events
  'damage:dealt': {
    attacker: Entity;
    target: Entity;
    damage: number;
  };

  'enemy:killed': {
    enemy: Entity;
    killer: Entity;
    expReward: number;
  };

  // Player events
  'player:levelup': {
    player: Entity;
    level: number;
    newStrength: number;
    newDefense: number;
    newSpeed: number;
  };

  'experience:gained': {
    player: Entity;
    amount: number;
  };

  // Health events
  'health:changed': {
    entity: Entity;
    health: number;
    maxHealth: number;
  };

  'entity:died': {
    entity: Entity;
  };

  // UI events
  'ui:update': {
    type: 'health' | 'exp' | 'level' | 'stats' | 'kills';
    data: any;
  };
}

export type GameEventType = keyof GameEventMap;
export type GameEventData<T extends GameEventType> = GameEventMap[T];
