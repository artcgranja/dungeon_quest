/**
 * Component - Pure data container
 * Components should ONLY contain data, no logic
 */

export interface Component {
  readonly type: string;
}

export abstract class BaseComponent implements Component {
  abstract readonly type: string;
}

/**
 * Component type registry for type-safe component access
 */
export type ComponentClass<T extends Component = Component> = new (...args: any[]) => T;

export type ComponentType<T extends Component = Component> = T['type'];
