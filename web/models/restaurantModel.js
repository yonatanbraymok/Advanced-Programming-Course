const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
});

const RestaurantSchema = new mongoose.Schema({
    _id: { type: String },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    cuisine: { type: String, default: 'International' },
    rating: { type: Number, default: 5.0 },
    location: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
    },
    image: { type: String, default: '' },
    ownerId: { type: String, default: null },
    menu: [MenuItemSchema],
});

RestaurantSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
    },
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

const generateId = () => `rest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

module.exports = {
    Restaurant,
    getAll: () => Restaurant.find(),
    getByOwnerId: (ownerId) => Restaurant.find({ ownerId }),
    getById: (id) => Restaurant.findById(id),
    create: (ownerId, payload) =>
        new Restaurant({ _id: generateId(), ...payload, ownerId, rating: 5.0 }).save(),
    update: (id, ownerId, payload) =>
        Restaurant.findOneAndUpdate({ _id: id, ownerId }, payload, { new: true }),
    remove: async (id) => {
        const deleted = await Restaurant.findByIdAndDelete(id);
        return !!deleted;
    },
};
