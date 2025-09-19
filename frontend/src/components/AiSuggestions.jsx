import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Toast from './Toast';
import '../CSS/AiSuggestions.css';

export default function AiSuggestions({ open, onClose, collection, plans, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [error, setError] = useState('');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState('info');
  const [toastMsg, setToastMsg] = useState('');

  const API = `${process.env.REACT_APP_BACKEND_URL}`;

  const showToast = (msg, type = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    setSuggestions('');
    setError('');
    setSaveMsg('');
    fetchSuggestions();
  }, [open]);

  async function fetchSuggestions() {
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API}/ai/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, plans }),
      });
      if (!resp.ok) {
        const msg = await safeJson(resp);
        throw new Error(msg?.message || `AI request failed (${resp.status})`);
      }
      const data = await resp.json();
      setSuggestions(data?.suggestions || 'No suggestions generated.');
      showToast('Suggestions generated', 'success');
    } catch (e) {
      const msg = e?.message || 'Failed to get suggestions';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function saveToDescription() {
    if (!collection?._id || !suggestions.trim()) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`${API}/collections/${encodeURIComponent(collection._id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: suggestions }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || `Failed to save (${res.status})`);
      }
      const updated = await res.json();
      setSaveMsg('Saved to collection description.');
      showToast('Saved to description', 'success');
      if (typeof onSaved === 'function') onSaved(updated);
    } catch (e) {
      const msg = e?.message || 'Unknown error';
      setSaveMsg(`Save failed: ${msg}`);
      showToast(`Save failed: ${msg}`, 'error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  }

  async function safeJson(resp) {
    try { return await resp.json(); } catch { return null; }
  }

  if (!open) return null;

  const mdToHtml = (s) => {
    const esc = String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const withBold = esc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return withBold.replace(/\n/g, '<br/>');
  };

  return (
    <div className="ccBackdrop" role="dialog" aria-modal="true" aria-labelledby="aiSuggestTitle">
      <div className="ccCard aiCard">
        <div className="ccHeader">
          <div className="ccTitleWrap">
            <h2 id="aiSuggestTitle" className="ccTitle">
              <Sparkles size={16} /> <span>AI Suggestions</span>
            </h2>
          </div>
          <div className="aiHeaderActions">
            <button className="ccCloseBtn" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="ccBody aiBody">
          {error ? <div className="errorBox">{error}</div> : null}

          <div
            className={`aiOutput ${loading ? 'thinking' : ''}`}
            aria-live="polite"
            {...(!loading ? { dangerouslySetInnerHTML: { __html: mdToHtml(suggestions || 'No suggestions yet.') } } : {})}
          >
            {loading ? 'Thinking…' : null}
          </div>

          <div className="aiToolbar">
            <button
              type="button"
              className="placeAddBtn"
              onClick={fetchSuggestions}
              disabled={loading}
            >
              {loading ? 'Generating…' : 'Regenerate'}
            </button>
            <button
              type="button"
              className="placeAddBtn"
              onClick={saveToDescription}
              disabled={loading || saving || !suggestions.trim() || !collection?._id}
              title={!suggestions.trim() ? 'Generate suggestions first' : 'Save to collection description'}
            >
              {saving ? 'Saving…' : 'Save to description'}
            </button>
            {saveMsg && <span className="aiSaveMsg">{saveMsg}</span>}
          </div>
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