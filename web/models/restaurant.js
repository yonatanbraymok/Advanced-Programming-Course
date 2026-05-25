const crypto = require('crypto');

// In-memory volatile storage for restaurants
const restaurants = [];

// Retrieves all restaurants from the volatile memory array
const getAll = () => {
    return restaurants;
};

// Creates a new restaurant object, stores it in memory, and returns it
const create = (name) => {
    const newRestaurant = {
        id: crypto.randomUUID(),
        name: name
    };
    restaurants.push(newRestaurant);
    return newRestaurant;
};

// Finds a specific restaurant by its unique ID
const getById = (id) => {
    return restaurants.find(r => r.id === id);
};

// Updates an existing restaurant name
const update = (id, name) => {
    const restaurant = getById(id);
    if (!restaurant) return null;
    
    restaurant.name = name;
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
    create,
    getById,
    update,
    remove,
    restaurants
};