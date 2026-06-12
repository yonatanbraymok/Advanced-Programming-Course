const productModel = require('../models/productModel');
const restaurantModel = require('../models/restaurantModel');
const { recordProductView } = require('../services/ex2TcpClient');

// Handles GET /api/restaurants/:id/products.
const getProducts = (req, res) => {
    const { id } = req.params;
    const restaurant = restaurantModel.getById(id);
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    const menu = productModel.getByRestaurantId(id);
    const fullMenu = restaurant.menu ? [...restaurant.menu, ...menu] : menu;
    return res.status(200).json(fullMenu);
};

// Handles POST /api/restaurants/:id/products.
const createProduct = (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    const restaurant = restaurantModel.getById(id);
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Product name is required" });
    }

    if (price === undefined || typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: "Valid product price is required" });
    }

    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ error: "Description must be a string" });
    }

    const newProduct = productModel.create(
        id,
        name.trim(),
        price,
        description !== undefined ? description.trim() : ''
    );
    
    
    return res.status(201).json({
        message: "Product created successfully",
        productId: newProduct.id
    });
};

// Handles GET /api/restaurants/:id/products/:pId
const getProductById = (req, res) => {
    const { id, pId } = req.params;

    const restaurant = restaurantModel.getById(id);
    const product = productModel.getById(pId);

    if (!restaurant || !product || product.restaurantId !== id) {
        return res.status(404).json({ error: "Product not found" });
    }

    const userId = req.headers['user-id'] || req.headers['x-user-id'] || '0';
    recordProductView(userId, pId);

    return res.status(200).json(product);
};

// Handles PATCH /api/restaurants/:id/products/:pId
const updateProduct = (req, res) => {
    const { id, pId } = req.params;
    const { name, price, description } = req.body;

    const restaurant = restaurantModel.getById(id);
    const product = productModel.getById(pId);

    if (!restaurant || !product || product.restaurantId !== id) {
        return res.status(404).json({ error: "Product not found" });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Product name is required" });
    }

    if (price === undefined || typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: "Valid product price is required" });
    }

    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ error: "Description must be a string" });
    }

    productModel.update(
        pId,
        name.trim(),
        price,
        description !== undefined ? description.trim() : undefined
    );
    
    
    // No content
    return res.status(204).send();
};

// Handles DELETE /api/restaurants/:id/products/:pId
const deleteProduct = (req, res) => {
    const { id, pId } = req.params;

    const restaurant = restaurantModel.getById(id);
    const product = productModel.getById(pId);

    if (!restaurant || !product || product.restaurantId !== id) {
        return res.status(404).json({ error: "Product not found" });
    }

    productModel.remove(pId);
    
    
    // No content
    return res.status(204).send();
};

module.exports = {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};