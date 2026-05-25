// Aggregates all /api/* route modules. Add new routers here as features land
// (users, restaurants, orders, search).

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health'); 
const userRoutes = require('./userRoutes'); 
const tokenRoutes = require('./tokenRoutes'); 

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/tokens', tokenRoutes); 

module.exports = router;
