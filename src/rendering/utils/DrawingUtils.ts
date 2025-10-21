/**
 * Drawing Utilities - Helper functions for rendering
 * Centralized drawing functions to avoid code duplication
 */

import { GameColors } from './ColorPalette';

export class DrawingUtils {
  /**
   * Draw entity shadow
   */
  static drawShadow(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    graphics.fillStyle(GameColors.shadow, 0.3);
    graphics.fillEllipse(x + width / 2, y + height + 5, width / 2, 5);
  }

  /**
   * Draw health bar above entity
   */
  static drawHealthBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    currentHealth: number,
    maxHealth: number
  ): void {
    const healthBarHeight = 4;
    const healthPercent = currentHealth / maxHealth;

    // Background
    graphics.fillStyle(GameColors.healthBarBg);
    graphics.fillRect(x, y - 10, width, healthBarHeight);

    // Health fill
    graphics.fillStyle(GameColors.healthBar);
    graphics.fillRect(x, y - 10, width * healthPercent, healthBarHeight);
  }

  /**
   * Draw direction indicator for entity
   */
  static drawDirectionIndicator(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    direction: 'up' | 'down' | 'left' | 'right',
    color: number
  ): void {
    graphics.fillStyle(color);

    const indicatorWidth = width * 0.47;
    const indicatorHeight = height * 0.33;
    const offsetX = (width - indicatorWidth) / 2;
    const offsetY = (height - indicatorHeight) / 2;

    switch (direction) {
      case 'up':
        graphics.fillRect(x + offsetX, y, indicatorWidth, indicatorHeight);
        break;
      case 'down':
        graphics.fillRect(x + offsetX, y + height - indicatorHeight, indicatorWidth, indicatorHeight);
        break;
      case 'left':
        graphics.fillRect(x, y + offsetY, indicatorHeight, indicatorWidth);
        break;
      case 'right':
        graphics.fillRect(x + width - indicatorHeight, y + offsetY, indicatorHeight, indicatorWidth);
        break;
    }
  }

  /**
   * Draw attack arc animation
   */
  static drawAttackArc(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    direction: 'up' | 'down' | 'left' | 'right',
    attackRange: number
  ): void {
    graphics.lineStyle(3, GameColors.attackArc);

    const attackOffset = 35;

    switch (direction) {
      case 'up':
        graphics.arc(
          x + width / 2,
          y - attackOffset,
          attackRange / 2,
          Math.PI,
          0,
          true
        );
        break;
      case 'down':
        graphics.arc(
          x + width / 2,
          y + height + attackOffset,
          attackRange / 2,
          0,
          Math.PI,
          true
        );
        break;
      case 'left':
        graphics.arc(
          x - attackOffset,
          y + height / 2,
          attackRange / 2,
          -Math.PI / 2,
          Math.PI / 2,
          true
        );
        break;
      case 'right':
        graphics.arc(
          x + width + attackOffset,
          y + height / 2,
          attackRange / 2,
          Math.PI / 2,
          -Math.PI / 2,
          true
        );
        break;
    }

    graphics.strokePath();
  }

  /**
   * Draw simple rectangle entity
   */
  static drawRectEntity(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ): void {
    graphics.fillStyle(color);
    graphics.fillRect(x, y, width, height);
  }

  /**
   * Draw entity eyes (for enemies)
   */
  static drawEyes(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number
  ): void {
    graphics.fillStyle(0xffffff);
    graphics.fillRect(x + 5, y + 8, 5, 5);
    graphics.fillRect(x + 15, y + 8, 5, 5);
  }

  /**
   * Draw circle (for future use - particles, etc)
   */
  static drawCircle(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
    color: number,
    alpha: number = 1
  ): void {
    graphics.fillStyle(color, alpha);
    graphics.fillCircle(x, y, radius);
  }

  /**
   * Draw line (for debug, connections, etc)
   */
  static drawLine(
    graphics: Phaser.GameObjects.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number,
    width: number = 2
  ): void {
    graphics.lineStyle(width, color);
    graphics.beginPath();
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.strokePath();
  }
}
