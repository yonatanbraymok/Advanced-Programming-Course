const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users
router.post('/', userController.registerUser);

module.exports = router;