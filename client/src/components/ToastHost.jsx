import { useToast } from '../context/ToastContext';

export default function ToastHost() {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.variant}`} role="status">
          <span>{t.message}</span>
          <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
