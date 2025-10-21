# 🔧 Troubleshooting Guide

## ❌ Error: "video/mp2t is not a valid JavaScript MIME type"

### ✅ **FIXED!** 

This error occurred because Vite's dev server was serving TypeScript files with incorrect MIME types.

### Solution Applied:
1. ✅ Fixed `__dirname` in `vite.config.ts` for ESM compatibility
2. ✅ Added `fs.strict: false` to server config
3. ✅ Added optimizeDeps for PixiJS
4. ✅ Cleaned cache and reinstalled dependencies

---

## 🧪 Testing Steps

### Step 1: Clean Start
```bash
# Stop any running dev server (Ctrl+C)

# Clear cache and rebuild
rm -rf node_modules/.vite dist
npm install
npm run build
```

### Step 2: Start Dev Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:1420/
  ➜  Network: use --host to expose
```

### Step 3: Open Browser
- Navigate to: http://localhost:1420
- Open browser console (F12)
- Look for success messages:
  ```
  🎮 Initializing Dungeon Quest...
  📦 Loading game data...
  ✅ Game data loaded
  ✅ Renderer initialized
  ...
  🎮 Game initialized successfully!
  ```

---

## 🐛 Common Issues

### Issue: Port 1420 already in use
**Solution:**
```bash
# Kill process on port 1420
lsof -ti:1420 | xargs kill -9

# Or change port in vite.config.ts
server: {
  port: 3000,  // Change this
}
```

### Issue: Blank screen, no errors
**Solution:**
1. Check browser console for errors (F12)
2. Verify files exist in `public/data/`:
   ```bash
   ls public/data/
   # Should show: enemies.json  game_config.json  items.json
   ```

### Issue: "Cannot find module '@core/...'"
**Solution:**
```bash
# Rebuild with clean cache
rm -rf node_modules/.vite
npm run build
npm run dev
```

---

## 🎯 Quick Test Script

Run this to verify everything works:

```bash
#!/bin/bash
echo "🧪 Testing Dungeon Quest setup..."

# Check Node version
echo "✓ Checking Node.js..."
node --version

# Check dependencies
echo "✓ Checking dependencies..."
npm list pixi.js --depth=0

# Clean build
echo "✓ Cleaning cache..."
rm -rf node_modules/.vite dist

# Build
echo "✓ Building..."
npm run build

# Check data files
echo "✓ Checking data files..."
ls -la public/data/

echo ""
echo "✅ All checks passed!"
echo "🚀 Now run: npm run dev"
```

Save as `test.sh`, make executable with `chmod +x test.sh`, then run `./test.sh`

---

## 🆘 Still Having Issues?

### Check these:
1. **Node.js version:** Should be 18+
   ```bash
   node --version
   ```

2. **NPM version:** Should be 8+
   ```bash
   npm --version
   ```

3. **Browser console:** Any errors? (F12 → Console)

4. **Network tab:** Are .ts files loading? (F12 → Network)

5. **Vite cache:** Try deleting:
   ```bash
   rm -rf node_modules/.vite
   ```

---

## 📋 What Should Work Now

After fixes:
- ✅ `npm run dev` starts without MIME errors
- ✅ Browser loads game at http://localhost:1420
- ✅ Console shows initialization messages
- ✅ Game renders (dungeon, player, enemies)
- ✅ Controls work (WASD, SPACE)

---

## 🔍 Debug Mode

To see more detailed logs:

1. Edit `src/main.ts`, add at top:
   ```typescript
   console.log('🔍 Debug mode enabled');
   ```

2. Run with verbose:
   ```bash
   DEBUG=vite:* npm run dev
   ```

---

**If you still get errors, share the EXACT error message from the browser console!**
