import { useEffect, useState } from "react";
import NavBar from './NavBar';
import './CSS/Planner.css';
import SearchableDropdown from './components/SearchableDropdown';
import HotelDetails from './HotelDetails';

function Planner() {
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [cityId, setCityId] = useState("");
  const [places, setPlaces] = useState([{ name: "" }]);

  const [hotel, setHotel] = useState("");
  const [selectedHotelId, setSelectedHotelId] = useState("");

  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [other, setOther] = useState("");

  const [budget, setBudget] = useState(0);
  const [message, setMessage] = useState("");

  const [cities, setCities] = useState([]);
  const [placeOptions, setPlaceOptions] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [mealsByType, setMealsByType] = useState({ Breakfast: [], Lunch: [], Dinner: [], Other: [] });
  const [hotelMealsByType, setHotelMealsByType] = useState({ Breakfast: [], Lunch: [], Dinner: [], Other: [] });

  const [hotelDetailsOpen, setHotelDetailsOpen] = useState(false);

  const findHotel = (id) => hotels.find(h => String(h._id) === String(id));
  const findMealByName = (type, name) => {
    if (!name) return undefined;
    const list = (selectedHotelId ? hotelMealsByType[type] : mealsByType[type]) || [];
    return list.find(m => m.name === name);
  };

  const API = `${process.env.REACT_APP_BACKEND_URL}`;

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
        (Array.isArray(mealsData) ? mealsData : []).forEach(m => {
          if (grouped[m.type]) grouped[m.type].push(m);
        });
        setMealsByType(grouped);
      } catch (e) {
        console.error('Failed to load lists', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!cityId) {
      setPlaceOptions([]);
      setHotels([]);
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
        console.error('Failed to load city dependencies', e);
      }
    })();
  }, [cityId]);

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
        available.forEach(m => { if (grouped[m.type]) grouped[m.type].push(m); });
        setHotelMealsByType(grouped);
      } catch (e) {
        console.error('Failed to load hotel details', e);
        setHotelMealsByType({ Breakfast: [], Lunch: [], Dinner: [], Other: [] });
      }
    })();
  }, [selectedHotelId]);

  const calculateBudget = () => {
    const hotelPrice = selectedHotelId ? (findHotel(selectedHotelId)?.roomPrice || 0) : 0;

    const breakfastPrice = breakfast ? (findMealByName('Breakfast', breakfast)?.price || 0) : 0;
    const lunchPrice = lunch ? (findMealByName('Lunch', lunch)?.price || 0) : 0;
    const dinnerPrice = dinner ? (findMealByName('Dinner', dinner)?.price || 0) : 0;
    const otherPrice = other ? (findMealByName('Other', other)?.price || 0) : 0;

    const totalCost = Number(hotelPrice) + Number(breakfastPrice) + Number(lunchPrice) + Number(dinnerPrice) + Number(otherPrice);
    setBudget(Number.isFinite(totalCost) ? totalCost : 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const placeNames = places.map(p => p.name).filter(Boolean);
    if (!date || !city || !hotel || placeNames.length === 0) {
      alert("Please fill in date, city, at least one place and a hotel.");
      return;
    }
    calculateBudget();
  };

  const handleSave = async () => {
    const placeNames = places.map(p => p.name).filter(Boolean);
    if (!date || !city || !hotel || placeNames.length === 0) {
      alert("Please fill in date, city, at least one place and a hotel.");
      return;
    }
    if (budget === 0) calculateBudget();

    const plannerData = {
      date,
      city,
      places: placeNames,
      hotel,
      meals: { breakfast, lunch, dinner, other },
      totalBudget: budget,
      userId: localStorage.getItem("userId"),
    };

    try {
      const response = await fetch(`${API}/planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plannerData),
      });
      if (response.ok) {
        await response.json();
        setMessage("Budget saved successfully!");
        handleReset();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        alert('Error saving data');
      }
    } catch (error) {
      console.error("Catch error:", error);
      alert('Error saving data');
    }
  };

  const handleReset = () => {
    setDate("");
    setCity(""); setCityId("");
    setPlaces([{ name: "" }]);
    setHotel(""); setSelectedHotelId("");
    setBreakfast(""); setLunch(""); setDinner(""); setOther("");
    setBudget(0);
    setMessage("");
  };

  const onCityChange = (e) => {
    const id = e.target.value;
    const name = e.target.selectedOptions[0]?.text || "";
    setCityId(id);
    setCity(name);
    setPlaces([{ name: "" }]);
    setHotel(""); setSelectedHotelId("");
  };

  const onCitySelect = (option) => {
    const id = option?._id || "";
    const name = option?.name || "";
    setCityId(id);
    setCity(name);
    setPlaces([{ name: "" }]);
    setHotel(""); setSelectedHotelId("");
  };

  const onPlacesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.text);
    setPlaces(selected.length ? selected.map(n => ({ name: n })) : [{ name: "" }]);
  };

  const onHotelChange = (e) => {
    const id = e.target.value;
    setSelectedHotelId(id);
    const h = findHotel(id);
    setHotel(h?.name || "");
  };

  const onHotelSelect = (option) => {
    const id = option?._id || "";
    setSelectedHotelId(id);
    setHotel(option?.name || "");
    setBreakfast(""); setLunch(""); setDinner(""); setOther("");
    setBudget(0);
    setHotelDetailsOpen(false);
  };
  const onBreakfastSelect = (option) => setBreakfast(option?.name || "");
  const onLunchSelect = (option) => setLunch(option?.name || "");
  const onDinnerSelect = (option) => setDinner(option?.name || "");
  const onOtherMealSelect = (option) => setOther(option?.name || "");

  const onPlaceSelect = (option) => {
    if (!option) return;
    const name = option?.name || "";
    if (!name) return;
    setPlaces(prev => {
      const clean = prev.filter(p => p && p.name);
      if (clean.some(p => p.name === name)) return clean;
      return [...clean, { name, _id: option?._id }];
    });
  };

  const removePlace = (name) => {
    setPlaces(prev => prev.filter(p => p?.name && p.name !== name));
  };

  return (
    <div className="plannerPage">
      <div className="plannerOverlay">
        <NavBar />
        <div className="plannerContainer">
          <h2 className="titleHomePage" id="plannerTitle">Plan Your Day</h2>
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
              />
            </div>

            <div className="mb-3">
              <SearchableDropdown
                options={cityId ? placeOptions : []}
                onSelect={onPlaceSelect}
                placeholder={cityId ? "Add visiting place" : "Select a city first"}
                displayKey="name"
                valueKey="_id"
              />
              {places.filter(p => p?.name).length > 0 && (
                <div className="selectedPlaces">
                  {places.filter(p => p?.name).map((p) => (
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
              />
              <SearchableDropdown
                options={selectedHotelId ? hotelMealsByType.Lunch : []}
                onSelect={onLunchSelect}
                placeholder={selectedHotelId ? "Select Lunch" : "Select a hotel first"}
                displayKey="name"
                valueKey="_id"
              />
              <SearchableDropdown
                options={selectedHotelId ? hotelMealsByType.Dinner : []}
                onSelect={onDinnerSelect}
                placeholder={selectedHotelId ? "Select Dinner" : "Select a hotel first"}
                displayKey="name"
                valueKey="_id"
              />
              <SearchableDropdown
                options={selectedHotelId ? hotelMealsByType.Other : []}
                onSelect={onOtherMealSelect}
                placeholder={selectedHotelId ? "Select other meals" : "Select a hotel first"}
                displayKey="name"
                valueKey="_id"
              />
            </div>

            {budget > 0 && (
            <div className="mt-4">
              <h3>Estimated Budget for the Day: ${budget}</h3>
            </div>
          )}

            <div className="plannerActionButtons">
              <button type="submit" className="placeAddBtn">Calculate Budget</button>
              <button
                type="button"
                className="placeAddBtn"
                id="savePlanBtn"
                onClick={handleSave}
                disabled={budget === 0}
              >
                Save Plan
              </button>
              <button type="button" className="placeAddBtn" id="resetPlanBtn" onClick={handleReset}>Reset</button>
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

export default Planner;
