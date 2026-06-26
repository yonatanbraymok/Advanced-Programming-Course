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

const getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.userId;
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

const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { username, password, name, phone, address, location, profileImage } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (username) {
            const trimmedUsername = username.trim();
            if (trimmedUsername !== user.username) {
                const existingUser = await User.findByUsername(trimmedUsername);
                if (existingUser) {
                    return res.status(409).json({ error: 'Username already exists' });
                }
                user.username = trimmedUsername;
            }
        }

        if (password) {
            const { validatePassword } = require('../utils/userValidation');
            const passError = validatePassword(password);
            if (passError) {
                return res.status(400).json({ error: passError });
            }
            user.password = User.manualHash(password);
        }

        if (name) user.name = name.trim();
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (location) user.location = location;
        if (profileImage !== undefined) user.profileImage = profileImage;
        
        await user.save();
        
        const { password: _pw, ...safeUserProfile } = user.toJSON();
        res.status(200).json(safeUserProfile);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    registerUser,
    getUserProfile,
    getCurrentUser,
    updateUserProfile,
};
