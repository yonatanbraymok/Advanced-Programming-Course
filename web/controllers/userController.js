const User = require('../models/userModel');
const {
    validateUsername,
    validateName,
    validatePassword,
    validateProfileImage,
    validateLocation,
    validateRole,
} = require('../utils/userValidation');

const registerUser = async (req, res, next) => {
    try {
        const { username, password, name, phone, address, profileImage, location, role } = req.body;

        const checks = [
            validateUsername(username),
            validatePassword(password),
            validateName(name),
            validateProfileImage(profileImage),
            validateLocation(location),
            validateRole(role),
        ];

        for (const error of checks) {
            if (error) {
                return res.status(400).json({ error });
            }
        }

        const trimmedUsername = username.trim();
        const trimmedName = name.trim();

        const existingUser = await User.findByUsername(trimmedUsername);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const newUser = await User.create({
            username: trimmedUsername,
            password,
            name: trimmedName,
            phone: phone || '',
            address: address || '',
            profileImage: profileImage || null,
            location,
            role: role || 'customer',
        });

        res.status(201).json({
            message: 'User created successfully',
            userId: newUser.id,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        next(err);
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password, ...safeUserProfile } = user.toJSON();
        res.status(200).json(safeUserProfile);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    registerUser,
    getUserProfile,
};
