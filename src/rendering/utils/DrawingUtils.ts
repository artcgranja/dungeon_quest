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
   * Draw sword with swing effect
   * Progress: 0 = start of swing, 1 = end of swing
   */
  static drawSwordSwing(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    direction: 'up' | 'down' | 'left' | 'right',
    progress: number,
    attackRange: number
  ): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Calculate swing parameters
    const swingStart = -60; // degrees
    const swingEnd = 60; // degrees
    const currentAngle = swingStart + ((swingEnd - swingStart) * progress);

    // Sword dimensions
    const swordLength = attackRange * 0.8;
    const swordWidth = 6;
    const handleLength = 12;

    // Base rotation for each direction
    let baseRotation = 0;
    let offsetX = 0;
    let offsetY = 0;

    switch (direction) {
      case 'down':
        baseRotation = 90;
        offsetY = height / 2;
        break;
      case 'up':
        baseRotation = -90;
        offsetY = -height / 2;
        break;
      case 'left':
        baseRotation = 180;
        offsetX = -width / 2;
        break;
      case 'right':
        baseRotation = 0;
        offsetX = width / 2;
        break;
    }

    const totalRotation = (baseRotation + currentAngle) * (Math.PI / 180);

    // Draw swing trail effect (3 trailing arcs)
    for (let i = 0; i < 3; i++) {
      const trailProgress = Math.max(0, progress - (i * 0.15));
      if (trailProgress > 0) {
        const trailAngle = swingStart + ((swingEnd - swingStart) * trailProgress);
        const trailRotation = (baseRotation + trailAngle) * (Math.PI / 180);
        const trailAlpha = 0.2 * (1 - i * 0.3);

        // Calculate trail arc endpoint
        const trailEndX = centerX + offsetX + Math.cos(trailRotation) * swordLength;
        const trailEndY = centerY + offsetY + Math.sin(trailRotation) * swordLength;

        graphics.lineStyle(8 - i * 2, 0xFFD700, trailAlpha);
        graphics.lineBetween(centerX + offsetX, centerY + offsetY, trailEndX, trailEndY);
      }
    }

    // Calculate sword position
    const swordEndX = centerX + offsetX + Math.cos(totalRotation) * swordLength;
    const swordEndY = centerY + offsetY + Math.sin(totalRotation) * swordLength;
    const handleEndX = centerX + offsetX - Math.cos(totalRotation) * handleLength;
    const handleEndY = centerY + offsetY - Math.sin(totalRotation) * handleLength;

    // Calculate perpendicular offset for sword width
    const perpX = Math.cos(totalRotation + Math.PI / 2) * swordWidth / 2;
    const perpY = Math.sin(totalRotation + Math.PI / 2) * swordWidth / 2;

    // Draw sword blade (main body)
    graphics.fillStyle(0xE8E8E8); // Light silver
    graphics.beginPath();
    graphics.moveTo(centerX + offsetX - perpX, centerY + offsetY - perpY);
    graphics.lineTo(swordEndX - perpX * 0.5, swordEndY - perpY * 0.5);
    graphics.lineTo(swordEndX + perpX * 0.5, swordEndY + perpY * 0.5);
    graphics.lineTo(centerX + offsetX + perpX, centerY + offsetY + perpY);
    graphics.closePath();
    graphics.fillPath();

    // Draw blade edge highlight
    graphics.lineStyle(1.5, 0xFFFFFF, 0.8);
    graphics.lineBetween(
      centerX + offsetX - perpX * 0.5,
      centerY + offsetY - perpY * 0.5,
      swordEndX - perpX * 0.25,
      swordEndY - perpY * 0.25
    );

    // Draw blade outline
    graphics.lineStyle(1, 0x888888);
    graphics.beginPath();
    graphics.moveTo(centerX + offsetX - perpX, centerY + offsetY - perpY);
    graphics.lineTo(swordEndX - perpX * 0.5, swordEndY - perpY * 0.5);
    graphics.lineTo(swordEndX + perpX * 0.5, swordEndY + perpY * 0.5);
    graphics.lineTo(centerX + offsetX + perpX, centerY + offsetY + perpY);
    graphics.closePath();
    graphics.strokePath();

    // Draw crossguard
    const guardPerpX = Math.cos(totalRotation + Math.PI / 2) * 10;
    const guardPerpY = Math.sin(totalRotation + Math.PI / 2) * 10;

    graphics.fillStyle(0x8B4513); // Brown
    graphics.fillRect(
      centerX + offsetX + guardPerpX - 2,
      centerY + offsetY + guardPerpY - 2,
      4,
      4
    );
    graphics.fillRect(
      centerX + offsetX - guardPerpX - 2,
      centerY + offsetY - guardPerpY - 2,
      4,
      4
    );

    // Draw handle
    graphics.lineStyle(4, 0x654321);
    graphics.lineBetween(
      centerX + offsetX,
      centerY + offsetY,
      handleEndX,
      handleEndY
    );

    // Draw pommel
    graphics.fillStyle(0xCD7F32); // Bronze
    graphics.fillCircle(handleEndX, handleEndY, 3);

    // Draw energy glow effect at peak of swing (middle of animation)
    if (progress > 0.35 && progress < 0.65) {
      const glowIntensity = Math.sin((progress - 0.35) * Math.PI / 0.3);
      const glowRadius = 15 * glowIntensity;

      graphics.fillStyle(0xFFD700, 0.3 * glowIntensity);
      graphics.fillCircle(swordEndX, swordEndY, glowRadius);

      graphics.fillStyle(0xFFA500, 0.2 * glowIntensity);
      graphics.fillCircle(swordEndX, swordEndY, glowRadius * 1.5);
    }

    // Draw swing arc to show hitbox area
    graphics.lineStyle(2, 0xFF6B6B, 0.3);
    graphics.beginPath();
    const arcStartAngle = (baseRotation + swingStart) * (Math.PI / 180);
    const arcEndAngle = (baseRotation + currentAngle) * (Math.PI / 180);
    graphics.arc(
      centerX + offsetX,
      centerY + offsetY,
      attackRange,
      arcStartAngle,
      arcEndAngle,
      false
    );
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
