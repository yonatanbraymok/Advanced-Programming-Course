const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders
router.post('/', orderController.createOrder);

// GET /api/orders
router.get('/', orderController.getUserOrders);

// GET /api/orders/:id
router.get('/:id', orderController.getOrderById);

// PATCH /api/orders/:id
router.patch('/:id', orderController.updateOrder);

// DELETE /api/orders/:id
router.delete('/:id', orderController.deleteOrder);

module.exports = router;