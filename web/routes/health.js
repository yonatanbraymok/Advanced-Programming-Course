// Routes for GET /api/health - bootstrap smoke test (not part of the graded API).

const express = require('express');
const { getHealth } = require('../controllers/healthController');

const router = express.Router();

// Mounted at /health in routes/index.js -> full path is /api/health
router.get('/', getHealth);

module.exports = router;
