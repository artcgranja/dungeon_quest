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

**Option 1: Tauri Desktop App (Recommended)**

This project is now configured as a Tauri application for a native desktop experience!

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run in development mode:**
   ```bash
   npm run dev
   ```
   This will open the game in a native desktop window with developer tools.

3. **Build for production:**
   ```bash
   npm run build
   ```
   The installer will be created in `src-tauri/target/release/bundle/`

**Option 2: Web Browser**

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. The game will start automatically

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
- Built with HTML5 Canvas and vanilla JavaScript
- No frontend frameworks or dependencies
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

## Future Enhancements

Potential features for future versions:
- Sound effects and background music
- Different weapon types
- Health potions and power-ups
- Multiple dungeon rooms/levels
- Boss battles
- Save/load system
- More enemy varieties
- Special abilities and magic

## Project Structure

```
dungeon_quest/
├── index.html          # Main game HTML file
├── game.js             # Game logic and engine
├── package.json        # NPM configuration
├── src-tauri/          # Tauri desktop app configuration
│   ├── src/
│   │   ├── main.rs     # Rust main entry point
│   │   └── lib.rs      # Tauri app setup
│   ├── Cargo.toml      # Rust dependencies
│   ├── tauri.conf.json # Tauri configuration
│   ├── build.rs        # Build script
│   ├── icons/          # App icons
│   └── capabilities/   # Tauri permissions
└── README.md
```

## Credits

Created as a Zelda-inspired dungeon crawler game using HTML5 Canvas and Tauri.

- **Game Engine:** HTML5 Canvas with vanilla JavaScript
- **Desktop Framework:** Tauri v2
- **Inspiration:** Classic top-down Zelda games

Enjoy your adventure in the dungeon!