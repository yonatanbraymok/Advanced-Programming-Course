const mongoose = require('mongoose');

// A simple manual hash function (same as Ex4 in-memory model).
const manualHash = (password) => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash.toString();
};

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    location: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
    },
    profileImage: { type: String, default: null },
    role: { type: String, default: 'customer' },
});

UserSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
    },
});

const UserModel = mongoose.model('User', UserSchema);

const User = {
    create: async (userData) => {
        const newUser = new UserModel({
            ...userData,
            password: manualHash(userData.password),
        });
        return newUser.save();
    },

    findByUsername: async (username) => UserModel.findOne({ username }),

    findById: async (id) => UserModel.findById(id),

    validateLogin: async (username, rawPassword) => {
        const user = await UserModel.findOne({ username });
        if (!user || user.password !== manualHash(rawPassword)) {
            return null;
        }
        return user;
    },
};

module.exports = User;
