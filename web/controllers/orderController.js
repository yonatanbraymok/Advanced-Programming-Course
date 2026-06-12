// Order handlers assume req.userId was set by auth middleware before this controller runs.

const Order = require('../models/orderModel');
const Restaurant = require('../models/restaurantModel');
const Product = require('../models/productModel');

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
    const userId = req.userId;
    const { restaurantId, items } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "restaurantId and a non-empty items array are required" });
    }

    // Validate restaurant exists before validating each item against it.
    if (!Restaurant.getById(restaurantId)) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    let totalPrice = 0;
    const enrichedItems = [];

    // Validate all products exist and belong to the same restaurant.
    for (const item of items) {
        const product = Product.getById(item.productId);
        
        if (!product) {
            return res.status(404).json({ error: `Product ${item.productId} not found` });
        }
        
        if (product.restaurantId !== restaurantId) {
            return res.status(400).json({ error: `Product ${item.productId} does not belong to this restaurant` });
        }

        enrichedItems.push({
            productId: item.productId,
            quantity: item.quantity,
            name: product.name,
            price: product.price
        });
        totalPrice += product.price * item.quantity;
    }

    const newOrder = Order.create(userId, restaurantId, enrichedItems);
    newOrder.totalPrice = totalPrice; // Append total price
    
    res.status(201).json({
        message: "Order created successfully",
        orderId: newOrder.id
    });
};

const getUserOrders = (req, res) => {
    const userId = req.userId;
    const allOrders = Order.getAll();
    const userOrders = allOrders.filter(order => order.userId === userId);

    res.status(200).json(userOrders);
};

const getOrderById = (req, res) => {
    const userId = req.userId;
    const order = getOwnedOrder(req, res, userId);
    if (!order) {
        return;
    }

    return res.status(200).json(order);
};

const updateOrder = (req, res) => {
    const userId = req.userId;
    const order = getOwnedOrder(req, res, userId);
    if (!order) {
        return;
    }

    const allowedFields = ['status', 'items'];
    const bodyKeys = Object.keys(req.body || {});

    if (bodyKeys.length === 0) {
        return res.status(400).json({ error: "At least one field is required: status or items" });
    }

    const hasUnknownField = bodyKeys.some(field => !allowedFields.includes(field));
    if (hasUnknownField) {
        return res.status(400).json({ error: "Only status and items can be updated" });
    }

    const patchData = {};

    if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
        if (typeof req.body.status !== 'string' || req.body.status.trim() === '') {
            return res.status(400).json({ error: "status must be a non-empty string" });
        }
        patchData.status = req.body.status.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'items')) {
        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            return res.status(400).json({ error: "items must be a non-empty array" });
        }

        for (const item of req.body.items) {
            const product = Product.getById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            if (product.restaurantId !== order.restaurantId) {
                return res.status(400).json({ error: `Product ${item.productId} does not belong to this restaurant` });
            }
        }

        patchData.items = req.body.items;
    }

    const updatedOrder = Order.update(order.id, patchData);
    if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
    }

    return res.status(204).send();
};

const deleteOrder = (req, res) => {
    const userId = req.userId;
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
