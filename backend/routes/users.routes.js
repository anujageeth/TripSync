const express = require('express');
const { getUserById, updateUser, updatePassword } = require('../controllers/users.controller');

const router = express.Router();

router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.put('/users/:id/password', updatePassword);

module.exports = router;