import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "./NavBar";
import "./CSS/Planner.css";
import SearchableDropdown from "./components/SearchableDropdown";
import HotelDetails from "./HotelDetails";

function EditPlan() {
  const navigate = useNavigate();
  const { id: planId } = useParams();

  // Form state
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [cityId, setCityId] = useState("");
  const [places, setPlaces] = useState([{ name: "" }]);

  const [hotel, setHotel] = useState("");
  const [selectedHotelId, setSelectedHotelId] = useState("");

  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");

  const [budget, setBudget] = useState(0);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [hotelDetailsOpen, setHotelDetailsOpen] = useState(false);

  const [cities, setCities] = useState([]);
  const [placeOptions, setPlaceOptions] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [mealsByType, setMealsByType] = useState({ Breakfast: [], Lunch: [], Dinner: [] });
  const [hotelMealsByType, setHotelMealsByType] = useState({ Breakfast: [], Lunch: [], Dinner: [] });

  const findHotel = (id) => hotels.find((h) => String(h._id) === String(id));
  const findMealByName = (type, name) => {
    if (!name) return undefined;
    const list = (selectedHotelId ? hotelMealsByType[type] : mealsByType[type]) || [];
    return list.find((m) => m.name === name);
  };

  const getISODateOnly = (d) => {
    try { return new Date(d).toISOString().slice(0, 10); } catch { return ""; }
  };

  useEffect(() => {
    (async () => {
      try {
        const [citiesRes, mealsRes] = await Promise.all([
          fetch("http://localhost:3001/cities"),
          fetch("http://localhost:3001/meals"),
        ]);
        const citiesData = await citiesRes.json();
        const mealsData = await mealsRes.json();
        setCities(Array.isArray(citiesData) ? citiesData : []);
        const grouped = { Breakfast: [], Lunch: [], Dinner: [] };
        (Array.isArray(mealsData) ? mealsData : []).forEach((m) => {
          if (grouped[m.type]) grouped[m.type].push(m);
        });
        setMealsByType(grouped);
      } catch (e) {
        console.error("Failed to load base lists", e);
      }
    })();
  }, []);

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
        const res = await fetch(`http://localhost:3001/planner/plan/${encodeURIComponent(planId)}`);
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
          fetch(`http://localhost:3001/cities/${encodeURIComponent(cityId)}/places`),
          fetch(`http://localhost:3001/hotels?cityId=${encodeURIComponent(cityId)}`),
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
      setHotelMealsByType({ Breakfast: [], Lunch: [], Dinner: [] });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`http://localhost:3001/hotels/${encodeURIComponent(selectedHotelId)}`);
        if (!res.ok) throw new Error(`Failed to load hotel ${selectedHotelId}`);
        const data = await res.json();
        const available = Array.isArray(data.availableMeals) ? data.availableMeals : [];
        const grouped = { Breakfast: [], Lunch: [], Dinner: [] };
        available.forEach((m) => { if (grouped[m.type]) grouped[m.type].push(m); });
        setHotelMealsByType(grouped);
      } catch (e) {
        console.error("Failed to load hotel details", e);
        setHotelMealsByType({ Breakfast: [], Lunch: [], Dinner: [] });
      }
    })();
  }, [selectedHotelId]);

  const calculateBudget = () => {
    const hotelPrice = selectedHotelId ? (findHotel(selectedHotelId)?.roomPrice || 0) : 0;
    const breakfastPrice = breakfast ? (findMealByName("Breakfast", breakfast)?.price || 0) : 0;
    const lunchPrice = lunch ? (findMealByName("Lunch", lunch)?.price || 0) : 0;
    const dinnerPrice = dinner ? (findMealByName("Dinner", dinner)?.price || 0) : 0;
    const totalCost =
      Number(hotelPrice) + Number(breakfastPrice) + Number(lunchPrice) + Number(dinnerPrice);
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
      alert("Please fill in date, city, at least one place and a hotel.");
      return;
    }
    if (budget === 0) calculateBudget();

    const payload = {
      date,
      city,
      places: placeNames,
      hotel,
      meals: { breakfast, lunch, dinner },
      totalBudget: budget,
      userId: localStorage.getItem("userId"),
    };

    try {
      const res = await fetch(`http://localhost:3001/planner/${encodeURIComponent(planId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Update failed (${res.status})`);
      }
      setMessage("Plan updated successfully!");
      setTimeout(() => navigate(`/plans/${planId}`), 600);
    } catch (e) {
      alert(e.message || "Error updating plan");
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
    setBreakfast(""); setLunch(""); setDinner("");
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
    setBreakfast(""); setLunch(""); setDinner("");
    setBudget(0);
    setHotelDetailsOpen(false);
  };
  const onBreakfastSelect = (option) => setBreakfast(option?.name || "");
  const onLunchSelect = (option) => setLunch(option?.name || "");
  const onDinnerSelect = (option) => setDinner(option?.name || "");

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
            <div className="mb-3" id="planDateInput">
              <input
                type="date"
                className="formControlPlanner"
                id="planDateInput"
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
    </div>
  );
}

export default EditPlan;
