// In-memory volatile storage for products
const restaurantModel = require('./restaurantModel');
const products = [];

// Generate a random ID 
const generateId = () => {
    return 'prod_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

// Retrieves all products belonging to a specific restaurant
const getByRestaurantId = (restaurantId) => {
    return products.filter(p => p.restaurantId === restaurantId);
};

// Retrieves all products from volatile memory and hardcoded menus
const getAll = () => {
    const allProducts = [...products];
    const allRestaurants = restaurantModel.getAll();
    for (const restaurant of allRestaurants) {
        if (restaurant.menu) {
            for (const product of restaurant.menu) {
                // Attach restaurantId dynamically so controller validations pass
                allProducts.push({ ...product, restaurantId: restaurant.id });
            }
        }
    }
    return allProducts;
};

// Creates a new menu product and stores it in memory
const create = (restaurantId, name, price, description = '') => {
    const newProduct = {
        id: generateId(), // Swapped crypto for our manual generator
        restaurantId: restaurantId,
        name: name,
        price: price,
        // Keep optional to avoid breaking old requests.
        description: description
    };
    products.push(newProduct);
    return newProduct;
};

// Finds a specific product by its unique ID
const getById = (productId) => {
    // 1. Check volatile memory first
    const product = products.find(p => p.id === productId);
    if (product) return product;

    // 2. Fallback to hardcoded menus inside restaurants
    const allRestaurants = restaurantModel.getAll();
    for (const restaurant of allRestaurants) {
        if (restaurant.menu) {
            const found = restaurant.menu.find(p => p.id === productId);
            if (found) {
                // Attach restaurantId dynamically so controller validations pass
                return { ...found, restaurantId: restaurant.id };
            }
        }
    }
    return undefined;
};

// Updates an existing product fields directly
const update = (productId, name, price, description) => {
    const product = getById(productId);
    if (!product) return null;

    product.name = name;
    product.price = price;
    if (description !== undefined) {
        product.description = description;
    } else if (product.description === undefined) {
        product.description = '';
    }

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
    getAll,
    create,
    getById,
    update,
    remove,
    products
};