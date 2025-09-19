const express = require('express');
const {
  createCollection,
  updateCollection,
  deleteCollection,
  getCollectionById,
  listCollections,
} = require('../controllers/collection.controller');

const router = express.Router();

router.post('/collections', createCollection);
router.patch('/collections/:id', updateCollection);
router.get('/collections/:id', getCollectionById);
router.get('/collections', listCollections);
router.delete('/collections/:id', deleteCollection);

module.exports = router;