import { BaseComponent } from '@core/ecs';

/**
 * SpriteComponent - Visual representation
 * Holds sprite rendering data (to be used by PixiJS renderer)
 */
export class SpriteComponent extends BaseComponent {
  static readonly TYPE = 'Sprite';
  readonly type = SpriteComponent.TYPE;

  public textureName: string;
  public tint: number; // hex color (e.g., 0xFFFFFF)
  public alpha: number; // 0-1
  public visible: boolean;
  public width: number;
  public height: number;
  public anchorX: number; // 0-1
  public anchorY: number; // 0-1
  public zIndex: number; // render order

  constructor(
    textureName: string = 'default',
    tint: number = 0xffffff,
    width: number = 32,
    height: number = 32
  ) {
    super();
    this.textureName = textureName;
    this.tint = tint;
    this.alpha = 1;
    this.visible = true;
    this.width = width;
    this.height = height;
    this.anchorX = 0.5;
    this.anchorY = 0.5;
    this.zIndex = 0;
  }

  /**
   * Set tint color
   */
  setTint(color: number): this {
    this.tint = color;
    return this;
  }

  /**
   * Set alpha/opacity
   */
  setAlpha(alpha: number): this {
    this.alpha = Math.max(0, Math.min(1, alpha));
    return this;
  }

  /**
   * Set visibility
   */
  setVisible(visible: boolean): this {
    this.visible = visible;
    return this;
  }

  /**
   * Set size
   */
  setSize(width: number, height: number): this {
    this.width = width;
    this.height = height;
    return this;
  }

  /**
   * Set anchor point (pivot)
   */
  setAnchor(x: number, y: number): this {
    this.anchorX = x;
    this.anchorY = y;
    return this;
  }

  /**
   * Change texture
   */
  setTexture(textureName: string): this {
    this.textureName = textureName;
    return this;
  }

  clone(): this {
    const cloned = new SpriteComponent(
      this.textureName,
      this.tint,
      this.width,
      this.height
    );
    cloned.alpha = this.alpha;
    cloned.visible = this.visible;
    cloned.anchorX = this.anchorX;
    cloned.anchorY = this.anchorY;
    cloned.zIndex = this.zIndex;
    return cloned as this;
  }
}
