# 🎮 Dungeon Quest - How to Run

## Quick Start Guide

### 🌐 Run in Browser (Recommended for Testing)

```bash
npm run dev
```

**Then open:** http://localhost:1420

This opens a **web browser** with the game. Perfect for quick testing!

---

### 🖥️ Run as Desktop App (Tauri)

```bash
npm run tauri:dev
```

This opens a **native desktop window** with the game.

⚠️ **Note:** `npm run dev` only runs the browser version. Use `npm run tauri:dev` for the desktop app.

---

## 🎮 Controls

- **WASD** or **Arrow Keys** - Move
- **SPACE** - Attack
- **Click stats** after leveling - Upgrade attributes

---

## 🐛 Troubleshooting

### "Game config not loaded" Error
✅ **FIXED!** The DungeonGenerator now loads **after** game data.

### Game doesn't open in Tauri
- Make sure you're using `npm run tauri:dev` (not `npm run dev`)
- Check that Rust and Cargo are installed

---

## 📁 Project Structure

```
src/
├── core/          # ECS framework
├── game/          # Game logic
├── rendering/     # PixiJS renderer  
├── input/         # Input handling
└── main.ts        # Entry point

public/data/       # JSON configs (enemies, items, balance)
```

---

## 🚀 Build for Production

```bash
# Web build
npm run build

# Desktop build
npm run tauri:build
```

---

**Enjoy the game!** 🎮
