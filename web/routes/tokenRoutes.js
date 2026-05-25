const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

// POST /api/tokens
router.post('/', tokenController.loginUser);

module.exports = router;