const express = require('express');
const { generateSuggestions } = require('../controllers/ai.controller');

const router = express.Router();

router.post('/suggestions', generateSuggestions);

module.exports = router;