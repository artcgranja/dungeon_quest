/**
 * Core ECS (Entity Component System) module
 *
 * Architecture:
 * - Entity: Container for components (data)
 * - Component: Pure data (no logic)
 * - System: Logic that operates on components
 * - World: Manages entities and systems
 */

export * from './Component';
export * from './Entity';
export * from './System';
export * from './World';
