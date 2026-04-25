import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../context/SettingsContext';

const KEY = 'gp_exit_shown';

export default function ExitIntent() {
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!settings.exitIntentPopup) return undefined;
    if (sessionStorage.getItem(KEY)) return undefined;
    if (window.matchMedia('(max-width: 768px), (pointer: coarse)').matches) return undefined;

    const onLeave = (e) => {
      if (e.clientY > 0) return;
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, '1');
      setOpen(true);
    };

    document.addEventListener('mouseout', onLeave);
    return () => document.removeEventListener('mouseout', onLeave);
  }, [settings.exitIntentPopup]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '2rem',
          maxWidth: 420,
          textAlign: 'center',
        }}
      >
        <h3 style={{ marginBottom: '0.75rem', fontFamily: "'Space Grotesk', sans-serif" }}>
          Before you go — free growth audit?
        </h3>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Tell us about your business and we will reply on WhatsApp within 2 hours.
        </p>
        <button type="button" className="btn-primary" onClick={() => navigate('/contact')}>
          Claim free audit →
        </button>
        <button
          type="button"
          className="btn-ghost"
          style={{ marginTop: '0.75rem', width: '100%' }}
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
