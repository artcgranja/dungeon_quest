import App from './ui/App.svelte';
import './ui/global.css';

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
