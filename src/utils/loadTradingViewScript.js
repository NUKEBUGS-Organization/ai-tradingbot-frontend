const TV_SCRIPT_URL = 'https://s3.tradingview.com/tv.js';

let loadPromise = null;

/**
 * Load TradingView tv.js once for the whole app (no duplicate script tags).
 * @returns {Promise<void>}
 */
export function loadTradingViewScript() {
  if (typeof window !== 'undefined' && window.TradingView?.widget) {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${TV_SCRIPT_URL}"]`);
    if (existing) {
      if (window.TradingView?.widget) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('TradingView script failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.src = TV_SCRIPT_URL;
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('TradingView script failed to load'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
