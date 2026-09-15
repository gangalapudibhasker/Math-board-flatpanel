import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for offline support and native app installation
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version available');
  },
  onOfflineReady() {
    console.log('[PWA] App ready for offline classroom use');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

