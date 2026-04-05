import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { getToken, setToken, setAdminSessionKey } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTok] = useState(() => getToken());

  useEffect(() => {
    setToken(token || null);
  }, [token]);

  useEffect(() => {
    const onExpired = () => setTok(null);
    window.addEventListener('gp-auth-expired', onExpired);
    return () => window.removeEventListener('gp-auth-expired', onExpired);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      login: (t) => {
        setToken(t);
        setTok(t);
      },
      logout: () => {
        setToken(null);
        setTok(null);
        setAdminSessionKey(null);
      },
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
