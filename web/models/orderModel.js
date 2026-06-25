const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        restaurantId: { type: String, required: true },
        items: [
            {
                _id: false,
                productId: String,
                quantity: Number,
                name: String,
                price: Number,
            },
        ],
        status: { type: String, default: 'Pending' },
        totalPrice: { type: Number },
    },
    { timestamps: true }
);

OrderSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
    },
});

const OrderModel = mongoose.model('Order', OrderSchema);

const Order = {
    getAll: (filter = {}) => OrderModel.find(filter),

    create: (userId, restaurantId, items, totalPrice) =>
        new OrderModel({ userId, restaurantId, items, totalPrice }).save(),

    getById: (id) => OrderModel.findById(id).catch(() => null),

    update: (id, patchData) =>
        OrderModel.findByIdAndUpdate(id, patchData, { new: true }),

    remove: async (id) => {
        const deleted = await OrderModel.findByIdAndDelete(id);
        return !!deleted;
    },
};

module.exports = Order;
