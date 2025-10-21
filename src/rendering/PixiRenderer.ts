import { Application, Graphics, Sprite, Texture, Container } from 'pixi.js';
import type { Entity } from '@core/ecs';
import { TransformComponent, SpriteComponent } from '@game/components';

/**
 * PixiRenderer - manages PixiJS rendering
 * Renders entities with Sprite and Transform components
 */
export class PixiRenderer {
  private app: Application;
  private stage: Container;
  private spriteMap: Map<string, Sprite>;
  private textureCache: Map<string, Texture>;
  private initialized: boolean;

  constructor() {
    this.app = new Application();
    this.spriteMap = new Map();
    this.textureCache = new Map();
    this.initialized = false;
    this.stage = new Container();
  }

  /**
   * Initialize the renderer
   */
  async init(container: HTMLElement, width: number = 800, height: number = 600): Promise<void> {
    // Initialize PIXI app
    await this.app.init({
      width,
      height,
      background: '#0f3460',
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Add canvas to container
    container.appendChild(this.app.canvas as HTMLCanvasElement);

    // Add main stage
    this.app.stage.addChild(this.stage);

    // Create procedural textures
    this.createProceduralTextures();

    this.initialized = true;
  }

  /**
   * Create procedural textures
   */
  private createProceduralTextures(): void {
    // Player
    this.textureCache.set('player', this.createCircleTexture(16, 0x4ecca3));

    // Enemies
    this.textureCache.set('slime', this.createCircleTexture(14, 0x8b5cf6));
    this.textureCache.set('goblin', this.createCircleTexture(14, 0xef4444));
    this.textureCache.set('skeleton', this.createCircleTexture(14, 0xf3f4f6));
    this.textureCache.set('demon', this.createCircleTexture(16, 0x991b1b));

    // Tiles
    this.textureCache.set('wall', this.createRectTexture(40, 40, 0x2d3748));
    this.textureCache.set('floor', this.createRectTexture(40, 40, 0x4a5568));
    this.textureCache.set('default', this.createRectTexture(32, 32, 0xffffff));
  }

  /**
   * Create circle texture
   */
  private createCircleTexture(radius: number, color: number): Texture {
    const graphics = new Graphics();
    graphics.beginFill(color);
    graphics.drawCircle(radius, radius, radius);
    graphics.endFill();

    const texture = this.app.renderer.generateTexture(graphics);
    graphics.destroy();
    return texture;
  }

  /**
   * Create rectangle texture
   */
  private createRectTexture(width: number, height: number, color: number): Texture {
    const graphics = new Graphics();
    graphics.beginFill(color);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();

    const texture = this.app.renderer.generateTexture(graphics);
    graphics.destroy();
    return texture;
  }

  /**
   * Render entities
   */
  render(entities: readonly Entity[]): void {
    if (!this.initialized) return;

    const activeEntityIds = new Set<string>();

    for (const entity of entities) {
      if (!entity.isActive()) continue;

      const transform = entity.getComponent(TransformComponent);
      const spriteComp = entity.getComponent(SpriteComponent);

      if (!transform || !spriteComp || !spriteComp.visible) continue;

      activeEntityIds.add(entity.id);

      let sprite = this.spriteMap.get(entity.id);

      if (!sprite) {
        sprite = this.createSprite(entity);
        this.spriteMap.set(entity.id, sprite);
        this.stage.addChild(sprite);
      }

      this.updateSprite(sprite, transform, spriteComp);
    }

    // Remove inactive sprites
    for (const [entityId, sprite] of this.spriteMap) {
      if (!activeEntityIds.has(entityId)) {
        this.stage.removeChild(sprite);
        sprite.destroy();
        this.spriteMap.delete(entityId);
      }
    }
  }

  /**
   * Create sprite for entity
   */
  private createSprite(entity: Entity): Sprite {
    const spriteComp = entity.getComponent(SpriteComponent)!;
    const texture = this.getTexture(spriteComp.textureName);
    const sprite = new Sprite(texture);
    sprite.anchor.set(spriteComp.anchorX, spriteComp.anchorY);
    return sprite;
  }

  /**
   * Update sprite from components
   */
  private updateSprite(
    sprite: Sprite,
    transform: TransformComponent,
    spriteComp: SpriteComponent
  ): void {
    sprite.position.set(transform.position.x, transform.position.y);
    sprite.rotation = transform.rotation;
    sprite.scale.set(transform.scale.x, transform.scale.y);
    sprite.tint = spriteComp.tint;
    sprite.alpha = spriteComp.alpha;
    sprite.visible = spriteComp.visible;
    sprite.zIndex = spriteComp.zIndex;

    // Update texture if changed
    const newTexture = this.getTexture(spriteComp.textureName);
    if (sprite.texture !== newTexture) {
      sprite.texture = newTexture;
    }
  }

  /**
   * Get texture by name
   */
  private getTexture(name: string): Texture {
    return this.textureCache.get(name) ?? this.textureCache.get('default')!;
  }

  /**
   * Get app
   */
  getApp(): Application {
    return this.app;
  }

  /**
   * Get stage
   */
  getStage(): Container {
    return this.stage;
  }

  /**
   * Resize
   */
  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
  }

  /**
   * Destroy
   */
  destroy(): void {
    for (const sprite of this.spriteMap.values()) {
      sprite.destroy();
    }
    this.spriteMap.clear();

    for (const texture of this.textureCache.values()) {
      texture.destroy();
    }
    this.textureCache.clear();

    this.app.destroy(true);
  }
}
