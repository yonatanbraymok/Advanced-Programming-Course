const restaurantModel = require('../models/restaurantModel');
const userModel = require('../models/userModel');

// Handles GET /api/restaurants
const getRestaurants = (req, res) => {
    let data = [...restaurantModel.getAll()]; // clone the array so we don't mutate memory

    if (req.userId) {
        const user = userModel.findById(req.userId);
        if (user && user.location) {
            const { x: ux, y: uy } = user.location;
            
            // Calculate distance for each restaurant
            data = data.map(restaurant => {
                const rx = restaurant.location ? restaurant.location.x : 0;
                const ry = restaurant.location ? restaurant.location.y : 0;
                const distance = Math.sqrt(Math.pow(rx - ux, 2) + Math.pow(ry - uy, 2));
                return { ...restaurant, distance };
            });

            // Sort by distance ascending (closest first)
            data.sort((a, b) => a.distance - b.distance);
        }
    }

    return res.status(200).json(data);
};

// Handles POST /api/restaurants
const createRestaurant = (req, res) => {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Name is required" });
    }

    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ error: "Description must be a string" });
    }

    const newRestaurant = restaurantModel.create(
        name.trim(),
        description !== undefined ? description.trim() : ''
    );
    
   
    return res.status(201).json({
        message: "Restaurant created successfully",
        restaurantId: newRestaurant.id
    });
};

// Handles GET /api/restaurants/:id.
const getRestaurantById = (req, res) => {
    const { id } = req.params;
    let restaurant = restaurantModel.getById(id);

    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    // Clone restaurant to avoid mutating the mocked static database object
    restaurant = { ...restaurant };

    if (req.userId) {
        const user = userModel.findById(req.userId);
        if (user && user.location) {
            const { x: ux, y: uy } = user.location;
            const rx = restaurant.location ? restaurant.location.x : 0;
            const ry = restaurant.location ? restaurant.location.y : 0;
            restaurant.distance = Math.sqrt(Math.pow(rx - ux, 2) + Math.pow(ry - uy, 2));
        }
    }

    return res.status(200).json(restaurant);
};

// Handles PATCH /api/restaurants/:id.
const updateRestaurant = (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Name is required" });
    }

    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ error: "Description must be a string" });
    }

    const updatedRestaurant = restaurantModel.update(
        id,
        name.trim(),
        description !== undefined ? description.trim() : undefined
    );

    if (!updatedRestaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    // No content
    return res.status(204).send();
};

// Handles DELETE /api/restaurants/:id
const deleteRestaurant = (req, res) => {
    const { id } = req.params;
    const deleted = restaurantModel.remove(id);

    if (!deleted) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    // No content
    return res.status(204).send();
};

module.exports = {
    getRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};