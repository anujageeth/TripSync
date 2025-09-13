import React, { useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from './assets/logo2.png';
import './CSS/NavBar.css';

function NavBar() {
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userId');
    navigate('/');
  }, [navigate]);

  return (
    <header className="navbarGlass">
      <div className="navInner">
        <div className="navBrand" onClick={() => navigate('/dashboard')} role="button" tabIndex={0}
             onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard')}>
          <img src={logo} alt="TripSync" className="navBrandImg" />
        </div>
        <nav className="navLinks">
          <NavLink to="/dashboard" className="navLink">Dashboard</NavLink>
          <NavLink to="/planner" className="navLink">Create Plan</NavLink>
          <NavLink to="/plans" className="navLink">My Plans</NavLink>
          <NavLink to="/hotels" className="navLink">Hotels</NavLink>
          <NavLink to="/map" className="navLink">Map</NavLink>
          <button type="button" className="navLink navButton" onClick={handleLogout}>Logout</button>
        </nav>
      </div>
    </header>
  );
}

export default NavBar;