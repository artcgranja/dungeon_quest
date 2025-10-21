# Dungeon Quest

A top-down action RPG inspired by classic Zelda games. Fight monsters in procedurally generated dungeons, level up your character, and upgrade your attributes!

## Features

- **Top-down Zelda-style gameplay** - Classic action-adventure combat mechanics
- **Procedurally generated dungeons** - Unique dungeon layouts with walls and obstacles
- **Multiple enemy types** - Face slimes, goblins, skeletons, and demons
- **Leveling system** - Gain experience from defeating enemies
- **Attribute upgrades** - Customize your character by upgrading Strength, Defense, or Speed
- **Real-time combat** - Attack enemies with directional melee attacks
- **Enemy AI** - Monsters chase and attack the player when in range
- **Progressive difficulty** - Stronger enemies spawn as you level up

## How to Play

### Running the Game

**Option 1: Web Development Mode**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run Vite dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser

3. **Type check:**
   ```bash
   npm run type-check
   ```

**Option 2: Tauri Desktop App**

1. **Run in desktop mode:**
   ```bash
   npm run tauri:dev
   ```
   This will open the game in a native desktop window

2. **Build for production:**
   ```bash
   npm run tauri:build
   ```
   The installer will be created in `src-tauri/target/release/bundle/`

### Controls

- **WASD** or **Arrow Keys** - Move your character in four directions
- **SPACE** - Attack in the direction you're facing
- **Click on attributes** - Spend level-up points to upgrade stats

### Gameplay

1. **Movement** - Navigate through the dungeon using WASD or arrow keys
2. **Combat** - Press SPACE to attack enemies in front of you
3. **Experience** - Defeat enemies to gain experience points
4. **Level Up** - When you level up, you gain stat improvements and 3 upgrade points
5. **Upgrades** - Click on Strength, Defense, or Speed to spend your points
   - **Strength** - Increases attack damage
   - **Defense** - Reduces incoming damage
   - **Speed** - Move faster through the dungeon

## Enemy Types

- **Slime** (Purple) - Weak enemy, good for beginners
  - Health: 30 | Damage: 5 | Speed: Slow | EXP: 25

- **Goblin** (Red) - Medium difficulty, faster than slimes
  - Health: 50 | Damage: 10 | Speed: Medium | EXP: 50

- **Skeleton** (White) - Tough enemy with high health
  - Health: 70 | Damage: 15 | Speed: Medium | EXP: 75

- **Demon** (Dark Red) - Very dangerous, high damage
  - Health: 100 | Damage: 20 | Speed: Slow | EXP: 150

## Tips

- Keep moving to avoid enemy attacks
- Attack in the direction of enemies - directional combat matters!
- Watch your health bar and avoid getting surrounded
- Balance your upgrades between offense and defense
- Stronger enemies spawn as you level up - be prepared!
- New enemies spawn periodically, keeping the action going

## Technical Details

### Frontend
- **Phaser 3**: 2D game rendering engine
- **TypeScript**: Type-safe game logic
- **Svelte 5**: Reactive UI components
- **Vite**: Fast build tool and dev server
- Responsive UI with real-time stat updates
- Works both as a web app and desktop app

### Desktop App (Tauri)
- **Framework:** Tauri v2
- **Backend:** Rust
- **Bundle size:** Much smaller than Electron alternatives
- **Performance:** Native performance with minimal overhead
- **Cross-platform:** Builds for Windows, macOS, and Linux

### Prerequisites for Building
- Node.js and npm (for Tauri CLI)
- Rust and Cargo (for Tauri backend)
- Platform-specific build tools:
  - **Linux:** `webkit2gtk`, `libgtk-3-dev`, `libayatana-appindicator3-dev`
  - **macOS:** Xcode Command Line Tools
  - **Windows:** Microsoft Visual Studio C++ Build Tools

## Refactoring Roadmap

### ✅ Phase 0: Setup (COMPLETED)
- Vite + TypeScript + Phaser 3 + Svelte integration
- Project structure
- Basic game port from vanilla JS to TypeScript

### 🔄 Phase 1: Core Layer (NEXT)
- ECS (Entity-Component-System) implementation
- EventBus for decoupled communication
- Utilities (Random, Vector2D, ObjectPool)

### ⏳ Phase 2: Rendering Separation
- Decouple rendering from game logic
- Sprite and Animation systems

### ⏳ Phase 3: Core Systems
- Movement, Combat, Collision systems
- Input manager with Command pattern
- State machines

### ⏳ Phase 4: Data-Driven Design
- JSON configs for enemies, items, loot tables
- Easy balancing without recompilation

### ⏳ Phase 5: AI & Procedural Generation
- Advanced AI with behavior trees
- Improved dungeon generation (BSP/cellular automata)
- Boss rooms and difficulty scaling

### ⏳ Phase 6: Polish & Features
- Particle effects
- Sound system
- Inventory & items
- Dash ability
- Save/load system
- Skill tree

## Project Structure

```
dungeon_quest/
├── src/
│   ├── core/              # Core ECS and utilities (Phase 1+)
│   ├── game/              # Game logic
│   │   ├── Player.ts      # Player class
│   │   ├── Enemy.ts       # Enemy class
│   │   ├── Dungeon.ts     # Dungeon generation
│   │   └── managers/      # Game managers
│   ├── rendering/         # Rendering layer
│   │   └── scenes/
│   │       └── GameScene.ts  # Main Phaser scene
│   ├── ui/                # Svelte UI components
│   │   ├── App.svelte     # Main app component
│   │   ├── components/    # UI components
│   │   └── stores/        # Svelte stores
│   └── main.ts            # Entry point
├── src-tauri/             # Tauri configuration
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # NPM configuration
```

## Credits

A roguelike dungeon crawler being refactored to modern architecture.

- **Game Engine:** Phaser 3
- **Language:** TypeScript
- **UI Framework:** Svelte 5
- **Build Tool:** Vite
- **Desktop Framework:** Tauri v2
- **Inspiration:** Classic roguelikes and Zelda games

Enjoy your adventure in the dungeon!