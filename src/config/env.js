/**
 * Vite environment URLs (see .env / .env.development).
 * VITE_API_URL — HTTP origin for the Node backend (no trailing slash).
 * VITE_WS_URL — WebSocket origin (no trailing slash); /ws is appended for the live feed.
 */

const trimTrailingSlash = (url) => (url || '').replace(/\/$/, '');

export const API_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || 'http://localhost:5001'
);

export const WS_URL = trimTrailingSlash(
  import.meta.env.VITE_WS_URL || 'ws://localhost:5001'
);

/** REST base path for auth, trades, admin, and engine proxy routes */
export const API_BASE = `${API_URL}/api`;

/** Python AI engine routes (same host in production; Node proxies or serves /api/engine) */
export const ENGINE_BASE = `${API_URL}/api`;

/** WebSocket endpoint for live prices / account updates */
export const WS_ENDPOINT = `${WS_URL}/ws`;
