import { getClickSessionId } from './utils/clickSession';

const BASE = process.env.NODE_ENV === 'development' ? "http://localhost:5000" : "https://growphone-api.onrender.com";

/** Must match the admin route in App.jsx (not linked from the public nav). */
export const ADMIN_PORTAL_PATH = "/admin-portal";

const TOKEN_KEY = "gp_token";
const ADMIN_KEY_SESSION = "gp_admin_key";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

/** Optional X-Admin-Key for protected routes when strict mode is enabled */
export function getAdminSessionKey() {
  try {
    return sessionStorage.getItem(ADMIN_KEY_SESSION) || "";
  } catch {
    return "";
  }
}

export function setAdminSessionKey(key) {
  try {
    if (key) sessionStorage.setItem(ADMIN_KEY_SESSION, key);
    else sessionStorage.removeItem(ADMIN_KEY_SESSION);
  } catch {
    /* ignore */
  }
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const adminKey = getAdminSessionKey();
  if (adminKey) {
    headers["X-Admin-Key"] = adminKey;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (
    !res.ok &&
    res.status === 401 &&
    !path.startsWith('/api/auth/login') &&
    getToken()
  ) {
    setToken(null);
    window.dispatchEvent(new Event('gp-auth-expired'));
  }

  if (!res.ok) {
    const err = new Error(data.message || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/** Public POST (no JWT) — used for WhatsApp click analytics. */
export async function postPublic(path, body = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Click-Session': getClickSessionId(),
  };
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const err = new Error(data.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function trackWhatsAppExpertClick() {
  return postPublic('/api/analytics/whatsapp-clicks', {
    sessionId: getClickSessionId(),
  });
}
