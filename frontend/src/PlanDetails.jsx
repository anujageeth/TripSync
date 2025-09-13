import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from './NavBar';
import './CSS/PlanDetails.css';
import { ArrowLeft, Calendar, MapPin, Building2, Wallet, Utensils, Pencil, Trash2 } from 'lucide-react';
import HotelDetails from './HotelDetails';
import ConfirmationBox from './components/confirmationBox';

function PlanDetails() {
  const { id: planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hotelDetailsOpen, setHotelDetailsOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [initialHotel, setInitialHotel] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);     // NEW
  const [deleting, setDeleting] = useState(false);           // NEW

  useEffect(() => {
    let ignore = false;

    const uid = localStorage.getItem('userId');
    if (!uid) {
      navigate('/login');
      return;
    }

    async function loadPlan() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:3001/planner/${uid}`);
        if (!res.ok) throw new Error(`Failed to load plans (${res.status})`);
        const data = await res.json();
        if (ignore) return;

        const found =
          Array.isArray(data) &&
          data.find(
            (p) => p && (String(p._id) === String(planId) || String(p.id) === String(planId))
          );

        if (!found) {
          setError('Plan not found');
          setPlan(null);
          return;
        }

        setPlan(found);
      } catch (e) {
        if (!ignore) setError(e.message || 'Failed to load plan');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadPlan();
    return () => {
      ignore = true;
    };
  }, [planId, navigate]);

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d || '-';
    }
  };

  const formatMoney = (n) => {
    const num = typeof n === 'string' ? Number(n) : n;
    if (typeof num !== 'number' || Number.isNaN(num)) return n ?? '-';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(num);
    } catch {
      return `$${Number(num).toFixed(2)}`;
    }
  };

  const title = plan?.title || (plan?.city ? `${plan.city} Trip` : 'Trip');

  const handleDelete = () => setConfirmOpen(true);

  const confirmDelete = async () => {
    if (!plan?._id && !planId) return;
    try {
      setDeleting(true);
      const id = plan?._id || planId;
      const res = await fetch(`http://localhost:3001/planner/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to delete (${res.status})`);
      }
      setConfirmOpen(false);
      navigate('/plans');
    } catch (e) {
      alert(e.message || 'Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  const openHotelDetails = async () => {
    if (!plan?.hotel) return;
    setInitialHotel({ name: plan.hotel });
    try {
      const citiesRes = await fetch('http://localhost:3001/cities');
      const cities = await citiesRes.json();
      const cityDoc = Array.isArray(cities) ? cities.find(c => c?.name === plan.city) : null;
      if (cityDoc?._id) {
        const hotelsRes = await fetch(`http://localhost:3001/hotels?cityId=${encodeURIComponent(cityDoc._id)}`);
        const hotels = await hotelsRes.json();
        const match = Array.isArray(hotels) ? hotels.find(h => h?.name === plan.hotel) : null;
        if (match?._id) setSelectedHotelId(match._id);
      }
    } catch {
      // fallback
    } finally {
      setHotelDetailsOpen(true);
    }
  };

  const closeHotelDetails = () => {
    setSelectedHotelId('');
    setInitialHotel(null);
    setHotelDetailsOpen(false);
  };

  const renderHotelDetails = () => {
    if (!hotelDetailsOpen) return null;
    return (
      <HotelDetails
        open={hotelDetailsOpen}
        hotelId={selectedHotelId}
        initialHotel={initialHotel}
        onClose={closeHotelDetails}
      />
    );
  };

  const renderPlanContent = () => {
    if (loading) return <div className="planCard">Loading plan...</div>;
    if (error) return <div className="planCard error">Error: {error}</div>;

    return (
      <div className="planContent">
        <div className="planGrid">
          <div className="planCard">
            <h3 className="cardTitle">Overview</h3>
            <div className="kv">
              <span className="k">
                <span className="metaIcon2" aria-hidden="true"><Calendar size={16} /></span>
                Date
              </span>
              <span className="v">{formatDate(plan.date)}</span>
            </div>
            <div className="kv">
              <span className="k">
                <span className="metaIcon2" aria-hidden="true"><MapPin size={16} /></span>
                City
              </span>
              <span className="v">{plan.city || '-'}</span>
            </div>
            <div className="kv">
              <span className="k">
                <span className="metaIcon2" aria-hidden="true"><Building2 size={16} /></span>
                Hotel
              </span>
              <span className="v">
                {plan.hotel || '-'}
                {plan.hotel && (
                  <button
                    className="backBtn"
                    style={{ marginLeft: 10, padding: '4px 10px' }}
                    onClick={openHotelDetails}
                    aria-label="View hotel details"
                    type="button"
                  >
                    Details
                  </button>
                )}
              </span>
            </div>
            <div className="kv">
              <span className="k">
                <span className="metaIcon2" aria-hidden="true"><Wallet size={16} /></span>
                Total Budget
              </span>
              <span className="v" id='total-budget'>{formatMoney(plan.totalBudget)}</span>
            </div>
          </div>

          <div className="planCard">
            <h3 className="cardTitle"><MapPin id='placesIcon' size={16} /> Places</h3>
            {Array.isArray(plan.places) && plan.places.length > 0 ? (
              <ul className="pillList">
                {plan.places.map((place, idx) => (
                  <li key={idx} className="pill">{place}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">No places listed.</p>
            )}
          </div>

          <div className="planCard">
            <h3 className="cardTitle"><Utensils id='mealsIcon' size={16} /> Meals</h3>
            {plan.meals && typeof plan.meals === 'object' && Object.keys(plan.meals).length > 0 ? (
              <div className="kvList">
                {Object.entries(plan.meals).map(([key, val]) => (
                  <div key={key} className="kv">
                    <span className="k">{key}</span>
                    <span className="v">
                      {typeof val === 'number' ? formatMoney(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No meal details.</p>
            )}
          </div>
        </div>

        <div className="actionsRow">
          <button className="backBtn" onClick={() => navigate('/plans')}>View All Plans</button>
        </div>
      </div>
    );
  };

  return (
    <div className="planPage">
      <div className="planOverlay">
        <NavBar />
        <div className="planContainer">
          <div className="planHeader">
            <h1 className="planTitle">{title}</h1>
            <div className="planHeaderActions">
              <button className="backBtn" onClick={() => navigate('/plans')} aria-label="Go back">
                <ArrowLeft size={16} /> Back
              </button>
              <div style={{ display: 'inline-flex', gap: 10 }}>
                <button
                  className="backBtn"
                  onClick={() => navigate(`/plans/${plan?._id || planId}/edit`)}
                  aria-label="Edit plan"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  className="backBtn"
                  id='deletePlanBtn'
                  onClick={handleDelete}
                  aria-label="Delete plan"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>

          {renderPlanContent()}
          
          <ConfirmationBox
            open={confirmOpen}
            title="Delete this plan?"
            message="This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            onCancel={() => setConfirmOpen(false)}
            loading={deleting}
          />

          {renderHotelDetails()}
        </div>
      </div>
    </div>
  );
}

export default PlanDetails;