<script lang="ts">
  let { level, health, maxHealth, exp, expToNext } = $props<{
    level: number;
    health: number;
    maxHealth: number;
    exp: number;
    expToNext: number;
  }>();

  let healthPercent = $derived((health / maxHealth) * 100);
  let expPercent = $derived((exp / expToNext) * 100);
</script>

<div class="stat-panel">
  <h3>Player Stats</h3>

  <div class="stat">
    <span class="stat-label">Level:</span>
    <span class="stat-value">{level}</span>
  </div>

  <div class="stat">
    <span class="stat-label">Health:</span>
    <span class="stat-value">{health}/{maxHealth}</span>
  </div>

  <div class="health-bar">
    <div class="health-fill" style="width: {healthPercent}%"></div>
  </div>

  <div class="stat">
    <span class="stat-label">Experience:</span>
    <span class="stat-value">{exp}/{expToNext}</span>
  </div>

  <div class="exp-bar">
    <div class="exp-fill" style="width: {expPercent}%"></div>
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

  .health-bar {
    width: 100%;
    height: 20px;
    background: #333;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 8px;
  }

  .health-fill {
    height: 100%;
    background: linear-gradient(90deg, #e94560, #ff6b9d);
    transition: width 0.3s;
  }

  .exp-bar {
    width: 100%;
    height: 15px;
    background: #333;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 5px;
  }

  .exp-fill {
    height: 100%;
    background: linear-gradient(90deg, #4ecca3, #45b393);
    transition: width 0.3s;
  }
</style>
