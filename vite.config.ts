import { defineConfig } from 'vite';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  // Tauri expects a fixed port for dev
  server: {
    port: 1420,
    strictPort: true,
  },

  // Env variables prefix
  envPrefix: ['VITE_', 'TAURI_'],

  // Path aliases
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@game': path.resolve(__dirname, './src/game'),
      '@rendering': path.resolve(__dirname, './src/rendering'),
      '@input': path.resolve(__dirname, './src/input'),
      '@data': path.resolve(__dirname, './src/data'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@state': path.resolve(__dirname, './src/state'),
    },
  },

  // Build config
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
