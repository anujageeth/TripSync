const express = require('express');
const {
  listCities,
  listVisitingPlaces,
  listHotels,
  listMeals,
  getHotelById,
  createHotel,
} = require('../controllers/catalog.controller');

const router = express.Router();

router.get('/cities', listCities);
router.get('/cities/:cityId/places', listVisitingPlaces);
router.get('/hotels', listHotels);
router.get('/hotels/:id', getHotelById);
router.get('/meals', listMeals);
router.post('/hotels', createHotel);

module.exports = router;