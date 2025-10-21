import { BaseComponent } from '@core/ecs';
import { Vector2D } from '@core/utils';

/**
 * MovementComponent - Velocity and movement properties
 */
export class MovementComponent extends BaseComponent {
  static readonly TYPE = 'Movement';
  readonly type = MovementComponent.TYPE;

  public velocity: Vector2D;
  public speed: number; // pixels per second
  public maxSpeed: number;
  public acceleration: number;
  public friction: number;

  constructor(
    speed: number = 100,
    maxSpeed?: number,
    acceleration: number = 1000,
    friction: number = 0.9
  ) {
    super();
    this.velocity = Vector2D.zero();
    this.speed = speed;
    this.maxSpeed = maxSpeed ?? speed;
    this.acceleration = acceleration;
    this.friction = friction;
  }

  /**
   * Set velocity directly
   */
  setVelocity(velocity: Vector2D): this {
    this.velocity = velocity.limit(this.maxSpeed);
    return this;
  }

  /**
   * Add to velocity
   */
  addVelocity(delta: Vector2D): this {
    this.velocity = this.velocity.add(delta).limit(this.maxSpeed);
    return this;
  }

  /**
   * Apply friction (reduce velocity)
   */
  applyFriction(deltaTime: number): this {
    const frictionAmount = Math.pow(this.friction, deltaTime);
    this.velocity = this.velocity.multiply(frictionAmount);

    // Stop if very slow
    if (this.velocity.lengthSquared() < 0.01) {
      this.velocity = Vector2D.zero();
    }

    return this;
  }

  /**
   * Move in a direction
   */
  moveInDirection(direction: Vector2D, deltaTime: number): this {
    const acceleration = direction.normalize().multiply(this.acceleration * deltaTime);
    this.addVelocity(acceleration);
    return this;
  }

  /**
   * Stop immediately
   */
  stop(): this {
    this.velocity = Vector2D.zero();
    return this;
  }

  /**
   * Check if moving
   */
  isMoving(): boolean {
    return !this.velocity.isZero();
  }

  /**
   * Get current speed (magnitude of velocity)
   */
  getCurrentSpeed(): number {
    return this.velocity.length();
  }

  clone(): this {
    const cloned = new MovementComponent(
      this.speed,
      this.maxSpeed,
      this.acceleration,
      this.friction
    );
    cloned.velocity = this.velocity.clone();
    return cloned as this;
  }
}
