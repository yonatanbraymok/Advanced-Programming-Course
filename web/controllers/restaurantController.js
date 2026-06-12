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

// Handles GET /api/restaurants/my
const getMyRestaurants = (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const data = restaurantModel.getByOwnerId(req.userId);
    return res.status(200).json(data);
};

// Handles POST /api/restaurants
const createRestaurant = (req, res) => {
    const { name, description, cuisine, location, image, menu } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Name is required" });
    }

    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = {
        name: name.trim(),
        description: description !== undefined ? description.trim() : '',
        cuisine,
        location,
        image,
        menu
    };

    const newRestaurant = restaurantModel.create(req.userId, payload);
    
   
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
    const { name, description, cuisine, location, image, menu } = req.body;

    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
        return res.status(400).json({ error: "Name must be a valid string" });
    }

    const payload = {};
    if (name !== undefined) payload.name = name.trim();
    if (description !== undefined) payload.description = description.trim();
    if (cuisine !== undefined) payload.cuisine = cuisine.trim();
    if (location !== undefined) payload.location = location;
    if (image !== undefined) payload.image = image;
    if (menu !== undefined) payload.menu = menu;

    const updatedRestaurant = restaurantModel.update(id, req.userId, payload);

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
    getMyRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};