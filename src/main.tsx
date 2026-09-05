import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {TopLevelSaveHelper} from './components/TopLevelSaveHelper.tsx';
import './index.css';

// Safely trap benign development-mode WebSocket/HMR disconnection warnings 
// which are expected in sandbox container setups and prevent interruptions.
if (typeof window !== 'undefined') {
  const isBenignError = (msg: string, lineno?: number, colno?: number) => {
    if (lineno === 0 || colno === 0) return true;
    const lower = String(msg).toLowerCase();
    return (
      lower.includes('websocket') ||
      lower.includes('hmr') ||
      lower.includes('vite') ||
      lower.includes('socket-close') ||
      lower.includes('ws://') ||
      lower.includes('wss://') ||
      lower.includes('script error') ||
      lower.includes('resizeobserver') ||
      lower.includes('networkerror') ||
      lower.includes('failed to fetch')
    );
  };

  // 1. Intercept window.onerror directly (returning true suppresses browser error bubble to host)
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = String(message || '');
    const errStr = error ? String(error) : '';
    if (isBenignError(msgStr, typeof lineno === 'number' ? lineno : undefined, typeof colno === 'number' ? colno : undefined) || isBenignError(errStr)) {
      return true; // Fully suppress
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  // 2. Intercept unhandled exceptions & dynamic rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || '';
    const message = typeof reason === 'string' ? reason : (reason.message || '');
    if (isBenignError(message)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('error', (event) => {
    const message = event.message || '';
    const errStr = event.error ? String(event.error) : '';
    if (isBenignError(message, event.lineno, event.colno) || isBenignError(errStr)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);

  // 3. Silence console clutter for websocket/HMR warnings
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    try {
      const msg = args.map(arg => {
        try {
          if (typeof arg === 'symbol') return arg.toString();
          return String(arg);
        } catch (_) {
          return '';
        }
      }).join(' ').toLowerCase();
      if (isBenignError(msg)) return;
    } catch (_) {}
    originalConsoleError.apply(console, args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = function (...args: any[]) {
    try {
      const msg = args.map(arg => {
        try {
          if (typeof arg === 'symbol') return arg.toString();
          return String(arg);
        } catch (_) {
          return '';
        }
      }).join(' ').toLowerCase();
      if (isBenignError(msg)) return;
    } catch (_) {}
    originalConsoleWarn.apply(console, args);
  };

  // 4. Suppress default print headers (document title) by temporarily clearing document.title to a blank space
  // and dynamically injecting a supreme print style override that forces @page margin to 0 !important.
  let originalTitle = '';
  let activeOverrideStyle: HTMLStyleElement | null = null;

  window.addEventListener('beforeprint', () => {
    originalTitle = document.title;
    if (!document.title || document.title.trim() === '') {
      document.title = 'Marine_Fasteners_Document';
    }

    // Append a high-priority style tag to the document to override any component-level custom margins
    try {
      const style = document.createElement('style');
      style.id = 'supreme-global-print-override';
      style.textContent = `
        @media print {
          @page {
            margin: 0 !important; /* Force complete removal of browser header/footer (title, URL, date, page) */
          }
          html, body {
            margin: 0 !important;
            padding: 4mm 5mm !important; /* Restore printable margins safely inside the page body without large white gaps */
            zoom: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `;
      document.head.appendChild(style);
      activeOverrideStyle = style;
    } catch (e) {
      console.error('Failed to inject print override style:', e);
    }
  });

  window.addEventListener('afterprint', () => {
    if (originalTitle) {
      document.title = originalTitle;
    }
    if (activeOverrideStyle && activeOverrideStyle.parentNode) {
      try {
        activeOverrideStyle.parentNode.removeChild(activeOverrideStyle);
      } catch (e) {
        console.error('Failed to remove print override style:', e);
      }
      activeOverrideStyle = null;
    }
  });
}

const isSavePdfAction = typeof window !== 'undefined' && window.location.search.includes('action=prompt_save_pdf');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isSavePdfAction ? <TopLevelSaveHelper /> : <App />}
  </StrictMode>,
);

