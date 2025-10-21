/**
 * Color Palette - Centralized color definitions
 * All game colors in one place for easy theming
 */

export const GameColors = {
  // Player colors
  player: 0x4ecca3,
  playerDark: 0x45b393,
  playerLight: 0x5efdb7,

  // Enemy colors
  enemySlime: 0x8b5cf6,
  enemyGoblin: 0xef4444,
  enemySkeleton: 0xf3f4f6,
  enemyDemon: 0x991b1b,

  // UI colors
  healthBar: 0xe94560,
  healthBarBg: 0x333333,
  expBar: 0x4ecca3,
  expBarBg: 0x333333,

  // Effect colors
  attackArc: 0xe94560,
  damageNumber: 0xff6b6b,
  healNumber: 0x4ecca3,
  shadow: 0x000000,

  // Dungeon colors
  wallColor: 0x2d3748,
  wallBorder: 0x1a202c,
  floorDark: 0x4a5568,
  floorLight: 0x3d4653,

  // UI theme
  uiPrimary: 0xe94560,
  uiSecondary: 0x4ecca3,
  uiBackground: 0x16213e,
  uiBorder: 0x0f3460,
  uiText: 0xffffff,
  uiTextDark: 0xaaaaaa,

  // State colors (for debugging)
  stateIdle: 0x808080,
  stateWalking: 0x4ecca3,
  stateAttacking: 0xe94560,
  stateDamaged: 0xff6b6b,
  stateDead: 0x4a4a4a
} as const;

/**
 * Color utility functions
 */
export const ColorUtils = {
  /**
   * Convert hex color to RGB components
   */
  hexToRgb(hex: number): { r: number; g: number; b: number } {
    return {
      r: (hex >> 16) & 0xff,
      g: (hex >> 8) & 0xff,
      b: hex & 0xff
    };
  },

  /**
   * Convert RGB to hex
   */
  rgbToHex(r: number, g: number, b: number): number {
    return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
  },

  /**
   * Lighten a color by percentage
   */
  lighten(color: number, percent: number): number {
    const { r, g, b } = this.hexToRgb(color);
    const factor = 1 + percent / 100;

    return this.rgbToHex(
      Math.min(255, Math.floor(r * factor)),
      Math.min(255, Math.floor(g * factor)),
      Math.min(255, Math.floor(b * factor))
    );
  },

  /**
   * Darken a color by percentage
   */
  darken(color: number, percent: number): number {
    const { r, g, b } = this.hexToRgb(color);
    const factor = 1 - percent / 100;

    return this.rgbToHex(
      Math.floor(r * factor),
      Math.floor(g * factor),
      Math.floor(b * factor)
    );
  },

  /**
   * Interpolate between two colors
   */
  lerp(from: number, to: number, t: number): number {
    const fromRgb = this.hexToRgb(from);
    const toRgb = this.hexToRgb(to);

    return this.rgbToHex(
      Math.floor(fromRgb.r + (toRgb.r - fromRgb.r) * t),
      Math.floor(fromRgb.g + (toRgb.g - fromRgb.g) * t),
      Math.floor(fromRgb.b + (toRgb.b - fromRgb.b) * t)
    );
  }
};
