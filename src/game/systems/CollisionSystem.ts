import { System } from '@core/ecs';
import type { Entity } from '@core/ecs';
import { EventBus, GameEventType } from '@core/events';
import type { CollisionEvent } from '@core/events';
import {
  TransformComponent,
  ColliderComponent,
  ColliderShape,
  CollisionLayer,
} from '../components';

/**
 * Spatial grid for broad-phase collision detection
 */
class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, Set<Entity>>;

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  /**
   * Get grid cell key for position
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Clear the grid
   */
  clear(): void {
    this.grid.clear();
  }

  /**
   * Insert entity into grid
   */
  insert(entity: Entity): void {
    const transform = entity.getComponent(TransformComponent);
    const collider = entity.getComponent(ColliderComponent);

    if (!transform || !collider) return;

    const key = this.getCellKey(transform.position.x, transform.position.y);

    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }

    this.grid.get(key)!.add(entity);
  }

  /**
   * Get nearby entities
   */
  getNearby(entity: Entity): Entity[] {
    const transform = entity.getComponent(TransformComponent);
    if (!transform) return [];

    const nearby: Set<Entity> = new Set();
    const centerKey = this.getCellKey(transform.position.x, transform.position.y);

    // Check 3x3 grid around entity
    const [cx, cy] = centerKey.split(',').map(Number);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx + dx},${cy + dy}`;
        const entities = this.grid.get(key);

        if (entities) {
          entities.forEach((e) => {
            if (e !== entity) nearby.add(e);
          });
        }
      }
    }

    return Array.from(nearby);
  }
}

/**
 * CollisionSystem - detects and resolves collisions
 * Uses spatial partitioning for performance
 */
export class CollisionSystem extends System {
  protected readonly requiredComponents = [TransformComponent, ColliderComponent];
  public readonly priority = 20; // After movement

  private eventBus: EventBus;
  private spatialGrid: SpatialGrid;

  constructor(eventBus: EventBus) {
    super();
    this.eventBus = eventBus;
    this.spatialGrid = new SpatialGrid(100);
  }

  update(entities: readonly Entity[], deltaTime: number): void {
    const collidables = this.filterEntities(entities);

    // Clear and rebuild spatial grid
    this.spatialGrid.clear();
    collidables.forEach((entity) => this.spatialGrid.insert(entity));

    // Check collisions
    for (const entityA of collidables) {
      const nearby = this.spatialGrid.getNearby(entityA);

      for (const entityB of nearby) {
        if (this.checkCollision(entityA, entityB)) {
          this.handleCollision(entityA, entityB);
        }
      }
    }
  }

  /**
   * Check if two entities are colliding
   */
  private checkCollision(entityA: Entity, entityB: Entity): boolean {
    const transformA = entityA.getComponent(TransformComponent)!;
    const colliderA = entityA.getComponent(ColliderComponent)!;
    const transformB = entityB.getComponent(TransformComponent)!;
    const colliderB = entityB.getComponent(ColliderComponent)!;

    // Check collision layers
    if (!colliderA.canCollideWith(colliderB.layer)) return false;
    if (!colliderB.canCollideWith(colliderA.layer)) return false;

    // Get positions with offset
    const posA = transformA.position.add(
      new (require('@core/utils').Vector2D)(colliderA.offsetX, colliderA.offsetY)
    );
    const posB = transformB.position.add(
      new (require('@core/utils').Vector2D)(colliderB.offsetX, colliderB.offsetY)
    );

    // Circle vs Circle
    if (
      colliderA.shape === ColliderShape.CIRCLE &&
      colliderB.shape === ColliderShape.CIRCLE
    ) {
      return this.circleVsCircle(posA, colliderA.radius, posB, colliderB.radius);
    }

    // Rectangle vs Rectangle (AABB)
    if (
      colliderA.shape === ColliderShape.RECTANGLE &&
      colliderB.shape === ColliderShape.RECTANGLE
    ) {
      return this.aabbVsAabb(
        posA,
        colliderA.width,
        colliderA.height,
        posB,
        colliderB.width,
        colliderB.height
      );
    }

    // Circle vs Rectangle
    if (colliderA.shape === ColliderShape.CIRCLE) {
      return this.circleVsAabb(
        posA,
        colliderA.radius,
        posB,
        colliderB.width,
        colliderB.height
      );
    } else {
      return this.circleVsAabb(
        posB,
        colliderB.radius,
        posA,
        colliderA.width,
        colliderA.height
      );
    }
  }

  /**
   * Circle vs Circle collision
   */
  private circleVsCircle(
    posA: { x: number; y: number },
    radiusA: number,
    posB: { x: number; y: number },
    radiusB: number
  ): boolean {
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const distSquared = dx * dx + dy * dy;
    const radiusSum = radiusA + radiusB;
    return distSquared < radiusSum * radiusSum;
  }

  /**
   * AABB vs AABB collision
   */
  private aabbVsAabb(
    posA: { x: number; y: number },
    widthA: number,
    heightA: number,
    posB: { x: number; y: number },
    widthB: number,
    heightB: number
  ): boolean {
    const halfWidthA = widthA / 2;
    const halfHeightA = heightA / 2;
    const halfWidthB = widthB / 2;
    const halfHeightB = heightB / 2;

    return (
      posA.x - halfWidthA < posB.x + halfWidthB &&
      posA.x + halfWidthA > posB.x - halfWidthB &&
      posA.y - halfHeightA < posB.y + halfHeightB &&
      posA.y + halfHeightA > posB.y - halfHeightB
    );
  }

  /**
   * Circle vs AABB collision
   */
  private circleVsAabb(
    circlePos: { x: number; y: number },
    radius: number,
    rectPos: { x: number; y: number },
    width: number,
    height: number
  ): boolean {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Find closest point on rectangle to circle center
    const closestX = Math.max(
      rectPos.x - halfWidth,
      Math.min(circlePos.x, rectPos.x + halfWidth)
    );
    const closestY = Math.max(
      rectPos.y - halfHeight,
      Math.min(circlePos.y, rectPos.y + halfHeight)
    );

    // Check distance
    const dx = circlePos.x - closestX;
    const dy = circlePos.y - closestY;
    return dx * dx + dy * dy < radius * radius;
  }

  /**
   * Handle collision between two entities
   */
  private handleCollision(entityA: Entity, entityB: Entity): void {
    const transformA = entityA.getComponent(TransformComponent)!;
    const colliderA = entityA.getComponent(ColliderComponent)!;
    const transformB = entityB.getComponent(TransformComponent)!;
    const colliderB = entityB.getComponent(ColliderComponent)!;

    // Emit collision event
    const collisionData: CollisionEvent = {
      entityA: entityA.id,
      entityB: entityB.id,
      position: {
        x: (transformA.position.x + transformB.position.x) / 2,
        y: (transformA.position.y + transformB.position.y) / 2,
      },
    };

    this.eventBus.emit(GameEventType.COLLISION, collisionData);

    // Resolve collision (separate entities) if not triggers
    if (!colliderA.isTrigger && !colliderB.isTrigger) {
      this.resolveCollision(entityA, entityB);
    }
  }

  /**
   * Resolve collision by separating entities
   */
  private resolveCollision(entityA: Entity, entityB: Entity): void {
    const transformA = entityA.getComponent(TransformComponent)!;
    const colliderA = entityA.getComponent(ColliderComponent)!;
    const transformB = entityB.getComponent(TransformComponent)!;
    const colliderB = entityB.getComponent(ColliderComponent)!;

    // Don't move static objects
    if (colliderA.isStatic && colliderB.isStatic) return;

    const Vector2D = require('@core/utils').Vector2D;

    // Calculate separation vector
    const delta = transformB.position.subtract(transformA.position);
    const distance = delta.length();

    if (distance === 0) return; // Perfectly overlapping, can't resolve

    // Calculate overlap
    const overlap =
      (colliderA.radius + colliderB.radius) - distance;

    if (overlap <= 0) return;

    // Separation direction
    const separation = delta.normalize().multiply(overlap);

    // Move entities apart
    if (!colliderA.isStatic && !colliderB.isStatic) {
      // Both move
      transformA.translate(separation.multiply(-0.5));
      transformB.translate(separation.multiply(0.5));
    } else if (colliderA.isStatic) {
      // Only B moves
      transformB.translate(separation);
    } else {
      // Only A moves
      transformA.translate(separation.multiply(-1));
    }
  }
}
