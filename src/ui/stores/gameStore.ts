import { writable } from 'svelte/store';

export interface GameState {
  level: number;
  health: number;
  maxHealth: number;
  exp: number;
  expToNext: number;
  strength: number;
  defense: number;
  speed: number;
  kills: number;
}

const initialState: GameState = {
  level: 1,
  health: 100,
  maxHealth: 100,
  exp: 0,
  expToNext: 100,
  strength: 10,
  defense: 5,
  speed: 3,
  kills: 0
};

export const gameStore = writable<GameState>(initialState);

// Helper functions to update the store
export function updateHealth(health: number, maxHealth: number) {
  gameStore.update(state => ({ ...state, health, maxHealth }));
}

export function updateExp(exp: number, expToNext: number) {
  gameStore.update(state => ({ ...state, exp, expToNext }));
}

export function updateLevel(level: number) {
  gameStore.update(state => ({ ...state, level }));
}

export function updateStats(strength: number, defense: number, speed: number) {
  gameStore.update(state => ({ ...state, strength, defense, speed }));
}

export function updateKills(kills: number) {
  gameStore.update(state => ({ ...state, kills }));
}
