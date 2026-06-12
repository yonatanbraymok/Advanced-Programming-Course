const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const productController = require('../controllers/productController');
const authenticate = require('../middleware/auth');
const optionalAuthenticate = require('../middleware/optionalAuth');

// Base restaurant collection endpoints
router.get('/', optionalAuthenticate, restaurantController.getRestaurants);
router.post('/', authenticate, restaurantController.createRestaurant);

// Specific restaurant resource endpoints by ID
router.get('/:id', optionalAuthenticate, restaurantController.getRestaurantById);
router.patch('/:id', authenticate, restaurantController.updateRestaurant);
router.delete('/:id', authenticate, restaurantController.deleteRestaurant);

// Nested product menu endpoints inside a restaurant
router.get('/:id/products', productController.getProducts);
router.post('/:id/products', authenticate, productController.createProduct);

// Specific product CRUD endpoints by unique product ID
router.get('/:id/products/:pId', productController.getProductById);
router.patch('/:id/products/:pId', authenticate, productController.updateProduct);
router.delete('/:id/products/:pId', authenticate, productController.deleteProduct);

module.exports = router;