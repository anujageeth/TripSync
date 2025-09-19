import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "./CSS/PlanCollections.css";
import { Calendar, MapPin, Wallet, Layers, ArrowRight } from "lucide-react";

function PlanCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterText, setFilterText] = useState("");
  const [textUsed, setTextUsed] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const API = `${process.env.REACT_APP_BACKEND_URL}`;

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
        const res = await fetch(`${API}/collections${qs}`);
        if (!res.ok) throw new Error(`Failed to load collections (${res.status})`);
        const data = await res.json();
        if (!ignore) setCollections(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setCollections([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [API, userId]);

  const toDate = (d) => {
    try {
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const filtered = useMemo(() => {
    const q = (filterText || "").toLowerCase().trim();
    if (!q) return collections;
    return collections.filter((c) => {
      const name = String(c.name || "").toLowerCase();
      const destinations = Array.isArray(c.destinations) ? c.destinations.join(", ").toLowerCase() : "";
      return name.includes(q) || destinations.includes(q);
    });
  }, [collections, filterText]);

  const hasAny = collections.length > 0;
  const list = filtered;

  return (
    <div className="budgetPage">
      <div className="budgetOverlay">
        <NavBar />
        <div className="budgetContainer">
          <h2>Your Trip Collections</h2>

          <div className="budgetFilters" role="search">
            <input
              type="text"
              className="budgetInput"
              placeholder="Search by collection name or destination"
              value={filterText}
              onChange={(e) => {
                const v = e.target.value;
                setFilterText(v);
                setTextUsed(v.trim().length > 0);
              }}
              aria-label="Search collections"
            />
            {textUsed && filterText.trim() && (
              <button
                type="button"
                className="clearFiltersBtn"
                onClick={() => { setFilterText(""); setTextUsed(false); }}
                aria-label="Clear filters"
              >
                X
              </button>
            )}
          </div>

          {loading ? (
            <div className="budgetGrid">
              {Array.from({ length: 4 }).map((_, i) => (
                <article key={i} className="budgetCard" aria-hidden="true">
                  <div className="budgetHeader">
                    <div className="plansSkeleton plansSkeletonTitle"></div>
                    <div className="plansSkeleton plansSkeletonPill"></div>
                  </div>
                  <ul className="budgetMetaList">
                    <li className="budgetMetaItem"><span className="plansSkeleton plansSkeletonLine" style={{ width: '70%' }} /></li>
                    <li className="budgetMetaItem"><span className="plansSkeleton plansSkeletonLine" style={{ width: '55%' }} /></li>
                    <li className="budgetMetaItem"><span className="plansSkeleton plansSkeletonLine" style={{ width: '40%' }} /></li>
                  </ul>
                  <div className="budgetFooter">
                    <div className="plansSkeleton plansSkeletonBtn"></div>
                  </div>
                </article>
              ))}
            </div>
          ) : !hasAny ? (
            <p>No collections found.</p>
          ) : list.length === 0 ? (
            <p>No collections match your filters.</p>
          ) : (
            <div className="budgetGrid">
              {list.map((c) => {
                const dests = Array.isArray(c.destinations) ? c.destinations.filter(Boolean) : [];
                const count = Array.isArray(c.dayPlans) ? c.dayPlans.length : 0;
                const total = Number(c.totalBudget || 0);
                const start = c.tripStart ? toDate(c.tripStart) : "-";
                const end = c.tripEnd ? toDate(c.tripEnd) : "-";

                return (
                  <article key={c._id} className="budgetCard">
                    <div className="budgetHeader">
                      <h3 className="budgetName">{c.name || "Untitled Collection"}</h3>
                      <div className="datePill" aria-label="Trip dates">
                        <Calendar size={16} aria-hidden="true" />
                        <span>{start} — {end}</span>
                      </div>
                    </div>

                    <ul className="budgetMetaList">
                      <li className="budgetMetaItem">
                        <span className="metaIcon" aria-hidden="true"><MapPin size={18} /></span>
                        <span>{dests.length ? dests.join(", ") : "-"}</span>
                      </li>
                      <li className="budgetMetaItem">
                        <span className="metaIcon" aria-hidden="true"><Layers size={18} /></span>
                        <span>{count} day plan{count === 1 ? "" : "s"}</span>
                      </li>
                      <li className="budgetMetaItem">
                        <span className="metaIcon" aria-hidden="true"><Wallet size={18} /></span>
                        <span>${total.toLocaleString()}</span>
                      </li>
                    </ul>

                    <div className="budgetFooter">
                      <button
                        className="budgetBtn"
                        onClick={() => navigate(`/collections/${c._id}`)}
                        aria-label={`View details for collection ${c.name || c._id}`}
                      >
                        View Collection <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanCollections;