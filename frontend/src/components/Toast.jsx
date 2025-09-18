import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import '../CSS/Toast.css';

function Toast({ open, type = 'info', message = '', duration = 2500, onClose }) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onClose?.(), duration);
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="toastContainer" role="status" aria-live="polite">
      <div className={`toast toast-${type || 'toast-info'}`}>
        <div className="toastMessage">{message || "Toast notification"}</div>
        {type === 'success' && <CheckCircle size={20} className="toastIconRight" aria-hidden="true" />}
        {type === 'error' && <XCircle size={20} className="toastIconRight" aria-hidden="true" />}
        {type === 'info' && <XCircle size={20} className="toastIconRight" aria-hidden="true" />}
      </div>
    </div>
  );
}

export default Toast;