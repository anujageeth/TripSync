import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CSS/Home.css';

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(['.heroTitle', '.heroSubtitle', '.ctaRow'], { opacity: 0, y: 50 });
      
      const heroTl = gsap.timeline();
      heroTl
        .to('.heroTitle', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
        .to('.heroSubtitle', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.8')
        .to('.ctaRow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');

      gsap.set('.featureCard', { opacity: 0, y: 80, scale: 0.9 });
      
      ScrollTrigger.create({
        trigger: featuresRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.featureCard', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
          });
        }
      });

      gsap.set('.howItWorks h2', { opacity: 0, y: 30 });
      gsap.set('.howStep', { opacity: 0, y: 60, rotateX: 15 });

      ScrollTrigger.create({
        trigger: howItWorksRef.current,
        start: 'top 85%',
        onEnter: () => {
          const tl = gsap.timeline();
          tl
            .to('.howItWorks h2', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
            .to('.howStep', {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.8,
              stagger: 0.2,
              ease: 'power3.out'
            }, '-=0.4');
        }
      });

      gsap.set('.footerNote', { opacity: 0, y: 20 });
      
      ScrollTrigger.create({
        trigger: footerRef.current,
        start: 'top 90%',
        onEnter: () => {
          gsap.to('.footerNote', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        }
      });

      gsap.to('.homePage', {
        backgroundPosition: '50% 100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.homePage',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      document.querySelectorAll('.featureCard').forEach(card => {
        const icon = card.querySelector('.featureIcon');
        const title = card.querySelector('.featureTitle');
        
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
          gsap.to(icon, { scale: 1.2, rotation: 10, duration: 0.3, ease: 'back.out(1.7)' });
          gsap.to(title, { x: 5, duration: 0.3, ease: 'power2.out' });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, { scale: 1, duration: 0.3, ease: 'power2.out' });
          gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' });
          gsap.to(title, { x: 0, duration: 0.3, ease: 'power2.out' });
        });
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleCardClick = (path) => {
    gsap.to(window, { scrollTo: 0, duration: 0.5, ease: 'power2.inOut' });
    setTimeout(() => navigate(path), 300);
  };

  return (
    <div className="homePage">
      <div className="homeOverlay">
        <main className="homeContainer" ref={heroRef}>
          <section className="hero">
            <h1 className="heroTitle">Plan every day of your trip</h1>
            <p className="heroSubtitle">
              Create daily itineraries, estimate budgets, explore hotels, and visualize everything on the map.
            </p>
            <div className="ctaRow">
              <button className="loginBtn" onClick={() => navigate('/login')}>
                Start Planning Now
                <span className="btnIcon">✨</span>
              </button>
            </div>
          </section>

          {/* Features */}
          <section className="featuresSection" ref={featuresRef}>
            <h2 className="sectionTitle">Everything you need to plan</h2>
            <div className="featuresGrid" aria-label="Features">
              <article className="featureCard" role="button" tabIndex={0}>
                <div className="featureIcon">🗺️</div>
                <h3 className="featureTitle">Daily Planner</h3>
                <p className="featureDesc">Choose a city, pick places, select a hotel and meals, and get a daily plan.</p>
              </article>

              <article className="featureCard" role="button" tabIndex={0}>
                <div className="featureIcon">📋</div>
                <h3 className="featureTitle">My Plans</h3>
                <p className="featureDesc">Review, edit, or delete your saved plans whenever you like.</p>
              </article>

              <article className="featureCard" role="button" tabIndex={0}>
                <div className="featureIcon">📚</div>
                <h3 className="featureTitle">Collections</h3>
                <p className="featureDesc">Organize your plans into trip collections and get AI suggestions.</p>
              </article>

              <article className="featureCard" role="button" tabIndex={0}>
                <div className="featureIcon">🏨</div>
                <h3 className="featureTitle">Explore Hotels</h3>
                <p className="featureDesc">Search hotels by city, compare prices, and view available meals.</p>
              </article>

              <article className="featureCard" role="button" tabIndex={0}>
                <div className="featureIcon">🗺</div>
                <h3 className="featureTitle">Map View</h3>
                <p className="featureDesc">Open the island map to get oriented and plan your route.</p>
              </article>

              <article className="featureCard" role="button" tabIndex={0}>
                <div className="featureIcon">📊</div>
                <h3 className="featureTitle">Dashboard</h3>
                <p className="featureDesc">See recent plans and jump right back into planning.</p>
              </article>
            </div>
          </section>

          {/* How it works */}
          <section className="howItWorks" ref={howItWorksRef} aria-label="How it works">
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
                <p className="howDesc">Get an instant estimate for your day's costs.</p>
              </div>
            </div>
          </section>

          <div ref={footerRef}>
            <p className="footerNote">Ready to go? Start with a new plan or revisit your saved itineraries.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;