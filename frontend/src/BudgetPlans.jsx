import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from './NavBar';
import './CSS/BudgetPlans.css';
import { Calendar, MapPin, Building2, Wallet, ArrowRight } from 'lucide-react';

function BudgetPlans() {
    const [budgetPlans, setBudgetPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterText, setFilterText] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [textUsed, setTextUsed] = useState(false);
    const [dateUsed, setDateUsed] = useState(false);

    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchBudgetPlans = async () => {
            try {
                const response = await fetch(`http://localhost:3001/planner/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setBudgetPlans(data);
                } else {
                    console.error("Failed to fetch budget plans:", response.status);
                }
            } catch (error) {
                console.error("Error fetching budget plans:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBudgetPlans();
    }, [userId]);

    const toDateOnly = (d) => {
      try {
        const dt = new Date(d);
        return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      } catch {
        return "";
      }
    };

    const filteredPlans = useMemo(() => {
      const q = (filterText || "").toLowerCase().trim();
      const dateQ = (filterDate || "").trim();

      return budgetPlans.filter((plan) => {
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
    }, [budgetPlans, filterText, filterDate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const resetHotelSearch = () => {
      setFilterText('');
      setFilterDate('');
      setTextUsed(false);
      setDateUsed(false);
    }

    const hasAny = budgetPlans.length > 0;
    const listToShow = filteredPlans;

    return (
        <div className="budgetPage">
          <div className="budgetOverlay">
            <NavBar />
            <div className="budgetContainer">
              <h2>Your Budget Plans</h2>

              <div className="budgetFilters" role="search">
                <input
                  type="text"
                  className="budgetInput"
                  placeholder="Search by city, visiting places, or hotel"
                  value={filterText}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilterText(v);
                    setTextUsed(v.trim().length > 0);
                  }}
                  aria-label="Search plans"
                />
                <input
                  type="date"
                  className="budgetInput"
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
                    className="clearFiltersBtn"
                    onClick={resetHotelSearch}
                    aria-label="Clear filters"
                  >
                    X
                  </button>
                )}
              </div>

              {!hasAny ? (
                <p>No budget plans found.</p>
              ) : listToShow.length === 0 ? (
                <p>No plans match your filters.</p>
              ) : (
                <div className="budgetGrid">
                  {listToShow.map((plan) => {
                    const places = Array.isArray(plan.places) ? plan.places.filter(Boolean) : [];
                    const topPlaces = places.slice(0, 2);
                    const remaining = Math.max(places.length - 2, 0);
                    const budgetNumber = Number(plan.totalBudget ?? 0);

                    return (
                      <article key={plan._id} className="budgetCard">
                        <div className="budgetHeader">
                          <h3 className="budgetName">{plan.city || 'Untitled Trip'}</h3>
                          <div className="datePill" aria-label="Plan date">
                            <Calendar size={16} aria-hidden="true" />
                            <span>{new Date(plan.date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <ul className="budgetMetaList">
                          <li className="budgetMetaItem">
                            <span className="metaIcon" aria-hidden="true"><MapPin size={18} /></span>
                            <span>
                              {topPlaces.length === 0 ? '-' : topPlaces.join(', ')}
                              {remaining > 0 && `, +${remaining} more`}
                            </span>
                          </li>

                          <li className="budgetMetaItem">
                            <span className="metaIcon" aria-hidden="true"><Building2 size={18} /></span>
                            <span>{plan.hotel || '-'}</span>
                          </li>
                          <li className="budgetMetaItem">
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
            </div>
          </div>
        </div>
    );
}

export default BudgetPlans;
