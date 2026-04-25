import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const SettingsContext = createContext(null);

const defaults = {
  heroHeadline: 'WE SCALE YOUR',
  heroAccent: 'SOCIAL REVENUE.',
  heroSubtext:
    'Stop posting into the void. Start dominating your niche. 15 Posts · 6 Reels · Full GMB Optimization — starting today.',
  whatsappNumber: '+91 98765 43210',
  whatsappMessageTemplate: "Hi, I'm interested in your services. Can you assist me?",
  exitIntentPopup: true,
  whatsappPulseButton: true,
  quarterlyPricingToggle: true,
  maintenanceMode: false,
  adminPanelEnabled: true,
  adminLoginMode: 'password',
  requireAdminApiKeyForRequests: false,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await api('/api/settings/public');
      setSettings({ ...defaults, ...data });
    } catch {
      setSettings(defaults);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshSettings();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSettings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SettingsProvider');
  return ctx;
}
