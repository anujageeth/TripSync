import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import './CSS/Dashboard.css';
import { Map, List, Building2, User } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();

  const [recentPlans, setRecentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const uid = localStorage.getItem('userId');
    if (!uid) {
      navigate('/login');
      return;
    }

    async function loadPlans() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:3001/planner/${uid}`);
        if (!res.ok) throw new Error(`Failed to load plans (${res.status})`);
        const data = await res.json();

        if (ignore) return;

        const mapped = (Array.isArray(data) ? data : [])
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map((p, idx) => ({
            id: p._id || idx,
            title: p.title || `${p.city} Trip`,
            date: p.date,
            destinations:
              Array.isArray(p.places) && p.places.length > 0
                ? p.places
                : [p.city].filter(Boolean),
          }));

        setRecentPlans(mapped);
      } catch (e) {
        if (!ignore) setError(e.message || 'Failed to load plans');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadPlans();
    return () => {
      ignore = true;
    };
  }, [navigate]);

  return (
    <div className="dashboardPage">
      <div className="dashboardOverlay">
        <NavBar />
        <div className="dashboardContainer">
          <header className="dashHeader">
            <div className="dashIntro">
              <h1>Welcome back 👋</h1>
              <p>Plan, track, and revisit your adventures in one place.</p>
            </div>
            <button
              className="primaryBtn"
              onClick={() => navigate('/planner')}
            >
              + Create Plan
            </button>
          </header>

          <section className="quickActions">
            <div
              className="qaCard"
              onClick={() => navigate('/planner')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/planner')}
              aria-label="Create a new travel plan"
            >
              <div className="qaIcon" aria-hidden="true"><Map size={28} /></div>
              <h3>Create Plan</h3>
            </div>

            <div
              className="qaCard"
              onClick={() => navigate('/plans')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/plans')}
              aria-label="View saved plans"
            >
              <div className="qaIcon" aria-hidden="true"><List size={28} /></div>
              <h3>My Plans</h3>
            </div>

            <div
              className="qaCard"
              onClick={() => navigate('/hotels')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/hotels')}
              aria-label="Get hotel details"
            >
              <div className="qaIcon" aria-hidden="true"><Building2 size={28} /></div>
              <h3>Hotels</h3>
            </div>

            <div
              className="qaCard"
              onClick={() => navigate('/profile')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
              aria-label="Open profile settings"
            >
              <div className="qaIcon" aria-hidden="true"><User size={28} /></div>
              <h3>Profile</h3>
            </div>
          </section>

          <section className="recentSection">
            <div className="sectionHeader">
              <h2>Recent Plans</h2>
              <button className="secondaryBtn" id='viewAllPlans' onClick={() => navigate('/plans')}>
                View all
              </button>
            </div>

            <div className="plansList">
              {loading && <div className="planItem">Loading plans...</div>}
              {!loading && error && <div className="planItem">Error: {error}</div>}
              {!loading && !error && recentPlans.length === 0 && (
                <div className="planItem">No plans yet. Create your first plan!</div>
              )}
              {!loading && !error && recentPlans.map(plan => (
                <div key={plan.id} className="planItem">
                  <div className="planInfo">
                    <h4>{plan.title}</h4>
                    <p className="planMeta">
                      {new Date(plan.date).toLocaleDateString()} • {plan.destinations.join(', ')}
                    </p>
                  </div>
                  <div className="planActions">
                    <button
                      className="miniBtn"
                      onClick={() => navigate(`/plans/${plan.id}`)}
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;