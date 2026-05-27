const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Restaurant = require('../models/restaurantModel');
const Product = require('../models/productModel');

// Reused guard for endpoints that require a logged-in user header.
const getAuthenticatedUserId = (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        res.status(401).json({ error: "Unauthorized: Missing user-id header" });
        return null;
    }

    if (!User.findById(userId)) {
        res.status(404).json({ error: "User not found" });
        return null;
    }

    return userId;
};

// Reused ownership check so order IDs of other users stay hidden.
const getOwnedOrder = (req, res, userId) => {
    const order = Order.getById(req.params.id);
    if (!order || order.userId !== userId) {
        res.status(404).json({ error: "Order not found" });
        return null;
    }

    return order;
};

const createOrder = (req, res) => {
    // Extract and validate logged-in user context from headers.
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) {
        return;
    }

    const { restaurantId, items } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "restaurantId and a non-empty items array are required" });
    }

    // Validate restaurant exists before validating each item against it.
    if (!Restaurant.getById(restaurantId)) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    // Validate all products exist and belong to the same restaurant.
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
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) {
        return;
    }

    // Filter orders to only return the ones belonging to this user
    const allOrders = Order.getAll();
    const userOrders = allOrders.filter(order => order.userId === userId);

    res.status(200).json(userOrders);
};

const getOrderById = (req, res) => {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) {
        return;
    }

    const order = getOwnedOrder(req, res, userId);
    if (!order) {
        return;
    }

    return res.status(200).json(order);
};

const updateOrder = (req, res) => {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) {
        return;
    }

    const order = getOwnedOrder(req, res, userId);
    if (!order) {
        return;
    }

    // Allowed fields to update
    const allowedFields = ['status', 'items'];
    const bodyKeys = Object.keys(req.body || {});

    // If no fields are provided, return an error
    if (bodyKeys.length === 0) {
        return res.status(400).json({ error: "At least one field is required: status or items" });
    }

    // If the field is not allowed, return an error
    const hasUnknownField = bodyKeys.some(field => !allowedFields.includes(field));
    if (hasUnknownField) {
        return res.status(400).json({ error: "Only status and items can be updated" });
    }

    const patchData = {};

    // If the status is provided, update the status
    if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
        if (typeof req.body.status !== 'string' || req.body.status.trim() === '') {
            return res.status(400).json({ error: "status must be a non-empty string" });
        }
        patchData.status = req.body.status.trim();
    }

    // If the items are provided, update the items
    if (Object.prototype.hasOwnProperty.call(req.body, 'items')) {
        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            return res.status(400).json({ error: "items must be a non-empty array" });
        }

        // Keep order's restaurant fixed; updated items must still belong to it.
        for (const item of req.body.items) {
            const product = Product.getById(item.productId);
            // If the product is not found, return an error
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            // If the product does not belong to the order's restaurant, return an error
            if (product.restaurantId !== order.restaurantId) {
                return res.status(400).json({ error: `Product ${item.productId} does not belong to this restaurant` });
            }
        }

        patchData.items = req.body.items;
    }

    // Update the order
    const updatedOrder = Order.update(order.id, patchData);
    // If the order is not found, return an error
    if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
    }

    return res.status(204).send();
};

const deleteOrder = (req, res) => {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) {
        return;
    }

    const order = getOwnedOrder(req, res, userId);
    if (!order) {
        return;
    }

    Order.remove(order.id);
    return res.status(204).send();
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrder,
    deleteOrder
};