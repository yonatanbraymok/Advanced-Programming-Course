const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users
router.post('/', userController.registerUser);

// GET /api/users/:id (Get Profile)
router.get('/:id', userController.getUserProfile);

module.exports = router;