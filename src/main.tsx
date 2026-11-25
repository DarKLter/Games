import { createRoot } from 'react-dom/client';
import { installArcadeGlobal } from './core/arcadeGlobal';
import { installBrowserPolyfills } from './core/viewport';
import App from './App.tsx';
import './index.css';

installBrowserPolyfills();
installArcadeGlobal();

function mountApp() {
  const win = window as Window & { __TSEPANG_BOOTED__?: boolean };
  if (win.__TSEPANG_BOOTED__) return;
  const rootEl = document.getElementById('root');
  if (rootEl) {
    win.__TSEPANG_BOOTED__ = true;
    const bootStyle = document.getElementById('arcade-boot-style');
    if (bootStyle) bootStyle.remove();
    createRoot(rootEl).render(<App />);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp, { once: true });
} else {
  mountApp();
}
