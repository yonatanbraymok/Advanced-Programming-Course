const User = require('../models/userModel');
const {
    validateUsername,
    validateName,
    validatePassword,
    validateProfileImage,
    validateLocation,
    validateRole,
} = require('../utils/userValidation');

const registerUser = (req, res) => {
    const { username, password, name, phone, address, profileImage, location, role } = req.body;

    // Run validators in order and return the first error found.
    const checks = [
        validateUsername(username),
        validatePassword(password),
        validateName(name),
        validateProfileImage(profileImage),
        validateLocation(location),
        validateRole(role)
    ];

    for (const error of checks) {
        if (error) {
            return res.status(400).json({ error });
        }
    }

    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    // Check if username is already taken
    const existingUser = User.findByUsername(trimmedUsername);
    if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
    }

    // phone and address are optional for Ex4 registration (default to empty string).
    const newUser = User.create({
        username: trimmedUsername,
        password,
        name: trimmedName,
        phone: phone || '',
        address: address || '',
        profileImage: profileImage || null,
        location: location,
        role: role || 'customer'
    });

    res.status(201).json({
        message: "User created successfully",
        userId: newUser.id
    });
};

const getUserProfile = (req, res) => {
    const userId = req.params.id;

    const user = User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Remove password from the response. profileImage and other fields are included.
    const { password, ...safeUserProfile } = user;

    res.status(200).json(safeUserProfile);
};

module.exports = {
    registerUser,
    getUserProfile
};
