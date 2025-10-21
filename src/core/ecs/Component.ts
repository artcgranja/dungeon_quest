/**
 * Base interface for all ECS components.
 * Components should only contain data, no logic.
 */
export interface Component {
  readonly type: string;
}

/**
 * Component type constructor interface for type-safe component queries
 */
export interface ComponentConstructor<T extends Component> {
  new (...args: any[]): T;
  readonly TYPE: string;
}

/**
 * Helper type to extract component type from constructor
 */
export type ComponentType<T extends Component> = ComponentConstructor<T>;

/**
 * Base class for creating components with automatic type registration
 */
export abstract class BaseComponent implements Component {
  abstract readonly type: string;

  /**
   * Creates a component instance
   */
  constructor() {}

  /**
   * Optional: Clone the component for entity duplication
   */
  clone?(): this;
}
