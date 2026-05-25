const restaurantModel = require('../models/restaurantModel');

// Handles GET /api/restaurants
const getRestaurants = (req, res) => {
    const data = restaurantModel.getAll();
    return res.status(200).json(data);
};

// Handles POST /api/restaurants
const createRestaurant = (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Name is required" });
    }

    const newRestaurant = restaurantModel.create(name.trim());
    res.setHeader('Location', `/api/restaurants/${newRestaurant.id}`);
    return res.status(201).send();
};

// Handles GET /api/restaurants/:id.
const getRestaurantById = (req, res) => {
    const { id } = req.params;
    const restaurant = restaurantModel.getById(id);

    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    return res.status(200).json(restaurant);
};

// Handles PATCH /api/restaurants/:id.
const updateRestaurant = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Name is required" });
    }

    const updatedRestaurant = restaurantModel.update(id, name.trim());

    if (!updatedRestaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    return res.status(204).send();
};

// Handles DELETE /api/restaurants/:id
const deleteRestaurant = (req, res) => {
    const { id } = req.params;
    const deleted = restaurantModel.remove(id);

    if (!deleted) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    return res.status(204).send();
};

module.exports = {
    getRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};