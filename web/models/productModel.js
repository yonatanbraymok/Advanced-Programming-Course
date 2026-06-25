const mongoose = require('mongoose');
const restaurantModel = require('./restaurantModel');

const ProductSchema = new mongoose.Schema({
    restaurantId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
});

ProductSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
    },
});

const Product = mongoose.model('Product', ProductSchema);

const toPlainMenuItem = (menuItem, restaurantId) => {
    if (menuItem && typeof menuItem.toJSON === 'function') {
        return { ...menuItem.toJSON(), restaurantId };
    }
    return { ...menuItem, restaurantId };
};

module.exports = {
    getByRestaurantId: (restaurantId) => Product.find({ restaurantId }),

    getAll: async () => {
        const [products, restaurants] = await Promise.all([
            Product.find(),
            restaurantModel.getAll(),
        ]);

        const menuItems = restaurants.flatMap((restaurant) =>
            (restaurant.menu || []).map((menuItem) =>
                toPlainMenuItem(menuItem, restaurant.id)
            )
        );

        return [...products, ...menuItems];
    },

    getById: async (productId) => {
        const product = await Product.findById(productId).catch(() => null);
        if (product) {
            return product;
        }

        const restaurants = await restaurantModel.getAll();
        for (const restaurant of restaurants) {
            const found = (restaurant.menu || []).find((menuItem) => menuItem.id === productId);
            if (found) {
                return toPlainMenuItem(found, restaurant.id);
            }
        }

        return null;
    },

    create: (restaurantId, name, price, description = '') =>
        new Product({ restaurantId, name, price, description }).save(),

    update: async (productId, name, price, description) => {
        const patch = { name, price };
        if (description !== undefined) {
            patch.description = description;
        }

        const updated = await Product.findByIdAndUpdate(productId, patch, { new: true });
        if (updated) {
            return updated;
        }

        const restaurants = await restaurantModel.getAll();
        for (const restaurant of restaurants) {
            const menuItem = (restaurant.menu || []).find((item) => item.id === productId);
            if (menuItem) {
                menuItem.name = name;
                menuItem.price = price;
                if (description !== undefined) {
                    menuItem.description = description;
                } else if (menuItem.description === undefined) {
                    menuItem.description = '';
                }
                await restaurant.save();
                return toPlainMenuItem(menuItem, restaurant.id);
            }
        }

        return null;
    },

    remove: async (productId) => {
        const deleted = await Product.findByIdAndDelete(productId);
        return !!deleted;
    },
};
