import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from './NavBar';
import './CSS/CollectionDetails.css';
import { Calendar, MapPin, Building2, Wallet, Layers, ArrowRight, Plus, Edit3, Trash2, Sparkles, MoreVertical } from 'lucide-react';
import CreateCollection from './components/CreateCollection';
import ConfirmationBox from './components/confirmationBox';
import AiSuggestions from './components/AiSuggestions';

function CollectionDetails() {
  const { id: collectionId } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [resolvedPlans, setResolvedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [filterText, setFilterText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [textUsed, setTextUsed] = useState(false);
  const [dateUsed, setDateUsed] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);

  const API = `${process.env.REACT_APP_BACKEND_URL}`;

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!collectionId) return;
      setLoading(true);
      setLoadError('');
      try {
        const res = await fetch(`${API}/collections/${encodeURIComponent(collectionId)}`);
        if (!res.ok) throw new Error(`Failed to load collection (${res.status})`);
        const data = await res.json();
        if (!ignore) setCollection(data);
      } catch (e) {
        if (!ignore) setLoadError(e?.message || 'Failed to load collection');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [API, collectionId]);

  useEffect(() => {
    let ignore = false;
    async function resolvePlans() {
      const raw = Array.isArray(collection?.dayPlans) ? collection.dayPlans : [];
      if (!raw.length) { if (!ignore) setResolvedPlans([]); return; }

      const entries = raw
        .map((p) =>
          p && typeof p === 'object'
            ? { id: String(p._id || p.id || ''), obj: p }
            : { id: String(p || ''), obj: null }
        )
        .filter(e => e.id);

      const needFetch = entries
        .filter(({ obj }) => !obj || !Array.isArray(obj.places) || typeof obj.hotel === 'undefined')
        .map(e => e.id);

      let fetchedMap = new Map();
      if (needFetch.length) {
        try {
          const fetched = await Promise.all(
            needFetch.map(async (id) => {
              try {
                const r = await fetch(`${API}/planner/plan/${encodeURIComponent(id)}`);
                if (!r.ok) return null;
                return await r.json();
              } catch {
                return null;
              }
            })
          );
          fetchedMap = new Map(fetched.filter(Boolean).map(p => [String(p._id), p]));
        } catch {
          // ignore
        }
      }

      const merged = entries.map(({ id, obj }) => fetchedMap.get(id) || obj).filter(Boolean);
      if (!ignore) setResolvedPlans(merged);
    }
    resolvePlans();
    return () => { ignore = true; };
  }, [API, collection]);

  function toDateOnly(d) {
    try {
      const dt = new Date(d);
      return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }
  function fmtDate(d) {
    try {
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString();
    } catch { return ""; }
  }

  const filteredPlans = useMemo(() => {
    const q = (filterText || "").toLowerCase().trim();
    const dateQ = (filterDate || "").trim();

    return resolvedPlans.filter((plan) => {
      const city = String(plan.city || "").toLowerCase();
      const hotel = String(plan.hotel || "").toLowerCase();
      const places = Array.isArray(plan.places) ? plan.places.map(p => String(p || "").toLowerCase()) : [];

      const textMatch =
        !q ||
        city.includes(q) ||
        hotel.includes(q) ||
        places.some(p => p.includes(q));

      const dOnly = toDateOnly(plan.date);
      const dateMatch = !dateQ || dOnly === dateQ;

      return textMatch && dateMatch;
    });
  }, [resolvedPlans, filterText, filterDate]);

  const resetFilters = () => {
    setFilterText(''); setFilterDate('');
    setTextUsed(false); setDateUsed(false);
  };

  const name = collection?.name || 'Trip Collection';
  const destinations = Array.isArray(collection?.destinations) ? collection.destinations.filter(Boolean) : [];
  const tripStart = collection?.tripStart ? fmtDate(collection.tripStart) : '-';
  const tripEnd = collection?.tripEnd ? fmtDate(collection.tripEnd) : '-';
  const total = Number(collection?.totalBudget || 0);
  const plansCount = resolvedPlans.length;

  function collapseText(s, max = 400) {
    const str = String(s || '');
    if (str.length <= max) return { text: str, isTruncated: false };
    const slice = str.slice(0, max);
    const cutAt = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf(' '));
    return { text: slice.slice(0, cutAt > 200 ? cutAt : max) + '…', isTruncated: true };
  }

  const aboutRaw = collection?.description || '';
  const { text: aboutCollapsed, isTruncated } = collapseText(aboutRaw, 500);
  const aboutToShow = showFullAbout ? aboutRaw : aboutCollapsed;

  const openEdit = () => {
    setEditName(collection?.name || '');
    setEditDesc(collection?.description || '');
    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const newName = (editName || '').trim();
    if (!newName) return;
    try {
      setSavingEdit(true);
      const res = await fetch(`${API}/collections/${encodeURIComponent(collectionId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: (editDesc || '').trim(),
        }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || `Update failed (${res.status})`);
      }
      const updated = await res.json();
      setCollection(updated);
      setEditOpen(false);
    } catch (err) {
      alert(err?.message || 'Failed to update collection');
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API}/collections/${encodeURIComponent(collectionId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || `Delete failed (${res.status})`);
      }
      setConfirmOpen(false);
      navigate('/collections');
    } catch (err) {
      setConfirmOpen(false);
      alert(err?.message || 'Failed to delete collection');
    }
  };

  const handleCreatePlan = () => {
    try { sessionStorage.setItem('preselectCollectionId', String(collectionId)); } catch {}
    setActionsOpen(false);
    navigate('/planner');
  };
  const handleEditCollection = () => { setActionsOpen(false); openEdit(); };
  const handleDeleteCollection = () => { setActionsOpen(false); setConfirmOpen(true); };
  const handleSuggestions = () => {
    setActionsOpen(false);
    setAiOpen(true);
  };

  useEffect(() => {
    function onDocClick(e) {
      if (!actionsRef.current) return;
      if (!actionsRef.current.contains(e.target)) setActionsOpen(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') setActionsOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const mdToHtml = (s) => {
    const esc = String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const withBold = esc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return withBold.replace(/\n/g, '<br/>');
  };

  return (
    <div className="collectionPage">
      <div className="collectionOverlay">
        <NavBar />
        <div className="collectionContainer">
          {loading ? (
            <>
              <div className="collectionHeader">
                <div className="skeleton skeletonTitle" />
                <div className="headerMeta">
                  <div className="skeleton skeletonPill" />
                </div>
              </div>
              <div className="collectionMeta">
                <div className="skeleton skeletonLine" style={{ width: '60%' }} />
                <div className="skeleton skeletonLine" style={{ width: '50%' }} />
                <div className="skeleton skeletonLine" style={{ width: '40%' }} />
              </div>
              <div className="plansGrid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <article key={i} className="planCard" aria-hidden="true">
                    <div className="planHeader">
                      <div className="skeleton skeletonTitleSm" />
                      <div className="skeleton skeletonPill" />
                    </div>
                    <ul className="planMetaList">
                      <li className="planMetaItem"><span className="skeleton skeletonLine" style={{ width: '70%' }} /></li>
                      <li className="planMetaItem"><span className="skeleton skeletonLine" style={{ width: '55%' }} /></li>
                      <li className="planMetaItem"><span className="skeleton skeletonLine" style={{ width: '40%' }} /></li>
                    </ul>
                    <div className="planFooter">
                      <div className="skeleton skeletonBtn"></div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : loadError ? (
            <div className="errorBox">Error: {loadError}</div>
          ) : (
            <>
              <div className="collectionHeaderContainer">
                <div className="collectionHeader">
                  <h2 className="collectionTitle">{name}</h2>
                  <div className="headerMeta">
                    <div className="pill">
                      <Calendar size={16} aria-hidden="true" />
                      <span>{tripStart} — {tripEnd}</span>
                    </div>
                    <div className="pill">
                      <Layers size={16} aria-hidden="true" />
                      <span>{plansCount} day plan{plansCount === 1 ? '' : 's'}</span>
                    </div>
                    <div className="pill">
                      <Wallet size={16} aria-hidden="true" />
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="collectionMeta">
                  <div className="metaRow">
                    <span className="metaIcon"><MapPin size={18} /></span>
                    <span className="metaValue">{destinations.length ? destinations.join(', ') : '-'}</span>
                  </div>
                  {collection?.description ? (
                    <div className="aboutBlock">
                      <div className="metaLabel">About</div>
                      <div
                        className="metaValue"
                        dangerouslySetInnerHTML={{ __html: mdToHtml(aboutToShow) }}
                      />
                      {(isTruncated || showFullAbout) && (
                        <button
                          type="button"
                          onClick={() => setShowFullAbout(v => !v)}
                          aria-expanded={showFullAbout}
                          className="linkBtn"
                          style={{ background: 'transparent', border: 'none', color: '#fff766ff', cursor: 'pointer', padding: 0, marginTop: 6 }}
                        >
                          {showFullAbout ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Desktop actions */}
                <div className="collectionOptions">
                  <button
                    type="button"
                    className="iconBtn"
                    title="Create new plan"
                    onClick={handleCreatePlan}
                  >
                    <Plus size={20} />
                  </button>

                  <button
                    type="button"
                    className="iconBtn"
                    title="Edit collection"
                    onClick={handleEditCollection}
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    type="button"
                    className="iconBtn"
                    title="Delete collection"
                    onClick={handleDeleteCollection}
                    id="deleteCollectionBtn"
                  >
                    <Trash2 size={18} />
                  </button>

                  <button
                    type="button"
                    className="iconBtn"
                    id="aiSuggestBtn"
                    title="AI suggestions"
                    onClick={handleSuggestions}
                  >
                    <Sparkles size={18} />
                    <span className="btnLabel">Get Suggestions</span>
                  </button>
                </div>

                {/* Mobile actions */}
                <div className="moreActions" ref={actionsRef}>
                  <button
                    type="button"
                    className="moreBtn"
                    aria-haspopup="menu"
                    aria-expanded={actionsOpen}
                    aria-controls="collectionActionsMenu"
                    onClick={() => setActionsOpen(o => !o)}
                  >
                    <MoreVertical size={20} aria-hidden="true" />
                  </button>
                  {actionsOpen && (
                    <div id="collectionActionsMenu" className="menuDropdown" role="menu">
                      <button className="menuItem" role="menuitem" onClick={handleCreatePlan}>
                        <Plus size={16} /> <span>Create plan</span>
                      </button>
                      <button className="menuItem" role="menuitem" onClick={handleEditCollection}>
                        <Edit3 size={16} /> <span>Edit collection</span>
                      </button>
                      <button className="menuItem danger" role="menuitem" onClick={handleDeleteCollection}>
                        <Trash2 size={16} /> <span>Delete collection</span>
                      </button>
                      <button className="menuItem" role="menuitem" onClick={handleSuggestions}>
                        <Sparkles size={16} /> <span>Get suggestions</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="filters" role="search">
                <input
                  type="text"
                  className="input"
                  placeholder="Search day plans by city, places, or hotel"
                  value={filterText}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilterText(v);
                    setTextUsed(v.trim().length > 0);
                  }}
                  aria-label="Search day plans"
                />
                <input
                  type="date"
                  className="input"
                  value={filterDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilterDate(v);
                    setDateUsed(v.trim().length > 0);
                  }}
                  aria-label="Filter by date"
                />
                {((textUsed && filterText.trim()) || (dateUsed && filterDate.trim())) && (
                  <button
                    type="button"
                    className="clearBtn"
                    onClick={resetFilters}
                    aria-label="Clear filters"
                  >
                    X
                  </button>
                )}
              </div>

              {filteredPlans.length === 0 ? (
                <p>No day plans match your filters.</p>
              ) : (
                <div className="plansGrid">
                  {filteredPlans.map((plan) => {
                    const places = Array.isArray(plan.places)
                      ? plan.places.map(p => (typeof p === 'string' ? p : p?.name)).filter(Boolean)
                      : [];
                    const topPlaces = places.slice(0, 2);
                    const remaining = Math.max(places.length - 2, 0);
                    const budgetNumber = Number(plan.totalBudget ?? 0);

                    return (
                      <article key={plan._id} className="planCard">
                        <div className="budgetHeader">
                          <h3 className="budgetName">{plan.city || 'Untitled Day'}</h3>
                          <div className="datePill" aria-label="Plan date">
                            <Calendar size={16} aria-hidden="true" />
                            <span>{fmtDate(plan.date)}</span>
                          </div>
                        </div>

                        <ul className="planMetaList">
                          <li className="planMetaItem">
                            <span className="metaIcon" aria-hidden="true"><MapPin size={18} /></span>
                            <span>
                              {topPlaces.length === 0 ? '-' : topPlaces.join(', ')}
                              {remaining > 0 && `, +${remaining} more`}
                            </span>
                          </li>

                          <li className="planMetaItem">
                            <span className="metaIcon" aria-hidden="true"><Building2 size={18} /></span>
                            <span>{plan.hotel || '-'}</span>
                          </li>
                          <li className="planMetaItem">
                            <span className="metaIcon" aria-hidden="true"><Wallet size={18} /></span>
                            <span>${budgetNumber.toLocaleString()}</span>
                          </li>
                        </ul>

                        <div className="budgetFooter">
                          <button
                            className="budgetBtn"
                            onClick={() => navigate(`/plans/${plan._id}`)}
                            aria-label={`View details for plan ${plan.city || plan._id}`}
                          >
                            View Details <ArrowRight size={16} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {editOpen && (
                <div className="ccBackdrop" role="dialog" aria-modal="true" aria-labelledby="ccTitle">
                  <div className="ccCard">
                    <div className="ccHeader">
                      <div className="ccTitleWrap">
                        <h2 id="ccTitle" className="ccTitle">Edit Collection</h2>
                      </div>
                      <button className="ccCloseBtn" onClick={() => setEditOpen(false)} aria-label="Close">✕</button>
                    </div>

                    <form className="ccBody" onSubmit={submitEdit}>
                      <div className="ccLeft">
                        <div className="ccField">
                          <label className="ccLabel" htmlFor="editName">Trip name</label>
                          <input
                            id="editName"
                            className="ccInput"
                            type="text"
                            placeholder="Collection name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>

                        <div className="ccField">
                          <label className="ccLabel" htmlFor="editDesc">Description (optional)</label>
                          <textarea
                            id="editDesc"
                            className="ccTextarea"
                            placeholder="Add a short description for this trip (optional)"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={4}
                          />
                        </div>

                        <div className="ccActions">
                          {/* <button
                            type="button"
                            className="ccBtn"
                            onClick={() => setEditOpen(false)}
                            disabled={savingEdit}
                          >
                            Cancel
                          </button> */}
                          <button
                            type="submit"
                            className="ccBtn ccPrimary"
                            disabled={savingEdit || !editName.trim()}
                          >
                            {savingEdit ? 'Saving…' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <ConfirmationBox
                open={confirmOpen}
                title="Delete this collection?"
                message="This will remove the collection but keep all day plans. This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
                loading={false}
              />

              <AiSuggestions
                open={aiOpen}
                onClose={() => setAiOpen(false)}
                collection={collection}
                plans={resolvedPlans}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollectionDetails;
