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
    monstersKilled: 0
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
        this.attackRange = 50;
        this.isAttacking = false;
        this.attackAnimationTime = 0;
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

        // Automatic stat increases
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.strength += 3;
        this.defense += 2;
        this.speed += 0.2;

        gameState.levelUpPoints += 3;

        // Show level up message
        this.showLevelUpMessage();
        this.updateUI();
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
        alert('Game Over! You have been defeated. Reloading...');
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

        // Draw attack animation
        if (this.isAttacking && this.attackAnimationTime > 0) {
            ctx.strokeStyle = '#e94560';
            ctx.lineWidth = 3;
            ctx.beginPath();

            const attackOffset = 35;
            switch(this.direction) {
                case 'up':
                    ctx.arc(this.x + this.width / 2, this.y - attackOffset,
                            this.attackRange / 2, 0, Math.PI, true);
                    break;
                case 'down':
                    ctx.arc(this.x + this.width / 2, this.y + this.height + attackOffset,
                            this.attackRange / 2, Math.PI, 0, true);
                    break;
                case 'left':
                    ctx.arc(this.x - attackOffset, this.y + this.height / 2,
                            this.attackRange / 2, Math.PI / 2, -Math.PI / 2, true);
                    break;
                case 'right':
                    ctx.arc(this.x + this.width + attackOffset, this.y + this.height / 2,
                            this.attackRange / 2, -Math.PI / 2, Math.PI / 2, true);
                    break;
            }

            ctx.stroke();
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
        this.maxHealth = stats.health;
        this.health = stats.health;
        this.damage = stats.damage;
        this.speed = stats.speed;
        this.exp = stats.exp;
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
        player.updateUI();

        // Chance to spawn new enemy after kill
        if (Math.random() < 0.3 && enemies.filter(e => e.alive).length < 8) {
            setTimeout(() => {
                spawnRandomEnemy();
            }, 2000);
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
    handleInput();

    // Update enemies
    enemies.forEach(enemy => {
        enemy.update(player);
    });

    // Remove dead enemies after a delay
    enemies = enemies.filter(enemy => enemy.alive);

    // Spawn more enemies if too few
    if (enemies.length < 3) {
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

// Start the game when page loads
window.addEventListener('load', init);
