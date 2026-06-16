const fs = require('fs');
const path = require('path');

// Load initial restaurant listings from JSON so seed data is not hard-coded in source.
const loadInitialRestaurants = () => {
    const filePath = path.join(__dirname, '..', 'data', 'restaurants.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
};

// In-memory storage; seeded from data/restaurants.json on server start.
const restaurants = loadInitialRestaurants();

// Generate a random ID (consistent with userModel)
const generateId = () => {
    return 'rest_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

// Retrieves all restaurants from the volatile memory array
const getAll = () => {
    return restaurants;
};

// Retrieves restaurants owned by a specific user
const getByOwnerId = (ownerId) => {
    return restaurants.filter(r => r.ownerId === ownerId);
};

// Creates a new restaurant object, stores it in memory, and returns it
const create = (ownerId, payload) => {
    const newRestaurant = {
        id: generateId(),
        ownerId: ownerId,
        name: payload.name,
        description: payload.description || '',
        cuisine: payload.cuisine || 'International',
        rating: 5.0,
        location: payload.location || { x: 0, y: 0 },
        image: payload.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
        menu: payload.menu || []
    };
    restaurants.push(newRestaurant);
    return newRestaurant;
};

// Finds a specific restaurant by its unique ID
const getById = (id) => {
    return restaurants.find(r => r.id === id);
};

// Updates an existing restaurant fields
const update = (id, ownerId, payload) => {
    const restaurant = getById(id);
    if (!restaurant || restaurant.ownerId !== ownerId) return null;

    if (payload.name !== undefined) restaurant.name = payload.name;
    if (payload.description !== undefined) restaurant.description = payload.description;
    if (payload.cuisine !== undefined) restaurant.cuisine = payload.cuisine;
    if (payload.location !== undefined) restaurant.location = payload.location;
    if (payload.image !== undefined) restaurant.image = payload.image;
    if (payload.menu !== undefined) restaurant.menu = payload.menu;

    return restaurant;
};

// Deletes a restaurant from the in-memory array
const remove = (id) => {
    const index = restaurants.findIndex(r => r.id === id);
    if (index === -1) return false;

    restaurants.splice(index, 1);
    return true;
};

module.exports = {
    getAll,
    getByOwnerId,
    create,
    getById,
    update,
    remove,
    restaurants
};
