/**
 * Vite environment URLs (see .env, .env.development, .env.production).
 * VITE_API_URL — HTTP origin for the Node backend (no trailing slash).
 * VITE_WS_URL — WebSocket origin (no trailing slash).
 *   Production: wss://ai-tradingbot-backend.vcl4xengine.com → WS at .../ws
 *   Local dev:  ws://localhost:5001 → WS at ws://localhost:5001/ws
 */

const trimTrailingSlash = (url) => (url || '').replace(/\/$/, '');

export const API_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || 'http://localhost:5001'
);

export const WS_URL = trimTrailingSlash(
  import.meta.env.VITE_WS_URL || 'ws://localhost:5001'
);

/** REST API base (Node backend only) */
export const API_BASE = `${API_URL}/api`;

/** WebSocket endpoint for live prices / account updates */
export const WS_ENDPOINT = WS_URL.endsWith('/ws') ? WS_URL : `${WS_URL}/ws`;

export const ENGINE_BASE = trimTrailingSlash(
  import.meta.env.VITE_ENGINE_BASE || 'http://localhost:8000/api'
);

/** Marketing site — privacy, terms, refund */
export const LANDING_URL = trimTrailingSlash(
  import.meta.env.VITE_LANDING_URL || 'http://localhost:3001'
);

/** VCL4X Alpha Access Telegram channel */
export const TELEGRAM_URL = trimTrailingSlash(
  import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/VCL4XAlphaAccess'
);

export const ALLOW_MOCK_AUTH =
  import.meta.env.VITE_ALLOW_MOCK_AUTH === 'true' ||
  import.meta.env.DEV;
