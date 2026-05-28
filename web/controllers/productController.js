const net = require('net');
const productModel = require('../models/productModel');
const restaurantModel = require('../models/restaurantModel');

// TCP configuration for the C++ Server
const CPP_SERVER_PORT = 5555; 
const CPP_SERVER_HOST = '127.0.0.1';

// Helper function to send a command to the C++ server using a TCP socket
const sendViewToCppServer = (userId, productId) => {
    const client = net.createConnection({ port: CPP_SERVER_PORT, host: CPP_SERVER_HOST }, () => {
        const command = `GET ${userId} ${productId}\n`;
        client.write(command);
    });

    client.on('error', (err) => {
        console.error('Error connecting to C++ server via socket:', err.message);
    });

    client.on('data', () => {
        client.end();
    });
};

// Handles GET /api/restaurants/:id/products.
const getProducts = (req, res) => {
    const { id } = req.params;
    const restaurant = restaurantModel.getById(id);
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    const menu = productModel.getByRestaurantId(id);
    return res.status(200).json(menu);
};

// Handles POST /api/restaurants/:id/products.
const createProduct = (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

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

    const newProduct = productModel.create(id, name.trim(), price);
    
    
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
    sendViewToCppServer(userId, pId);

    return res.status(200).json(product);
};

// Handles PATCH /api/restaurants/:id/products/:pId
const updateProduct = (req, res) => {
    const { id, pId } = req.params;
    const { name, price } = req.body;

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

    productModel.update(pId, name.trim(), price);
    
    
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