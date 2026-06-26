const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');

// POST /api/users
router.post('/', userController.registerUser);

// GET /api/users/me (Get Current User Profile)
router.get('/me', authenticate, userController.getCurrentUser);

// PUT /api/users/me (Update Current User Profile)
router.put('/me', authenticate, userController.updateUserProfile);

// GET /api/users/:id (Get Profile)
router.get('/:id', userController.getUserProfile);

module.exports = router;