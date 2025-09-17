import React, { useEffect, useMemo, useState } from 'react';
import './CSS/Hotels.css';
import bgImage from './assets/hotels.png';
import NavBar from './NavBar';
import HotelDetails from './HotelDetails';
import SearchableDropdown from './components/SearchableDropdown';

function Hotels() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cities, setCities] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [cityId, setCityId] = useState('');
  const [query, setQuery] = useState('');
  const [minStars, setMinStars] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsHotel, setDetailsHotel] = useState(null);

  const API = `${process.env.REACT_APP_BACKEND_URL}`;

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch(`${API}/cities`);
        if (!res.ok) throw new Error(`/cities ${res.status}: ${await res.text()}`);
        const data = await res.json();
        setCities(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Failed to load cities');
      }
    })();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const url = cityId
          ? `${API}/hotels?cityId=${encodeURIComponent(cityId)}`
          : `${API}/hotels`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`/hotels ${res.status}: ${await res.text()}`);
        const data = await res.json();
        setHotels(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load hotels');
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [cityId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const stars = Number(minStars) || 0;
    const price = Number(maxPrice) || Infinity;

    return hotels.filter(h => {
      const nameOk = q ? (h.name || '').toLowerCase().includes(q) : true;
      const starOk = stars ? (Number(h.starRating) >= stars) : true;
      const priceOk = Number.isFinite(Number(h.roomPrice)) ? (Number(h.roomPrice) <= price) : true;
      return nameOk && starOk && priceOk;
    });
  }, [hotels, query, minStars, maxPrice]);

  const formatCities = (h) => {
    if (Array.isArray(h.city) && h.city.length && typeof h.city[0] === 'object') {
      return h.city.map(c => c.name).join(', ');
    }
    return '';
  };

  const onCitySelect = (option) => {
    setCityId(option?._id || '');
  };

  const selectedCityName = useMemo(
    () => (cities.find(c => String(c._id) === String(cityId))?.name) || '',
    [cities, cityId]
  );

  return (
    <div className="hotelsPage" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="hotelsOverlay">
        <NavBar />
        <div className="hotelsContainer">
          <h2 className="hotelsTitle">Find Hotels</h2>

          <div className="hotelsFilters">
            <SearchableDropdown
              options={cities}
              onSelect={onCitySelect}
              placeholder="Search city"
              displayKey="name"
              valueKey="_id"
              value={selectedCityName}
            />

            <input
              className="hotelsInput"
              type="text"
              placeholder="Search by hotel name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <input
              className="hotelsInput"
              type="number"
              min="0"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          
          {loading && <div className="hotelsStatus">Loading hotels...</div>}
          {error && <div className="hotelsError">Error: {error}</div>}

          {!loading && !error && (
            <div className="hotelsGrid">
              {filtered.length === 0 && (
                <div className="hotelsStatus">No hotels found.</div>
              )}

              {filtered.map(h => (
                <div className="hotelCard" key={h._id}>
                  <div className="hotelHeader">
                    <div className="hotelName">{h.name}</div>
                    {h.starRating ? (
                      <div className="hotelStars">{'★'.repeat(h.starRating)}</div>
                    ) : null}
                  </div>

                  <div className="hotelMeta">
                    {formatCities(h) && <div className="hotelCity">{formatCities(h)}</div>}
                    {Number.isFinite(Number(h.roomPrice)) && (
                      <div className="hotelPrice">${Number(h.roomPrice)}</div>
                    )}
                  </div>

                  <div className="hotelFooter">
                    <button
                      className="hotelLink"
                      type="button"
                      onClick={() => { setDetailsHotel(h); setDetailsOpen(true); }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <HotelDetails
          open={detailsOpen}
          hotelId={detailsHotel?._id}
          initialHotel={detailsHotel}
          onClose={() => setDetailsOpen(false)}
        />
      </div>
    </div>
  );
}

export default Hotels;