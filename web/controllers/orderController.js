const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Restaurant = require('../models/restaurantModel');
const Product = require('../models/productModel');

const createOrder = (req, res) => {
    // Extract userId from headers 
    const userId = req.headers['user-id'];
    const { restaurantId, items } = req.body;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized: Missing user-id header" });
    }

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "restaurantId and a non-empty items array are required" });
    }

    // Validate User exists
    if (!User.findById(userId)) {
        return res.status(404).json({ error: "User not found" });
    }

    // 3. Validate Restaurant exists
    if (!Restaurant.getById(restaurantId)) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    // 4. Validate all Products exist AND belong to the restaurant
    for (const item of items) {
        const product = Product.getById(item.productId);
        
        if (!product) {
            return res.status(404).json({ error: `Product ${item.productId} not found` });
        }
        
        if (product.restaurantId !== restaurantId) {
            return res.status(400).json({ error: `Product ${item.productId} does not belong to this restaurant` });
        }
    }

    // 5. All checks passed, Create the order.
    const newOrder = Order.create(userId, restaurantId, items);
    
    res.status(201).json({
        message: "Order created successfully",
        orderId: newOrder.id
    });
};

const getUserOrders = (req, res) => {
    // Extract userId from headers
    const userId = req.headers['user-id'];

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized: Missing user-id header" });
    }

    // Filter orders to only return the ones belonging to this user
    const allOrders = Order.getAll();
    const userOrders = allOrders.filter(order => order.userId === userId);

    res.status(200).json(userOrders);
};

module.exports = {
    createOrder,
    getUserOrders
};