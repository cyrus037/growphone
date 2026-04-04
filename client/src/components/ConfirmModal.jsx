export default function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title" className="modal-title">
          {title}
        </h3>
        {message ? <p className="modal-body">{message}</p> : null}
        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            {cancelLabel || 'Cancel'}
          </button>
          <button
            type="button"
            className={danger ? 'save-btn danger-confirm' : 'save-btn'}
            onClick={onConfirm}
          >
            {confirmLabel || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
