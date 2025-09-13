import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Home.css';
import NavBar from './NavBar';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="homePage">
      <div className="homeOverlay">
        <main className="homeContainer">
          <section className="hero">
            <h1 className="heroTitle">Plan every day of your trip</h1>
            <p className="heroSubtitle">
              Create daily itineraries, estimate budgets, explore hotels, and visualize everything on the map.
            </p>
            <div className="ctaRow">
              <button className="loginBtn" onClick={() => navigate('/login')}>Start here!</button>
            </div>
          </section>

          {/* Features */}
          <section className="featuresGrid" aria-label="Features">
            <article className="featureCard" role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/planner')}>
              <div className="featureIcon">🗺️</div>
              <h3 className="featureTitle">Daily Planner</h3>
              <p className="featureDesc">Choose a city, pick places, select a hotel and meals, and get a daily plan.</p>
            </article>

            <article className="featureCard" role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/plans')}>
              <div className="featureIcon">📋</div>
              <h3 className="featureTitle">My Plans</h3>
              <p className="featureDesc">Review, edit, or delete your saved plans whenever you like.</p>
            </article>

            <article className="featureCard" role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/hotels')}>
              <div className="featureIcon">🏨</div>
              <h3 className="featureTitle">Explore Hotels</h3>
              <p className="featureDesc">Search hotels by city, compare prices, and view available meals.</p>
            </article>

            <article className="featureCard" role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/map')}>
              <div className="featureIcon">🗺</div>
              <h3 className="featureTitle">Map View</h3>
              <p className="featureDesc">Open the island map to get oriented and plan your route.</p>
            </article>

            <article className="featureCard" role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard')}>
              <div className="featureIcon">📊</div>
              <h3 className="featureTitle">Dashboard</h3>
              <p className="featureDesc">See recent plans and jump right back into planning.</p>
            </article>

            <article className="featureCard" role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}>
              <div className="featureIcon">👤</div>
              <h3 className="featureTitle">Profile</h3>
              <p className="featureDesc">Manage your account details and password.</p>
            </article>
          </section>

          {/* How it works */}
          <section className="howItWorks" aria-label="How it works">
            <h2>How it works</h2>
            <div className="howGrid">
              <div className="howStep">
                <div className="howIcon">📍</div>
                <h4 className="howTitle">Pick destination</h4>
                <p className="howDesc">Select a city and add the places you want to visit.</p>
              </div>
              <div className="howStep">
                <div className="howIcon">🏨</div>
                <h4 className="howTitle">Choose stay & meals</h4>
                <p className="howDesc">Pick a hotel and available meals to fit your day.</p>
              </div>
              <div className="howStep">
                <div className="howIcon">💰</div>
                <h4 className="howTitle">Estimate budget</h4>
                <p className="howDesc">Get an instant estimate for your day’s costs.</p>
              </div>
            </div>
          </section>

          <p className="footerNote">Ready to go? Start with a new plan or revisit your saved itineraries.</p>
        </main>
      </div>
    </div>
  );
}

export default Home;