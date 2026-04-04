/**
 * Build a WhatsApp wa.me URL (works on mobile app and WhatsApp Web).
 */
export function buildWhatsAppUrl(phone, message) {
  const n = String(phone || '').replace(/\D/g, '');
  if (!n) return '#';
  const base = `https://wa.me/${n}`;
  if (message && String(message).trim()) {
    return `${base}?text=${encodeURIComponent(String(message).trim())}`;
  }
  return base;
}
