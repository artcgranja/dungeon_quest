import { EventBus } from '@core/events';
import type { Command } from './Command';
import { NullCommand, EventCommand } from './Command';

/**
 * Input type
 */
export enum InputType {
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
}

/**
 * Key state
 */
interface KeyState {
  pressed: boolean;
  justPressed: boolean;
  justReleased: boolean;
}

/**
 * Mouse state
 */
interface MouseState {
  x: number;
  y: number;
  buttons: Map<number, KeyState>;
}

/**
 * InputManager - handles keyboard and mouse input
 * Maps input to commands using Command pattern
 */
export class InputManager {
  private keys: Map<string, KeyState>;
  private mouse: MouseState;
  private keyBindings: Map<string, Command>;
  private mouseBindings: Map<number, Command>;
  private eventBus: EventBus;
  private enabled: boolean;

  constructor(eventBus: EventBus) {
    this.keys = new Map();
    this.mouse = {
      x: 0,
      y: 0,
      buttons: new Map(),
    };
    this.keyBindings = new Map();
    this.mouseBindings = new Map();
    this.eventBus = eventBus;
    this.enabled = true;

    this.setupEventListeners();
  }

  // ==================== Setup ====================

  /**
   * Setup DOM event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Remove event listeners (cleanup)
   */
  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
    window.removeEventListener('mousedown', this.onMouseDown.bind(this));
    window.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  // ==================== Event Handlers ====================

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    const key = event.key.toLowerCase();
    const state = this.getOrCreateKeyState(key);

    if (!state.pressed) {
      state.justPressed = true;
      state.pressed = true;
    }

    // Prevent default for game keys
    if (this.keyBindings.has(key)) {
      event.preventDefault();
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    if (!this.enabled) return;

    const key = event.key.toLowerCase();
    const state = this.getOrCreateKeyState(key);

    state.pressed = false;
    state.justReleased = true;
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.enabled) return;

    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  private onMouseDown(event: MouseEvent): void {
    if (!this.enabled) return;

    const button = event.button;
    const state = this.getOrCreateMouseButtonState(button);

    if (!state.pressed) {
      state.justPressed = true;
      state.pressed = true;
    }

    event.preventDefault();
  }

  private onMouseUp(event: MouseEvent): void {
    if (!this.enabled) return;

    const button = event.button;
    const state = this.getOrCreateMouseButtonState(button);

    state.pressed = false;
    state.justReleased = true;

    event.preventDefault();
  }

  // ==================== Key/Button State ====================

  private getOrCreateKeyState(key: string): KeyState {
    if (!this.keys.has(key)) {
      this.keys.set(key, {
        pressed: false,
        justPressed: false,
        justReleased: false,
      });
    }
    return this.keys.get(key)!;
  }

  private getOrCreateMouseButtonState(button: number): KeyState {
    if (!this.mouse.buttons.has(button)) {
      this.mouse.buttons.set(button, {
        pressed: false,
        justPressed: false,
        justReleased: false,
      });
    }
    return this.mouse.buttons.get(button)!;
  }

  // ==================== Input Queries ====================

  /**
   * Check if key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase())?.pressed ?? false;
  }

  /**
   * Check if key was just pressed this frame
   */
  isKeyJustPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase())?.justPressed ?? false;
  }

  /**
   * Check if key was just released this frame
   */
  isKeyJustReleased(key: string): boolean {
    return this.keys.get(key.toLowerCase())?.justReleased ?? false;
  }

  /**
   * Check if mouse button is pressed
   * 0 = left, 1 = middle, 2 = right
   */
  isMouseButtonPressed(button: number): boolean {
    return this.mouse.buttons.get(button)?.pressed ?? false;
  }

  /**
   * Check if mouse button was just pressed
   */
  isMouseButtonJustPressed(button: number): boolean {
    return this.mouse.buttons.get(button)?.justPressed ?? false;
  }

  /**
   * Get mouse position
   */
  getMousePosition(): { x: number; y: number } {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  // ==================== Command Binding ====================

  /**
   * Bind a key to a command
   */
  bindKey(key: string, command: Command): void {
    this.keyBindings.set(key.toLowerCase(), command);
  }

  /**
   * Bind multiple keys to a command
   */
  bindKeys(keys: string[], command: Command): void {
    keys.forEach((key) => this.bindKey(key, command));
  }

  /**
   * Bind a mouse button to a command
   */
  bindMouseButton(button: number, command: Command): void {
    this.mouseBindings.set(button, command);
  }

  /**
   * Unbind a key
   */
  unbindKey(key: string): void {
    this.keyBindings.delete(key.toLowerCase());
  }

  /**
   * Unbind all keys
   */
  unbindAll(): void {
    this.keyBindings.clear();
    this.mouseBindings.clear();
  }

  // ==================== Update ====================

  /**
   * Update input state - call this every frame
   * Processes bound commands and clears "just pressed/released" states
   */
  update(): void {
    if (!this.enabled) return;

    // Execute bound commands for pressed keys
    for (const [key, command] of this.keyBindings) {
      const state = this.keys.get(key);
      if (state?.pressed || state?.justPressed) {
        this.executeCommand(command);
      }
    }

    // Execute bound commands for pressed mouse buttons
    for (const [button, command] of this.mouseBindings) {
      const state = this.mouse.buttons.get(button);
      if (state?.pressed || state?.justPressed) {
        this.executeCommand(command);
      }
    }

    // Clear "just pressed/released" states
    this.clearFrameStates();
  }

  /**
   * Execute a command
   */
  private executeCommand(command: Command): void {
    if (command instanceof EventCommand) {
      this.eventBus.emit(command.getEventName(), command.getEventData());
    }
    // Other command types would be executed on specific entities
  }

  /**
   * Clear just pressed/released states at end of frame
   */
  private clearFrameStates(): void {
    for (const state of this.keys.values()) {
      state.justPressed = false;
      state.justReleased = false;
    }

    for (const state of this.mouse.buttons.values()) {
      state.justPressed = false;
      state.justReleased = false;
    }
  }

  // ==================== Control ====================

  /**
   * Enable/disable input processing
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clearAllStates();
    }
  }

  /**
   * Check if input is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Clear all input states
   */
  private clearAllStates(): void {
    this.keys.clear();
    this.mouse.buttons.clear();
  }

  /**
   * Get all currently pressed keys
   */
  getPressedKeys(): string[] {
    const pressed: string[] = [];
    for (const [key, state] of this.keys) {
      if (state.pressed) {
        pressed.push(key);
      }
    }
    return pressed;
  }
}
