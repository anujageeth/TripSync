import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "./NavBar";
import "./CSS/Planner.css";
import SearchableDropdown from "./components/SearchableDropdown";
import HotelDetails from "./HotelDetails";
import Toast from "./components/Toast";
import CreateCollection from "./components/CreateCollection";

function EditPlan() {
  const navigate = useNavigate();
  const { id: planId } = useParams();

  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [cityId, setCityId] = useState("");
  const [places, setPlaces] = useState([{ name: "" }]);

  const [hotel, setHotel] = useState("");
  const [selectedHotelId, setSelectedHotelId] = useState("");

  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [otherMeals, setOtherMeals] = useState("");

  const [budget, setBudget] = useState(0);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [hotelDetailsOpen, setHotelDetailsOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('info');

  const [cities, setCities] = useState([]);
  const [placeOptions, setPlaceOptions] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [mealsByType, setMealsByType] = useState({ Breakfast: [], Lunch: [], Dinner: [], Other: [] });
  const [hotelMealsByType, setHotelMealsByType] = useState({ Breakfast: [], Lunch: [], Dinner: [], Other: [] });

  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [originalCollectionId, setOriginalCollectionId] = useState(null);

  const findHotel = (id) => hotels.find((h) => String(h._id) === String(id));
  const findMealByName = (type, name) => {
    if (!name) return undefined;
    const list = (selectedHotelId ? hotelMealsByType[type] : mealsByType[type]) || [];
    return list.find((m) => m.name === name);
  };

  const getISODateOnly = (d) => {
    try { return new Date(d).toISOString().slice(0, 10); } catch { return ""; }
  };

  const API = `${process.env.REACT_APP_BACKEND_URL}`;
  const currentUserId = localStorage.getItem("userId");

  const isValidObjectId = (s) => typeof s === 'string' && /^[0-9a-fA-F]{24}$/.test(s);
  const fetchCollections = async () => {
    try {
      const qs = isValidObjectId(currentUserId) ? `?userId=${encodeURIComponent(currentUserId)}` : '';
      const res = await fetch(`${API}/collections${qs}`);
      if (!res.ok) {
        if (qs) {
          const resAll = await fetch(`${API}/collections`);
          if (!resAll.ok) throw new Error(`Failed to load collections (${resAll.status})`);
          const all = await resAll.json();
          setCollections(Array.isArray(all) ? all : []);
          return;
        }
        throw new Error(`Failed to load collections (${res.status})`);
      }
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load collections', e);
      setCollections([]);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [citiesRes, mealsRes] = await Promise.all([
          fetch(`${API}/cities`),
          fetch(`${API}/meals`),
        ]);
        const citiesData = await citiesRes.json();
        const mealsData = await mealsRes.json();
        setCities(Array.isArray(citiesData) ? citiesData : []);
        const grouped = { Breakfast: [], Lunch: [], Dinner: [], Other: [] };
        (Array.isArray(mealsData) ? mealsData : []).forEach((m) => {
          if (grouped[m.type]) grouped[m.type].push(m);
        });
        setMealsByType(grouped);
      } catch (e) {
        console.error("Failed to load base lists", e);
      }
    })();
  }, []);

  // Load plan
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        if (!planId) {
          setLoadError("Missing plan id");
          setLoading(false);
          return;
        }
        setLoading(true);
        setLoadError(null);
        const res = await fetch(`${API}/planner/plan/${encodeURIComponent(planId)}`);
        if (!res.ok) throw new Error(`Failed to load plan (${res.status})`);
        const found = await res.json();
        if (ignore) return;

        setDate(getISODateOnly(found.date));
        setCity(found.city || "");
        setPlaces(
          Array.isArray(found.places) && found.places.length
            ? found.places.map((n) => ({ name: n }))
            : [{ name: "" }]
        );
        setHotel(found.hotel || "");
        setBreakfast(found.meals?.breakfast || "");
        setLunch(found.meals?.lunch || "");
        setDinner(found.meals?.dinner || "");
        setOtherMeals(found.meals?.other || "");
        setBudget(typeof found.totalBudget === "number" ? found.totalBudget : 0);
      } catch (e) {
        if (!ignore) setLoadError(e.message || "Failed to load plan");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [planId]);

  useEffect(() => {
    fetchCollections();
  }, [API]);

  useEffect(() => {
    if (!planId || !collections.length) return;
    const match = collections.find(c =>
      Array.isArray(c.dayPlans) &&
      c.dayPlans.some(dp => String((typeof dp === 'string' ? dp : dp?._id)) === String(planId))
    );
    setSelectedCollection(match || null);
    setOriginalCollectionId(match?._id || null);
  }, [planId, collections]);

  useEffect(() => {
    if (city && !cityId && Array.isArray(cities) && cities.length) {
      const match = cities.find((c) => c.name === city);
      if (match?._id) setCityId(match._id);
    }
  }, [cities, city, cityId]);

  useEffect(() => {
    if (!cityId) {
      setPlaceOptions([]);
      setHotels([]);
      setSelectedHotelId("");
      return;
    }
    (async () => {
      try {
        const [placesRes, hotelsRes] = await Promise.all([
          fetch(`${API}/cities/${encodeURIComponent(cityId)}/places`),
          fetch(`${API}/hotels?cityId=${encodeURIComponent(cityId)}`),
        ]);
        const placesData = await placesRes.json();
        const hotelsData = await hotelsRes.json();
        setPlaceOptions(Array.isArray(placesData) ? placesData : []);
        setHotels(Array.isArray(hotelsData) ? hotelsData : []);
      } catch (e) {
        console.error("Failed to load city dependencies", e);
      }
    })();
  }, [cityId]);

  useEffect(() => {
    if (hotel && hotels.length) {
      const match = hotels.find((h) => h.name === hotel);
      if (match?._id) setSelectedHotelId(match._id);
    }
  }, [hotel, hotels]);

  useEffect(() => {
    if (!selectedHotelId) {
      setHotelMealsByType({ Breakfast: [], Lunch: [], Dinner: [], Other: [] });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}/hotels/${encodeURIComponent(selectedHotelId)}`);
        if (!res.ok) throw new Error(`Failed to load hotel ${selectedHotelId}`);
        const data = await res.json();
        const available = Array.isArray(data.availableMeals) ? data.availableMeals : [];
        const grouped = { Breakfast: [], Lunch: [], Dinner: [], Other: [] };
        available.forEach((m) => { if (grouped[m.type]) grouped[m.type].push(m); });
        setHotelMealsByType(grouped);
      } catch (e) {
        console.error("Failed to load hotel details", e);
        setHotelMealsByType({ Breakfast: [], Lunch: [], Dinner: [], Other: [] });
      }
    })();
  }, [selectedHotelId]);

  const calculateBudget = () => {
    const hotelPrice = selectedHotelId ? (findHotel(selectedHotelId)?.roomPrice || 0) : 0;
    const breakfastPrice = breakfast ? (findMealByName("Breakfast", breakfast)?.price || 0) : 0;
    const lunchPrice = lunch ? (findMealByName("Lunch", lunch)?.price || 0) : 0;
    const dinnerPrice = dinner ? (findMealByName("Dinner", dinner)?.price || 0) : 0;
    const otherMealsPrice = otherMeals ? (findMealByName("Other", otherMeals)?.price || 0) : 0;
    const totalCost =
      Number(hotelPrice) + Number(breakfastPrice) + Number(lunchPrice) + Number(dinnerPrice) + Number(otherMealsPrice);
    setBudget(Number.isFinite(totalCost) ? totalCost : 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const placeNames = places.map((p) => p.name).filter(Boolean);
    if (!date || !city || !hotel || placeNames.length === 0) {
      alert("Please fill in date, city, at least one place and a hotel.");
      return;
    }
    calculateBudget();
  };

  const handleUpdate = async () => {
    const placeNames = places.map((p) => p.name).filter(Boolean);
    if (!date || !city || !hotel || placeNames.length === 0) {
      setToastType('error'); setToastMsg('Fill in date, city, at least one place and a hotel.'); setToastOpen(true);
      return;
    }
    if (budget === 0) calculateBudget();

    const payload = {
      date, city, places: placeNames, hotel,
      meals: { breakfast, lunch, dinner, other: otherMeals },
      totalBudget: budget,
      userId: localStorage.getItem("userId"),
    };

    try {
      const res = await fetch(`${API}/planner/${encodeURIComponent(planId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Update failed (${res.status})`);
      }

      if (selectedCollection?._id) {
        try {
          const existingIds = Array.isArray(selectedCollection.dayPlans)
            ? selectedCollection.dayPlans.map(dp => (typeof dp === 'string' ? dp : dp?._id)).filter(Boolean)
            : [];
          const mergedIds = Array.from(new Set([...existingIds.map(String), String(planId)]));

          const patchRes = await fetch(`${API}/collections/${encodeURIComponent(selectedCollection._id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayPlanIds: mergedIds }),
          });

          if (patchRes.ok) {
            const updatedCollection = await patchRes.json();
            setCollections(prev => prev.map(c => String(c._id) === String(updatedCollection._id) ? updatedCollection : c));
            setSelectedCollection(updatedCollection);
          } else {
            const msg = await patchRes.json().catch(() => ({}));
            setToastType('error'); setToastMsg(msg?.message || 'Plan updated, but failed to update its collection.'); setToastOpen(true);
          }
        } catch {
          setToastType('error'); setToastMsg('Plan updated, but failed to update its collection.'); setToastOpen(true);
        }
      }

      if (originalCollectionId && (!selectedCollection?._id || String(selectedCollection._id) !== String(originalCollectionId))) {
        const original = collections.find(c => String(c._id) === String(originalCollectionId));
        if (original) {
          try {
            const remainingIds = (Array.isArray(original.dayPlans) ? original.dayPlans : [])
              .map(dp => (typeof dp === 'string' ? dp : dp?._id))
              .filter(id => id && String(id) !== String(planId));

            await fetch(`${API}/collections/${encodeURIComponent(original._id)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dayPlanIds: remainingIds }),
            });
          } catch {
          }
        }
      }

      setMessage("Plan updated successfully!");
      setToastType('success'); setToastMsg('Plan updated successfully.'); setToastOpen(true);
      setTimeout(() => navigate(`/plans/${planId}`), 900);
    } catch (e) {
      setToastType('error'); setToastMsg(e?.message || 'Error updating plan.'); setToastOpen(true);
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  const onCitySelect = (option) => {
    const id = option?._id || "";
    const name = option?.name || "";
    setCityId(id);
    setCity(name);
    setPlaces([{ name: "" }]);
    setHotel(""); setSelectedHotelId("");
    setBreakfast(""); setLunch(""); setDinner(""); setOtherMeals("");
    setBudget(0);
  };
  const onPlaceSelect = (option) => {
    if (!option) return;
    const name = option?.name || "";
    if (!name) return;
    setPlaces((prev) => {
      const clean = prev.filter((p) => p && p.name);
      if (clean.some((p) => p.name === name)) return clean;
      return [...clean, { name, _id: option?._id }];
    });
  };
  const removePlace = (name) => {
    setPlaces((prev) => prev.filter((p) => p?.name && p.name !== name));
  };
  const onHotelSelect = (option) => {
    const id = option?._id || "";
    setSelectedHotelId(id);
    setHotel(option?.name || "");
    setBreakfast(""); setLunch(""); setDinner(""); setOtherMeals("");
    setBudget(0);
    setHotelDetailsOpen(false);
  };
  const onBreakfastSelect = (option) => setBreakfast(option?.name || "");
  const onLunchSelect = (option) => setLunch(option?.name || "");
  const onDinnerSelect = (option) => setDinner(option?.name || "");
  const onOtherMealsSelect = (option) => setOtherMeals(option?.name || "");

  if (loading) {
    return (
      <div className="plannerPage">
        <div className="plannerOverlay">
          <NavBar />
          <div className="plannerContainer">
            <h2 className="titleHomePage" id="plannerTitle">Edit your Plan</h2>
            <div className="plannerBox" style={{ color: "#fff" }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="plannerPage">
        <div className="plannerOverlay">
          <NavBar />
          <div className="plannerContainer">
            <h2 className="titleHomePage" id="plannerTitle">Edit your Plan</h2>
            <div className="plannerBox" style={{ color: "#fff" }}>Error: {loadError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="plannerPage">
      <div className="plannerOverlay">
        <NavBar />
        <div className="plannerContainer">
          <h2 className="titleHomePage" id="plannerTitle">Edit your Plan</h2>
          <form onSubmit={handleSubmit} className="plannerBox">

            {/* <div className="mb-3">
              <SearchableDropdown
                options={collections}
                onSelect={(opt) => setSelectedCollection(opt)}
                placeholder="Select Collection"
                displayKey="name"
                valueKey="_id"
                value={selectedCollection?.name || ''}
              />
              <button
                type="button"
                className="placeAddBtn"
                id="createCollectionBtn"
                onClick={() => setCreateCollectionOpen(true)}
              >
                Create Collection
              </button>
            </div> */}

            <div className="mb-3 planDateGroup">
              <input
                type="date"
                className="formControlPlanner"
                id="planDate"
                name="planDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <SearchableDropdown
                options={cities}
                onSelect={onCitySelect}
                placeholder="Select City"
                displayKey="name"
                valueKey="_id"
                value={city}
              />
            </div>

            <div className="mb-3">
              <SearchableDropdown
                options={cityId ? placeOptions : []}
                onSelect={onPlaceSelect}
                placeholder={cityId ? "Add visiting place" : "Select a city first"}
                displayKey="name"
                valueKey="_id"
                value=""
                disabled={!cityId}
              />
              {places.filter((p) => p?.name).length > 0 && (
                <div className="selectedPlaces">
                  {places.filter((p) => p?.name).map((p) => (
                    <span key={p._id || p.name} className="placePill">
                      {p.name}
                      <button
                        type="button"
                        className="pillRemove"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => removePlace(p.name)}
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3">
              <SearchableDropdown
                options={cityId ? hotels : []}
                onSelect={onHotelSelect}
                placeholder="Select Hotel"
                displayKey="name"
                valueKey="_id"
                value={hotel}
                disabled={!cityId}
              />
              {selectedHotelId && (
                <>
                  <button
                    type="button"
                    className="placeAddBtn"
                    id="viewHotelDetailsBtn"
                    onClick={() => setHotelDetailsOpen(true)}
                    aria-label="View selected hotel details"
                  >
                    View Hotel Details
                  </button>

                    <HotelDetails
                      open={hotelDetailsOpen}
                      hotelId={selectedHotelId}
                      initialHotel={findHotel(selectedHotelId)}
                      onClose={() => setHotelDetailsOpen(false)}
                    />
                </>
              )}
            </div>

            <div className="mb-3">
              <SearchableDropdown
                options={selectedHotelId ? hotelMealsByType.Breakfast : []}
                onSelect={onBreakfastSelect}
                placeholder={selectedHotelId ? "Select Breakfast" : "Select a hotel first"}
                displayKey="name"
                valueKey="_id"
                value={breakfast}
                disabled={!selectedHotelId}
              />
              <SearchableDropdown
                options={selectedHotelId ? hotelMealsByType.Lunch : []}
                onSelect={onLunchSelect}
                placeholder={selectedHotelId ? "Select Lunch" : "Select a hotel first"}
                displayKey="name"
                valueKey="_id"
                value={lunch}
                disabled={!selectedHotelId}
              />
              <SearchableDropdown
                options={selectedHotelId ? hotelMealsByType.Dinner : []}
                onSelect={onDinnerSelect}
                placeholder={selectedHotelId ? "Select Dinner" : "Select a hotel first"}
                displayKey="name"
                valueKey="_id"
                value={dinner}
                disabled={!selectedHotelId}
              />

              <SearchableDropdown
                options={selectedHotelId ? hotelMealsByType.Other : []}
                onSelect={onOtherMealsSelect}
                placeholder={selectedHotelId ? "Select Other Meals" : "Select a hotel first"}
                displayKey="name"
                valueKey="_id"
                value={otherMeals}
                disabled={!selectedHotelId}
              />
            </div>

            {budget > 0 && (
              <div className="mt-4">
                <h3>Estimated Budget for the Day: ${budget}</h3>
              </div>
            )}

            <div className="plannerActionButtons">
              <button type="submit" className="placeAddBtn">Recalculate Budget</button>
              <button
                type="button"
                className="placeAddBtn"
                id="savePlanBtn"
                onClick={handleUpdate}
              >
                Update Plan
              </button>
              <button type="button" className="placeAddBtn" id="resetPlanBtn" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-4 alert alert-success">
              {message}
            </div>
          )}
        </div>
      </div>

      <CreateCollection
        isOpen={createCollectionOpen}
        onClose={() => setCreateCollectionOpen(false)}
        userId={currentUserId}
        onCreated={async (created) => {
          if (created && created._id) {
            setCollections(prev => {
              const exists = prev.some(c => String(c._id) === String(created._id));
              return exists ? prev : [created, ...prev];
            });
            setSelectedCollection(created);
            setOriginalCollectionId(created._id || originalCollectionId);
          }
          await fetchCollections();
        }}
      />

      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        duration={2500}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}

export default EditPlan;
