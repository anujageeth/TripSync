import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import './CSS/HotelDetails.css';
import { MapPin, Mail, Phone } from 'lucide-react';

function HotelDetails({ open, hotelId, initialHotel, onClose }) {
  const [loading, setLoading] = useState(false);
  const [hotel, setHotel] = useState(initialHotel || null);
  const [error, setError] = useState(null);

  const API = `${process.env.REACT_APP_BACKEND_URL}`;

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (!hotelId) {
      setHotel(initialHotel || null);
      return;
    }

    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/hotels/${hotelId}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('details-unavailable');
        const data = await res.json();
        setHotel(data || initialHotel || null);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setHotel(initialHotel || null);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [open, hotelId, initialHotel]);

  const cityNames = useMemo(() => {
    if (!hotel) return '';
    const c = hotel.city;
    if (Array.isArray(c) && c.length) {
      if (typeof c[0] === 'object') return c.map(x => x?.name).filter(Boolean).join(', ');
    }
    return '';
  }, [hotel]);

  const mealChips = useMemo(() => {
    const arr = hotel?.availableMeals;
    if (!Array.isArray(arr) || arr.length === 0) return [];
    return arr.map((m, i) => {
      if (m && typeof m === 'object') {
        const parts = [];
        if (m.name) parts.push(m.name);
        let label = parts.join(' · ');
        if (typeof m.price === 'number') label += (label ? ' - ' : '') + `$${m.price}`;
        return label || `Meal ${i + 1}`;
      }
      return `Meal ${i + 1}`;
    });
  }, [hotel]);

  if (!open) return null;

  const close = () => onClose && onClose();

  return createPortal(
    <div className="hdBackdrop" role="dialog" aria-modal="true" onClick={close}>
      <div className="hdCard" onClick={(e) => e.stopPropagation()}>
        <div className="hdHeader">
          <div className="hdTitleWrap">
            <div className="hdTitle">{hotel?.name || 'Hotel'}</div>
            {!!hotel?.starRating && (
              <div className="hdStars">{'★'.repeat(Number(hotel.starRating))}</div>
            )}
          </div>
          <button className="hdCloseBtn" onClick={close} aria-label="Close">✕</button>
        </div>

        {loading && <div className="hdStatus">Loading details…</div>}
        {error && <div className="hdError">Failed to load details.</div>}

        {!loading && (
          <div className="hdBody">
            {hotel?.imageUrl ? (
              <div className="hdMedia">
                <img src={hotel.imageUrl} alt={hotel.name} />
              </div>
            ) : null}

            <div className="hdInfo">
              {cityNames && (
                <div className="hdRow">
                  <span className="hdLabel">City:</span>
                  <span className="hdValue">{cityNames}</span>
                </div>
              )}
              {hotel?.address && (
                <div className="hdRow">
                  <span className="hdLabel">Address:</span>
                  <span className="hdValue">{hotel.address}</span>
                </div>
              )}
              {Number.isFinite(Number(hotel?.roomPrice)) && (
                <div className="hdRow">
                  <span className="hdLabel">Room Price:</span>
                  <span className="hdValue">${Number(hotel.roomPrice)}</span>
                </div>
              )}
              {Number.isFinite(Number(hotel?.rating)) && (
                <div className="hdRow">
                  <span className="hdLabel">Rating:</span>
                  <span className="hdValue">{Number(hotel.rating).toFixed(1)} / 5</span>
                </div>
              )}
              {(hotel?.hasPool || hotel?.hasGym) && (
                <div className="hdRow">
                  <span className="hdLabel">Amenities:</span>
                  <span className="hdValue">
                    {hotel?.hasPool ? 'Swimming Pool' : null}
                    {hotel?.hasPool && hotel?.hasGym ? ' · ' : null}
                    {hotel?.hasGym ? 'Gym' : null}
                  </span>
                </div>
              )}
              {Array.isArray(hotel?.specialFeatures) && hotel.specialFeatures.length > 0 && (
                <div className="hdRow">
                  <span className="hdLabel">Features:</span>
                  <span className="hdChips">
                    {hotel.specialFeatures.map((f, i) => (
                      <span className="hdChip" key={`${f}-${i}`}>{f}</span>
                    ))}
                  </span>
                </div>
              )}
              {hotel?.description && (
                <div className="hdRow">
                  <span className="hdLabel">About:</span>
                  <span className="hdValue">{hotel.description}</span>
                </div>
              )}

              {mealChips.length > 0 ? (
                <div className="hdRow">
                  <span className="hdLabel">Meals:</span>
                  <span className="hdChips">
                    {mealChips.map((txt, i) => (
                      <span className="hdChip" key={`meal-${i}`}>{txt}</span>
                    ))}
                  </span>
                </div>
              ) : Array.isArray(hotel?.availableMeals) ? (
                <div className="hdRow">
                  <span className="hdLabel">Meals:</span>
                  <span className="hdValue">{hotel.availableMeals.length} available</span>
                </div>
              ) : null}

              {(hotel?.phone || hotel?.email) && (
                <div className="hdRow">
                  <span className="hdLabel">Contact:</span>
                  <span className="hdValue">
                    {hotel?.phone ? hotel.phone : ''}{hotel?.phone && hotel?.email ? ' · ' : ''}
                    {hotel?.email ? hotel.email : ''}
                  </span>
                </div>
              )}

              <div className="hdActions">
                {hotel?.googleMapLink && (
                  <a
                    className="hdBtn hdIconBtn"
                    href={hotel.googleMapLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open map"
                    title="Open map"
                  >
                    <MapPin size={18} aria-hidden="true" />
                    <span className="srOnly">Map</span>
                  </a>
                )}
                {hotel?.email && (
                  <a
                    className="hdBtn hdIconBtn"
                    href={`mailto:${hotel.email}`}
                    aria-label="Send email"
                    title="Send email"
                  >
                    <Mail size={18} aria-hidden="true" />
                    <span className="srOnly">Email</span>
                  </a>
                )}
                {hotel?.phone && (
                  <a
                    className="hdBtn hdIconBtn"
                    href={`tel:${hotel.phone}`}
                    aria-label="Call phone"
                    title="Call phone"
                  >
                    <Phone size={18} aria-hidden="true" />
                    <span className="srOnly">Call</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default HotelDetails;