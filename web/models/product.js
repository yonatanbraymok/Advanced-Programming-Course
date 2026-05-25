const crypto = require('crypto');

// In-memory volatile storage for products
const products = [];

// Retrieves all products belonging to a specific restaurant
const getByRestaurantId = (restaurantId) => {
    return products.filter(p => p.restaurantId === restaurantId);
};

// Creates a new menu product and stores it in memory
const create = (restaurantId, name, price) => {
    const newProduct = {
        id: crypto.randomUUID(),
        restaurantId: restaurantId,
        name: name,
        price: price
    };
    products.push(newProduct);
    return newProduct;
};

// Finds a specific product by its unique ID
const getById = (productId) => {
    return products.find(p => p.id === productId);
};

// Updates an existing product fields directly
const update = (productId, name, price) => {
    const product = getById(productId);
    if (!product) return null;

    product.name = name;
    product.price = price;

    return product;
};

// Deletes a product from the in-memory storage
const remove = (productId) => {
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return false;

    products.splice(index, 1);
    return true;
};

module.exports = {
    getByRestaurantId,
    create,
    getById,
    update,
    remove,
    products
};