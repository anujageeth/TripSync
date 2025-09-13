import React from 'react';
import './CSS/Map.css';
import NavBar from './NavBar';

function Map() {
  return (
    <div className="mapPage">
      <div className="mapOverlay">
        <NavBar />
        <div className="mapContainer">
          <h2 className="mapTitle">Sri Lanka Map</h2>
          <div className="mapWrapper" role="region" aria-label="Sri Lanka map">
            <iframe
              className="mapFrame"
              title="Sri Lanka on Google Maps"
              src="https://www.google.com/maps?q=Sri%20Lanka&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="mapHint">
            If the map doesn’t load, open it directly:
            {' '}
            <a
              href="https://www.google.com/maps/place/Sri+Lanka/"
              target="_blank"
              rel="noreferrer"
            >
              Google Maps
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Map;