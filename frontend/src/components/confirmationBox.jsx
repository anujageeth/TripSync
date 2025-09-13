import React from 'react';
import '../CSS/confirmationBox.css';

function ConfirmationBox({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="confirmationOverlay"
      onClick={onCancel}
    >
      <div className="confirmationDialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirmationTitle">{title}</h3>
        <p className="confirmationMessage">{message}</p>
        <div className="confirmationActions">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="backBtn confirmationBtn"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="backBtn confirmationBtn"
            id="deletePlanBtn"
          >
            {loading ? 'Deleting…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationBox;