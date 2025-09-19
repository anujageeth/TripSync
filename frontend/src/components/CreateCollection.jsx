import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import '../CSS/CreateCollection.css';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}`;

export default function CreateCollection({
  isOpen,
  onClose,
  userId,
  onCreated,
  mode = 'create',
  collection = null,
  onUpdated,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState('info');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setSubmitting(false);
      setError('');
      return;
    }
    if (mode === 'edit' && collection) {
      setName(collection.name || '');
      setDescription(collection.description || '');
    }
  }, [isOpen, mode, collection]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const showToast = (msg, type = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmed = name.trim();
    if (!trimmed) {
      const msg = 'Please enter a trip name.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    const isEdit = mode === 'edit' && collection?._id;

    try {
      setSubmitting(true);

      const payload = {
        name: trimmed,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(isEdit ? {} : { userId }),
      };

      const url = isEdit
        ? `${API_BASE}/collections/${encodeURIComponent(collection._id)}`
        : `${API_BASE}/collections`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || `${isEdit ? 'Update' : 'Create'} failed (${res.status})`);
      }

      const result = await res.json();
      if (isEdit) {
        onUpdated?.(result);
        showToast('Collection updated', 'success');
      } else {
        onCreated?.(result);
        showToast('Collection created', 'success');
      }
      onClose?.();
    } catch (e) {
      const msg = e?.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} collection`;
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const isEdit = mode === 'edit' && collection?._id;
  const title = isEdit ? 'Edit Trip Collection' : 'Create Trip Collection';
  const submitLabel = isEdit ? (submitting ? 'Saving…' : 'Save Changes') : (submitting ? 'Creating…' : 'Create Collection');

  return createPortal(
    <div className="ccBackdrop" role="dialog" aria-modal="true" aria-labelledby="ccTitle">
      <div className="ccCard">
        <div className="ccHeader">
          <div className="ccTitleWrap">
            <h2 id="ccTitle" className="ccTitle">{title}</h2>
          </div>
          <button className="ccCloseBtn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="ccBody" onSubmit={handleSubmit}>
          <div className="ccLeft">
            <div className="ccField">
              <label className="ccLabel" htmlFor="ccName">Trip name</label>
              <input
                id="ccName"
                className="ccInput"
                type="text"
                placeholder="e.g., Summer in Paris"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="ccField">
              <label className="ccLabel" htmlFor="ccDesc">Description (optional)</label>
              <textarea
                id="ccDesc"
                className="ccTextarea"
                placeholder="Add a short description for this trip (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {error && <div className="ccError" role="alert">{error}</div>}

            <div className="ccActions">
              <button
                type="submit"
                className="ccBtn ccPrimary"
                disabled={submitting || !name.trim()}
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>

      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        duration={2500}
        onClose={() => setToastOpen(false)}
      />
    </div>,
    document.body
  );
}