const KEY = 'gp_click_session';

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable per-tab session for analytics debounce (WhatsApp clicks). */
export function getClickSessionId() {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = randomId();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return randomId();
  }
}
