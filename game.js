// Game Configuration
const config = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 600,
    tileSize: 40,
    fps: 60
};

// Game State
const gameState = {
    keys: {},
    lastAttackTime: 0,
    attackCooldown: 500,
    levelUpPoints: 0,
    monstersKilled: 0,
    currentFloor: 1,
    enemiesKilledThisFloor: 0,
    enemiesToClearFloor: 10,
    isPaused: false
};

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 3;
        this.direction = 'down';

        // Stats
        this.level = 1;
        this.maxHealth = 100;
        this.health = 100;
        this.strength = 10;
        this.defense = 5;
        this.experience = 0;
        this.experienceToNextLevel = 100;

        // Combat
        this.attackRange = 70; // Increased attack range
        this.isAttacking = false;
        this.attackAnimationTime = 0;
        this.attackAngle = 0;
    }

    move(dx, dy) {
        const newX = this.x + dx * this.speed;
        const newY = this.y + dy * this.speed;

        // Check collision with walls
        if (!dungeon.isWall(newX, this.y, this.width, this.height)) {
            this.x = newX;
        }
        if (!dungeon.isWall(this.x, newY, this.width, this.height)) {
            this.y = newY;
        }

        // Update direction
        if (dx > 0) this.direction = 'right';
        else if (dx < 0) this.direction = 'left';
        else if (dy > 0) this.direction = 'down';
        else if (dy < 0) this.direction = 'up';

        // Keep player in bounds
        this.x = Math.max(0, Math.min(config.width - this.width, this.x));
        this.y = Math.max(0, Math.min(config.height - this.height, this.y));
    }

    attack() {
        const now = Date.now();
        if (now - gameState.lastAttackTime < gameState.attackCooldown) {
            return;
        }

        this.isAttacking = true;
        this.attackAnimationTime = 300;
        gameState.lastAttackTime = now;

        // Check if any enemy is in range
        enemies.forEach(enemy => {
            if (enemy.alive && this.isInAttackRange(enemy)) {
                const damage = this.strength + Math.floor(Math.random() * 5);
                enemy.takeDamage(damage);
            }
        });
    }

    isInAttackRange(enemy) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if enemy is in front of player based on direction
        const inRange = distance < this.attackRange;
        let inDirection = false;

        switch(this.direction) {
            case 'up': inDirection = dy < 0 && Math.abs(dx) < this.attackRange / 2; break;
            case 'down': inDirection = dy > 0 && Math.abs(dx) < this.attackRange / 2; break;
            case 'left': inDirection = dx < 0 && Math.abs(dy) < this.attackRange / 2; break;
            case 'right': inDirection = dx > 0 && Math.abs(dy) < this.attackRange / 2; break;
        }

        return inRange && inDirection;
    }

    takeDamage(amount) {
        const actualDamage = Math.max(1, amount - this.defense);
        this.health = Math.max(0, this.health - actualDamage);

        if (this.health === 0) {
            this.die();
        }

        this.updateUI();
    }

    gainExperience(amount) {
        this.experience += amount;

        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }

        this.updateUI();
    }

    levelUp() {
        this.level++;
        this.experience -= this.experienceToNextLevel;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);

        // Small automatic stat increases
        this.maxHealth += 10;
        this.health = this.maxHealth;

        // Pause game and show upgrade modal
        gameState.isPaused = true;
        this.showUpgradeModal();
        this.updateUI();
    }

    showUpgradeModal() {
        const modal = document.createElement('div');
        modal.className = 'level-up-modal';
        modal.id = 'upgradeModal';

        modal.innerHTML = `
            <div class="level-up-content">
                <h2>LEVEL UP! Level ${this.level}</h2>
                <p>Choose an attribute to upgrade:</p>
                <div class="upgrade-options">
                    <div class="upgrade-button" onclick="upgradeAttribute('health')">
                        <h3>Health</h3>
                        <div class="upgrade-value">+30</div>
                        <p>Max HP</p>
                    </div>
                    <div class="upgrade-button" onclick="upgradeAttribute('strength')">
                        <h3>Strength</h3>
                        <div class="upgrade-value">+5</div>
                        <p>Attack Damage</p>
                    </div>
                    <div class="upgrade-button" onclick="upgradeAttribute('defense')">
                        <h3>Defense</h3>
                        <div class="upgrade-value">+3</div>
                        <p>Damage Reduction</p>
                    </div>
                    <div class="upgrade-button" onclick="upgradeAttribute('speed')">
                        <h3>Speed</h3>
                        <div class="upgrade-value">+1</div>
                        <p>Movement Speed</p>
                    </div>
                    <div class="upgrade-button" onclick="upgradeAttribute('attackSpeed')">
                        <h3>Attack Speed</h3>
                        <div class="upgrade-value">-50ms</div>
                        <p>Cooldown</p>
                    </div>
                    <div class="upgrade-button" onclick="upgradeAttribute('attackRange')">
                        <h3>Attack Range</h3>
                        <div class="upgrade-value">+10</div>
                        <p>Reach</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showLevelUpMessage() {
        const message = document.createElement('div');
        message.className = 'level-up-message';
        message.textContent = `LEVEL UP! Now Level ${this.level}`;
        document.body.appendChild(message);

        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);
    }

    die() {
        // Save to leaderboard before game over
        saveToLeaderboard();

        // Show game over with stats
        const message = `Game Over!\n\nFinal Stats:\nLevel: ${this.level}\nFloor Reached: ${gameState.currentFloor}\nTotal Kills: ${gameState.monstersKilled}\n\nReloading...`;
        alert(message);
        location.reload();
    }

    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('health').textContent = `${this.health}/${this.maxHealth}`;
        document.getElementById('exp').textContent = `${this.experience}/${this.experienceToNextLevel}`;
        document.getElementById('strength').textContent = this.strength;
        document.getElementById('defense').textContent = this.defense;
        document.getElementById('speed').textContent = this.speed.toFixed(1);
        document.getElementById('kills').textContent = gameState.monstersKilled;
        document.getElementById('attackRange').textContent = this.attackRange;

        // Update floor progress
        document.getElementById('currentFloor').textContent = gameState.currentFloor;
        document.getElementById('floorProgress').textContent =
            `${gameState.enemiesKilledThisFloor}/${gameState.enemiesToClearFloor}`;

        const healthPercent = (this.health / this.maxHealth) * 100;
        document.getElementById('healthBar').style.width = healthPercent + '%';

        const expPercent = (this.experience / this.experienceToNextLevel) * 100;
        document.getElementById('expBar').style.width = expPercent + '%';
    }

    draw(ctx) {
        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height + 5,
                    this.width / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw player body
        ctx.fillStyle = '#4ecca3';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw player face/direction indicator
        ctx.fillStyle = '#45b393';
        switch(this.direction) {
            case 'up':
                ctx.fillRect(this.x + 8, this.y, 14, 10);
                break;
            case 'down':
                ctx.fillRect(this.x + 8, this.y + 20, 14, 10);
                break;
            case 'left':
                ctx.fillRect(this.x, this.y + 8, 10, 14);
                break;
            case 'right':
                ctx.fillRect(this.x + 20, this.y + 8, 10, 14);
                break;
        }

        // Draw sword attack animation
        if (this.isAttacking && this.attackAnimationTime > 0) {
            const progress = 1 - (this.attackAnimationTime / 300);
            this.drawSword(ctx, progress);

            this.attackAnimationTime -= 16;
            if (this.attackAnimationTime <= 0) {
                this.isAttacking = false;
            }
        }
    }

    drawSword(ctx, progress) {
        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.translate(centerX, centerY);

        // Calculate sword angle based on direction and swing progress
        let baseAngle = 0;
        switch(this.direction) {
            case 'up': baseAngle = -Math.PI / 2; break;
            case 'down': baseAngle = Math.PI / 2; break;
            case 'left': baseAngle = Math.PI; break;
            case 'right': baseAngle = 0; break;
        }

        // Swing animation: start from -90 degrees, swing to +90 degrees
        const swingAngle = baseAngle + (progress * Math.PI) - Math.PI / 2;
        ctx.rotate(swingAngle);

        // Draw sword
        const swordLength = 35;
        const swordWidth = 6;

        // Sword blade
        ctx.fillStyle = '#c0c0c0'; // Silver blade
        ctx.fillRect(10, -swordWidth / 2, swordLength, swordWidth);

        // Sword tip
        ctx.beginPath();
        ctx.moveTo(10 + swordLength, -swordWidth / 2);
        ctx.lineTo(10 + swordLength + 8, 0);
        ctx.lineTo(10 + swordLength, swordWidth / 2);
        ctx.closePath();
        ctx.fill();

        // Sword handle
        ctx.fillStyle = '#8b4513'; // Brown handle
        ctx.fillRect(2, -swordWidth / 2 - 2, 12, swordWidth + 4);

        // Cross-guard
        ctx.fillStyle = '#ffd700'; // Gold cross-guard
        ctx.fillRect(10, -10, 4, 20);

        // Add blade shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(12, -swordWidth / 2 + 1, swordLength - 4, 2);

        ctx.restore();
    }

    updateAttackAnimation() {
        if (this.attackAnimationTime > 0) {
            this.attackAnimationTime -= 16;
            if (this.attackAnimationTime <= 0) {
                this.isAttacking = false;
            }
        }
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type = 'slime') {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.alive = true;

        // Enemy types with different stats
        this.types = {
            slime: { color: '#8b5cf6', health: 30, damage: 5, speed: 1, exp: 25 },
            goblin: { color: '#ef4444', health: 50, damage: 10, speed: 1.5, exp: 50 },
            skeleton: { color: '#f3f4f6', health: 70, damage: 15, speed: 1.2, exp: 75 },
            demon: { color: '#991b1b', health: 100, damage: 20, speed: 0.8, exp: 150 }
        };

        this.type = type;
        const stats = this.types[type];

        // Scale stats based on current floor
        const floorMultiplier = 1 + (gameState.currentFloor - 1) * 0.3;

        this.maxHealth = Math.floor(stats.health * floorMultiplier);
        this.health = this.maxHealth;
        this.damage = Math.floor(stats.damage * floorMultiplier * 1.5); // Increased damage multiplier
        this.speed = stats.speed + (gameState.currentFloor - 1) * 0.1;
        this.exp = Math.floor(stats.exp * (1 + (gameState.currentFloor - 1) * 0.2));
        this.color = stats.color;

        // AI
        this.aggroRange = 200;
        this.attackRange = 35;
        this.lastAttackTime = 0;
        this.attackCooldown = 1500;
    }

    update(player) {
        if (!this.alive) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Chase player if in aggro range
        if (distance < this.aggroRange) {
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;

            // Move towards player if not in attack range
            if (distance > this.attackRange) {
                const newX = this.x + moveX;
                const newY = this.y + moveY;

                if (!dungeon.isWall(newX, this.y, this.width, this.height)) {
                    this.x = newX;
                }
                if (!dungeon.isWall(this.x, newY, this.width, this.height)) {
                    this.y = newY;
                }
            } else {
                // Attack player
                this.attackPlayer(player);
            }
        }
    }

    attackPlayer(player) {
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackCooldown) {
            player.takeDamage(this.damage);
            this.lastAttackTime = now;
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.alive = false;
        player.gainExperience(this.exp);
        gameState.monstersKilled++;
        gameState.enemiesKilledThisFloor++;
        player.updateUI();

        // Check if floor is cleared
        if (gameState.enemiesKilledThisFloor >= gameState.enemiesToClearFloor) {
            advanceToNextFloor();
        } else {
            // Chance to spawn new enemy after kill
            if (Math.random() < 0.3 && enemies.filter(e => e.alive).length < 8) {
                setTimeout(() => {
                    spawnRandomEnemy();
                }, 2000);
            }
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height + 5,
                    this.width / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw enemy body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 5, this.y + 8, 5, 5);
        ctx.fillRect(this.x + 15, this.y + 8, 5, 5);

        // Draw health bar
        const healthBarWidth = this.width;
        const healthBarHeight = 4;
        const healthPercent = this.health / this.maxHealth;

        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 10, healthBarWidth, healthBarHeight);

        ctx.fillStyle = '#e94560';
        ctx.fillRect(this.x, this.y - 10, healthBarWidth * healthPercent, healthBarHeight);
    }
}

// Dungeon Class
class Dungeon {
    constructor() {
        this.tiles = [];
        this.width = Math.floor(config.width / config.tileSize);
        this.height = Math.floor(config.height / config.tileSize);
        this.generate();
    }

    generate() {
        // Create a simple dungeon layout
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                // Walls on edges
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    this.tiles[y][x] = 1;
                }
                // Random obstacles
                else if (Math.random() < 0.08) {
                    this.tiles[y][x] = 1;
                }
                // Floor
                else {
                    this.tiles[y][x] = 0;
                }
            }
        }

        // Clear starting area around player spawn
        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);
        for (let y = centerY - 2; y <= centerY + 2; y++) {
            for (let x = centerX - 2; x <= centerX + 2; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    this.tiles[y][x] = 0;
                }
            }
        }
    }

    isWall(x, y, width, height) {
        // Check all corners of the entity
        const corners = [
            [x, y],
            [x + width, y],
            [x, y + height],
            [x + width, y + height]
        ];

        for (let [cx, cy] of corners) {
            const tileX = Math.floor(cx / config.tileSize);
            const tileY = Math.floor(cy / config.tileSize);

            if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
                return true;
            }

            if (this.tiles[tileY] && this.tiles[tileY][tileX] === 1) {
                return true;
            }
        }

        return false;
    }

    draw(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                const px = x * config.tileSize;
                const py = y * config.tileSize;

                if (tile === 1) {
                    // Wall
                    ctx.fillStyle = '#2d3748';
                    ctx.fillRect(px, py, config.tileSize, config.tileSize);
                    ctx.strokeStyle = '#1a202c';
                    ctx.strokeRect(px, py, config.tileSize, config.tileSize);
                } else {
                    // Floor
                    ctx.fillStyle = (x + y) % 2 === 0 ? '#4a5568' : '#3d4653';
                    ctx.fillRect(px, py, config.tileSize, config.tileSize);
                }
            }
        }
    }
}

// Global game objects
let player;
let enemies = [];
let dungeon;

// Initialize game
function init() {
    config.canvas = document.getElementById('gameCanvas');
    config.ctx = config.canvas.getContext('2d');

    // Create dungeon
    dungeon = new Dungeon();

    // Create player in center
    player = new Player(
        config.width / 2 - 15,
        config.height / 2 - 15
    );

    // Spawn initial enemies
    spawnInitialEnemies();

    // Setup input handlers
    setupInput();

    // Start game loop
    gameLoop();

    // Initial UI update
    player.updateUI();

    // Initialize leaderboard
    updateLeaderboard();

    // Update leaderboard every 5 seconds to show current progress
    setInterval(updateLeaderboardOnProgress, 5000);
}

function spawnInitialEnemies() {
    const enemyTypes = ['slime', 'slime', 'goblin', 'skeleton'];

    for (let i = 0; i < 5; i++) {
        spawnRandomEnemy(enemyTypes[Math.floor(Math.random() * enemyTypes.length)]);
    }
}

function spawnRandomEnemy(type) {
    let x, y;
    let attempts = 0;
    const maxAttempts = 50;

    // Find a valid spawn position
    do {
        x = Math.random() * (config.width - 100) + 50;
        y = Math.random() * (config.height - 100) + 50;
        attempts++;
    } while (dungeon.isWall(x, y, 25, 25) && attempts < maxAttempts);

    if (attempts < maxAttempts) {
        // Scale enemy type based on player level
        if (!type) {
            if (player.level >= 5) {
                type = Math.random() < 0.5 ? 'skeleton' : 'goblin';
            } else if (player.level >= 3) {
                type = Math.random() < 0.5 ? 'goblin' : 'slime';
            } else {
                type = Math.random() < 0.7 ? 'slime' : 'goblin';
            }
        }

        enemies.push(new Enemy(x, y, type));
    }
}

function advanceToNextFloor() {
    gameState.currentFloor++;
    gameState.enemiesKilledThisFloor = 0;
    gameState.enemiesToClearFloor = Math.floor(10 + gameState.currentFloor * 2);

    // Clear all remaining enemies
    enemies = [];

    // Show floor cleared message
    showFloorClearedMessage();

    // Regenerate dungeon
    dungeon.generate();

    // Reset player position to center
    player.x = config.width / 2 - 15;
    player.y = config.height / 2 - 15;

    // Heal player partially
    player.health = Math.min(player.maxHealth, player.health + Math.floor(player.maxHealth * 0.3));
    player.updateUI();

    // Spawn enemies for new floor
    setTimeout(() => {
        const enemyCount = Math.min(5 + gameState.currentFloor, 10);
        for (let i = 0; i < enemyCount; i++) {
            spawnRandomEnemy();
        }
    }, 1000);

    // Update leaderboard to show new floor progress
    updateLeaderboardOnProgress();
}

function showFloorClearedMessage() {
    const message = document.createElement('div');
    message.className = 'level-up-message';
    message.textContent = `FLOOR ${gameState.currentFloor} CLEARED! Entering Floor ${gameState.currentFloor + 1}`;
    message.style.background = '#4ecca3';
    message.style.color = '#1a1a2e';
    document.body.appendChild(message);

    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

function setupInput() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key.toLowerCase()] = true;

        if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            player.attack();
        }
    });

    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key.toLowerCase()] = false;
    });

    // Click to upgrade stats
    setupStatUpgrades();
}

function setupStatUpgrades() {
    document.getElementById('strength').addEventListener('click', () => {
        if (gameState.levelUpPoints > 0) {
            player.strength += 5;
            gameState.levelUpPoints--;
            player.updateUI();
            showUpgradeNotification('Strength +5');
        }
    });

    document.getElementById('defense').addEventListener('click', () => {
        if (gameState.levelUpPoints > 0) {
            player.defense += 3;
            gameState.levelUpPoints--;
            player.updateUI();
            showUpgradeNotification('Defense +3');
        }
    });

    document.getElementById('speed').addEventListener('click', () => {
        if (gameState.levelUpPoints > 0) {
            player.speed += 1;
            gameState.levelUpPoints--;
            player.updateUI();
            showUpgradeNotification('Speed +1');
        }
    });
}

function upgradeAttribute(attribute) {
    switch(attribute) {
        case 'health':
            player.maxHealth += 30;
            player.health += 30;
            break;
        case 'strength':
            player.strength += 5;
            break;
        case 'defense':
            player.defense += 3;
            break;
        case 'speed':
            player.speed += 1;
            break;
        case 'attackSpeed':
            gameState.attackCooldown = Math.max(100, gameState.attackCooldown - 50);
            break;
        case 'attackRange':
            player.attackRange += 10;
            break;
    }

    player.updateUI();

    // Close modal and resume game
    const modal = document.getElementById('upgradeModal');
    if (modal) {
        document.body.removeChild(modal);
    }
    gameState.isPaused = false;
}

function showUpgradeNotification(text) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = '#4ecca3';
    notification.style.color = '#1a1a2e';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.fontWeight = 'bold';
    notification.textContent = text + ` (${gameState.levelUpPoints} points left)`;
    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 1500);
}

function handleInput() {
    let dx = 0;
    let dy = 0;

    if (gameState.keys['w'] || gameState.keys['arrowup']) dy -= 1;
    if (gameState.keys['s'] || gameState.keys['arrowdown']) dy += 1;
    if (gameState.keys['a'] || gameState.keys['arrowleft']) dx -= 1;
    if (gameState.keys['d'] || gameState.keys['arrowright']) dx += 1;

    if (dx !== 0 || dy !== 0) {
        // Normalize diagonal movement
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
        player.move(dx, dy);
    }
}

function update() {
    // Don't update game if paused
    if (gameState.isPaused) {
        return;
    }

    handleInput();

    // Update enemies
    enemies.forEach(enemy => {
        enemy.update(player);
    });

    // Remove dead enemies after a delay
    enemies = enemies.filter(enemy => enemy.alive);

    // Spawn more enemies if needed (only if not trying to clear floor)
    const aliveEnemies = enemies.filter(e => e.alive).length;
    if (aliveEnemies < 3 && gameState.enemiesKilledThisFloor < gameState.enemiesToClearFloor - 3) {
        spawnRandomEnemy();
    }
}

function draw() {
    const ctx = config.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, config.width, config.height);

    // Draw dungeon
    dungeon.draw(ctx);

    // Draw enemies
    enemies.forEach(enemy => {
        enemy.draw(ctx);
    });

    // Draw player
    player.draw(ctx);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Leaderboard Functions
function saveToLeaderboard() {
    const entry = {
        level: player.level,
        floor: gameState.currentFloor,
        kills: gameState.monstersKilled,
        score: calculateScore(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString()
    };

    let leaderboard = getLeaderboard();
    leaderboard.push(entry);

    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);

    // Keep only top 10
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem('dungeonQuestLeaderboard', JSON.stringify(leaderboard));
}

function getLeaderboard() {
    const data = localStorage.getItem('dungeonQuestLeaderboard');
    return data ? JSON.parse(data) : [];
}

function calculateScore() {
    // Score calculation: floor is most important, then level, then kills
    return (gameState.currentFloor * 1000) + (player.level * 100) + gameState.monstersKilled;
}

function updateLeaderboard() {
    const leaderboard = getLeaderboard();
    const listElement = document.getElementById('leaderboardList');

    if (leaderboard.length === 0) {
        listElement.innerHTML = '<p style="text-align: center; color: #aaa;">No entries yet. Be the first!</p>';
        return;
    }

    listElement.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'leaderboard-entry';

        div.innerHTML = `
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${entry.date}</span>
            <span class="leaderboard-stats">
                Floor ${entry.floor} | Lv ${entry.level} | ${entry.kills} kills | Score: ${entry.score}
            </span>
        `;

        listElement.appendChild(div);
    });
}

// Update leaderboard periodically and on floor change
function updateLeaderboardOnProgress() {
    // Save current progress to show in leaderboard
    const currentProgress = {
        level: player.level,
        floor: gameState.currentFloor,
        kills: gameState.monstersKilled,
        score: calculateScore(),
        timestamp: new Date().toISOString(),
        date: 'Current Run'
    };

    const leaderboard = getLeaderboard();
    const allEntries = [currentProgress, ...leaderboard];

    // Sort by score
    allEntries.sort((a, b) => b.score - a.score);

    const listElement = document.getElementById('leaderboardList');
    listElement.innerHTML = '';

    const displayCount = Math.min(10, allEntries.length);
    for (let i = 0; i < displayCount; i++) {
        const entry = allEntries[i];
        const div = document.createElement('div');
        div.className = 'leaderboard-entry';

        if (entry.date === 'Current Run') {
            div.classList.add('current');
        }

        div.innerHTML = `
            <span class="leaderboard-rank">#${i + 1}</span>
            <span class="leaderboard-name">${entry.date}</span>
            <span class="leaderboard-stats">
                Floor ${entry.floor} | Lv ${entry.level} | ${entry.kills} kills | Score: ${entry.score}
            </span>
        `;

        listElement.appendChild(div);
    }
}

// Start the game when page loads
window.addEventListener('load', init);
