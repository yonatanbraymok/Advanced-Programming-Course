const restaurantModel = require('../models/restaurantModel');
const userModel = require('../models/userModel');

const toRestaurantJson = (restaurant) =>
    typeof restaurant.toJSON === 'function' ? restaurant.toJSON() : restaurant;

const getRestaurants = async (req, res, next) => {
    try {
        let data = (await restaurantModel.getAll()).map(toRestaurantJson);

        if (req.userId) {
            const user = await userModel.findById(req.userId);
            if (user && user.location) {
                const { x: ux, y: uy } = user.location;

                data = data.map((restaurant) => {
                    const rx = restaurant.location ? restaurant.location.x : 0;
                    const ry = restaurant.location ? restaurant.location.y : 0;
                    const distance = Math.sqrt((rx - ux) ** 2 + (ry - uy) ** 2);
                    return { ...restaurant, distance };
                });

                data.sort((a, b) => a.distance - b.distance);
            }
        }

        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const getMyRestaurants = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = await restaurantModel.getByOwnerId(req.userId);
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const createRestaurant = async (req, res, next) => {
    try {
        const { name, description, cuisine, location, image, menu } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const payload = {
            name: name.trim(),
            description: description !== undefined ? description.trim() : '',
            cuisine,
            location,
            image,
            menu,
        };

        const newRestaurant = await restaurantModel.create(req.userId, payload);

        return res.status(201).json({
            message: 'Restaurant created successfully',
            restaurantId: newRestaurant.id,
        });
    } catch (err) {
        next(err);
    }
};

const getRestaurantById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const found = await restaurantModel.getById(id);

        if (!found) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        let restaurant = toRestaurantJson(found);

        if (req.userId) {
            const user = await userModel.findById(req.userId);
            if (user && user.location) {
                const { x: ux, y: uy } = user.location;
                const rx = restaurant.location ? restaurant.location.x : 0;
                const ry = restaurant.location ? restaurant.location.y : 0;
                restaurant.distance = Math.sqrt((rx - ux) ** 2 + (ry - uy) ** 2);
            }
        }

        return res.status(200).json(restaurant);
    } catch (err) {
        next(err);
    }
};

const updateRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, cuisine, location, image, menu } = req.body;

        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
            return res.status(400).json({ error: 'Name must be a valid string' });
        }

        const payload = {};
        if (name !== undefined) payload.name = name.trim();
        if (description !== undefined) payload.description = description.trim();
        if (cuisine !== undefined) payload.cuisine = cuisine.trim();
        if (location !== undefined) payload.location = location;
        if (image !== undefined) payload.image = image;
        if (menu !== undefined) payload.menu = menu;

        const updatedRestaurant = await restaurantModel.update(id, req.userId, payload);

        if (!updatedRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};

const deleteRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await restaurantModel.remove(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getRestaurants,
    getMyRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
};
