const mongoose = require('mongoose');
const CityModel = require('../models/Cities');
const VisitingPlaceModel = require('../models/VisitingPlaces');
const HotelModel = require('../models/Hotels');
const MealModel = require('../models/Meals');

async function listCities(_req, res) {
  try {
    const cities = await CityModel.find({})
      .select('_id name district country')
      .sort({ name: 1 });
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving cities', error: err?.message || err });
  }
}

async function listVisitingPlaces(req, res) {
  try {
    const { cityId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ message: 'Invalid city id' });
    }
    const places = await VisitingPlaceModel.find({ cityId })
      .select('_id name distanceKm category')
      .sort({ name: 1 });
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving places', error: err?.message || err });
  }
}

async function listHotels(req, res) {
  try {
    const { cityId } = req.query;
    const filter = {};
    if (cityId) {
      if (!mongoose.Types.ObjectId.isValid(cityId)) {
        return res.status(400).json({ message: 'Invalid city id' });
      }
      filter.city = new mongoose.Types.ObjectId(cityId);
    }
    const hotels = await HotelModel.find(filter)
      .select('_id name city roomPrice starRating')
      .populate({ path: 'city', select: '_id name' })
      .sort({ name: 1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving hotels', error: err?.message || err });
  }
}

async function listMeals(req, res) {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const meals = await MealModel.find(filter)
      .select('_id name type include price')
      .sort({ type: 1, name: 1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving meals', error: err?.message || err });
  }
}

async function getHotelById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid hotel id' });
    }
    const doc = await HotelModel.findById(id)
      .populate({ path: 'city', select: '_id name' })
      .populate({ path: 'availableMeals', select: '_id name type price' })
      .lean();

    if (!doc) return res.status(404).json({ message: 'Hotel not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving hotel', error: err?.message || err });
  }
}

module.exports = {
  listCities,
  listVisitingPlaces,
  listHotels,
  listMeals,
  getHotelById,
};