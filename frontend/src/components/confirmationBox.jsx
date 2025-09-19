import { React, useState } from 'react';

import Toast from './Toast';
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

  confirmToastMessage = 'Confirmed',
  cancelToastMessage = 'Cancelled',
  confirmToastType = 'info',
  cancelToastType = 'info',
  toastDuration = 2000,
}) {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState('info');
  const [toastMsg, setToastMsg] = useState('');

  if (!open) return null;

  const showToast = (msg, type = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const handleCancel = () => {
    showToast(cancelToastMessage, cancelToastType);
    onCancel?.();
  };

  const handleConfirm = () => {
    showToast(confirmToastMessage, confirmToastType);
    onConfirm?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="confirmationOverlay"
      onClick={handleCancel}
    >
      <div className="confirmationDialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirmationTitle">{title}</h3>
        <p className="confirmationMessage">{message}</p>
        <div className="confirmationActions">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="backBtn confirmationBtn"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="backBtn confirmationBtn"
            id="deletePlanBtn"
          >
            {loading ? 'Deleting…' : confirmText}
          </button>
        </div>
      </div>

      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        duration={2500}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}

export default ConfirmationBox;