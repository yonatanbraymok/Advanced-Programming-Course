// Aggregates all /api/* route modules. Add new routers here as features land
// (users, restaurants, orders, search).

const express = require('express');
const healthRoutes = require('./health');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);

module.exports = router;
