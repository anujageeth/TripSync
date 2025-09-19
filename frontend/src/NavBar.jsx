import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from './assets/logo2.png';
import './CSS/NavBar.css';
import Toast from './components/Toast';

function NavBar() {
  const navigate = useNavigate();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('info');

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const closeMenuAnd = (fn) => (...args) => {
    setMenuOpen(false);
    fn?.(...args);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    setToastType('success'); setToastMsg('Logged out.'); setToastOpen(true);
    setTimeout(() => navigate('/'), 800);
  }, [navigate]);

  return (
    <header className="navbarGlass" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="navInner" style={{ position: 'relative' }}>
        <div
          className="navBrand"
          onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard')}
        >
          <img src={logo} alt="TripSync" className="navBrandImg" />
        </div>

        {!isMobile && (
          <nav className="navLinks">
            <NavLink to="/dashboard" className="navLink">Dashboard</NavLink>
            <NavLink to="/planner" className="navLink">Create Plan</NavLink>
            <NavLink to="/collections" className="navLink">Travel Plans</NavLink>
            <NavLink to="/plans" className="navLink">Day Plans</NavLink>
            <NavLink to="/hotels" className="navLink">Hotels</NavLink>
            <NavLink to="/map" className="navLink">Map</NavLink>
            <NavLink to="/profile" className="navLink">Profile</NavLink>
            <button type="button" className="navLink navButton" onClick={handleLogout}>Logout</button>
          </nav>
        )}

        {isMobile && (
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="navLink navButton"
            onClick={() => setMenuOpen((v) => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
            Menu
          </button>
        )}

        {isMobile && menuOpen && (
          <>
            {/* click-away overlay */}
            <div
              onClick={() => setMenuOpen(false)}
              className="mobileDropdownOverlay"
              role="presentation"
            />
            <nav
              className="mobileDropdown"
              role="menu"
            >
              <NavLink to="/dashboard" className="mobileNavLink" onClick={closeMenuAnd(() => {})}>Dashboard</NavLink>
              <NavLink to="/planner" className="mobileNavLink" onClick={closeMenuAnd(() => {})}>Create Plan</NavLink>
              <NavLink to="/collections" className="mobileNavLink" onClick={closeMenuAnd(() => {})}>Travel Plans</NavLink>
              <NavLink to="/plans" className="mobileNavLink" onClick={closeMenuAnd(() => {})}>Day Plans</NavLink>
              <NavLink to="/hotels" className="mobileNavLink" onClick={closeMenuAnd(() => {})}>Hotels</NavLink>
              <NavLink to="/map" className="mobileNavLink" onClick={closeMenuAnd(() => {})}>Map</NavLink>
              <NavLink to="/profile" className="mobileNavLink" onClick={closeMenuAnd(() => {})}>Profile</NavLink>
              <button
                type="button"
                className="navLink navButton"
                onClick={closeMenuAnd(handleLogout)}
              >
                Logout
              </button>
            </nav>
          </>
        )}
      </div>

      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        duration={1800}
        onClose={() => setToastOpen(false)}
      />
    </header>
  );
}

export default NavBar;