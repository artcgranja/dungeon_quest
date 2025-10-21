<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import PlayerStats from './components/PlayerStats.svelte';
  import AttributePanel from './components/AttributePanel.svelte';
  import Controls from './components/Controls.svelte';
  import { gameStore } from './stores/gameStore';
  import { gameManager } from '../game/managers/GameManager';

  let gameContainer: HTMLDivElement;

  onMount(() => {
    // Initialize Phaser game
    if (gameContainer) {
      gameManager.init(gameContainer);
    }
  });

  onDestroy(() => {
    // Cleanup game on component destroy
    gameManager.destroy();
  });
</script>

<div class="game-container">
  <h1 class="game-title">DUNGEON QUEST</h1>

  <div id="phaser-game" bind:this={gameContainer}></div>

  <div class="ui-panels">
    <PlayerStats
      level={$gameStore.level}
      health={$gameStore.health}
      maxHealth={$gameStore.maxHealth}
      exp={$gameStore.exp}
      expToNext={$gameStore.expToNext}
    />

    <AttributePanel
      strength={$gameStore.strength}
      defense={$gameStore.defense}
      speed={$gameStore.speed}
      kills={$gameStore.kills}
    />
  </div>

  <Controls />
</div>

<style>
  .game-container {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .game-title {
    font-size: 32px;
    color: #e94560;
    margin-bottom: 15px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  #phaser-game {
    display: flex;
    justify-content: center;
  }

  .ui-panels {
    display: flex;
    gap: 30px;
    justify-content: center;
    flex-wrap: wrap;
  }

  @media (max-width: 900px) {
    .ui-panels {
      flex-direction: column;
      gap: 15px;
    }
  }
</style>
