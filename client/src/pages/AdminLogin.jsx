import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setAdminSessionKey } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@growphone.in');
  const [password, setPassword] = useState('admin123');
  const [adminKey, setAdminKey] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [err, setErr] = useState('');
  const [pub, setPub] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/settings/public');
        if (!cancelled) setPub(data);
      } catch {
        if (!cancelled) setPub(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mode = pub?.adminLoginMode || 'password';
  const adminDisabled = pub && pub.adminPanelEnabled === false;
  const showPasswordFields = mode === 'password' || mode === 'both';
  const showAdminKeyField =
    mode === 'secret_key' || mode === 'both' || pub?.requireAdminApiKeyForRequests;

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const body = {};
      if (recoveryKey) body.recoveryKey = recoveryKey;

      if (mode === 'secret_key') {
        body.adminKey = adminKey;
      } else {
        if (showPasswordFields) {
          body.email = email;
          body.password = password;
        }
        if (mode === 'both') {
          body.adminKey = adminKey;
        }
      }

      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      login(data.token);
      if (adminKey && (mode === 'both' || mode === 'secret_key' || pub?.requireAdminApiKeyForRequests)) {
        setAdminSessionKey(adminKey);
      }
      navigate('/admin-portal');
    } catch (er) {
      setErr(er.message || 'Login failed');
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2>Admin Login</h2>
        <p>Growphone dashboard — authorized personnel only.</p>
        {adminDisabled ? (
          <p className="login-warning">
            Admin login is currently disabled in settings. Use a server recovery key if your deployment defines
            ADMIN_RECOVERY_KEY.
          </p>
        ) : null}
        {err ? (
          <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: '1rem' }}>{err}</p>
        ) : null}
        <form onSubmit={onSubmit}>
          {showPasswordFields ? (
            <>
              <div className="form-group">
                <label htmlFor="admin-email">EMAIL</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@growphone.in"
                />
              </div>
              <div className="form-group">
                <label htmlFor="admin-pass">PASSWORD</label>
                <input
                  id="admin-pass"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </>
          ) : null}

          {showAdminKeyField ? (
            <div className="form-group">
              <label htmlFor="admin-key">ADMIN KEY</label>
              <input
                id="admin-key"
                type="password"
                autoComplete="off"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="From Access Control → Admin API key"
              />
              {pub?.requireAdminApiKeyForRequests ? (
                <p className="field-hint">Required for API access when strict key mode is on.</p>
              ) : null}
            </div>
          ) : null}

          <div className="form-group">
            <label htmlFor="recovery-key">RECOVERY KEY (optional)</label>
            <input
              id="recovery-key"
              type="password"
              autoComplete="off"
              value={recoveryKey}
              onChange={(e) => setRecoveryKey(e.target.value)}
              placeholder="ADMIN_RECOVERY_KEY from server .env"
            />
            <p className="field-hint">Only if admin panel was disabled and you need emergency access.</p>
          </div>

          <button type="submit" className="submit-btn" style={{ marginTop: '0.5rem' }}>
            Login to Dashboard →
          </button>
        </form>
        <p style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '1rem', textAlign: 'center' }}>
          Default after seed: admin@growphone.in / admin123 (change in production).
        </p>
      </div>
    </div>
  );
}
