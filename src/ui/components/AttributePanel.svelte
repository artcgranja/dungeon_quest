<script lang="ts">
  let { strength, defense, speed, kills } = $props<{
    strength: number;
    defense: number;
    speed: number;
    kills: number;
  }>();
</script>

<div class="stat-panel">
  <h3>Attributes</h3>

  <div class="stat">
    <span class="stat-label">Strength:</span>
    <span class="stat-value">{strength}</span>
  </div>

  <div class="stat">
    <span class="stat-label">Defense:</span>
    <span class="stat-value">{defense}</span>
  </div>

  <div class="stat">
    <span class="stat-label">Speed:</span>
    <span class="stat-value">{speed}</span>
  </div>

  <div class="stat">
    <span class="stat-label">Monsters Killed:</span>
    <span class="stat-value">{kills}</span>
  </div>
</div>

<style>
  .stat-panel {
    background: #16213e;
    padding: 15px 25px;
    border-radius: 8px;
    border: 2px solid #0f3460;
    min-width: 200px;
  }

  .stat-panel h3 {
    color: #e94560;
    margin-bottom: 10px;
    font-size: 18px;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    font-size: 14px;
  }

  .stat-label {
    color: #aaa;
  }

  .stat-value {
    color: #4ecca3;
    font-weight: bold;
  }
</style>
