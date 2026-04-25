const jwt = require('jsonwebtoken');
const Settings = require('../models/Settings');

function getBearerToken(req) {
  const auth = req.headers.authorization;
  if (!auth || typeof auth !== 'string') return '';
  const m = auth.match(/^Bearer\s+(\S+)/i);
  return m ? m[1].trim() : '';
}

/**
 * JWT + optional X-Admin-Key when requireAdminApiKeyForRequests is enabled in Settings.
 */
async function authRequired(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET missing' });
    }
    req.user = jwt.verify(token, secret);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  try {
    const s = await Settings.findOne();
    if (!s || !s.requireAdminApiKeyForRequests) return next();
    if (!s.adminApiKey) return next();
    const headerKey = req.headers['x-admin-key'];
    if (headerKey && headerKey === s.adminApiKey) return next();
    return res.status(403).json({ message: 'Valid X-Admin-Key header required' });
  } catch (e) {
    return next(e);
  }
}

const adminAuth = authRequired;

module.exports = { adminAuth, authRequired };
