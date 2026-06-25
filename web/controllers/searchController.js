const restaurantModel = require('../models/restaurantModel');
const productModel = require('../models/productModel');

const toPlain = (doc) => (typeof doc.toJSON === 'function' ? doc.toJSON() : doc);

const searchByQuery = async (req, res, next) => {
    try {
        const { query } = req.params;

        if (typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: 'Query must be a non-empty string' });
        }

        const normalizedQuery = query.toLowerCase();

        const [restaurants, products] = await Promise.all([
            restaurantModel.getAll(),
            productModel.getAll(),
        ]);

        const restaurantMatches = restaurants
            .map(toPlain)
            .filter((restaurant) => {
                const name = (restaurant.name || '').toLowerCase();
                return name.includes(normalizedQuery);
            });

        const productMatches = products
            .map(toPlain)
            .filter((product) => {
                const name = (product.name || '').toLowerCase();
                return name.includes(normalizedQuery);
            });

        return res.status(200).json({
            restaurants: restaurantMatches,
            products: productMatches,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    searchByQuery,
};
