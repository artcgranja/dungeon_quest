import Phaser from 'phaser';
import { GameScene } from '../../rendering/scenes/GameScene';

export class GameManager {
  private game: Phaser.Game | null = null;

  init(parent: string | HTMLElement) {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: parent,
      backgroundColor: '#0f3460',
      scene: [GameScene],
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
      render: {
        pixelArt: true,
        antialias: false
      }
    };

    this.game = new Phaser.Game(config);
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  getGame(): Phaser.Game | null {
    return this.game;
  }
}

// Export singleton instance
export const gameManager = new GameManager();
