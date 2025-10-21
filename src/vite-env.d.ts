/// <reference types="vite/client" />
/// <reference types="svelte" />

declare module '*.json' {
  const value: any;
  export default value;
}
