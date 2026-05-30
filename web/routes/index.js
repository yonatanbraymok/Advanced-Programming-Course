// Aggregates all /api/* route modules.

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health'); 
const userRoutes = require('./userRoutes'); 
const tokenRoutes = require('./tokenRoutes'); 
const restaurantRoutes = require('./restaurantRoutes'); 
const orderRoutes = require('./orderRoutes');
const searchRoutes = require('./searchRoutes');

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/tokens', tokenRoutes); 
router.use('/restaurants', restaurantRoutes);
router.use('/orders', orderRoutes);
router.use('/search', searchRoutes);

module.exports = router;
