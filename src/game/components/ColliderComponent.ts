import { BaseComponent } from '@core/ecs';

/**
 * Collider shape types
 */
export enum ColliderShape {
  CIRCLE = 'circle',
  RECTANGLE = 'rectangle',
}

/**
 * Collision layer flags (can be combined with bitwise OR)
 */
export enum CollisionLayer {
  NONE = 0,
  PLAYER = 1 << 0, // 1
  ENEMY = 1 << 1, // 2
  PROJECTILE = 1 << 2, // 4
  WALL = 1 << 3, // 8
  ITEM = 1 << 4, // 16
  ALL = 0xffffffff,
}

/**
 * ColliderComponent - Collision detection
 */
export class ColliderComponent extends BaseComponent {
  static readonly TYPE = 'Collider';
  readonly type = ColliderComponent.TYPE;

  public shape: ColliderShape;
  public radius: number; // for circle
  public width: number; // for rectangle
  public height: number; // for rectangle
  public offsetX: number; // offset from entity position
  public offsetY: number;
  public layer: CollisionLayer; // what layer this collider is on
  public mask: CollisionLayer; // what layers this collider can collide with
  public isTrigger: boolean; // if true, doesn't block movement but triggers events
  public isStatic: boolean; // if true, doesn't move (optimization)

  constructor(
    shape: ColliderShape = ColliderShape.CIRCLE,
    size: number = 16
  ) {
    super();
    this.shape = shape;

    if (shape === ColliderShape.CIRCLE) {
      this.radius = size;
      this.width = size * 2;
      this.height = size * 2;
    } else {
      this.radius = size / 2;
      this.width = size;
      this.height = size;
    }

    this.offsetX = 0;
    this.offsetY = 0;
    this.layer = CollisionLayer.NONE;
    this.mask = CollisionLayer.ALL;
    this.isTrigger = false;
    this.isStatic = false;
  }

  /**
   * Create a circle collider
   */
  static circle(radius: number): ColliderComponent {
    return new ColliderComponent(ColliderShape.CIRCLE, radius);
  }

  /**
   * Create a rectangle collider
   */
  static rectangle(width: number, height: number): ColliderComponent {
    const collider = new ColliderComponent(ColliderShape.RECTANGLE, width);
    collider.width = width;
    collider.height = height;
    collider.radius = Math.sqrt(width * width + height * height) / 2;
    return collider;
  }

  /**
   * Set collision layer
   */
  setLayer(layer: CollisionLayer): this {
    this.layer = layer;
    return this;
  }

  /**
   * Set collision mask (what can this collide with)
   */
  setMask(mask: CollisionLayer): this {
    this.mask = mask;
    return this;
  }

  /**
   * Check if can collide with a layer
   */
  canCollideWith(layer: CollisionLayer): boolean {
    return (this.mask & layer) !== 0;
  }

  /**
   * Set as trigger (no physical collision, only events)
   */
  setTrigger(isTrigger: boolean): this {
    this.isTrigger = isTrigger;
    return this;
  }

  /**
   * Set as static (doesn't move)
   */
  setStatic(isStatic: boolean): this {
    this.isStatic = isStatic;
    return this;
  }

  /**
   * Set offset from entity position
   */
  setOffset(x: number, y: number): this {
    this.offsetX = x;
    this.offsetY = y;
    return this;
  }

  clone(): this {
    const cloned = new ColliderComponent(this.shape, this.radius);
    cloned.width = this.width;
    cloned.height = this.height;
    cloned.offsetX = this.offsetX;
    cloned.offsetY = this.offsetY;
    cloned.layer = this.layer;
    cloned.mask = this.mask;
    cloned.isTrigger = this.isTrigger;
    cloned.isStatic = this.isStatic;
    return cloned as this;
  }
}
