import { BaseComponent } from '@core/ecs';
import { Vector2D } from '@core/utils';

/**
 * TransformComponent - Position, rotation, and scale
 * Every visible entity should have this component
 */
export class TransformComponent extends BaseComponent {
  static readonly TYPE = 'Transform';
  readonly type = TransformComponent.TYPE;

  public position: Vector2D;
  public rotation: number; // radians
  public scale: Vector2D;

  constructor(
    position: Vector2D = Vector2D.zero(),
    rotation: number = 0,
    scale: Vector2D = Vector2D.one()
  ) {
    super();
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number): this {
    this.position = new Vector2D(x, y);
    return this;
  }

  /**
   * Translate by offset
   */
  translate(offset: Vector2D): this {
    this.position = this.position.add(offset);
    return this;
  }

  /**
   * Rotate by angle (radians)
   */
  rotate(angle: number): this {
    this.rotation += angle;
    return this;
  }

  /**
   * Set rotation to face a direction
   */
  lookAt(target: Vector2D): this {
    this.rotation = this.position.angleTo(target);
    return this;
  }

  /**
   * Get direction vector from rotation
   */
  getDirection(): Vector2D {
    return new Vector2D(Math.cos(this.rotation), Math.sin(this.rotation));
  }

  clone(): this {
    return new TransformComponent(
      this.position.clone(),
      this.rotation,
      this.scale.clone()
    ) as this;
  }
}
