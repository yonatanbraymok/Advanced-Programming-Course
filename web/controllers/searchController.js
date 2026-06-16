const restaurantModel = require('../models/restaurantModel');
const productModel = require('../models/productModel');

// Handles GET /api/search/:query
const searchByQuery = (req, res) => {
    const { query } = req.params;

    // A blank query is not useful and usually indicates a malformed request.
    if (typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ error: 'Query must be a non-empty string' });
    }

    // Normalize the query so matching is case-insensitive.
    const normalizedQuery = query.toLowerCase();

    // Get all restaurants that match the query
    const restaurantMatches = restaurantModel
        .getAll()
        .filter((restaurant) => {
            const name = (restaurant.name || '').toLowerCase();
            return name.includes(normalizedQuery);
        });

    // Get all products that match the query
    const productMatches = productModel
        .getAll()
        .filter((product) => {
            const name = (product.name || '').toLowerCase();
            return name.includes(normalizedQuery);
        });

    // Return the matches
    return res.status(200).json({
        restaurants: restaurantMatches,
        products: productMatches
    });
};

module.exports = {
    searchByQuery
};
