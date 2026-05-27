const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const productController = require('../controllers/productController');

// Base restaurant collection endpoints
router.get('/', restaurantController.getRestaurants);
router.post('/', restaurantController.createRestaurant);

// Specific restaurant resource endpoints by ID
router.get('/:id', restaurantController.getRestaurantById);
router.patch('/:id', restaurantController.updateRestaurant);
router.delete('/:id', restaurantController.deleteRestaurant);

// Nested product menu endpoints inside a restaurant
router.get('/:id/products', productController.getProducts);
router.post('/:id/products', productController.createProduct);

// Specific product CRUD endpoints by unique product ID
router.get('/:id/products/:pId', productController.getProductById);
router.patch('/:id/products/:pId', productController.updateProduct);
router.delete('/:id/products/:pId', productController.deleteProduct);

module.exports = router;