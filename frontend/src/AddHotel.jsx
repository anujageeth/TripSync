import React, { useEffect, useMemo, useState } from 'react';
import Toast from './components/Toast';
import './CSS/AddHotel.css';
import SearchableDropdown from './components/SearchableDropdown.jsx';
import NavBar from './NavBar';
import bgImage from './assets/hotels.png';

const AddHotel = () => {
  const [cities, setCities] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState({ cities: false, meals: false });

  const [form, setForm] = useState({
    name: '',
    cityId: '',
    address: '',
    googleMapLink: '',
    imageUrl: '',
    rating: '',
    hasPool: false,
    hasGym: false,
    description: '',
    roomPrice: '',
    phone: '',
    email: '',
  });

  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState('');

  const [selectedMeals, setSelectedMeals] = useState([]);
  const [mealDropdownValue, setMealDropdownValue] = useState('');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('info');

  const selectedCityName = useMemo(
    () => (cities.find(c => String(c._id) === String(form.cityId))?.name) || '',
    [cities, form.cityId]
  );

  const API = `${process.env.REACT_APP_BACKEND_URL}/api/catalog`;

  useEffect(() => {
    const loadCities = async () => {
      try {
        setFetching(f => ({ ...f, cities: true }));
        const res = await fetch(`${API}/cities`);
        if (!res.ok) throw new Error('Failed to load cities');
        const data = await res.json();
        setCities(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setCities([]);
      } finally {
        setFetching(f => ({ ...f, cities: false }));
      }
    };

    const loadMeals = async () => {
      try {
        setFetching(f => ({ ...f, meals: true }));
        const res = await fetch(`${API}/meals`);
        if (!res.ok) throw new Error('Failed to load meals');
        const data = await res.json();
        setMeals(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setMeals([]);
      } finally {
        setFetching(f => ({ ...f, meals: false }));
      }
    };

    loadCities();
    loadMeals();
  }, []);

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleAddFeature = () => {
    const val = (featureInput || '').trim();
    if (!val) return;
    if (!features.includes(val)) setFeatures(prev => [...prev, val]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const onCitySelect = (opt) => {
    updateField('cityId', opt?._id || '');
  };

  const handleMealSelect = (opt) => {
    if (!opt?._id) return;
    const exists = selectedMeals.some(m => m._id === opt._id);
    if (!exists) setSelectedMeals(prev => [...prev, { _id: opt._id, name: opt.name }]);
    setMealDropdownValue('');
  };

  const removeSelectedMeal = (id) => {
    setSelectedMeals(prev => prev.filter(m => m._id !== id));
  };

  const validate = () => {
    const errors = [];
    if (!form.name.trim()) errors.push('Hotel name is required');
    if (!form.cityId) errors.push('City is required');
    if (!form.address.trim()) errors.push('Address is required');
    if (!String(form.roomPrice).trim() || Number.isNaN(Number(form.roomPrice)))
      errors.push('Valid room price is required');
    if (form.rating && (Number(form.rating) < 0 || Number(form.rating) > 5))
      errors.push('Rating must be between 0 and 5');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) { 
      setToastType('error'); setToastMsg(errors.join(' ')); setToastOpen(true);
      return;
    }

    const payload = {
      name: form.name.trim(),
      city: form.cityId ? [form.cityId] : [],
      address: form.address.trim(),
      googleMapLink: form.googleMapLink.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      rating: form.rating !== '' ? Number(form.rating) : undefined,
      hasPool: !!form.hasPool,
      hasGym: !!form.hasGym,
      description: form.description.trim(),
      specialFeatures: features,
      roomPrice: Number(form.roomPrice),
      phone: form.phone.trim() || undefined,
      email: (form.email || '').trim().toLowerCase() || undefined,
      availableMeals: selectedMeals.map(m => m._id),
    };

    try {
      setLoading(true);
      console.log('POST /api/catalog/hotels payload:', payload);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/catalog/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?._id) {
        throw new Error(data?.message || 'Failed to save hotel');
      }
      console.log('Created hotel id:', data._id);

      // reset
      setForm({ name:'', cityId:'', address:'', googleMapLink:'', imageUrl:'', rating:'', hasPool:false, hasGym:false, description:'', roomPrice:'', phone:'', email:'' });
      setFeatures([]);
      setSelectedMeals([]);
      setMealDropdownValue('');
      setToastType('success'); setToastMsg('Hotel saved successfully.'); setToastOpen(true);
    } catch (err) {
      setToastType('error'); setToastMsg(err?.message || 'Error saving hotel'); setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hotelsPage" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="hotelsOverlay">
        <NavBar />
        <div className="hotelsContainer">
          <h2 className="hotelsTitle">Add Hotel</h2>

          <form className="add-hotel-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Hotel name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label>Select city</label>
              <SearchableDropdown
                options={cities}
                onSelect={onCitySelect}
                placeholder="Search city..."
                displayKey="name"
                valueKey="_id"
                value={selectedCityName}
                isLoading={fetching.cities}
              />
            </div>

            <div className="form-row">
              <label>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label>Google Map link</label>
              <input
                type="url"
                value={form.googleMapLink}
                onChange={(e) => updateField('googleMapLink', e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="form-row">
              <label>Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-row">
              <label>Available meals</label>
              <SearchableDropdown
                options={meals}
                onSelect={handleMealSelect}
                placeholder="Search meals..."
                displayKey="name"
                valueKey="_id"
                isLoading={fetching.meals}
                value={mealDropdownValue}
              />
              {selectedMeals.length > 0 && (
                <div className="selected-list">
                  {selectedMeals.map(m => (
                    <span key={m._id} className="placePill">
                      {m.name}
                      <button type="button" className="pillRemove" onClick={() => removeSelectedMeal(m._id)} aria-label="Remove">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-row">
              <label>Room price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.roomPrice}
                onChange={(e) => updateField('roomPrice', e.target.value)}
                required
              />
            </div>

            <div className="form-row two-col">
              <div>
                <label>Rating (0–5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => updateField('rating', e.target.value)}
                />
              </div>
              <div className="checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={form.hasPool}
                    onChange={(e) => updateField('hasPool', e.target.checked)}
                  />
                  Has pool
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.hasGym}
                    onChange={(e) => updateField('hasGym', e.target.checked)}
                  />
                  Has gym
                </label>
              </div>
            </div>

            <div className="form-row">
              <label>Description</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Special features</label>
              <div className="feature-input">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="Type and press Enter to add"
                />
                <button type="button" className="backBtn" onClick={handleAddFeature}>Add</button>
              </div>
              {features.length > 0 && (
                <div className="feature-list">
                  {features.map((f, i) => (
                    <span key={`${f}-${i}`} className="feature-chip">
                      {f}
                      <button type="button" onClick={() => handleRemoveFeature(i)} aria-label="Remove">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-row">
                <label>Phone</label>
                <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+94 77 123 4567"
                />
            </div>
            <div className="form-row">
                <label>Email</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="hotel@example.com"
                />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save hotel'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        duration={2500}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default AddHotel;