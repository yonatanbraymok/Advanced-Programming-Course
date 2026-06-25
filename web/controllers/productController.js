const productModel = require('../models/productModel');
const restaurantModel = require('../models/restaurantModel');
const { recordProductView } = require('../services/ex2TcpClient');

const toMenuJson = (menuItem) =>
    typeof menuItem.toJSON === 'function' ? menuItem.toJSON() : menuItem;

const getProducts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantModel.getById(id);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const menu = await productModel.getByRestaurantId(id);
        const embeddedMenu = (restaurant.menu || []).map(toMenuJson);
        const fullMenu = [...embeddedMenu, ...menu];

        return res.status(200).json(fullMenu);
    } catch (err) {
        next(err);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;

        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Product name is required' });
        }

        if (price === undefined || typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ error: 'Valid product price is required' });
        }

        if (description !== undefined && typeof description !== 'string') {
            return res.status(400).json({ error: 'Description must be a string' });
        }

        const newProduct = await productModel.create(
            id,
            name.trim(),
            price,
            description !== undefined ? description.trim() : ''
        );

        return res.status(201).json({
            message: 'Product created successfully',
            productId: newProduct.id,
        });
    } catch (err) {
        next(err);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id, pId } = req.params;

        const restaurant = await restaurantModel.getById(id);
        const product = await productModel.getById(pId);

        if (!restaurant || !product || product.restaurantId !== id) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const userId = req.headers['user-id'] || req.headers['x-user-id'] || '0';
        recordProductView(userId, pId);

        const payload =
            typeof product.toJSON === 'function' ? product.toJSON() : product;

        return res.status(200).json(payload);
    } catch (err) {
        next(err);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id, pId } = req.params;
        const { name, price, description } = req.body;

        const restaurant = await restaurantModel.getById(id);
        const product = await productModel.getById(pId);

        if (!restaurant || !product || product.restaurantId !== id) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Product name is required' });
        }

        if (price === undefined || typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ error: 'Valid product price is required' });
        }

        if (description !== undefined && typeof description !== 'string') {
            return res.status(400).json({ error: 'Description must be a string' });
        }

        await productModel.update(
            pId,
            name.trim(),
            price,
            description !== undefined ? description.trim() : undefined
        );

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id, pId } = req.params;

        const restaurant = await restaurantModel.getById(id);
        const product = await productModel.getById(pId);

        if (!restaurant || !product || product.restaurantId !== id) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await productModel.remove(pId);
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
};
